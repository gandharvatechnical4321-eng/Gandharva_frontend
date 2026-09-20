import React, { useEffect, useState } from "react";
import { IoFilterSharp } from "react-icons/io5";
import { MdFilterListOff } from "react-icons/md";
import { Search, ChevronLeft, ChevronRight, UserX } from "lucide-react";
import Next24hrCard from "../../card/Next24hrCard";
import axios from "axios";
import {
  setUnassignedTask,
  setCommanSearch,
} from "../../../features/taskSlice";
import { useDispatch, useSelector } from "react-redux";
import Cookies from "js-cookie";

const statusOptions = ["", "Advance Received", "Tutor Notified"];

const getResponsiveLimit = () => {
  if (typeof window === "undefined") return 4;

  const width = window.innerWidth;
  const height = window.innerHeight;

  if (width < 640) return 3;
  if (height < 720) return 3;
  if (height < 850) return 4;
  return 5;
};

const UnassignedTask = () => {
  const dispatch = useDispatch();

  const unassignedTasks =
    useSelector((state) => state.tasks.UnassignedTask) || [];

  const selectedTask = useSelector((state) => state.tasks.selectedTask);
  const reloadInterval = useSelector((state) => state.tasks.reloadInterval);
  const commanSearch = useSelector((state) => state.tasks.commanSearch);

  const [filterStatusAT, setFilterStatusAT] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(getResponsiveLimit);

  useEffect(() => {
    const handleResize = () => {
      setLimit(getResponsiveLimit());
      setCurrentPage(1);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchUnassignedTasks = async (page = 1, search = "") => {
    try {
      const resp = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/task/status/advance-or-notified`,
        {
          params: {
            page,
            limit,
            searchQuery: search,
          },
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );

      if (resp?.data) {
        dispatch(setUnassignedTask(resp.data.data || []));
        setTotalPages(resp.data.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching unassigned tasks:", error);
    }
  };

  useEffect(() => {
    if (selectedTask === "Unassigned Task") {
      fetchUnassignedTasks(currentPage, commanSearch);
    }
  }, [selectedTask, reloadInterval, currentPage, limit]);

  useEffect(() => {
    if (selectedTask === "Unassigned Task") {
      setCurrentPage(1);
      fetchUnassignedTasks(1, commanSearch);
    }
  }, [selectedTask, commanSearch]);

  const handleSearchChange = (value) => {
    dispatch(setCommanSearch(value));
    setCurrentPage(1);
  };

  const handleFilterSelect = (status) => {
    dispatch(setCommanSearch(status));
    setFilterStatusAT(status);
    setShowFilter(false);
    setCurrentPage(1);
  };

  const clearFilter = () => {
    dispatch(setCommanSearch(""));
    setFilterStatusAT("");
    setShowFilter(false);
    setCurrentPage(1);
  };

  return (
    <section className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-white">
      {/* Search + Filter */}
      <div className="shrink-0 border-b border-slate-100 bg-white px-3 py-3">
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search task, client, tutor..."
              className="h-10 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50"
              value={commanSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowFilter((prev) => !prev)}
              className={`flex h-10 w-10 items-center justify-center rounded-2xl border text-slate-600 transition ${
                filterStatusAT
                  ? "border-indigo-200 bg-indigo-50 text-indigo-600"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
              title={
                filterStatusAT ? "Filter active" : "Filter unassigned tasks"
              }
            >
              {!filterStatusAT ? (
                <IoFilterSharp size={18} />
              ) : (
                <MdFilterListOff size={18} />
              )}
            </button>

            {showFilter && (
              <div className="absolute right-0 top-12 z-40 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                <div className="border-b border-slate-100 px-3 py-2">
                  <p className="text-sm font-extrabold text-slate-900">
                    Filter by status
                  </p>
                </div>

                <div className="max-h-64 overflow-y-auto py-1">
                  {statusOptions.map((status) => (
                    <button
                      key={status || "All Status"}
                      type="button"
                      className={`block w-full px-3 py-2 text-left text-sm font-bold transition hover:bg-indigo-50 hover:text-indigo-600 ${
                        filterStatusAT === status
                          ? "bg-indigo-50 text-indigo-600"
                          : "text-slate-600"
                      }`}
                      onClick={() => handleFilterSelect(status)}
                    >
                      {status || "All Status"}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {filterStatusAT && (
          <div className="mt-2 flex items-center justify-between rounded-xl bg-indigo-50 px-3 py-2">
            <p className="truncate text-sm font-bold text-indigo-700">
              Filter: {filterStatusAT}
            </p>

            <button
              type="button"
              onClick={clearFilter}
              className="text-sm font-bold text-indigo-600 hover:text-indigo-800"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Task Cards */}
      <div className="min-h-0 flex-1 overflow-y-auto bg-gray-200 px-3 py-3">
        {unassignedTasks?.length > 0 ? (
          <div className="grid content-start gap-2">
            {unassignedTasks.map((task) => (
              <Next24hrCard key={task._id || task.taskID} task={task} />
            ))}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center">
            <div>
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-slate-500 ring-1 ring-slate-100">
                <UserX size={20} />
              </div>

              <p className="text-base font-extrabold text-slate-700">
                No unassigned tasks found
              </p>

              <p className="mt-1 text-sm font-medium text-slate-400">
                Try changing search or filter.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Pagination */}
      <div className="shrink-0 border-t border-slate-100 bg-white px-3 py-3">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            className="flex h-10 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
            Prev
          </button>

          <p className="whitespace-nowrap rounded-xl bg-slate-50 px-3 py-2 text-sm font-extrabold text-slate-600">
            Page <span className="text-slate-900">{currentPage}</span> of{" "}
            <span className="text-slate-900">{totalPages || 1}</span>
          </p>

          <button
            type="button"
            className="flex h-10 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-indigo-600 shadow-sm transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages || 1))
            }
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default UnassignedTask;