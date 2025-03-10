using A2.Models;

namespace A2.Data
{
    public interface IA2Repo
    {
        IEnumerable<User> GetAllUsers();
        bool ValidLogin(string userName, string password);
        bool ValidOrganizer(string name, string password);
        void AddUser(User user); // New method
        Sign GetSignByID(string Id);
        Event AddEvent(Event eventt);
        int GetEventCount();
        Event GetEvent(int id);
    }
}
