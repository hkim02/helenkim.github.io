
using System.ComponentModel.DataAnnotations;

namespace A2.Models
{
    public class Sign
    {
        [Key]
        public string Id { get; set; } // Primary key, string, not null
        public string Description { get; set; } // String, not null

    }
}
