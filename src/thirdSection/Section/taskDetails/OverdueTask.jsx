import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useDispatch, useSelector } from "react-redux";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  Search,
} from "lucide-react";

import Next24hrCard from "../../card/Next24hrCard";
import TaskUpdateCard from "../../card/TaskUpdateCard";
import { setPastTask } from "../../../features/taskSlice";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const isClosedStatus = (status) => {
  return ["Task Completed", "Cancel", "Refund"].includes(status);
};

const getDeadline = (task) => {
  return task?.tutorDeadline || null;
};

const isOverdueTask = (task) => {
  const deadline = getDeadline(task);

  if (!deadline) return false;

  const deadlineMissed = new Date(deadline) < new Date();
  const notCompleted = !isClosedStatus(task?.status);

  return deadlineMissed && notCompleted;
};

const getResponsiveLimit = () => {
  if (typeof window === "undefined") return 4;

  const width = window.innerWidth;
  const height = window.innerHeight;

  if (width < 640) return 2;
  if (height < 720) return 2;
  if (height < 850) return 2;

  return 4;
};

const OverdueTask = () => {
  const dispatch = useDispatch();

  const openTaskUpdateCard = useSelector(
    (state) => state.tasks.openTaskUpdateCard
  );

  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(getResponsiveLimit());
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${BACKEND_URL}/api/task/client-deadline/alltask`,
        {
          params: {
            page: 1,
            limit: 1000,
            searchQuery: "",
          },
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );

      const data = response?.data?.data || [];

      setTasks(data);
      dispatch(setPastTask(data));
    } catch (error) {
      console.error("Error fetching overdue tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    const updateLimit = () => {
      setLimit(getResponsiveLimit());
      setCurrentPage(1);
    };

    updateLimit();
    window.addEventListener("resize", updateLimit);

    return () => window.removeEventListener("resize", updateLimit);
  }, []);

  const overdueTasks = useMemo(() => {
    let list = tasks.filter(isOverdueTask);

    if (search.trim()) {
      const value = search.toLowerCase();

      list = list.filter((task) =>
        [
          task?.taskID,
          task?.subject,
          task?.subjectDes,
          task?.clientDetails?.name,
          task?.clientDetails?.chatID,
          task?.clientDetails?.clientID,
          task?.tutorDetails?.name,
          task?.tutorDetails?.tutorID,
          task?.status,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(value)
      );
    }

    return list;
  }, [tasks, search]);

  const totalPages = Math.max(1, Math.ceil(overdueTasks.length / limit));

  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * limit;
    return overdueTasks.slice(start, start + limit);
  }, [overdueTasks, currentPage, limit]);

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <section className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-white">
      {openTaskUpdateCard && <TaskUpdateCard />}

      {/* Header */}
      <div className="shrink-0 border-b border-slate-100 bg-white px-3 py-3">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100">
              <AlertTriangle size={18} />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-sm font-black text-slate-900 sm:text-base">
                Overdue Tasks
              </h2>

              <p className="truncate text-xs font-bold text-slate-500">
                Deadline missed and task not completed
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchTasks}
            className="flex h-9 shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 transition hover:bg-slate-50"
          >
            <RefreshCcw size={14} />
            Refresh
          </button>
        </div>

        <div className="relative">
          <Search
            size={15}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search overdue tasks..."
            className="h-10 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 pr-9 text-xs font-bold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-red-300 focus:bg-white focus:ring-4 focus:ring-red-50"
          />
        </div>
      </div>

      {/* Count Strip */}
      <div className="shrink-0 border-b border-slate-100 bg-red-50/60 px-3 py-2">
        <p className="text-xs font-black text-red-600">
          {overdueTasks.length} overdue task
          {overdueTasks.length === 1 ? "" : "s"} found
        </p>
      </div>

      {/* Cards */}
      <div className="min-h-0 flex-1 overflow-y-auto bg-gray-200 px-3 py-3">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm font-bold text-slate-500">
              Loading overdue tasks...
            </p>
          </div>
        ) : paginatedTasks.length > 0 ? (
          <div className="grid content-start gap-2">
            {paginatedTasks.map((task) => (
              <Next24hrCard key={task._id || task.taskID} task={task} />
            ))}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white p-6 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <AlertTriangle size={24} />
            </div>

            <p className="text-sm font-black text-slate-800">
              No overdue tasks
            </p>

            <p className="mt-1 max-w-[240px] text-xs font-semibold text-slate-400">
              All missed-deadline tasks are completed, cancelled, refunded, or
              there are no overdue records.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-slate-100 bg-white px-3 py-3">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="flex h-9 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={14} />
            Prev
          </button>

          <p className="text-xs font-bold text-slate-500">
            Page{" "}
            <span className="font-black text-slate-900">{currentPage}</span> of{" "}
            <span className="font-black text-slate-900">{totalPages}</span>
          </p>

          <button
            type="button"
            onClick={handleNext}
            disabled={currentPage >= totalPages}
            className="flex h-9 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-black text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default OverdueTask;