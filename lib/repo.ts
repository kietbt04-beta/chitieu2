import { Data, EMPTY, Expense, Salary, Shift, Table } from "./types";
import { getSupabase } from "./supabase";

export interface Repo {
  load(): Promise<Data>;
  upsert(table: Table, row: Expense | Shift | Salary): Promise<void>;
  remove(table: Table, id: string): Promise<void>;
}

/** Chế độ cục bộ: lưu trong trình duyệt, dùng để xem thử khi chưa nối Supabase. */
export function localRepo(): Repo {
  const KEY = "chitieu2:local:v2";
  const read = (): Data => {
    try { const raw = localStorage.getItem(KEY); if (raw) { const p = JSON.parse(raw); return { expenses: p.expenses ?? [], shifts: p.shifts ?? [], salaries: p.salaries ?? [] }; } } catch {}
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
    async remove(table, id) { const d = read(); (d as any)[table] = (d[table] as { id: string }[]).filter((x) => x.id !== id); write(d); },
  };
}

/** Chế độ Supabase: dữ liệu theo từng tài khoản nhờ RLS. */
export function supabaseRepo(): Repo {
  const sb = getSupabase()!;
  const fail = (e: { message: string } | null) => { if (e) throw new Error(e.message); };
  const pick = <T extends Record<string, unknown>>(r: T, keys: string[]) => Object.fromEntries(keys.map((k) => [k, r[k]]));
  return {
    async load() {
      const [e, s, sal] = await Promise.all([
        sb.from("expenses").select("*").order("date", { ascending: false }),
        sb.from("shifts").select("*").order("date", { ascending: false }),
        sb.from("salaries").select("*").order("month", { ascending: false }),
      ]);
      fail(e.error); fail(s.error);
      // Nếu chưa chạy SQL 0003 (chưa có bảng salaries) thì bỏ qua, không làm hỏng cả web.
      const salaries = sal.error ? [] : ((sal.data ?? []).map((r) => pick(r, ["id", "month", "amount"])) as unknown as Salary[]);
      return {
        salaries,
        expenses: (e.data ?? []).map((r) => pick(r, ["id", "date", "description", "category", "amount"])) as unknown as Expense[],
        shifts: (s.data ?? []).map((r) => pick(r, ["id", "date", "hours", "orders", "earnings", "fuel_cost", "other_cost"])) as unknown as Shift[],
      };
    },
    async upsert(table, row) { fail((await sb.from(table).upsert(row as never)).error); },
    async remove(table, id) { fail((await sb.from(table).delete().eq("id", id)).error); },
  };
}
