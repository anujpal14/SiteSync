using Microsoft.Data.SqlClient;
using System.Data;

namespace SiteSync.API.Data;

/// <summary>
/// Creates and opens SqlConnections using the configured connection string.
/// Inject IDbConnectionFactory anywhere you need a connection.
/// </summary>
public interface IDbConnectionFactory
{
    IDbConnection Create();
}

public class SqlConnectionFactory : IDbConnectionFactory
{
    private readonly string _connectionString;

    public SqlConnectionFactory(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
    }

    public IDbConnection Create()
    {
        var conn = new SqlConnection(_connectionString);
        conn.Open();
        return conn;
    }
}
