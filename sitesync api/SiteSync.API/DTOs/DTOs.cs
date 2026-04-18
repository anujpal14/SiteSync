using System.ComponentModel.DataAnnotations;

namespace SiteSync.API.DTOs;

// ── CLIENT ──────────────────────────────────────────────────
public class CreateClientDto
{
    [Required, MaxLength(150)] public string Name    { get; set; } = string.Empty;
    [Required, MaxLength(20)]  public string Phone   { get; set; } = string.Empty;
    [MaxLength(200)]           public string? Email  { get; set; }
    [Required, MaxLength(100)] public string City    { get; set; } = string.Empty;
    [MaxLength(500)]           public string? Address { get; set; }
}

public class UpdateClientDto : CreateClientDto
{
    [Required] public string Status { get; set; } = "active";
}

public class ClientResponseDto
{
    public int     Id        { get; set; }
    public string  Name      { get; set; } = string.Empty;
    public string  Phone     { get; set; } = string.Empty;
    public string? Email     { get; set; }
    public string  City      { get; set; } = string.Empty;
    public string? Address   { get; set; }
    public string  Status    { get; set; } = string.Empty;
    public int     SiteCount { get; set; }
    public decimal TotalValue { get; set; }
    public DateTime CreatedAt { get; set; }
}

// ── SITE ────────────────────────────────────────────────────
public class CreateSiteDto
{
    [Required]               public int      ClientId  { get; set; }
    [Required, MaxLength(200)] public string Name      { get; set; } = string.Empty;
    [Required, MaxLength(100)] public string City      { get; set; } = string.Empty;
    [MaxLength(500)]           public string? Address  { get; set; }
    [Required]               public DateTime StartDate { get; set; }
    public DateTime?         EndDate   { get; set; }
    [Range(0, double.MaxValue)] public decimal Budget  { get; set; }
    public string?           Notes     { get; set; }
}

public class UpdateSiteDto : CreateSiteDto
{
    [Range(0, 100)]  public int    Progress { get; set; }
    [Required]       public string Status   { get; set; } = "active";
}

public class SiteResponseDto
{
    public int       Id         { get; set; }
    public int       ClientId   { get; set; }
    public string    ClientName { get; set; } = string.Empty;
    public string    Name       { get; set; } = string.Empty;
    public string    City       { get; set; } = string.Empty;
    public string?   Address    { get; set; }
    public DateTime  StartDate  { get; set; }
    public DateTime? EndDate    { get; set; }
    public decimal   Budget     { get; set; }
    public int       Progress   { get; set; }
    public string    Status     { get; set; } = string.Empty;
    public string?   Notes      { get; set; }
    public DateTime  CreatedAt  { get; set; }
}

// ── WORKER ──────────────────────────────────────────────────
public class CreateWorkerDto
{
    public int?      SiteId    { get; set; }
    [Required, MaxLength(150)] public string Name      { get; set; } = string.Empty;
    [Required, MaxLength(20)]  public string Phone     { get; set; } = string.Empty;
    [Required, MaxLength(100)] public string Role      { get; set; } = string.Empty;
    [Range(0, double.MaxValue)] public decimal DailyWage { get; set; }
    [MaxLength(100)] public string? City     { get; set; }
}

public class UpdateWorkerDto : CreateWorkerDto
{
    public bool IsActive { get; set; } = true;
}

public class WorkerResponseDto
{
    public int     Id          { get; set; }
    public int?    SiteId      { get; set; }
    public string  SiteName    { get; set; } = string.Empty;
    public string  SiteCity    { get; set; } = string.Empty;
    public string  Name        { get; set; } = string.Empty;
    public string  Phone       { get; set; } = string.Empty;
    public string  Role        { get; set; } = string.Empty;
    public decimal DailyWage   { get; set; }
    public string? City        { get; set; }
    public bool    IsActive    { get; set; }
    public string  TodayStatus { get; set; } = "absent";
    public DateTime CreatedAt  { get; set; }
}

// ── ATTENDANCE ──────────────────────────────────────────────
public class UpsertAttendanceDto
{
    [Required] public int    WorkerId    { get; set; }
    public int?              SiteId      { get; set; }
    [Required] public DateTime Date      { get; set; }
    [Required] public string  Status     { get; set; } = "present";
    public decimal            HoursWorked { get; set; } = 8;
    public string?            Notes      { get; set; }
}

public class AttendanceResponseDto
{
    public int      Id          { get; set; }
    public int      WorkerId    { get; set; }
    public string   WorkerName  { get; set; } = string.Empty;
    public int?     SiteId      { get; set; }
    public DateTime Date        { get; set; }
    public string   Status      { get; set; } = string.Empty;
    public decimal  HoursWorked { get; set; }
    public string?  Notes       { get; set; }
}

// ── INVOICE ─────────────────────────────────────────────────
public class CreateInvoiceDto
{
    [Required]               public int      ClientId  { get; set; }
    public int?              SiteId    { get; set; }
    [Range(1, double.MaxValue)] public decimal Amount  { get; set; }
    [Required]               public DateTime DueDate   { get; set; }
    public string?           Notes     { get; set; }
}

public class UpdateInvoiceStatusDto
{
    [Required] public string Status { get; set; } = string.Empty;
    public DateTime? PaidDate { get; set; }
}

public class InvoiceResponseDto
{
    public int       Id          { get; set; }
    public string    InvoiceNo   { get; set; } = string.Empty;
    public int       ClientId    { get; set; }
    public string    ClientName  { get; set; } = string.Empty;
    public int?      SiteId      { get; set; }
    public string    SiteName    { get; set; } = string.Empty;
    public decimal   Amount      { get; set; }
    public DateTime  DueDate     { get; set; }
    public DateTime? PaidDate    { get; set; }
    public string    Status      { get; set; } = string.Empty;
    public string?   Notes       { get; set; }
    public DateTime  CreatedAt   { get; set; }
}

// ── DASHBOARD ───────────────────────────────────────────────
public class DashboardResponseDto
{
    public int     ActiveSites        { get; set; }
    public int     TotalWorkers       { get; set; }
    public int     TotalClients       { get; set; }
    public decimal RevenueThisMonth   { get; set; }
    public int     PresentToday       { get; set; }
    public int     AbsentToday        { get; set; }
    public decimal PendingInvoices    { get; set; }
    public decimal TotalBudget        { get; set; }
    public List<SiteResponseDto>     RecentSites      { get; set; } = new();
    public List<WorkerResponseDto>   RecentWorkers    { get; set; } = new();
    public List<ClientResponseDto>   TopClients       { get; set; } = new();
    public List<ActivityLogDto>      Activities       { get; set; } = new();
    public List<MonthlyRevenueDto>   MonthlyRevenue   { get; set; } = new();
}

public class ActivityLogDto
{
    public int      Id        { get; set; }
    public string   Module    { get; set; } = string.Empty;
    public string   Action    { get; set; } = string.Empty;
    public string   Icon      { get; set; } = "📋";
    public DateTime CreatedAt { get; set; }
    public string   TimeAgo   { get; set; } = string.Empty;
}

public class MonthlyRevenueDto
{
    public string  Month   { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
}

// ── SHARED ──────────────────────────────────────────────────
public class ApiResponse<T>
{
    public bool   Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public T?     Data    { get; set; }

    public static ApiResponse<T> Ok(T data, string message = "Success")
        => new() { Success = true, Message = message, Data = data };

    public static ApiResponse<T> Fail(string message)
        => new() { Success = false, Message = message };
}
