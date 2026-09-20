
import React from "react";
import {
  Eye,
  MessageCircle,
  AlertTriangle,
  ClipboardCheck,
  CheckCircle2,
  Inbox,
} from "lucide-react";

import {
  formatAmount,
  formatDateTime,
  isOverdueTask,
  isPendingReviewTask,
  isTutorPaymentHold,
} from "../taskUtils";

// ============================================================
// STATUS BADGE
// ============================================================
const getStatusBadge = (status) => {
  switch (status) {
    case "Task Completed":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "Solution Received":
      return "border-blue-200 bg-blue-50 text-blue-700";

    case "Being Modified":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "Tutor Assigned":
      return "border-indigo-200 bg-indigo-50 text-indigo-700";

    case "Advance Received":
    case "Tutor Notified":
      return "border-yellow-200 bg-yellow-50 text-yellow-700";

    case "Cancel":
    case "Refund":
      return "border-rose-200 bg-rose-50 text-rose-700";

    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
};

// ============================================================
// CREATED AT FORMATTER
// ============================================================
const formatCreatedAt = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return {
    date: date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    time: date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
  };
};

// ============================================================
// TASK TABLE
// ============================================================
const TaskTable = ({
  tasks = [],
  loading = false,
  openTaskDetails,
  openChat,
}) => {
  // ==========================================================
  // LOADING STATE
  // ==========================================================
  if (loading) {
    return (
      <div className="flex h-full min-h-[300px] items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
          </div>

          <p className="mt-3 text-sm font-semibold text-slate-600">
            Loading operations data...
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Please wait while tasks are being loaded.
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // TABLE HEADERS
  // ==========================================================
  const headers = [
    "Task Details",
    "Task Created At",
    "Client",
    "Tutor",
    "Financials",
    "Deadlines",
    "Status",
    "Review",
    "Actions",
  ];

  return (
    <div className="h-full w-full overflow-auto">
      <table className="min-w-[1450px] w-full border-collapse">
        {/* ====================================================
            TABLE HEADER
        ==================================================== */}
        <thead className="sticky top-0 z-10 bg-white">
          <tr>
            {headers.map((heading, index) => (
              <th
                key={heading}
                scope="col"
                className={`border-y border-slate-200 bg-slate-50 px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-500 ${
                  index === headers.length - 1
                    ? "text-right"
                    : ""
                }`}
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>

        {/* ====================================================
            TABLE BODY
        ==================================================== */}
        <tbody className="divide-y divide-slate-100">
          {tasks.length > 0 ? (
            tasks.map((task) => {
              const pendingReview = isPendingReviewTask(task);
              const overdue = isOverdueTask(task);
              const paymentHold = isTutorPaymentHold(task);

              const createdAt = formatCreatedAt(
                task?.createdAt
              );

              return (
                <tr
                  key={task?._id || task?.taskID}
                  className="group transition-colors hover:bg-slate-50/70"
                >
                  {/* ==================================================
                      TASK DETAILS
                  ================================================== */}
                  <td className="px-4 py-3 align-top">
                    <button
                      type="button"
                      onClick={() => openTaskDetails?.(task)}
                      className="flex flex-col text-left transition-opacity hover:opacity-80"
                    >
                      <span className="text-xs font-bold text-indigo-600">
                        {task?.taskID || "—"}
                      </span>

                      <span className="mt-0.5 w-[200px] truncate text-xs font-semibold text-slate-800">
                        {task?.subject ||
                          task?.subjectDes ||
                          "No subject"}
                      </span>

                      <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                        {task?.clientDetails?.type || "task"}
                      </span>
                    </button>
                  </td>

                  {/* ==================================================
                      TASK CREATED AT
                  ================================================== */}
                  <td className="px-4 py-3 align-top">
                    {createdAt !== "—" ? (
                      <div className="flex min-w-[145px] flex-col">
                        <span className="text-xs font-bold text-slate-700">
                          {createdAt.date}
                        </span>

                        <span className="mt-0.5 text-[11px] font-medium text-slate-400">
                          {createdAt.time}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-slate-400">
                        —
                      </span>
                    )}
                  </td>

                  {/* ==================================================
                      CLIENT
                  ================================================== */}
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800">
                        {task?.clientDetails?.name || "—"}
                      </span>

                      <span className="mt-0.5 text-[11px] font-medium text-slate-500">
                        {task?.clientDetails?.clientID ||
                          task?.clientDetails?.chatID ||
                          "—"}
                      </span>
                    </div>
                  </td>

                  {/* ==================================================
                      TUTOR
                  ================================================== */}
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800">
                        {task?.tutorDetails?.name ||
                          "Unassigned"}
                      </span>

                      <span className="mt-0.5 text-[11px] font-medium text-slate-500">
                        {task?.tutorDetails?.tutorID || "—"}
                      </span>
                    </div>
                  </td>

                  {/* ==================================================
                      FINANCIALS
                  ================================================== */}
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-col gap-1">
                      {/* Total */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">
                          {formatAmount(
                            task?.clientDetails?.totalAmount,
                            task?.clientDetails
                              ?.currencyType || "INR"
                          )}
                        </span>

                        <span className="text-[10px] font-medium text-slate-400">
                          Total
                        </span>
                      </div>

                      {/* Received */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-semibold text-slate-600">
                          {formatAmount(
                            task?.clientDetails
                              ?.receivedAmount,
                            task?.clientDetails
                              ?.currencyType || "INR"
                          )}
                        </span>

                        <span className="text-[10px] font-medium text-slate-400">
                          Recv
                        </span>
                      </div>

                      {/* Tutor payment */}
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <div
                          className={`h-1.5 w-1.5 rounded-full ${
                            paymentHold
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                        />

                        <span className="text-[10px] font-medium capitalize text-slate-500">
                          Tutor:{" "}
                          {task?.tutorDetails
                            ?.paymentStatus || "hold"}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* ==================================================
                      DEADLINES
                  ================================================== */}
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-col gap-1.5">
                      {/* Client deadline */}
                      <div className="flex flex-col">
                        <span className="text-[10px] font-medium text-slate-400">
                          Client
                        </span>

                        <span className="text-xs font-semibold text-slate-700">
                          {formatDateTime(
                            task?.clientDeadline
                          )}
                        </span>
                      </div>

                      {/* Tutor deadline */}
                      <div className="flex flex-col">
                        <span className="text-[10px] font-medium text-slate-400">
                          Tutor
                        </span>

                        <span
                          className={`text-xs font-semibold ${
                            overdue
                              ? "text-red-600"
                              : "text-slate-700"
                          }`}
                        >
                          {formatDateTime(
                            task?.tutorDeadline
                          )}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* ==================================================
                      STATUS
                  ================================================== */}
                  <td className="px-4 py-3 align-top">
                    <span
                      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-bold shadow-xs ${getStatusBadge(
                        task?.status
                      )}`}
                    >
                      {task?.status || "—"}
                    </span>
                  </td>

                  {/* ==================================================
                      REVIEW / FLAGS
                  ================================================== */}
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-col gap-1.5">
                      {/* Pending review */}
                      {pendingReview && (
                        <span className="inline-flex w-fit items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">
                          <ClipboardCheck size={12} />
                          Pending
                        </span>
                      )}

                      {/* Overdue */}
                      {overdue && (
                        <span className="inline-flex w-fit items-center gap-1 rounded-md border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-700">
                          <AlertTriangle size={12} />
                          Overdue
                        </span>
                      )}

                      {/* Clear */}
                      {!pendingReview && !overdue && (
                        <span className="inline-flex w-fit items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                          <CheckCircle2 size={12} />
                          Clear
                        </span>
                      )}
                    </div>
                  </td>

                  {/* ==================================================
                      ACTIONS
                  ================================================== */}
                  <td className="px-4 py-3 align-top">
                    <div className="flex items-start justify-end gap-1.5">
                      {/* Chat */}
                      <button
                        type="button"
                        onClick={() => openChat?.(task)}
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 active:scale-95"
                        title="Open Chat"
                        aria-label={`Open chat for ${
                          task?.taskID || "task"
                        }`}
                      >
                        <MessageCircle
                          size={13}
                          strokeWidth={2.5}
                        />
                      </button>

                      {/* View */}
                      <button
                        type="button"
                        onClick={() =>
                          openTaskDetails?.(task)
                        }
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 active:scale-95"
                        title="View Task Details"
                        aria-label={`View details for ${
                          task?.taskID || "task"
                        }`}
                      >
                        <Eye
                          size={13}
                          strokeWidth={2.5}
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            /* ======================================================
               EMPTY STATE
            ====================================================== */
            <tr>
              <td colSpan={9}>
                <div className="flex h-64 flex-col items-center justify-center px-4 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                    <Inbox
                      size={24}
                      className="text-slate-400"
                    />
                  </div>

                  <p className="mt-3 text-sm font-bold text-slate-700">
                    No tasks found
                  </p>

                  <p className="mt-1 max-w-md text-xs font-medium text-slate-400">
                    Try adjusting your date filters or
                    searching with different keywords.
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TaskTable;

