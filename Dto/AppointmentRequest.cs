namespace CheAuto.Dto
{
    public class AppointmentRequest
    {
        public string Name { get; set; } = default!;
        public string Phone { get; set; } = default!;
        public string? MakeId { get; set; }
        public string? MakeName { get; set; }
        public string? Model { get; set; }
        public DateTimeOffset? Ts { get; set; }
    }
}
