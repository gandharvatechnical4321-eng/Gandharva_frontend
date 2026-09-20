import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Loader2,
  MessageSquareText,
  UserRound,
  X,
} from "lucide-react";

import AddNewTaskForm from "../../cards/AddNewTaskCard";
import { updateQuery } from "../../features/taskSlice";
import { setSearchContact } from "../../features/contactsSlice";

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "done", label: "Done" },
  { value: "advance issue", label: "Advance Issue" },
  { value: "low budget", label: "Low Budget" },
  { value: "short deadline", label: "Short Deadline" },

  // Keep the existing backend value unchanged.
  { value: "No Responce", label: "No Response" },

  { value: "sample work issue", label: "Sample Work Issue" },
  { value: "cancel", label: "Cancel" },
  { value: "no follow up", label: "No Follow Up" },
];

const QueryCard = ({
  reloadquery,
  task,

  // Optional navigation props
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
  currentItem,
  totalItems,
}) => {
  const dispatch = useDispatch();

  const [addNewTask, setAddNewTask] = useState(false);
  const [status, setStatus] = useState(task?.queryStatus || "pending");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    setStatus(task?.queryStatus || "pending");
  }, [task?.queryStatus, task?.chatId]);

  useEffect(() => {
    if (!addNewTask) return undefined;

    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = oldOverflow;
    };
  }, [addNewTask]);

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    return parsedDate.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusLabel = (value) => {
    return (
      statusOptions.find((option) => option.value === value)?.label ||
      value ||
      "Unknown"
    );
  };

  const getStatusStyle = (queryStatus) => {
    switch (queryStatus) {
      case "pending":
        return {
          border: "border-l-amber-400",
          iconBox: "border-amber-100 bg-amber-50 text-amber-600",
          badge: "border-amber-200 bg-amber-50 text-amber-700",
          dot: "bg-amber-500",
          focus: "focus:border-amber-300 focus:ring-amber-500/10",
          icon: <AlertCircle size={17} />,
        };

      case "done":
        return {
          border: "border-l-emerald-500",
          iconBox: "border-emerald-100 bg-emerald-50 text-emerald-600",
          badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
          dot: "bg-emerald-500",
          focus: "focus:border-emerald-300 focus:ring-emerald-500/10",
          icon: <CheckCircle2 size={17} />,
        };

      case "cancel":
        return {
          border: "border-l-rose-500",
          iconBox: "border-rose-100 bg-rose-50 text-rose-600",
          badge: "border-rose-200 bg-rose-50 text-rose-700",
          dot: "bg-rose-500",
          focus: "focus:border-rose-300 focus:ring-rose-500/10",
          icon: <X size={17} />,
        };

      case "advance issue":
      case "low budget":
      case "short deadline":
      case "No Responce":
      case "sample work issue":
      case "no follow up":
        return {
          border: "border-l-orange-500",
          iconBox: "border-orange-100 bg-orange-50 text-orange-600",
          badge: "border-orange-200 bg-orange-50 text-orange-700",
          dot: "bg-orange-500",
          focus: "focus:border-orange-300 focus:ring-orange-500/10",
          icon: <AlertCircle size={17} />,
        };

      default:
        return {
          border: "border-l-slate-400",
          iconBox: "border-slate-200 bg-slate-50 text-slate-600",
          badge: "border-slate-200 bg-slate-50 text-slate-700",
          dot: "bg-slate-400",
          focus: "focus:border-indigo-300 focus:ring-indigo-500/10",
          icon: <MessageSquareText size={17} />,
        };
    }
  };

  const statusStyle = getStatusStyle(status);

  const handleStatusChange = async (event) => {
    const newStatus = event.target.value;

    if (
      !newStatus ||
      newStatus === status ||
      updatingStatus
    ) {
      return;
    }

    const isConfirmed = window.confirm(
      `Change query status to "${getStatusLabel(newStatus)}"?`
    );

    if (!isConfirmed) return;

    /*
      Existing behavior preserved:
      selecting Done opens AddNewTaskForm.
      Query status is not changed here.
    */
    if (newStatus === "done") {
      setAddNewTask(true);
      return;
    }

    const previousStatus = status;

    try {
      setUpdatingStatus(true);

      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/query/update-query-status`,
        {
          chatId: task?.chatId,
          queryStatus: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response?.data) {
        throw new Error("Empty response received.");
      }

      const savedStatus =
        response.data?.queryStatus ||
        response.data?.query?.queryStatus ||
        newStatus;

      setStatus(savedStatus);
      dispatch(updateQuery(response.data));

      toast.success(
        `Query status changed to ${getStatusLabel(savedStatus)}.`,
        {
          duration: 2500,
          position: "top-center",
          style: {
            background: "#059669",
            color: "white",
            fontWeight: "700",
            padding: "12px 16px",
            borderRadius: "12px",
          },
        }
      );

      if (typeof reloadquery === "function") {
        reloadquery(true);
      }
    } catch (error) {
      setStatus(previousStatus);

      console.error(
        "Error updating query status:",
        error?.response?.data || error
      );

      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Failed to update status.",
        {
          duration: 4000,
          position: "top-center",
          style: {
            background: "#DC2626",
            color: "white",
            fontWeight: "700",
            padding: "12px 16px",
            borderRadius: "12px",
          },
        }
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  const copyToClipboard = async (data) => {
    if (!data) {
      toast.error("Chat ID is unavailable.");
      return;
    }

    const formattedData =
      typeof data === "object"
        ? JSON.stringify(data, null, 2)
        : String(data);

    try {
      setCopying(true);

      await navigator.clipboard.writeText(formattedData);

      dispatch(setSearchContact(formattedData));

      toast.success("Chat ID copied.", {
        duration: 2000,
        position: "top-right",
        style: {
          background: "#059669",
          color: "white",
          fontWeight: "700",
          padding: "11px 15px",
          borderRadius: "10px",
        },
      });
    } catch (error) {
      console.error("Failed to copy Chat ID:", error);
      toast.error("Unable to copy Chat ID.");
    } finally {
      setCopying(false);
    }
  };

  const closeAddTaskModal = () => {
    setAddNewTask(false);
  };

  const closeModalFromBackdrop = (event) => {
    if (event.target === event.currentTarget) {
      closeAddTaskModal();
    }
  };

  const showNavigation =
    typeof onPrevious === "function" ||
    typeof onNext === "function" ||
    totalItems;

  return (
    <>
      {/* Create Task Modal */}
      {addNewTask && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-task-heading"
          onMouseDown={closeModalFromBackdrop}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-[2px] sm:p-5"
        >
          <div
            onMouseDown={(event) => event.stopPropagation()}
            className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            {/* Modal Header */}
            <header className="shrink-0 border-b border-slate-200 bg-white px-4 py-3 sm:px-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600">
                    <MessageSquareText size={18} />
                  </div>

                  <div className="min-w-0">
                    <h2
                      id="create-task-heading"
                      className="truncate text-base font-extrabold text-slate-900 sm:text-lg"
                    >
                      Create New Task
                    </h2>

                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-slate-500">
                      <span className="truncate">
                        Chat ID:{" "}
                        <strong className="text-slate-700">
                          {task?.chatId || "NA"}
                        </strong>
                      </span>

                      {task?.name && (
                        <span className="truncate">
                          Client:{" "}
                          <strong className="text-slate-700">
                            {task.name}
                          </strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeAddTaskModal}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                  title="Close"
                  aria-label="Close task form"
                >
                  <X size={18} />
                </button>
              </div>
            </header>

            {/* Modal Content */}
            <main className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-3 sm:p-5">
              <AddNewTaskForm
                setAddNewTask={setAddNewTask}
                clientData={{
                  chatId: task?.chatId,
                  name: task?.name,
                }}
              />
            </main>
          </div>
        </div>
      )}

      {/* Query Card */}
      <article
        className={`group relative w-full overflow-hidden rounded-xl border border-slate-200 border-l-[5px] ${statusStyle.border} bg-white shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md`}
      >
        <div className="p-3 sm:p-3.5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Main Information */}
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${statusStyle.iconBox}`}
              >
                {statusStyle.icon}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(task?.chatId)}
                    disabled={!task?.chatId || copying}
                    className="group/id flex min-w-0 items-center gap-1.5 rounded-md text-left outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    title="Copy Chat ID and search contact"
                  >
                    <span className="truncate text-sm font-extrabold italic text-slate-900 transition group-hover/id:text-indigo-600 sm:text-[15px]">
                      {task?.chatId || "No Chat ID"}
                    </span>

                    {copying ? (
                      <Loader2
                        size={14}
                        className="shrink-0 animate-spin text-indigo-500"
                      />
                    ) : (
                      <Copy
                        size={14}
                        className="shrink-0 text-slate-300 transition group-hover/id:text-indigo-500"
                      />
                    )}
                  </button>

                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide ${statusStyle.badge}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}
                    />

                    {getStatusLabel(status)}
                  </span>
                </div>

                <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-slate-500">
                  <span className="flex min-w-0 items-center gap-1.5">
                    <CalendarClock
                      size={13}
                      className="shrink-0 text-slate-400"
                    />

                    <span className="truncate">
                      {formatDate(task?.queryDate)}
                    </span>
                  </span>

                  {task?.name && (
                    <span className="flex min-w-0 items-center gap-1.5">
                      <UserRound
                        size={13}
                        className="shrink-0 text-slate-400"
                      />

                      <span className="truncate" title={task.name}>
                        {task.name}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Status Control */}
            <div className="relative shrink-0 sm:w-[180px]">
              <select
                value={status}
                onChange={handleStatusChange}
                disabled={updatingStatus}
                aria-label="Update query status"
                className={`h-9 w-full appearance-none cursor-pointer rounded-lg border border-slate-200 bg-slate-50 pl-3 pr-9 text-xs font-bold text-slate-700 outline-none transition hover:bg-white focus:bg-white focus:ring-4 disabled:cursor-wait disabled:opacity-60 ${statusStyle.focus}`}
              >
                {statusOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>

              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                {updatingStatus ? (
                  <Loader2
                    size={14}
                    className="animate-spin text-indigo-500"
                  />
                ) : (
                  <ChevronDown size={15} className="text-slate-400" />
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Optional Previous / Next Controls */}
        {showNavigation && (
          <footer className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-3 py-2">
            <button
              type="button"
              onClick={onPrevious}
              disabled={!hasPrevious || typeof onPrevious !== "function"}
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-bold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={14} />
              Previous
            </button>

            {totalItems ? (
              <span className="text-[11px] font-bold text-slate-500">
                <span className="text-slate-800">
                  {currentItem || 1}
                </span>{" "}
                of{" "}
                <span className="text-slate-800">
                  {totalItems}
                </span>
              </span>
            ) : (
              <span />
            )}

            <button
              type="button"
              onClick={onNext}
              disabled={!hasNext || typeof onNext !== "function"}
              className="inline-flex h-8 items-center gap-1 rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 text-[11px] font-bold text-indigo-600 transition hover:border-indigo-200 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight size={14} />
            </button>
          </footer>
        )}
      </article>
    </>
  );
};

export default QueryCard;