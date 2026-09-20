import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  ExternalLink,
  FileText,
  GraduationCap,
  Landmark,
  Link2,
  Loader2,
  Search,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

import {
  resetTaskState,
  setSelectedTask,
  updateQuery,
} from "../features/taskSlice";

export default function AddNewTaskForm({ setAddNewTask, clientData }) {
  const dispatch = useDispatch();

  const deviceDetails = useSelector((state) => state.contacts.deviceDetails);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingTask, setIsGeneratingTask] = useState(true);

  const [formData, setFormData] = useState({
    taskID: "Loading...",
    clientDetails: {
      chatID: clientData.chatId,
      name: clientData.name,
      currencyType: "USD",
      totalAmount: "",
      receivedAmount: "",
      sessionStartTime: new Date(),
      duration: "",
      type: "assignment",
      fullCourse: false,
      instituteName: "",
    },
    subject: "",
    subjectDes: "",
    agentDetails: {
      name: deviceDetails.userName,
      comment: "",
    },
    driveLink: "Loading...",
    clientDeadline: null,
  });

  const [universityNames, setUniversityNames] = useState([]);
  const [showUniversityBox, setShowUniversityBox] = useState(false);

  const currencies = [
    "USD",
    "EUR",
    "GBP",
    "INR",
    "JPY",
    "AUD",
    "CAD",
    "CHF",
    "CNY",
    "SEK",
    "NZD",
    "SGD",
    "HKD",
    "NOK",
    "KRW",
    "TRY",
    "RUB",
    "ZAR",
    "BRL",
    "MXN",
  ];

  useEffect(() => {
    if (!showUniversityBox) return;

    if (!formData.clientDetails.instituteName) {
      return;
    }

    const timer = setTimeout(() => {
      fetch(
        `https://script.google.com/macros/s/AKfycbwWvYRpySpRvWhnQ5ToPkm0ZFjuRNd36w0b7mOoROLZjrSfNTXcWdpw5MWCIZIMODU5/exec?q=${encodeURIComponent(
          formData.clientDetails.instituteName
        )}`
      )
        .then((res) => res.json())
        .then((data) => {
          setUniversityNames(data.results || []);
        })
        .catch((err) => {
          console.error("API error:", err);
        });
    }, 200);

    return () => clearTimeout(timer);
  }, [formData.clientDetails.instituteName, showUniversityBox]);

  const convertToLocalISOString = (date) => {
    if (!date) return "";

    const localDate = new Date(date);
    localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());

    return localDate.toISOString().slice(0, 16);
  };

  const fetchLastTaskID = async () => {
    const response = await axios.post(
      `${process.env.REACT_APP_BACKEND_URL}/api/task/getNewTaskID`,
      {
        chatID: formData.clientDetails.chatID,
      },
      {
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      }
    );

    return response.data.newTaskID;
  };

  useEffect(() => {
    const generateTaskID = async () => {
      try {
        setIsGeneratingTask(true);

        const newTaskID = await fetchLastTaskID();

        const folderLink = await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/create-folder`,
          {
            folderName: newTaskID,
          }
        );

        console.log({ folderLink: folderLink.data });

        setFormData((prev) => ({
          ...prev,
          taskID: newTaskID,
          driveLink: folderLink.data.folderLink,
        }));
      } catch (error) {
        console.error("Error generating tutor ID:", error);
      } finally {
        setIsGeneratingTask(false);
      }
    };

    generateTaskID();
  }, [clientData]);

  const handleInputChange = (e, field, nestedField = null) => {
    const { value, type, checked } = e.target;

    if (nestedField) {
      setFormData((prev) => ({
        ...prev,
        [field]: {
          ...prev[field],
          [nestedField]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: field === "clientDeadline" ? new Date(value) : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      formData.clientDetails.instituteName === "" ||
      formData.clientDetails.instituteName === undefined
    ) {
      alert("Please Fill Institute Name...");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/task/newtask`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );

      if (result.data) {
        console.log({ resultttt: result.data });

        const response = await axios.put(
          `${process.env.REACT_APP_BACKEND_URL}/api/query/update-query-status`,
          {
            chatId: clientData.chatId,
            queryStatus: "done",
          },
          {
            headers: {
              Authorization: `Bearer ${Cookies.get("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data) {
          setAddNewTask(false);

          await dispatch(resetTaskState());
          dispatch(setSelectedTask("Upcoming Task"));
          dispatch(updateQuery(response.data));

          toast.success(
            "Task created and QueryStatus updated to Done successfully!",
            {
              duration: 2000,
              position: "top-center",
              style: {
                background: "green",
                color: "white",
                fontWeight: "bold",
                padding: "12px",
                borderRadius: "8px",
              },
            }
          );
        } else {
          toast.error("Task created but failed to update query status.", {
            duration: 4000,
            position: "top-center",
            style: {
              background: "#EF4444",
              color: "white",
              fontWeight: "bold",
              padding: "12px",
              borderRadius: "8px",
            },
          });
        }
      } else {
        toast.error("Failed to create new task. Please try again.", {
          duration: 4000,
          position: "top-center",
          style: {
            background: "#EF4444",
            color: "white",
            fontWeight: "bold",
            padding: "12px",
            borderRadius: "8px",
          },
        });
      }
    } catch (error) {
      console.error("Error creating task or updating status:", error);

      toast.error("An error occurred. Please try again.", {
        duration: 4000,
        position: "top-center",
        style: {
          background: "#EF4444",
          color: "white",
          fontWeight: "bold",
          padding: "12px",
          borderRadius: "8px",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50";

  const labelClass = "mb-1.5 block text-xs font-extrabold text-slate-500";

  return (
    <div className="w-full">
      {/* University Options */}
      {showUniversityBox && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Institute Results
                </h3>
                <p className="text-sm font-semibold text-slate-500">
                  Select the correct institute name
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowUniversityBox(false)}
                className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-extrabold text-red-500 transition hover:bg-red-50"
              >
                Cancel
              </button>
            </div>

            <div className="max-h-[320px] overflow-y-auto p-3">
              {universityNames.length > 0 ? (
                universityNames.map((uni, idx) => (
                  <button
                    key={idx}
                    type="button"
                    value={uni}
                    onClick={(e) => {
                      setShowUniversityBox(false);
                      handleInputChange(e, "clientDetails", "instituteName");
                    }}
                    className="block w-full rounded-2xl px-4 py-3 text-left text-sm font-bold text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-600"
                  >
                    {uni}
                  </button>
                ))
              ) : (
                <p className="py-8 text-center text-sm font-bold text-slate-500">
                  No institute results found.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Top Summary */}
      <div className="mb-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
              <Sparkles size={22} />
            </div>

            <div className="min-w-0">
              <h2 className="text-xl font-black text-slate-900">
                Add New Task
              </h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                Create a task from query and mark the query as done after
                successful submission.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
              <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">
                Task ID
              </p>
              <p className="mt-1 truncate text-sm font-black text-indigo-600">
                {isGeneratingTask ? "Generating..." : formData.taskID}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
              <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">
                Client
              </p>
              <p className="mt-1 truncate text-sm font-black text-slate-800">
                {formData.clientDetails.name || formData.clientDetails.chatID}
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Client Details */}
        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
              <UserRound size={19} />
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900">
                Client Details
              </h3>
              <p className="text-sm font-semibold text-slate-500">
                Chat ID: {formData.clientDetails.chatID}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div>
              <label className={labelClass}>Currency</label>
              <select
                value={formData.clientDetails.currencyType}
                onChange={(e) =>
                  handleInputChange(e, "clientDetails", "currencyType")
                }
                className={inputClass}
              >
                {currencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Deal Amount</label>
              <div className="relative">
                <CircleDollarSign
                  size={17}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="number"
                  placeholder="Total Amount"
                  value={formData.clientDetails.totalAmount}
                  onChange={(e) =>
                    handleInputChange(e, "clientDetails", "totalAmount")
                  }
                  className={`${inputClass} pr-10`}
                  style={{
                    appearance: "textfield",
                    MozAppearance: "textfield",
                  }}
                  onWheel={(e) => e.target.blur()}
                  required
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Received Amount Optional</label>
              <input
                type="number"
                placeholder="Received Amount"
                value={formData.clientDetails.receivedAmount}
                onChange={(e) =>
                  handleInputChange(e, "clientDetails", "receivedAmount")
                }
                className={inputClass}
                onWheel={(e) => e.target.blur()}
                style={{
                  appearance: "textfield",
                  MozAppearance: "textfield",
                }}
              />
            </div>

            <div className="relative">
              <label className={labelClass}>Institute Name</label>
              <div className="relative">
                <Landmark
                  size={17}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Institute Name"
                  value={formData.clientDetails.instituteName}
                  onChange={(e) => {
                    setShowUniversityBox(true);
                    handleInputChange(e, "clientDetails", "instituteName");
                  }}
                  className={`${inputClass} pr-10`}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Duration Hours Optional</label>
              <div className="relative">
                <Clock3
                  size={17}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="number"
                  placeholder="Duration (hrs)"
                  value={formData.clientDetails.duration}
                  onChange={(e) =>
                    handleInputChange(e, "clientDetails", "duration")
                  }
                  className={`${inputClass} pr-10`}
                  onWheel={(e) => e.target.blur()}
                  style={{
                    appearance: "textfield",
                    MozAppearance: "textfield",
                  }}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Type</label>
              <select
                value={formData.clientDetails.type}
                onChange={(e) =>
                  handleInputChange(e, "clientDetails", "type")
                }
                className={inputClass}
              >
                <option value="assignment">Assignment</option>
                <option value="project">Project</option>
                <option value="session">Session</option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className={labelClass}>
                Session Start Date & Time Optional
              </label>
              <input
                type="datetime-local"
                placeholder="Session Start Time"
                min={convertToLocalISOString(
                  new Date().getTime() - 5 * 60 * 1000
                )}
                value={
                  formData.clientDetails.sessionStartTime
                    ? convertToLocalISOString(
                        formData.clientDetails.sessionStartTime
                      )
                    : ""
                }
                onChange={(e) =>
                  handleInputChange(e, "clientDetails", "sessionStartTime")
                }
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* Subject Details */}
        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 ring-1 ring-violet-100">
                <GraduationCap size={19} />
              </div>

              <div>
                <h3 className="text-base font-black text-slate-900">
                  Subject Details
                </h3>
                <p className="text-sm font-semibold text-slate-500">
                  Add subject and optional description
                </p>
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2 rounded-2xl bg-indigo-50 px-4 py-2 text-sm font-extrabold text-indigo-600 ring-1 ring-indigo-100">
              <input
                type="checkbox"
                id="fullCourse"
                name="clientDetails.fullCourse"
                checked={formData.clientDetails.fullCourse}
                onChange={(e) =>
                  handleInputChange(e, "clientDetails", "fullCourse")
                }
                className="h-4 w-4 rounded border-slate-300"
              />
              Full Course
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label className={labelClass}>Subject</label>
              <input
                type="text"
                placeholder="Subject"
                value={formData.subject}
                onChange={(e) => handleInputChange(e, "subject")}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className={labelClass}>Subject Description Optional</label>
              <textarea
                placeholder="Subject Description"
                value={formData.subjectDes}
                onChange={(e) => handleInputChange(e, "subjectDes")}
                className="min-h-[105px] w-full resize-none rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50"
                rows="3"
              />
            </div>
          </div>
        </section>

        {/* Additional Details */}
        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
              <FileText size={19} />
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900">
                Additional Details
              </h3>
              <p className="text-sm font-semibold text-slate-500">
                Drive link and client deadline
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className={labelClass}>Drive Link</label>

              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                <Link2 size={17} className="shrink-0 text-slate-400" />

                {formData.driveLink && formData.driveLink !== "Loading..." ? (
                  <a
                    target="_blank"
                    rel="noreferrer"
                    className="min-w-0 flex-1 truncate text-sm font-bold text-indigo-600 hover:text-indigo-700"
                    href={formData.driveLink}
                  >
                    {formData.driveLink}
                  </a>
                ) : (
                  <span className="min-w-0 flex-1 truncate text-sm font-bold text-slate-500">
                    Generating drive folder...
                  </span>
                )}

                <ExternalLink size={16} className="shrink-0 text-slate-400" />
              </div>
            </div>

            <div>
              <label className={labelClass}>Client Deadline</label>
              <div className="relative">
                <CalendarClock
                  size={17}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="datetime-local"
                  placeholder="Client Deadline"
                  min={convertToLocalISOString(new Date())}
                  value={
                    formData.clientDeadline
                      ? convertToLocalISOString(formData.clientDeadline)
                      : ""
                  }
                  onChange={(e) => handleInputChange(e, "clientDeadline")}
                  className={`${inputClass} pr-10`}
                  required
                />
              </div>
            </div>
          </div>
        </section>

        {/* Submit */}
        <div className="sticky bottom-0 z-10 border-t border-slate-100 bg-slate-50/95 py-4 backdrop-blur">
          <button
            type="submit"
            disabled={isSubmitting || isGeneratingTask}
            className={`flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-black text-white shadow-lg transition ${
              isSubmitting || isGeneratingTask
                ? "cursor-not-allowed bg-slate-400 shadow-slate-200"
                : "bg-indigo-600 shadow-indigo-200 hover:bg-indigo-700"
            }`}
          >
            {isSubmitting || isGeneratingTask ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {isGeneratingTask ? "Preparing Task..." : "Submitting Task..."}
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                Submit Task
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}