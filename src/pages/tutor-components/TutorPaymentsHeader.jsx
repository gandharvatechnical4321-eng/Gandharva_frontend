import React from "react";
import {
  CalendarDays,
  ChevronDown,
  Download,
  Hourglass,
  RefreshCcw,
  Search,
  SlidersHorizontal,
  WalletCards,
} from "lucide-react";

import {
  BRAND_OPTIONS,
  formatCurrency,
} from "./tutorPayments.utils";

const FilterSelect = ({
  label,
  value,
  onChange,
  options,
}) => (
  <label className="relative block h-11 rounded-xl border border-slate-200 bg-white px-3">
    <span className="pointer-events-none absolute left-3 top-1.5 text-[9px] font-extrabold text-slate-400">
      {label}
    </span>

    <select
      value={value}
      onChange={(event) =>
        onChange(event.target.value)
      }
      className="h-full w-full appearance-none bg-transparent pb-1 pt-3 text-xs font-extrabold text-slate-700 outline-none"
    >
      {options.map((option) => (
        <option
          key={option}
          value={option}
        >
          {option}
        </option>
      ))}
    </select>

    <ChevronDown
      size={14}
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
    />
  </label>
);

const SummaryCard = ({
  icon,
  label,
  amount,
  count,
  className,
  iconClassName,
}) => (
  <div
    className={`flex min-h-[106px] items-center gap-4 rounded-2xl border bg-gradient-to-r p-4 sm:p-5 ${className}`}
  >
    <div
      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${iconClassName}`}
    >
      {icon}
    </div>

    <div>
      <p className="text-xs font-extrabold text-slate-600">
        {label}
      </p>

      <p className="mt-1 text-2xl font-black tracking-tight text-slate-900">
        {formatCurrency(amount)}
      </p>

      <p className="mt-1 text-xs font-semibold text-slate-500">
        {count} Payments
      </p>
    </div>
  </div>
);

const TutorPaymentsHeader = ({
  isAdminOrOwner,

  startDate,
  endDate,
  setStartDate,
  setEndDate,
  applyDateFilter,

  exportCSV,

  paidAmount,
  paidCount,
  onHoldAmount,
  onHoldCount,

  searchValue,
  setSearchValue,

  approvalFilter,
  setApprovalFilter,
  approvalOptions,

  taskFilter,
  setTaskFilter,
  taskStatusOptions,

  brandFilter,
  setBrandFilter,

  paidFilter,
  setPaidFilter,

  resetFilters,
}) => {
  const invalidDateRange =
    Boolean(startDate) &&
    Boolean(endDate) &&
    startDate > endDate;

  const noDateSelected =
    !startDate && !endDate;

  const handleApplyDateFilter = () => {
    if (invalidDateRange) {
      return;
    }

    applyDateFilter?.({
      startDate,
      endDate,
    });
  };

  const handleResetFilters = () => {
    resetFilters();

    // This ensures the displayed date values are also cleared.
    setStartDate("");
    setEndDate("");
  };

  return (
    <>
      {/* Page heading and actions */}
      <div className="mb-4 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600">
            <WalletCards size={22} />
          </div>

          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
              Tutor Payments
            </h1>

            <p className="mt-0.5 text-xs font-medium text-slate-500 sm:text-sm">
              {isAdminOrOwner
                ? "Manage, approve and release tutor payments"
                : "Manage and track tutor payments"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-start gap-2">
          {/* Date range */}
          <div>
            <div
              className={`flex h-10 items-center gap-2 rounded-xl border bg-white px-3 shadow-sm ${
                invalidDateRange
                  ? "border-red-300"
                  : "border-slate-200"
              }`}
            >
              <CalendarDays
                size={16}
                className={
                  invalidDateRange
                    ? "text-red-500"
                    : "text-slate-500"
                }
              />

              <input
                type="date"
                value={startDate}
                max={endDate || undefined}
                onChange={(event) =>
                  setStartDate(
                    event.target.value
                  )
                }
                aria-label="Start date"
                className="w-[112px] bg-transparent text-xs font-bold text-slate-700 outline-none"
              />

              <span className="text-xs text-slate-400">
                –
              </span>

              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(event) =>
                  setEndDate(
                    event.target.value
                  )
                }
                aria-label="End date"
                className="w-[112px] bg-transparent text-xs font-bold text-slate-700 outline-none"
              />
            </div>

            {invalidDateRange && (
              <p className="mt-1 text-[10px] font-bold text-red-500">
                End date cannot be before start
                date.
              </p>
            )}
          </div>

          {/* Apply date filter */}
          <button
            type="button"
            onClick={handleApplyDateFilter}
            disabled={
              invalidDateRange ||
              noDateSelected
            }
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 text-xs font-extrabold text-indigo-700 shadow-sm transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
          >
            <SlidersHorizontal size={16} />
            Filter
          </button>

          {/* Export */}
          <button
            type="button"
            onClick={exportCSV}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-xs font-extrabold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="mb-4 grid gap-3 lg:grid-cols-2">
        <SummaryCard
          icon={<WalletCards size={25} />}
          label="Paid Amount"
          amount={paidAmount}
          count={paidCount}
          className="border-emerald-100 from-emerald-50/80 to-white"
          iconClassName="bg-emerald-100/70 text-emerald-600"
        />

        <SummaryCard
          icon={<Hourglass size={25} />}
          label="On Hold"
          amount={onHoldAmount}
          count={onHoldCount}
          className="border-orange-100 from-orange-50/80 to-white"
          iconClassName="bg-orange-100/70 text-orange-500"
        />
      </div>

      {/* Other filters */}
      <div className="mb-3 grid gap-2 md:grid-cols-2 xl:grid-cols-[minmax(250px,1.4fr)_0.7fr_1fr_1fr_0.8fr_auto]">
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={searchValue}
            onChange={(event) =>
              setSearchValue(
                event.target.value
              )
            }
            placeholder="Search by Task ID, Subject, Tutor ID or Brand..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-xs font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50"
          />
        </div>

        <FilterSelect
          label="Payment Approval Status"
          value={approvalFilter}
          onChange={setApprovalFilter}
          options={approvalOptions}
        />

        <FilterSelect
          label="Task Status"
          value={taskFilter}
          onChange={setTaskFilter}
          options={taskStatusOptions}
        />

        <FilterSelect
          label="Brand"
          value={brandFilter}
          onChange={setBrandFilter}
          options={BRAND_OPTIONS}
        />

        <FilterSelect
          label="Paid?"
          value={paidFilter}
          onChange={setPaidFilter}
          options={[
            "All",
            "Paid",
            "Pending",
          ]}
        />

        <button
          type="button"
          onClick={handleResetFilters}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-extrabold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <RefreshCcw size={15} />
          Reset
        </button>
      </div>
    </>
  );
};

export default TutorPaymentsHeader;