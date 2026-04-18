// SiteSync.API/Repositories/UserRepository.cs
using Dapper;
using SiteSync.API.Data;
using SiteSync.API.Models;

namespace SiteSync.API.Repositories;

public interface IUserRepository
{
    Task<AppUser?> FindByUsernameAsync(string username);
    Task UpdateLastLoginAsync(int userId);
}

public class UserRepository : IUserRepository
{
    private readonly IDbConnectionFactory _db;
    public UserRepository(IDbConnectionFactory db) => _db = db;

    public async Task<AppUser?> FindByUsernameAsync(string username)
    {
        using var conn = _db.Create();
        return await conn.QueryFirstOrDefaultAsync<AppUser>(@"
            SELECT Id, Username, PasswordHash AS Password,
                   FullName, Role, IsActive
            FROM Users
            WHERE Username = @Username AND IsActive = 1",
            new { Username = username });
    }

    public async Task UpdateLastLoginAsync(int userId)
    {
        using var conn = _db.Create();
        await conn.ExecuteAsync(
            "UPDATE Users SET LastLoginAt = GETUTCDATE() WHERE Id = @Id",
            new { Id = userId });
    }
}