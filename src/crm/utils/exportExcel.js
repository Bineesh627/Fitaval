import { format } from "date-fns";

const METHOD_LABELS = { upi: "UPI", bank_transfer: "Bank Transfer", cash: "Cash", card: "Card", other: "Other" };
const methodLabel = (m) => METHOD_LABELS[String(m || "cash").toLowerCase()] || String(m);

const isTrainerSalary = (t) =>
  t.salary_type === "trainer" || (t.category === "Salary" && t.description?.toLowerCase().includes("trainer"));

const categoryLabel = (t) =>
  t.category === "Salary" ? (isTrainerSalary(t) ? "Salary (Trainer)" : "Salary (Staff)") : t.category || "";

const INR = '"₹"#,##0.00';
const HEADER_FILL = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } };
const HEADER_FONT = { bold: true, color: { argb: "FFFFFFFF" } };
const THIN = { style: "thin", color: { argb: "FFE2E8F0" } };
const BORDER = { top: THIN, left: THIN, bottom: THIN, right: THIN };

function styleHeader(row) {
  row.eachCell((c) => {
    c.fill = HEADER_FILL;
    c.font = HEADER_FONT;
    c.alignment = { vertical: "middle", horizontal: "center" };
    c.border = BORDER;
  });
  row.height = 22;
}

/**
 * Builds and downloads a real .xlsx workbook (Transactions + Summary sheets).
 * exceljs is loaded lazily so it doesn't weigh down the main bundle.
 */
export async function exportTransactionsToExcel(transactions, { rangeLabel = "All Time" } = {}) {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  wb.creator = "Fitaval CRM";
  wb.created = new Date();

  const sorted = [...transactions].sort((a, b) => String(b.date).localeCompare(String(a.date)));

  // ---- Sheet 1: Transactions
  const ws = wb.addWorksheet("Transactions", { views: [{ state: "frozen", ySplit: 1 }] });
  ws.columns = [
    { header: "Transaction ID", key: "id", width: 24 },
    { header: "Date", key: "date", width: 13 },
    { header: "Type", key: "type", width: 11 },
    { header: "Category", key: "category", width: 20 },
    { header: "Income (₹)", key: "income", width: 15 },
    { header: "Expense (₹)", key: "expense", width: 15 },
    { header: "Payment Method", key: "method", width: 17 },
    { header: "Recipient / Member", key: "party", width: 22 },
    { header: "Description", key: "description", width: 56 },
  ];
  styleHeader(ws.getRow(1));

  sorted.forEach((t) => {
    const amount = Number(t.amount) || 0;
    const d = t.date ? new Date(t.date) : null;
    const row = ws.addRow({
      id: t.id || "",
      date: d && !Number.isNaN(d.getTime()) ? d : t.date || "",
      type: t.type === "income" ? "Income" : "Expense",
      category: categoryLabel(t),
      income: t.type === "income" ? amount : null,
      expense: t.type === "expense" ? amount : null,
      method: methodLabel(t.payment_method),
      party: t.recipient_name || t.member_name || "",
      description: t.description || "",
    });
    row.getCell("date").numFmt = "dd mmm yyyy";
    row.getCell("income").numFmt = INR;
    row.getCell("expense").numFmt = INR;
    row.getCell("income").font = { color: { argb: "FF15803D" }, bold: true };
    row.getCell("expense").font = { color: { argb: "FFDC2626" }, bold: true };
    row.getCell("description").alignment = { wrapText: true, vertical: "top" };
    row.eachCell((c) => (c.border = BORDER));
  });

  const last = sorted.length + 1;
  const totals = ws.addRow({
    category: "TOTAL",
    income: { formula: `SUM(E2:E${last})`, result: 0 },
    expense: { formula: `SUM(F2:F${last})`, result: 0 },
  });
  const net = ws.addRow({
    category: "NET (Income − Expense)",
    income: { formula: `E${last + 1}-F${last + 1}`, result: 0 },
  });
  [totals, net].forEach((r) => {
    r.font = { bold: true };
    r.eachCell((c) => {
      c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };
      c.border = BORDER;
    });
    r.getCell("income").numFmt = INR;
    r.getCell("expense").numFmt = INR;
  });
  ws.autoFilter = { from: "A1", to: `I${last}` };

  // ---- Sheet 2: Summary
  const sm = wb.addWorksheet("Summary");
  sm.columns = [
    { header: "Item", key: "k", width: 30 },
    { header: "Amount (₹)", key: "v", width: 18 },
    { header: "Transactions", key: "n", width: 14 },
  ];
  styleHeader(sm.getRow(1));
  const sum = (type) => sorted.filter((t) => t.type === type).reduce((s, t) => s + (Number(t.amount) || 0), 0);
  const count = (type) => sorted.filter((t) => t.type === type).length;
  const rows = [
    ["Report period", rangeLabel, null],
    ["Generated on", format(new Date(), "dd MMM yyyy, hh:mm a"), null],
    ["Total income", sum("income"), count("income")],
    ["Total expense", sum("expense"), count("expense")],
    ["Net balance", sum("income") - sum("expense"), sorted.length],
  ];
  rows.forEach(([k, v, n]) => {
    const r = sm.addRow({ k, v, n });
    r.getCell("k").font = { bold: true };
    if (typeof v === "number") r.getCell("v").numFmt = INR;
    r.eachCell((c) => (c.border = BORDER));
  });

  const byCat = {};
  sorted.forEach((t) => {
    const key = `${t.type}|${categoryLabel(t)}`;
    byCat[key] = byCat[key] || { type: t.type, cat: categoryLabel(t), total: 0, n: 0 };
    byCat[key].total += Number(t.amount) || 0;
    byCat[key].n += 1;
  });
  sm.addRow({});
  const head = sm.addRow({ k: "Breakdown by category", v: "Amount (₹)", n: "Transactions" });
  styleHeader(head);
  Object.values(byCat)
    .sort((a, b) => a.type.localeCompare(b.type) || b.total - a.total)
    .forEach((c) => {
      const r = sm.addRow({ k: `${c.type === "income" ? "Income" : "Expense"} — ${c.cat}`, v: c.total, n: c.n });
      r.getCell("v").numFmt = INR;
      r.getCell("v").font = { color: { argb: c.type === "income" ? "FF15803D" : "FFDC2626" } };
      r.eachCell((cell) => (cell.border = BORDER));
    });

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `fitaval_finance_${format(new Date(), "yyyyMMdd_HHmmss")}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return sorted.length;
}
