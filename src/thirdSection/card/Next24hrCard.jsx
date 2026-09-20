import React, { useState } from "react";
import {
  setSelectedTaskDetails,
  setOpenTaskUpdateCard,
} from "../../features/taskSlice";

import { IoMdNotificationsOff } from "react-icons/io";
import { MdAssignmentTurnedIn, MdOutlineAddComment } from "react-icons/md";
import { SiFcc } from "react-icons/si";
import { RiFolderReceivedFill } from "react-icons/ri";
import { TbCreditCardRefund } from "react-icons/tb";
import { GiRingingBell } from "react-icons/gi";
import { IoCheckmarkDoneCircleSharp } from "react-icons/io5";
import { FaRegEdit, FaAppStore } from "react-icons/fa";
import { FcCancel } from "react-icons/fc";
import { SlPaypal } from "react-icons/sl";
import { IoLogoSass } from "react-icons/io5";

import { useDispatch, useSelector } from "react-redux";
import { setSearchContact } from "../../features/contactsSlice";
import toast from "react-hot-toast";
import AddComment from "../../comment/AddComment";

const Next24hrCard = ({ task }) => {
  const dispatch = useDispatch();
  const deviceDetails = useSelector((state) => state.contacts.deviceDetails);
  const [showPopup, setShowPopup] = useState(false);

  const FormateTime = (time) => {
    if (!time) return "NA";

    return new Date(time).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const copyToClipboard = (data) => {
    try {
      const formattedData =
        typeof data === "object" ? JSON.stringify(data, null, 2) : String(data);

      navigator.clipboard
        .writeText(formattedData)
        .then(() => {
          toast.success("🎉 Selected ID Copied!", {
            duration: 2000,
            position: "top-right",
            style: {
              background: "#10B981",
              color: "white",
              fontWeight: "bold",
              padding: "16px",
              borderRadius: "8px",
            },
          });

          dispatch(setSearchContact(data));
        })
        .catch((err) => {
          console.error("Failed to copy data: ", err);
        });
    } catch (error) {
      console.error("Error formatting data: ", error);
    }
  };

  const openTaskDetails = () => {
    dispatch(setSelectedTaskDetails(task));
    dispatch(setOpenTaskUpdateCard(true));
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "New Task":
        return {
          border: "border-l-red-400",
          badge: "bg-red-50 text-red-700 border-red-100",
          dot: "bg-red-500",
          hover: "hover:border-red-500",
        };
      case "Advance Received":
        return {
          border: "border-l-orange-400",
          badge: "bg-orange-50 text-orange-700 border-orange-100",
          dot: "bg-orange-500",
          hover: "hover:border-orange-500",
        };
      case "Tutor Notified":
        return {
          border: "border-l-yellow-400",
          badge: "bg-yellow-50 text-yellow-700 border-yellow-100",
          dot: "bg-yellow-500",
          hover: "hover:border-yellow-500",
        };
      case "Tutor Assigned":
        return {
          border: "border-l-emerald-400",
          badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
          dot: "bg-emerald-500",
          hover: "hover:border-emerald-500",
        };
      case "Solution Received":
        return {
          border: "border-l-blue-400",
          badge: "bg-blue-50 text-blue-700 border-blue-100",
          dot: "bg-blue-500",
          hover: "hover:border-blue-500",
        };
      case "Task Completed":
        return {
          border: "border-l-indigo-400",
          badge: "bg-indigo-50 text-indigo-700 border-indigo-100",
          dot: "bg-indigo-500",
          hover: "hover:border-indigo-500",
        };
      case "Being Modified":
        return {
          border: "border-l-violet-400",
          badge: "bg-violet-50 text-violet-700 border-violet-100",
          dot: "bg-violet-500",
          hover: "hover:border-violet-500",
        };
      case "Cancel":
        return {
          border: "border-l-red-500",
          badge: "bg-red-50 text-red-700 border-red-100",
          dot: "bg-red-600",
          hover: "hover:border-red-600",
        };
      case "Refund":
        return {
          border: "border-l-rose-400",
          badge: "bg-rose-50 text-rose-700 border-rose-100",
          dot: "bg-rose-500",
          hover: "hover:border-rose-500",
        };
      default:
        return {
          border: "border-l-slate-300",
          badge: "bg-slate-50 text-slate-700 border-slate-100",
          dot: "bg-slate-400",
          hover: "hover:border-slate-400",
        };
    }
  };

  const getStatusIcon = () => {
    if (task.status === "New Task" || task.status === "Advance Received") {
      return <IoMdNotificationsOff className="text-slate-500" size={14} />;
    }
    if (task.status === "Tutor Notified") {
      return (
        <div className="relative flex items-center">
          <GiRingingBell className="text-yellow-600" size={15} />
          {!!task.intrestedTutors?.length && (
            <span className="absolute -right-2 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[9px] font-extrabold text-white shadow">
              {task.intrestedTutors.length}
            </span>
          )}
        </div>
      );
    }
    if (task.status === "Tutor Assigned") {
      return <MdAssignmentTurnedIn className="text-emerald-600" size={15} />;
    }
    if (task.status === "Cancel") {
      return <FcCancel size={15} />;
    }
    if (task.status === "Solution Received") {
      return <RiFolderReceivedFill className="text-blue-600" size={15} />;
    }
    if (task.status === "Task Completed") {
      return <IoCheckmarkDoneCircleSharp className="text-indigo-600" size={16} />;
    }
    if (task.status === "Being Modified") {
      return <FaRegEdit className="text-violet-600" size={14} />;
    }
    return <TbCreditCardRefund className="text-rose-500" size={15} />;
  };

  const getTaskTypeIcon = () => {
    if (task.clientDetails?.type === "project") {
      return <SlPaypal className="text-slate-600" size={13} />;
    }
    if (task.clientDetails?.type === "session") {
      return <IoLogoSass className="text-red-600" size={14} />;
    }
    return <FaAppStore className="text-slate-600" size={13} />;
  };

  const statusStyle = getStatusStyle(task.status);

  return (
    <article
      className={`group relative flex w-full flex-col gap-0 overflow-hidden rounded-lg border border-slate-200 border-l-4 sm:rounded-xl sm:border-l-8 ${statusStyle.border} ${statusStyle.hover} bg-white px-3 py-3 sm:px-4 sm:py-3 shadow-sm transition-all duration-200 hover:shadow-md lg:hover:-translate-y-0.5`}
    >
      {/* Row 1: IDs & Top Actions */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] lg:grid-cols-[4fr_5fr_3fr] lg:items-center">
        
        {/* T_ID */}
        <button
          type="button"
          onClick={openTaskDetails}
          className="group flex min-w-0 items-center gap-1 rounded-md text-left transition-colors hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 active:bg-indigo-50"
          title="Open task details"
        >
          <span className="shrink-0 text-xs font-extrabold text-slate-400 group-hover:text-indigo-800 sm:text-[11px]">
            T_ID:
          </span>
          <span className="min-w-0 break-all text-xs font-extrabold italic text-slate-900 transition-colors group-hover:text-indigo-800 sm:truncate">
            {task.taskID}
          </span>
        </button>

        {/* CI / TI */}
        <div className="flex min-w-0 flex-wrap items-center gap-1 text-xs font-extrabold sm:text-[11px]">
          <button
            type="button"
            className="truncate rounded px-1 py-0.5 text-yellow-600 transition hover:bg-yellow-50 active:bg-yellow-100"
            onClick={() => copyToClipboard(task.clientDetails?.chatID)}
            title="Copy Client ID"
          >
            {task.clientDetails?.chatID || "Client"}
          </button>
          <span className="shrink-0 text-slate-300">-</span>
          <button
            type="button"
            className="truncate rounded px-1 py-0.5 text-emerald-600 transition hover:bg-emerald-50 active:bg-emerald-100"
            onClick={() => copyToClipboard(task.tutorDetails?.tutorID)}
            title="Copy Tutor ID"
          >
            {task.tutorDetails?.tutorID || "Tutor"}
          </button>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-2 sm:justify-end">
          {task.clientDetails?.fullCourse && (
            <span
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100 sm:h-8 sm:w-8 lg:h-7 lg:w-7"
              title="Full Course"
            >
              <SiFcc size={13} />
            </span>
          )}
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-lg border sm:h-8 sm:w-8 lg:h-7 lg:w-7 ${statusStyle.badge}`}
            title={task.status}
          >
            {getStatusIcon()}
          </span>
        </div>
      </div>

      {/* Row 2: Amounts & Status Badge */}
      <div className="grid grid-cols-1 gap-2 border-t border-slate-100 pt-2 sm:grid-cols-2 lg:grid-cols-[4fr_5fr_3fr] lg:items-center lg:border-t-0 lg:pt-0">
        
        {/* CA */}
        <div className="flex min-w-0 items-center gap-1 text-xs sm:text-[11px]">
          <span className="shrink-0 font-extrabold text-slate-400">CA:</span>
          <span className="truncate font-bold text-slate-800">
            {task.clientDetails?.totalAmount}{" "}
            {task.clientDetails?.currencyType || "INR"}
          </span>
        </div>

        {/* TA */}
        <div className="flex min-w-0 items-center gap-1 text-xs sm:text-[11px]">
          <span className="shrink-0 font-extrabold text-slate-400">TA:</span>
          <span className="truncate font-bold text-slate-800">
            {task.tutorDetails?.totalAmount} INR
          </span>
          <span
            className={`shrink-0 text-[11px] font-extrabold uppercase sm:text-[10px] ${
              task.tutorDetails?.paymentStatus === "confirm"
                ? "text-emerald-600"
                : "text-slate-400"
            }`}
          >
            ({task.tutorDetails?.paymentStatus === "confirm" ? "Conf" : "Hold"})
          </span>
        </div>

        {/* Badge */}
        <div className="flex min-w-0 sm:col-span-2 lg:col-span-1 lg:justify-end">
          <span
            className={`inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-extrabold sm:px-2 sm:py-0.5 sm:text-[10px] ${statusStyle.badge}`}
          >
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusStyle.dot}`} />
            <span className="truncate">{task.status}</span>
          </span>
        </div>
      </div>

      {/* Row 3: Deadlines & Bottom Actions */}
      <div className="grid grid-cols-1 gap-2 border-t border-slate-100 pt-2 sm:grid-cols-2 lg:grid-cols-[4fr_5fr_3fr] lg:items-center lg:border-t-0 lg:pt-0">
        
        {/* CD */}
        <div className="flex min-w-0 items-center gap-1 text-xs sm:text-[11px]">
          <span className="shrink-0 font-extrabold text-slate-400">CD:</span>
          <span className="truncate font-bold text-slate-700">
            {FormateTime(task.clientDeadline)}
          </span>
        </div>

        {/* TD */}
        <div className="flex min-w-0 items-center gap-1 text-xs sm:text-[11px]">
          <span className="shrink-0 font-extrabold text-slate-400">TD:</span>
          <span className="truncate font-bold text-slate-700">
            {FormateTime(task.tutorDeadline)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 sm:col-span-2 lg:col-span-1">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-slate-500 ring-1 ring-slate-100 sm:h-8 sm:w-8 lg:h-7 lg:w-7">
            {getTaskTypeIcon()}
          </span>

          <button
            type="button"
            onClick={() => setShowPopup(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-indigo-50 hover:text-indigo-600 sm:h-8 sm:w-8 lg:h-7 lg:w-7"
            title="Add Comment"
          >
            <MdOutlineAddComment size={14} />
          </button>
        </div>
      </div>

      {/* Comment Modal */}
      {showPopup && (
        <AddComment
          taskId={task.taskID}
          executiveName={deviceDetails.userName}
          clientId={task.clientDetails?.chatID}
          onClose={() => setShowPopup(false)}
          close={showPopup}
        />
      )}
    </article>
  );
};

export default Next24hrCard;