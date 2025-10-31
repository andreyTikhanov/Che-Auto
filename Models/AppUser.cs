namespace CheAuto.Models
{
    public class AppUser
    {
        public long Id { get; set; }
        public string Name { get; set; } = default!;
        public string Phone { get; set; } = default!;
        public List<UserVehicle> Vehicles { get; set; } = new();
    }
}
