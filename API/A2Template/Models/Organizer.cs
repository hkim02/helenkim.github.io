using System.ComponentModel.DataAnnotations;

namespace A2.Models
{
    public class Organizer
    {
        [Key]
        [Required]
        public string Name { get; set; } // Primary key, string, not null

        [Required]
        public string Password { get; set; } // String, not null

    }
}
