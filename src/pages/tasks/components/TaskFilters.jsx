
import React, { useEffect, useState } from "react";
import { Filter, RotateCcw } from "lucide-react";

const statusOptions = [
  { label: "All Statuses", value: "" },
  { label: "New Task", value: "New Task" },
  { label: "Advance Received", value: "Advance Received" },
  { label: "Tutor Notified", value: "Tutor Notified" },
  { label: "Tutor Assigned", value: "Tutor Assigned" },
  { label: "Solution Received", value: "Solution Received" },
  { label: "Task Completed", value: "Task Completed" },
  { label: "Being Modified", value: "Being Modified" },
  { label: "Cancel", value: "Cancel" },
  { label: "Refund", value: "Refund" },
];

const TaskFilters = ({ appliedFilters, onApplyFilters }) => {
  const [draft, setDraft] = useState({
    status: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    setDraft({
      status: appliedFilters?.status || "",
      startDate: appliedFilters?.startDate || "",
      endDate: appliedFilters?.endDate || "",
    });
  }, [appliedFilters]);

  const handleChange = (field, value) => {
    setDraft((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleApply = () => {
    onApplyFilters({
      status: draft.status,
      startDate: draft.startDate,
      endDate: draft.endDate,
    });
  };

  const handleClear = () => {
    const cleared = {
      status: "",
      startDate: "",
      endDate: "",
    };

    setDraft(cleared);
    onApplyFilters(cleared);
  };

  const inputClass =
    "h-8 w-full sm:w-36 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 shadow-sm outline-none transition-all cursor-pointer hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      {/* Status */}
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
          Status:
        </span>

        <select
          value={draft.status}
          onChange={(e) => handleChange("status", e.target.value)}
          className={`${inputClass} appearance-none sm:w-44`}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Date Range Group */}
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
          Date Range:
        </span>

        <div className="flex items-center gap-2">
          <input
            type="date"
            title="Start Date"
            value={draft.startDate}
            max={draft.endDate || undefined}
            onChange={(e) =>
              handleChange("startDate", e.target.value)
            }
            className={inputClass}
          />

          <span className="text-xs font-medium text-slate-400">
            to
          </span>

          <input
            type="date"
            title="End Date"
            value={draft.endDate}
            min={draft.startDate || undefined}
            onChange={(e) =>
              handleChange("endDate", e.target.value)
            }
            className={inputClass}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleClear}
          className="flex h-8 items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 shadow-sm transition-all hover:bg-slate-50 active:scale-95"
        >
          <RotateCcw size={14} />
          <span className="hidden sm:inline">Clear</span>
        </button>

        <button
          type="button"
          onClick={handleApply}
          className="flex h-8 items-center justify-center gap-1.5 rounded-md bg-indigo-600 px-4 text-xs font-bold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-95"
        >
          <Filter size={14} />
          Apply
        </button>
      </div>
    </div>
  );
};

export default TaskFilters;
