using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using A2.Data;
using A2.Models;
using A2.Dtos;
using System.Security.Claims;

namespace A2.Controllers
{
    [Route("Webapi")]
    [ApiController]
    public class A2Controller : Controller
    {
        private readonly IA2Repo _repository;

        public A2Controller(IA2Repo repository)
        {
            _repository = repository;
        }

        [HttpPost("Register")]
        public ActionResult Register(User user)
        {
            if (_repository.GetAllUsers().Any(u => u.UserName == user.UserName))
            {
                return Ok($"UserName {user.UserName} is not available.");
            }
            _repository.AddUser(user);

            return Ok("User successfully registered.");
        }

        [Authorize(AuthenticationSchemes = "MyAuthentication")]
        [Authorize(Policy = "RegisteredOnly")]
        [HttpGet("PurchaseSign/{id}")]
        public ActionResult<PurchaseOutput> PurchaseSign(string id)
        {
            ClaimsIdentity ci = HttpContext.User.Identities.FirstOrDefault();
            // Claim roleClaim = ci.FindFirst(ClaimTypes.Role);
            Claim c = ci.FindFirst("UserName");
            // if (roleClaim != null && roleClaim.Value == "organizer")
            // {
            // return StatusCode(403);            
            // }
            var sign = _repository.GetSignByID(id); 
            if (sign == null)
            {
                return BadRequest($"Sign {id} not found");
            }
            string userName = c.Value;
            PurchaseOutput pOut = new PurchaseOutput
            { 
                UserName = userName, 
                SignId = sign.Id
            };
            return Ok(pOut);
        }

        [Authorize(AuthenticationSchemes = "MyAuthentication")]
        [Authorize(Policy = "OrganizerOnly")]
        [HttpPost("AddEvent")]
        public ActionResult<string> AddEvent(EventInput eventInput)
        {
            ClaimsIdentity ci = HttpContext.User.Identities.FirstOrDefault();
            Claim roleClaim = ci.FindFirst(ClaimTypes.Role);
            if (roleClaim.Value != "organizer")
            {
                return Forbid(); 
            }
            var dateFormat = "yyyyMMddTHHmmssZ";
            bool IsValidDateFormat(string date)
            {
                return DateTime.TryParseExact(date, dateFormat, null, System.Globalization.DateTimeStyles.None, out _);
            }
            bool startValid = IsValidDateFormat(eventInput.Start);
            bool endValid = IsValidDateFormat(eventInput.End);
            if (!startValid && !endValid)
            {
                return BadRequest(new
                {
                    message = "Bad request",
                    errorCode = 400,
                    detail = "The format of Start and End should be yyyyMMddTHHmmssZ."
                });
            }
            else if (!startValid)
            {
                return BadRequest(new
                {
                    message = "Bad request",
                    errorCode = 400,
                    detail = "The format of Start should be yyyyMMddTHHmmssZ."
                });
            }
            else if (!endValid)
            {
                return BadRequest(new
                {
                    message = "Bad request",
                    errorCode = 400,
                    detail = "The format of End should be yyyyMMddTHHmmssZ."
                });
            }
            var newEvent = new Event
            {
                Start = eventInput.Start,
                End = eventInput.End,
                Summary = eventInput.Summary,
                Description = eventInput.Description,
                Location = eventInput.Location
            };
            _repository.AddEvent(newEvent);
            return Ok("Success");
        }
        [Authorize(AuthenticationSchemes = "MyAuthentication")]
        [Authorize(Policy = "AuthOnly")]
        [HttpGet("EventCount")]
        public ActionResult EventCount()
        {
            int eventCount = _repository.GetEventCount();
           return Ok(eventCount);
        }
        [Authorize(AuthenticationSchemes = "MyAuthentication")]
        [Authorize(Policy = "AuthOnly")]
        [HttpGet("Event/{id}")]
        public ActionResult Event(int id)
        {
            var eventDetails = _repository.GetEvent(id);
            if (eventDetails == null)
            {
                return BadRequest($"Event {id} does not exist.");
            }
            Response.Headers.Add("Content-Type", "text/calendar");

            return Ok(eventDetails);
        }
    }
}
