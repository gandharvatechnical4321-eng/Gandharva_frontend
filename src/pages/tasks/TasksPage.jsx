
import React, { useEffect, useMemo, useState } from "react";
import {
  ClipboardList,
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
} from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  setPastTask,
  setSelectedTaskDetails,
  setOpenTaskUpdateCard,
} from "../../features/taskSlice";
import { setSearchContact } from "../../features/contactsSlice";

import TaskUpdateCard from "../../thirdSection/card/TaskUpdateCard";

import TaskStats from "./components/TaskStats";
import TaskTabs from "./components/TaskTabs";
import TaskFilters from "./components/TaskFilters";
import TaskSearch from "./components/TaskSearch";
import TaskTable from "./components/TaskTable";

import {
  calculateStats,
  filterTasksFrontend,
  rowsPerPageOptions,
} from "./taskUtils";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// ============================================================
// IMPORTANT:
// Change this ONLY if your task date is stored in another field.
// Examples:
// "createdAt"
// "date"
// "taskDate"
// "createdDate"
// "clientDeadline"
// ============================================================
const TASK_DATE_FIELD = "createdAt";

const TasksPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const openTaskUpdateCard = useSelector(
    (state) => state.tasks.openTaskUpdateCard
  );

  // ============================================================
  // MASTER DATA
  // ============================================================
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  // ============================================================
  // UI STATE
  // ============================================================
  const [activeTab, setActiveTab] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  // ============================================================
  // SEARCH
  // ============================================================
  const [searchQuery, setSearchQuery] = useState("");

  // ============================================================
  // DATE FILTERS ONLY
  // ============================================================
  const [appliedFilters, setAppliedFilters] = useState({
  status: "",
  startDate: "",
  endDate: "",
});

  // ============================================================
  // FETCH ALL TASKS
  // ============================================================
  const loadAllTasks = async () => {
    try {
      setLoading(true);

      if (!BACKEND_URL) {
        throw new Error("REACT_APP_BACKEND_URL is missing");
      }

      const response = await axios.get(
        `${BACKEND_URL}/api/task/client-deadline/alltask`,
        {
          params: {
            page: 1,
            limit: 10000,
            searchQuery: "",
          },
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );

      if (response?.data?.data) {
        const data = response.data.data;

        setAllTasks(data);

        dispatch(setPastTask(data));
      } else {
        setAllTasks([]);
        dispatch(setPastTask([]));
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);

      setAllTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================
  useEffect(() => {
    loadAllTasks();
  }, []);

  // ============================================================
  // GET TASK DATE
  // ============================================================
  const getTaskDate = (task) => {
    const value = task?.[TASK_DATE_FIELD];

    if (!value) {
      return null;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date;
  };

  // ============================================================
  // FRONTEND FILTERING
  //
  // Order:
  // 1. Active tab
  // 2. Search
  // 3. Start date
  // 4. End date
  // ============================================================
  const filteredTasks = useMemo(() => {
  let result = [...allTasks];

  // ==========================================================
  // ACTIVE TAB
  // ==========================================================
  result = filterTasksFrontend(result, {
    activeTab,
    search: "",
    startDate: "",
    endDate: "",
  });

  // ==========================================================
  // SEARCH
  // ==========================================================
  if (searchQuery.trim()) {
    const query = searchQuery.trim().toLowerCase();

    result = result.filter((task) => {
      const searchableText = [
        task?._id,
        task?.id,
        task?.taskID,
        task?.subject,
        task?.subjectDes,
        task?.title,
        task?.taskName,
        task?.status,
        task?.clientName,
        task?.clientDetails?.name,
        task?.clientDetails?.clientName,
        task?.clientDetails?.clientID,
        task?.tutorName,
        task?.tutorDetails?.name,
        task?.tutorDetails?.tutorID,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }

  // ==========================================================
  // STATUS FILTER
  // ==========================================================
  if (appliedFilters.status) {
    result = result.filter((task) => {
      return task?.status === appliedFilters.status;
    });
  }

  // ==========================================================
  // DATE FILTER
  // Uses task.createdAt
  // ==========================================================
  const { startDate, endDate } = appliedFilters;

  if (startDate || endDate) {
    result = result.filter((task) => {
      const taskDate = getTaskDate(task);

      // No valid createdAt → exclude when date filter is active
      if (!taskDate) {
        return false;
      }

      const taskYear = taskDate.getFullYear();

      const taskMonth = String(
        taskDate.getMonth() + 1
      ).padStart(2, "0");

      const taskDay = String(
        taskDate.getDate()
      ).padStart(2, "0");

      const taskDateOnly = `${taskYear}-${taskMonth}-${taskDay}`;

      // Start date
      if (startDate && taskDateOnly < startDate) {
        return false;
      }

      // End date
      if (endDate && taskDateOnly > endDate) {
        return false;
      }

      return true;
    });
  }

  return result;
}, [
  allTasks,
  activeTab,
  searchQuery,
  appliedFilters.status,
  appliedFilters.startDate,
  appliedFilters.endDate,
]);

  // ============================================================
  // RESET TO PAGE 1 WHEN FILTERING CHANGES
  // ============================================================
  useEffect(() => {
  setCurrentPage(1);
}, [
  activeTab,
  searchQuery,
  appliedFilters.status,
  appliedFilters.startDate,
  appliedFilters.endDate,
  rowsPerPage,
]);

  // ============================================================
  // PAGINATION
  // ============================================================
  const totalFiltered = filteredTasks.length;

  const totalPages = Math.max(
    1,
    Math.ceil(totalFiltered / rowsPerPage)
  );

  const visibleTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;

    return filteredTasks.slice(
      startIndex,
      startIndex + rowsPerPage
    );
  }, [filteredTasks, currentPage, rowsPerPage]);

  // ============================================================
  // STATS
  //
  // Stats intentionally use ALL tasks, not filtered tasks.
  // ============================================================
  const stats = useMemo(() => {
    return calculateStats(allTasks, allTasks.length);
  }, [allTasks]);

  // ============================================================
  // OPEN TASK DETAILS
  // ============================================================
  const openTaskDetails = (task) => {
    dispatch(setSelectedTaskDetails(task));
    dispatch(setOpenTaskUpdateCard(true));
  };

  // ============================================================
  // OPEN CHAT
  // ============================================================
  const openChat = (task) => {
    const chatID =
      task?.clientDetails?.chatID ||
      task?.clientDetails?.clientID ||
      task?.chatID ||
      "";

    if (!chatID) return;

    dispatch(setSearchContact(chatID));

    navigate("/dashboard/chats");
  };

  // ============================================================
  // APPLY DATE FILTER
  // ============================================================
  const handleApplyFilters = (newFilters) => {
  setAppliedFilters({
    status: newFilters?.status || "",
    startDate: newFilters?.startDate || "",
    endDate: newFilters?.endDate || "",
  });

  setCurrentPage(1);

  // Keep filter panel open
  // setShowFilters(false);
};

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <section className="flex h-full min-h-0 w-full flex-col bg-slate-100 text-slate-900">
      {/* Task Update Card */}
      {openTaskUpdateCard && <TaskUpdateCard />}

      <div className="mx-auto flex h-full w-full max-w-[1800px] flex-col gap-5 overflow-hidden p-4 sm:p-5">
        {/* ======================================================
            TOP HEADER
        ====================================================== */}
        <div className="flex flex-none flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          {/* Header */}
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 shadow-md shadow-indigo-200">
              <ClipboardList
                size={24}
                className="text-white"
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Task Management
              </h1>

              <p className="mt-0.5 text-sm font-medium text-slate-500">
                Monitor operations, assignments, and client status.
              </p>
            </div>
          </div>

          {/* ==================================================
              SEARCH + ACTIONS
          ================================================== */}
          <div className="flex  items-center gap-1">
            {/* Search */}
            <TaskSearch
              onSearch={(query) => setSearchQuery(query)}
            />

            {/* Refresh */}
            <button
              type="button"
              onClick={loadAllTasks}
              title="Refresh Data"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm transition-all hover:bg-slate-50 hover:text-indigo-600 active:scale-95"
            >
              <RefreshCcw
                size={18}
                className={
                  loading
                    ? "animate-spin text-indigo-500"
                    : "text-slate-500"
                }
              />
            </button>

            {/* Filters */}
            <button
              type="button"
              onClick={() =>
                setShowFilters((prev) => !prev)
              }
              className={`flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-semibold shadow-sm transition-all active:scale-95 ${
                showFilters
                  ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Filter
                size={16}
                className={
                  showFilters
                    ? "text-indigo-600"
                    : "text-slate-500"
                }
              />

              <span>Filters</span>
            </button>

            {/* New Task
            <button
              type="button"
              className="flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 active:scale-95"
            >
              <Plus
                size={18}
                strokeWidth={2.5}
              />

              New Task
            </button> */}
          </div>
        </div>

        {/* ======================================================
            STATS
        ====================================================== */}
        <div className="flex-none">
          <TaskStats stats={stats} />
        </div>

        {/* ======================================================
            MAIN WORKSPACE
        ====================================================== */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* ==================================================
              TABS
          ================================================== */}
          <div className="flex-none border-b border-slate-200 bg-slate-50/50 px-2 pt-2">
            <TaskTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              stats={stats}
            />
          </div>

          {/* ==================================================
              DATE FILTERS
          ================================================== */}
          {showFilters && (
            <div className="flex-none border-b border-slate-200 bg-white p-4">
              <TaskFilters
                appliedFilters={appliedFilters}
                onApplyFilters={handleApplyFilters}
              />
            </div>
          )}

          {/* ==================================================
              TABLE
          ================================================== */}
          <div className="min-h-0 flex-1 overflow-auto bg-white">
            <TaskTable
              tasks={visibleTasks}
              loading={loading}
              openTaskDetails={openTaskDetails}
              openChat={openChat}
            />
          </div>

          {/* ==================================================
              PAGINATION FOOTER
          ================================================== */}
          <div className="flex-none border-t border-slate-200 bg-slate-50 px-5 py-3.5">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              {/* Records */}
              <div className="text-xs font-semibold text-slate-500">
                Showing{" "}
                <span className="font-bold text-slate-900">
                  {visibleTasks.length}
                </span>{" "}
                of{" "}
                <span className="font-bold text-slate-900">
                  {totalFiltered}
                </span>{" "}
                Records
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center gap-5">
                {/* Rows */}
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="rowsPerPage"
                    className="text-xs font-semibold text-slate-500"
                  >
                    Rows:
                  </label>

                  <div className="relative">
                    <select
                      id="rowsPerPage"
                      value={rowsPerPage}
                      onChange={(e) =>
                        setRowsPerPage(
                          Number(e.target.value)
                        )
                      }
                      className="h-8 cursor-pointer appearance-none rounded-md border border-slate-300 bg-white pl-3 pr-7 text-xs font-bold text-slate-700 outline-none transition-colors hover:border-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    >
                      {rowsPerPageOptions.map((item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      ))}
                    </select>

                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                      <svg
                        className="h-3 w-3 fill-current"
                        viewBox="0 0 20 20"
                      >
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-5 w-px bg-slate-300" />

                {/* Page */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-500">
                    Page{" "}
                    <span className="font-bold text-slate-900">
                      {currentPage}
                    </span>{" "}
                    of{" "}
                    <span className="font-bold text-slate-900">
                      {totalPages}
                    </span>
                  </span>

                  {/* Previous / Next */}
                  <div className="flex items-center gap-1">
                    {/* Previous */}
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.max(prev - 1, 1)
                        )
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {/* Next */}
                    <button
                      type="button"
                      disabled={
                        currentPage >= totalPages
                      }
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(
                            prev + 1,
                            totalPages
                          )
                        )
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TasksPage;
