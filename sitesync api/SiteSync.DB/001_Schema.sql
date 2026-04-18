-- ============================================================
--  SiteSync — MSSQL Database Schema
--  Run this script once on your MSSQL server
-- ============================================================

USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'SiteSyncDB')
    CREATE DATABASE SiteSyncDB;
GO

USE SiteSyncDB;
GO

-- ──────────────────────────────────────────
-- 1. CLIENTS
-- ──────────────────────────────────────────
CREATE TABLE Clients (
    Id          INT IDENTITY(1,1) PRIMARY KEY,
    Name        NVARCHAR(150)  NOT NULL,
    Phone       NVARCHAR(20)   NOT NULL,
    Email       NVARCHAR(200)  NULL,
    City        NVARCHAR(100)  NOT NULL,
    Address     NVARCHAR(500)  NULL,
    Status      NVARCHAR(20)   NOT NULL DEFAULT 'active'  -- active | inactive
                    CHECK (Status IN ('active','inactive')),
    CreatedAt   DATETIME2      NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt   DATETIME2      NOT NULL DEFAULT GETUTCDATE()
);

-- ──────────────────────────────────────────
-- 2. SITES
-- ──────────────────────────────────────────
CREATE TABLE Sites (
    Id          INT IDENTITY(1,1) PRIMARY KEY,
    ClientId    INT            NOT NULL REFERENCES Clients(Id) ON DELETE CASCADE,
    Name        NVARCHAR(200)  NOT NULL,
    City        NVARCHAR(100)  NOT NULL,
    Address     NVARCHAR(500)  NULL,
    StartDate   DATE           NOT NULL,
    EndDate     DATE           NULL,
    Budget      DECIMAL(18,2)  NOT NULL DEFAULT 0,
    Progress    INT            NOT NULL DEFAULT 0 CHECK (Progress BETWEEN 0 AND 100),
    Status      NVARCHAR(20)   NOT NULL DEFAULT 'active'
                    CHECK (Status IN ('active','hold','done')),
    Notes       NVARCHAR(1000) NULL,
    CreatedAt   DATETIME2      NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt   DATETIME2      NOT NULL DEFAULT GETUTCDATE()
);

-- ──────────────────────────────────────────
-- 3. WORKERS (Labour)
-- ──────────────────────────────────────────
CREATE TABLE Workers (
    Id          INT IDENTITY(1,1) PRIMARY KEY,
    SiteId      INT            NULL REFERENCES Sites(Id) ON DELETE SET NULL,
    Name        NVARCHAR(150)  NOT NULL,
    Phone       NVARCHAR(20)   NOT NULL,
    Role        NVARCHAR(100)  NOT NULL,  -- Supervisor | Electrician | Carpenter | Painter | Plumber | Mason | Helper
    DailyWage   DECIMAL(10,2)  NOT NULL DEFAULT 0,
    City        NVARCHAR(100)  NULL,
    IsActive    BIT            NOT NULL DEFAULT 1,
    CreatedAt   DATETIME2      NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt   DATETIME2      NOT NULL DEFAULT GETUTCDATE()
);

-- ──────────────────────────────────────────
-- 4. ATTENDANCE
-- ──────────────────────────────────────────
CREATE TABLE Attendance (
    Id          INT IDENTITY(1,1) PRIMARY KEY,
    WorkerId    INT            NOT NULL REFERENCES Workers(Id) ON DELETE CASCADE,
    SiteId      INT            NULL REFERENCES Sites(Id) ON DELETE SET NULL,
    Date        DATE           NOT NULL,
    Status      NVARCHAR(20)   NOT NULL DEFAULT 'present'
                    CHECK (Status IN ('present','absent','half-day')),
    HoursWorked DECIMAL(5,2)   NOT NULL DEFAULT 8,
    Notes       NVARCHAR(500)  NULL,
    CreatedAt   DATETIME2      NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT UQ_Attendance_Worker_Date UNIQUE (WorkerId, Date)
);

-- ──────────────────────────────────────────
-- 5. INVOICES
-- ──────────────────────────────────────────
CREATE TABLE Invoices (
    Id          INT IDENTITY(1,1) PRIMARY KEY,
    InvoiceNo   NVARCHAR(20)   NOT NULL UNIQUE,
    ClientId    INT            NOT NULL REFERENCES Clients(Id),
    SiteId      INT            NULL REFERENCES Sites(Id) ON DELETE SET NULL,
    Amount      DECIMAL(18,2)  NOT NULL,
    DueDate     DATE           NOT NULL,
    PaidDate    DATE           NULL,
    Status      NVARCHAR(20)   NOT NULL DEFAULT 'sent'
                    CHECK (Status IN ('sent','paid','pending','overdue')),
    Notes       NVARCHAR(1000) NULL,
    CreatedAt   DATETIME2      NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt   DATETIME2      NOT NULL DEFAULT GETUTCDATE()
);

-- ──────────────────────────────────────────
-- 6. ACTIVITY LOG
-- ──────────────────────────────────────────
CREATE TABLE ActivityLog (
    Id          INT IDENTITY(1,1) PRIMARY KEY,
    Module      NVARCHAR(50)   NOT NULL,  -- site | client | labour | finance
    Action      NVARCHAR(200)  NOT NULL,
    EntityId    INT            NULL,
    Icon        NVARCHAR(10)   NOT NULL DEFAULT '📋',
    CreatedAt   DATETIME2      NOT NULL DEFAULT GETUTCDATE()
);

-- ──────────────────────────────────────────
-- 7. INDEXES
-- ──────────────────────────────────────────
CREATE INDEX IX_Sites_ClientId    ON Sites(ClientId);
CREATE INDEX IX_Sites_Status      ON Sites(Status);
CREATE INDEX IX_Workers_SiteId    ON Workers(SiteId);
CREATE INDEX IX_Attendance_Date   ON Attendance(Date);
CREATE INDEX IX_Attendance_Worker ON Attendance(WorkerId);
CREATE INDEX IX_Invoices_ClientId ON Invoices(ClientId);
CREATE INDEX IX_Invoices_SiteId   ON Invoices(SiteId);
CREATE INDEX IX_Invoices_Status   ON Invoices(Status);
CREATE INDEX IX_ActivityLog_Date  ON ActivityLog(CreatedAt DESC);
GO

-- ──────────────────────────────────────────
-- 8. SEED DATA
-- ──────────────────────────────────────────
INSERT INTO Clients (Name, Phone, Email, City, Address) VALUES
('A. Sharma',  '+91 98201 11234', 'a.sharma@email.com',   'Mumbai',    'Juhu, Mumbai'),
('TechCorp',   '+91 11 2345 6789','contact@techcorp.in',  'Delhi',     'Connaught Place, Delhi'),
('R. Patel',   '+91 98705 55234', 'r.patel@email.com',    'Pune',      'Baner, Pune'),
('K. Nair',    '+91 98452 77890', 'k.nair@email.com',     'Bangalore', 'Whitefield, Bangalore'),
('SunGroup',   '+91 40 9876 5432','info@sungroup.in',      'Hyderabad', 'Banjara Hills, Hyderabad'),
('P. Rajan',   '+91 98401 33456', 'p.rajan@email.com',    'Chennai',   'Besant Nagar, Chennai'),
('M. Singh',   '+91 98290 22678', 'm.singh@email.com',    'Jaipur',    'Vaishali Nagar, Jaipur');

INSERT INTO Sites (ClientId, Name, City, Address, StartDate, Budget, Progress, Status) VALUES
(1, 'Sharma Villa',       'Mumbai',    'Juhu, Mumbai',              '2025-10-01', 1800000, 78,  'active'),
(2, 'Metro Office',       'Delhi',     'Connaught Place, Delhi',    '2025-11-15', 2400000, 45,  'active'),
(3, 'Green Heights',      'Pune',      'Baner, Pune',               '2025-09-01', 960000,  92,  'active'),
(4, 'Lakeview Apt',       'Bangalore', 'Whitefield, Bangalore',     '2025-12-01', 1200000, 30,  'hold'),
(5, 'Sunrise Mall',       'Hyderabad', 'Banjara Hills, Hyderabad',  '2025-08-01', 3500000, 100, 'done'),
(6, 'Coastal Residency',  'Chennai',   'Besant Nagar, Chennai',     '2026-01-10', 2100000, 22,  'active'),
(7, 'Park Avenue',        'Jaipur',    'Vaishali Nagar, Jaipur',    '2026-02-01', 800000,  65,  'active'),
(1, 'Hill View Bungalow', 'Shimla',    'Mall Road, Shimla',         '2026-03-01', 3200000, 10,  'active');

INSERT INTO Workers (SiteId, Name, Phone, Role, DailyWage) VALUES
(1, 'Ravi Teja',  '+91 98801 11111', 'Supervisor',  1200),
(2, 'Suresh M.',  '+91 98802 22222', 'Electrician',  900),
(3, 'Anand K.',   '+91 98803 33333', 'Carpenter',    850),
(4, 'Deepak P.',  '+91 98804 44444', 'Painter',      750),
(5, 'Vijay S.',   '+91 98805 55555', 'Plumber',      800),
(1, 'Mohan R.',   '+91 98806 66666', 'Mason',        700),
(6, 'Kiran L.',   '+91 98807 77777', 'Helper',       550),
(7, 'Arjun T.',   '+91 98808 88888', 'Supervisor',  1100);

INSERT INTO Attendance (WorkerId, SiteId, Date, Status) VALUES
(1, 1, CAST(GETUTCDATE() AS DATE), 'present'),
(2, 2, CAST(GETUTCDATE() AS DATE), 'present'),
(3, 3, CAST(GETUTCDATE() AS DATE), 'present'),
(4, 4, CAST(GETUTCDATE() AS DATE), 'absent'),
(5, 5, CAST(GETUTCDATE() AS DATE), 'present'),
(6, 1, CAST(GETUTCDATE() AS DATE), 'present'),
(7, 6, CAST(GETUTCDATE() AS DATE), 'absent'),
(8, 7, CAST(GETUTCDATE() AS DATE), 'present');

INSERT INTO Invoices (InvoiceNo, ClientId, SiteId, Amount, DueDate, Status) VALUES
('INV-081', 1, 1, 450000, '2026-04-15', 'paid'),
('INV-082', 2, 2, 600000, '2026-04-20', 'pending'),
('INV-083', 3, 3, 240000, '2026-04-18', 'paid'),
('INV-084', 1, 1, 180000, '2026-04-25', 'sent'),
('INV-085', 4, 4, 300000, '2026-04-10', 'overdue');

INSERT INTO ActivityLog (Module, Action, EntityId, Icon) VALUES
('labour',  'Ravi Teja checked in at Green Heights', 1, '👷'),
('finance', 'Invoice INV-084 sent to A. Sharma',     4, '📄'),
('site',    'Material shortage at Lakeview Apt',      4, '⚠️'),
('site',    'Sunrise Mall marked complete',            5, '✅'),
('client',  'New client K. Nair added',               4, '👤');
GO
