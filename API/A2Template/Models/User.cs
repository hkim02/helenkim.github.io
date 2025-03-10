using System.ComponentModel.DataAnnotations;

namespace A2.Models
{
    public class User
    {
        [Key]
        [Required]
        public string UserName { get; set; } // Primary key, string, not null

        [Required]
        public string Password { get; set; } // String, not null

        [Required]
        public string Address { get; set; } // String, not null
    }
}
