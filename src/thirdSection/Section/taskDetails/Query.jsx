import React, { useEffect, useRef, useState } from "react";
import { IoFilterSharp } from "react-icons/io5";
import { MdFilterListOff } from "react-icons/md";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  MessageSquareText,
  Search,
} from "lucide-react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import Cookies from "js-cookie";

import {
  setQuery,
  setCommanSearch,
} from "../../../features/taskSlice";
import QueryCard from "../../card/QueryCard";

const QUERY_STATUS_OPTIONS = [
  "",
  "pending",
  "done",
  "cancel",
  "advance issue",
  "low budget",
  "short deadline",
  "No Responce",
  "sample work issue",
  "no follow up",
];

const Query = () => {
  const dispatch = useDispatch();
  const filterRef = useRef(null);

const [reloadQueryCount, setReloadQueryCount] = useState(0);
// const [reloadquery, setReloadQuery] = useState(false);
const [filterStatusQ, setFilterStatusQ] = useState("");
const [showFilter, setShowFilter] = useState(false);

const [currentPage, setCurrentPage] = useState(1);
const [limit, setLimit] = useState(4);
const [loading, setLoading] = useState(false);
const [allQueryList, setAllQueryList] = useState([]);

const commanSearch = useSelector(
  (state) => state.tasks.commanSearch
);


const selectedTask = useSelector(
  (state) => state.tasks.selectedTask
);

const reloadInterval = useSelector(
  (state) => state.tasks.reloadInterval
);


const startIndex =
  (currentPage - 1) * limit;

const endIndex =
  startIndex + limit;

const visibleQueries =
  allQueryList.slice(
    startIndex,
    endIndex
  );

  /*
    Responsive card count:
    small or short screen: 3 cards
    normal desktop: 4 cards
  */
  useEffect(() => {
    const updateResponsiveLimit = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      const newLimit =
        width < 640 || height < 760 ? 3 : 5;

      setLimit((previousLimit) => {
        if (previousLimit !== newLimit) {
          setCurrentPage(1);
              }

        return newLimit;
      });
    };

    updateResponsiveLimit();

    window.addEventListener(
      "resize",
      updateResponsiveLimit
    );

    return () => {
      window.removeEventListener(
        "resize",
        updateResponsiveLimit
      );
    };
  }, []);

  /*
    Fetch all matching records once and paginate every
    view locally. This applies to the default list,
    search results, and every status filter.
  */
  useEffect(() => {
    const controller = new AbortController();

    const fetchQueries = async () => {
      const searchValue = commanSearch.trim();

      const canSearch =
        searchValue.length === 0 ||
        searchValue.length > 3;

      if (
        selectedTask !== "Query" ||
        !canSearch
      ) {
        setAllQueryList([]);
        dispatch(setQuery([]));
        return;
      }

      try {
        setLoading(true);

        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/query/search`,
          {
            params: {
              page: 1,
              limit: 500,
              searchQuery: searchValue,
            },
            headers: {
              Authorization: `Bearer ${Cookies.get(
                "token"
              )}`,
            },
            signal: controller.signal,
          }
        );

        const fetchedQueries = Array.isArray(
          response?.data?.queries
        )
          ? response.data.queries
          : [];

        setAllQueryList(fetchedQueries);
        setCurrentPage(1);

        dispatch(
          setQuery(
            fetchedQueries.slice(0, limit)
          )
        );
      } catch (error) {
        if (error?.code === "ERR_CANCELED") {
          return;
        }

        console.error(
          "Error fetching queries:",
          error?.response?.data || error
        );

        setAllQueryList([]);
        dispatch(setQuery([]));
      } finally {
        setLoading(false);
      }
    };

    fetchQueries();

    return () => {
      controller.abort();
    };
  }, [
    reloadInterval,
    reloadQueryCount,
    commanSearch,
    selectedTask,
    dispatch,
    limit,
  ]);

  /*
    Keep Redux synchronized with the currently visible
    frontend page.
  */
  useEffect(() => {
    dispatch(
      setQuery(
        allQueryList.slice(
          startIndex,
          endIndex
        )
      )
    );
  }, [
    allQueryList,
    startIndex,
    endIndex,
    dispatch,
  ]);

  const hasNextPage =
    endIndex < allQueryList.length;

  /*
    Close the filter dropdown when clicking outside.
  */
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target)
      ) {
        setShowFilter(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  const handleSearchChange = (value) => {
    dispatch(setCommanSearch(value));

    setFilterStatusQ("");
    setShowFilter(false);
    setCurrentPage(1);
  };

  const handleFilterSelect = (status) => {
    dispatch(setCommanSearch(status));

    setFilterStatusQ(status);
    setShowFilter(false);
    setCurrentPage(1);
  };

  const clearFilter = () => {
    dispatch(setCommanSearch(""));

    setFilterStatusQ("");
    setShowFilter(false);
    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    if (loading || currentPage <= 1) {
      return;
    }

    setCurrentPage((previousPage) =>
      Math.max(previousPage - 1, 1)
    );
  };

  const handleNextPage = () => {
    if (loading || !hasNextPage) {
      return;
    }

    setCurrentPage(
      (previousPage) => previousPage + 1
    );
  };

  const firstRecordNumber =
    visibleQueries.length > 0
      ? (currentPage - 1) * limit + 1
      : 0;

  const lastRecordNumber =
    visibleQueries.length > 0
      ? firstRecordNumber +
        visibleQueries.length -
        1
      : 0;

  return (
    <section className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-white">
      {/* Search and filter header */}
      <header className="shrink-0 border-b border-slate-100 bg-white px-3 py-3">
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative min-w-0 flex-1">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={commanSearch}
              onChange={(event) =>
                handleSearchChange(
                  event.target.value
                )
              }
              placeholder="Search chat ID or query status..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50"
            />
          </div>

          {/* Status filter */}
          <div
            ref={filterRef}
            className="relative shrink-0"
          >
            <button
              type="button"
              onClick={() =>
                setShowFilter(
                  (previous) => !previous
                )
              }
              className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                filterStatusQ
                  ? "border-indigo-200 bg-indigo-50 text-indigo-600"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
              title={
                filterStatusQ
                  ? "Status filter active"
                  : "Filter by query status"
              }
              aria-label="Filter queries"
            >
              {filterStatusQ ? (
                <MdFilterListOff size={18} />
              ) : (
                <IoFilterSharp size={18} />
              )}
            </button>

            {showFilter && (
              <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                <div className="border-b border-slate-100 px-3 py-2.5">
                  <p className="text-xs font-extrabold text-slate-900">
                    Query status
                  </p>

                  <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                    Filter queries by status
                  </p>
                </div>

                <div className="max-h-64 overflow-y-auto py-1">
                  {QUERY_STATUS_OPTIONS.map(
                    (statusOption) => {
                      const isActive =
                        filterStatusQ ===
                        statusOption;

                      return (
                        <button
                          key={
                            statusOption || "all"
                          }
                          type="button"
                          onClick={() =>
                            handleFilterSelect(
                              statusOption
                            )
                          }
                          className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs font-bold capitalize transition ${
                            isActive
                              ? "bg-indigo-50 text-indigo-700"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          <span>
                            {statusOption ||
                              "All Queries"}
                          </span>

                          {isActive && (
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                          )}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search validation */}
        {commanSearch.length > 0 &&
          commanSearch.length <= 3 && (
            <p className="mt-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-700">
              Type at least 4 characters, or
              clear search to show all queries.
            </p>
          )}

        {/* Active status filter */}
        {filterStatusQ && (
          <div className="mt-2 flex items-center justify-between gap-3 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2">
            <p className="min-w-0 truncate text-[11px] font-bold capitalize text-indigo-700">
              Status: {filterStatusQ}
            </p>

            <button
              type="button"
              onClick={clearFilter}
              className="shrink-0 text-[11px] font-extrabold text-indigo-600 transition hover:text-indigo-800"
            >
              Clear
            </button>
          </div>
        )}
      </header>

      {/* Cards and pagination */}
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-gray-200 p-3">
        <div className="min-h-0 flex-1 overflow-hidden">
          {loading ? (
            <div className="flex h-full items-center justify-center rounded-xl border border-slate-200 bg-white">
              <div className="flex flex-col items-center">
                <Loader2
                  size={24}
                  className="animate-spin text-indigo-500"
                />

                <p className="mt-2 text-xs font-bold text-slate-500">
                  Loading queries...
                </p>
              </div>
            </div>
          ) : visibleQueries.length > 0 ? (
            /*
              Do not use grid-rows-3 or grid-rows-4 here.
              Those classes force every row to share the
              available height and can compress cards.
            */
            <div className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto pr-1">
              {visibleQueries.map((task) => (
                <div
                  key={
                    task?._id ||
                    task?.taskID ||
                    task?.chatId ||
                    task?.id
                  }
                  className="shrink-0"
                >
                  <QueryCard
                    task={task}
                    // reloadquery={setReloadQuery}
                    reloadquery={() =>
                      setReloadQueryCount((count) => count + 1)
                    }
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center">
              <div>
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-500 ring-1 ring-slate-100">
                  <MessageSquareText size={20} />
                </div>

                <p className="text-sm font-extrabold text-slate-700">
                  No query found
                </p>

                <p className="mt-1 text-xs font-medium text-slate-400">
                  Try changing the search or
                  status filter.
                </p>

                {(commanSearch ||
                  filterStatusQ) && (
                  <button
                    type="button"
                    onClick={clearFilter}
                    className="mt-3 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-600 transition hover:bg-indigo-100"
                  >
                    Clear search and filter
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Shared pagination */}
        <footer className="mt-3 shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handlePreviousPage}
              disabled={
                currentPage <= 1 || loading
              }
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={15} />
              <span className="hidden sm:inline">
                Previous
              </span>
            </button>

            <div className="min-w-0 text-center">
              <p className="text-[11px] font-extrabold text-slate-700">
                Page {currentPage}
              </p>

              <p className="text-[10px] font-medium text-slate-400">
                {visibleQueries.length > 0
                  ? `${firstRecordNumber}–${lastRecordNumber} · ${visibleQueries.length} cards`
                  : "No records"}
              </p>
            </div>

            <button
              type="button"
              onClick={handleNextPage}
              disabled={
                !hasNextPage || loading
              }
              className="inline-flex h-9 items-center gap-1 rounded-lg border border-indigo-100 bg-indigo-50 px-3 text-xs font-bold text-indigo-600 transition hover:border-indigo-200 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="hidden sm:inline">
                Next
              </span>
              <ChevronRight size={15} />
            </button>
          </div>
        </footer>
      </main>
    </section>
  );
};

export default Query;