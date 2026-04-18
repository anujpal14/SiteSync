using Dapper;
using SiteSync.API.Data;
using SiteSync.API.DTOs;
using SiteSync.API.Models;

namespace SiteSync.API.Repositories;

// ═══════════════════════════════════════════════════════════
//  CLIENT REPOSITORY
// ═══════════════════════════════════════════════════════════
public interface IClientRepository
{
    Task<IEnumerable<ClientResponseDto>> GetAllAsync();
    Task<ClientResponseDto?>             GetByIdAsync(int id);
    Task<int>                            CreateAsync(CreateClientDto dto);
    Task<bool>                           UpdateAsync(int id, UpdateClientDto dto);
    Task<bool>                           DeleteAsync(int id);
}

public class ClientRepository : IClientRepository
{
    private readonly IDbConnectionFactory _db;
    public ClientRepository(IDbConnectionFactory db) => _db = db;

    public async Task<IEnumerable<ClientResponseDto>> GetAllAsync()
    {
        using var conn = _db.Create();
        const string sql = @"
            SELECT
                c.Id, c.Name, c.Phone, c.Email, c.City, c.Address, c.Status, c.CreatedAt,
                COUNT(DISTINCT s.Id)      AS SiteCount,
                ISNULL(SUM(i.Amount), 0)  AS TotalValue
            FROM Clients c
            LEFT JOIN Sites    s ON s.ClientId = c.Id
            LEFT JOIN Invoices i ON i.ClientId = c.Id
            GROUP BY c.Id, c.Name, c.Phone, c.Email, c.City, c.Address, c.Status, c.CreatedAt
            ORDER BY c.CreatedAt DESC";
        return await conn.QueryAsync<ClientResponseDto>(sql);
    }

    public async Task<ClientResponseDto?> GetByIdAsync(int id)
    {
        using var conn = _db.Create();
        const string sql = @"
            SELECT
                c.Id, c.Name, c.Phone, c.Email, c.City, c.Address, c.Status, c.CreatedAt,
                COUNT(DISTINCT s.Id)      AS SiteCount,
                ISNULL(SUM(i.Amount), 0)  AS TotalValue
            FROM Clients c
            LEFT JOIN Sites    s ON s.ClientId = c.Id
            LEFT JOIN Invoices i ON i.ClientId = c.Id
            WHERE c.Id = @Id
            GROUP BY c.Id, c.Name, c.Phone, c.Email, c.City, c.Address, c.Status, c.CreatedAt";
        return await conn.QueryFirstOrDefaultAsync<ClientResponseDto>(sql, new { Id = id });
    }

    public async Task<int> CreateAsync(CreateClientDto dto)
    {
        using var conn = _db.Create();
        const string sql = @"
            INSERT INTO Clients (Name, Phone, Email, City, Address)
            OUTPUT INSERTED.Id
            VALUES (@Name, @Phone, @Email, @City, @Address)";
        return await conn.ExecuteScalarAsync<int>(sql, dto);
    }

    public async Task<bool> UpdateAsync(int id, UpdateClientDto dto)
    {
        using var conn = _db.Create();
        const string sql = @"
            UPDATE Clients
            SET Name = @Name, Phone = @Phone, Email = @Email,
                City = @City, Address = @Address, Status = @Status,
                UpdatedAt = GETUTCDATE()
            WHERE Id = @Id";
        var rows = await conn.ExecuteAsync(sql, new { id, dto.Name, dto.Phone, dto.Email, dto.City, dto.Address, dto.Status });
        return rows > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        using var conn = _db.Create();
        var rows = await conn.ExecuteAsync("DELETE FROM Clients WHERE Id = @Id", new { Id = id });
        return rows > 0;
    }
}

// ═══════════════════════════════════════════════════════════
//  SITE REPOSITORY
// ═══════════════════════════════════════════════════════════
public interface ISiteRepository
{
    Task<IEnumerable<SiteResponseDto>> GetAllAsync(string? status = null);
    Task<SiteResponseDto?>             GetByIdAsync(int id);
    Task<int>                          CreateAsync(CreateSiteDto dto);
    Task<bool>                         UpdateAsync(int id, UpdateSiteDto dto);
    Task<bool>                         DeleteAsync(int id);
    Task<bool>                         UpdateProgressAsync(int id, int progress, string status);
}

public class SiteRepository : ISiteRepository
{
    private readonly IDbConnectionFactory _db;
    public SiteRepository(IDbConnectionFactory db) => _db = db;

    private const string BaseSelect = @"
        SELECT s.Id, s.ClientId, c.Name AS ClientName,
               s.Name, s.City, s.Address, s.StartDate, s.EndDate,
               s.Budget, s.Progress, s.Status, s.Notes, s.CreatedAt
        FROM Sites s
        INNER JOIN Clients c ON c.Id = s.ClientId";

    public async Task<IEnumerable<SiteResponseDto>> GetAllAsync(string? status = null)
    {
        using var conn = _db.Create();
        var sql = BaseSelect + (status is not null ? " WHERE s.Status = @Status" : "") + " ORDER BY s.CreatedAt DESC";
        return await conn.QueryAsync<SiteResponseDto>(sql, new { Status = status });
    }

    public async Task<SiteResponseDto?> GetByIdAsync(int id)
    {
        using var conn = _db.Create();
        return await conn.QueryFirstOrDefaultAsync<SiteResponseDto>(
            BaseSelect + " WHERE s.Id = @Id", new { Id = id });
    }

    public async Task<int> CreateAsync(CreateSiteDto dto)
    {
        using var conn = _db.Create();
        const string sql = @"
            INSERT INTO Sites (ClientId, Name, City, Address, StartDate, EndDate, Budget, Notes)
            OUTPUT INSERTED.Id
            VALUES (@ClientId, @Name, @City, @Address, @StartDate, @EndDate, @Budget, @Notes)";
        return await conn.ExecuteScalarAsync<int>(sql, dto);
    }

    public async Task<bool> UpdateAsync(int id, UpdateSiteDto dto)
    {
        using var conn = _db.Create();
        const string sql = @"
            UPDATE Sites
            SET ClientId = @ClientId, Name = @Name, City = @City,
                Address = @Address, StartDate = @StartDate, EndDate = @EndDate,
                Budget = @Budget, Progress = @Progress, Status = @Status,
                Notes = @Notes, UpdatedAt = GETUTCDATE()
            WHERE Id = @Id";
        var rows = await conn.ExecuteAsync(sql, new
        {
            id, dto.ClientId, dto.Name, dto.City, dto.Address,
            dto.StartDate, dto.EndDate, dto.Budget, dto.Progress, dto.Status, dto.Notes
        });
        return rows > 0;
    }

    public async Task<bool> UpdateProgressAsync(int id, int progress, string status)
    {
        using var conn = _db.Create();
        var rows = await conn.ExecuteAsync(
            "UPDATE Sites SET Progress = @Progress, Status = @Status, UpdatedAt = GETUTCDATE() WHERE Id = @Id",
            new { Id = id, Progress = progress, Status = status });
        return rows > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        using var conn = _db.Create();
        var rows = await conn.ExecuteAsync("DELETE FROM Sites WHERE Id = @Id", new { Id = id });
        return rows > 0;
    }
}

// ═══════════════════════════════════════════════════════════
//  WORKER REPOSITORY
// ═══════════════════════════════════════════════════════════
public interface IWorkerRepository
{
    Task<IEnumerable<WorkerResponseDto>> GetAllAsync();
    Task<WorkerResponseDto?>             GetByIdAsync(int id);
    Task<int>                            CreateAsync(CreateWorkerDto dto);
    Task<bool>                           UpdateAsync(int id, UpdateWorkerDto dto);
    Task<bool>                           DeleteAsync(int id);
}

public class WorkerRepository : IWorkerRepository
{
    private readonly IDbConnectionFactory _db;
    public WorkerRepository(IDbConnectionFactory db) => _db = db;

    private const string BaseSelect = @"
        SELECT w.Id, w.SiteId, ISNULL(s.Name, '') AS SiteName, ISNULL(s.City, '') AS SiteCity,
               w.Name, w.Phone, w.Role, w.DailyWage, w.City, w.IsActive, w.CreatedAt,
               ISNULL(a.Status, 'absent') AS TodayStatus
        FROM Workers w
        LEFT JOIN Sites      s ON s.Id = w.SiteId
        LEFT JOIN Attendance a ON a.WorkerId = w.Id AND a.Date = CAST(GETUTCDATE() AS DATE)";

    public async Task<IEnumerable<WorkerResponseDto>> GetAllAsync()
    {
        using var conn = _db.Create();
        return await conn.QueryAsync<WorkerResponseDto>(BaseSelect + " ORDER BY w.CreatedAt DESC");
    }

    public async Task<WorkerResponseDto?> GetByIdAsync(int id)
    {
        using var conn = _db.Create();
        return await conn.QueryFirstOrDefaultAsync<WorkerResponseDto>(
            BaseSelect + " WHERE w.Id = @Id", new { Id = id });
    }

    public async Task<int> CreateAsync(CreateWorkerDto dto)
    {
        using var conn = _db.Create();
        const string sql = @"
            INSERT INTO Workers (SiteId, Name, Phone, Role, DailyWage, City)
            OUTPUT INSERTED.Id
            VALUES (@SiteId, @Name, @Phone, @Role, @DailyWage, @City)";
        return await conn.ExecuteScalarAsync<int>(sql, dto);
    }

    public async Task<bool> UpdateAsync(int id, UpdateWorkerDto dto)
    {
        using var conn = _db.Create();
        const string sql = @"
            UPDATE Workers
            SET SiteId = @SiteId, Name = @Name, Phone = @Phone,
                Role = @Role, DailyWage = @DailyWage, City = @City,
                IsActive = @IsActive, UpdatedAt = GETUTCDATE()
            WHERE Id = @Id";
        var rows = await conn.ExecuteAsync(sql, new { id, dto.SiteId, dto.Name, dto.Phone, dto.Role, dto.DailyWage, dto.City, dto.IsActive });
        return rows > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        using var conn = _db.Create();
        var rows = await conn.ExecuteAsync("DELETE FROM Workers WHERE Id = @Id", new { Id = id });
        return rows > 0;
    }
}

// ═══════════════════════════════════════════════════════════
//  ATTENDANCE REPOSITORY
// ═══════════════════════════════════════════════════════════
public interface IAttendanceRepository
{
    Task<IEnumerable<AttendanceResponseDto>> GetByDateAsync(DateTime date);
    Task<IEnumerable<AttendanceResponseDto>> GetByWorkerAsync(int workerId);
    Task<bool>                               UpsertAsync(UpsertAttendanceDto dto);
}

public class AttendanceRepository : IAttendanceRepository
{
    private readonly IDbConnectionFactory _db;
    public AttendanceRepository(IDbConnectionFactory db) => _db = db;

    public async Task<IEnumerable<AttendanceResponseDto>> GetByDateAsync(DateTime date)
    {
        using var conn = _db.Create();
        const string sql = @"
            SELECT a.Id, a.WorkerId, w.Name AS WorkerName, a.SiteId,
                   a.Date, a.Status, a.HoursWorked, a.Notes
            FROM Attendance a
            INNER JOIN Workers w ON w.Id = a.WorkerId
            WHERE a.Date = @Date
            ORDER BY a.CreatedAt DESC";
        return await conn.QueryAsync<AttendanceResponseDto>(sql, new { Date = date.Date });
    }

    public async Task<IEnumerable<AttendanceResponseDto>> GetByWorkerAsync(int workerId)
    {
        using var conn = _db.Create();
        const string sql = @"
            SELECT a.Id, a.WorkerId, w.Name AS WorkerName, a.SiteId,
                   a.Date, a.Status, a.HoursWorked, a.Notes
            FROM Attendance a
            INNER JOIN Workers w ON w.Id = a.WorkerId
            WHERE a.WorkerId = @WorkerId
            ORDER BY a.Date DESC";
        return await conn.QueryAsync<AttendanceResponseDto>(sql, new { WorkerId = workerId });
    }

    public async Task<bool> UpsertAsync(UpsertAttendanceDto dto)
    {
        using var conn = _db.Create();
        const string sql = @"
            MERGE Attendance AS target
            USING (SELECT @WorkerId AS WorkerId, @Date AS Date) AS source
                ON target.WorkerId = source.WorkerId AND target.Date = source.Date
            WHEN MATCHED THEN
                UPDATE SET Status = @Status, HoursWorked = @HoursWorked,
                           SiteId = @SiteId, Notes = @Notes
            WHEN NOT MATCHED THEN
                INSERT (WorkerId, SiteId, Date, Status, HoursWorked, Notes)
                VALUES (@WorkerId, @SiteId, @Date, @Status, @HoursWorked, @Notes);";
        var rows = await conn.ExecuteAsync(sql, dto);
        return rows > 0;
    }
}

// ═══════════════════════════════════════════════════════════
//  INVOICE REPOSITORY
// ═══════════════════════════════════════════════════════════
public interface IInvoiceRepository
{
    Task<IEnumerable<InvoiceResponseDto>> GetAllAsync(string? status = null);
    Task<InvoiceResponseDto?>             GetByIdAsync(int id);
    Task<int>                             CreateAsync(CreateInvoiceDto dto);
    Task<bool>                            UpdateStatusAsync(int id, UpdateInvoiceStatusDto dto);
    Task<bool>                            DeleteAsync(int id);
}

public class InvoiceRepository : IInvoiceRepository
{
    private readonly IDbConnectionFactory _db;
    public InvoiceRepository(IDbConnectionFactory db) => _db = db;

    private const string BaseSelect = @"
        SELECT i.Id, i.InvoiceNo, i.ClientId, c.Name AS ClientName,
               i.SiteId, ISNULL(s.Name,'') AS SiteName,
               i.Amount, i.DueDate, i.PaidDate, i.Status, i.Notes, i.CreatedAt
        FROM Invoices i
        INNER JOIN Clients c ON c.Id = i.ClientId
        LEFT JOIN  Sites   s ON s.Id = i.SiteId";

    public async Task<IEnumerable<InvoiceResponseDto>> GetAllAsync(string? status = null)
    {
        using var conn = _db.Create();
        var sql = BaseSelect + (status is not null ? " WHERE i.Status = @Status" : "") + " ORDER BY i.CreatedAt DESC";
        return await conn.QueryAsync<InvoiceResponseDto>(sql, new { Status = status });
    }

    public async Task<InvoiceResponseDto?> GetByIdAsync(int id)
    {
        using var conn = _db.Create();
        return await conn.QueryFirstOrDefaultAsync<InvoiceResponseDto>(
            BaseSelect + " WHERE i.Id = @Id", new { Id = id });
    }

    public async Task<int> CreateAsync(CreateInvoiceDto dto)
    {
        using var conn = _db.Create();
        // Generate next invoice number
        const string seqSql = "SELECT ISNULL(MAX(CAST(SUBSTRING(InvoiceNo,5,LEN(InvoiceNo)) AS INT)),80) + 1 FROM Invoices";
        var seq = await conn.ExecuteScalarAsync<int>(seqSql);
        var invoiceNo = $"INV-{seq:D3}";

        const string sql = @"
            INSERT INTO Invoices (InvoiceNo, ClientId, SiteId, Amount, DueDate, Notes)
            OUTPUT INSERTED.Id
            VALUES (@InvoiceNo, @ClientId, @SiteId, @Amount, @DueDate, @Notes)";
        return await conn.ExecuteScalarAsync<int>(sql, new
        {
            InvoiceNo = invoiceNo, dto.ClientId, dto.SiteId, dto.Amount, dto.DueDate, dto.Notes
        });
    }

    public async Task<bool> UpdateStatusAsync(int id, UpdateInvoiceStatusDto dto)
    {
        using var conn = _db.Create();
        const string sql = @"
            UPDATE Invoices
            SET Status = @Status, PaidDate = @PaidDate, UpdatedAt = GETUTCDATE()
            WHERE Id = @Id";
        var rows = await conn.ExecuteAsync(sql, new { Id = id, dto.Status, dto.PaidDate });
        return rows > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        using var conn = _db.Create();
        var rows = await conn.ExecuteAsync("DELETE FROM Invoices WHERE Id = @Id", new { Id = id });
        return rows > 0;
    }
}

// ═══════════════════════════════════════════════════════════
//  DASHBOARD REPOSITORY
// ═══════════════════════════════════════════════════════════
public interface IDashboardRepository
{
    Task<DashboardResponseDto> GetDashboardAsync();
}

public class DashboardRepository : IDashboardRepository
{
    private readonly IDbConnectionFactory _db;
    private readonly ISiteRepository      _sites;
    private readonly IWorkerRepository    _workers;
    private readonly IClientRepository    _clients;
    private readonly IInvoiceRepository   _invoices;

    public DashboardRepository(
        IDbConnectionFactory db,
        ISiteRepository sites,
        IWorkerRepository workers,
        IClientRepository clients,
        IInvoiceRepository invoices)
    {
        _db = db; _sites = sites; _workers = workers; _clients = clients; _invoices = invoices;
    }

    public async Task<DashboardResponseDto> GetDashboardAsync()
    {
        using var conn = _db.Create();

        // Stats in one round-trip
        const string statsSql = @"
            SELECT
                (SELECT COUNT(*) FROM Sites    WHERE Status = 'active')               AS ActiveSites,
                (SELECT COUNT(*) FROM Workers  WHERE IsActive = 1)                    AS TotalWorkers,
                (SELECT COUNT(*) FROM Clients  WHERE Status  = 'active')              AS TotalClients,
                (SELECT ISNULL(SUM(Amount),0)  FROM Invoices
                    WHERE Status = 'paid'
                    AND MONTH(PaidDate) = MONTH(GETUTCDATE())
                    AND YEAR(PaidDate)  = YEAR(GETUTCDATE()))                         AS RevenueThisMonth,
                (SELECT COUNT(*) FROM Attendance WHERE Date = CAST(GETUTCDATE() AS DATE) AND Status = 'present') AS PresentToday,
                (SELECT COUNT(*) FROM Attendance WHERE Date = CAST(GETUTCDATE() AS DATE) AND Status = 'absent')  AS AbsentToday,
                (SELECT ISNULL(SUM(Amount),0)  FROM Invoices WHERE Status IN ('pending','sent','overdue')) AS PendingInvoices,
                (SELECT ISNULL(SUM(Budget),0)  FROM Sites)                            AS TotalBudget";

        var stats = await conn.QueryFirstAsync<DashboardResponseDto>(statsSql);

        // Monthly revenue (last 7 months)
        const string revSql = @"
            SELECT FORMAT(PaidDate,'MMM') AS Month, SUM(Amount) AS Revenue
            FROM Invoices
            WHERE Status = 'paid' AND PaidDate >= DATEADD(MONTH,-6,GETUTCDATE())
            GROUP BY FORMAT(PaidDate,'MMM'), MONTH(PaidDate), YEAR(PaidDate)
            ORDER BY YEAR(PaidDate), MONTH(PaidDate)";
        stats.MonthlyRevenue = (await conn.QueryAsync<MonthlyRevenueDto>(revSql)).ToList();

        // Activity log
        const string actSql = @"
            SELECT TOP 8 Id, Module, Action, Icon, CreatedAt FROM ActivityLog ORDER BY CreatedAt DESC";
        var logs = await conn.QueryAsync<ActivityLog>(actSql);
        stats.Activities = logs.Select(l => new ActivityLogDto
        {
            Id = l.Id, Module = l.Module, Action = l.Action, Icon = l.Icon,
            CreatedAt = l.CreatedAt,
            TimeAgo = TimeAgoString(l.CreatedAt)
        }).ToList();

        // Related data (top 5 each)
        var allSites   = (await _sites.GetAllAsync()).Take(5).ToList();
        var allWorkers = (await _workers.GetAllAsync()).Take(5).ToList();
        var allClients = (await _clients.GetAllAsync()).Take(4).ToList();

        stats.RecentSites   = allSites;
        stats.RecentWorkers = allWorkers;
        stats.TopClients    = allClients;

        return stats;
    }

    private static string TimeAgoString(DateTime dt)
    {
        var diff = DateTime.UtcNow - dt;
        if (diff.TotalMinutes < 60)  return $"{(int)diff.TotalMinutes} min ago";
        if (diff.TotalHours   < 24)  return $"{(int)diff.TotalHours} hr ago";
        if (diff.TotalDays    < 7)   return $"{(int)diff.TotalDays} day(s) ago";
        return dt.ToString("dd MMM yyyy");
    }
}
