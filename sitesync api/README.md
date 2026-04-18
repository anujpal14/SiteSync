# SiteSync — Interior Contractor Platform

## Project Structure

```
SiteSync/
├── SiteSync.DB/
│   └── 001_Schema.sql          ← Run this first on MSSQL
└── SiteSync.API/
    ├── SiteSync.API.csproj
    ├── Program.cs               ← DI, CORS, Swagger
    ├── appsettings.json         ← Set your connection string here
    ├── Controllers/
    │   └── Controllers.cs       ← All 6 controllers
    ├── Models/
    │   └── Models.cs            ← Domain models
    ├── DTOs/
    │   └── DTOs.cs              ← Request/Response shapes
    ├── Data/
    │   └── DbConnectionFactory.cs  ← ADO/Dapper connection
    ├── Repositories/
    │   └── Repositories.cs      ← All Dapper queries
    └── wwwroot/
        └── index.html           ← Frontend (wired to API)
```

---

## 1. Database Setup (MSSQL)

Open SSMS or Azure Data Studio and run:
```
SiteSync.DB/001_Schema.sql
```
This creates `SiteSyncDB` with all tables, indexes, and seed data.

---

## 2. Configure Connection String

Edit `appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=SiteSyncDB;User Id=sa;Password=YOUR_PASSWORD;TrustServerCertificate=True;"
  }
}
```

For Windows Auth:
```
Server=localhost;Database=SiteSyncDB;Integrated Security=True;TrustServerCertificate=True;
```

---

## 3. Run the API

```bash
cd SiteSync.API
dotnet restore
dotnet run
```

API runs at: `http://localhost:5000`
Swagger UI:  `http://localhost:5000/swagger`

---

## 4. Frontend

The frontend (`wwwroot/index.html`) is served by the API itself.
Open `http://localhost:5000` in your browser.

If using a separate dev server, update `API_BASE` in `index.html`:
```js
const API_BASE = 'http://localhost:5000/api';
```

---

## API Endpoints

| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| GET    | /api/dashboard                  | All KPIs + recent data   |
| GET    | /api/sites?status=active        | All sites (filterable)   |
| POST   | /api/sites                      | Create site              |
| PUT    | /api/sites/{id}                 | Update site              |
| PATCH  | /api/sites/{id}/progress        | Update progress only     |
| DELETE | /api/sites/{id}                 | Delete site              |
| GET    | /api/clients                    | All clients              |
| POST   | /api/clients                    | Create client            |
| PUT    | /api/clients/{id}               | Update client            |
| DELETE | /api/clients/{id}               | Delete client            |
| GET    | /api/workers                    | All workers + today att. |
| POST   | /api/workers                    | Create worker            |
| PUT    | /api/workers/{id}               | Update worker            |
| DELETE | /api/workers/{id}               | Delete worker            |
| GET    | /api/attendance?date=2026-04-12 | Attendance by date       |
| GET    | /api/attendance/worker/{id}     | Worker history           |
| POST   | /api/attendance                 | Upsert attendance        |
| GET    | /api/invoices?status=pending    | All invoices             |
| POST   | /api/invoices                   | Create invoice           |
| PATCH  | /api/invoices/{id}/status       | Update status            |
| DELETE | /api/invoices/{id}              | Delete invoice           |

---

## Tech Stack

| Layer      | Technology                   |
|------------|------------------------------|
| API        | .NET 8 Web API               |
| ORM        | Dapper + ADO.NET             |
| Database   | Microsoft SQL Server (MSSQL) |
| Frontend   | Vanilla JS (Flutter-ready)   |
| Auth (next)| ASP.NET Identity / JWT       |
| Docs       | Swagger / OpenAPI            |

---

## Next Steps

1. **Add JWT Auth** — `AddAuthentication().AddJwtBearer()` in Program.cs
2. **Flutter App** — consume the same REST API from Flutter
3. **Azure Deploy** — publish to Azure App Service + Azure SQL
4. **File uploads** — add Azure Blob Storage for site photos
5. **Push notifications** — Firebase Cloud Messaging for attendance alerts
