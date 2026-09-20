import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";

import TutorPaymentsHeader from "./tutor-components/TutorPaymentsHeader";
import TutorPaymentsTable from "./tutor-components/TutorPaymentsTable";
import PaymentReleaseModal from "./tutor-components/PaymentReleaseModal";

import {
  BACKEND_URL,
  DEFAULT_ROWS_PER_PAGE,
  formatDate,
  getAuthHeaders,
  getISODate,
  normalizePayment,
  normalizeRole,
} from "./tutor-components/tutorPayments.utils";

const TutorPaymentsPage = () => {
  const deviceDetails = useSelector((state) => state.contacts?.deviceDetails);
  const authUserRole = useSelector((state) => state.auth?.user?.role);

  const reduxRole = deviceDetails?.role || authUserRole;
  const storedRole = Cookies.get("role") || localStorage.getItem("role");
  const currentRole = normalizeRole(reduxRole || storedRole);

  const isAdminOrOwner = ["admin", "owner"].includes(currentRole);
  const isOperationExecutive = currentRole === "operation executive";

  const [payments, setPayments] = useState([]);
  const [approvers, setApprovers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingPayment, setUpdatingPayment] = useState(false);

  const [searchValue, setSearchValue] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("All");
  const [taskFilter, setTaskFilter] = useState("All");
  const [paidFilter, setPaidFilter] = useState("All");
  const [brandFilter, setBrandFilter] = useState("All");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [openActionID, setOpenActionID] = useState(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);

      if (!BACKEND_URL) {
        throw new Error("REACT_APP_BACKEND_URL is missing");
      }

      const response = await axios.get(`${BACKEND_URL}/api/tutor-payments`, {
        params: { page: 1, limit: 10000 },
        headers: getAuthHeaders(),
      });

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Unable to load tutor payments"
        );
      }

      const sourceRows = Array.isArray(response.data.payments)
        ? response.data.payments
        : [];

      setPayments(sourceRows.map(normalizePayment));
    } catch (error) {
      console.error(
        "Tutor payment loading failed:",
        error?.response?.data || error?.message || error
      );

      setPayments([]);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Tutor payments could not be loaded.",
        {
          duration: 5000,
          position: "top-center",
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const loadApprovers = async () => {
    try {
      if (!BACKEND_URL) return;

      const res = await axios.get(`${BACKEND_URL}/api/users`, {
        headers: getAuthHeaders(),
      });

      const usersList = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.users)
        ? res.data.users
        : [];

      setApprovers(usersList);
    } catch (error) {
      console.error("Unable to fetch approvers:", error?.message || error);
      setApprovers([]);
    }
  };

  useEffect(() => {
    fetchPayments();
    loadApprovers();
  }, []);

  const approvalOptions = useMemo(
    () => [
      "All",
      ...new Set(payments.map((item) => item.approvalStatus).filter(Boolean)),
    ],
    [payments]
  );

  const taskStatusOptions = useMemo(
    () => [
      "All",
      ...new Set(payments.map((item) => item.taskStatus).filter(Boolean)),
    ],
    [payments]
  );

  const filteredPayments = useMemo(() => {
    const search = searchValue.trim().toLowerCase();

    return payments.filter((payment) => {
      const matchesSearch =
        !search ||
        [
          payment.taskID,
          payment.subject,
          payment.tutorID,
          payment.tutorName,
          payment.brand,
        ].some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(search)
        );

      const matchesApproval =
        approvalFilter === "All" || payment.approvalStatus === approvalFilter;

      const matchesTask =
        taskFilter === "All" || payment.taskStatus === taskFilter;

      const matchesPaid =
        paidFilter === "All" ||
        (paidFilter === "Paid" && payment.paid) ||
        (paidFilter === "Pending" && !payment.paid);

      const matchesBrand =
        brandFilter === "All" || payment.brand === brandFilter;

      const taskDate = getISODate(payment.taskDate);

      const matchesStartDate =
        !startDate || !taskDate || taskDate >= startDate;

      const matchesEndDate = !endDate || !taskDate || taskDate <= endDate;

      return (
        matchesSearch &&
        matchesApproval &&
        matchesTask &&
        matchesPaid &&
        matchesBrand &&
        matchesStartDate &&
        matchesEndDate
      );
    });
  }, [
    payments,
    searchValue,
    approvalFilter,
    taskFilter,
    paidFilter,
    brandFilter,
    startDate,
    endDate,
  ]);

  const paidPayments = useMemo(
    () => payments.filter((payment) => payment.paid),
    [payments]
  );

  const heldPayments = useMemo(
    () =>
      payments.filter(
        (payment) =>
          String(payment.approvalStatus).toLowerCase() === "on hold"
      ),
    [payments]
  );

  const paidAmount = useMemo(
    () =>
      paidPayments.reduce(
        (total, payment) => total + Number(payment.tutorAmount || 0),
        0
      ),
    [paidPayments]
  );

  const onHoldAmount = useMemo(
    () =>
      heldPayments.reduce(
        (total, payment) => total + Number(payment.tutorAmount || 0),
        0
      ),
    [heldPayments]
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPayments.length / rowsPerPage)
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchValue,
    approvalFilter,
    taskFilter,
    paidFilter,
    brandFilter,
    startDate,
    endDate,
    rowsPerPage,
  ]);

  const firstIndex = (currentPage - 1) * rowsPerPage;
  const lastIndex = firstIndex + rowsPerPage;
  const visiblePayments = filteredPayments.slice(firstIndex, lastIndex);

  const resetFilters = () => {
    setSearchValue("");
    setApprovalFilter("All");
    setTaskFilter("All");
    setPaidFilter("All");
    setBrandFilter("All");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  const updatePaymentLocally = (taskID, updates) => {
    setPayments((previousPayments) =>
      previousPayments.map((payment) =>
        payment.taskID === taskID
          ? {
              ...payment,
              ...updates,
            }
          : payment
      )
    );
  };

  const updatePaymentStatus = async (payment, status, paymentRemarks = "") => {
    const response = await axios.patch(
      `${BACKEND_URL}/api/tutor-payments/${encodeURIComponent(
        payment.taskID
      )}/status`,
      {
        status,
        paymentRemarks,
      },
      {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data?.success) {
      throw new Error(response.data?.message || "Unable to update payment");
    }

    const updatedPayment = response.data.payment || {};
    const newApprovedBy =
      updatedPayment.paymentApprovedBy ||
      payment.approvedBy ||
      payment.paymentApprovedBy ||
      "NA";

    updatePaymentLocally(payment.taskID, {
      approvalStatus: updatedPayment.paymentApprovalStatus || status,
      approvedBy: newApprovedBy,
      paymentApprovedBy: newApprovedBy,
      paidOn: updatedPayment.paidOn || "",
      paid: false,
      remarks:
        updatedPayment.paymentRemarks || paymentRemarks || "NA",
    });
  };

  const handleReleasePayment = async () => {
    if (!selectedPayment || !isAdminOrOwner) {
      return;
    }

    try {
      setUpdatingPayment(true);

      const response = await axios.patch(
        `${BACKEND_URL}/api/tutor-payments/${encodeURIComponent(
          selectedPayment.taskID
        )}/paid`,
        {
          paymentRemarks:
            selectedPayment.remarks === "NA"
              ? "Paid through UPI"
              : selectedPayment.remarks,
        },
        {
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Unable to mark payment as paid"
        );
      }

      const updatedPayment = response.data.payment || {};

      updatePaymentLocally(selectedPayment.taskID, {
        approvalStatus: "Paid",
        paid: true,
        amountPaid: updatedPayment.amountPaid ?? selectedPayment.tutorAmount,
        remainingAmount: 0,
        approvedBy:
          updatedPayment.paymentApprovedBy ||
          selectedPayment.approvedBy ||
          "NA",
        paidOn: updatedPayment.paidOn || new Date().toISOString(),
        remarks: updatedPayment.paymentRemarks || "Paid through UPI",
      });

      toast.success("Payment marked as paid.", {
        duration: 2500,
        position: "top-center",
      });

      setSelectedPayment(null);
    } catch (error) {
      console.error(
        "Payment release failed:",
        error?.response?.data || error?.message || error
      );

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Payment could not be updated.",
        {
          duration: 3500,
          position: "top-center",
        }
      );

      await fetchPayments();
    } finally {
      setUpdatingPayment(false);
    }
  };

  const runStatusAction = async (payment, status, successMessage) => {
    if (!isAdminOrOwner) {
      return;
    }

    try {
      setUpdatingPayment(true);

      await updatePaymentStatus(
        payment,
        status,
        payment.remarks === "NA"
          ? status === "Rejected"
            ? "Payment rejected"
            : ""
          : payment.remarks
      );

      toast.success(successMessage, {
        position: "top-center",
      });
    } catch (error) {
      console.error(
        `${status} payment error:`,
        error?.response?.data || error?.message
      );

      toast.error(
        error?.response?.data?.message ||
          `Unable to update payment to ${status}.`
      );

      await fetchPayments();
    } finally {
      setUpdatingPayment(false);
      setOpenActionID(null);
    }
  };

  const handlePutOnHold = (payment) =>
    runStatusAction(payment, "On Hold", "Payment moved to hold.");

  const handleApprovePayment = (payment) =>
    runStatusAction(payment, "Approved", "Payment approved.");

  const handleRejectPayment = (payment) =>
    runStatusAction(payment, "Rejected", "Payment rejected.");

  const copyUPI = async () => {
    if (!selectedPayment?.tutorUPI) {
      return;
    }

    try {
      await navigator.clipboard.writeText(selectedPayment.tutorUPI);

      toast.success("UPI ID copied.", {
        position: "top-center",
      });
    } catch (error) {
      toast.error("Unable to copy UPI ID.");
    }
  };

  const exportCSV = () => {
    const headers = [
      "Task Date",
      "Task ID",
      "Subject",
      "Brand",
      "Tutor ID",
      "Tutor Amount",
      "Payment Approval Status",
      "Approved By",
      "Task Status",
      "Pay Date Expected",
      "Paid",
      "Paid On",
      "Remarks",
    ];

    const rows = filteredPayments.map((payment) => [
      formatDate(payment.taskDate),
      payment.taskID,
      payment.subject,
      payment.brand,
      payment.tutorID,
      payment.tutorAmount,
      payment.approvalStatus,
      payment.approvedBy,
      payment.taskStatus,
      formatDate(payment.expectedPayDate),
      payment.paid ? "Yes" : "No",
      formatDate(payment.paidOn),
      payment.remarks,
    ]);

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `tutor-payments-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
  };

  const pageNumbers = [];
  const startPage = Math.max(1, currentPage - 1);
  const endPage = Math.min(totalPages, startPage + 2);

  for (let page = startPage; page <= endPage; page += 1) {
    pageNumbers.push(page);
  }

  // Deduplicated & reliable Approved By handler
  const handleApprovedByChange = async (payment, approvedByValue) => {
    const previousApprovedBy =
      payment.approvedBy || payment.paymentApprovedBy || "NA";
    const previousStatus = payment.approvalStatus;

    updatePaymentLocally(payment.taskID, {
      approvedBy: approvedByValue || "NA",
      paymentApprovedBy: approvedByValue || "NA",
      approvalStatus: "Approved",
    });

    try {
      const response = await axios.patch(
        `${BACKEND_URL}/api/tutor-payments/${encodeURIComponent(
          payment.taskID
        )}/approved-by`,
        {
          paymentApprovedBy: approvedByValue,
        },
        {
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Failed to update Approved By"
        );
      }

      toast.success("Approved By updated", {
        duration: 2000,
        position: "top-center",
      });
    } catch (err) {
      console.error("Approved By update failed:", err);

      updatePaymentLocally(payment.taskID, {
        approvedBy: previousApprovedBy,
        paymentApprovedBy: previousApprovedBy,
        approvalStatus: previousStatus,
      });

      toast.error(
        err?.response?.data?.message || "Unable to save Approved By",
        { duration: 3000, position: "top-center" }
      );
    }
  };

  // Handler for editing the Paid On date
  const handlePaidOnChange = async (payment, newDateValue) => {
    const previousPaidOn = payment.paidOn;
    const isoDate = newDateValue ? new Date(newDateValue).toISOString() : null;

    updatePaymentLocally(payment.taskID, {
      paidOn: isoDate || "",
    });

    try {
      const response = await axios.patch(
        `${BACKEND_URL}/api/tutor-payments/${encodeURIComponent(
          payment.taskID
        )}/paid-on`,
        { paidOn: isoDate },
        {
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to save date");
      }

      toast.success("Paid On date updated", {
        duration: 2000,
        position: "top-center",
      });
    } catch (err) {
      console.error("Paid On update failed:", err);

      updatePaymentLocally(payment.taskID, {
        paidOn: previousPaidOn || "",
      });

      toast.error(
        err?.response?.data?.message || "Unable to save Paid On date",
        { duration: 3000, position: "top-center" }
      );
    }
  };

  return (
    <section className="h-full min-h-0 w-full min-w-0 bg-slate-50/50 p-3 sm:p-4 lg:p-5">
      <div className="mx-auto min-w-0 w-full max-w-[1700px]">
        <TutorPaymentsHeader
          isAdminOrOwner={isAdminOrOwner}
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          exportCSV={exportCSV}
          paidAmount={paidAmount}
          paidCount={paidPayments.length}
          onHoldAmount={onHoldAmount}
          onHoldCount={heldPayments.length}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          approvalFilter={approvalFilter}
          setApprovalFilter={setApprovalFilter}
          approvalOptions={approvalOptions}
          taskFilter={taskFilter}
          setTaskFilter={setTaskFilter}
          taskStatusOptions={taskStatusOptions}
          brandFilter={brandFilter}
          setBrandFilter={setBrandFilter}
          paidFilter={paidFilter}
          setPaidFilter={setPaidFilter}
          resetFilters={resetFilters}
        />

        <TutorPaymentsTable
          loading={loading}
          visiblePayments={visiblePayments}
          isAdminOrOwner={isAdminOrOwner}
          openActionID={openActionID}
          setOpenActionID={setOpenActionID}
          setSelectedPayment={setSelectedPayment}
          handleApprovePayment={handleApprovePayment}
          approvers={approvers}
          handleApprovedByChange={handleApprovedByChange}
          // handleApprovedByChange={handleApprovedByChange}

          /* --- FIXED: PROP IS NOW WIRED IN --- */
          handlePaidOnChange={handlePaidOnChange}
          handlePutOnHold={handlePutOnHold}
          handleRejectPayment={handleRejectPayment}
          filteredCount={filteredPayments.length}
          firstIndex={firstIndex}
          lastIndex={lastIndex}
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          pageNumbers={pageNumbers}
          rowsPerPage={rowsPerPage}
          setRowsPerPage={setRowsPerPage}
        />

        {!isAdminOrOwner && !isOperationExecutive && (
          <p className="mt-3 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-700">
            Your current role is being shown with read-only payment access.
          </p>
        )}
      </div>

      {selectedPayment && isAdminOrOwner && (
        <PaymentReleaseModal
          selectedPayment={selectedPayment}
          updatingPayment={updatingPayment}
          onClose={() => setSelectedPayment(null)}
          onRelease={handleReleasePayment}
          copyUPI={copyUPI}
        />
      )}
    </section>
  );
};

export default TutorPaymentsPage;