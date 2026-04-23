// src/app/core/services/pdf.service.ts
import { Injectable } from "@angular/core";
import { Site, Client, Worker, Invoice } from "../../data/models/models";

// ─────────────────────────────────────────────────────────
//  Tiny helpers
// ─────────────────────────────────────────────────────────
function inr(n: number): string {
  if (n >= 10_000_000) return `Rs.${(n / 10_000_000).toFixed(2)}Cr`;
  if (n >= 100_000) return `Rs.${(n / 100_000).toFixed(2)}L`;
  return `Rs.${n.toLocaleString("en-IN")}`;
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function today(): string {
  return new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─────────────────────────────────────────────────────────
//  Shared PDF header / footer stamp
// ─────────────────────────────────────────────────────────
async function buildDoc(title: string, subtitle: string): Promise<any> {
  // Dynamic import so jsPDF is code-split and not in main bundle
  const jsPDFModule = await import("jspdf");
  const autoTableModule = await import("jspdf-autotable");

  const jsPDF = jsPDFModule.default ?? (jsPDFModule as any).jsPDF;
  const autoTable = (autoTableModule as any).default ?? autoTableModule;

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // ── Header bar ───────────────────────────────────────
  doc.setFillColor(108, 99, 255); // accent purple
  doc.rect(0, 0, 210, 22, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("SiteSync", 14, 9);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Interior Contractor Management Platform", 14, 14.5);

  // Report title on the right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(title, 196, 9, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`Generated: ${today()}`, 196, 14.5, { align: "right" });

  // ── Subtitle ─────────────────────────────────────────
  doc.setTextColor(80, 80, 100);
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.text(subtitle, 14, 29);

  // ── Thin separator ───────────────────────────────────
  doc.setDrawColor(220, 218, 255);
  doc.setLineWidth(0.3);
  doc.line(14, 31, 196, 31);

  return { doc, autoTable, startY: 35 };
}

// Stamp page numbers on every page
function stampPageNumbers(doc: any): void {
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setTextColor(160, 158, 180);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.text(`Page ${i} of ${total}`, 196, 289, { align: "right" });
    doc.text("SiteSync — Confidential", 14, 289);
  }
}

// ─────────────────────────────────────────────────────────
//  autoTable theme shared config
// ─────────────────────────────────────────────────────────
const TABLE_STYLES = {
  headStyles: {
    fillColor: [108, 99, 255] as [number, number, number],
    textColor: [255, 255, 255] as [number, number, number],
    fontStyle: "bold" as const,
    fontSize: 8.5,
    cellPadding: 3,
  },
  bodyStyles: {
    fontSize: 8,
    cellPadding: 2.5,
    textColor: [40, 38, 60] as [number, number, number],
  },
  alternateRowStyles: {
    fillColor: [245, 244, 255] as [number, number, number],
  },
  tableLineColor: [220, 218, 255] as [number, number, number],
  tableLineWidth: 0.2,
  margin: { left: 14, right: 14 },
};

// ─────────────────────────────────────────────────────────
//  KPI summary box — drawn above each table
// ─────────────────────────────────────────────────────────
function drawKpiRow(
  doc: any,
  kpis: { label: string; value: string; color: [number, number, number] }[],
  y: number,
): number {
  const boxW = (210 - 28 - (kpis.length - 1) * 4) / kpis.length;
  let x = 14;

  kpis.forEach((k) => {
    doc.setFillColor(...k.color);
    doc.roundedRect(x, y, boxW, 14, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(k.value, x + boxW / 2, y + 6.5, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.text(k.label, x + boxW / 2, y + 11.5, { align: "center" });
    x += boxW + 4;
  });

  return y + 19; // next Y position
}

// ─────────────────────────────────────────────────────────
//  1. SITE SUMMARY REPORT
// ─────────────────────────────────────────────────────────
async function generateSiteReport(sites: Site[]): Promise<void> {
  const { doc, autoTable, startY } = await buildDoc(
    "Site Summary Report",
    `All project sites as of ${today()}`,
  );

  const active = sites.filter((s) => s.status === "active").length;
  const onHold = sites.filter((s) => s.status === "hold").length;
  const done = sites.filter((s) => s.status === "done").length;
  const totalBudget = sites.reduce((a, s) => a + s.budget, 0);
  const avgProgress = sites.length
    ? Math.round(sites.reduce((a, s) => a + s.progress, 0) / sites.length)
    : 0;

  const nextY = drawKpiRow(
    doc,
    [
      { label: "Total Sites", value: `${sites.length}`, color: [108, 99, 255] },
      { label: "Active", value: `${active}`, color: [31, 158, 117] },
      { label: "On Hold", value: `${onHold}`, color: [186, 117, 23] },
      { label: "Completed", value: `${done}`, color: [63, 109, 17] },
      {
        label: "Avg Progress",
        value: `${avgProgress}%`,
        color: [78, 205, 196],
      },
      { label: "Total Budget", value: inr(totalBudget), color: [60, 52, 137] },
    ],
    startY,
  );

  autoTable(doc, {
    startY: nextY,
    head: [
      [
        "#",
        "Site Name",
        "City",
        "Client",
        "Start Date",
        "Budget",
        "Progress",
        "Status",
      ],
    ],
    body: sites.map((s, i) => [
      i + 1,
      s.name,
      s.city,
      s.clientName ?? "-",
      fmtDate(s.startDate),
      inr(s.budget),
      `${s.progress}%`,
      s.status.toUpperCase(),
    ]),
    ...TABLE_STYLES,
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      5: { halign: "right" },
      6: { halign: "center" },
      7: { halign: "center" },
    },
    didDrawCell: (data: any) => {
      // Color the status cell
      if (data.column.index === 7 && data.section === "body") {
        const val = data.cell.raw as string;
        const col =
          val === "ACTIVE"
            ? [31, 158, 117]
            : val === "HOLD"
              ? [186, 117, 23]
              : [108, 99, 255];
        data.doc.setTextColor(...col);
        data.doc.setFont("helvetica", "bold");
      }
    },
  });

  stampPageNumbers(doc);
  doc.save(
    `SiteSync_Sites_Report_${new Date().toISOString().split("T")[0]}.pdf`,
  );
}

// ─────────────────────────────────────────────────────────
//  2. LABOUR ATTENDANCE REPORT
// ─────────────────────────────────────────────────────────
async function generateLabourReport(workers: Worker[]): Promise<void> {
  const { doc, autoTable, startY } = await buildDoc(
    "Labour Attendance Report",
    `Worker status as of ${today()}`,
  );

  const present = workers.filter((w) => w.todayStatus === "present").length;
  const absent = workers.filter((w) => w.todayStatus === "absent").length;
  const halfDay = workers.filter((w) => w.todayStatus === "half-day").length;
  const totalWages = workers.reduce((a, w) => a + w.dailyWage * 26, 0);
  const roles = [...new Set(workers.map((w) => w.role))].length;

  const nextY = drawKpiRow(
    doc,
    [
      {
        label: "Total Workers",
        value: `${workers.length}`,
        color: [108, 99, 255],
      },
      { label: "Present Today", value: `${present}`, color: [31, 158, 117] },
      { label: "Absent Today", value: `${absent}`, color: [163, 45, 45] },
      { label: "Half Day", value: `${halfDay}`, color: [186, 117, 23] },
      { label: "Unique Roles", value: `${roles}`, color: [78, 205, 196] },
      { label: "Est. Monthly", value: inr(totalWages), color: [60, 52, 137] },
    ],
    startY,
  );

  autoTable(doc, {
    startY: nextY,
    head: [
      [
        "#",
        "Worker Name",
        "Role",
        "Site Assigned",
        "Daily Wage",
        "Est. Monthly",
        "Today's Status",
      ],
    ],
    body: workers.map((w, i) => [
      i + 1,
      w.name,
      w.role,
      w.siteName || "Unassigned",
      inr(w.dailyWage),
      inr(w.dailyWage * 26),
      w.todayStatus.toUpperCase(),
    ]),
    ...TABLE_STYLES,
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      4: { halign: "right" },
      5: { halign: "right" },
      6: { halign: "center" },
    },
    didDrawCell: (data: any) => {
      if (data.column.index === 6 && data.section === "body") {
        const val = data.cell.raw as string;
        const col =
          val === "PRESENT"
            ? [31, 158, 117]
            : val === "ABSENT"
              ? [163, 45, 45]
              : [186, 117, 23];
        data.doc.setTextColor(...col);
        data.doc.setFont("helvetica", "bold");
      }
    },
  });

  stampPageNumbers(doc);
  doc.save(
    `SiteSync_Labour_Report_${new Date().toISOString().split("T")[0]}.pdf`,
  );
}

// ─────────────────────────────────────────────────────────
//  3. FINANCE & INVOICE REPORT
// ─────────────────────────────────────────────────────────
async function generateFinanceReport(invoices: Invoice[]): Promise<void> {
  const { doc, autoTable, startY } = await buildDoc(
    "Finance & Invoice Report",
    `All invoices as of ${today()}`,
  );

  const totalAmt = invoices.reduce((a, i) => a + i.amount, 0);
  const paid = invoices
    .filter((i) => i.status === "paid")
    .reduce((a, i) => a + i.amount, 0);
  const pending = invoices
    .filter((i) => i.status !== "paid")
    .reduce((a, i) => a + i.amount, 0);
  const overdue = invoices
    .filter((i) => i.status === "overdue")
    .reduce((a, i) => a + i.amount, 0);
  const paidCount = invoices.filter((i) => i.status === "paid").length;

  const nextY = drawKpiRow(
    doc,
    [
      { label: "Total Invoiced", value: inr(totalAmt), color: [108, 99, 255] },
      { label: "Received", value: inr(paid), color: [31, 158, 117] },
      { label: "Outstanding", value: inr(pending), color: [186, 117, 23] },
      { label: "Overdue", value: inr(overdue), color: [163, 45, 45] },
      {
        label: "Paid Invoices",
        value: `${paidCount}/${invoices.length}`,
        color: [78, 205, 196],
      },
    ],
    startY,
  );

  autoTable(doc, {
    startY: nextY,
    head: [
      [
        "#",
        "Invoice No.",
        "Client",
        "Site",
        "Date",
        "Due Date",
        "Amount",
        "Status",
      ],
    ],
    body: invoices.map((inv, i) => [
      i + 1,
      inv.invoiceNo,
      inv.clientName,
      inv.siteName || "-",
      fmtDate(inv.createdAt),
      fmtDate(inv.dueDate),
      inr(inv.amount),
      inv.status.toUpperCase(),
    ]),
    ...TABLE_STYLES,
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      6: { halign: "right" },
      7: { halign: "center" },
    },
    didDrawCell: (data: any) => {
      if (data.column.index === 7 && data.section === "body") {
        const val = data.cell.raw as string;
        const col =
          val === "PAID"
            ? [31, 158, 117]
            : val === "OVERDUE"
              ? [163, 45, 45]
              : [186, 117, 23];
        data.doc.setTextColor(...col);
        data.doc.setFont("helvetica", "bold");
      }
    },
  });

  stampPageNumbers(doc);
  doc.save(
    `SiteSync_Finance_Report_${new Date().toISOString().split("T")[0]}.pdf`,
  );
}

// ─────────────────────────────────────────────────────────
//  4. CLIENT REPORT
// ─────────────────────────────────────────────────────────
async function generateClientReport(clients: Client[]): Promise<void> {
  const { doc, autoTable, startY } = await buildDoc(
    "Client Report",
    `All clients as of ${today()}`,
  );

  const active = clients.filter((c) => c.status === "active").length;
  const totalSites = clients.reduce((a, c) => a + c.siteCount, 0);
  const totalVal = clients.reduce((a, c) => a + c.totalValue, 0);

  const nextY = drawKpiRow(
    doc,
    [
      {
        label: "Total Clients",
        value: `${clients.length}`,
        color: [108, 99, 255],
      },
      { label: "Active", value: `${active}`, color: [31, 158, 117] },
      { label: "Total Sites", value: `${totalSites}`, color: [78, 205, 196] },
      { label: "Total Value", value: inr(totalVal), color: [60, 52, 137] },
    ],
    startY,
  );

  autoTable(doc, {
    startY: nextY,
    head: [
      [
        "#",
        "Client Name",
        "Phone",
        "Email",
        "City",
        "Sites",
        "Total Value",
        "Status",
      ],
    ],
    body: clients.map((c, i) => [
      i + 1,
      c.name,
      c.phone,
      c.email || "-",
      c.city,
      c.siteCount,
      inr(c.totalValue),
      c.status.toUpperCase(),
    ]),
    ...TABLE_STYLES,
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      5: { halign: "center" },
      6: { halign: "right" },
      7: { halign: "center" },
    },
    didDrawCell: (data: any) => {
      if (data.column.index === 7 && data.section === "body") {
        const val = data.cell.raw as string;
        data.doc.setTextColor(
          val === "ACTIVE" ? 31 : 163,
          val === "ACTIVE" ? 158 : 45,
          val === "ACTIVE" ? 117 : 45,
        );
        data.doc.setFont("helvetica", "bold");
      }
    },
  });

  stampPageNumbers(doc);
  doc.save(
    `SiteSync_Clients_Report_${new Date().toISOString().split("T")[0]}.pdf`,
  );
}

// ─────────────────────────────────────────────────────────
//  5. PROFIT & LOSS REPORT
// ─────────────────────────────────────────────────────────
async function generatePnLReport(
  sites: Site[],
  invoices: Invoice[],
  workers: Worker[],
): Promise<void> {
  const { doc, autoTable, startY } = await buildDoc(
    "Profit & Loss Report",
    `Monthly P&L as of ${today()}`,
  );

  const totalRevenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((a, i) => a + i.amount, 0);
  const totalWages = workers.reduce((a, w) => a + w.dailyWage * 26, 0);
  const totalBudget = sites.reduce((a, s) => a + s.budget, 0);
  const netProfit = totalRevenue - totalWages;
  const margin = totalRevenue
    ? Math.round((netProfit / totalRevenue) * 100)
    : 0;

  const nextY = drawKpiRow(
    doc,
    [
      {
        label: "Total Revenue",
        value: inr(totalRevenue),
        color: [31, 158, 117],
      },
      { label: "Labour Cost", value: inr(totalWages), color: [163, 45, 45] },
      {
        label: "Net Profit",
        value: inr(netProfit),
        color: netProfit >= 0 ? [31, 158, 117] : [163, 45, 45],
      },
      { label: "Profit Margin", value: `${margin}%`, color: [108, 99, 255] },
      { label: "Total Budget", value: inr(totalBudget), color: [60, 52, 137] },
    ],
    startY,
  );

  // Revenue by client
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(60, 52, 137);
  doc.text("Revenue by Client", 14, nextY + 4);

  const clientMap: Record<string, number> = {};
  invoices
    .filter((i) => i.status === "paid")
    .forEach((i) => {
      clientMap[i.clientName] = (clientMap[i.clientName] ?? 0) + i.amount;
    });
  const byClient = Object.entries(clientMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, amount]) => [
      name,
      inr(amount),
      `${Math.round((amount / totalRevenue) * 100)}%`,
    ]);

  autoTable(doc, {
    startY: nextY + 7,
    head: [["Client", "Revenue", "Share %"]],
    body: byClient.length ? byClient : [["No paid invoices", "-", "-"]],
    ...TABLE_STYLES,
    columnStyles: {
      1: { halign: "right" },
      2: { halign: "center" },
    },
    tableWidth: 90,
  });

  // Site cost breakdown
  const afterClientTable =
    (doc as any).lastAutoTable?.finalY ?? nextY + 7 + byClient.length * 8 + 12;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(60, 52, 137);
  doc.text("Site Budget vs Progress", 14, afterClientTable + 4);

  autoTable(doc, {
    startY: afterClientTable + 7,
    head: [["Site Name", "City", "Budget", "Progress", "Status"]],
    body: sites.map((s) => [
      s.name,
      s.city,
      inr(s.budget),
      `${s.progress}%`,
      s.status.toUpperCase(),
    ]),
    ...TABLE_STYLES,
    columnStyles: {
      2: { halign: "right" },
      3: { halign: "center" },
      4: { halign: "center" },
    },
  });

  stampPageNumbers(doc);
  doc.save(`SiteSync_PnL_Report_${new Date().toISOString().split("T")[0]}.pdf`);
}

// ─────────────────────────────────────────────────────────
//  6. MATERIAL USAGE REPORT (per site notes/summary)
// ─────────────────────────────────────────────────────────
async function generateMaterialReport(
  sites: Site[],
  workers: Worker[],
): Promise<void> {
  const { doc, autoTable, startY } = await buildDoc(
    "Material & Resource Report",
    `Site resource allocation as of ${today()}`,
  );

  const totalWorkers = workers.length;
  const avgWage = totalWorkers
    ? Math.round(workers.reduce((a, w) => a + w.dailyWage, 0) / totalWorkers)
    : 0;
  const totalCapacity = workers.reduce((a, w) => a + w.dailyWage * 26, 0);

  const nextY = drawKpiRow(
    doc,
    [
      {
        label: "Total Workers",
        value: `${totalWorkers}`,
        color: [108, 99, 255],
      },
      { label: "Avg Daily Wage", value: inr(avgWage), color: [78, 205, 196] },
      {
        label: "Monthly Capacity",
        value: inr(totalCapacity),
        color: [60, 52, 137],
      },
      {
        label: "Active Sites",
        value: `${sites.filter((s) => s.status === "active").length}`,
        color: [31, 158, 117],
      },
    ],
    startY,
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(60, 52, 137);
  doc.text("Workers per Site", 14, nextY + 4);

  // Group workers by site
  const bySite: Record<string, { siteName: string; workers: Worker[] }> = {};
  workers.forEach((w) => {
    const key = w.siteId?.toString() ?? "unassigned";
    if (!bySite[key])
      bySite[key] = { siteName: w.siteName || "Unassigned", workers: [] };
    bySite[key].workers.push(w);
  });

  const siteRows = Object.values(bySite).map((g) => [
    g.siteName,
    `${g.workers.length}`,
    [...new Set(g.workers.map((w) => w.role))].join(", "),
    inr(g.workers.reduce((a, w) => a + w.dailyWage * 26, 0)),
    `${g.workers.filter((w) => w.todayStatus === "present").length} present`,
  ]);

  autoTable(doc, {
    startY: nextY + 7,
    head: [["Site", "Workers", "Roles", "Monthly Cost", "Today's Attendance"]],
    body: siteRows.length
      ? siteRows
      : [["No workers assigned", "-", "-", "-", "-"]],
    ...TABLE_STYLES,
    columnStyles: {
      1: { halign: "center" },
      3: { halign: "right" },
      4: { halign: "center" },
    },
  });

  stampPageNumbers(doc);
  doc.save(
    `SiteSync_Material_Report_${new Date().toISOString().split("T")[0]}.pdf`,
  );
}

// ─────────────────────────────────────────────────────────
//  Injectable Service — public API
// ─────────────────────────────────────────────────────────
@Injectable({ providedIn: "root" })
export class PdfService {
  async generateSiteReport(sites: Site[]) {
    await generateSiteReport(sites);
  }
  async generateLabourReport(workers: Worker[]) {
    await generateLabourReport(workers);
  }
  async generateFinanceReport(invoices: Invoice[]) {
    await generateFinanceReport(invoices);
  }
  async generateClientReport(clients: Client[]) {
    await generateClientReport(clients);
  }
  async generatePnLReport(
    sites: Site[],
    invoices: Invoice[],
    workers: Worker[],
  ) {
    await generatePnLReport(sites, invoices, workers);
  }
  async generateMaterialReport(sites: Site[], workers: Worker[]) {
    await generateMaterialReport(sites, workers);
  }
}
