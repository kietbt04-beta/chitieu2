import { Data, EMPTY, Expense, Shift, Table, Transfer, Wallet } from "./types";
import { getSupabase } from "./supabase";
import { uid } from "./format";

export interface Repo {
  load(): Promise<Data>;
  upsert(table: Table, row: Wallet | Expense | Shift | Transfer): Promise<void>;
  remove(table: Table, id: string): Promise<void>;
}

const defaultWallets = (): Wallet[] => [
  { id: uid(), name: "Tiền mặt", kind: "cash", opening_balance: 0 },
  { id: uid(), name: "Ngân hàng", kind: "bank", opening_balance: 0 },
];

/** Chế độ cục bộ: lưu trong trình duyệt, dùng để xem thử khi chưa nối Supabase. */
export function localRepo(): Repo {
  const KEY = "chitieu2:local:v1";
  const read = (): Data => {
    try { const raw = localStorage.getItem(KEY); if (raw) return { ...EMPTY, ...JSON.parse(raw) }; } catch {}
    return { ...EMPTY, wallets: defaultWallets() };
  };
  const write = (d: Data) => { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch {} };
  return {
    async load() { const d = read(); write(d); return d; },
    async upsert(table, row) {
      const d = read(); const list = d[table] as { id: string }[];
      const i = list.findIndex((x) => x.id === row.id);
      if (i >= 0) list[i] = row; else list.push(row);
      write(d);
    },
    async remove(table, id) { const d = read(); (d as any)[table] = (d[table] as { id: string }[]).filter((x) => x.id !== id); write(d); },
  };
}

/** Chế độ Supabase: dữ liệu theo từng tài khoản nhờ RLS. */
export function supabaseRepo(): Repo {
  const sb = getSupabase()!;
  const fail = (e: { message: string } | null) => { if (e) throw new Error(e.message); };
  return {
    async load() {
      const [w, e, s, t] = await Promise.all([
        sb.from("wallets").select("*").order("created_at"),
        sb.from("expenses").select("*").order("date", { ascending: false }),
        sb.from("shifts").select("*").order("date", { ascending: false }),
        sb.from("transfers").select("*").order("date", { ascending: false }),
      ]);
      [w, e, s, t].forEach((r) => fail(r.error));
      let wallets = (w.data ?? []) as Wallet[];
      if (wallets.length === 0) {
        const seed = defaultWallets();
        const { error } = await sb.from("wallets").insert(seed);
        fail(error);
        wallets = seed;
      }
      return { wallets, expenses: (e.data ?? []) as Data["expenses"], shifts: (s.data ?? []) as Data["shifts"], transfers: (t.data ?? []) as Data["transfers"] };
    },
    async upsert(table, row) { fail((await sb.from(table).upsert(row as never)).error); },
    async remove(table, id) { fail((await sb.from(table).delete().eq("id", id)).error); },
  };
}
