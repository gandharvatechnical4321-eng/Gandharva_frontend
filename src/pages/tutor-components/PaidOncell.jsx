import React, { useEffect, useRef, useState } from "react";
import {
  Calendar as CalendarIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  Pencil,
  X,
} from "lucide-react";

import { formatDate } from "./tutorPayments.utils";

/*
|--------------------------------------------------------------------------
| Helper Functions for Calendar Grid
|--------------------------------------------------------------------------
*/
const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

const toISODateString = (dateObj) => {
  if (!dateObj || Number.isNaN(dateObj.getTime())) return "";
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEK_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/*
|--------------------------------------------------------------------------
| Main PaidOnCell Component
|--------------------------------------------------------------------------
*/
const PaidOnCell = ({ payment, isAdminOrOwner, handlePaidOnChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const popoverRef = useRef(null);

  // Parse initial date from payment
  const getInitialDateStr = () => {
    if (!payment?.paidOn) return "";
    const d = new Date(payment.paidOn);
    return Number.isNaN(d.getTime()) ? "" : toISODateString(d);
  };

  const [draftDate, setDraftDate] = useState(getInitialDateStr);

  // Navigation state for the monthly grid view
  const [viewYear, setViewYear] = useState(() => {
    const d = draftDate ? new Date(draftDate) : new Date();
    return Number.isNaN(d.getTime()) ? new Date().getFullYear() : d.getFullYear();
  });

  const [viewMonth, setViewMonth] = useState(() => {
    const d = draftDate ? new Date(draftDate) : new Date();
    return Number.isNaN(d.getTime()) ? new Date().getMonth() : d.getMonth();
  });

  const handleStartEditing = () => {
    const initial = getInitialDateStr();
    setDraftDate(initial);

    const d = initial ? new Date(initial) : new Date();
    if (!Number.isNaN(d.getTime())) {
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = (dateToSave = draftDate) => {
    setIsEditing(false);
    if (handlePaidOnChange) {
      handlePaidOnChange(payment, dateToSave);
    }
  };

  // Close when clicking outside the popover
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsEditing(false);
      }
    };

    if (isEditing) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEditing]);

  // Keyboard navigation inside popover
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  // Quick select helpers
  const handleQuickSelect = (type) => {
    const now = new Date();
    let targetStr = "";

    if (type === "today") {
      targetStr = toISODateString(now);
      setViewYear(now.getFullYear());
      setViewMonth(now.getMonth());
    } else if (type === "yesterday") {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      targetStr = toISODateString(yesterday);
      setViewYear(yesterday.getFullYear());
      setViewMonth(yesterday.getMonth());
    } else if (type === "clear") {
      targetStr = "";
    }

    setDraftDate(targetStr);
  };

  // Month navigation
  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Generate days array for grid rendering
  const renderCalendarDays = () => {
    const totalDays = getDaysInMonth(viewYear, viewMonth);
    const firstDayIndex = getFirstDayOfMonth(viewYear, viewMonth);
    const todayStr = toISODateString(new Date());

    const days = [];

    // Empty padding slots for previous month
    for (let i = 0; i < firstDayIndex; i += 1) {
      days.push(<div key={`empty-${i}`} className="h-7 w-7" />);
    }

    // Days of the month
    for (let day = 1; day <= totalDays; day += 1) {
      const dateObj = new Date(viewYear, viewMonth, day);
      const dateStr = toISODateString(dateObj);
      const isSelected = draftDate === dateStr;
      const isToday = todayStr === dateStr;

      days.push(
        <button
          key={dateStr}
          type="button"
          onClick={() => {
            setDraftDate(dateStr);
          }}
          className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-extrabold transition-all ${
            isSelected
              ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
              : isToday
              ? "border border-indigo-200 bg-indigo-50/60 text-indigo-700"
              : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  /*
  |--------------------------------------------------------------------------
  | EDITING MODE: Advanced Professional Popover
  |--------------------------------------------------------------------------
  */
  if (isEditing && isAdminOrOwner) {
    return (
      <div className="relative inline-block" ref={popoverRef}>
        {/* Trigger Badge showing editing state */}
        <div className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-300 bg-indigo-50/50 px-2 py-1 text-xs font-bold text-indigo-700">
          <CalendarIcon size={13} className="text-indigo-500" />
          <span>{draftDate || "No Date"}</span>
        </div>

        {/* Popover Card */}
        <div
          onKeyDown={handleKeyDown}
          className="absolute right-0 top-8 z-50 w-64 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Quick Select Pills */}
          <div className="flex items-center justify-between gap-1 border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleQuickSelect("today")}
                className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-extrabold text-slate-600 transition hover:bg-slate-100 hover:text-slate-800"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect("yesterday")}
                className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-extrabold text-slate-600 transition hover:bg-slate-100 hover:text-slate-800"
              >
                Yesterday
              </button>
            </div>
            <button
              type="button"
              onClick={() => handleQuickSelect("clear")}
              className="text-[10px] font-bold text-rose-600 hover:underline"
            >
              Clear
            </button>
          </div>

          {/* Manual Date Input Field */}
          <div className="mt-2.5 flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase text-slate-400">
              Date:
            </span>
            <input
              type="date"
              value={draftDate}
              onChange={(e) => {
                const val = e.target.value;
                setDraftDate(val);
                if (val) {
                  const d = new Date(val);
                  if (!Number.isNaN(d.getTime())) {
                    setViewYear(d.getFullYear());
                    setViewMonth(d.getMonth());
                  }
                }
              }}
              className="h-7 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs font-semibold text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Monthly Navigation Header */}
          <div className="mt-3 flex items-center justify-between px-1">
            <span className="text-xs font-black text-slate-800">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={prevMonth}
                className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="mt-2 grid grid-cols-7 text-center">
            {WEEK_DAYS.map((day) => (
              <span
                key={day}
                className="text-[10px] font-black uppercase text-slate-400"
              >
                {day}
              </span>
            ))}
          </div>

          {/* Calendar Day Buttons Grid */}
          <div className="mt-1 grid grid-cols-7 gap-y-1 place-items-center">
            {renderCalendarDays()}
          </div>

          {/* Footer Action Buttons */}
          <div className="mt-3 flex items-center justify-end gap-1.5 border-t border-slate-100 pt-2.5">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg px-2.5 py-1.5 text-xs font-extrabold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSave()}
              className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-extrabold text-white shadow-xs transition hover:bg-indigo-700 active:scale-95"
            >
              <Check size={13} strokeWidth={3} />
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | DISPLAY MODE: Clean Table Cell
  |--------------------------------------------------------------------------
  */
  return (
    <div className="group inline-flex items-center gap-1.5">
      <span className="text-xs font-semibold text-slate-700">
        {formatDate(payment?.paidOn)}
      </span>

      {isAdminOrOwner && (
        <button
          type="button"
          onClick={handleStartEditing}
          className="rounded-md p-1 text-slate-400 opacity-0 transition-all group-hover:opacity-100 hover:bg-indigo-50 hover:text-indigo-600 focus:opacity-100"
          title="Edit Paid On Date"
        >
          <Pencil size={13} />
        </button>
      )}
    </div>
  );
};

export default PaidOnCell;