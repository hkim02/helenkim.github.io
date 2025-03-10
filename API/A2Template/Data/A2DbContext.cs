using Microsoft.EntityFrameworkCore;
using A2.Models;

namespace A2.Data
{
    public class A2DbContext:DbContext
    {
        public A2DbContext(DbContextOptions<A2DbContext> options) : base(options) { }
        public DbSet<User> Users { get; set; }
        public DbSet<Sign> Signs { get; set; }
        public DbSet<Organizer> Organizers { get; set; }
        public DbSet<Event> Events { get; set; }
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
           optionsBuilder.UseSqlite("Data Source=A2Database.sqlite");
        }
        
    }
    
}
