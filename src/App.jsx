import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, Legend, AreaChart, Area } from "recharts";
import { storage } from "./storage";

/* ═══════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════ */

const CATEGORIES = [
  { id: "food", icon: "🍜", th: "อาหาร", en: "Food" },
  { id: "transport", icon: "🚗", th: "เดินทาง", en: "Transport" },
  { id: "trading", icon: "📊", th: "เทรด/ลงทุน", en: "Trading" },
  { id: "shopping", icon: "🛒", th: "ช็อปปิ้ง", en: "Shopping" },
  { id: "bills", icon: "💡", th: "ค่าบิล", en: "Bills" },
  { id: "health", icon: "💊", th: "สุขภาพ", en: "Health" },
  { id: "entertainment", icon: "🎮", th: "บันเทิง", en: "Entertainment" },
  { id: "education", icon: "📚", th: "การศึกษา", en: "Education" },
  { id: "other", icon: "📌", th: "อื่นๆ", en: "Other" },
];

const INCOME_CATEGORIES = [
  { id: "salary", icon: "💼", th: "เงินเดือน", en: "Salary" },
  { id: "dividend", icon: "📈", th: "เงินปันผล", en: "Dividend" },
  { id: "freelance", icon: "💻", th: "ฟรีแลนซ์", en: "Freelance" },
  { id: "bonus", icon: "🎁", th: "โบนัส", en: "Bonus" },
  { id: "interest", icon: "🏦", th: "ดอกเบี้ย", en: "Interest" },
  { id: "trading_income", icon: "📊", th: "กำไรเทรด", en: "Trading Profit" },
  { id: "other_income", icon: "💰", th: "อื่นๆ", en: "Other" },
];

const THAI_BANKS = [
  { id: "kbank", name: "กสิกรไทย", en: "KBank", color: "#138f2d", icon: "🟢" },
  { id: "scb", name: "ไทยพาณิชย์", en: "SCB", color: "#4e2a84", icon: "🟣" },
  { id: "bbl", name: "กรุงเทพ", en: "BBL", color: "#1e3a8a", icon: "🔵" },
  { id: "ktb", name: "กรุงไทย", en: "KTB", color: "#00a3e0", icon: "🩵" },
  { id: "ttb", name: "ทีทีบี", en: "TTB", color: "#fc6e20", icon: "🟠" },
  { id: "bay", name: "กรุงศรี", en: "Krungsri", color: "#ffc423", icon: "🟡" },
  { id: "gsb", name: "ออมสิน", en: "GSB", color: "#e91e8c", icon: "🩷" },
  { id: "baac", name: "ธ.ก.ส.", en: "BAAC", color: "#2d8b4e", icon: "💚" },
  { id: "ghb", name: "อาคารสงเคราะห์", en: "GHB", color: "#ed7d22", icon: "🧡" },
  { id: "kkp", name: "เกียรตินาคินภัทร", en: "KKP", color: "#003d6a", icon: "🔹" },
  { id: "lhbank", name: "แลนด์ แอนด์ เฮ้าส์", en: "LH Bank", color: "#0e4a2f", icon: "🌿" },
  { id: "tisco", name: "ทิสโก้", en: "TISCO", color: "#c41e3a", icon: "🔴" },
  { id: "cimbt", name: "ซีไอเอ็มบี ไทย", en: "CIMB Thai", color: "#ec1c24", icon: "❤️" },
  { id: "uob", name: "ยูโอบี", en: "UOB", color: "#002b5c", icon: "💙" },
];

const ACCT_TYPES = [
  { id: "savings", th: "ออมทรัพย์", en: "Savings" },
  { id: "current", th: "กระแสรายวัน", en: "Current" },
  { id: "fixed", th: "ฝากประจำ", en: "Fixed Deposit" },
  { id: "digital", th: "ดิจิทัล", en: "Digital" },
];

const PALETTE = ["#6366f1","#f59e0b","#10b981","#ef4444","#8b5cf6","#ec4899","#06b6d4","#f97316","#64748b"];

const T = {
  th: {
    title: "Expense Tracker", subtitle: "บันทึกรายจ่าย", addExpense: "เพิ่มรายจ่าย",
    addIncome: "เพิ่มรายรับ", amount: "จำนวนเงิน (฿)", note: "หมายเหตุ",
    category: "หมวดหมู่", add: "บันทึก", today: "วันนี้", thisWeek: "สัปดาห์นี้",
    thisMonth: "เดือนนี้", budget: "งบประมาณ", spent: "ใช้ไป", remaining: "เหลือ",
    over: "เกิน", setBudget: "ตั้งงบประมาณ", monthlyBudget: "งบรายเดือน (฿)",
    save: "บันทึก", dashboard: "หน้าหลัก", history: "ประวัติ", wallet: "กระเป๋า",
    settings: "ตั้งค่า", noData: "ยังไม่มีรายการ", delete: "ลบ",
    byCategory: "ตามหมวดหมู่", dailyTrend: "แนวโน้มรายวัน",
    recentTransactions: "รายการล่าสุด", budgetOverview: "ภาพรวมงบประมาณ",
    reset: "รีเซ็ตข้อมูลทั้งหมด", confirmReset: "ยืนยันลบข้อมูลทั้งหมด?",
    lang: "EN", exportCSV: "Export CSV", date: "วันที่",
    totalBalance: "ยอดรวมทั้งหมด", cash: "เงินสด", bank: "ธนาคาร",
    investment: "พอร์ตลงทุน", addWallet: "เพิ่มกระเป๋า", walletName: "ชื่อบัญชี",
    balance: "ยอดเงิน", selectBank: "เลือกธนาคาร", accountType: "ประเภทบัญชี",
    walletType: "ประเภทกระเป๋า", fromWallet: "จ่ายจาก", transfer: "โอนเงิน",
    transferFrom: "จาก", transferTo: "ไป", transferAmount: "จำนวนโอน",
    addSubAccount: "เพิ่มบัญชีย่อย", subAccounts: "บัญชีย่อย",
    confirm: "ยืนยัน", cancel: "ยกเลิก", edit: "แก้ไข",
    portName: "ชื่อพอร์ต", noWallet: "ยังไม่มีกระเป๋า", income: "รายรับ",
    expense: "รายจ่าย", confirmDeleteWallet: "ยืนยันลบกระเป๋านี้?",
    none: "ไม่ระบุ", optional: "ไม่จำเป็น",
    offline: "ออฟไลน์ — ข้อมูลจะบันทึกในเครื่อง",
    install: "ติดตั้งแอป", installDesc: "เพิ่มลงหน้าจอหลัก",
    analytics: "วิเคราะห์", weekly: "รายสัปดาห์", monthly: "รายเดือน", yearly: "รายปี",
    weeklyCompare: "เปรียบเทียบรายสัปดาห์", monthlyCompare: "เปรียบเทียบรายเดือน",
    yearlyCompare: "เปรียบเทียบรายปี", weekLabel: "สัปดาห์", avgPerDay: "เฉลี่ย/วัน",
    totalSpent: "ใช้จ่ายรวม", vsPrev: "เทียบก่อนหน้า", budgetMonth: "เดือนที่ตั้งงบ",
    copyPrev: "คัดลอกจากเดือนก่อน", noBudget: "ยังไม่ได้ตั้งงบเดือนนี้",
    incomeVsExpense: "รายรับ vs รายจ่าย",
  },
  en: {
    title: "Expense Tracker", subtitle: "Track your spending", addExpense: "Add Expense",
    addIncome: "Add Income", amount: "Amount (฿)", note: "Note",
    category: "Category", add: "Save", today: "Today", thisWeek: "This Week",
    thisMonth: "This Month", budget: "Budget", spent: "Spent", remaining: "Left",
    over: "Over", setBudget: "Set Budget", monthlyBudget: "Monthly Budget (฿)",
    save: "Save", dashboard: "Dashboard", history: "History", wallet: "Wallet",
    settings: "Settings", noData: "No entries yet", delete: "Delete",
    byCategory: "By Category", dailyTrend: "Daily Trend",
    recentTransactions: "Recent Transactions", budgetOverview: "Budget Overview",
    reset: "Reset All Data", confirmReset: "Confirm delete all data?",
    lang: "TH", exportCSV: "Export CSV", date: "Date",
    totalBalance: "Total Balance", cash: "Cash", bank: "Bank",
    investment: "Investment", addWallet: "Add Wallet", walletName: "Account Name",
    balance: "Balance", selectBank: "Select Bank", accountType: "Account Type",
    walletType: "Wallet Type", fromWallet: "Pay from", transfer: "Transfer",
    transferFrom: "From", transferTo: "To", transferAmount: "Transfer Amount",
    addSubAccount: "Add Sub-Account", subAccounts: "Sub-accounts",
    confirm: "Confirm", cancel: "Cancel", edit: "Edit",
    portName: "Portfolio Name", noWallet: "No wallets yet", income: "Income",
    expense: "Expense", confirmDeleteWallet: "Confirm delete this wallet?",
    none: "None", optional: "optional",
    offline: "Offline — data saved locally",
    install: "Install App", installDesc: "Add to Home Screen",
    analytics: "Analytics", weekly: "Weekly", monthly: "Monthly", yearly: "Yearly",
    weeklyCompare: "Weekly Comparison", monthlyCompare: "Monthly Comparison",
    yearlyCompare: "Yearly Comparison", weekLabel: "Week", avgPerDay: "Avg/day",
    totalSpent: "Total Spent", vsPrev: "vs Previous", budgetMonth: "Budget Month",
    copyPrev: "Copy from Previous Month", noBudget: "No budget set for this month",
    incomeVsExpense: "Income vs Expense",
  },
};

/* ═══════════════════════════════════════════
   UTILITIES
   ═══════════════════════════════════════════ */

function fmt(n) { return n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }); }
function getCat(id) { return CATEGORIES.find((c) => c.id === id) || INCOME_CATEGORIES.find((c) => c.id === id) || { id, icon: "📌", th: id, en: id }; }
function getWeekStart(d) { const dt = new Date(d); const day = dt.getDay(); dt.setDate(dt.getDate() - day + (day === 0 ? -6 : 1)); return dt.toISOString().slice(0, 10); }
function getDayLabel(s) { const d = new Date(s); return `${d.getDate()}/${d.getMonth() + 1}`; }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
const MONTH_TH = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
const MONTH_EN = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function getMonthLabel(ym, lang) { const [y, m] = ym.split("-"); return `${lang === "th" ? MONTH_TH[+m - 1] : MONTH_EN[+m - 1]} ${y.slice(2)}`; }
function getMonthOptions(n = 12) { const r = []; const d = new Date(); for (let i = 0; i < n; i++) { const m = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; r.push(m); d.setMonth(d.getMonth() - 1); } return r; }

/* ═══════════════════════════════════════════
   HOOKS
   ═══════════════════════════════════════════ */

// Online/Offline detection
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  return isOnline;
}

// PWA Install Prompt
function useInstallPrompt() {
  const [prompt, setPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    const installed = () => setIsInstalled(true);
    window.addEventListener('appinstalled', installed);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installed);
    };
  }, []);

  const install = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setPrompt(null);
  };

  return { canInstall: !!prompt && !isInstalled, install, isInstalled };
}

/* ═══════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════ */

const Modal = ({ show, onClose, title, children }) => {
  if (!show) return null;
  return (<>
    <div className="overlay" onClick={onClose} />
    <div className="modal">
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>{title}</span>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#94a3b8", fontSize: 20, cursor: "pointer", padding: 0 }}>✕</button>
      </div>
      {children}
    </div>
  </>);
};

const Chip = ({ active, onClick, children }) => (
  <div className={`cat-chip ${active ? "active" : ""}`} onClick={onClick}>{children}</div>
);

/* ═══════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════ */

export default function App() {
  const isOnline = useOnlineStatus();
  const { canInstall, install, isInstalled } = useInstallPrompt();
  const [showInstallBanner, setShowInstallBanner] = useState(true);

  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem('expense-lang') || 'th'; } catch { return 'th'; }
  });
  const [tab, setTab] = useState("dashboard");
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [wallets, setWallets] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [toast, setToast] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showAddSub, setShowAddSub] = useState(null);
  const [expandedWallet, setExpandedWallet] = useState(null);

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [selectedCat, setSelectedCat] = useState("food");
  const [expDate, setExpDate] = useState(new Date().toISOString().slice(0, 10));
  const [expWallet, setExpWallet] = useState("");
  const [expType, setExpType] = useState("expense");

  const [wType, setWType] = useState("cash");
  const [wBank, setWBank] = useState("kbank");
  const [wAcctType, setWAcctType] = useState("savings");
  const [wName, setWName] = useState("");
  const [wBalance, setWBalance] = useState("");

  const [tfFrom, setTfFrom] = useState("");
  const [tfTo, setTfTo] = useState("");
  const [tfAmount, setTfAmount] = useState("");

  const [subName, setSubName] = useState("");
  const [subBalance, setSubBalance] = useState("");
  const [subAcctType, setSubAcctType] = useState("savings");

  const [editBudget, setEditBudget] = useState({});
  const [analyticsView, setAnalyticsView] = useState("weekly");
  const [budgetMonth, setBudgetMonth] = useState(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; });

  const t = T[lang];

  // Persist language preference
  useEffect(() => {
    try { localStorage.setItem('expense-lang', lang); } catch {}
  }, [lang]);

  // Load data from IndexedDB
  useEffect(() => {
    (async () => {
      try {
        const r = await storage.get("expense-v2");
        if (r?.value) {
          const d = JSON.parse(r.value);
          setExpenses(d.expenses || []);
          setBudgets(d.budgets || {});
          setWallets(d.wallets || []);
        }
      } catch (e) { console.error('Load error:', e); }
      setLoaded(true);
    })();
  }, []);

  const persist = useCallback(async (exps, budg, wals) => {
    try { await storage.set("expense-v2", JSON.stringify({ expenses: exps, budgets: budg, wallets: wals })); } catch (e) { console.error('Save error:', e); }
  }, []);

  const showMsg = (m) => { setToast(m); setTimeout(() => setToast(""), 2000); };

  /* ─── Wallet helpers ─── */
  const flatWallets = useMemo(() => {
    const list = [];
    wallets.forEach((w) => {
      if (w.type === "bank" && w.subAccounts?.length) {
        w.subAccounts.forEach((s) => list.push({ id: s.id, label: `${w.bankName || w.name} — ${s.name}`, balance: s.balance, parentId: w.id, color: w.color }));
      } else {
        list.push({ id: w.id, label: w.name, balance: w.balance, color: w.color || "#6366f1" });
      }
    });
    return list;
  }, [wallets]);

  const totalBalance = useMemo(() => {
    let sum = 0;
    wallets.forEach((w) => { if (w.subAccounts?.length) w.subAccounts.forEach((s) => sum += s.balance || 0); else sum += w.balance || 0; });
    return sum;
  }, [wallets]);

  const walletBalanceByType = useMemo(() => {
    const r = { cash: 0, bank: 0, invest: 0 };
    wallets.forEach((w) => { if (w.subAccounts?.length) w.subAccounts.forEach((s) => r[w.type] += s.balance || 0); else r[w.type] += w.balance || 0; });
    return r;
  }, [wallets]);

  const getWalletLabel = (walletId) => flatWallets.find((w) => w.id === walletId)?.label || "—";

  const updateWalletBalance = (wals, walletId, delta) => {
    return wals.map((w) => {
      if (w.id === walletId) return { ...w, balance: (w.balance || 0) + delta };
      if (w.subAccounts?.length) return { ...w, subAccounts: w.subAccounts.map((s) => s.id === walletId ? { ...s, balance: (s.balance || 0) + delta } : s) };
      return w;
    });
  };

  /* ─── Actions ─── */
  const addExpenseAction = () => {
    const amt = parseFloat(amount); if (!amt || amt <= 0) return;
    const newExp = { id: uid(), amount: amt, category: selectedCat, note: note.trim(), date: expDate, walletId: expWallet || null, type: expType, createdAt: new Date().toISOString() };
    const updatedExp = [newExp, ...expenses];
    let updatedWal = [...wallets];
    if (expWallet) updatedWal = updateWalletBalance(updatedWal, expWallet, expType === "expense" ? -amt : amt);
    setExpenses(updatedExp); setWallets(updatedWal); persist(updatedExp, budgets, updatedWal);
    setAmount(""); setNote(""); setShowAdd(false);
    showMsg("✅ " + (lang === "th" ? "บันทึกแล้ว!" : "Saved!"));
  };

  const deleteExpense = (id) => {
    const exp = expenses.find((e) => e.id === id);
    let updatedWal = [...wallets];
    if (exp?.walletId) updatedWal = updateWalletBalance(updatedWal, exp.walletId, exp.type === "expense" ? exp.amount : -exp.amount);
    const updatedExp = expenses.filter((e) => e.id !== id);
    setExpenses(updatedExp); setWallets(updatedWal); persist(updatedExp, budgets, updatedWal);
  };

  const addWalletAction = () => {
    const bal = parseFloat(wBalance) || 0; let newW;
    if (wType === "cash") {
      newW = { id: uid(), type: "cash", name: wName || (lang === "th" ? "เงินสด" : "Cash"), balance: bal, color: "#10b981", icon: "💵" };
    } else if (wType === "bank") {
      const bank = THAI_BANKS.find((b) => b.id === wBank);
      const acctLabel = lang === "th" ? ACCT_TYPES.find((a) => a.id === wAcctType)?.th : ACCT_TYPES.find((a) => a.id === wAcctType)?.en;
      const bankLabel = lang === "th" ? bank?.name : bank?.en;
      const subLabel = wName || acctLabel;
      newW = { id: uid(), type: "bank", bankId: wBank, bankName: bankLabel, name: bankLabel, balance: 0, color: bank?.color, icon: bank?.icon,
        subAccounts: [{ id: uid(), name: subLabel, acctType: wAcctType, balance: bal }] };
    } else {
      newW = { id: uid(), type: "invest", name: wName || (lang === "th" ? "พอร์ตลงทุน" : "Investment"), balance: bal, color: "#f59e0b", icon: "📈" };
    }
    const updated = [...wallets, newW]; setWallets(updated); persist(expenses, budgets, updated);
    setShowAddWallet(false); setWName(""); setWBalance("");
    showMsg("✅ " + (lang === "th" ? "เพิ่มกระเป๋าแล้ว!" : "Wallet added!"));
  };

  const addSubAccountAction = () => {
    const bal = parseFloat(subBalance) || 0;
    const acctLabel = lang === "th" ? ACCT_TYPES.find((a) => a.id === subAcctType)?.th : ACCT_TYPES.find((a) => a.id === subAcctType)?.en;
    const updated = wallets.map((w) => w.id === showAddSub ? { ...w, subAccounts: [...(w.subAccounts || []), { id: uid(), name: subName || acctLabel, acctType: subAcctType, balance: bal }] } : w);
    setWallets(updated); persist(expenses, budgets, updated);
    setShowAddSub(null); setSubName(""); setSubBalance("");
    showMsg("✅ " + (lang === "th" ? "เพิ่มบัญชีย่อยแล้ว!" : "Sub-account added!"));
  };

  const deleteWallet = (wId) => { if (!confirm(t.confirmDeleteWallet)) return; const updated = wallets.filter((w) => w.id !== wId); setWallets(updated); persist(expenses, budgets, updated); };
  const deleteSubAccount = (wId, subId) => { const updated = wallets.map((w) => w.id === wId ? { ...w, subAccounts: (w.subAccounts || []).filter((s) => s.id !== subId) } : w); setWallets(updated); persist(expenses, budgets, updated); };

  const transferAction = () => {
    const amt = parseFloat(tfAmount); if (!amt || amt <= 0 || !tfFrom || !tfTo || tfFrom === tfTo) return;
    let updated = updateWalletBalance([...wallets], tfFrom, -amt);
    updated = updateWalletBalance(updated, tfTo, amt); setWallets(updated);
    const tfExp = { id: uid(), amount: amt, category: "other", note: `${lang === "th" ? "โอน" : "Transfer"}: ${getWalletLabel(tfFrom)} → ${getWalletLabel(tfTo)}`, date: new Date().toISOString().slice(0, 10), walletId: null, type: "transfer", createdAt: new Date().toISOString() };
    const updatedExp = [tfExp, ...expenses]; setExpenses(updatedExp); persist(updatedExp, budgets, updated);
    setShowTransfer(false); setTfAmount("");
    showMsg("✅ " + (lang === "th" ? "โอนเงินแล้ว!" : "Transferred!"));
  };

  const saveBudgets = () => {
    const b = {}; Object.entries(editBudget).forEach(([k, v]) => { const n = parseFloat(v); if (n > 0) b[k] = n; });
    const updated = { ...budgets, [budgetMonth]: b };
    setBudgets(updated); persist(expenses, updated, wallets);
    showMsg("✅ " + (lang === "th" ? "บันทึกงบแล้ว!" : "Budget saved!"));
  };

  const copyPrevMonth = () => {
    const d = new Date(budgetMonth + "-01"); d.setMonth(d.getMonth() - 1);
    const prev = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const prevBudget = budgets[prev] || {};
    const b = {}; CATEGORIES.forEach((c) => { b[c.id] = prevBudget[c.id] || ""; });
    setEditBudget(b);
    showMsg("✅ " + (lang === "th" ? "คัดลอกงบจากเดือนก่อนแล้ว" : "Copied from previous month"));
  };

  const resetAll = () => { if (confirm(t.confirmReset)) { setExpenses([]); setBudgets({}); setWallets([]); persist([], {}, []); } };

  const exportCSV = () => {
    const header = "Date,Type,Category,Amount,Wallet,Note\n";
    const rows = [...expenses].sort((a, b) => b.date.localeCompare(a.date)).map((e) => `${e.date},${e.type},${getCat(e.category).en},${e.amount},"${getWalletLabel(e.walletId)}","${e.note || ""}"`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" }); const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `expenses-${new Date().toISOString().slice(0, 10)}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  /* ─── Computed ─── */
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const monthStr = todayStr.slice(0, 7);
  const weekStart = getWeekStart(todayStr);
  const monthExpenses = useMemo(() => expenses.filter((e) => e.date.startsWith(monthStr) && e.type === "expense"), [expenses, monthStr]);
  const todayTotal = useMemo(() => expenses.filter((e) => e.date === todayStr && e.type === "expense").reduce((s, e) => s + e.amount, 0), [expenses, todayStr]);
  const weekTotal = useMemo(() => expenses.filter((e) => e.date >= weekStart && e.type === "expense").reduce((s, e) => s + e.amount, 0), [expenses, weekStart]);
  const monthTotal = useMemo(() => monthExpenses.reduce((s, e) => s + e.amount, 0), [monthExpenses]);

  const categoryData = useMemo(() => {
    const map = {}; monthExpenses.forEach((e) => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return CATEGORIES.filter((c) => map[c.id]).map((c, i) => ({ name: c[lang], value: map[c.id], color: PALETTE[i % PALETTE.length], icon: c.icon }));
  }, [monthExpenses, lang]);

  const dailyData = useMemo(() => {
    const map = {}; const last7 = [];
    for (let i = 6; i >= 0; i--) { const d = new Date(now); d.setDate(d.getDate() - i); const ds = d.toISOString().slice(0, 10); last7.push(ds); map[ds] = 0; }
    expenses.filter((e) => e.type === "expense").forEach((e) => { if (map[e.date] !== undefined) map[e.date] += e.amount; });
    return last7.map((ds) => ({ date: getDayLabel(ds), amount: map[ds] }));
  }, [expenses]);

  const curMonthBudget = useMemo(() => budgets[monthStr] || {}, [budgets, monthStr]);

  const budgetData = useMemo(() => CATEGORIES.filter((c) => curMonthBudget[c.id]).map((c) => {
    const spent = monthExpenses.filter((e) => e.category === c.id).reduce((s, e) => s + e.amount, 0);
    return { ...c, budget: curMonthBudget[c.id], spent, pct: Math.min((spent / curMonthBudget[c.id]) * 100, 100) };
  }), [monthExpenses, curMonthBudget]);

  // ─── Analytics: Weekly comparison (last 8 weeks) ───
  const weeklyCompareData = useMemo(() => {
    const weeks = [];
    const d = new Date(now); d.setDate(d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1)); // current week Mon
    for (let i = 7; i >= 0; i--) {
      const ws = new Date(d); ws.setDate(ws.getDate() - i * 7);
      const we = new Date(ws); we.setDate(we.getDate() + 6);
      const wsStr = ws.toISOString().slice(0, 10);
      const weStr = we.toISOString().slice(0, 10);
      const spent = expenses.filter((e) => e.type === "expense" && e.date >= wsStr && e.date <= weStr).reduce((s, e) => s + e.amount, 0);
      const income = expenses.filter((e) => e.type === "income" && e.date >= wsStr && e.date <= weStr).reduce((s, e) => s + e.amount, 0);
      weeks.push({ label: `${getDayLabel(wsStr)}`, spent, income, avg: Math.round(spent / 7) });
    }
    return weeks;
  }, [expenses]);

  // ─── Analytics: Monthly comparison (last 12 months) ───
  const monthlyCompareData = useMemo(() => {
    const months = [];
    const d = new Date(now);
    for (let i = 11; i >= 0; i--) {
      const md = new Date(d.getFullYear(), d.getMonth() - i, 1);
      const ym = `${md.getFullYear()}-${String(md.getMonth() + 1).padStart(2, "0")}`;
      const spent = expenses.filter((e) => e.type === "expense" && e.date.startsWith(ym)).reduce((s, e) => s + e.amount, 0);
      const income = expenses.filter((e) => e.type === "income" && e.date.startsWith(ym)).reduce((s, e) => s + e.amount, 0);
      const bgt = budgets[ym] ? Object.values(budgets[ym]).reduce((s, v) => s + v, 0) : 0;
      months.push({ label: getMonthLabel(ym, lang), spent, income, budget: bgt, ym });
    }
    return months;
  }, [expenses, budgets, lang]);

  // ─── Analytics: Yearly comparison ───
  const yearlyCompareData = useMemo(() => {
    const years = {};
    expenses.filter((e) => e.type === "expense" || e.type === "income").forEach((e) => {
      const y = e.date.slice(0, 4);
      if (!years[y]) years[y] = { spent: 0, income: 0 };
      if (e.type === "expense") years[y].spent += e.amount;
      else years[y].income += e.amount;
    });
    return Object.entries(years).sort(([a], [b]) => a.localeCompare(b)).map(([y, v]) => ({ label: y, ...v, net: v.income - v.spent }));
  }, [expenses]);

  useEffect(() => { const mb = budgets[budgetMonth] || {}; const b = {}; CATEGORIES.forEach((c) => { b[c.id] = mb[c.id] || ""; }); setEditBudget(b); }, [budgets, budgetMonth, tab]);
  useEffect(() => { if (flatWallets.length && !expWallet) setExpWallet(flatWallets[0].id); }, [flatWallets, expWallet]);

  /* ─── Render ─── */
  if (!loaded) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100dvh", background: "#f8f9fb", color: "#1e293b" }}>
      <div style={{ textAlign: "center" }}><div style={{ fontSize: 36, marginBottom: 12, animation: "pulse 1.5s infinite" }}>💰</div><div style={{ opacity: 0.4, fontSize: 13 }}>Loading...</div></div>
    </div>
  );

  return (
    <div style={{ minHeight: "100dvh", background: "#f8f9fb", color: "#1e293b", maxWidth: 480, margin: "0 auto", position: "relative", paddingBottom: 80, paddingTop: !isOnline ? 24 : 0 }}>
      <style>{`
        .card { background: #fff; border: 1px solid #e8ecf1; border-radius: 14px; padding: 18px; margin-bottom: 14px; }
        .stat-card { background: #fff; border: 1px solid #e8ecf1; border-radius: 12px; padding: 14px; flex: 1; min-width: 0; }
        .btn { padding: 10px 20px; border-radius: 10px; border: none; cursor: pointer; font-weight: 600; font-size: 14px; transition: all 0.15s; font-family: inherit; }
        .btn-primary { background: #1e293b; color: #fff; }
        .btn-primary:active { transform: scale(0.97); opacity: 0.9; }
        .btn-ghost { background: #f1f3f5; color: #64748b; }
        .btn-ghost:active { background: #e2e8f0; }
        .btn-sm { padding: 6px 12px; font-size: 11px; border-radius: 8px; }
        .input { background: #f4f6f8; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 16px; color: #1e293b; font-size: 16px; width: 100%; box-sizing: border-box; outline: none; font-family: inherit; transition: border 0.2s; }
        .input:focus { border-color: #94a3b8; }
        .select { background: #f4f6f8; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 16px; color: #1e293b; font-size: 16px; width: 100%; box-sizing: border-box; outline: none; font-family: inherit; appearance: none; cursor: pointer; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2394a3b8' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; padding-right: 36px; }
        .select option { background: #fff; color: #1e293b; }
        .cat-chip { padding: 7px 13px; border-radius: 8px; border: 1px solid #e2e8f0; cursor: pointer; transition: all 0.15s; font-size: 13px; white-space: nowrap; background: #fff; user-select: none; -webkit-tap-highlight-color: transparent; color: #475569; }
        .cat-chip:active { transform: scale(0.95); }
        .cat-chip.active { background: #1e293b; border-color: #1e293b; color: #fff; }
        .tab { padding: 8px 0; flex: 1; text-align: center; cursor: pointer; font-size: 10px; color: #94a3b8; transition: all 0.2s; border: none; background: none; font-family: inherit; -webkit-tap-highlight-color: transparent; font-weight: 500; }
        .tab.active { color: #1e293b; }
        .tab-icon { font-size: 18px; margin-bottom: 2px; }
        .progress-bg { height: 6px; background: #f1f3f5; border-radius: 3px; overflow: hidden; }
        .progress-fill { height: 100%; border-radius: 3px; transition: width 0.6s ease; }
        .toast { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #1e293b; color: #fff; padding: 10px 24px; border-radius: 10px; font-size: 13px; font-weight: 600; z-index: 1000; animation: slideUp 0.3s ease; pointer-events: none; }
        .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.3); z-index: 50; animation: fadeIn 0.2s ease; }
        .modal { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 480px; background: #fff; border-top-left-radius: 20px; border-top-right-radius: 20px; padding: 24px; padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px)); z-index: 60; animation: slideUp 0.3s ease; box-sizing: border-box; max-height: 90dvh; overflow-y: auto; -webkit-overflow-scrolling: touch; }
        .expense-row { display: flex; align-items: center; gap: 12px; padding: 11px 0; border-bottom: 1px solid #f1f3f5; }
        .expense-row:last-child { border-bottom: none; }
        .mono { font-family: 'JetBrains Mono', monospace; }
        .custom-tooltip { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .wallet-card { background: #fff; border: 1px solid #e8ecf1; border-radius: 14px; overflow: hidden; margin-bottom: 12px; }
        .wallet-header { padding: 16px 18px; cursor: pointer; display: flex; align-items: center; gap: 14px; -webkit-tap-highlight-color: transparent; }
        .sub-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 18px 10px 50px; border-top: 1px solid #f1f3f5; }
        .type-toggle { display: flex; border-radius: 10px; overflow: hidden; border: 1px solid #e2e8f0; background: #f4f6f8; }
        .type-btn { flex: 1; padding: 10px; text-align: center; font-size: 13px; font-weight: 600; cursor: pointer; border: none; font-family: inherit; transition: all 0.2s; -webkit-tap-highlight-color: transparent; background: transparent; color: #94a3b8; }
      `}</style>

      {/* Offline banner */}
      {!isOnline && <div className="offline-banner">📡 {t.offline}</div>}

      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}

      {/* PWA Install Banner */}
      {canInstall && showInstallBanner && (
        <div className="pwa-install-banner">
          <span style={{ flex: 1 }}>📲 {t.installDesc}</span>
          <button onClick={install}>{t.install}</button>
          <button className="close-btn" onClick={() => setShowInstallBanner(false)}>✕</button>
        </div>
      )}

      {/* Header */}
      <div style={{ padding: "20px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.3px", color: "#1e293b" }}>💰 {t.title}</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{t.subtitle}</div>
        </div>
        <button className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => setLang(lang === "th" ? "en" : "th")}>{t.lang}</button>
      </div>

      {/* ═══════════ DASHBOARD ═══════════ */}
      {tab === "dashboard" && (
        <div style={{ padding: "16px 20px", animation: "fadeIn 0.4s ease" }}>
          {wallets.length > 0 && (
            <div className="card" style={{ background: "#fff", borderColor: "#e8ecf1", textAlign: "center", padding: "20px 20px 16px" }}>
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>{t.totalBalance}</div>
              <div className="mono" style={{ fontSize: 28, fontWeight: 700 }}>฿{fmt(totalBalance)}</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 12 }}>
                {[{ l: t.cash, v: walletBalanceByType.cash, c: "#10b981" }, { l: t.bank, v: walletBalanceByType.bank, c: "#6366f1" }, { l: t.investment, v: walletBalanceByType.invest, c: "#f59e0b" }].filter((x) => x.v !== 0).map((x, i) => (
                  <div key={i} style={{ textAlign: "center" }}><div style={{ fontSize: 10, color: "#94a3b8" }}>{x.l}</div><div className="mono" style={{ fontSize: 13, fontWeight: 600, color: x.c }}>฿{fmt(x.v)}</div></div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            {[{ l: t.today, v: todayTotal, c: "#6366f1" }, { l: t.thisWeek, v: weekTotal, c: "#f59e0b" }, { l: t.thisMonth, v: monthTotal, c: "#10b981" }].map((s, i) => (
              <div key={i} className="stat-card"><div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>{s.l}</div><div className="mono" style={{ fontSize: 15, fontWeight: 600, color: s.c }}>฿{fmt(s.v)}</div></div>
            ))}
          </div>

          <div className="card">
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>{t.byCategory}</div>
            {categoryData.length === 0 ? <div style={{ textAlign: "center", padding: 30, color: "#94a3b8", fontSize: 14 }}>{t.noData}</div> : (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 130, height: 130, flexShrink: 0 }}>
                  <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categoryData} dataKey="value" cx="50%" cy="50%" outerRadius={55} innerRadius={32} strokeWidth={0}>{categoryData.map((d, i) => <Cell key={i} fill={d.color} />)}</Pie></PieChart></ResponsiveContainer>
                </div>
                <div style={{ flex: 1, fontSize: 12, display: "flex", flexDirection: "column", gap: 5 }}>
                  {categoryData.map((d, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 8, height: 8, borderRadius: 2, background: d.color, flexShrink: 0 }} /><span style={{ color: "#94a3b8", fontSize: 11 }}>{d.icon} {d.name}</span></div>
                      <span className="mono" style={{ color: "#1e293b", fontWeight: 500, fontSize: 11 }}>฿{fmt(d.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="card">
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>{t.dailyTrend}</div>
            <div style={{ height: 150 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f5" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} width={45} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                  <Tooltip content={({ active, payload }) => active && payload?.length ? <div className="custom-tooltip"><span className="mono" style={{ color: "#1e293b", fontWeight: 600 }}>฿{fmt(payload[0].value)}</span></div> : null} />
                  <Bar dataKey="amount" radius={[6, 6, 0, 0]} fill="url(#barGrad)" />
                  <defs><linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#475569" /><stop offset="100%" stopColor="#94a3b8" stopOpacity={0.4} /></linearGradient></defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {budgetData.length > 0 && (
            <div className="card">
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>{t.budgetOverview}</div>
              {budgetData.map((b) => { const over = b.spent > b.budget; return (
                <div key={b.id} style={{ marginBottom: 12 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}><span>{b.icon} {b[lang]}</span><span className="mono" style={{ color: over ? "#ef4444" : "#10b981", fontSize: 12 }}>฿{fmt(b.spent)} / ฿{fmt(b.budget)}</span></div>
                  <div className="progress-bg"><div className="progress-fill" style={{ width: `${b.pct}%`, background: over ? "linear-gradient(90deg,#ef4444,#f87171)" : b.pct > 75 ? "linear-gradient(90deg,#f59e0b,#fbbf24)" : "linear-gradient(90deg,#10b981,#34d399)" }} /></div>
                </div>
              ); })}
            </div>
          )}

          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{t.recentTransactions}</div>
              {expenses.length > 0 && <button className="btn btn-ghost btn-sm" onClick={exportCSV}>📤 {t.exportCSV}</button>}
            </div>
            {expenses.length === 0 ? <div style={{ textAlign: "center", padding: 30, color: "#94a3b8", fontSize: 14 }}>{t.noData}</div> : expenses.slice(0, 6).map((e) => {
              const cat = getCat(e.category); const isI = e.type === "income"; const isT = e.type === "transfer";
              return (<div className="expense-row" key={e.id}><div style={{ fontSize: 20 }}>{isT ? "🔄" : cat?.icon}</div><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 500 }}>{isT ? (lang === "th" ? "โอนเงิน" : "Transfer") : cat?.[lang]}</div><div style={{ fontSize: 10, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.note || e.date}{e.walletId ? ` · ${getWalletLabel(e.walletId)}` : ""}</div></div>
                <div className="mono" style={{ fontSize: 14, fontWeight: 600, color: isI ? "#10b981" : isT ? "#6366f1" : "#ef4444" }}>{isI ? "+" : isT ? "" : "-"}฿{fmt(e.amount)}</div></div>);
            })}
          </div>
        </div>
      )}

      {/* ═══════════ WALLET ═══════════ */}
      {tab === "wallet" && (
        <div style={{ padding: "16px 20px", animation: "fadeIn 0.4s ease" }}>
          <div className="card" style={{ background: "#fff", borderColor: "#e8ecf1", textAlign: "center", padding: 24 }}>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>{t.totalBalance}</div>
            <div className="mono" style={{ fontSize: 32, fontWeight: 700, margin: "6px 0" }}>฿{fmt(totalBalance)}</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 8 }}>
              {[{ l: "💵 " + t.cash, v: walletBalanceByType.cash, c: "#10b981" }, { l: "🏦 " + t.bank, v: walletBalanceByType.bank, c: "#6366f1" }, { l: "📈 " + t.investment, v: walletBalanceByType.invest, c: "#f59e0b" }].map((x, i) => (
                <div key={i} style={{ textAlign: "center" }}><div style={{ fontSize: 10, color: "#94a3b8" }}>{x.l}</div><div className="mono" style={{ fontSize: 12, fontWeight: 600, color: x.c }}>฿{fmt(x.v)}</div></div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <button className="btn btn-primary" style={{ flex: 1, fontSize: 13 }} onClick={() => { setWType("cash"); setWBank("kbank"); setWAcctType("savings"); setWName(""); setWBalance(""); setShowAddWallet(true); }}>+ {t.addWallet}</button>
            {flatWallets.length >= 2 && <button className="btn btn-ghost" style={{ flex: 1, fontSize: 13 }} onClick={() => { setTfFrom(flatWallets[0]?.id); setTfTo(flatWallets[1]?.id); setTfAmount(""); setShowTransfer(true); }}>🔄 {t.transfer}</button>}
          </div>

          {wallets.length === 0 ? <div className="card" style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>{t.noWallet}</div> : wallets.map((w) => {
            const isExp = expandedWallet === w.id; const hasSubs = w.subAccounts?.length > 0;
            const wTotal = hasSubs ? w.subAccounts.reduce((s, sub) => s + (sub.balance || 0), 0) : w.balance || 0;
            return (
              <div className="wallet-card" key={w.id}>
                <div className="wallet-header" onClick={() => setExpandedWallet(isExp ? null : w.id)}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: `${w.color}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{w.icon || "💳"}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>{w.name}{w.type === "bank" && <span style={{ fontSize: 10, color: w.color, background: `${w.color}10`, padding: "2px 6px", borderRadius: 4 }}>{w.bankName}</span>}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>{w.type === "cash" ? t.cash : w.type === "bank" ? `${t.bank}${hasSubs ? ` · ${w.subAccounts.length} ${t.subAccounts}` : ""}` : t.investment}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="mono" style={{ fontSize: 16, fontWeight: 700, color: wTotal >= 0 ? "#e2e8f0" : "#ef4444" }}>฿{fmt(wTotal)}</div>
                    {hasSubs && <div style={{ fontSize: 14, color: "#94a3b8", transition: "transform 0.2s", transform: isExp ? "rotate(180deg)" : "rotate(0)" }}>▾</div>}
                  </div>
                </div>
                {isExp && hasSubs && w.subAccounts.map((sub) => (
                  <div className="sub-row" key={sub.id}><div><div style={{ fontSize: 13, fontWeight: 500 }}>{sub.name}</div><div style={{ fontSize: 10, color: "#94a3b8" }}>{ACCT_TYPES.find((a) => a.id === sub.acctType)?.[lang === "th" ? "th" : "en"] || sub.acctType}</div></div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span className="mono" style={{ fontSize: 14, fontWeight: 600, color: sub.balance >= 0 ? "#10b981" : "#ef4444" }}>฿{fmt(sub.balance || 0)}</span><button onClick={(e) => { e.stopPropagation(); deleteSubAccount(w.id, sub.id); }} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 12, padding: 2 }}>✕</button></div>
                  </div>
                ))}
                {isExp && <div style={{ padding: "10px 20px 14px", display: "flex", gap: 8, borderTop: "1px solid #f1f3f5" }}>
                  {w.type === "bank" && <button className="btn btn-ghost btn-sm" onClick={() => { setSubAcctType("savings"); setSubName(""); setSubBalance(""); setShowAddSub(w.id); }}>+ {t.addSubAccount}</button>}
                  <button className="btn btn-sm" style={{ background: "#fef2f2", color: "#ef4444" }} onClick={() => deleteWallet(w.id)}>🗑️</button>
                </div>}
              </div>
            );
          })}
        </div>
      )}

      {/* ═══════════ ANALYTICS ═══════════ */}
      {tab === "analytics" && (
        <div style={{ padding: "16px 20px", animation: "fadeIn 0.4s ease" }}>
          {/* View Toggle */}
          <div className="type-toggle" style={{ marginBottom: 16 }}>
            {[{ id: "weekly", label: t.weekly }, { id: "monthly", label: t.monthly }, { id: "yearly", label: t.yearly }].map((v) => (
              <button key={v.id} className="type-btn" style={{ background: analyticsView === v.id ? "rgba(99,102,241,0.2)" : "transparent", color: analyticsView === v.id ? "#a5b4fc" : "#64748b" }} onClick={() => setAnalyticsView(v.id)}>{v.label}</button>
            ))}
          </div>

          {/* Weekly View */}
          {analyticsView === "weekly" && (
            <>
              <div className="card">
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>{t.weeklyCompare}</div>
                <div style={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyCompareData} barCategoryGap="15%">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f5" vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} width={45} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                      <Tooltip content={({ active, payload, label }) => active && payload?.length ? (
                        <div className="custom-tooltip">
                          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>{t.weekLabel} {label}</div>
                          <div><span style={{ color: "#ef4444", fontSize: 12 }}>💸</span> <span className="mono" style={{ color: "#ef4444", fontWeight: 600, fontSize: 12 }}>฿{fmt(payload[0]?.value || 0)}</span></div>
                          {payload[1]?.value > 0 && <div><span style={{ color: "#10b981", fontSize: 12 }}>💰</span> <span className="mono" style={{ color: "#10b981", fontWeight: 600, fontSize: 12 }}>฿{fmt(payload[1]?.value || 0)}</span></div>}
                        </div>
                      ) : null} />
                      <Bar dataKey="spent" radius={[4, 4, 0, 0]} fill="#ef4444" fillOpacity={0.8} name={t.expense} />
                      <Bar dataKey="income" radius={[4, 4, 0, 0]} fill="#10b981" fillOpacity={0.8} name={t.income} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="card">
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>{t.avgPerDay}</div>
                <div style={{ height: 140 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyCompareData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f5" vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} width={45} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                      <Tooltip content={({ active, payload }) => active && payload?.length ? <div className="custom-tooltip"><span className="mono" style={{ color: "#1e293b", fontWeight: 600 }}>฿{fmt(payload[0].value)}/{lang === "th" ? "วัน" : "day"}</span></div> : null} />
                      <defs><linearGradient id="avgGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#475569" stopOpacity={0.15} /><stop offset="95%" stopColor="#475569" stopOpacity={0} /></linearGradient></defs>
                      <Area type="monotone" dataKey="avg" stroke="#475569" fill="url(#avgGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              {/* Week summary cards */}
              {weeklyCompareData.length >= 2 && (() => {
                const cur = weeklyCompareData[weeklyCompareData.length - 1];
                const prev = weeklyCompareData[weeklyCompareData.length - 2];
                const diff = prev.spent > 0 ? ((cur.spent - prev.spent) / prev.spent * 100) : 0;
                return (
                  <div style={{ display: "flex", gap: 10 }}>
                    <div className="stat-card"><div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>{t.thisWeek}</div><div className="mono" style={{ fontSize: 16, fontWeight: 600, color: "#ef4444" }}>฿{fmt(cur.spent)}</div></div>
                    <div className="stat-card"><div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>{t.vsPrev}</div><div className="mono" style={{ fontSize: 16, fontWeight: 600, color: diff > 0 ? "#ef4444" : "#10b981" }}>{diff > 0 ? "+" : ""}{diff.toFixed(0)}%</div></div>
                    <div className="stat-card"><div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>{t.avgPerDay}</div><div className="mono" style={{ fontSize: 16, fontWeight: 600, color: "#475569" }}>฿{fmt(cur.avg)}</div></div>
                  </div>
                );
              })()}
            </>
          )}

          {/* Monthly View */}
          {analyticsView === "monthly" && (
            <>
              <div className="card">
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>{t.monthlyCompare}</div>
                <div style={{ height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyCompareData} barCategoryGap="12%">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f5" vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 9 }} axisLine={false} tickLine={false} interval={0} angle={-30} textAnchor="end" height={40} />
                      <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} width={45} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                      <Tooltip content={({ active, payload, label }) => active && payload?.length ? (
                        <div className="custom-tooltip">
                          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>{label}</div>
                          {payload.map((p, i) => p.value > 0 && <div key={i}><span style={{ color: p.color, fontSize: 12 }}>{p.name === t.expense ? "💸" : p.name === t.budget ? "📋" : "💰"}</span> <span className="mono" style={{ color: p.color, fontWeight: 600, fontSize: 12 }}>{p.name}: ฿{fmt(p.value)}</span></div>)}
                        </div>
                      ) : null} />
                      <Bar dataKey="spent" radius={[4, 4, 0, 0]} fill="#ef4444" fillOpacity={0.8} name={t.expense} />
                      <Bar dataKey="income" radius={[4, 4, 0, 0]} fill="#10b981" fillOpacity={0.8} name={t.income} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              {/* Budget vs Spent line */}
              {monthlyCompareData.some((m) => m.budget > 0) && (
                <div className="card">
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>{t.budget} vs {t.totalSpent}</div>
                  <div style={{ height: 180 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyCompareData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f5" vertical={false} />
                        <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 9 }} axisLine={false} tickLine={false} interval={0} angle={-30} textAnchor="end" height={40} />
                        <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} width={45} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                        <Tooltip content={({ active, payload, label }) => active && payload?.length ? (
                          <div className="custom-tooltip">
                            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>{label}</div>
                            {payload.map((p, i) => <div key={i}><span className="mono" style={{ color: p.color, fontWeight: 600, fontSize: 12 }}>{p.name}: ฿{fmt(p.value)}</span></div>)}
                          </div>
                        ) : null} />
                        <Line type="monotone" dataKey="budget" stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 3" dot={false} name={t.budget} />
                        <Line type="monotone" dataKey="spent" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444", r: 3 }} name={t.totalSpent} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
              {/* Monthly summary */}
              {monthlyCompareData.length >= 2 && (() => {
                const cur = monthlyCompareData[monthlyCompareData.length - 1];
                const prev = monthlyCompareData[monthlyCompareData.length - 2];
                const diff = prev.spent > 0 ? ((cur.spent - prev.spent) / prev.spent * 100) : 0;
                return (
                  <div style={{ display: "flex", gap: 10 }}>
                    <div className="stat-card"><div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>{t.thisMonth}</div><div className="mono" style={{ fontSize: 16, fontWeight: 600, color: "#ef4444" }}>฿{fmt(cur.spent)}</div></div>
                    <div className="stat-card"><div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>{t.vsPrev}</div><div className="mono" style={{ fontSize: 16, fontWeight: 600, color: diff > 0 ? "#ef4444" : "#10b981" }}>{diff > 0 ? "+" : ""}{diff.toFixed(0)}%</div></div>
                    <div className="stat-card"><div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>{t.income}</div><div className="mono" style={{ fontSize: 16, fontWeight: 600, color: "#10b981" }}>฿{fmt(cur.income)}</div></div>
                  </div>
                );
              })()}
            </>
          )}

          {/* Yearly View */}
          {analyticsView === "yearly" && (
            <>
              <div className="card">
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>{t.yearlyCompare}</div>
                {yearlyCompareData.length === 0 ? <div style={{ textAlign: "center", padding: 30, color: "#94a3b8", fontSize: 14 }}>{t.noData}</div> : (
                  <div style={{ height: 220 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={yearlyCompareData} barCategoryGap="20%">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f5" vertical={false} />
                        <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} width={50} tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                        <Tooltip content={({ active, payload, label }) => active && payload?.length ? (
                          <div className="custom-tooltip">
                            <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>{label}</div>
                            {payload.map((p, i) => <div key={i}><span className="mono" style={{ color: p.color, fontWeight: 600, fontSize: 12 }}>{p.name}: ฿{fmt(p.value)}</span></div>)}
                          </div>
                        ) : null} />
                        <Bar dataKey="spent" radius={[4, 4, 0, 0]} fill="#ef4444" fillOpacity={0.8} name={t.expense} />
                        <Bar dataKey="income" radius={[4, 4, 0, 0]} fill="#10b981" fillOpacity={0.8} name={t.income} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
              {yearlyCompareData.length > 0 && (
                <div className="card">
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>{t.incomeVsExpense}</div>
                  {yearlyCompareData.map((y) => (
                    <div key={y.label} style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
                        <span style={{ fontWeight: 600 }}>{y.label}</span>
                        <span className="mono" style={{ color: y.net >= 0 ? "#10b981" : "#ef4444", fontSize: 12, fontWeight: 600 }}>{y.net >= 0 ? "+" : ""}฿{fmt(y.net)}</span>
                      </div>
                      <div style={{ display: "flex", gap: 4, height: 8, borderRadius: 4, overflow: "hidden", background: "#f1f3f5" }}>
                        {y.income > 0 && <div style={{ width: `${y.income / (y.income + y.spent) * 100}%`, background: "linear-gradient(90deg,#10b981,#34d399)", borderRadius: 4 }} />}
                        {y.spent > 0 && <div style={{ width: `${y.spent / (y.income + y.spent) * 100}%`, background: "linear-gradient(90deg,#ef4444,#f87171)", borderRadius: 4 }} />}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 10, color: "#94a3b8" }}>
                        <span>💰 ฿{fmt(y.income)}</span>
                        <span>💸 ฿{fmt(y.spent)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ═══════════ HISTORY ═══════════ */}
      {tab === "history" && (
        <div style={{ padding: "16px 20px", animation: "fadeIn 0.4s ease" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><div style={{ fontSize: 16, fontWeight: 600 }}>{t.history}</div>{expenses.length > 0 && <button className="btn btn-ghost btn-sm" onClick={exportCSV}>📤 {t.exportCSV}</button>}</div>
          {expenses.length === 0 ? <div className="card" style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>{t.noData}</div> : (() => {
            const grouped = {}; [...expenses].sort((a, b) => b.date.localeCompare(a.date)).forEach((e) => { if (!grouped[e.date]) grouped[e.date] = []; grouped[e.date].push(e); });
            return Object.entries(grouped).map(([date, items]) => (
              <div key={date} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, marginBottom: 8, display: "flex", justifyContent: "space-between" }}><span>{date === todayStr ? (lang === "th" ? "วันนี้" : "Today") : date}</span><span className="mono" style={{ color: "#94a3b8" }}>฿{fmt(items.filter((e) => e.type === "expense").reduce((s, e) => s + e.amount, 0))}</span></div>
                <div className="card" style={{ marginBottom: 0 }}>
                  {items.map((e) => { const cat = getCat(e.category); const isI = e.type === "income"; const isT = e.type === "transfer"; return (
                    <div className="expense-row" key={e.id}><div style={{ fontSize: 20 }}>{isT ? "🔄" : cat?.icon}</div><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 500 }}>{isT ? (lang === "th" ? "โอนเงิน" : "Transfer") : cat?.[lang]}</div><div style={{ fontSize: 10, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.note || ""}{e.walletId ? ` · ${getWalletLabel(e.walletId)}` : ""}</div></div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span className="mono" style={{ fontSize: 14, fontWeight: 600, color: isI ? "#10b981" : isT ? "#6366f1" : "#ef4444" }}>{isI ? "+" : isT ? "" : "-"}฿{fmt(e.amount)}</span>{!isT && <button onClick={() => deleteExpense(e.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 12, padding: 2 }}>✕</button>}</div></div>
                  ); })}
                </div>
              </div>
            ));
          })()}
        </div>
      )}

      {/* ═══════════ SETTINGS ═══════════ */}
      {tab === "settings" && (
        <div style={{ padding: "16px 20px", animation: "fadeIn 0.4s ease" }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>{t.setBudget}</div>
          {/* Month Picker */}
          <div className="card" style={{ padding: 14, marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>{t.budgetMonth}</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <select className="select" value={budgetMonth} onChange={(e) => setBudgetMonth(e.target.value)} style={{ flex: 1 }}>
                {getMonthOptions(24).map((m) => <option key={m} value={m}>{getMonthLabel(m, lang)}</option>)}
              </select>
              <button className="btn btn-ghost btn-sm" onClick={copyPrevMonth} style={{ whiteSpace: "nowrap", padding: "8px 12px" }}>📋 {t.copyPrev}</button>
            </div>
          </div>
          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: "#1e293b" }}>📋 {getMonthLabel(budgetMonth, lang)}</div>
            {CATEGORIES.map((c) => (<div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}><div style={{ width: 95, fontSize: 12, display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}><span>{c.icon}</span><span>{c[lang]}</span></div><input className="input" type="number" placeholder="0" value={editBudget[c.id] || ""} onChange={(e) => setEditBudget({ ...editBudget, [c.id]: e.target.value })} style={{ flex: 1, padding: "8px 12px", fontSize: 14 }} /></div>))}
            <button className="btn btn-primary" style={{ width: "100%", marginTop: 12, padding: 12 }} onClick={saveBudgets}>{t.save}</button>
          </div>
          <button className="btn" style={{ width: "100%", marginTop: 8, padding: 12, background: "#fef2f2", color: "#ef4444", border: "1px solid #fecaca" }} onClick={resetAll}>🗑️ {t.reset}</button>

          {/* App info */}
          <div style={{ marginTop: 24, textAlign: "center", color: "#94a3b8", fontSize: 11 }}>
            <div>Expense Tracker PWA v1.0</div>
            <div style={{ marginTop: 4 }}>💾 {lang === "th" ? "ข้อมูลเก็บในเครื่องของคุณ" : "Data stored locally on your device"}</div>
            {isInstalled && <div style={{ marginTop: 4, color: "#10b981" }}>✅ {lang === "th" ? "ติดตั้งเป็นแอปแล้ว" : "Installed as app"}</div>}
          </div>
        </div>
      )}

      {/* ═══════════ MODALS ═══════════ */}

      <Modal show={showAdd} onClose={() => setShowAdd(false)} title={expType === "expense" ? t.addExpense : t.addIncome}>
        <div className="type-toggle" style={{ marginBottom: 16 }}>
          <button className="type-btn" style={{ background: expType === "expense" ? "#fef2f2" : "transparent", color: expType === "expense" ? "#ef4444" : "#94a3b8" }} onClick={() => { setExpType("expense"); setSelectedCat("food"); }}>💸 {t.expense}</button>
          <button className="type-btn" style={{ background: expType === "income" ? "#ecfdf5" : "transparent", color: expType === "income" ? "#10b981" : "#94a3b8" }} onClick={() => { setExpType("income"); setSelectedCat("salary"); }}>💰 {t.income}</button>
        </div>
        <div style={{ marginBottom: 14 }}><div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>{t.date}</div><input className="input" type="date" value={expDate} onChange={(e) => setExpDate(e.target.value)} /></div>
        <div style={{ marginBottom: 14 }}><div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>{t.amount}</div><input className="input mono" type="number" inputMode="decimal" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus style={{ fontSize: 24, fontWeight: 700, textAlign: "center", padding: "16px" }} /></div>
        {flatWallets.length > 0 && (<div style={{ marginBottom: 14 }}><div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>{t.fromWallet}</div><select className="select" value={expWallet} onChange={(e) => setExpWallet(e.target.value)}><option value="">— {t.none} —</option>{flatWallets.map((fw) => <option key={fw.id} value={fw.id}>{fw.label} (฿{fmt(fw.balance || 0)})</option>)}</select></div>)}
        <div style={{ marginBottom: 14 }}><div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>{t.category}</div><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{(expType === "income" ? INCOME_CATEGORIES : CATEGORIES).map((c) => <Chip key={c.id} active={selectedCat === c.id} onClick={() => setSelectedCat(c.id)}>{c.icon} {c[lang]}</Chip>)}</div></div>
        <div style={{ marginBottom: 20 }}><div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>{t.note}</div><input className="input" placeholder={lang === "th" ? "เช่น ข้าวมันไก่, BTC Long..." : "e.g. Chicken rice, BTC Long..."} value={note} onChange={(e) => setNote(e.target.value)} /></div>
        <button className="btn btn-primary" style={{ width: "100%", padding: 14, fontSize: 15 }} onClick={addExpenseAction}>{t.add}</button>
      </Modal>

      <Modal show={showAddWallet} onClose={() => setShowAddWallet(false)} title={t.addWallet}>
        <div style={{ marginBottom: 14 }}><div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>{t.walletType}</div><div style={{ display: "flex", gap: 8 }}>{[{ id: "cash", icon: "💵", l: t.cash }, { id: "bank", icon: "🏦", l: t.bank }, { id: "invest", icon: "📈", l: t.investment }].map((wt) => <Chip key={wt.id} active={wType === wt.id} onClick={() => setWType(wt.id)}>{wt.icon} {wt.l}</Chip>)}</div></div>
        {wType === "bank" && (<>
          <div style={{ marginBottom: 14 }}><div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>{t.selectBank}</div><select className="select" value={wBank} onChange={(e) => setWBank(e.target.value)}>{THAI_BANKS.map((b) => <option key={b.id} value={b.id}>{b.icon} {lang === "th" ? b.name : b.en}</option>)}</select></div>
          <div style={{ marginBottom: 14 }}><div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>{t.accountType}</div><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{ACCT_TYPES.map((at) => <Chip key={at.id} active={wAcctType === at.id} onClick={() => setWAcctType(at.id)}>{lang === "th" ? at.th : at.en}</Chip>)}</div></div>
        </>)}
        <div style={{ marginBottom: 14 }}><div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>{wType === "invest" ? t.portName : wType === "bank" ? (lang === "th" ? "ชื่อบัญชีย่อย" : "Sub-account Name") : t.walletName} ({t.optional})</div><input className="input" placeholder={wType === "bank" ? (lang === "th" ? "เช่น บัญชีเงินเดือน, บัญชีออม" : "e.g. Salary, Savings") : ""} value={wName} onChange={(e) => setWName(e.target.value)} /></div>
        <div style={{ marginBottom: 20 }}><div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>{t.balance}</div><input className="input mono" type="number" inputMode="decimal" placeholder="0" value={wBalance} onChange={(e) => setWBalance(e.target.value)} style={{ fontSize: 18, textAlign: "center", padding: 14 }} /></div>
        <button className="btn btn-primary" style={{ width: "100%", padding: 14 }} onClick={addWalletAction}>{t.add}</button>
      </Modal>

      <Modal show={!!showAddSub} onClose={() => setShowAddSub(null)} title={t.addSubAccount}>
        <div style={{ marginBottom: 14 }}><div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>{t.accountType}</div><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{ACCT_TYPES.map((at) => <Chip key={at.id} active={subAcctType === at.id} onClick={() => setSubAcctType(at.id)}>{lang === "th" ? at.th : at.en}</Chip>)}</div></div>
        <div style={{ marginBottom: 14 }}><div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>{t.walletName} ({t.optional})</div><input className="input" placeholder={lang === "th" ? "เช่น บัญชีเงินเดือน" : "e.g. Salary account"} value={subName} onChange={(e) => setSubName(e.target.value)} /></div>
        <div style={{ marginBottom: 20 }}><div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>{t.balance}</div><input className="input mono" type="number" inputMode="decimal" placeholder="0" value={subBalance} onChange={(e) => setSubBalance(e.target.value)} style={{ fontSize: 18, textAlign: "center", padding: 14 }} /></div>
        <button className="btn btn-primary" style={{ width: "100%", padding: 14 }} onClick={addSubAccountAction}>{t.add}</button>
      </Modal>

      <Modal show={showTransfer} onClose={() => setShowTransfer(false)} title={t.transfer}>
        <div style={{ marginBottom: 14 }}><div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>{t.transferFrom}</div><select className="select" value={tfFrom} onChange={(e) => setTfFrom(e.target.value)}>{flatWallets.map((fw) => <option key={fw.id} value={fw.id}>{fw.label} (฿{fmt(fw.balance || 0)})</option>)}</select></div>
        <div style={{ textAlign: "center", fontSize: 20, color: "#94a3b8", margin: "4px 0" }}>↓</div>
        <div style={{ marginBottom: 14 }}><div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>{t.transferTo}</div><select className="select" value={tfTo} onChange={(e) => setTfTo(e.target.value)}>{flatWallets.map((fw) => <option key={fw.id} value={fw.id}>{fw.label} (฿{fmt(fw.balance || 0)})</option>)}</select></div>
        <div style={{ marginBottom: 20 }}><div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>{t.transferAmount}</div><input className="input mono" type="number" inputMode="decimal" placeholder="0" value={tfAmount} onChange={(e) => setTfAmount(e.target.value)} style={{ fontSize: 22, fontWeight: 700, textAlign: "center", padding: 16 }} /></div>
        <button className="btn btn-primary" style={{ width: "100%", padding: 14 }} onClick={transferAction}>{t.confirm}</button>
      </Modal>

      {/* FAB */}
      <button onClick={() => { setExpType("expense"); setShowAdd(true); }} style={{ position: "fixed", bottom: 76, right: "max(20px, calc(50% - 220px))", width: 54, height: 54, borderRadius: 16, background: "#1e293b", color: "#fff", border: "none", fontSize: 28, cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 40, transition: "transform 0.15s", WebkitTapHighlightColor: "transparent" }}>+</button>

      {/* Bottom Nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#fff",  borderTop: "1px solid #e8ecf1", display: "flex", zIndex: 30, paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        {[{ id: "dashboard", icon: "📊", label: t.dashboard }, { id: "wallet", icon: "👛", label: t.wallet }, { id: "analytics", icon: "📈", label: t.analytics }, { id: "history", icon: "📋", label: t.history }, { id: "settings", icon: "⚙️", label: t.settings }].map((item) => (
          <button key={item.id} className={`tab ${tab === item.id ? "active" : ""}`} onClick={() => setTab(item.id)}><div className="tab-icon">{item.icon}</div><div>{item.label}</div></button>
        ))}
      </div>
    </div>
  );
}
