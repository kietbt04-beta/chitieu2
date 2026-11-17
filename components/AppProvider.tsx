"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Data, EMPTY, Expense, Shift, Table, Transfer, Wallet } from "@/lib/types";
import { Repo, localRepo, supabaseRepo } from "@/lib/repo";
import { getSupabase, supabaseConfigured } from "@/lib/supabase";
import { Period, getRange } from "@/lib/period";
import { totalBalance, walletBalance } from "@/lib/calc";
import { fmt, uid } from "@/lib/format";

type Row = Wallet | Expense | Shift | Transfer;
interface Ctx {
  data: Data; ready: boolean; local: boolean; email: string | null;
  period: Period; shift: number; setPeriod(p: Period): void; setShift(n: number): void; range: ReturnType<typeof getRange>;
  save(table: Table, row: Row): Promise<boolean>;
  remove(table: Table, id: string): Promise<boolean>;
  saveTransfer(t: Omit<Transfer, "id"> & { id?: string }): Promise<boolean>;
  toast(msg: string): void; logout(): Promise<void>;
  dark: boolean; toggleDark(): void;
}
const C = createContext<Ctx>(null as never);
export const useApp = () => useContext(C);
export const useWalletName = () => { const { data } = useApp(); return (id: string | null) => data.wallets.find((w) => w.id === id)?.name ?? "—"; };

export default function AppProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter(); const path = usePathname();
  const [data, setData] = useState<Data>(EMPTY);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [period, setPeriodState] = useState<Period>("Tháng");
  const [shift, setShift] = useState(0);
  const [msg, setMsg] = useState("");
  const [dark, setDark] = useState(false);
  const repo = useRef<Repo | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const dataRef = useRef(data); dataRef.current = data;

  const toast = useCallback((m: string) => { setMsg(m); clearTimeout(timer.current); timer.current = setTimeout(() => setMsg(""), 3500); }, []);

  useEffect(() => { try { if (localStorage.getItem("chitieu2:dark") === "1") setDark(true); } catch {} }, []);
  useEffect(() => { document.body.classList.toggle("dark", dark); }, [dark]);

  useEffect(() => {
    let off = false;
    (async () => {
      try {
        if (supabaseConfigured) {
          const sb = getSupabase()!;
          const { data: s } = await sb.auth.getSession();
          if (!s.session) { router.replace("/login"); return; }
          setEmail(s.session.user.email ?? null);
          repo.current = supabaseRepo();
        } else repo.current = localRepo();
        const d = await repo.current.load();
        if (!off) { setData(d); setReady(true); }
      } catch (e) { if (!off) { toast("Không tải được dữ liệu: " + (e as Error).message); setReady(true); } }
    })();
    return () => { off = true; };
  }, [router, toast]);

  const persist = useCallback(async (apply: (d: Data) => Data, run: () => Promise<void>) => {
    const before = dataRef.current;
    setData(apply(before));
    try { await run(); return true; }
    catch (e) { setData(before); toast("Lỗi lưu dữ liệu: " + (e as Error).message); return false; }
  }, [toast]);

  const save = useCallback(async (table: Table, row: Row) => {
    const apply = (d: Data): Data => {
      const list = d[table] as Row[]; const i = list.findIndex((x) => x.id === row.id);
      const next = i >= 0 ? list.map((x) => (x.id === row.id ? row : x)) : [row, ...list];
      return { ...d, [table]: next } as Data;
    };
    return persist(apply, () => repo.current!.upsert(table, row));
  }, [persist]);

  const remove = useCallback(async (table: Table, id: string) =>
    persist((d) => ({ ...d, [table]: (d[table] as Row[]).filter((x) => x.id !== id) }) as Data, () => repo.current!.remove(table, id)), [persist]);

  const saveTransfer: Ctx["saveTransfer"] = useCallback(async (t) => {
    const d = dataRef.current;
    if (t.from_wallet === t.to_wallet) { toast("Hai ví phải khác nhau."); return false; }
    if (!(t.amount > 0)) { toast("Số tiền phải lớn hơn 0."); return false; }
    const old = t.id ? d.transfers.find((x) => x.id === t.id) : undefined;
    const avail = walletBalance(d, t.from_wallet) + (old && old.from_wallet === t.from_wallet ? old.amount : 0);
    if (t.amount > avail) { toast(`Số dư ví nguồn không đủ (còn ${fmt(avail)}).`); return false; }
    return save("transfers", { ...t, id: t.id ?? uid() } as Transfer);
  }, [save, toast]);

  const logout = useCallback(async () => { await getSupabase()?.auth.signOut(); router.replace("/login"); }, [router]);
  const setPeriod = (p: Period) => { setPeriodState(p); setShift(0); };
  const range = useMemo(() => getRange(period, shift), [period, shift]);
  const toggleDark = () => setDark((v) => { try { localStorage.setItem("chitieu2:dark", v ? "0" : "1"); } catch {} return !v; });

  void path; void totalBalance;
  const value: Ctx = { data, ready, local: !supabaseConfigured, email, period, shift, setPeriod, setShift, range, save, remove, saveTransfer, toast, logout, dark, toggleDark };
  return (
    <C.Provider value={value}>
      {children}
      <div className={`snack ${msg ? "show" : ""}`} role="status">{msg}</div>
    </C.Provider>
  );
}
export type { Expense, Shift, Wallet };
