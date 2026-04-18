// SiteSync.API/Data/UserSeeder.cs
using Dapper;
using SiteSync.API.Data;

namespace SiteSync.API.Data;

public static class UserSeeder
{
    public static void SeedIfEmpty(IDbConnectionFactory db)
    {
        using var conn = db.Create();

        var count = conn.ExecuteScalar<int>("SELECT COUNT(*) FROM Users");
        if (count > 0) return;  // already seeded — skip

        var users = new[]
        {
            new { Username = "admin",      FullName = "Rajesh Kumar", Role = "Admin",      Password = "Admin@123"  },
            new { Username = "supervisor", FullName = "Ravi Teja",    Role = "Supervisor", Password = "Super@123"  },
            new { Username = "labour",     FullName = "Suresh M.",    Role = "Labour",     Password = "Labour@123" },
            new { Username = "anujpal48916",     FullName = "Anuj Pal",    Role = "Admin",     Password = "anuj@123" },
        };

        foreach (var u in users)
        {
            var hash = BCrypt.Net.BCrypt.HashPassword(u.Password, workFactor: 12);
            conn.Execute(@"
                INSERT INTO Users (Username, PasswordHash, FullName, Role)
                VALUES (@Username, @Hash, @FullName, @Role)",
                new { u.Username, Hash = hash, u.FullName, u.Role });
        }
    }
}