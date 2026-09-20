import React, { useEffect, useState } from "react";
import TutorCard from "../card/TutorCard";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setTutorList, setTotalNoOfTutorPage } from "../../features/taskSlice";
import Cookies from "js-cookie";
import { Search, ChevronLeft, ChevronRight, Loader2, Users } from "lucide-react";

const TutorList = () => {
  const dispatch = useDispatch();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(15);

  const notifyTutorPersonaly = useSelector((state) => state.tasks.notifyTutorPersonaly);
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

  // Main Fetch Logic
  useEffect(() => {
    const fetchTutorData = async () => {
      try {
        setLoading(true);
        setError(null);
        const skip = (currentPage - 1) * limit;
        
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/tutor/search?q=${debouncedSearch}&skip=${skip}&limit=${limit}`,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get("token")}`,
            },
          }
        );

        const { data, pagination } = response?.data || {};
        dispatch(setTutorList(data || []));
        
        const total = pagination?.total || 0;
        dispatch(setTotalNoOfTutorPage(Math.max(1, Math.ceil(total / limit))));
      } catch (err) {
        console.error("Error fetching tutor data:", err);
        setError("Failed to fetch tutor data.");
      } finally {
        setLoading(false);
      }
    };

    fetchTutorData();
  }, [debouncedSearch, currentPage, limit, dispatch]);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-slate-50">
      
      {/* Header & Search Bar */}
      <div className="shrink-0 border-b border-slate-200 bg-white p-2 sm:px-3">
        <div className="relative mx-auto w-full max-w-3xl">
          <Search
            size={12}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-1 focus:ring-indigo-400"
            placeholder="Search by subject, skills, or Tutor ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="min-h-0 flex-1 overflow-y-auto p-1 sm:p-2">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-1">
          
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm font-semibold text-red-600 border border-red-100 text-center">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex h-40 flex-col items-center justify-center gap-3 opacity-60">
              <Loader2 className="animate-spin text-indigo-600" size={24} />
              <p className="text-sm font-semibold text-slate-600">Loading tutors...</p>
            </div>
          ) : tutorData.length > 0 ? (
            tutorData.map((tutor) => (
              <TutorCard 
                key={tutor._id || tutor.tutorID} 
                searchValue={debouncedSearch} 
                tutorData={tutor} 
              />
            ))
          ) : (
            <div className="flex h-[220px] flex-col items-center justify-center rounded-md border border-dashed border-slate-200 bg-white p-5 text-center shadow-sm">
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-md bg-slate-50 text-slate-400 border border-slate-100">
                <Users size={18} />
              </div>
              <p className="text-sm font-bold text-slate-800">No tutors found</p>
              <p className="mt-1 max-w-xs text-xs font-medium text-slate-500">
                Try adjusting your search criteria or clear the search bar.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="shrink-0 border-t border-slate-200 bg-white p-2 sm:px-3">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2">
          <button
            className="flex h-6 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-[10px] font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-50"
            onClick={handlePrevPage}
            disabled={currentPage === 1 || loading}
          >
            <ChevronLeft size={12} />
            <span className="hidden sm:inline">Previous</span>
          </button>
          
          <p className="rounded-md border border-slate-100 bg-slate-50 px-2.2 py-1 text-[10px] font-semibold text-slate-500">
            Page <span className="font-bold text-slate-800">{currentPage}</span> of{" "}
            <span className="font-bold text-slate-800">{totalPages}</span>
          </p>
          
          <button
            className="flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-[10px] font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-50"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages || loading}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight size={12} />
          </button>
        </div>
      </div>

    </div>
  );
};

export default TutorList;