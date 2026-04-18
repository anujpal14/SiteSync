// SiteSync.API/Controllers/AuthController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using SiteSync.API.DTOs;
using SiteSync.API.Models;
using SiteSync.API.Repositories;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;

namespace SiteSync.API.Controllers;

[ApiController, Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _config;
    private readonly IUserRepository _users;
    public AuthController(IConfiguration config, IUserRepository users) => (_config, _users) = (config, users);

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        // 1. Find user in DB
        var user = await _users.FindByUsernameAsync(req.Username);
        if (user is null)
            return Unauthorized(ApiResponse<string>.Fail("Invalid username or password"));

        // 2. Verify BCrypt hash
        bool valid = BCrypt.Net.BCrypt.Verify(req.Password, user.Password);
        if (!valid)
            return Unauthorized(ApiResponse<string>.Fail("Invalid username or password"));

        // 3. Record login time
        await _users.UpdateLastLoginAsync(user.Id);

        var token = GenerateToken(user);
        var expires = DateTime.UtcNow.AddHours(8);

        return Ok(ApiResponse<LoginResponse>.Ok(new LoginResponse
        {
            Token = token,
            Username = user.Username,
            Role = user.Role,
            FullName = user.FullName,
            Expires = expires
        }, "Login successful"));
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        // With stateless JWT, logout is handled client-side (clear token)
        return Ok(ApiResponse<string>.Ok("", "Logged out"));
    }

    private string GenerateToken(AppUser user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expires = DateTime.UtcNow.AddHours(8);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name,           user.Username),
            new Claim(ClaimTypes.Role,           user.Role),
            new Claim("FullName",                user.FullName),
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: expires,
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}