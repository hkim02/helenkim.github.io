using Microsoft.EntityFrameworkCore.ChangeTracking;
using A2.Models;

namespace A2.Data
{
    public class A2Repo : IA2Repo
    {
        private readonly A2DbContext _dbContext;
        public A2Repo(A2DbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public bool ValidLogin(string userName, string password)
        {
            User u = _dbContext.Users.FirstOrDefault(u => u.UserName == userName && u.Password == password);
            return u != null;
        }
        public bool ValidOrganizer(string name, string password)
        {
            Organizer o = _dbContext.Organizers.FirstOrDefault(o => o.Name == name && o.Password == password);
            return o != null;
        }
        public IEnumerable<User> GetAllUsers()
        {
            return _dbContext.Users.ToList();
        }
        public void AddUser(User user)
        {
            _dbContext.Users.Add(user);
            _dbContext.SaveChanges();
        }
        public Sign GetSignByID(string id)
        {
            return _dbContext.Signs.FirstOrDefault(c => c.Id == id);
        }
        public Event AddEvent(Event eventt)
        {
            EntityEntry<Event> e = _dbContext.Events.Add(eventt);
            Event c = e.Entity;
            _dbContext.SaveChanges();
            return c;
        }
        public int GetEventCount()
        {
            return _dbContext.Events.Count();
        }
        public Event GetEvent(int id)
        {
            Event eventt = _dbContext.Events.FirstOrDefault(e => e.Id == id);
            return eventt;
        }

    }
}
