import Cookies from "js-cookie";

export const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "";

export const DEFAULT_ROWS_PER_PAGE = 10;

export const BRAND_OPTIONS = [
  "All",
  "AW",
  "GM",
  "AG",
  "IS",
  "MA",
  "TH",
];

export const normalizeRole = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ");

export const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));

export const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const getISODate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });
};

export const normalizePayment = (row, index) => {
  const approvalStatus =
    row.paymentApprovalStatus ||
    row.approvalStatus ||
    "Pending Approval";

  // 1. Resolve Approved By from either backend or frontend key, including nested tutorDetails
  const approvedByValue =
    row.tutorDetails?.paymentApprovedBy ||
    row.paymentApprovedBy ||
    row.approvedBy ||
    "NA";

  // 2. Resolve Paid On date from either nested tutorDetails or root object
  const paidOnValue =
    row.tutorDetails?.paidOn ||
    row.paidOn ||
    "";

  return {
    id:
      row.id ||
      row._id ||
      `${row.taskID || "payment"}-${index}`,
    taskDate:
      row.taskDate ||
      row.createdAt ||
      "",
    taskID: row.taskID || "",
    subject: row.subject || "",
    brand: row.brand || "NA",
    tutorID: row.tutorID || "NA",
    tutorName: row.tutorName || "NA",
    tutorAmount: Number(row.tutorAmount || 0),
    amountPaid: Number(row.amountPaid || 0),
    remainingAmount: Number(
      row.remainingAmount ??
        Math.max(
          Number(row.tutorAmount || 0) -
            Number(row.amountPaid || 0),
          0
        )
    ),
    approvalStatus,

    // Map resolved values to all standard property names
    approvedBy: approvedByValue,
    paymentApprovedBy: approvedByValue,

    taskStatus: row.taskStatus || "NA",
    expectedPayDate: row.expectedPayDate || "",
    paid:
      row.paid === true ||
      approvalStatus === "Paid",
    paidOn: paidOnValue, // <-- Mapped here
    remarks:
      row.paymentRemarks ||
      row.remarks ||
      "NA",
    tutorUPI: row.tutorUPI || "",
  };
};

export const getApprovalBadge = (status) => {
  switch (String(status).toLowerCase()) {
    case "approved":
      return "border-blue-100 bg-blue-50 text-blue-700";
    case "paid":
      return "border-emerald-100 bg-emerald-50 text-emerald-700";
    case "on hold":
    case "hold":
      return "border-amber-100 bg-amber-50 text-amber-700";
    case "rejected":
      return "border-rose-100 bg-rose-50 text-rose-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
};

export const getTaskBadge = (status) => {
  switch (
    String(status || "")
      .trim()
      .toLowerCase()
  ) {
    case "completed":
    case "task completed":
      return "border-emerald-100 bg-emerald-50 text-emerald-700";
    case "solution received":
      return "border-blue-100 bg-blue-50 text-blue-700";
    case "in progress":
    case "being modified":
      return "border-violet-100 bg-violet-50 text-violet-700";
    case "tutor assigned":
      return "border-orange-100 bg-orange-50 text-orange-700";
    case "refunded":
    case "cancel":
      return "border-rose-100 bg-rose-50 text-rose-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
};

export const getAuthToken = () =>
  Cookies.get("token") ||
  localStorage.getItem("token") ||
  "";

export const getAuthHeaders = () => {
  const token = getAuthToken();

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};
