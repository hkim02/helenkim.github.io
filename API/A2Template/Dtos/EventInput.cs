using System.ComponentModel.DataAnnotations;

namespace A2.Dtos
{
    public class EventInput
    {
        [Required]
        public string Start { get; set; } // String, not null
        [Required]
        public string End { get; set; } // String, not null
        public string Summary { get; set; } // String, not null
        public string Description { get; set; } // String, not null
        [Required]
        public string Location { get; set; } // String, not null

    }
}
