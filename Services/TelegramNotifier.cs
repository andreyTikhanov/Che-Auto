using System.Text.Json;
using System.Text;

namespace CheAuto.Services
{
    public class TelegramNotifier
    {
        private readonly HttpClient _client;
        private readonly string _chatId;
        private readonly string _token;

        public TelegramNotifier(IConfiguration cfg, IHttpClientFactory http)
        {
            _token = cfg["Telegram:Token"] ?? throw new ArgumentNullException("Telegram:Token");
            _chatId = cfg["Telegram:ChatId"] ?? throw new ArgumentNullException("Telegram:ChatId");
            _client = http.CreateClient();
        }

        public async Task SendAsync(string text, CancellationToken ct = default)
        {
            var url = $"https://api.telegram.org/bot{_token}/sendMessage";
            var payload = JsonSerializer.Serialize(new { chat_id = _chatId, text });
            var content = new StringContent(payload, Encoding.UTF8, "application/json");
            await _client.PostAsync(url, content, ct);
        }
    }
}
