using CheAuto.Dto;
using CheAuto.Services;
using Npgsql;
using System.Data;

namespace CheAuto
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Razor + статика
            builder.Services.AddRazorPages();

            // Postgres DataSource (берём ConnectionStrings:DefaultConnection)
            builder.Services.AddSingleton(sp =>
            {
                var cs = sp.GetRequiredService<IConfiguration>().GetConnectionString("DefaultConnection");
                return new NpgsqlDataSourceBuilder(cs).Build();
            });

            builder.Services.AddHttpClient();
            builder.Services.AddSingleton<TelegramNotifier>();

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("frontend", p => p
                    .WithOrigins(
                        "http://localhost:9090",
                        "https://che-auto.pro",
                        "https://www.che-auto.pro"
                    )
                    .AllowAnyHeader()
                    .AllowAnyMethod());
            });

            builder.Services.AddControllers();

            var app = builder.Build();
            app.UseCors("cheauto");

            if (!app.Environment.IsDevelopment())
            {
                app.UseExceptionHandler("/Error");
                app.UseHsts();
                app.UseHttpsRedirection();
            }
            
            app.UseDefaultFiles(new DefaultFilesOptions { DefaultFileNames = { "index.html" } });
            app.UseStaticFiles();
            app.UseRouting();
            app.MapRazorPages();

            // ---------- API ----------
            // GET /api/car/makes  -> [{ id, name }]
            app.MapGet("/api/car/makes", async (NpgsqlDataSource ds) =>
            {
                var list = new List<object>();
                await using var conn = await ds.OpenConnectionAsync();
                await using (var cmd = conn.CreateCommand())
                {
                    cmd.CommandText = @"select id, name
                                        from car_make
                                        where is_popular = true
                                        order by name";
                    await using var rd = await cmd.ExecuteReaderAsync(CommandBehavior.CloseConnection);
                    while (await rd.ReadAsync())
                    {
                        var id = rd.GetInt64(0);
                        var name = rd.GetString(1);
                        list.Add(new { id, name });
                    }
                }
                return Results.Ok(list);
            });

            app.MapGet("/api/car/models", async (string make, NpgsqlDataSource ds) =>
            {
                if (string.IsNullOrWhiteSpace(make))
                    return Results.Ok(Array.Empty<string>());

                await using var conn = await ds.OpenConnectionAsync();

                long makeId;
                if (!long.TryParse(make, out makeId))
                {
                    await using var findCmd = conn.CreateCommand();
                    findCmd.CommandText = @"select id from car_make where lower(name)=lower(@name) limit 1";
                    findCmd.Parameters.AddWithValue("name", make);
                    var scalar = await findCmd.ExecuteScalarAsync();
                    if (scalar is long idFromName) makeId = idFromName;
                    else return Results.Ok(Array.Empty<string>());
                }

                var models = new List<string>();
                await using (var cmd = conn.CreateCommand())
                {
                    cmd.CommandText = @"select name
                                        from car_model
                                        where make_id = @makeId
                                        order by name";
                    cmd.Parameters.AddWithValue("makeId", makeId);
                    await using var rd = await cmd.ExecuteReaderAsync();
                    while (await rd.ReadAsync())
                        models.Add(rd.GetString(0));
                }

                return Results.Ok(models);
            });

            app.MapPost("/api/appointments", async (AppointmentRequest rq, NpgsqlDataSource ds) =>
            {
                if (string.IsNullOrWhiteSpace(rq.Phone))
                    return Results.BadRequest("Телефон обязателен.");

                await using var conn = await ds.OpenConnectionAsync();
                await using var tx = await conn.BeginTransactionAsync();

                // 1. Найти или создать пользователя
                long userId;
                await using (var cmd = conn.CreateCommand())
                {
                    cmd.CommandText = "SELECT id FROM app_user WHERE phone = @p";
                    cmd.Parameters.AddWithValue("@p", rq.Phone);
                    var res = await cmd.ExecuteScalarAsync();
                    if (res != null)
                        userId = (long)res;
                    else
                    {
                        cmd.CommandText = "INSERT INTO app_user (name, phone) VALUES (@n, @p) RETURNING id";
                        cmd.Parameters.Clear();
                        cmd.Parameters.AddWithValue("@n", rq.Name ?? "");
                        cmd.Parameters.AddWithValue("@p", rq.Phone);
                        userId = (long)(await cmd.ExecuteScalarAsync()!);
                    }
                }

                // 2. Найти make_id и model_id (если указаны)
                long? makeId = null, modelId = null;
                if (!string.IsNullOrEmpty(rq.MakeName))
                {
                    await using (var cmd = conn.CreateCommand())
                    {
                        cmd.CommandText = "SELECT id FROM car_make WHERE name = @n";
                        cmd.Parameters.AddWithValue("@n", rq.MakeName);
                        var res = await cmd.ExecuteScalarAsync();
                        if (res != null) makeId = (long)res;
                    }
                }
                if (makeId.HasValue && !string.IsNullOrEmpty(rq.Model))
                {
                    await using (var cmd = conn.CreateCommand())
                    {
                        cmd.CommandText = "SELECT id FROM car_model WHERE make_id=@m AND name=@n";
                        cmd.Parameters.AddWithValue("@m", makeId);
                        cmd.Parameters.AddWithValue("@n", rq.Model);
                        var res = await cmd.ExecuteScalarAsync();
                        if (res != null) modelId = (long)res;
                    }
                }

                // 3. Добавить авто, если его нет
                if (makeId.HasValue && modelId.HasValue)
                {
                    await using var cmd = conn.CreateCommand();
                    cmd.CommandText = @"
            INSERT INTO user_vehicle (user_id, make_id, model_id)
            VALUES (@u, @m, @md)
            ON CONFLICT DO NOTHING";
                    cmd.Parameters.AddWithValue("@u", userId);
                    cmd.Parameters.AddWithValue("@m", makeId);
                    cmd.Parameters.AddWithValue("@md", modelId);
                    await cmd.ExecuteNonQueryAsync();
                }

                await tx.CommitAsync();
                var tg = app.Services.GetRequiredService<TelegramNotifier>();
                var msg =
                    $"Новая заявка!\n" +
                    $"Имя: {rq.Name}\n" +
                    $"Телефон: {rq.Phone}\n" +
                    $"Марка: {rq.MakeName}\n" +
                    $"Модель: {rq.Model}\n" +
                    $"Время: {DateTimeOffset.Now:dd.MM.yyyy HH:mm}";
                _ = tg.SendAsync(msg); 

                return Results.Ok(new { ok = true, userId });
            });

            app.MapGet("/api/user/last", async (string phone, NpgsqlDataSource ds) =>
            {
                if (string.IsNullOrWhiteSpace(phone))
                    return Results.BadRequest("phone is required");

                await using var conn = await ds.OpenConnectionAsync();
                await using var cmd = conn.CreateCommand();
                cmd.CommandText = @"
        SELECT u.id, u.name, u.phone,
               v.make_id, m.name AS make_name,
               v.model_id, cm.name AS model_name
        FROM app_user u
        LEFT JOIN user_vehicle v ON v.user_id = u.id
        LEFT JOIN car_make m ON m.id = v.make_id
        LEFT JOIN car_model cm ON cm.id = v.model_id
        WHERE u.phone = @p
        ORDER BY v.id DESC
        LIMIT 1";
                cmd.Parameters.AddWithValue("@p", phone);

                await using var reader = await cmd.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    return Results.Ok(new
                    {
                        id = reader.GetInt64(0),
                        name = reader.GetString(1),
                        phone = reader.GetString(2),
                        makeId = reader.IsDBNull(3) ? (long?)null : reader.GetInt64(3),
                        makeName = reader.IsDBNull(4) ? null : reader.GetString(4),
                        modelId = reader.IsDBNull(5) ? (long?)null : reader.GetInt64(5),
                        modelName = reader.IsDBNull(6) ? null : reader.GetString(6)
                    });
                }

                return Results.NotFound();
            });


            app.Run();
        }
    }
}