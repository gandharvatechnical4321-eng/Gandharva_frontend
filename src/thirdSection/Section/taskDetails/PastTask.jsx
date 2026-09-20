// All Tasks

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { IoFilterSharp } from "react-icons/io5";
import { MdFilterListOff } from "react-icons/md";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ListTodo,
  LoaderCircle,
} from "lucide-react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import Cookies from "js-cookie";

import Next24hrCard from "../../card/Next24hrCard";
import {
  setPastTask,
  setCommanSearch,
} from "../../../features/taskSlice";

const statusOptions = [
  "",
  "hold",
  "New Task",
  "Advance Received",
  "Tutor Notified",
  "Tutor Assigned",
  "Solution Received",
  "Task Completed",
  "Being Modified",
  "Cancel",
  "Refund",
];

const getResponsiveLimit = () => {
  if (typeof window === "undefined") {
    return 4;
  }

  const width = window.innerWidth;
  const height = window.innerHeight;

  if (width < 640) return 3;
  if (height < 720) return 3;
  if (height < 850) return 4;

  return 5;
};

const PastTask = () => {
  const dispatch = useDispatch();

  const pastTasks =
    useSelector((state) => state.tasks.PastTask) || [];

  const selectedTask = useSelector(
    (state) => state.tasks.selectedTask
  );

  const reloadInterval = useSelector(
    (state) => state.tasks.reloadInterval
  );

  const commanSearch =
    useSelector((state) => state.tasks.commanSearch) || "";

  const [filterStatusP, setFilterStatusP] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  const [searchValue, setSearchValue] = useState(commanSearch);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(getResponsiveLimit);

  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const searchDebounceRef = useRef(null);
  const requestControllerRef = useRef(null);
  const filterBoxRef = useRef(null);

  /*
   * Keep the local search box synchronized if commanSearch
   * is changed from another component.
   */
  useEffect(() => {
    setSearchValue(commanSearch);
  }, [commanSearch]);

  /*
   * Responsive number of cards.
   *
   * The timeout avoids running state updates too frequently
   * while the browser window is being resized.
   */
  useEffect(() => {
    let resizeTimer;

    const handleResize = () => {
      window.clearTimeout(resizeTimer);

      resizeTimer = window.setTimeout(() => {
        const newLimit = getResponsiveLimit();

        setLimit((previousLimit) => {
          if (previousLimit === newLimit) {
            return previousLimit;
          }

          return newLimit;
        });

        setCurrentPage(1);
      }, 200);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  /*
   * Close the filter dropdown after clicking outside it.
   */
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        filterBoxRef.current &&
        !filterBoxRef.current.contains(event.target)
      ) {
        setShowFilter(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  /*
   * Cancel search debounce and pending API request
   * when this component unmounts.
   */
  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        window.clearTimeout(searchDebounceRef.current);
      }

      if (requestControllerRef.current) {
        requestControllerRef.current.abort();
      }
    };
  }, []);

  const fetchPastTasks = useCallback(
    async (page = 1, search = "") => {
      /*
       * Cancel the previous request when a new search,
       * filter, page, resize, or reload request begins.
       */
      if (requestControllerRef.current) {
        requestControllerRef.current.abort();
      }

      const controller = new AbortController();
      requestControllerRef.current = controller;

      try {
        setIsLoading(true);
        setFetchError("");

        /*
         * Clear old Redux cards so that previously loaded
         * 15 cards cannot flash before the limited response arrives.
         */
        dispatch(setPastTask([]));

        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/task/client-deadline/alltask`,
          {
            params: {
              page,
              limit,
              searchQuery: search.trim(),
            },
            headers: {
              Authorization: `Bearer ${Cookies.get("token")}`,
            },
            signal: controller.signal,
          }
        );

        const responseData = response?.data;
        const tasks = Array.isArray(responseData?.data)
          ? responseData.data
          : [];

        const receivedTotalPages = Number(
          responseData?.totalPages || 1
        );

        dispatch(setPastTask(tasks));
        setTotalPages(
          receivedTotalPages > 0 ? receivedTotalPages : 1
        );

        /*
         * If deletion or filtering makes the current page invalid,
         * move to the last valid page.
         */
        if (
          receivedTotalPages > 0 &&
          page > receivedTotalPages
        ) {
          setCurrentPage(receivedTotalPages);
        }
      } catch (error) {
        const requestWasCancelled =
          error?.code === "ERR_CANCELED" ||
          error?.name === "CanceledError" ||
          axios.isCancel(error);

        if (requestWasCancelled) {
          return;
        }

        console.error(
          "Error fetching all tasks:",
          error?.response?.data || error?.message || error
        );

        dispatch(setPastTask([]));
        setTotalPages(1);

        setFetchError(
          error?.response?.data?.message ||
            "Unable to load tasks. Please try again."
        );
      } finally {
        /*
         * Only the latest active request should stop loading.
         */
        if (
          requestControllerRef.current === controller &&
          !controller.signal.aborted
        ) {
          setIsLoading(false);
        }
      }
    },
    [dispatch, limit]
  );

  /*
   * One API-fetching effect.
   *
   * This replaces the previous two effects that were causing
   * duplicate API requests.
   */
  useEffect(() => {
    if (selectedTask !== "All Task") {
      return;
    }

    fetchPastTasks(currentPage, commanSearch);
  }, [
    selectedTask,
    reloadInterval,
    currentPage,
    limit,
    commanSearch,
    fetchPastTasks,
  ]);

  /*
   * Debounced search.
   *
   * Local input changes immediately, but Redux/API search
   * updates only after the user stops typing for 400ms.
   */
  const handleSearchChange = (value) => {
    setSearchValue(value);
    setFilterStatusP("");

    if (searchDebounceRef.current) {
      window.clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = window.setTimeout(() => {
      setCurrentPage(1);
      dispatch(setCommanSearch(value));
    }, 400);
  };

  const handleFilterSelect = (status) => {
    if (searchDebounceRef.current) {
      window.clearTimeout(searchDebounceRef.current);
    }

    setFilterStatusP(status);
    setSearchValue(status);
    setShowFilter(false);
    setCurrentPage(1);

    dispatch(setCommanSearch(status));
  };

  const clearFilter = () => {
    if (searchDebounceRef.current) {
      window.clearTimeout(searchDebounceRef.current);
    }

    setFilterStatusP("");
    setSearchValue("");
    setShowFilter(false);
    setCurrentPage(1);

    dispatch(setCommanSearch(""));
  };

  const handlePreviousPage = () => {
    if (isLoading) {
      return;
    }

    setCurrentPage((previousPage) =>
      Math.max(previousPage - 1, 1)
    );
  };

  const handleNextPage = () => {
    if (isLoading) {
      return;
    }

    setCurrentPage((previousPage) =>
      Math.min(previousPage + 1, totalPages || 1)
    );
  };

  const retryFetch = () => {
    fetchPastTasks(currentPage, commanSearch);
  };

  return (
    <section className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-white">
      {/* Search and Filter */}
      <div className="shrink-0 border-b border-slate-100 bg-white px-3 py-3">
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search task, client, tutor..."
              className="h-10 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50"
              value={searchValue}
              onChange={(event) =>
                handleSearchChange(event.target.value)
              }
            />
          </div>

          <div ref={filterBoxRef} className="relative">
            <button
              type="button"
              onClick={() =>
                setShowFilter((previousValue) => !previousValue)
              }
              className={`flex h-10 w-10 items-center justify-center rounded-2xl border text-slate-600 transition ${
                filterStatusP
                  ? "border-indigo-200 bg-indigo-50 text-indigo-600"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              }`}
              title={
                filterStatusP
                  ? "Filter active"
                  : "Filter all tasks"
              }
              aria-label="Filter tasks by status"
              aria-expanded={showFilter}
            >
              {!filterStatusP ? (
                <IoFilterSharp size={18} />
              ) : (
                <MdFilterListOff size={18} />
              )}
            </button>

            {showFilter && (
              <div className="absolute right-0 top-12 z-40 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                <div className="border-b border-slate-100 px-3 py-2">
                  <p className="text-xs font-extrabold text-slate-900">
                    Filter by status
                  </p>
                </div>

                <div className="max-h-72 overflow-y-auto py-1">
                  {statusOptions.map((status) => {
                    const optionLabel =
                      status || "All Status";

                    return (
                      <button
                        key={optionLabel}
                        type="button"
                        className={`block w-full px-3 py-2 text-left text-xs font-bold transition hover:bg-indigo-50 hover:text-indigo-600 ${
                          filterStatusP === status
                            ? "bg-indigo-50 text-indigo-600"
                            : "text-slate-600"
                        }`}
                        onClick={() =>
                          handleFilterSelect(status)
                        }
                      >
                        {optionLabel}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {filterStatusP && (
          <div className="mt-2 flex items-center justify-between gap-3 rounded-xl bg-indigo-50 px-3 py-2">
            <p className="min-w-0 truncate text-xs font-bold text-indigo-700">
              Filter: {filterStatusP}
            </p>

            <button
              type="button"
              onClick={clearFilter}
              className="shrink-0 text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Task Cards */}
      <div className="min-h-0 flex-1 overflow-y-auto bg-gray-200 px-3 py-3">
        {isLoading ? (
          <div className="flex h-full items-center justify-center rounded-2xl border border-slate-100 bg-white">
            <div className="text-center">
              <LoaderCircle
                size={30}
                className="mx-auto animate-spin text-indigo-600"
              />

              <p className="mt-3 text-xs font-bold text-slate-500">
                Loading tasks...
              </p>
            </div>
          </div>
        ) : fetchError ? (
          <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-red-200 bg-white p-6 text-center">
            <div>
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-500 ring-1 ring-red-100">
                <ListTodo size={20} />
              </div>

              <p className="text-sm font-extrabold text-slate-700">
                Unable to load tasks
              </p>

              <p className="mt-1 max-w-xs text-xs font-medium text-slate-400">
                {fetchError}
              </p>

              <button
                type="button"
                onClick={retryFetch}
                className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-700"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : pastTasks.length > 0 ? (
          <div className="grid content-start gap-2">
            {pastTasks.map((task) => (
              <Next24hrCard
                key={task?._id || task?.taskID}
                task={task}
              />
            ))}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center">
            <div>
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-slate-500 ring-1 ring-slate-100">
                <ListTodo size={20} />
              </div>

              <p className="text-sm font-extrabold text-slate-700">
                No tasks found
              </p>

              <p className="mt-1 text-xs font-medium text-slate-400">
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
            className="flex h-9 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={handlePreviousPage}
            disabled={currentPage <= 1 || isLoading}
          >
            <ChevronLeft size={15} />
            Prev
          </button>

          <p className="whitespace-nowrap rounded-xl bg-slate-50 px-3 py-2 text-xs font-extrabold text-slate-600">
            Page{" "}
            <span className="text-slate-900">
              {currentPage}
            </span>{" "}
            of{" "}
            <span className="text-slate-900">
              {totalPages || 1}
            </span>
          </p>

          <button
            type="button"
            className="flex h-9 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-indigo-600 shadow-sm transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={handleNextPage}
            disabled={
              currentPage >= (totalPages || 1) || isLoading
            }
          >
            Next
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default PastTask;