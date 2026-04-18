using Microsoft.AspNetCore.Mvc;
using SiteSync.API.DTOs;
using SiteSync.API.Repositories;

namespace SiteSync.API.Controllers;

// ═══════════════════════════════════════════════════════════
//  DASHBOARD
// ═══════════════════════════════════════════════════════════
[ApiController, Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardRepository _repo;
    public DashboardController(IDashboardRepository repo) => _repo = repo;

    /// <summary>Returns all KPIs, recent sites, workers, clients and activity log.</summary>
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        try
        {
            var data = await _repo.GetDashboardAsync();
            return Ok(ApiResponse<DashboardResponseDto>.Ok(data));
        }
        catch (Exception ex) { return StatusCode(500, ApiResponse<string>.Fail(ex.Message)); }
    }
}

// ═══════════════════════════════════════════════════════════
//  SITES
// ═══════════════════════════════════════════════════════════
[ApiController, Route("api/[controller]")]
public class SitesController : ControllerBase
{
    private readonly ISiteRepository _repo;
    public SitesController(ISiteRepository repo) => _repo = repo;

    /// <summary>Get all sites. Optional ?status=active|hold|done</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? status)
    {
        var data = await _repo.GetAllAsync(status);
        return Ok(ApiResponse<IEnumerable<SiteResponseDto>>.Ok(data));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var site = await _repo.GetByIdAsync(id);
        return site is null
            ? NotFound(ApiResponse<string>.Fail($"Site {id} not found"))
            : Ok(ApiResponse<SiteResponseDto>.Ok(site));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSiteDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var newId = await _repo.CreateAsync(dto);
        var site  = await _repo.GetByIdAsync(newId);
        return CreatedAtAction(nameof(GetById), new { id = newId },
            ApiResponse<SiteResponseDto>.Ok(site!, "Site created"));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateSiteDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var ok = await _repo.UpdateAsync(id, dto);
        return ok ? Ok(ApiResponse<string>.Ok("", "Site updated"))
                  : NotFound(ApiResponse<string>.Fail($"Site {id} not found"));
    }

    /// <summary>Quick progress update: PATCH /api/sites/5/progress</summary>
    [HttpPatch("{id:int}/progress")]
    public async Task<IActionResult> UpdateProgress(int id, [FromBody] ProgressUpdateDto dto)
    {
        var ok = await _repo.UpdateProgressAsync(id, dto.Progress, dto.Status);
        return ok ? Ok(ApiResponse<string>.Ok("", "Progress updated"))
                  : NotFound(ApiResponse<string>.Fail($"Site {id} not found"));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var ok = await _repo.DeleteAsync(id);
        return ok ? Ok(ApiResponse<string>.Ok("", "Site deleted"))
                  : NotFound(ApiResponse<string>.Fail($"Site {id} not found"));
    }
}

public record ProgressUpdateDto(int Progress, string Status);

// ═══════════════════════════════════════════════════════════
//  CLIENTS
// ═══════════════════════════════════════════════════════════
[ApiController, Route("api/[controller]")]
public class ClientsController : ControllerBase
{
    private readonly IClientRepository _repo;
    public ClientsController(IClientRepository repo) => _repo = repo;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var data = await _repo.GetAllAsync();
        return Ok(ApiResponse<IEnumerable<ClientResponseDto>>.Ok(data));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var c = await _repo.GetByIdAsync(id);
        return c is null
            ? NotFound(ApiResponse<string>.Fail($"Client {id} not found"))
            : Ok(ApiResponse<ClientResponseDto>.Ok(c));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateClientDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var newId  = await _repo.CreateAsync(dto);
        var client = await _repo.GetByIdAsync(newId);
        return CreatedAtAction(nameof(GetById), new { id = newId },
            ApiResponse<ClientResponseDto>.Ok(client!, "Client created"));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateClientDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var ok = await _repo.UpdateAsync(id, dto);
        return ok ? Ok(ApiResponse<string>.Ok("", "Client updated"))
                  : NotFound(ApiResponse<string>.Fail($"Client {id} not found"));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var ok = await _repo.DeleteAsync(id);
        return ok ? Ok(ApiResponse<string>.Ok("", "Client deleted"))
                  : NotFound(ApiResponse<string>.Fail($"Client {id} not found"));
    }
}

// ═══════════════════════════════════════════════════════════
//  WORKERS (Labour)
// ═══════════════════════════════════════════════════════════
[ApiController, Route("api/[controller]")]
public class WorkersController : ControllerBase
{
    private readonly IWorkerRepository _repo;
    public WorkersController(IWorkerRepository repo) => _repo = repo;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var data = await _repo.GetAllAsync();
        return Ok(ApiResponse<IEnumerable<WorkerResponseDto>>.Ok(data));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var w = await _repo.GetByIdAsync(id);
        return w is null
            ? NotFound(ApiResponse<string>.Fail($"Worker {id} not found"))
            : Ok(ApiResponse<WorkerResponseDto>.Ok(w));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateWorkerDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var newId  = await _repo.CreateAsync(dto);
        var worker = await _repo.GetByIdAsync(newId);
        return CreatedAtAction(nameof(GetById), new { id = newId },
            ApiResponse<WorkerResponseDto>.Ok(worker!, "Worker created"));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateWorkerDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var ok = await _repo.UpdateAsync(id, dto);
        return ok ? Ok(ApiResponse<string>.Ok("", "Worker updated"))
                  : NotFound(ApiResponse<string>.Fail($"Worker {id} not found"));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var ok = await _repo.DeleteAsync(id);
        return ok ? Ok(ApiResponse<string>.Ok("", "Worker deleted"))
                  : NotFound(ApiResponse<string>.Fail($"Worker {id} not found"));
    }
}

// ═══════════════════════════════════════════════════════════
//  ATTENDANCE
// ═══════════════════════════════════════════════════════════
[ApiController, Route("api/[controller]")]
public class AttendanceController : ControllerBase
{
    private readonly IAttendanceRepository _repo;
    public AttendanceController(IAttendanceRepository repo) => _repo = repo;

    /// <summary>GET /api/attendance?date=2026-04-12</summary>
    [HttpGet]
    public async Task<IActionResult> GetByDate([FromQuery] DateTime? date)
    {
        var d    = date ?? DateTime.UtcNow;
        var data = await _repo.GetByDateAsync(d);
        return Ok(ApiResponse<IEnumerable<AttendanceResponseDto>>.Ok(data));
    }

    /// <summary>GET /api/attendance/worker/5</summary>
    [HttpGet("worker/{workerId:int}")]
    public async Task<IActionResult> GetByWorker(int workerId)
    {
        var data = await _repo.GetByWorkerAsync(workerId);
        return Ok(ApiResponse<IEnumerable<AttendanceResponseDto>>.Ok(data));
    }

    /// <summary>POST — creates or updates attendance for a worker+date (MERGE)</summary>
    [HttpPost]
    public async Task<IActionResult> Upsert([FromBody] UpsertAttendanceDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var ok = await _repo.UpsertAsync(dto);
        return ok ? Ok(ApiResponse<string>.Ok("", "Attendance saved"))
                  : StatusCode(500, ApiResponse<string>.Fail("Failed to save attendance"));
    }
}

// ═══════════════════════════════════════════════════════════
//  INVOICES
// ═══════════════════════════════════════════════════════════
[ApiController, Route("api/[controller]")]
public class InvoicesController : ControllerBase
{
    private readonly IInvoiceRepository _repo;
    public InvoicesController(IInvoiceRepository repo) => _repo = repo;

    /// <summary>GET /api/invoices?status=pending</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? status)
    {
        var data = await _repo.GetAllAsync(status);
        return Ok(ApiResponse<IEnumerable<InvoiceResponseDto>>.Ok(data));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var inv = await _repo.GetByIdAsync(id);
        return inv is null
            ? NotFound(ApiResponse<string>.Fail($"Invoice {id} not found"))
            : Ok(ApiResponse<InvoiceResponseDto>.Ok(inv));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateInvoiceDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var newId = await _repo.CreateAsync(dto);
        var inv   = await _repo.GetByIdAsync(newId);
        return CreatedAtAction(nameof(GetById), new { id = newId },
            ApiResponse<InvoiceResponseDto>.Ok(inv!, "Invoice created"));
    }

    /// <summary>PATCH /api/invoices/3/status  — mark paid, sent, overdue…</summary>
    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateInvoiceStatusDto dto)
    {
        var ok = await _repo.UpdateStatusAsync(id, dto);
        return ok ? Ok(ApiResponse<string>.Ok("", "Status updated"))
                  : NotFound(ApiResponse<string>.Fail($"Invoice {id} not found"));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var ok = await _repo.DeleteAsync(id);
        return ok ? Ok(ApiResponse<string>.Ok("", "Invoice deleted"))
                  : NotFound(ApiResponse<string>.Fail($"Invoice {id} not found"));
    }
}
