namespace CheAuto.Models
{
    public class UserVehicle
    {
        public long Id { get; set; }
        public long UserId { get; set; }
        public long MakeId { get; set; }
        public long ModelId { get; set; }
        public int? Year { get; set; }
        public string? Vin { get; set; }
    }
}
