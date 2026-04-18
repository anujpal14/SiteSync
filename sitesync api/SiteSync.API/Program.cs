using DotNetEnv;
using SiteSync.API.Data;
using SiteSync.API.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

Env.Load();

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy => policy.WithOrigins(
                    "http://localhost:5173",
                    "http://localhost:3000",
                    "https://localhost:63234/",
                    "http://127.0.0.1:5000",
                    "http://127.0.0.1:5173",
                    "http://localhost:4200"
                )
            
            .AllowAnyMethod()
            .AllowAnyHeader());
});

// ── Services ──────────────────────────────────────────────
builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "SiteSync API", Version = "v1",
        Description = "Interior Contractor Management Platform API" });
});


// ── JWT Authentication ────────────────────────────────
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],

            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

builder.Services.AddAuthorization();

// ── Dapper / ADO connection factory ──────────────────────
builder.Services.AddSingleton<IDbConnectionFactory, SqlConnectionFactory>();

// ── Repositories ─────────────────────────────────────────
builder.Services.AddScoped<IClientRepository,    ClientRepository>();
builder.Services.AddScoped<ISiteRepository,      SiteRepository>();
builder.Services.AddScoped<IWorkerRepository,    WorkerRepository>();
builder.Services.AddScoped<IAttendanceRepository,AttendanceRepository>();
builder.Services.AddScoped<IInvoiceRepository,   InvoiceRepository>();
builder.Services.AddScoped<IDashboardRepository, DashboardRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();

// ── CORS (allow Flutter web + any local dev origin) ──────
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
                     ?? ["http://localhost:3000"];

builder.Services.AddCors(opt =>
    opt.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()));

var app = builder.Build();

// ── Middleware ────────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "SiteSync API v1"));
}




app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<IDbConnectionFactory>();
    UserSeeder.SeedIfEmpty(db);
}
app.Run();
