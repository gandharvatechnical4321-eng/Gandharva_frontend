import React, { useEffect, useState } from "react";
import TutorCard from "../thirdSection/card/TutorCard";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setTutorList, setTotalNoOfTutorPage } from "../features/taskSlice";
import Cookies from "js-cookie";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Users,
  RefreshCw,
  X,
} from "lucide-react";

const TutorList = () => {
  const dispatch = useDispatch();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(15);
  const [requestKey, setRequestKey] = useState(0);

  const tutorData = useSelector((state) => state.tasks.TutorList) || [];
  const totalPages = useSelector((state) => state.tasks.totalNoOfTutorPage) || 1;

  // Handle Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to page 1 when a new search is performed
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchTutorData = async () => {
      const token = Cookies.get("token");

      if (!token) {
        setError("Your login session has expired. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams({
          q: debouncedSearch.trim(),
          skip: String((currentPage - 1) * limit),
          limit: String(limit),
        });

        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/tutor/search?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        const { data, pagination } = response?.data || {};
        const tutorRecords = Array.isArray(data) ? data : [];
        const total = Number(pagination?.total) || 0;

        dispatch(setTutorList(tutorRecords));
        dispatch(setTotalNoOfTutorPage(Math.max(1, Math.ceil(total / limit))));
      } catch (err) {
        if (err.code === "ERR_CANCELED" || controller.signal.aborted) return;

        console.error("Error fetching tutor data:", err);
        setError(
          err.response?.data?.message ||
            "Failed to fetch tutor records. Please check your connection."
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchTutorData();

    return () => controller.abort();
  }, [debouncedSearch, currentPage, limit, requestKey, dispatch]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const handleNextPage = () => {
    if (!loading && currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (!loading && currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setCurrentPage(1);
  };

  const refreshTutors = () => setRequestKey((previous) => previous + 1);

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-slate-50/50">
      
      {/* Management Header & Search Bar */}
      <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Users size={18} />
              </div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">Tutor Management</h1>
            </div>
            <p className="mt-0.5 text-xs font-medium text-slate-500">
              Search, update, and manage your tutor network
            </p>
          </div>

          <div className="flex w-full shrink-0 items-center gap-2 sm:w-96">
            <div className="relative min-w-0 flex-1">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
              <input
              type="text"
              className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-1 focus:ring-indigo-400"
              placeholder="Search by name, skills, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                  aria-label="Clear tutor search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={refreshTutors}
              disabled={loading}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Refresh tutors"
              title="Refresh tutors"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Scrollable Content Area */}
      <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-5">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3">
          
          {error && (
            <div className="rounded-md border border-red-100 bg-red-50 p-3 text-center text-xs font-bold text-red-600 shadow-sm">
              {error}
            </div>
          )}

          {loading && tutorData.length === 0 ? (
            <div className="flex h-[40vh] flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-indigo-600" size={24} />
              <p className="text-xs font-semibold text-slate-500">Loading tutors...</p>
            </div>
          ) : tutorData.length > 0 ? (
            <div className="relative flex flex-col gap-3 pb-4">
              {loading && (
                <div className="sticky top-0 z-10 flex items-center justify-center gap-2 rounded-xl bg-indigo-50/95 px-3 py-2 text-xs font-bold text-indigo-700 backdrop-blur-sm">
                  <Loader2 size={14} className="animate-spin" /> Updating tutors...
                </div>
              )}
              {tutorData.map((tutor) => (
                <TutorCard 
                  key={tutor._id || tutor.tutorID} 
                  searchValue={debouncedSearch}
                  tutorData={tutor} 
                />
              ))}
            </div>
          ) : (
            <div className="flex h-[40vh] flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white p-6 text-center shadow-sm">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-md border border-slate-100 bg-slate-50 text-slate-400">
                <Users size={20} />
              </div>
              <p className="text-sm font-bold text-slate-800">No tutors found</p>
              <p className="mt-1 max-w-xs text-xs font-medium text-slate-500">
                {debouncedSearch 
                  ? `No results matching "${debouncedSearch}". Try a different search term.` 
                  : "Your tutor directory is currently empty."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Locked Pagination Footer */}
      <div className="shrink-0 border-t border-slate-200 bg-white p-3 sm:px-6">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-2">
          
          <button
            className="flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-40"
            onClick={handlePrevPage}
            disabled={currentPage === 1 || loading}
          >
            <ChevronLeft size={14} />
            <span className="hidden sm:inline">Previous</span>
          </button>
          
          <p className="rounded-md border border-slate-100 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-500">
            Page <span className="font-bold text-slate-800">{currentPage}</span> of{" "}
            <span className="font-bold text-slate-800">{totalPages}</span>
          </p>
          
          <button
            className="flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-40"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages || loading}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight size={14} />
          </button>
          
        </div>
      </div>

    </div>
  );
};

export default TutorList;