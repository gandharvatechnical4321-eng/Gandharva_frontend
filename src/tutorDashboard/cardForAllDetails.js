import React, { useEffect, useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { FaAngleDown, FaAngleUp } from "react-icons/fa6";
import { BsBank2, BsExclamationCircleFill } from "react-icons/bs";
import { FaEdit } from "react-icons/fa";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";
import { MdDelete, MdOutlineUpdate } from "react-icons/md";
import {
  FaStar,
  FaUserGraduate,
  FaBriefcase,
  FaWrench,
  FaTools,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { setNotifyTutorDetails } from "../features/taskSlice";
import RatingStars from "../thirdSection/card/RatingCard";
import axios from "axios";
import EditTutor from "./EditTutorData";

const CardForAllDetails = ({ setReload, searchValue, tutorData }) => {
  const dispatch = useDispatch();

  const notifyTutorPersonaly = useSelector(
    (state) => state.tasks.notifyTutorPersonaly
  );

  const notifyTutorDetails =
  useSelector((state) => state.tasks.notifyTutorDetails) || [];

const isSelected = notifyTutorDetails.some(
  (item) => item?.tutorID === tutorData?.tutorID
);

  const [moreTutorDetails, setMoreTutorDetails] = useState(false);
  const [status, setStatus] = useState(tutorData.status);
  const [subjetExperties, setSubjetExperties] = useState([]);
  const [editTutorDiv, setEditTutorDiv] = useState(false);

  const handleStatusChange = async (e) => {
    const updatedStatus = e.target.value;
    const previousStatus = status;

    setStatus(updatedStatus);

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/tutor/status`,
        {
          tutorID: tutorData.tutorID,
          status: updatedStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );

      console.log("Status updated:", response.data);
      toast.success("Status updated successfully!");
    } catch (error) {
      setStatus(previousStatus);
      console.error("Error updating status:", error);
      toast.error("Failed to update status.");
    }
  };

  const level = {
    expert: <FaStar className="text-emerald-500" size={11} />,
    inter: <FaWrench className="text-amber-500" size={11} />,
    beginner: <FaTools className="text-slate-500" size={11} />,
  };

  useEffect(() => {
    if (tutorData.tutorID === "TI0062") console.log(tutorData.status);

    async function findSkillArray() {
      let result = [];
      const searchValueLower = searchValue.toLowerCase();

      let expertSkills = tutorData.expertSkills;
      let intermediateSkills = tutorData.intermediateSkills;
      let beginnerSkills = tutorData.beginnerSkills;

      if (
        expertSkills &&
        expertSkills.some((skill) =>
          skill.toLowerCase().includes(searchValueLower)
        )
      ) {
        result.push("expert");
      }

      if (
        intermediateSkills &&
        intermediateSkills.some((skill) =>
          skill.toLowerCase().includes(searchValueLower)
        )
      ) {
        result.push("inter");
      }

      if (
        beginnerSkills &&
        beginnerSkills.some((skill) =>
          skill.toLowerCase().includes(searchValueLower)
        )
      ) {
        result.push("beginner");
      }

      setSubjetExperties(result);
    }

    findSkillArray();
  }, [
  searchValue,
  tutorData.tutorID,
  tutorData.status,
  tutorData.expertSkills,
  tutorData.intermediateSkills,
  tutorData.beginnerSkills,
]);

  const handleDelete = async (e) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this tutor?"
    );

    if (!isConfirmed) {
      return;
    }

    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/api/tutor/delete-tutor/${tutorData.tutorID}`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );

      if (response?.data?.success) {
        toast.success("Selected tutor is deleted successfully...", {
          duration: 2000,
          position: "top-center",
        });

        setReload((prev) => prev + 1);
      }
    } catch (error) {
      toast.error(`${error.response?.data || error.message}`, {
        duration: 2000,
        position: "top-center",
      });
      console.error(error);
    }
  };

  const getStatusStyle = (currentStatus) => {
    switch (currentStatus) {
      case "new":
        return {
          card: "border-l-blue-500",
          badge: "bg-blue-50 text-blue-700 border-blue-200",
          dot: "bg-blue-500",
          avatar: "bg-blue-600 text-white",
        };
      case "active":
        return {
          card: "border-l-emerald-500",
          badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
          dot: "bg-emerald-500",
          avatar: "bg-emerald-600 text-white",
        };
      case "inactive":
        return {
          card: "border-l-slate-400",
          badge: "bg-slate-50 text-slate-700 border-slate-200",
          dot: "bg-slate-400",
          avatar: "bg-slate-500 text-white",
        };
      case "warning 1":
        return {
          card: "border-l-yellow-400",
          badge: "bg-yellow-50 text-yellow-700 border-yellow-200",
          dot: "bg-yellow-500",
          avatar: "bg-yellow-500 text-white",
        };
      case "warning 2":
        return {
          card: "border-l-orange-500",
          badge: "bg-orange-50 text-orange-700 border-orange-200",
          dot: "bg-orange-500",
          avatar: "bg-orange-500 text-white",
        };
      case "warning 3":
      case "delete":
        return {
          card: "border-l-red-500",
          badge: "bg-red-50 text-red-700 border-red-200",
          dot: "bg-red-500",
          avatar: "bg-red-600 text-white",
        };
      default:
        return {
          card: "border-l-indigo-400",
          badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
          dot: "bg-indigo-500",
          avatar: "bg-indigo-600 text-white",
        };
    }
  };

  const statusStyle = getStatusStyle(status);
  const paymentDetails = tutorData?.paymentDetails || {};

  return (
    <>
      {editTutorDiv && (
        <EditTutor
          setReload={setReload}
          tutorData={tutorData}
          setEditTutor={setEditTutorDiv}
        />
      )}

      <article
  onClick={() => {
    if (notifyTutorPersonaly) {
      dispatch(setNotifyTutorDetails(tutorData));
    }
  }}
  className={`group w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md border-l-4 ${
    statusStyle.card
  } ${
    notifyTutorPersonaly
      ? "cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30"
      : ""
  } ${
    isSelected
      ? "border-indigo-300 bg-indigo-50/60 ring-2 ring-indigo-200"
      : ""
  }`}
>
        {/* Compact Header Row */}
        <div className="flex flex-col gap-3 px-4 py-3 xl:flex-row xl:items-center xl:justify-between">
          
          {/* Identity */}
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              type="button"
              disabled={!notifyTutorPersonaly}
              onClick={() => dispatch(setNotifyTutorDetails(tutorData))}
              className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-base font-bold shadow-sm transition ${
                statusStyle.avatar
              } ${
                notifyTutorPersonaly
                  ? "cursor-pointer hover:scale-105 hover:ring-2 hover:ring-indigo-300"
                  : "cursor-not-allowed opacity-60"
              }`}
              title={
                notifyTutorPersonaly
                  ? "Select tutor for personal notification"
                  : "Enable Notify Tutor Personally first"
              }
            >
              {tutorData.name?.[0]?.toUpperCase() || "T"}
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="truncate text-sm font-bold text-slate-800">
                  {tutorData.name}
                </h4>

                {searchValue &&
                  subjetExperties.map((e, index) => (
                    <span
                      key={`${e}-${index}`}
                      className="inline-flex h-5 w-5 items-center justify-center rounded bg-slate-50 border border-slate-200"
                    >
                      {level[e]}
                    </span>
                  ))}

                <span
                  className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${statusStyle.badge}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                  {status}
                </span>
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] font-medium text-slate-500">
                <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-slate-600">
                  {tutorData.tutorID}
                </span>
                <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-indigo-600 border border-indigo-100">
                  {tutorData?.ratingPerAssignment?.length || 0} Reviews
                </span>
              </div>
            </div>
          </div>

          {/* Key Info Grid (Desktop Inline) */}
          <div className="grid grid-cols-2 gap-4 xl:flex xl:gap-8 xl:items-center">
            <div className="min-w-0 xl:w-[180px]">
              <p className="text-[10px] font-bold uppercase text-slate-400">Institute</p>
              <p
                className="break-words text-xs font-semibold text-slate-700"
                title={tutorData.instituteName || "N/A"}
              >
                {tutorData.instituteName || "N/A"}
              </p>
            </div>

            <div className="min-w-0 xl:w-[130px]">
              <p className="text-[10px] font-bold uppercase text-slate-400">WhatsApp</p>
              <p className="truncate text-xs font-semibold text-slate-700">
                {tutorData.whatsappNo}
              </p>
            </div>

            <div className="min-w-0 xl:w-[130px]">
              <p className="text-[10px] font-bold uppercase text-slate-400">Rating</p>
              <div className="flex items-center gap-1">
                <RatingStars rating={tutorData.rating} />
                <span className="text-xs font-bold text-slate-700 ml-1">
                  {tutorData.rating}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex shrink-0 items-center justify-end gap-1.5 mt-2 xl:mt-0">
            <button
              onClick={() => setEditTutorDiv(true)}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-indigo-100 bg-indigo-50 text-indigo-600 transition hover:bg-indigo-100"
              title="Edit Tutor"
            >
              <FaEdit size={14} />
            </button>

            <button
              onClick={handleDelete}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-100"
              title="Delete Tutor"
            >
              <MdDelete size={15} />
            </button>

            <button
              onClick={() => setMoreTutorDetails(!moreTutorDetails)}
              className={`flex h-8 w-8 items-center justify-center rounded-md border transition ${
                moreTutorDetails
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
              }`}
              title="Toggle Details"
            >
              {moreTutorDetails ? <FaAngleUp /> : <FaAngleDown />}
            </button>
          </div>
        </div>

        {/* Expandable Details */}
        <AnimatePresence>
          {moreTutorDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-slate-100 bg-slate-50/50"
            >
              <div className="grid gap-4 px-4 py-4 md:grid-cols-2 lg:grid-cols-3">
                
                {/* Status Update */}
                <section className="flex flex-col gap-2 rounded-md border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <MdOutlineUpdate className="text-indigo-500" size={16} />
                    <p className="text-xs font-bold text-slate-800">Account Status</p>
                  </div>
                  <select
                    value={status}
                    onChange={handleStatusChange}
                    className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                  >
                    <option value="new">New</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="warning 1">Warning 1</option>
                    <option value="warning 2">Warning 2</option>
                    <option value="warning 3">Warning 3</option>
                    <option value="delete">Delete</option>
                  </select>
                </section>

                {/* Skills */}
                <section className="flex flex-col gap-2 rounded-md border border-slate-200 bg-white p-3 shadow-sm lg:col-span-2">
                  <p className="text-xs font-bold text-slate-800">Skills Overview</p>
                  <div className="flex flex-wrap gap-1.5">
                    {tutorData.expertSkills?.map((skill, i) => (
                      <span key={`exp-${i}`} className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700 border border-emerald-100">
                        <FaStar size={8} /> {skill}
                      </span>
                    ))}
                    {tutorData.intermediateSkills?.map((skill, i) => (
                      <span key={`int-${i}`} className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700 border border-amber-100">
                        <FaWrench size={8} /> {skill}
                      </span>
                    ))}
                    {tutorData.beginnerSkills?.map((skill, i) => (
                      <span key={`beg-${i}`} className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600 border border-slate-200">
                        <FaTools size={8} /> {skill}
                      </span>
                    ))}
                  </div>
                </section>

                {/* Payment Details (Compact Grid) */}
                <section className="flex flex-col gap-3 rounded-md border border-slate-200 bg-white p-3 shadow-sm md:col-span-2">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <BsBank2 className="text-indigo-500" size={14} />
                    <p className="text-xs font-bold text-slate-800">Payment Information</p>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                    <div>
                      <span className="block text-[10px] uppercase text-slate-400">Account Name</span>
                      <span className="font-semibold text-slate-700">{paymentDetails.bankHolderName || "N/A"}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase text-slate-400">UPI ID</span>
                      <span className="font-semibold text-slate-700">{paymentDetails.upiID || "N/A"}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase text-slate-400">Account Number</span>
                      <span className="font-semibold text-slate-700">
                        {paymentDetails.AccoutNumber || paymentDetails.accountNumber || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase text-slate-400">IFSC Code</span>
                      <span className="font-semibold text-slate-700">{paymentDetails.IFSC || "N/A"}</span>
                    </div>
                  </div>
                </section>

                {/* Academic Details */}
                <section className="flex flex-col gap-3 rounded-md border border-slate-200 bg-white p-3 shadow-sm">
                  <p className="text-xs font-bold text-slate-800 border-b border-slate-100 pb-2">Academic Profile</p>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-start gap-2">
                      <FaUserGraduate className="mt-0.5 text-slate-400" size={12} />
                      <div>
                        <span className="block text-[10px] uppercase text-slate-400">Highest Degree</span>
                        <span className="font-semibold text-slate-700">{tutorData.highestDegree || "N/A"}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <FaBriefcase className="mt-0.5 text-slate-400" size={12} />
                      <div>
                        <span className="block text-[10px] uppercase text-slate-400">Department</span>
                        <span className="font-semibold text-slate-700">{tutorData.department || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </section>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </article>
    </>
  );
};

export default CardForAllDetails;