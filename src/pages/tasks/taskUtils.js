export const rowsPerPageOptions = [10, 20, 30, 50, 100];

export const CLOSED_STATUSES = ["Task Completed", "Cancel", "Refund"];

export const IN_PROGRESS_STATUSES = [
  "Advance Received",
  "Tutor Notified",
  "Tutor Assigned",
  "Solution Received",
  "Being Modified",
];

export const PENDING_REVIEW_STATUSES = [
  "Task Completed",
  "Solution Received",
  "Being Modified",
];

export const UNASSIGNED_STATUSES = ["Advance Received", "Tutor Notified"];

export const safeText = (value) => {
  if (value === undefined || value === null) return "";
  return String(value);
};

export const safeNumber = (value) => {
  const num = Number(value);
  return Number.isNaN(num) ? 0 : num;
};

export const safeDate = (value) => {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return date;
};

export const isClosedTask = (task) => {
  return CLOSED_STATUSES.includes(task?.status);
};

export const isTutorAssigned = (task) => {
  const tutorID =
    task?.tutorDetails?.tutorID ||
    task?.tutorID ||
    task?.assignedTutorID ||
    "";

  return Boolean(
    tutorID &&
      tutorID !== "NA" &&
      tutorID !== "N/A" &&
      tutorID !== "TI0000" &&
      tutorID !== "T-0000"
  );
};

export const isUnassignedTask = (task) => {
  return UNASSIGNED_STATUSES.includes(task?.status) && !isTutorAssigned(task);
};

export const isTutorPaymentHold = (task) => {
  const paymentStatus =
    task?.tutorDetails?.paymentStatus ||
    task?.tutorPaymentStatus ||
    "";

  return safeText(paymentStatus).toLowerCase() === "hold";
};

export const isTutorDeadlineCrossed = (task) => {
  const deadline = safeDate(task?.tutorDeadline);

  if (!deadline) return false;

  return deadline < new Date();
};

export const isClientDeadlineCrossed = (task) => {
  const deadline = safeDate(task?.clientDeadline);

  if (!deadline) return false;

  return deadline < new Date();
};

export const isPendingReviewTask = (task) => {
  const paymentHold = isTutorPaymentHold(task);
  const statusMatched = PENDING_REVIEW_STATUSES.includes(task?.status);
  const tutorDeadlineCrossed = isTutorDeadlineCrossed(task);

  return paymentHold && (statusMatched || tutorDeadlineCrossed);
};

export const isOverdueTask = (task) => {
  const deadlineCrossed = isTutorDeadlineCrossed(task);
  const notClosed = !isClosedTask(task);

  return deadlineCrossed && notClosed;
};

export const isCompletedTask = (task) => {
  return task?.status === "Task Completed";
};

export const isInProgressTask = (task) => {
  return IN_PROGRESS_STATUSES.includes(task?.status) && !isCompletedTask(task);
};

export const isUpcomingTask = (task) => {
  const deadline = safeDate(task?.clientDeadline || task?.tutorDeadline);

  if (!deadline) return false;

  return deadline >= new Date() && !isClosedTask(task);
};

export const isDateMatched = (task, dateFilter) => {
  if (!dateFilter || dateFilter === "all") return true;

  const taskDate = safeDate(task?.clientDeadline || task?.createdAt);

  if (!taskDate) return false;

  const now = new Date();

  if (dateFilter === "today") {
    return taskDate.toDateString() === now.toDateString();
  }

  if (dateFilter === "7days") {
    const from = new Date();
    from.setDate(now.getDate() - 7);
    return taskDate >= from;
  }

  if (dateFilter === "30days") {
    const from = new Date();
    from.setDate(now.getDate() - 30);
    return taskDate >= from;
  }

  return true;
};

export const getTaskSearchText = (task) => {
  return [
    task?.taskID,
    task?.subject,
    task?.subjectDes,
    task?.status,
    task?.clientDetails?.name,
    task?.clientDetails?.clientID,
    task?.clientDetails?.chatID,
    task?.clientDetails?.type,
    task?.tutorDetails?.name,
    task?.tutorDetails?.tutorID,
    task?.agentDetails?.name,
    task?.agentDetails?.comment,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
};

export const filterTasksFrontend = (tasks = [], filters = {}) => {
  const {
    activeTab = "all",
    search = "",
    statusFilter = "",
    subjectFilter = "",
    tutorFilter = "",
    clientFilter = "",
    dateFilter = "all",
  } = filters;

  let list = [...tasks];

  if (activeTab === "upcoming") {
    list = list.filter(isUpcomingTask);
  }

  if (activeTab === "inProgress") {
    list = list.filter(isInProgressTask);
  }

  if (activeTab === "pendingReview") {
    list = list.filter(isPendingReviewTask);
  }

  if (activeTab === "completed") {
    list = list.filter(isCompletedTask);
  }

  if (activeTab === "overdue") {
    list = list.filter(isOverdueTask);
  }

  if (activeTab === "unassigned") {
    list = list.filter(isUnassignedTask);
  }

  if (search.trim()) {
    const value = search.toLowerCase();
    list = list.filter((task) => getTaskSearchText(task).includes(value));
  }

  if (statusFilter) {
    list = list.filter((task) => task?.status === statusFilter);
  }

  if (subjectFilter.trim()) {
    const value = subjectFilter.toLowerCase();
    list = list.filter((task) =>
      safeText(task?.subject).toLowerCase().includes(value)
    );
  }

  if (tutorFilter.trim()) {
    const value = tutorFilter.toLowerCase();
    list = list.filter((task) =>
      [
        task?.tutorDetails?.name,
        task?.tutorDetails?.tutorID,
        task?.tutorID,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(value)
    );
  }

  if (clientFilter.trim()) {
    const value = clientFilter.toLowerCase();
    list = list.filter((task) =>
      [
        task?.clientDetails?.name,
        task?.clientDetails?.clientID,
        task?.clientDetails?.chatID,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(value)
    );
  }

  if (dateFilter !== "all") {
    list = list.filter((task) => isDateMatched(task, dateFilter));
  }

  return list;
};

export const calculateStats = (tasks = [], serverTotal = 0) => {
  return {
    total: serverTotal || tasks.length,
    upcoming: tasks.filter(isUpcomingTask).length,
    inProgress: tasks.filter(isInProgressTask).length,
    pendingReview: tasks.filter(isPendingReviewTask).length,
    completed: tasks.filter(isCompletedTask).length,
    overdue: tasks.filter(isOverdueTask).length,
    unassigned: tasks.filter(isUnassignedTask).length,
  };
};

export const formatDateTime = (date) => {
  const parsedDate = safeDate(date);

  if (!parsedDate) return "NA";

  return parsedDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatAmount = (amount, currency = "INR") => {
  const value = safeNumber(amount);
  return `${value} ${currency || "INR"}`;
};