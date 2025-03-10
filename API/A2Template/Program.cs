
using Microsoft.AspNetCore.Authentication.OAuth;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using A2.Data;
using A2.Handler;
using A2.Helper;
using System.Security.Claims;

namespace A2
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddDbContext<A2DbContext>(options =>
     options.UseSqlite(builder.Configuration["A2DBConnection"]));

            builder.Services.AddScoped<IA2Repo, A2Repo>();
            builder.Services.AddMvc(options => options.OutputFormatters.Add(new CalendarOutputFormatter()));

            builder.Services
                .AddAuthentication()
                .AddScheme<AuthenticationSchemeOptions, A2AuthHandler>
            ("MyAuthentication", null);

            // add authorization to the service container
            builder.Services.AddAuthorization();

            // add the authorization policy for managers
            builder.Services.AddAuthorization(options =>
            {
                options.AddPolicy("OrganizerOnly", policy => policy.RequireClaim(ClaimTypes.Role, "organizer"));
                options.AddPolicy("RegisteredOnly", policy => policy.RequireClaim(ClaimTypes.Role, "normalUser"));
                options.AddPolicy("AuthOnly", policy => {
                    policy.RequireAssertion(context =>
                        context.User.HasClaim(c =>
                        c.Value == "normalUser" || c.Value == "organizer"));
                });
            });


            // Add services to the container.

            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseAuthentication();

            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}
