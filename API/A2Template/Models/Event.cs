
using System.ComponentModel.DataAnnotations;

namespace A2.Models
{
    public class Event
    {
        [Key]
        [Required]
        public int Id { get; set; } 
        [Required]
        public string Start { get; set; } // String, not null
        [Required]
        public string End { get; set; } // String, not null
        [Required]
        public string Summary { get; set; } // String, not null
        [Required]
        public string Description { get; set; } // String, not null

        [Required]
        public string Location { get; set; } // String, not null

    }
}
