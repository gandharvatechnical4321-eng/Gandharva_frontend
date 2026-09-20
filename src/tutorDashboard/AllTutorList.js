import React, { useEffect, useState } from "react";
import CardForAllDetails from "./cardForAllDetails";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setShowAllTutorData } from "../features/contactsSlice";
import { setTutorList, setTotalNoOfTutorPage } from "../features/taskSlice";
import Cookies from "js-cookie";

const AllTaskList = () => {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [limit] = useState(50);

  const tutorData = useSelector((state) => state.tasks.TutorList) || [];
  const totalPages = useSelector((state) => state.tasks.totalNoOfTutorPage);

  const [reload, setReload] = useState(1);
  const [registerFromSheet, setRegisterFromSheet] = useState(false);
  const [updateSkills, setUpdateSkills] = useState(false);

  // to add tutor from a particular range in google sheet
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [message, setMessage] = useState("");

  // For updating skills
  const [skillStart, setSkillStart] = useState("");
  const [skillEnd, setSkillEnd] = useState("");
  const [skillMessage, setSkillMessage] = useState("");

  const refreshTutorID = async (e) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to refresh tutorID..."
    );

    if (!isConfirmed) {
      return;
    }

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/tutor/update-contact-tutors`,
        {},
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );

      setMessage(response.data.message);
    } catch (error) {
      setMessage("Error registering tutors");
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!start || !end) {
      setMessage("Value is empty...");
      return;
    }

    if (isNaN(start) || isNaN(end)) {
      setMessage("Start and End must be valid numbers");
      return;
    }

    if (start > end) {
      alert("Start is greater then end...");
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/tutor/register-tutors`,
        {
          start: Number(start),
          end: Number(end),
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );

      setMessage(response.data.message);
    } catch (error) {
      setMessage("Error registering tutors");
      console.error(error);
    }
  };

  const handleSkillUpdate = async (e) => {
    e.preventDefault();

    if (!skillStart || !skillEnd) {
      setSkillMessage("Value is empty...");
      return;
    }

    if (isNaN(skillStart) || isNaN(skillEnd)) {
      setSkillMessage("Start and End must be valid numbers");
      return;
    }

    if (skillStart > skillEnd) {
      alert("Start is greater than end...");
      return;
    }

    const isConfirmed = window.confirm(
      "Are you sure you want to update skills for tutors in this range?"
    );

    if (!isConfirmed) {
      return;
    }

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/tutor/update-skills-from-sheet`,
        {
          start: Number(skillStart),
          end: Number(skillEnd),
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );

      setSkillMessage(response.data.message);
      setReload((prev) => prev + 1);
    } catch (error) {
      setSkillMessage("Error updating tutor skills");
      console.error(error);
    }
  };

  const fetchTutorData = async (query, page) => {
    try {
      setLoading(true);

      const skip = (page - 1) * limit;

      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/tutor/search?q=${query}&skip=${skip}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );

      const { data, pagination } = response?.data || {};

      dispatch(setTutorList(data || []));
      dispatch(setTotalNoOfTutorPage(Math.ceil(pagination.total / limit)));

      setLoading(false);
    } catch (err) {
      console.error("Error fetching tutor data:", err);
      setError("Failed to fetch tutor data.");
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      await setCurrentPage(1);

      if (
        searchTerm !== "" ||
        searchTerm === "" ||
        currentPage !== 1 ||
        tutorData.length === 0
      ) {
        fetchTutorData(searchTerm, currentPage);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, reload]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (
        searchTerm !== "" ||
        searchTerm === "" ||
        currentPage !== 1 ||
        tutorData.length === 0
      ) {
        fetchTutorData(searchTerm, currentPage);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [currentPage, reload]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-slate-50">
      {/* Top Header */}
      <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-xl font-black text-indigo-600 ring-1 ring-indigo-100">
                T
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                  Tutor Dashboard
                </h1>

                <p className="mt-0.5 truncate text-xs font-bold text-slate-500 sm:text-sm">
                  Manage tutor details, register tutors, update skills, and
                  search records from one place.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setRegisterFromSheet(true)}
              className="rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700 active:scale-95"
            >
              Register
            </button>

            <button
              type="button"
              onClick={() => setUpdateSkills(true)}
              className="rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-emerald-100 transition hover:bg-emerald-700 active:scale-95"
            >
              Update Skills
            </button>

            <button
              type="button"
              onClick={() => dispatch(setShowAllTutorData())}
              className="rounded-2xl bg-red-500 px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-red-100 transition hover:bg-red-600 active:scale-95"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4">
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">
              🔍
            </span>

            <input
              type="text"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-bold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50"
              placeholder="Search by subject, TutorID, or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-bold text-slate-500">
              Showing{" "}
              <span className="font-black text-slate-900">
                {tutorData.length}
              </span>{" "}
              tutors on this page
            </p>

            <p className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-black text-slate-600">
              Page {currentPage} of {totalPages || 1}
            </p>
          </div>
        </div>
      </div>

      {/* Register Tutors Modal */}
      {registerFromSheet && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="border-b border-slate-100 bg-gradient-to-br from-white to-indigo-50 px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-slate-950">
                    Register Tutors
                  </h3>

                  <p className="mt-1 text-xs font-bold text-slate-500">
                    Register tutors from Google Sheet row range.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setRegisterFromSheet(false)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-lg font-black text-red-500 transition hover:bg-red-100"
                >
                  ×
                </button>
              </div>

              <button
                type="button"
                className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 ring-1 ring-emerald-100 transition hover:bg-emerald-100"
                onClick={refreshTutorID}
              >
                Refresh TutorID
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
              <div>
                <label
                  htmlFor="start"
                  className="mb-1.5 block text-sm font-black text-slate-700"
                >
                  Start row number:
                </label>

                <input
                  type="number"
                  id="start"
                  value={start}
                  onChange={(e) => {
                    setStart(e.target.value);
                    setMessage("");
                  }}
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                />
              </div>

              <div>
                <label
                  htmlFor="end"
                  className="mb-1.5 block text-sm font-black text-slate-700"
                >
                  End row number:
                </label>

                <input
                  type="number"
                  id="end"
                  value={end}
                  onChange={(e) => {
                    setEnd(e.target.value);
                    setMessage("");
                  }}
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                />
              </div>

              <p className="rounded-2xl bg-red-50 px-3 py-2 text-xs font-bold text-red-500">
                <b>Submit</b> once only and wait for few sec...
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRegisterFromSheet(false)}
                  className="h-11 rounded-2xl border border-slate-200 bg-white text-sm font-black text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="h-11 rounded-2xl bg-indigo-600 text-sm font-black text-white transition hover:bg-indigo-700"
                >
                  Submit
                </button>
              </div>
            </form>

            {message && (
              <div className="border-t border-slate-100 px-5 py-4">
                <p
                  className={`rounded-2xl px-3 py-2 text-center text-sm font-black ${
                    message === "Tutors registered successfully"
                      ? "bg-indigo-50 text-indigo-600"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {message}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Update Skills Modal */}
      {updateSkills && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="border-b border-slate-100 bg-gradient-to-br from-white to-emerald-50 px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-slate-950">
                    Update Tutor Skills
                  </h3>

                  <p className="mt-1 text-xs font-bold text-slate-500">
                    Update tutor skills from Google Sheet row range.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setUpdateSkills(false)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-lg font-black text-red-500 transition hover:bg-red-100"
                >
                  ×
                </button>
              </div>
            </div>

            <form onSubmit={handleSkillUpdate} className="space-y-4 px-5 py-5">
              <div>
                <label
                  htmlFor="skillStart"
                  className="mb-1.5 block text-sm font-black text-slate-700"
                >
                  Start row number:
                </label>

                <input
                  type="number"
                  id="skillStart"
                  value={skillStart}
                  onChange={(e) => {
                    setSkillStart(e.target.value);
                    setSkillMessage("");
                  }}
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-50"
                />
              </div>

              <div>
                <label
                  htmlFor="skillEnd"
                  className="mb-1.5 block text-sm font-black text-slate-700"
                >
                  End row number:
                </label>

                <input
                  type="number"
                  id="skillEnd"
                  value={skillEnd}
                  onChange={(e) => {
                    setSkillEnd(e.target.value);
                    setSkillMessage("");
                  }}
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-emerald-300 focus:bg-white focus:ring-4 focus:ring-emerald-50"
                />
              </div>

              <p className="rounded-2xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-600">
                <b>Submit</b> once only and wait for few sec...
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUpdateSkills(false)}
                  className="h-11 rounded-2xl border border-slate-200 bg-white text-sm font-black text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="h-11 rounded-2xl bg-emerald-600 text-sm font-black text-white transition hover:bg-emerald-700"
                >
                  Update Skills
                </button>
              </div>
            </form>

            {skillMessage && (
              <div className="border-t border-slate-100 px-5 py-4">
                <p
                  className={`rounded-2xl px-3 py-2 text-center text-sm font-black ${
                    skillMessage.includes("successfully")
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {skillMessage}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mx-4 mt-4 shrink-0 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 sm:mx-6">
          {error}
        </div>
      )}

      {/* Main List */}
      <div className="min-h-0 flex-1 overflow-hidden px-4 py-4 sm:px-6">
        {loading ? (
          <div className="flex h-full items-center justify-center rounded-3xl border border-slate-200 bg-white">
            <div className="text-center">
              <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
              <p className="text-sm font-black text-slate-500">
                Loading tutors...
              </p>
            </div>
          </div>
        ) : tutorData.length > 0 ? (
          <div className="h-full overflow-y-auto pr-1">
            <div className="space-y-3 pb-2">
              {tutorData.map((tutor) => (
                <CardForAllDetails
                  setReload={setReload}
                  searchValue={searchTerm}
                  key={tutor.id || tutor._id || tutor.tutorID}
                  tutorData={tutor}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white p-8 text-center">
            <div>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-3xl">
                👨‍🏫
              </div>

              <p className="text-base font-black text-slate-800">
                No tutors found.
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-400">
                Try searching another tutor, subject, or TutorID.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            className="h-11 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            Previous
          </button>

          <p className="rounded-2xl bg-slate-50 px-4 py-2 text-center text-sm font-black text-slate-600 ring-1 ring-slate-100">
            Page <span className="text-slate-950">{currentPage}</span> of{" "}
            <span className="text-slate-950">{totalPages || 1}</span>
          </p>

          <button
            type="button"
            className="h-11 rounded-2xl bg-indigo-600 px-5 text-sm font-black text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllTaskList;