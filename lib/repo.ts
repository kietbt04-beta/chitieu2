import { Data, EMPTY, Debt, DebtPayment, Expense, Income, Row, Salary, Shift, Table } from "./types";
import { getSupabase } from "./supabase";

export interface Repo {
  load(): Promise<Data>;
  upsert(table: Table, row: Row): Promise<void>;
  remove(table: Table, id: string): Promise<void>;
}

/** Chế độ cục bộ: lưu trong trình duyệt, dùng để xem thử khi chưa nối Supabase. */
export function localRepo(): Repo {
  const KEY = "chitieu2:local:v2";
  const read = (): Data => {
    try { const raw = localStorage.getItem(KEY); if (raw) { const p = JSON.parse(raw); return { expenses: p.expenses ?? [], shifts: p.shifts ?? [], salaries: (p.salaries ?? []).map((x: Salary) => ({ ...x, installment: x.installment === 2 ? 2 : 1 })), incomes: p.incomes ?? [], debts: p.debts ?? [], debtPayments: p.debtPayments ?? [] }; } } catch {}
    return { ...EMPTY };
  };
  const write = (d: Data) => { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch {} };
  return {
    async load() { return read(); },
    async upsert(table, row) {
      const d = read(); const list = d[table] as { id: string }[];
      const i = list.findIndex((x) => x.id === row.id);
      if (i >= 0) list[i] = row; else list.unshift(row);
      write(d);
    },
    async remove(table, id) { const d = read(); (d as any)[table] = (d[table] as { id: string }[]).filter((x) => x.id !== id); if (table === "debts") d.debtPayments = d.debtPayments.filter((p) => p.debt_id !== id); write(d); },
  };
}

/** Chế độ Supabase: dữ liệu theo từng tài khoản nhờ RLS. */
export function supabaseRepo(): Repo {
  const sb = getSupabase()!;
  const fail = (e: { message: string } | null) => { if (e) throw new Error(e.message); };
  const TABLE: Record<Table, string> = { expenses: "expenses", shifts: "shifts", salaries: "salaries", incomes: "incomes", debts: "debts", debtPayments: "debt_payments" };
  const pick = <T extends Record<string, unknown>>(r: T, keys: string[]) => Object.fromEntries(keys.map((k) => [k, r[k]]));
  return {
    async load() {
      const [e, s, sal, inc, deb, pay] = await Promise.all([
        sb.from("expenses").select("*").order("date", { ascending: false }),
        sb.from("shifts").select("*").order("date", { ascending: false }),
        sb.from("salaries").select("*").order("month", { ascending: false }),
        sb.from("incomes").select("*").order("date", { ascending: false }),
        sb.from("debts").select("*").order("date", { ascending: false }),
        sb.from("debt_payments").select("*").order("date", { ascending: false }),
      ]);
      fail(e.error); fail(s.error);
      // Nếu chưa chạy SQL 0003 (chưa có bảng salaries) thì bỏ qua, không làm hỏng cả web.
      const salaries = sal.error ? [] : ((sal.data ?? []).map((r) => ({ id: r.id, month: r.month, installment: (Number(r.installment) === 2 ? 2 : 1) as 1 | 2, amount: Number(r.amount) })));
      // Các bảng của bản 0005 có thể chưa tồn tại nếu chưa chạy SQL: bỏ qua thay vì làm hỏng cả web.
      const incomes = inc.error ? [] : ((inc.data ?? []).map((r) => ({ id: r.id, date: r.date, source: r.source, amount: Number(r.amount) })) as Income[]);
      const debts = deb.error ? [] : ((deb.data ?? []).map((r) => ({ id: r.id, name: r.name, total: Number(r.total), date: r.date })) as Debt[]);
      const debtPayments = pay.error ? [] : ((pay.data ?? []).map((r) => ({ id: r.id, debt_id: r.debt_id, date: r.date, amount: Number(r.amount) })) as DebtPayment[]);
      return {
        salaries, incomes, debts, debtPayments,
        expenses: (e.data ?? []).map((r) => pick(r, ["id", "date", "description", "category", "amount"])) as unknown as Expense[],
        shifts: (s.data ?? []).map((r) => pick(r, ["id", "date", "hours", "orders", "earnings", "fuel_cost", "other_cost"])) as unknown as Shift[],
      };
    },
    async upsert(table, row) { fail((await sb.from(TABLE[table]).upsert(row as never)).error); },
    async remove(table, id) { fail((await sb.from(TABLE[table]).delete().eq("id", id)).error); },
  };
}
