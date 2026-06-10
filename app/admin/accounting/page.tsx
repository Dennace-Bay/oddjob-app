"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

// ─── Types ─────────────────────────────────────────────────────────────────────

type DateRange = "this_month" | "last_month" | "all_time";

type BookingRevenue = {
  id: string;
  customer_name: string;
  preferred_date: string;
  estimated_price: number | null;
  actual_price: number | null;
  status: string;
  paid: boolean;
  services: { name: string } | null;
};

type Expense = {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
};

type WorkerPayment = {
  id: string;
  date: string;
  worker_name: string;
  hours_worked: number;
  hourly_rate: number;
  paid: boolean;
};

const EXPENSE_CATEGORIES = ["Supplies", "Fuel", "Equipment", "Marketing", "Other"] as const;

const STATUS_STYLES: Record<string, string> = {
  pending: "border-yellow-200 bg-yellow-50 text-yellow-700",
  confirmed: "border-blue-200 bg-blue-50 text-blue-700",
  "in-progress": "border-purple-200 bg-purple-50 text-purple-700",
  completed: "border-green-200 bg-green-50 text-green-700",
  cancelled: "border-red-200 bg-red-50 text-red-700",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";

function fmt(amount: number) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" }).format(amount);
}

function fmtDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getDateBounds(range: DateRange): { from: string | null; to: string | null } {
  const now = new Date();
  if (range === "this_month") {
    const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
    return { from, to };
  }
  if (range === "last_month") {
    const from = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10);
    const to = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().slice(0, 10);
    return { from, to };
  }
  return { from: null, to: null };
}

function downloadCSV(filename: string, rows: string[][]) {
  const csv = rows
    .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Summary Cards ─────────────────────────────────────────────────────────────

function SummaryCards({
  collected,
  pending,
  expenses,
  workerPay,
}: {
  collected: number;
  pending: number;
  expenses: number;
  workerPay: number;
}) {
  const net = collected - expenses - workerPay;
  const cards = [
    { label: "Collected", value: collected, sub: pending > 0 ? `${fmt(pending)} pending` : null, color: "text-green-600", bg: "bg-green-50", border: "border-green-100" },
    { label: "Expenses", value: expenses, sub: null, color: "text-red-500", bg: "bg-red-50", border: "border-red-100" },
    { label: "Worker Pay", value: workerPay, sub: null, color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-100" },
    {
      label: "Net Profit",
      value: net,
      sub: null,
      color: net >= 0 ? "text-indigo-600" : "text-red-600",
      bg: net >= 0 ? "bg-indigo-50" : "bg-red-50",
      border: net >= 0 ? "border-indigo-100" : "border-red-100",
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map(({ label, value, sub, color, bg, border }) => (
        <div key={label} className={`rounded-2xl border ${border} ${bg} p-5 shadow-sm`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
          <p className={`mt-1 text-2xl font-bold ${color}`}>{fmt(value)}</p>
          {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
        </div>
      ))}
    </div>
  );
}

// ─── Revenue Section ───────────────────────────────────────────────────────────

function RevenueSection({
  bookings,
  range,
  onRefresh,
}: {
  bookings: BookingRevenue[];
  range: DateRange;
  onRefresh: () => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  function effective(b: BookingRevenue) {
    return b.actual_price ?? b.estimated_price ?? 0;
  }

  async function togglePaid(id: string, paid: boolean) {
    const supabase = createClient();
    await supabase.from("bookings").update({ paid }).eq("id", id);
    onRefresh();
  }

  function startEdit(b: BookingRevenue) {
    setEditingId(b.id);
    setEditValue(String(b.actual_price ?? b.estimated_price ?? ""));
  }

  async function saveActualPrice(id: string) {
    const val = parseFloat(editValue);
    const supabase = createClient();
    await supabase
      .from("bookings")
      .update({ actual_price: isNaN(val) ? null : val })
      .eq("id", id);
    setEditingId(null);
    onRefresh();
  }

  function exportCSV() {
    const rows = [
      ["Date", "Customer", "Service", "Estimated ($)", "Actual ($)", "Job Status", "Payment"],
      ...bookings.map((b) => [
        b.preferred_date,
        b.customer_name,
        b.services?.name ?? "",
        String(b.estimated_price ?? ""),
        String(b.actual_price ?? ""),
        b.status,
        b.paid ? "Paid" : "Unpaid",
      ]),
    ];
    downloadCSV(`oddjob-revenue-${range}.csv`, rows);
  }

  const collected = bookings.filter((b) => b.paid).reduce((sum, b) => sum + effective(b), 0);
  const pending = bookings.filter((b) => !b.paid).reduce((sum, b) => sum + effective(b), 0);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-4">
        <p className="text-sm text-gray-400">
          {bookings.length} booking{bookings.length !== 1 ? "s" : ""} · {fmt(collected)} collected · {fmt(pending)} pending
        </p>
        {bookings.length > 0 && (
          <button
            onClick={exportCSV}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50"
          >
            Export CSV
          </button>
        )}
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-20 text-center">
          <p className="text-sm text-gray-400">No revenue records for this period.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Date", "Customer", "Service", "Amount", "Job Status", "Payment"].map((col) => (
                  <th
                    key={col}
                    className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 text-gray-500">{fmtDate(b.preferred_date)}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">{b.customer_name}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600">{b.services?.name ?? "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {editingId === b.id ? (
                      <input
                        autoFocus
                        type="number"
                        step="0.01"
                        min="0"
                        className="w-24 rounded border border-indigo-300 px-2 py-1 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => saveActualPrice(b.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveActualPrice(b.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                      />
                    ) : (
                      <button
                        onClick={() => startEdit(b)}
                        className="group flex items-center gap-1.5 text-left"
                        title="Click to enter actual amount"
                      >
                        <span className={`font-semibold ${b.actual_price != null ? "text-green-600" : "text-green-400"}`}>
                          {fmt(effective(b))}
                        </span>
                        {b.actual_price == null && (
                          <span className="text-xs text-gray-400">est.</span>
                        )}
                        <span className="invisible text-xs text-gray-400 group-hover:visible">✎</span>
                      </button>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${
                        STATUS_STYLES[b.status] ?? "border-gray-200 bg-gray-50 text-gray-500"
                      }`}
                    >
                      {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <button
                      onClick={() => togglePaid(b.id, !b.paid)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                        b.paid
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-orange-100 text-orange-600 hover:bg-orange-200"
                      }`}
                    >
                      {b.paid ? "Paid" : "Unpaid"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Expenses Section ──────────────────────────────────────────────────────────

function ExpensesSection({
  expenses,
  range,
  onRefresh,
}: {
  expenses: Expense[];
  range: DateRange;
  onRefresh: () => void;
}) {
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({
    date: new Date().toISOString().slice(0, 10),
    category: "Supplies",
    description: "",
    amount: "",
  });

  function setField(field: string, value: string) {
    setDraft((d) => ({ ...d, [field]: value }));
  }

  async function saveExpense() {
    if (!draft.description.trim() || !draft.amount) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("expenses").insert({
      date: draft.date,
      category: draft.category,
      description: draft.description.trim(),
      amount: parseFloat(draft.amount),
    });
    setSaving(false);
    setAdding(false);
    setDraft({ date: new Date().toISOString().slice(0, 10), category: "Supplies", description: "", amount: "" });
    onRefresh();
  }

  async function deleteExpense(id: string) {
    const supabase = createClient();
    await supabase.from("expenses").delete().eq("id", id);
    onRefresh();
  }

  function exportCSV() {
    const rows = [
      ["Date", "Category", "Description", "Amount ($)"],
      ...expenses.map((e) => [e.date, e.category, e.description, String(e.amount)]),
    ];
    downloadCSV(`oddjob-expenses-${range}.csv`, rows);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        {expenses.length > 0 && (
          <button
            onClick={exportCSV}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50"
          >
            Export CSV
          </button>
        )}
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="ml-auto rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            + Add Expense
          </button>
        )}
      </div>

      {adding && (
        <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-6">
          <h3 className="mb-4 text-sm font-bold text-indigo-700">New Expense</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Date</label>
              <input
                type="date"
                className={inputCls}
                value={draft.date}
                onChange={(e) => setField("date", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Category</label>
              <select
                className={inputCls}
                value={draft.category}
                onChange={(e) => setField("category", e.target.value)}
              >
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Description</label>
              <input
                className={inputCls}
                value={draft.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="e.g. Garden gloves x10"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Amount ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className={inputCls}
                value={draft.amount}
                onChange={(e) => setField("amount", e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={saveExpense}
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Add Expense"}
            </button>
            <button
              onClick={() => setAdding(false)}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-500 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {expenses.length === 0 && !adding ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-20 text-center">
          <p className="text-sm text-gray-400">No expenses recorded for this period.</p>
        </div>
      ) : (
        expenses.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {["Date", "Category", "Description", "Amount", ""].map((col, i) => (
                    <th
                      key={i}
                      className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 text-gray-500">{fmtDate(e.date)}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                        {e.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{e.description}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-red-500">{fmt(e.amount)}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <button
                        onClick={() => deleteExpense(e.id)}
                        className="rounded-lg px-2.5 py-1 text-xs font-semibold text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}

// ─── Worker Pay Section ────────────────────────────────────────────────────────

function WorkerPaySection({
  payments,
  range,
  onRefresh,
}: {
  payments: WorkerPayment[];
  range: DateRange;
  onRefresh: () => void;
}) {
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({
    date: new Date().toISOString().slice(0, 10),
    worker_name: "",
    hours_worked: "",
    hourly_rate: "20",
  });

  function setField(field: string, value: string) {
    setDraft((d) => ({ ...d, [field]: value }));
  }

  const previewTotal =
    draft.hours_worked && draft.hourly_rate
      ? parseFloat(draft.hours_worked) * parseFloat(draft.hourly_rate)
      : null;

  async function savePayment() {
    if (!draft.worker_name.trim() || !draft.hours_worked) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("worker_payments").insert({
      date: draft.date,
      worker_name: draft.worker_name.trim(),
      hours_worked: parseFloat(draft.hours_worked),
      hourly_rate: parseFloat(draft.hourly_rate) || 20,
      paid: false,
    });
    setSaving(false);
    setAdding(false);
    setDraft({ date: new Date().toISOString().slice(0, 10), worker_name: "", hours_worked: "", hourly_rate: "20" });
    onRefresh();
  }

  async function togglePaid(id: string, paid: boolean) {
    const supabase = createClient();
    await supabase.from("worker_payments").update({ paid }).eq("id", id);
    onRefresh();
  }

  async function deletePayment(id: string) {
    const supabase = createClient();
    await supabase.from("worker_payments").delete().eq("id", id);
    onRefresh();
  }

  function exportCSV() {
    const rows = [
      ["Date", "Worker", "Hours", "Rate ($/hr)", "Total ($)", "Status"],
      ...payments.map((p) => [
        p.date,
        p.worker_name,
        String(p.hours_worked),
        String(p.hourly_rate),
        String(p.hours_worked * p.hourly_rate),
        p.paid ? "Paid" : "Unpaid",
      ]),
    ];
    downloadCSV(`oddjob-worker-pay-${range}.csv`, rows);
  }

  const unpaidTotal = payments
    .filter((p) => !p.paid)
    .reduce((sum, p) => sum + p.hours_worked * p.hourly_rate, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        {unpaidTotal > 0 && (
          <p className="text-sm font-semibold text-orange-600">{fmt(unpaidTotal)} unpaid</p>
        )}
        {payments.length > 0 && (
          <button
            onClick={exportCSV}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50"
          >
            Export CSV
          </button>
        )}
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="ml-auto rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
          >
            + Log Worker Pay
          </button>
        )}
      </div>

      {adding && (
        <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-6">
          <h3 className="mb-4 text-sm font-bold text-indigo-700">Log Worker Pay</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Date</label>
              <input
                type="date"
                className={inputCls}
                value={draft.date}
                onChange={(e) => setField("date", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Worker Name</label>
              <input
                className={inputCls}
                value={draft.worker_name}
                onChange={(e) => setField("worker_name", e.target.value)}
                placeholder="e.g. Alex S."
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Hours Worked</label>
              <input
                type="number"
                min="0"
                step="0.5"
                className={inputCls}
                value={draft.hours_worked}
                onChange={(e) => setField("hours_worked", e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-600">Hourly Rate ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className={inputCls}
                value={draft.hourly_rate}
                onChange={(e) => setField("hourly_rate", e.target.value)}
              />
            </div>
          </div>
          {previewTotal !== null && !isNaN(previewTotal) && (
            <p className="mt-3 text-sm font-semibold text-indigo-700">Total: {fmt(previewTotal)}</p>
          )}
          <div className="mt-4 flex gap-2">
            <button
              onClick={savePayment}
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Log Pay"}
            </button>
            <button
              onClick={() => setAdding(false)}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-500 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {payments.length === 0 && !adding ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-20 text-center">
          <p className="text-sm text-gray-400">No worker pay records for this period.</p>
        </div>
      ) : (
        payments.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {["Date", "Worker", "Hours", "Rate", "Total", "Status", ""].map((col, i) => (
                    <th
                      key={i}
                      className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 text-gray-500">{fmtDate(p.date)}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">{p.worker_name}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">{p.hours_worked}h</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">{fmt(p.hourly_rate)}/hr</td>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-orange-500">
                      {fmt(p.hours_worked * p.hourly_rate)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <button
                        onClick={() => togglePaid(p.id, !p.paid)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                          p.paid
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-orange-100 text-orange-600 hover:bg-orange-200"
                        }`}
                      >
                        {p.paid ? "Paid" : "Unpaid"}
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <button
                        onClick={() => deletePayment(p.id)}
                        className="rounded-lg px-2.5 py-1 text-xs font-semibold text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

const RANGE_LABELS: Record<DateRange, string> = {
  this_month: "This Month",
  last_month: "Last Month",
  all_time: "All Time",
};

export default function AccountingPage() {
  const router = useRouter();
  const [range, setRange] = useState<DateRange>("this_month");
  const [activeTab, setActiveTab] = useState<"revenue" | "expenses" | "worker_pay">("revenue");

  const [bookings, setBookings] = useState<BookingRevenue[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payments, setPayments] = useState<WorkerPayment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { from, to } = getDateBounds(range);

    let bookingsQuery = supabase
      .from("bookings")
      .select("id, customer_name, preferred_date, estimated_price, actual_price, status, paid, services(name)")
      .neq("status", "cancelled")
      .not("estimated_price", "is", null)
      .order("preferred_date", { ascending: false });
    if (from) bookingsQuery = bookingsQuery.gte("preferred_date", from);
    if (to) bookingsQuery = bookingsQuery.lte("preferred_date", to);

    let expensesQuery = supabase.from("expenses").select("*").order("date", { ascending: false });
    if (from) expensesQuery = expensesQuery.gte("date", from);
    if (to) expensesQuery = expensesQuery.lte("date", to);

    let paymentsQuery = supabase.from("worker_payments").select("*").order("date", { ascending: false });
    if (from) paymentsQuery = paymentsQuery.gte("date", from);
    if (to) paymentsQuery = paymentsQuery.lte("date", to);

    const [bookingsRes, expensesRes, paymentsRes] = await Promise.all([
      bookingsQuery,
      expensesQuery,
      paymentsQuery,
    ]);

    setBookings((bookingsRes.data as unknown as BookingRevenue[]) ?? []);
    setExpenses((expensesRes.data as Expense[]) ?? []);
    setPayments((paymentsRes.data as WorkerPayment[]) ?? []);
    setLoading(false);
  }, [range]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  const collected = bookings
    .filter((b) => b.paid)
    .reduce((sum, b) => sum + (b.actual_price ?? b.estimated_price ?? 0), 0);
  const pending = bookings
    .filter((b) => !b.paid)
    .reduce((sum, b) => sum + (b.actual_price ?? b.estimated_price ?? 0), 0);
  const expensesTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
  const workerPayTotal = payments.reduce((sum, p) => sum + p.hours_worked * p.hourly_rate, 0);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-screen-xl px-6 py-10">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-sm text-gray-400 transition-colors hover:text-gray-600">
              ← Dashboard
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Accounting</h1>
          </div>
          <button
            onClick={handleSignOut}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-500 transition-colors hover:bg-gray-50"
          >
            Sign out
          </button>
        </div>

        {/* Date range filter */}
        <div className="mb-6 flex w-fit gap-1 rounded-xl bg-gray-100 p-1">
          {(Object.keys(RANGE_LABELS) as DateRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                range === r ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {RANGE_LABELS[r]}
            </button>
          ))}
        </div>

        {/* Summary cards */}
        <div className="mb-8">
          {loading ? (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-100" />
              ))}
            </div>
          ) : (
            <SummaryCards collected={collected} pending={pending} expenses={expensesTotal} workerPay={workerPayTotal} />
          )}
        </div>

        {/* Section tabs */}
        <div className="mb-6 flex w-fit gap-1 rounded-xl bg-gray-100 p-1">
          {(["revenue", "expenses", "worker_pay"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "worker_pay" ? "Worker Pay" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="h-48 animate-pulse rounded-2xl bg-gray-100" />
        ) : (
          <>
            {activeTab === "revenue" && (
              <RevenueSection bookings={bookings} range={range} onRefresh={fetchAll} />
            )}
            {activeTab === "expenses" && (
              <ExpensesSection expenses={expenses} range={range} onRefresh={fetchAll} />
            )}
            {activeTab === "worker_pay" && (
              <WorkerPaySection payments={payments} range={range} onRefresh={fetchAll} />
            )}
          </>
        )}
      </div>
    </main>
  );
}
