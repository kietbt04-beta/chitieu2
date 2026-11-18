import { Data, CATS, FUEL_CAT } from "./types";
import { byCategory, debtStatus, shiftProfit, sum } from "./calc";
import { fmt, iso, viDate } from "./format";
import { monthForecast } from "./forecast";
import { getRange } from "./period";

/**
 * Trợ lý chạy hoàn toàn trong web: hiểu câu hỏi tiếng Việt (có hoặc không dấu), đọc dữ liệu của bạn và trả lời.
 * Không gửi dữ liệu ra ngoài. Hiểu: khoảng thời gian, danh mục, từ khóa khoản chi, so sánh kỳ trước, câu hỏi nối tiếp, hướng dẫn dùng web.
 */
export interface Ctx { metric?: Metric; period?: Span }
export type Metric = "spent" | "shopee" | "salary" | "other" | "income" | "left" | "profit" | "fuel" | "shifts";
interface Span { start: string; end: string; label: string; days: number; explicit: boolean }

export const SUGGESTIONS = [
  "Tháng này tôi chi bao nhiêu?", "Hôm qua tôi tiêu những gì?", "Tiền ăn uống tháng trước?", "So với tháng trước tôi chi nhiều hơn hay ít hơn?",
  "Thu nhập ShopeeFood 7 ngày qua", "Tôi còn nợ bao nhiêu?", "Dự đoán chi tiêu tháng này", "Làm sao để nhập lương 2 đợt?",
];

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9/ ]+/g, " ").replace(/\s+/g, " ").trim();
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const dayDiff = (a: string, b: string) => Math.round((new Date(b + "T00:00:00").getTime() - new Date(a + "T00:00:00").getTime()) / 86400000) + 1;

function parseSpan(t: string, now: Date): Span | null {
  const mk = (r: { start: string; end: string; label: string }): Span => ({ ...r, days: dayDiff(r.start, r.end), explicit: true });
  let m: RegExpMatchArray | null;
  if (t.includes("hom nay")) return mk({ start: iso(now), end: iso(now), label: "hôm nay" });
  if (t.includes("hom qua")) { const d = iso(addDays(now, -1)); return mk({ start: d, end: d, label: "hôm qua" }); }
  if ((m = t.match(/(\d{1,3}) ngay (qua|gan day|truoc)/))) { const n = Math.min(Number(m[1]), 366); return mk({ start: iso(addDays(now, -(n - 1))), end: iso(now), label: `${n} ngày qua` }); }
  if ((m = t.match(/ngay (\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?/))) { const d = `${m[3] ?? now.getFullYear()}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`; return mk({ start: d, end: d, label: viDate(d) }); }
  if (t.includes("tuan truoc") || t.includes("tuan roi")) return mk({ ...getRange("Tuần", -1, now), label: "tuần trước" });
  if (t.includes("tuan nay")) return mk({ ...getRange("Tuần", 0, now), label: "tuần này" });
  if ((m = t.match(/thang (\d{1,2})(?:\/| nam )?(\d{4})?/)) && Number(m[1]) >= 1 && Number(m[1]) <= 12) {
    const y = m[2] ? Number(m[2]) : now.getFullYear(), mo = Number(m[1]), last = new Date(y, mo, 0).getDate();
    return mk({ start: `${y}-${String(mo).padStart(2, "0")}-01`, end: `${y}-${String(mo).padStart(2, "0")}-${last}`, label: `tháng ${mo}/${y}` });
  }
  if (t.includes("thang truoc") || t.includes("thang roi")) return mk({ ...getRange("Tháng", -1, now), label: "tháng trước" });
  if (t.includes("thang nay")) return mk({ ...getRange("Tháng", 0, now), label: "tháng này" });
  if (t.includes("quy truoc")) return mk({ ...getRange("Quý", -1, now), label: "quý trước" });
  if (t.includes("quy nay")) return mk({ ...getRange("Quý", 0, now), label: "quý này" });
  if (t.includes("nam ngoai") || t.includes("nam truoc")) return mk({ ...getRange("Năm", -1, now), label: "năm ngoái" });
  if (t.includes("nam nay")) return mk({ ...getRange("Năm", 0, now), label: "năm nay" });
  if ((m = t.match(/nam (20\d{2})/))) return mk({ start: `${m[1]}-01-01`, end: `${m[1]}-12-31`, label: `năm ${m[1]}` });
  return null;
}

const METRIC_WORDS: [Metric, string[]][] = [
  ["fuel", ["xang"]],
  ["left", ["con lai", "du ra", "tiet kiem", "thu nhap tru chi", "thu chi", "du bao nhieu"]],
  ["profit", ["loi nhuan", "lai"]],
  ["salary", ["luong"]],
  ["other", ["thu nhap khac", "lam them", "freelance", "viec khac"]],
  ["shifts", ["ca lam", "so ca", "so don", "bao nhieu don", "gio chay", "bao nhieu gio", "chay duoc", "thu nhap gio"]],
  ["shopee", ["shopee", "driver", "tai xe", "chay xe", "kiem duoc", "kiem"]],
  ["income", ["thu nhap", "tong thu", "nhan duoc", "thu ve"]],
  ["spent", ["chi", "tieu", "mua", "het bao nhieu", "ton", "tra tien", "mat bao nhieu", "tien"]],
];
const detectMetric = (t: string): Metric | null => { for (const [m, ws] of METRIC_WORDS) if (ws.some((w) => (w.length <= 3 ? (" " + t + " ").includes(" " + w + " ") : t.includes(w)))) return m; return null; };

const FAQ: { keys: string[]; text: string }[] = [
  { keys: ["them chi tieu", "ghi chi tieu", "nhap chi tieu", "them khoan chi"], text: "Thêm chi tiêu: vào mục Chi tiêu hằng ngày, bấm nút “＋ Thêm chi tiêu”, nhập tên khoản chi, số tiền (tự thêm dấu chấm), ngày và danh mục rồi Lưu. Sửa hoặc xóa bằng nút Sửa/Xóa ở cuối mỗi dòng." },
  { keys: ["luong", "2 dot", "hai dot", "nhap luong"], text: "Nhập lương: vào Báo cáo tháng, kéo xuống khung “💼 Lương tháng”. Chọn tháng, nhập Lương đợt 1 và đợt 2 (chỉ có một đợt thì để trống ô còn lại) rồi Lưu. Lương cộng vào “Thu nhập − chi tiêu” khi xem báo cáo theo Tháng, Quý hoặc Năm." },
  { keys: ["them ca", "ca shopee", "nhap shopee", "ghi shopee", "them ca lam"], text: "Ghi ca ShopeeFood: vào Tài xế ShopeeFood, bấm “＋ Thêm ca làm việc”, nhập ngày, số đơn, số giờ, thu nhập ca, xăng phân bổ và chi phí khác. Chỉ cần ghi tổng thu nhập của ca một lần." },
  { keys: ["xang phan bo", "phan bo xang", "xang la gi", "tinh xang"], text: "Xăng đổ ghi một lần ở Chi tiêu (danh mục Xăng xe). “Xăng phân bổ” trong mỗi ca chỉ là phần xăng bạn gán cho ca đó để tính lợi nhuận; nó không bị cộng thêm vào tiền đã chi nên không bị tính hai lần." },
  { keys: ["khoan no", "them no", "tra no", "ghi no"], text: "Khoản nợ: vào mục Khoản nợ, bấm “Thêm khoản nợ” (tên, tổng tiền, ngày vay). Mỗi lần trả bấm “＋ Trả nợ” để ghi ngày và số tiền; web tự tính đã trả và còn nợ. Tiền trả nợ hiện riêng trong Báo cáo tháng." },
  { keys: ["thu nhap khac", "them thu nhap", "lam them"], text: "Thu nhập khác: vào mục Thu nhập khác, bấm “Thêm thu nhập”, nhập công việc, số tiền, ngày. Khoản này cộng vào Tổng thu nhập trong Báo cáo tháng, không hiện ở Dashboard." },
  { keys: ["bao cao", "thu nhap tru chi", "tinh thu chi"], text: "Báo cáo tháng: Tổng thu nhập = lương + ShopeeFood + thu nhập khác. Thu nhập − chi tiêu = Tổng thu nhập − tổng chi tiêu. Dòng “Còn lại sau khi trả nợ” trừ thêm tiền đã trả nợ trong kỳ." },
  { keys: ["du doan", "ung tinh"], text: "Dự đoán (ở Dashboard) = trung bình mỗi ngày từ đầu tháng đến hôm nay × số ngày của tháng. Đây chỉ là ước tính tham khảo, càng về cuối tháng càng chính xác." },
  { keys: ["cai dat", "cai app", "cai ung dung", "ung dung", "man hinh chinh", "tai ung dung", "tren dien thoai", "len dien thoai"], text: "Cài như ứng dụng: mở web bằng Chrome trên điện thoại, bấm ⋮ → “Cài đặt ứng dụng” (hoặc “Thêm vào màn hình chính”). Trên iPhone dùng Safari: Chia sẻ → Thêm vào Màn hình chính." },
  { keys: ["giao dien toi", "che do toi", "doi mau", "sang toi"], text: "Đổi giao diện sáng/tối bằng nút ☾ ở góc phải trên cùng, hoặc trong menu khi bấm vào tên tài khoản." },
  { keys: ["dang xuat", "thoat tai khoan"], text: "Đăng xuất: bấm vào tên tài khoản ở góc phải trên cùng, chọn “Đăng xuất”." },
  { keys: ["du lieu luu", "luu o dau", "bao mat", "an toan", "rieng tu"], text: "Dữ liệu của bạn lưu trong database Supabase của riêng bạn, mỗi tài khoản chỉ xem được dữ liệu của mình. Trợ lý này tính câu trả lời ngay trong trình duyệt, không gửi dữ liệu cho dịch vụ AI bên ngoài." },
  { keys: ["thong bao", "chuong"], text: "Chuông ở góc phải trên cùng nhắc những việc cần làm: chưa nhập lương tháng này, còn nợ, hôm nay chưa ghi chi tiêu, dự đoán chi vượt thu nhập. Bấm vào thông báo để mở đúng trang." },
  { keys: ["xoa", "sua", "chinh sua"], text: "Sửa/xóa: ở mỗi bảng (chi tiêu, ca ShopeeFood, thu nhập khác, khoản nợ, lương) có nút Sửa và Xóa ở cuối dòng. Xóa khoản nợ sẽ xóa luôn lịch sử trả nợ của nó." },
  { keys: ["danh muc"], text: `Chi tiêu có các danh mục: ${Object.keys(CATS).join(", ")}. Xem tỷ trọng ở trang Danh mục chi tiêu hoặc biểu đồ tròn ở Dashboard.` },
  { keys: ["loc", "tuan", "quy", "thoi gian"], text: "Bộ lọc Ngày/Tuần/Tháng/Quý/Năm nằm đầu mỗi trang số liệu; bấm ‹ › để xem kỳ trước hoặc sau. Bạn cũng có thể hỏi trợ lý trực tiếp, ví dụ “chi tiêu tuần trước”, “thu nhập tháng 10”." },
];

const isHowTo = (t: string) => /(lam sao|lam the nao|cach |huong dan|(^| )o dau|nhu the nao|la gi|nghia la|giai thich|sao lai|vi sao|tai sao|duoc khong|co the)/.test(t);
function faqMatch(t: string): string | null {
  let best: { s: number; text: string } | null = null;
  for (const f of FAQ) { const s = f.keys.filter((k) => t.includes(k)).reduce((a, k) => a + k.split(" ").length, 0); if (s > 0 && (!best || s > best.s)) best = { s, text: f.text }; }
  if (best) return best.text;
  // Khớp mờ: đếm từ chung (từ dài từ 4 chữ cái) giữa câu hỏi và các từ khóa
  const qw = new Set(t.split(" ").filter((w) => w.length >= 4));
  let fuzzy: { s: number; text: string } | null = null;
  for (const f of FAQ) { const s = new Set(f.keys.flatMap((k) => k.split(" ")).filter((w) => w.length >= 4 && qw.has(w))).size; if (s > 0 && (!fuzzy || s > fuzzy.s)) fuzzy = { s, text: f.text }; }
  return fuzzy?.text ?? null;
}

export function answer(q: string, d: Data, prev: Ctx = {}, now = new Date()): { text: string; ctx: Ctx } {
  const t = norm(q);
  if (!t) return { text: "Bạn hãy gõ câu hỏi nhé.", ctx: prev };
  if (/^(xin chao|chao|hello|hi|alo)\b/.test(t)) return { text: "Chào bạn! Mình có thể trả lời về chi tiêu, thu nhập, lương, khoản nợ, xăng, ShopeeFood theo bất kỳ khoảng thời gian nào, và hướng dẫn cách dùng web. Bạn cần gì?", ctx: prev };
  if (/(cam on|thanks|thank)/.test(t)) return { text: "Không có gì 😊 Bạn cần hỏi thêm cứ nói nhé.", ctx: prev };

  const span = parseSpan(t, now);
  const followUp = /^(con |the con |vay con )/.test(t) || /thi sao$/.test(t);
  let metric = detectMetric(t);

  // Nợ / dự đoán
  if (/(^| )(no|khoan no|tra no|nguoi cho vay)( |$)/.test(t) || t.includes("khoan no") || t.includes("con no") || t.includes("dang no")) {
    if (!isHowTo(t) || t.includes("bao nhieu")) {
      if (!d.debts.length) return { text: "Bạn chưa ghi khoản nợ nào. Vào mục Khoản nợ để thêm.", ctx: prev };
      const rows = d.debts.map((x) => ({ x, s: debtStatus(d, x.id) }));
      const owing = rows.filter((r) => r.s.remaining > 0);
      if (t.includes("da tra")) return { text: `Bạn đã trả tổng cộng ${fmt(sum(rows.map((r) => r.s.paid)))} trên tổng nợ ${fmt(sum(rows.map((r) => r.s.total)))}.`, ctx: prev };
      if (!owing.length) return { text: "Tất cả khoản nợ đã được trả xong 🎉", ctx: prev };
      return { text: `Bạn còn nợ tổng cộng ${fmt(sum(owing.map((r) => r.s.remaining)))}:\n` + owing.map((r) => `• ${r.x.name}: còn ${fmt(r.s.remaining)} (đã trả ${fmt(r.s.paid)} / ${fmt(r.s.total)}, ${Math.round((r.s.paid / r.s.total) * 100)}%)`).join("\n"), ctx: prev };
    }
  }
  if (t.includes("du doan") && !isHowTo(t)) {
    const fs = monthForecast(d.expenses.map((e) => ({ date: e.date, amount: e.amount })), now);
    const fi = monthForecast(d.shifts.map((s) => ({ date: s.date, amount: s.earnings })), now);
    return { text: `Theo mức trung bình từ đầu tháng đến nay (${fs.elapsed}/${fs.days} ngày):\n• Dự đoán chi tiêu cả ${fs.label.toLowerCase()}: ${fmt(fs.projected)} (đã chi ${fmt(fs.sofar)}, trung bình ${fmt(fs.avg)}/ngày)\n• Dự đoán thu nhập ShopeeFood: ${fmt(fi.projected)} (đã kiếm ${fmt(fi.sofar)})\nĐây chỉ là ước tính tham khảo.`, ctx: prev };
  }

  // Hướng dẫn dùng web
  if (isHowTo(t) || (!metric && !span)) {
    const f = faqMatch(t);
    if (f) return { text: f, ctx: prev };
  }

  // Nhắc đến đúng tên một khoản chi (vd "cà phê", "siêu thị") nghĩa là đang hỏi chi tiêu
  if (!metric && d.expenses.some((e) => norm(e.description).length >= 3 && t.includes(norm(e.description)))) metric = "spent";
  if (!metric && (span || followUp) && prev.metric) metric = prev.metric;
  if (!metric && !span && /(^| )(tuan|thang|quy|nam)( |$)/.test(t) === false && (Object.keys(CATS).some((c) => t.includes(norm(c))))) metric = "spent";
  if (!metric && /(lien quan|chi tiet|liet ke|gan day|moi nhat|nhung gi|cai gi|nhung khoan)/.test(t)) metric = "spent";
  if (!metric) {
    const f = faqMatch(t);
    if (f) return { text: f, ctx: prev };
    return { text: "Mình chưa hiểu rõ câu này. Bạn thử hỏi kiểu: “tháng này chi bao nhiêu”, “tiền ăn uống tuần trước”, “thu nhập ShopeeFood 7 ngày qua”, “so với tháng trước chi nhiều hơn hay ít hơn”, “còn nợ bao nhiêu”, hoặc “làm sao để thêm khoản nợ”.", ctx: prev };
  }

  // "so với X" / "so sánh ... với X": X là kỳ để đối chiếu, kỳ chính là phần còn lại (mặc định kỳ hiện tại cùng loại)
  const cmpM = t.match(/(so voi|so sanh.*? voi|^voi) (.*)$/);
  let cmpSpan: Span | null = null, baseSpan: Span | null = span;
  if (cmpM && cmpM.index !== undefined) {
    const after = cmpM[2], before = t.slice(0, cmpM.index);
    cmpSpan = parseSpan(after, now); baseSpan = parseSpan(before, now);
    if (cmpSpan && !baseSpan) {
      const cur: Record<string, string> = { "tháng trước": "thang nay", "tuần trước": "tuan nay", "quý trước": "quy nay", "năm ngoái": "nam nay", "hôm qua": "hom nay" };
      baseSpan = parseSpan(cur[cmpSpan.label] ?? "thang nay", now);
    }
  }
  const use: Span = baseSpan ?? (followUp && prev.period ? prev.period : { ...getRange("Tháng", 0, now), label: "tháng này", days: 0, explicit: false });
  if (!use.days) use.days = dayDiff(use.start, use.end);
  const inSpan = (date: string, s = use) => date >= s.start && date <= s.end;

  // Bộ lọc danh mục + từ khóa
  const cat = Object.keys(CATS).find((c) => t.includes(norm(c)) || (c === "Xăng xe" && metric === "fuel"));
  const words = [...new Set(d.expenses.flatMap((e) => norm(e.description).split(" ")).filter((w) => w.length >= 3))];
  const stop = new Set(["tien", "chi", "mua", "tra", "thang", "nay", "qua", "hom", "ngay", "cho", "cua", "nhung", "gi", "bao", "nhieu", "toi", "minh", "ban", "dau", "nao", "khoan", "hay", "hon", "voi", "truoc", "tuan", "quy", "nam", "dang", "roi", "het", "tat", "ca", "the", "con", "lai", "nhat", "lon", "thu", "nhap", "luong", "shopee", "xang", "mot", "cac", "moi", "so", "sanh", "dua", "ra", "vao", "tieu", "kiem", "duoc", "tinh", "tong", "thi", "sao", "gi", "xem", "cho", "biet", "hoi"]);
  // Khớp nguyên tên khoản chi trước (vd "cà phê"), nếu không thì khớp từng từ (vd "cơm")
  const fullDesc = [...new Set(d.expenses.map((e) => norm(e.description)))].find((x) => x.length >= 3 && t.includes(x) && !x.split(" ").every((w) => stop.has(w)));
  const wordKw = fullDesc ? undefined : words.find((w) => !stop.has(w) && new RegExp(`(^| )${w}( |$)`).test(t));
  const kw = fullDesc ?? wordKw;
  const kwLabel = kw ? (d.expenses.map((e) => e.description).find((x) => norm(x) === kw) ?? d.expenses.flatMap((e) => e.description.split(" ")).find((x) => norm(x) === kw) ?? kw).toLowerCase() : "";

  const expensesIn = (s: Span) => d.expenses.filter((e) => inSpan(e.date, s) && (!cat || e.category === cat) && (!kw || (fullDesc ? norm(e.description) === kw : norm(e.description).split(" ").includes(kw))));
  const shiftsIn = (s: Span) => d.shifts.filter((x) => inSpan(x.date, s));
  const salaryIn = (s: Span) => (use.days <= 7 ? 0 : sum(d.salaries.filter((x) => x.month >= s.start.slice(0, 7) && x.month <= s.end.slice(0, 7)).map((x) => x.amount)));
  const otherIn = (s: Span) => sum(d.incomes.filter((x) => inSpan(x.date, s)).map((x) => x.amount));
  const value = (s: Span): number => {
    const sh = shiftsIn(s);
    switch (metric) {
      case "spent": case "fuel": return sum((metric === "fuel" ? d.expenses.filter((e) => inSpan(e.date, s) && e.category === FUEL_CAT) : expensesIn(s)).map((e) => e.amount));
      case "shopee": return sum(sh.map((x) => x.earnings));
      case "profit": return sum(sh.map(shiftProfit));
      case "salary": return salaryIn(s);
      case "other": return otherIn(s);
      case "income": return salaryIn(s) + sum(sh.map((x) => x.earnings)) + otherIn(s);
      case "left": return salaryIn(s) + sum(sh.map((x) => x.earnings)) + otherIn(s) - sum(d.expenses.filter((e) => inSpan(e.date, s)).map((e) => e.amount));
      default: return sh.length;
    }
  };
  const names: Record<Metric, string> = { spent: "chi tiêu", fuel: "tiền xăng đã đổ", shopee: "thu nhập ShopeeFood", profit: "lợi nhuận ShopeeFood", salary: "lương", other: "thu nhập khác", income: "tổng thu nhập", left: "thu nhập − chi tiêu", shifts: "ca ShopeeFood" };
  const ctx: Ctx = { metric, period: use };
  const scope = (cat ? ` cho ${cat}` : "") + (kw ? ` liên quan “${kwLabel}”` : "");

  // So sánh với kỳ trước
  if (/(so voi|so sanh|nhieu hon|it hon|tang|giam|hon thang|hon tuan)/.test(t) && metric !== "shifts") {
    const prevSpan: Span = cmpSpan ?? (use.days >= 28 && use.days <= 31 && use.start.endsWith("-01")
      ? (() => { const dt = new Date(use.start + "T00:00:00"); const ps = new Date(dt.getFullYear(), dt.getMonth() - 1, 1), pe = new Date(dt.getFullYear(), dt.getMonth(), 0); return { start: iso(ps), end: iso(pe), label: "tháng trước", days: pe.getDate(), explicit: true }; })()
      : { start: iso(addDays(new Date(use.start + "T00:00:00"), -use.days)), end: iso(addDays(new Date(use.start + "T00:00:00"), -1)), label: "kỳ trước", days: use.days, explicit: true });
    const a = value(use), b = value(prevSpan), diff = a - b;
    const dir = diff === 0 ? "bằng nhau" : diff > 0 ? `nhiều hơn ${fmt(diff)}` : `ít hơn ${fmt(-diff)}`;
    const pct = b ? ` (${diff > 0 ? "+" : ""}${Math.round((diff / b) * 100)}%)` : "";
    return { text: `${names[metric]}${scope}: ${use.label} ${fmt(a)} so với ${prevSpan.label} ${fmt(b)} → ${use.label} ${dir}${pct}.`, ctx };
  }

  // Liệt kê chi tiết
  if (metric === "spent" && /(nhung gi|liet ke|chi tiet|gan day|moi nhat|cai gi|nhung khoan|danh sach)/.test(t)) {
    const list = [...expensesIn(use)].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);
    if (!list.length) return { text: `Không có khoản chi nào${scope} trong ${use.label}.`, ctx };
    return { text: `Chi tiêu${scope} ${use.label}: ${fmt(value(use))} (${expensesIn(use).length} khoản)${expensesIn(use).length > 8 ? ", 8 khoản gần nhất:" : ":"}\n` + list.map((e) => `• ${viDate(e.date).slice(0, 5)} ${e.description} (${e.category}): ${fmt(e.amount)}`).join("\n"), ctx };
  }
  // Nhiều nhất / lớn nhất / danh mục
  if (metric === "spent" && /(nhieu nhat|lon nhat|cao nhat|top|vao dau|danh muc|ton nhat)/.test(t) && !cat) {
    const ex = expensesIn(use); if (!ex.length) return { text: `Chưa có khoản chi nào trong ${use.label}.`, ctx };
    const cats = byCategory(ex), top = [...ex].sort((a, b) => b.amount - a.amount)[0], total = sum(ex.map((e) => e.amount));
    return { text: `Chi nhiều nhất ${use.label}:\n` + cats.slice(0, 4).map(([c, v], i) => `${i + 1}. ${CATS[c]?.icon ?? ""} ${c}: ${fmt(v)} (${Math.round((v / Math.max(total, 1)) * 100)}%)`).join("\n") + `\nKhoản lớn nhất: ${top.description} ${fmt(top.amount)} (${viDate(top.date).slice(0, 5)}).`, ctx };
  }

  // Trả lời theo từng loại số liệu
  if (metric === "shifts" || (metric === "shopee" && /(gio|don|ca )/.test(t))) {
    const sh = shiftsIn(use), earn = sum(sh.map((x) => x.earnings)), hours = sum(sh.map((x) => x.hours)), orders = sum(sh.map((x) => x.orders));
    if (!sh.length) return { text: `Chưa có ca ShopeeFood nào trong ${use.label}.`, ctx };
    return { text: `ShopeeFood ${use.label}: ${sh.length} ca, ${orders} đơn, ${hours} giờ.\nThu nhập ${fmt(earn)} (trung bình ${fmt(earn / Math.max(hours, 1))}/giờ, ${fmt(earn / Math.max(orders, 1))}/đơn).\nLợi nhuận sau xăng và chi phí ca: ${fmt(sum(sh.map(shiftProfit)))}.`, ctx };
  }
  if (metric === "left" || metric === "income") {
    const sh = shiftsIn(use), sal = salaryIn(use), earn = sum(sh.map((x) => x.earnings)), oth = otherIn(use), spent = sum(d.expenses.filter((e) => inSpan(e.date)).map((e) => e.amount));
    const income = sal + earn + oth;
    const warn = use.days <= 7 ? "\n(Lương tính theo tháng nên không được cộng khi hỏi theo ngày/tuần.)" : "";
    return { text: `${use.label[0].toUpperCase() + use.label.slice(1)}: tổng thu nhập ${fmt(income)} (lương ${fmt(sal)} + ShopeeFood ${fmt(earn)} + thu nhập khác ${fmt(oth)}), tổng chi ${fmt(spent)}.\nThu nhập − chi tiêu = ${fmt(income - spent)}.${warn}`, ctx };
  }
  if (metric === "fuel") {
    const poured = value(use), alloc = sum(shiftsIn(use).map((x) => x.fuel_cost));
    return { text: `${use.label[0].toUpperCase() + use.label.slice(1)}: đã đổ xăng ${fmt(poured)}, đã phân bổ cho ca ShopeeFood ${fmt(alloc)}, chưa phân bổ ${fmt(Math.max(poured - alloc, 0))}. Xăng phân bổ chỉ để tính lợi nhuận, không cộng thêm vào tiền đã chi.`, ctx };
  }
  if (metric === "salary") {
    const ms = d.salaries.filter((x) => x.month >= use.start.slice(0, 7) && x.month <= use.end.slice(0, 7)).sort((a, b) => a.month.localeCompare(b.month) || a.installment - b.installment);
    if (use.days <= 7) return { text: "Lương tính theo tháng nên mình không chia theo ngày hay tuần được. Bạn hỏi “lương tháng này” hoặc “lương tháng 10” nhé.", ctx };
    if (!ms.length) return { text: `Chưa có lương nào được nhập cho ${use.label}. Vào Báo cáo tháng → khung “Lương tháng” để nhập.`, ctx };
    return { text: `Lương ${use.label}: ${fmt(salaryIn(use))}\n` + ms.map((x) => `• ${x.month.slice(5)}/${x.month.slice(0, 4)} đợt ${x.installment}: ${fmt(x.amount)}`).join("\n"), ctx };
  }
  if (metric === "spent") {
    const ex = expensesIn(use), total = value(use), top = byCategory(ex)[0];
    const days = use.days || 1;
    return { text: `${use.label[0].toUpperCase() + use.label.slice(1)} bạn đã chi ${fmt(total)}${scope}, gồm ${ex.length} khoản` + (days > 1 ? ` (trung bình ${fmt(total / days)}/ngày)` : "") + "." + (top && !cat ? ` Nhiều nhất là ${top[0]} (${fmt(top[1])}).` : ""), ctx };
  }
  return { text: `${use.label[0].toUpperCase() + use.label.slice(1)}: ${names[metric]} là ${fmt(value(use))}.`, ctx };
}
