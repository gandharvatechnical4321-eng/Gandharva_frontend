import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useSelector } from "react-redux";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Clock3,
  DollarSign,
  Loader2,
  RefreshCw,
  Search,
  Users,
  Wallet,
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";
const CLOSED_STATUSES = ["Task Completed", "Cancel", "Refund"];
const IN_PROGRESS_STATUSES = new Set([
  "New Task",
  "Advance Received",
  "Tutor Notified",
  "Tutor Assigned",
  "Solution Received",
  "Being Modified",
]);

const normalizeStatus = (value) => String(value || "").trim();

const isInProgressStatus = (status) => IN_PROGRESS_STATUSES.has(normalizeStatus(status));

const normalizeRole = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ");

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getTaskDate = (task) => task?.createdAt || task?.clientDeadline || null;

const isInDateRange = (task, startDate, endDate) => {
  const date = getTaskDate(task);
  if (!date) return !startDate && !endDate;

  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return false;

  if (startDate && value < new Date(`${startDate}T00:00:00`)) return false;
  if (endDate && value > new Date(`${endDate}T23:59:59.999`)) return false;
  return true;
};

const statusTone = (status) => {
  if (status === "Task Completed") return "bg-emerald-500";
  if (["Cancel", "Refund"].includes(status)) return "bg-rose-500";
  if (status === "In Progress") return "bg-amber-500";
  if (["Advance Received", "Tutor Notified"].includes(status)) return "bg-amber-500";
  return "bg-indigo-500";
};

const getMonthLabel = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });

const getWeekNumberForDate = (date) => {
  const day = new Date(date).getDate();
  if (day <= 7) return 1;
  if (day <= 15) return 2;
  if (day <= 23) return 3;
  return 4;
};

const getWeekLabel = (weekNumber) => {
  const ranges = {
    1: "1-7",
    2: "8-15",
    3: "16-23",
    4: "24-end",
  };
  return ranges[weekNumber] || "Week";
};

const buildMonthlyTrend = (records, dateAccessor, amountAccessor) => {
  const byMonth = new Map();

  (records || []).forEach((record) => {
    const valueDate = dateAccessor(record);
    const date = valueDate ? new Date(valueDate) : null;

    if (!date || Number.isNaN(date.getTime())) return;

    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    if (!byMonth.has(monthKey)) {
      byMonth.set(monthKey, {
        key: monthKey,
        monthDate: new Date(date.getFullYear(), date.getMonth(), 1),
        label: getMonthLabel(date),
        total: 0,
        weeks: {
          1: 0,
          2: 0,
          3: 0,
          4: 0,
        },
      });
    }

    const entry = byMonth.get(monthKey);
    const amount = Number(amountAccessor(record) || 0);
    entry.total += amount;

    const weekNumber = getWeekNumberForDate(date);
    entry.weeks[weekNumber] += amount;
  });

  const series = [...byMonth.values()].sort((a, b) => a.monthDate - b.monthDate);
  const maxAmount = series.length ? Math.max(...series.map((item) => item.total), 1) : 1;

  return series.map((item) => ({
    ...item,
    weeks: [1, 2, 3, 4].map((weekNumber) => ({
      weekNumber,
      label: getWeekLabel(weekNumber),
      total: item.weeks[weekNumber],
    })),
    barWidth: `${(item.total / maxAmount) * 100}%`,
  }));
};

const normalizeQueryStatus = (value) => {
  const status = String(value || "").trim().toLowerCase();
  if (!status) return "Pending";
  if (["done", "completed", "success", "converted"].some((keyword) => status.includes(keyword))) return "Done";
  if (["cancel", "canceled", "rejected", "not interested", "drop", "closed"].some((keyword) => status.includes(keyword))) return "Cancel";
  if (["pending", "new", "in progress", "follow up", "waiting"].some((keyword) => status.includes(keyword))) return "Pending";
  return "Other";
};

const buildQueryAnalytics = (records, startDate, endDate, viewMode) => {
  const safeRecords = Array.isArray(records) ? records : [];
  const filtered = safeRecords.filter((record) => {
    const dateValue = record?.queryDate || record?.createdAt || null;
    if (!dateValue) return true;

    const value = new Date(dateValue);
    if (Number.isNaN(value.getTime())) return true;

    if (startDate && value < new Date(`${startDate}T00:00:00`)) return false;
    if (endDate && value > new Date(`${endDate}T23:59:59.999`)) return false;
    return true;
  });

  const statusColors = {
    Done: "#10b981",
    Cancel: "#f43f5e",
    Pending: "#f59e0b",
    Other: "#64748b",
  };

  const counts = filtered.reduce((result, record) => {
    const status = normalizeQueryStatus(record?.queryStatus);
    result[status] = (result[status] || 0) + 1;
    return result;
  }, {});

  const summary = {
    total: filtered.length,
    done: counts.Done || 0,
    cancel: counts.Cancel || 0,
    pending: (counts.Pending || 0) + (counts.Other || 0),
    conversionRate: filtered.length - (counts.Cancel || 0) > 0 ? Number((((counts.Done || 0) / Math.max(filtered.length - (counts.Cancel || 0), 1)) * 100).toFixed(1)) : 0,
  };

  const breakdown = Object.entries({
    Done: counts.Done || 0,
    Cancel: counts.Cancel || 0,
    Pending: counts.Pending || 0,
    Other: counts.Other || 0,
  })
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({
      status,
      count,
      percentage: summary.total ? Math.round((count / summary.total) * 100) : 0,
      color: statusColors[status] || "#64748b",
    }))
    .sort((a, b) => b.count - a.count);

  const groupMap = new Map();
  const addGroup = (key, label, date) => {
    if (!groupMap.has(key)) {
      groupMap.set(key, {
        key,
        label,
        total: 0,
        statuses: Object.fromEntries(Object.keys(statusColors).map((status) => [status, 0])),
      });
    }

    const item = groupMap.get(key);
    const monthLabel = date ? getMonthLabel(date) : label;
    item.label = monthLabel;
    return item;
  };

  filtered.forEach((record) => {
    const dateValue = record?.queryDate || record?.createdAt || null;
    const date = dateValue ? new Date(dateValue) : null;
    if (!date || Number.isNaN(date.getTime())) return;

    if (viewMode === "week") {
      const weekNumber = getWeekNumberForDate(date);
      const key = `${date.getFullYear()}-${date.getMonth()}-W${weekNumber}`;
      const label = `${getMonthLabel(date)} · W${weekNumber}`;
      const item = addGroup(key, label, date);
      const status = normalizeQueryStatus(record?.queryStatus);
      item.total += 1;
      item.statuses[status] = (item.statuses[status] || 0) + 1;
      return;
    }

    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const item = addGroup(key, getMonthLabel(date), date);
    const status = normalizeQueryStatus(record?.queryStatus);
    item.total += 1;
    item.statuses[status] = (item.statuses[status] || 0) + 1;
  });

  const groups = [...groupMap.values()]
    .sort((a, b) => (a.label || "").localeCompare(b.label || ""))
    .map((item) => ({
      ...item,
      statuses: Object.entries(item.statuses)
        .filter(([, count]) => count > 0)
        .map(([status, count]) => ({
          status,
          count,
          color: statusColors[status] || "#64748b",
        })),
    }));

  return { summary, breakdown, groups };
};

const getLastTwoMonthsRange = () => {
  const endDate = new Date();
  const startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1);

  const toInputValue = (date) => date.toISOString().split("T")[0];

  return {
    start: toInputValue(startDate),
    end: toInputValue(endDate),
  };
};

const Reports = () => {
  const deviceDetails = useSelector((state) => state.contacts?.deviceDetails);
  const reduxRole = useSelector((state) => state.auth?.user?.role);
  const role = normalizeRole(deviceDetails?.role || reduxRole || Cookies.get("role"));
  const canViewFinancials = role === "admin" || role === "owner";

  const [tasks, setTasks] = useState([]);
  const [payments, setPayments] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const defaultTrendRange = useMemo(() => getLastTwoMonthsRange(), []);
  const [trendFilterDraft, setTrendFilterDraft] = useState(defaultTrendRange);
  const [trendStartDate, setTrendStartDate] = useState(defaultTrendRange.start);
  const [trendEndDate, setTrendEndDate] = useState(defaultTrendRange.end);
  const [search, setSearch] = useState("");
  const [queryTrendDraft, setQueryTrendDraft] = useState(getLastTwoMonthsRange());
  const [queryTrendStartDate, setQueryTrendStartDate] = useState(getLastTwoMonthsRange().start);
  const [queryTrendEndDate, setQueryTrendEndDate] = useState(getLastTwoMonthsRange().end);
  const [queryViewMode, setQueryViewMode] = useState("month");
  const [queryReport, setQueryReport] = useState({
    summary: { total: 0, done: 0, cancel: 0, pending: 0, conversionRate: 0 },
    breakdown: [],
    groups: [],
  });
  const queryPieStyle = useMemo(() => {
    const colors = {
      Done: "#10b981",
      Cancel: "#f43f5e",
      Pending: "#f59e0b",
      Other: "#64748b",
    };

    const total = queryReport.summary.total || 0;
    if (!total) return "conic-gradient(#e2e8f0 0 100%)";

    let start = 0;
    const segments = queryReport.breakdown.map((item) => {
      const percent = (item.count / total) * 100;
      const end = start + percent;
      const chunk = `${colors[item.status] || "#64748b"} ${start}% ${end}%`;
      start = end;
      return chunk;
    });

    return `conic-gradient(${segments.join(", ")})`;
  }, [queryReport.breakdown, queryReport.summary.total]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchReports = useCallback(async (signal) => {
    const token = Cookies.get("token") || localStorage.getItem("token");
    if (!BACKEND_URL) {
      setError("Backend URL is not configured.");
      setLoading(false);
      return;
    }
    if (!token) {
      setError("Your login session has expired. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const headers = { Authorization: `Bearer ${token}` };
      const requests = [
        axios.get(`${BACKEND_URL}/api/task/client-deadline/alltask`, {
          params: { page: 1, limit: 10000, searchQuery: "" }, headers, signal,
        }),
      ];
      if (canViewFinancials) {
        requests.push(axios.get(`${BACKEND_URL}/api/tutor-payments`, {
          params: { page: 1, limit: 10000 }, headers, signal,
        }));
      }

      const responses = await Promise.all(requests);
      const taskResponse = responses[0]?.data;
      const paymentResponse = responses[1]?.data;
      
      if (!taskResponse?.success) {
        throw new Error(taskResponse?.message || "Unable to load task reports.");
      }
      
      setTasks(Array.isArray(taskResponse.data) ? taskResponse.data : []);
      setPayments(canViewFinancials && Array.isArray(paymentResponse?.payments) ? paymentResponse.payments : []);
      setLastUpdated(new Date());
    } catch (requestError) {
      if (requestError.code === "ERR_CANCELED" || signal?.aborted) return;
      setError(requestError.response?.data?.message || requestError.message || "Unable to load reports.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [canViewFinancials]);

  useEffect(() => {
    const controller = new AbortController();
    fetchReports(controller.signal);
    return () => controller.abort();
  }, [fetchReports]);

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tasks.filter((task) => {
      if (!isInDateRange(task, startDate, endDate)) return false;
      if (!query) return true;
      return [task?.taskID, task?.subject, task?.status, task?.clientDetails?.name, task?.clientDetails?.chatID, task?.tutorDetails?.name, task?.tutorDetails?.tutorID]
        .filter(Boolean).join(" ").toLowerCase().includes(query);
    });
  }, [tasks, search, startDate, endDate]);

  const taskStats = useMemo(() => {
    const total = filteredTasks.length;
    const completed = filteredTasks.filter((task) => normalizeStatus(task?.status) === "Task Completed").length;
    const cancelled = filteredTasks.filter((task) => ["Cancel", "Refund"].includes(normalizeStatus(task?.status))).length;
    const active = filteredTasks.filter((task) => isInProgressStatus(task?.status)).length;
    const unassigned = filteredTasks.filter((task) => ["Advance Received", "Tutor Notified"].includes(normalizeStatus(task?.status)) && !task?.tutorDetails?.tutorID).length;
    
    const newTasks = filteredTasks.filter((task) => normalizeStatus(task?.status) === "New Task").length;

    // Client Received Amount: Sum of total amounts for tasks where advance payment was received ("Advance Received" status)
    const clientReceivedAmount = filteredTasks
      .filter((task) => normalizeStatus(task?.status) === "Advance Received")
      .reduce((sum, task) => sum + Number(task?.clientDetails?.totalAmount || 0), 0);

    // Refund Amount: Sum of total amounts for all refunded tasks ("Refund" status)
    const refundAmount = filteredTasks
      .filter((task) => normalizeStatus(task?.status) === "Refund")
      .reduce((sum, task) => sum + Number(task?.clientDetails?.totalAmount || 0), 0);
    
    const overdue = filteredTasks.filter((task) => {
      const deadline = new Date(task?.tutorDeadline);
      return !Number.isNaN(deadline.getTime()) && deadline < new Date() && !CLOSED_STATUSES.includes(normalizeStatus(task?.status));
    }).length;
    
    const statusCounts = filteredTasks.reduce((result, task) => {
      const status = normalizeStatus(task?.status || "Unknown");
      const bucket = isInProgressStatus(status) ? "In Progress" : status;
      result[bucket] = (result[bucket] || 0) + 1;
      return result;
    }, {});
    
    return { 
      total, completed, cancelled, active, unassigned, overdue, newTasks, 
      clientReceivedAmount, refundAmount, 
      completionRate: total ? Math.round((completed / total) * 100) : 0, 
      statusCounts 
    };
  }, [filteredTasks]);

  const paymentStats = useMemo(() => {
    const query = search.trim().toLowerCase();
    const visiblePayments = payments.filter((payment) => {
      if (!isInDateRange({ createdAt: payment?.taskDate }, startDate, endDate)) return false;
      return !query || [payment?.taskID, payment?.subject, payment?.tutorID, payment?.tutorName].filter(Boolean).join(" ").toLowerCase().includes(query);
    });
    return {
      total: visiblePayments.reduce((sum, item) => sum + Number(item?.tutorAmount || 0), 0),
      paid: visiblePayments.filter((item) => item?.paid || item?.paymentApprovalStatus === "Paid").reduce((sum, item) => sum + Number(item?.amountPaid || item?.tutorAmount || 0), 0),
      pending: visiblePayments.filter((item) => !item?.paid && item?.paymentApprovalStatus !== "Paid").reduce((sum, item) => sum + Number(item?.remainingAmount || item?.tutorAmount || 0), 0),
      count: visiblePayments.length,
    };
  }, [payments, search, startDate, endDate]);

  const tutorPaymentTrend = useMemo(() => {
    const query = search.trim().toLowerCase();
    const visiblePayments = payments.filter((payment) => {
      const dateValue = payment?.taskDate || payment?.createdAt;
      const paymentDate = dateValue ? new Date(dateValue) : null;
      if (trendStartDate && paymentDate && paymentDate < new Date(`${trendStartDate}T00:00:00`)) return false;
      if (trendEndDate && paymentDate && paymentDate > new Date(`${trendEndDate}T23:59:59.999`)) return false;
      if (!isInDateRange({ createdAt: payment?.taskDate }, startDate, endDate)) return false;
      return !query || [payment?.taskID, payment?.subject, payment?.tutorID, payment?.tutorName].filter(Boolean).join(" ").toLowerCase().includes(query);
    });

    return buildMonthlyTrend(
      visiblePayments,
      (payment) => payment?.taskDate || payment?.createdAt,
      (payment) => Number(payment?.tutorAmount || payment?.amountPaid || payment?.paidAmount || 0)
    );
  }, [payments, search, startDate, endDate, trendStartDate, trendEndDate]);

  const clientReceivedTrend = useMemo(() => {
    const query = search.trim().toLowerCase();
    const visibleTasks = filteredTasks.filter((task) => {
      const status = normalizeStatus(task?.status);
      if (status !== "Advance Received") return false;
      const taskDate = task?.createdAt || task?.clientDeadline;
      const parsedDate = taskDate ? new Date(taskDate) : null;
      if (trendStartDate && parsedDate && parsedDate < new Date(`${trendStartDate}T00:00:00`)) return false;
      if (trendEndDate && parsedDate && parsedDate > new Date(`${trendEndDate}T23:59:59.999`)) return false;
      return !query || [task?.taskID, task?.subject, task?.status, task?.clientDetails?.name, task?.clientDetails?.chatID, task?.tutorDetails?.name, task?.tutorDetails?.tutorID]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });

    return buildMonthlyTrend(
      visibleTasks,
      (task) => task?.createdAt || task?.clientDeadline,
      (task) => Number(task?.clientDetails?.totalAmount || 0)
    );
  }, [filteredTasks, search, trendStartDate, trendEndDate]);

  const reportCards = [
    { label: "Total tasks", value: taskStats.total, icon: ClipboardList, color: "bg-indigo-50 text-indigo-600" },
    { label: "Active tasks", value: taskStats.active, icon: Clock3, color: "bg-blue-50 text-blue-600" },
    { label: "Completed", value: taskStats.completed, icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600" },
    { label: "Overdue", value: taskStats.overdue, icon: AlertTriangle, color: "bg-rose-50 text-rose-600" },
  ];

  const clearFilters = () => {
    const resetRange = getLastTwoMonthsRange();
    setStartDate("");
    setEndDate("");
    setTrendFilterDraft(resetRange);
    setTrendStartDate(resetRange.start);
    setTrendEndDate(resetRange.end);
    setSearch("");
  };

  const applyTrendFilter = () => {
    const nextStart = trendFilterDraft.start || "";
    const nextEnd = trendFilterDraft.end || "";
    setTrendStartDate(nextStart);
    setTrendEndDate(nextEnd);
  };

  const resetTrendFilter = () => {
    const resetRange = getLastTwoMonthsRange();
    setTrendFilterDraft(resetRange);
    setTrendStartDate(resetRange.start);
    setTrendEndDate(resetRange.end);
  };

  const applyQueryTrendFilter = () => {
    const nextStart = queryTrendDraft.start || "";
    const nextEnd = queryTrendDraft.end || "";
    setQueryTrendStartDate(nextStart);
    setQueryTrendEndDate(nextEnd);
  };

  const resetQueryTrendFilter = () => {
    const resetRange = getLastTwoMonthsRange();
    setQueryTrendDraft(resetRange);
    setQueryTrendStartDate(resetRange.start);
    setQueryTrendEndDate(resetRange.end);
  };

  useEffect(() => {
    const controller = new AbortController();
    const token = Cookies.get("token") || localStorage.getItem("token");

    const fetchQueryReport = async () => {
      if (!token) {
        setQueryReport({ summary: { total: 0, done: 0, cancel: 0, pending: 0, conversionRate: 0 }, breakdown: [], groups: [] });
        return;
      }

      try {
        const response = await axios.get(`${BACKEND_URL}/api/query/report`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            startDate: queryTrendStartDate || undefined,
            endDate: queryTrendEndDate || undefined,
          },
          signal: controller.signal,
        });

        if (!response.data?.success) {
          throw new Error(response.data?.message || "Unable to load query analytics.");
        }

        const nextReport = buildQueryAnalytics(response.data.queries || [], queryTrendStartDate, queryTrendEndDate, queryViewMode);
        setQueryReport(nextReport);
      } catch (requestError) {
        if (requestError.code === "ERR_CANCELED" || controller.signal.aborted) return;
        setQueryReport({ summary: { total: 0, done: 0, cancel: 0, pending: 0, conversionRate: 0 }, breakdown: [], groups: [] });
      }
    };

    fetchQueryReport();
    return () => controller.abort();
  }, [queryTrendStartDate, queryTrendEndDate, queryViewMode]);

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-slate-50">
      <header className="shrink-0 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"><BarChart3 size={22} /></div>
              <div className="min-w-0">
                <h1 className="truncate text-xl font-black text-slate-950">Reports</h1>
                <p className="text-xs font-medium text-slate-500">{canViewFinancials ? "Operational and financial overview" : "Operational performance overview"}{lastUpdated && ` · Updated ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}</p>
              </div>
            </div>
            <button type="button" onClick={() => fetchReports()} disabled={loading} className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"><RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh</button>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]"><div className="relative min-w-0"><Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search task, client, or tutor..." className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-semibold outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50" /></div><input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-600 outline-none focus:border-indigo-400" aria-label="Report start date" /><input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-600 outline-none focus:border-indigo-400" aria-label="Report end date" /></div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-5"><div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
        {error && <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"><span>{error}</span><button type="button" onClick={() => fetchReports()} className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-rose-700 shadow-sm">Try again</button></div>}
        {loading && tasks.length === 0 ? <div className="flex min-h-[45vh] items-center justify-center rounded-2xl border border-slate-200 bg-white"><div className="flex items-center gap-2 text-sm font-bold text-slate-500"><Loader2 size={20} className="animate-spin text-indigo-600" /> Loading reports...</div></div> : <>
          
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{reportCards.map(({ label, value, icon: Icon, color }) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${color}`}><Icon size={18} /></div><p className="text-xs font-bold text-slate-500">{label}</p><p className="mt-1 text-2xl font-black text-slate-900">{value}</p></div>)}</div>
          
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,1fr)]">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-black text-slate-900">Task status breakdown</h2>
                  <p className="mt-1 text-xs font-medium text-slate-500">{taskStats.total} tasks in the selected view</p>
                </div>
                <span className="rounded-xl bg-indigo-50 px-3 py-2 text-xs font-black text-indigo-700">{taskStats.completionRate}% complete</span>
              </div>
              <div className="space-y-3">
                {Object.entries(taskStats.statusCounts).sort(([, a], [, b]) => b - a).map(([status, count]) => (
                  <div key={status}>
                    <div className="mb-1 flex items-center justify-between gap-3 text-xs font-bold">
                      <span className="min-w-0 truncate text-slate-600">{status}</span>
                      <span className="text-slate-900">{count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full rounded-full ${statusTone(status)}`} style={{ width: `${taskStats.total ? (count / taskStats.total) * 100 : 0}%` }} />
                    </div>
                  </div>
                ))}
                {!taskStats.total && <p className="py-8 text-center text-sm font-semibold text-slate-400">No task data for these filters.</p>}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="text-sm font-black text-slate-900">Action queue</h2>
              <p className="mt-1 text-xs font-medium text-slate-500">Items that need attention</p>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between rounded-xl bg-amber-50 px-3 py-3">
                  <span className="flex items-center gap-2 text-xs font-bold text-amber-800"><Users size={15} /> Unassigned</span>
                  <strong className="text-amber-900">{taskStats.unassigned}</strong>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-rose-50 px-3 py-3">
                  <span className="flex items-center gap-2 text-xs font-bold text-rose-800"><AlertTriangle size={15} /> Overdue</span>
                  <strong className="text-rose-900">{taskStats.overdue}</strong>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-indigo-50 px-3 py-3">
                  <span className="flex items-center gap-2 text-xs font-bold text-indigo-700">
                    <ClipboardList size={15} /> New Tasks
                  </span>
                  <strong className="text-indigo-900">{taskStats.newTasks}</strong>
                </div>
              </div>
            </section>
          </div>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-sm font-black text-slate-900">Query status overview</h2>
                <p className="mt-1 text-xs font-medium text-slate-500">Done, cancel, and other query outcomes by selected period</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                  <button type="button" onClick={() => setQueryViewMode("month")} className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${queryViewMode === "month" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>Month</button>
                  <button type="button" onClick={() => setQueryViewMode("week")} className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${queryViewMode === "week" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>Week</button>
                </div>

                <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] font-semibold text-slate-600">
                  <span>From</span>
                  <input type="date" value={queryTrendDraft.start} onChange={(event) => setQueryTrendDraft((prev) => ({ ...prev, start: event.target.value }))} className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 outline-none focus:border-indigo-400" />
                </label>
                <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] font-semibold text-slate-600">
                  <span>To</span>
                  <input type="date" value={queryTrendDraft.end} onChange={(event) => setQueryTrendDraft((prev) => ({ ...prev, end: event.target.value }))} className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 outline-none focus:border-indigo-400" />
                </label>
                <button type="button" onClick={applyQueryTrendFilter} className="rounded-xl bg-indigo-600 px-2.5 py-1.5 text-[11px] font-bold text-white shadow-sm hover:bg-indigo-700">Apply</button>
                <button type="button" onClick={resetQueryTrendFilter} className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50">Reset</button>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
              <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 p-4">
                <div className="flex h-28 w-28 items-center justify-center rounded-full border-8 border-slate-200" style={{ background: queryPieStyle }}>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-center shadow-inner">
                    <div>
                      <div className="text-base font-black text-slate-900">{queryReport.summary.conversionRate || 0}%</div>
                      <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Rate</div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Conversion rate</div>
                  <div className="text-sm font-black text-slate-900">Done / (All queries - Cancel)</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Total</div>
                    <div className="mt-1 text-xl font-black text-slate-900">{queryReport.summary.total || 0}</div>
                  </div>
                  <div className="rounded-xl bg-emerald-50 p-3">
                    <div className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">Done</div>
                    <div className="mt-1 text-xl font-black text-emerald-900">{queryReport.summary.done || 0}</div>
                  </div>
                  <div className="rounded-xl bg-rose-50 p-3">
                    <div className="text-[10px] font-bold uppercase tracking-wide text-rose-700">Cancel</div>
                    <div className="mt-1 text-xl font-black text-rose-900">{queryReport.summary.cancel || 0}</div>
                  </div>
                  <div className="rounded-xl bg-amber-50 p-3">
                    <div className="text-[10px] font-bold uppercase tracking-wide text-amber-700">Pending</div>
                    <div className="mt-1 text-xl font-black text-amber-900">{queryReport.summary.pending || 0}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  {(queryReport.breakdown || []).map((item) => (
                    <div key={item.status} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                        <span className="text-xs font-bold capitalize text-slate-700">{item.status}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                        <span>{item.count}</span>
                        <span className="text-slate-400">({item.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5">
              <h3 className="mb-3 text-xs font-black uppercase tracking-wide text-slate-700">{queryViewMode === "month" ? "Month breakdown" : "Week breakdown"}</h3>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {(queryReport.groups || []).map((group) => (
                  <div key={group.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-slate-700">{group.label}</span>
                      <span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold text-slate-600">{group.total}</span>
                    </div>

                    <div className="mt-3 space-y-2">
                      {(group.statuses || []).map((row) => (
                        <div key={`${group.key}-${row.status}`} className="flex items-center justify-between gap-2 text-[11px] font-bold text-slate-600">
                          <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ background: row.color }} />
                            <span className="capitalize">{row.status}</span>
                          </div>
                          <span>{row.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {!queryReport.groups?.length && <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-6 text-center text-xs font-semibold text-slate-500">No query data for this period.</p>}
            </div>
          </section>

          {canViewFinancials && (
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-5 flex items-center gap-2">
                <Wallet size={18} className="text-emerald-600" />
                <div>
                  <h2 className="text-sm font-black text-slate-900">Financial overview</h2>
                  <p className="mt-1 text-xs font-medium text-slate-500">Financial figures are visible to admin and owner roles only.</p>
                </div>
              </div>

              {/* Tutor Payments Row */}
              <h3 className="mb-2 text-xs font-bold text-slate-700">Tutor Payments</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-bold text-slate-500">Payment records</p>
                  <p className="mt-1 text-xl font-black text-slate-900">{paymentStats.count}</p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-4">
                  <p className="text-xs font-bold text-emerald-700">Paid amount</p>
                  <p className="mt-1 text-xl font-black text-emerald-900">{money(paymentStats.paid)}</p>
                </div>
                <div className="rounded-xl bg-amber-50 p-4">
                  <p className="text-xs font-bold text-amber-700">Pending amount</p>
                  <p className="mt-1 text-xl font-black text-amber-900">{money(paymentStats.pending)}</p>
                </div>
              </div>
              <div className="mt-3 mb-6 flex items-center gap-2 text-xs font-bold text-slate-500">
                <DollarSign size={14} /> Total tutor amount: <span className="text-slate-900">{money(paymentStats.total)}</span>
              </div>

              <div className="mb-5 h-px w-full bg-slate-100" />

              {/* Client Revenue Row */}
              <h3 className="mb-2 text-xs font-bold text-slate-700">Client Revenue & Refunds</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-blue-50 p-4">
                  <p className="text-xs font-bold text-blue-700">Client Received Amount</p>
                  <p className="mt-1 text-xl font-black text-blue-900">{money(taskStats.clientReceivedAmount)}</p>
                </div>
                <div className="rounded-xl bg-rose-50 p-4">
                  <p className="text-xs font-bold text-rose-700">Total Refund Amount</p>
                  <p className="mt-1 text-xl font-black text-rose-900">{money(taskStats.refundAmount)}</p>
                </div>
              </div>

              <div className="mb-5 mt-6 h-px w-full bg-slate-100" />

              <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wide text-slate-700">Monthly & weekly trend</h3>
                  <p className="mt-1 text-xs font-medium text-slate-500">Tutor payments and client received splits by week</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] font-semibold text-slate-600">
                    <span>From</span>
                    <input type="date" value={trendFilterDraft.start} onChange={(event) => setTrendFilterDraft((prev) => ({ ...prev, start: event.target.value }))} className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 outline-none focus:border-indigo-400" />
                  </label>
                  <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] font-semibold text-slate-600">
                    <span>To</span>
                    <input type="date" value={trendFilterDraft.end} onChange={(event) => setTrendFilterDraft((prev) => ({ ...prev, end: event.target.value }))} className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 outline-none focus:border-indigo-400" />
                  </label>
                  <button type="button" onClick={applyTrendFilter} className="rounded-xl bg-indigo-600 px-2.5 py-1.5 text-[11px] font-bold text-white shadow-sm hover:bg-indigo-700">Apply</button>
                  <button type="button" onClick={resetTrendFilter} className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50">Reset</button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="text-xs font-black uppercase tracking-wide text-emerald-700">Tutor payments</span>
                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700">{money(tutorPaymentTrend.reduce((sum, item) => sum + item.total, 0))}</span>
                  </div>

                  <div className="space-y-3">
                    {tutorPaymentTrend.length ? tutorPaymentTrend.map((month) => (
                      <div key={month.key} className="rounded-xl border border-emerald-100 bg-white p-3 shadow-sm">
                        <div className="flex items-center justify-between gap-3 text-xs font-bold text-slate-700">
                          <span>{month.label}</span>
                          <span className="text-emerald-700">{money(month.total)}</span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-emerald-100">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: month.barWidth }} />
                        </div>
                        <div className="mt-2 grid grid-cols-4 gap-1 text-[10px] text-slate-500">
                          {month.weeks.map((week) => (
                            <div key={`${month.key}-${week.weekNumber}`} className="rounded-md bg-slate-50 px-1 py-1.5 text-center">
                              <div className="font-bold text-slate-700">{money(week.total)}</div>
                              <div className="mt-1">W{week.weekNumber}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )) : <p className="rounded-xl border border-dashed border-emerald-200 bg-white px-3 py-6 text-center text-xs font-semibold text-slate-500">No tutor payment data for this period.</p>}
                  </div>
                </div>

                <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="text-xs font-black uppercase tracking-wide text-blue-700">Client received</span>
                    <span className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-bold text-blue-700">{money(clientReceivedTrend.reduce((sum, item) => sum + item.total, 0))}</span>
                  </div>

                  <div className="space-y-3">
                    {clientReceivedTrend.length ? clientReceivedTrend.map((month) => (
                      <div key={month.key} className="rounded-xl border border-blue-100 bg-white p-3 shadow-sm">
                        <div className="flex items-center justify-between gap-3 text-xs font-bold text-slate-700">
                          <span>{month.label}</span>
                          <span className="text-blue-700">{money(month.total)}</span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-blue-100">
                          <div className="h-full rounded-full bg-blue-500" style={{ width: month.barWidth }} />
                        </div>
                        <div className="mt-2 grid grid-cols-4 gap-1 text-[10px] text-slate-500">
                          {month.weeks.map((week) => (
                            <div key={`${month.key}-client-${week.weekNumber}`} className="rounded-md bg-slate-50 px-1 py-1.5 text-center">
                              <div className="font-bold text-slate-700">{money(week.total)}</div>
                              <div className="mt-1">W{week.weekNumber}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )) : <p className="rounded-xl border border-dashed border-blue-200 bg-white px-3 py-6 text-center text-xs font-semibold text-slate-500">No client received data for this period.</p>}
                  </div>
                </div>
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-black text-slate-900">Recent task activity</h2>
                <p className="mt-1 text-xs font-medium text-slate-500">Latest records from the selected view</p>
              </div>
              <button type="button" onClick={clearFilters} className="text-xs font-bold text-indigo-600 hover:text-indigo-800">Clear filters</button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[650px] w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] uppercase tracking-wide text-slate-400">
                    <th className="px-2 py-2">Task</th>
                    <th className="px-2 py-2">Subject</th>
                    <th className="px-2 py-2">Status</th>
                    <th className="px-2 py-2">Tutor</th>
                    <th className="px-2 py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.slice(0, 8).map((task) => (
                    <tr key={task?._id || task?.taskID} className="border-b border-slate-50 last:border-0">
                      <td className="px-2 py-3 font-black text-slate-800">{task?.taskID || "—"}</td>
                      <td className="max-w-[220px] truncate px-2 py-3 font-semibold text-slate-600">{task?.subject || "—"}</td>
                      <td className="px-2 py-3"><span className="rounded-lg bg-slate-100 px-2 py-1 font-bold text-slate-600">{task?.status || "Unknown"}</span></td>
                      <td className="px-2 py-3 font-semibold text-slate-600">{task?.tutorDetails?.name || task?.tutorDetails?.tutorID || "Unassigned"}</td>
                      <td className="px-2 py-3 font-semibold text-slate-500">{formatDate(getTaskDate(task))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!filteredTasks.length && <p className="py-8 text-center text-sm font-semibold text-slate-400">No task activity matches your filters.</p>}
            </div>
          </section>
        </>}
      </div></main>
    </div>
  );
};

export { Reports };
export default Reports;