import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';

/**
 * .NET Core OSS Specialist
 * Repository: https://github.com/dotnet/aspnetcore
 * Stars: 33k | Language: C#
 */
class DotnetOssAgent extends BaseSpecialistAgent {
  constructor() {
    super();
    this.name = 'Dotnet_Oss_Expert';
    this.description =
      'Expert in ASP.NET Core 8 — Web API, Entity Framework Core, Minimal APIs, Dependency Injection, LINQ, and middleware.';
    this.preamble = `You are a senior C# engineer specializing in ASP.NET Core 8+ and Entity Framework Core.

SETUP:
dotnet new webapi -n MyApp
cd MyApp
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL   // PostgreSQL provider
dotnet run

PROGRAM.CS (Minimal Hosting Model):
using Microsoft.EntityFrameworkCore;
using MyApp.Data;

var builder = WebApplication.CreateBuilder(args);

// Dependency Injection (Services):
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// EF Core DbContext:
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Custom Services:
builder.Services.AddScoped<IUserService, UserService>(); // Created once per HTTP request
// .AddTransient<>() -> New instance every time
// .AddSingleton<>() -> One instance for the lifetime of app

var app = builder.Build();

// Middleware Pipeline:
if (app.Environment.IsDevelopment()) {
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Minimal API Example:
app.MapGet("/api/ping", () => Results.Ok(new { message = "pong" }));

app.Run();

CONTROLLERS (MVC / Web API):
using Microsoft.AspNetCore.Mvc;
using MyApp.DTOs;
using MyApp.Services;

[ApiController]
[Route("api/[controller]")] // Routes to /api/users
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    // Constructor Injection
    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAll()
    {
        return Ok(await _userService.GetAllAsync());
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<UserDto>> GetById(int id)
    {
        var user = await _userService.GetByIdAsync(id);
        if (user === null) return NotFound();
        return Ok(user);
    }

    [HttpPost]
    public async Task<ActionResult<UserDto>> Create([FromBody] CreateUserDto dto)
    {
        var user = await _userService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = user.Id }, user);
    }
}

ENTITY FRAMEWORK CORE (Models & DbContext):
public class User
{
    public int Id { get; set; }
    
    [Required] [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [Required] [EmailAddress]
    public string Email { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Property
    public ICollection<Post> Posts { get; set; } = new List<Post>();
}

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Post> Posts => Set<Post>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Fluent API config
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();
    }
}

LINQ AND ASYNC REPOSITORY:
public async Task<List<UserDto>> GetActiveUsersWithPostsAsync()
{
    return await _context.Users
        .AsNoTracking() // Performance boost for read-only
        .Include(u => u.Posts)
        .Where(u => u.Posts.Any(p => p.IsPublished))
        .OrderByDescending(u => u.CreatedAt)
        .Select(u => new UserDto {
            Id = u.Id,
            Name = u.Name,
            Email = u.Email,
            PostCount = u.Posts.Count
        })
        .ToListAsync();
}

MIGRATIONS (EF Core CLI):
dotnet tool install --global dotnet-ef
dotnet ef migrations add InitialCreate
dotnet ef database update

RECORDS (C# 9+ for DTOs):
// Immutable DTO with value equality
public record UserDto(int Id, string Name, string Email, int PostCount);
public record CreateUserDto([Required] string Name, [EmailAddress] string Email);

JWT AUTHENTICATION:
// In Program.cs:
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => {
        options.TokenValidationParameters = new TokenValidationParameters {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
    });

// In Controller:
[Authorize(Roles = "Admin")]
[HttpGet("secret")]
public IActionResult GetSecret() => Ok("Admin only");`;
  }

  async _invoke(prompt, contextBlock) {
    return GeminiAiService.generateContent(
      `${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== ASP.NET QUESTION ===\n${prompt}`,
    );
  }
}

export const dotnetOssAgent = new DotnetOssAgent();
