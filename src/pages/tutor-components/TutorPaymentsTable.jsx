import React, { useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CirclePause,
  Loader2,
  MoreVertical,
  Pencil,
  WalletCards,
  X,
} from "lucide-react";

import {
  formatCurrency,
  formatDate,
  getApprovalBadge,
  getTaskBadge,
} from "./tutorPayments.utils";
import PaidOnCell from "./PaidOncell";

const StatusBadge = ({ className, children }) => (
  <span
    className={`inline-flex items-center whitespace-nowrap rounded-md border px-2 py-0.5 text-[10px] font-extrabold tracking-wide shadow-2xs ${className}`}
  >
    {children}
  </span>
);

/*
|--------------------------------------------------------------------------
| Approved By Dropdown Cell
|--------------------------------------------------------------------------
*/
const ApprovedByCell = ({ payment, approvers = [], handleApprovedByChange }) => {
  const currentName =
    payment.approvedBy && payment.approvedBy !== "NA"
      ? payment.approvedBy
      : payment.paymentApprovedBy && payment.paymentApprovedBy !== "NA"
      ? payment.paymentApprovedBy
      : "";

  const defaultNames = ["Ranjeet", "Achintaya", "Tanamay"];
  const fetchedNames = approvers
    .map((user) => user.fullName || user.name)
    .filter(Boolean);

  const allOptions = [
    ...new Set([
      ...defaultNames,
      ...fetchedNames,
      ...(currentName ? [currentName] : []),
    ]),
  ];

  return (
    <select
      className="h-8 min-w-[130px] rounded-lg border border-slate-200/80 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-hidden"
      value={currentName}
      onChange={(e) => handleApprovedByChange(payment, e.target.value)}
    >
      <option value="" className="text-slate-400">
        Select Approver
      </option>
      {allOptions.map((name) => (
        <option key={name} value={name}>
          {name}
        </option>
      ))}
    </select>
  );
};

/*
-----------------------------------------------------------------------
*/
// const PaidOnCell = ({ payment, isAdminOrOwner, handlePaidOnChange }) => {
//   const [isEditing, setIsEditing] = useState(false);

//   const getInputValue = (isoString) => {
//     if (!isoString) return "";
//     const d = new Date(isoString);
//     return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
//   };

//   const handleDateChange = (e) => {
//     const selectedDate = e.target.value;
//     if (!selectedDate) return;

//     // 1. Trigger the save FIRST before unmounting the DOM input
//     if (handlePaidOnChange) {
//       handlePaidOnChange(payment, selectedDate);
//     } else {
//       console.error("handlePaidOnChange prop is missing in TutorPaymentsTable");
//     }

//     // 2. Close the editor after triggering the update
//     setIsEditing(false);
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === "Escape") {
//       setIsEditing(false);
//     }
//   };

//   if (isEditing && isAdminOrOwner) {
//     return (
//       <div className="flex items-center gap-1">
//         <input
//           type="date"
//           autoFocus
//           defaultValue={getInputValue(payment.paidOn)}
//           onChange={handleDateChange}
//           onKeyDown={handleKeyDown}
//           className="h-8 rounded-lg border border-indigo-500 bg-white px-2 text-xs font-semibold text-slate-800 shadow-xs focus:ring-2 focus:ring-indigo-100 focus:outline-hidden"
//         />
//         <button
//           type="button"
//           onClick={() => setIsEditing(false)}
//           className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
//           title="Cancel"
//         >
//           ✕
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="group flex items-center gap-1.5">
//       <span className="text-xs font-semibold text-slate-700">
//         {formatDate(payment.paidOn)}
//       </span>
//       {isAdminOrOwner && (
//         <button
//           type="button"
//           onClick={() => setIsEditing(true)}
//           className="rounded-md p-1 text-slate-400 opacity-0 transition-all group-hover:opacity-100 hover:bg-indigo-50 hover:text-indigo-600 focus:opacity-100"
//           title="Edit Paid On Date"
//         >
//           <Pencil size={13} />
//         </button>
//       )}
//     </div>
//   );
// };

/*
|--------------------------------------------------------------------------
| Admin Action Dropdown
|--------------------------------------------------------------------------
*/
const AdminPaymentAction = ({
  payment,
  openActionID,
  setOpenActionID,
  onRelease,
  onApprove,
  onHold,
  onReject,
}) => {
  if (payment.paid) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200/80 bg-emerald-50/80 px-2.5 py-1.5 text-[10px] font-extrabold text-emerald-700">
        <CheckCircle2 size={13} className="text-emerald-600" />
        Released
      </span>
    );
  }

  if (String(payment.approvalStatus).toLowerCase() === "approved") {
    return (
      <button
        type="button"
        onClick={onRelease}
        className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-[10px] font-extrabold text-indigo-600 shadow-2xs transition hover:border-indigo-300 hover:bg-indigo-50/60 active:scale-95"
      >
        <WalletCards size={13} />
        Release Payment
      </button>
    );
  }

  const isOpen = openActionID === payment.id;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpenActionID(isOpen ? null : payment.id)}
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
          isOpen
            ? "bg-slate-100 text-slate-700"
            : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        }`}
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-9 z-30 w-40 overflow-hidden rounded-xl border border-slate-200/80 bg-white p-1 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100">
          <button
            type="button"
            onClick={onApprove}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-bold text-emerald-700 transition hover:bg-emerald-50"
          >
            <CheckCircle2 size={14} />
            Approve
          </button>

          <button
            type="button"
            onClick={onHold}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-bold text-amber-700 transition hover:bg-amber-50"
          >
            <CirclePause size={14} />
            Put On Hold
          </button>

          <button
            type="button"
            onClick={onReject}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-bold text-rose-700 transition hover:bg-rose-50"
          >
            <X size={14} />
            Reject
          </button>
        </div>
      )}
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| Executive Action Popover
|--------------------------------------------------------------------------
*/
const ExecutivePaymentAction = ({ payment, openActionID, setOpenActionID }) => {
  const isOpen = openActionID === payment.id;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpenActionID(isOpen ? null : payment.id)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        title="View payment information"
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-9 z-30 w-48 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Payment Status
          </p>
          <p className="mt-1 text-xs font-extrabold text-slate-700">
            {payment.paid ? "Payment Released" : payment.approvalStatus}
          </p>
          <p className="mt-2 text-[10px] leading-relaxed font-medium text-slate-500">
            Only Owner/Admin can approve or release a payment.
          </p>
        </div>
      )}
    </div>
  );
};

/*
|--------------------------------------------------------------------------
| Main Table Component
|--------------------------------------------------------------------------
*/
const TutorPaymentsTable = ({
  loading,
  visiblePayments,
  isAdminOrOwner,
  openActionID,
  setOpenActionID,
  setSelectedPayment,
  handleApprovePayment,
  handlePutOnHold,
  handleRejectPayment,
  filteredCount,
  firstIndex,
  lastIndex,
  currentPage,
  totalPages,
  setCurrentPage,
  pageNumbers,
  rowsPerPage,
  setRowsPerPage,
  approvers,
  handleApprovedByChange,
  handlePaidOnChange,
}) => (
  <div className="w-full min-w-0 max-w-full rounded-2xl border border-slate-200/80 bg-white shadow-xs">
    <div
      className="tutor-payment-scroll w-full overflow-x-auto overflow-y-auto"
      style={{
        height: "calc(100vh - 330px)",
        minHeight: "380px",
        maxHeight: "calc(100vh - 330px)",
      }}
    >
      <table
        className="border-collapse"
        style={{
          width: "1720px",
          minWidth: "1720px",
        }}
      >
        <thead className="sticky top-0 z-20 bg-slate-50/90 backdrop-blur-sm">
          <tr className="border-b border-slate-200/80">
            {[
              "Task Date",
              "Task ID",
              "Subject",
              "Brand",
              "Tutor ID",
              "Tutor Amount",
              "Approval Status",
              "Approved By",
              "Task Status",
              "Pay Date (Expected)",
              "Paid?",
              "Paid On",
              "Remarks",
              "Action",
            ].map((heading) => (
              <th
                key={heading}
                className="whitespace-nowrap px-3.5 py-3.5 text-left text-[10px] font-extrabold uppercase tracking-wider text-slate-500"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {loading ? (
            <tr>
              <td colSpan={14}>
                <div className="flex min-h-[340px] flex-col items-center justify-center">
                  <Loader2 className="h-7 w-7 animate-spin text-indigo-600" />
                  <p className="mt-3 text-xs font-bold text-slate-600">
                    Loading payments...
                  </p>
                </div>
              </td>
            </tr>
          ) : visiblePayments.length > 0 ? (
            visiblePayments.map((payment) => (
              <tr
                key={payment.id}
                className="transition-colors hover:bg-slate-50/70"
              >
                <td className="whitespace-nowrap px-3.5 py-3.5 text-xs font-semibold text-slate-700">
                  {formatDate(payment.taskDate)}
                </td>

                <td className="whitespace-nowrap px-3.5 py-3.5">
                  <button
                    type="button"
                    className="text-xs font-extrabold text-indigo-600 transition hover:text-indigo-800 hover:underline"
                  >
                    {payment.taskID}
                  </button>
                </td>

                <td className="max-w-[180px] truncate px-3.5 py-3.5 text-xs font-semibold text-slate-700">
                  {payment.subject}
                </td>

                <td className="whitespace-nowrap px-3.5 py-3.5 text-xs font-extrabold text-slate-700">
                  {payment.brand || "NA"}
                </td>

                <td className="whitespace-nowrap px-3.5 py-3.5 text-xs font-semibold text-slate-700">
                  {payment.tutorID}
                </td>

                <td className="whitespace-nowrap px-3.5 py-3.5 text-xs font-extrabold text-slate-900">
                  {formatCurrency(payment.tutorAmount)}
                </td>

                <td className="px-3.5 py-3.5">
                  <StatusBadge className={getApprovalBadge(payment.approvalStatus)}>
                    {payment.approvalStatus}
                  </StatusBadge>
                </td>

                <td className="px-3.5 py-3.5">
                  <ApprovedByCell
                    payment={payment}
                    approvers={approvers}
                    handleApprovedByChange={handleApprovedByChange}
                  />
                </td>

                <td className="px-3.5 py-3.5">
                  <StatusBadge className={getTaskBadge(payment.taskStatus)}>
                    {payment.taskStatus || "—"}
                  </StatusBadge>
                </td>

                <td className="whitespace-nowrap px-3.5 py-3.5 text-xs font-semibold text-slate-700">
                  {formatDate(payment.expectedPayDate)}
                </td>

                <td className="px-3.5 py-3.5">
                  <StatusBadge
                    className={
                      payment.paid
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-orange-200 bg-orange-50 text-orange-700"
                    }
                  >
                    {payment.paid ? "Yes" : "Pending"}
                  </StatusBadge>
                </td>

                <td className="whitespace-nowrap px-3.5 py-3.5">
                  <PaidOnCell
                    payment={payment}
                    isAdminOrOwner={isAdminOrOwner}
                    handlePaidOnChange={handlePaidOnChange}
                  />
                </td>

                <td
                  className="max-w-[170px] truncate px-3.5 py-3.5 text-[11px] font-medium text-slate-500"
                  title={payment.remarks}
                >
                  {payment.remarks || "—"}
                </td>

                <td className="relative whitespace-nowrap px-3.5 py-3.5">
                  {isAdminOrOwner ? (
                    <AdminPaymentAction
                      payment={payment}
                      openActionID={openActionID}
                      setOpenActionID={setOpenActionID}
                      onRelease={() => setSelectedPayment(payment)}
                      onApprove={() => handleApprovePayment(payment)}
                      onHold={() => handlePutOnHold(payment)}
                      onReject={() => handleRejectPayment(payment)}
                    />
                  ) : (
                    <ExecutivePaymentAction
                      payment={payment}
                      openActionID={openActionID}
                      setOpenActionID={setOpenActionID}
                    />
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={14}>
                <div className="flex min-h-[340px] flex-col items-center justify-center p-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                    <WalletCards size={24} className="text-slate-400" />
                  </div>
                  <p className="mt-3 text-sm font-extrabold text-slate-700">
                    No payment records found
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-400">
                    Adjust your search keywords or reset active filters.
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    {/* Footer Pagination & Filter Controls */}
    <div className="flex flex-col gap-3 border-t border-slate-200/80 bg-slate-50/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs font-semibold text-slate-500">
        Showing{" "}
        <span className="font-extrabold text-slate-700">
          {filteredCount ? firstIndex + 1 : 0}
        </span>{" "}
        to{" "}
        <span className="font-extrabold text-slate-700">
          {Math.min(lastIndex, filteredCount)}
        </span>{" "}
        of{" "}
        <span className="font-extrabold text-slate-700">
          {filteredCount}
        </span>{" "}
        entries
      </p>

      <div className="flex items-center justify-center gap-1.5">
        <button
          type="button"
          onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
          disabled={currentPage === 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-2xs transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={16} />
        </button>

        {pageNumbers.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => setCurrentPage(page)}
            className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-extrabold transition shadow-2xs ${
              currentPage === page
                ? "bg-indigo-600 text-white shadow-indigo-200"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          onClick={() =>
            setCurrentPage((page) => Math.min(page + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-2xs transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="flex items-center justify-end gap-2">
        <span className="text-xs font-semibold text-slate-500">
          Rows per page
        </span>
        <select
          value={rowsPerPage}
          onChange={(event) => setRowsPerPage(Number(event.target.value))}
          className="h-8 rounded-lg border border-slate-200/80 bg-white px-2.5 text-xs font-extrabold text-slate-700 shadow-2xs outline-hidden transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        >
          {[5, 10, 20, 50].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
    </div>
  </div>
);

export default TutorPaymentsTable;