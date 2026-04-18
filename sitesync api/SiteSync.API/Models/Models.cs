namespace SiteSync.API.Models;

public class Client
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string City { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string Status { get; set; } = "active";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class Site
{
    public int Id { get; set; }
    public int ClientId { get; set; }
    public string ClientName { get; set; } = string.Empty; // joined
    public string Name { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string? Address { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public decimal Budget { get; set; }
    public int Progress { get; set; }
    public string Status { get; set; } = "active";
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class Worker
{
    public int Id { get; set; }
    public int? SiteId { get; set; }
    public string SiteName { get; set; } = string.Empty; // joined
    public string SiteCity { get; set; } = string.Empty; // joined
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public decimal DailyWage { get; set; }
    public string? City { get; set; }
    public bool IsActive { get; set; } = true;
    public string TodayStatus { get; set; } = "absent"; // derived from Attendance
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class Attendance
{
    public int Id { get; set; }
    public int WorkerId { get; set; }
    public string WorkerName { get; set; } = string.Empty;
    public int? SiteId { get; set; }
    public DateTime Date { get; set; }
    public string Status { get; set; } = "present";
    public decimal HoursWorked { get; set; } = 8;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class Invoice
{
    public int Id { get; set; }
    public string InvoiceNo { get; set; } = string.Empty;
    public int ClientId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public int? SiteId { get; set; }
    public string SiteName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateTime DueDate { get; set; }
    public DateTime? PaidDate { get; set; }
    public string Status { get; set; } = "sent";
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class ActivityLog
{
    public int Id { get; set; }
    public string Module { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public int? EntityId { get; set; }
    public string Icon { get; set; } = "📋";
    public DateTime CreatedAt { get; set; }
}

public class DashboardStats
{
    public int ActiveSites { get; set; }
    public int TotalWorkers { get; set; }
    public int TotalClients { get; set; }
    public decimal RevenueThisMonth { get; set; }
    public int PresentToday { get; set; }
    public int AbsentToday { get; set; }
    public decimal PendingInvoices { get; set; }
    public decimal TotalBudget { get; set; }
}
