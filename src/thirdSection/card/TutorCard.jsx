import React, { useEffect, useState, useRef } from "react";
import { IoMdAdd } from "react-icons/io";
import { FaAngleDown, FaAngleUp } from "react-icons/fa6";
import { BsExclamationCircleFill } from "react-icons/bs";
import {
  FaStar,
  FaUserGraduate,
  FaBriefcase,
  FaWrench,
  FaTools,
} from "react-icons/fa";
import { MdOutlineUpdate } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { setNotifyTutorDetails } from "../../features/taskSlice";
import RatingStars from "./RatingCard";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-hot-toast";

const TutorCard = ({ searchValue = "", tutorData }) => {
  const dispatch = useDispatch();
  const popoverRef = useRef(null);
  const addReviewRef = useRef(null);

  const notifyTutorPersonaly = useSelector((state) => state.tasks.notifyTutorPersonaly);
  const notifyTutorDetails = useSelector((state) => state.tasks.notifyTutorDetails) || [];

  const isPersonalNotifyMode = Boolean(notifyTutorPersonaly);

  const [moreTutorDetails, setMoreTutorDetails] = useState(false);
  const [status, setStatus] = useState(
  tutorData?.status || "new"
);
  const [subjetExperties, setSubjetExperties] = useState([]);
  
  // Review States
  const [showReviews, setShowReviews] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [fetchedReviews, setFetchedReviews] = useState([]);
  const [showAddReview, setShowAddReview] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, taskID: "", comment: "" });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  

  const isSelected = notifyTutorDetails.some((item) => item.tutorID === tutorData?.tutorID);

  const handleTutorSelect = (event) => {
  event.stopPropagation();

  if (!isPersonalNotifyMode) {
    toast.error("Click Notify Personally first.");
    return;
  }

  dispatch(setNotifyTutorDetails(tutorData));
};

  useEffect(() => {
  if (tutorData?.status) {
    setStatus(tutorData.status);
  }
}, [tutorData?.status, tutorData?.tutorID]);

  // Close popovers on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setShowReviews(false);
      }
      if (addReviewRef.current && !addReviewRef.current.contains(event.target)) {
        setShowAddReview(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
  console.log("FETCHED TUTOR STATUS:", {
    tutorID: tutorData?.tutorID,
    fetchedStatus: tutorData?.status,
    localStatus: status,
  });
}, [tutorData?.tutorID, tutorData?.status, status]);

 

  // 1. Fixed Average Rating Calculation (Numbers strictly)
  const calculateAverageRating = () => {
    const reviewsToCalculate = fetchedReviews.length > 0 ? fetchedReviews : tutorData.ratingPerAssignment;
    if (!reviewsToCalculate || reviewsToCalculate.length === 0) return 0;
    
    const totalRating = reviewsToCalculate.reduce(
      (sum, item) => sum + Number(item.rating || 0),
      0
    );
    return (totalRating / reviewsToCalculate.length).toFixed(1);
  };

  const averageRating = calculateAverageRating();

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatName = (name) => {
    if (!name) return "";
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  // 2. Avatar colors follow status strictly
  const getStatusStyle = (currentStatus) => {
    const s = currentStatus?.toLowerCase();
    switch (s) {
      case "new":
        return { card: "border-l-blue-500", badge: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500", avatar: "bg-blue-500" };
      case "active":
        return { card: "border-l-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", avatar: "bg-emerald-500" };
      case "inactive":
        return { card: "border-l-slate-400", badge: "bg-slate-50 text-slate-700 border-slate-200", dot: "bg-slate-400", avatar: "bg-slate-400" };
      case "warning 1":
        return { card: "border-l-yellow-400", badge: "bg-yellow-50 text-yellow-700 border-yellow-200", dot: "bg-yellow-500", avatar: "bg-yellow-500" };
      case "warning 2":
        return { card: "border-l-orange-500", badge: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500", avatar: "bg-orange-500" };
      case "warning 3":
      case "delete":
        return { card: "border-l-rose-500", badge: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-600", avatar: "bg-rose-500" };
      default:
        return { card: "border-l-slate-400", badge: "bg-slate-50 text-slate-700 border-slate-200", dot: "bg-slate-400", avatar: "bg-slate-400" };
    }
  };

  // 3. Status Update with Rollback
  const handleStatusChange = async (e) => {
    const updatedStatus = e.target.value;
    const previousStatus = status;

    setStatus(updatedStatus); // Optimistic update

    try {
      await axios.put(
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
      toast.success("Status updated successfully!");
    } catch (error) {
      setStatus(previousStatus); // Rollback on failure
      console.error("Error updating status:", error);
      toast.error("Failed to update status. Reverted.");
    }
  };

  // Fetch Reviews Logic
  const fetchTutorReviews = async () => {
    if (showReviews) {
      setShowReviews(false);
      return;
    }
    
    setShowReviews(true);
    setLoadingReviews(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/tutor/${tutorData.tutorID}/reviews`,
        { headers: { Authorization: `Bearer ${Cookies.get("token")}` } }
      );
      setFetchedReviews(response.data.data || response.data.reviews || tutorData.ratingPerAssignment || []);
    } catch (error) {
      console.error("Error fetching reviews, falling back to cached data:", error);
      setFetchedReviews(tutorData.ratingPerAssignment || []);
    } finally {
      setLoadingReviews(false);
    }
  };

  // 4. Submit New Review Logic (Safe Date Handling)
  const handleAddReview = async (e) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/tutor/${tutorData.tutorID}/review`,
        newReview,
        { headers: { Authorization: `Bearer ${Cookies.get("token")}` } }
      );
      toast.success("Review added successfully!");
      setShowAddReview(false);
      setNewReview({ rating: 5, taskID: "", comment: "" });
      
      // Update local reviews list smoothly
      setFetchedReviews((prev) => [
        response.data.review || {
          ...newReview,
          createdAt: new Date().toISOString(),
          ratedBy: "You",
        },
        ...prev,
      ]);
    } catch (error) {
      console.error("Error adding review:", error);
      toast.error("Failed to add review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const level = {
    expert: <FaStar className="text-emerald-500" size={12} />,
    inter: <FaWrench className="text-amber-500" size={12} />,
    beginner: <FaTools className="text-slate-400" size={12} />,
  };

  useEffect(() => {
    function findSkillArray() {
      const result = [];
      const searchValueLower = searchValue?.toLowerCase() || "";
      if (!searchValueLower) return setSubjetExperties([]);

      if (tutorData.expertSkills?.some((skill) => skill.toLowerCase().includes(searchValueLower))) result.push("expert");
      if (tutorData.intermediateSkills?.some((skill) => skill.toLowerCase().includes(searchValueLower))) result.push("inter");
      if (tutorData.beginnerSkills?.some((skill) => skill.toLowerCase().includes(searchValueLower))) result.push("beginner");
      setSubjetExperties(result);
    }
    findSkillArray();
  }, [searchValue, tutorData.expertSkills, tutorData.intermediateSkills, tutorData.beginnerSkills]);

  const statusStyle = getStatusStyle(status);
  const reviewsList = fetchedReviews.length > 0 ? fetchedReviews : tutorData.ratingPerAssignment;

  return (
    <article
        onClick={(event) => {
          if (isPersonalNotifyMode) {
            handleTutorSelect(event);
          }
        }}
        className={`group relative mb-2 w-full overflow-visible rounded-lg border border-slate-200 border-l-[5px] bg-white shadow-sm transition-all duration-200 hover:shadow-md ${
          isSelected
            ? "cursor-pointer border-indigo-300 border-l-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-200"
            : isPersonalNotifyMode
            ? `${statusStyle.card} cursor-pointer hover:bg-indigo-50/30`
            : statusStyle.card
        }`}
      >
      <div className="flex flex-col gap-3 p-2.5 sm:flex-row sm:items-center sm:justify-between sm:px-3 sm:py-2.5">
        
        {/* Left Area: Avatar + Details */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          
          {/* Square Avatar matches status */}
          <button
  type="button"
  disabled={!isPersonalNotifyMode}
  onClick={handleTutorSelect}
            className={`relative flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-lg text-[18px] font-bold text-white transition-all duration-200 ${
              isSelected ? "bg-indigo-600" : statusStyle.avatar
            } ${!isPersonalNotifyMode
  ? "cursor-not-allowed opacity-60"
  : "cursor-pointer hover:scale-105 hover:ring-2 hover:ring-indigo-300"}`}
            title={notifyTutorPersonaly ? "Select tutor for personal notification" : "Enable personal notify first"}
          >
            {tutorData.name?.[0]?.toUpperCase() || "T"}
            {isSelected && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] text-white ring-2 ring-white">
                ✓
              </span>
            )}
          </button>

          {/* Identity & Badges */}
          <div className="flex min-w-0 flex-col gap-1">
            {/* Top Row: Name & ID */}
            <div className="flex items-center gap-2">
              <h4 className="truncate text-[15px] font-bold tracking-tight text-slate-800">
                {formatName(tutorData.name)}
              </h4>
              <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 font-medium text-slate-500 text-[11px]">
                {tutorData.tutorID}
              </span>
              {subjetExperties.map((item, index) => (
                <span key={`${item}-${index}`} className="shrink-0" title={item}>
                  {level[item]}
                </span>
              ))}
            </div>

            {/* Bottom Row: Reviews, Stars, Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                  type="button"
                  onClick={fetchTutorReviews}
                  className={`flex h-[18px] w-[18px] items-center justify-center rounded-full transition-colors ${
                    showReviews ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
                  }`}
                  title="View reviews"
                >
                  <BsExclamationCircleFill size={16} />
                </button>
              <button 
                onClick={fetchTutorReviews}
                className="rounded border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-indigo-600 transition-colors hover:bg-indigo-100"
              >
                {reviewsList?.length || 0} REVIEWS
              </button>

              <div className="flex items-center gap-1.5">
                <RatingStars rating={averageRating} />
                <span className="text-[13px] font-bold text-slate-800 ml-0.5">
                  {averageRating}
                </span>
              </div>

              {/* Info Icon (View Reviews) */}
              <div className="relative" ref={popoverRef}>
                

                {/* Reviews Fetch Popover */}
                <AnimatePresence>
                  {showReviews && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.15 }}
                      className="absolute -left-12 top-[calc(100%+10px)] z-50 w-72 overflow-hidden rounded-md border border-slate-200 bg-white shadow-xl  "
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-2">
                        <h4 className="text-xs font-bold text-slate-800">
                          Reviews <span className="font-medium text-slate-500">({reviewsList?.length || 0})</span>
                        </h4>
                        <button onClick={() => setShowReviews(false)} className="text-slate-400 hover:text-red-500">
                          <IoClose size={16} />
                        </button>
                      </div>

                      <div className="max-h-64 overflow-y-auto p-2">
                        {loadingReviews ? (
                          <div className="flex justify-center py-6 text-xs font-bold text-slate-500">Fetching reviews...</div>
                        ) : reviewsList?.length > 0 ? (
                          <div className="flex flex-col gap-2">
                            {reviewsList.map((review, index) => (
                              <div key={index} className="rounded border border-slate-100 bg-white p-2.5 shadow-sm">
                                <div className="mb-1.5 flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-1.5">
                                    <RatingStars rating={review.rating} />
                                    <span className="rounded border border-slate-100 bg-slate-50 px-1 py-0.5 text-[10px] font-bold text-slate-700">
                                      {review.rating}
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-medium text-slate-400">
                                    {formatDate(review.createdAt)}
                                  </span>
                                </div>
                                <div className="flex justify-between text-[11px] text-slate-600">
                                  <span className="font-medium">Task: <span className="font-bold text-slate-800">{review.taskID}</span></span>
                                  {review.ratedBy && <span>By: <span className="font-semibold text-slate-700">{review.ratedBy}</span></span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-6 text-slate-400">
                            <BsExclamationCircleFill size={18} className="mb-1" />
                            <p className="text-xs font-medium">No reviews found.</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Right Area: Add, Status, Expand */}
        <div className="flex shrink-0 items-center gap-2 border-t border-slate-100 pt-2.5 sm:border-0 sm:pt-0">
          
          {/* Add Review Button */}
          <div className="relative" ref={addReviewRef}>
            <button
              type="button"
              onClick={() => setShowAddReview(!showAddReview)}
              className="flex h-[30px] w-[30px] items-center justify-center rounded border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 hover:text-indigo-600"
              title="Add Review"
            >
              <IoMdAdd size={16} />
            </button>

            <AnimatePresence>
              {showAddReview && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute right-0 top-[calc(100%+10px)] z-50 w-64 rounded-md border border-slate-200 bg-white p-3 shadow-xl "
                >
                  <h4 className="mb-3 text-xs font-bold text-slate-800">Add New Review</h4>
                  <form onSubmit={handleAddReview} className="flex flex-col gap-2 text-xs">
                    <input 
                      type="text" 
                      placeholder="Task ID" 
                      required
                      value={newReview.taskID}
                      onChange={(e) => setNewReview({...newReview, taskID: e.target.value})}
                      className="rounded border border-slate-200 px-2 py-1.5 outline-none focus:border-indigo-400"
                    />
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-slate-600">Rating:</label>
                      <input 
                        type="number" 
                        min="1" max="5" 
                        required
                        value={newReview.rating}
                        onChange={(e) => setNewReview({...newReview, rating: e.target.value})}
                        className="w-16 rounded border border-slate-200 px-2 py-1 outline-none focus:border-indigo-400"
                      />
                    </div>
                    <textarea 
                      placeholder="Optional comment..." 
                      rows="2"
                      value={newReview.comment}
                      onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                      className="resize-none rounded border border-slate-200 px-2 py-1.5 outline-none focus:border-indigo-400"
                    />
                    <div className="mt-1 flex justify-end gap-2">
                      <button 
                        type="button" 
                        onClick={() => setShowAddReview(false)}
                        className="rounded px-2.5 py-1.5 font-semibold text-slate-500 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        disabled={isSubmittingReview}
                        className="rounded bg-indigo-600 px-2.5 py-1.5 font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {isSubmittingReview ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Status Badge */}
          <span className={`inline-flex h-[30px] items-center gap-1.5 rounded border px-2.5 text-[10px] font-bold uppercase tracking-wide ${statusStyle.badge}`}>
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusStyle.dot}`} />
            {status}
          </span>

          {/* Expand Data Drawer */}
          <button
            type="button"
            onClick={() => setMoreTutorDetails(!moreTutorDetails)}
            className={`flex h-[30px] w-[30px] items-center justify-center rounded border transition-colors ${
              moreTutorDetails ? "border-indigo-200 bg-indigo-50 text-indigo-600" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            }`}
            title={moreTutorDetails ? "Hide details" : "Show details"}
          >
            {moreTutorDetails ? <FaAngleUp size={12} /> : <FaAngleDown size={12} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {moreTutorDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden border-t border-slate-100 bg-slate-50/50"
          >
            <div className="space-y-3 px-3 py-3">
              
              {/* Status Section */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-xl bg-white p-2.5 shadow-sm ring-1 ring-slate-100">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <MdOutlineUpdate size={18} />
                  </div>
                  <p className="text-[13px] font-bold text-slate-800">Tutor Status</p>
                </div>
                <select
                  value={status}
                  onChange={handleStatusChange}
                  className="h-9 min-w-[140px] rounded-lg border border-slate-200 bg-slate-50 px-3 text-[13px] font-bold capitalize text-slate-700 outline-none transition-all hover:bg-white focus:border-indigo-400 focus:bg-white focus:ring-[3px] focus:ring-indigo-500/10 cursor-pointer"
                >
                  <option value="new">New</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="warning 1">Warning 1</option>
                  <option value="warning 2">Warning 2</option>
                  <option value="warning 3">Warning 3</option>
                  <option value="delete">Delete</option>
                </select>
              </div>

              {/* Skills Section */}
              <div>
                <p className="mb-3 text-[13px] font-bold text-slate-800 uppercase tracking-wide">Expertise & Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {tutorData.expertSkills?.map((skill, index) => (
                    <span key={`expert-${index}`} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-[12px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-500/20">
                      <FaStar size={11} className="text-emerald-500" /> {skill}
                    </span>
                  ))}
                  {tutorData.intermediateSkills?.map((skill, index) => (
                    <span key={`intermediate-${index}`} className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-[12px] font-semibold text-amber-700 ring-1 ring-inset ring-amber-500/30">
                      <FaWrench size={11} className="text-amber-500" /> {skill}
                    </span>
                  ))}
                  {tutorData.beginnerSkills?.map((skill, index) => (
                    <span key={`beginner-${index}`} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-[12px] font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">
                      <FaTools size={11} className="text-slate-400" /> {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Background Details */}
              <div>
                <p className="mb-3 text-[13px] font-bold text-slate-800 uppercase tracking-wide">Background</p>
                <div className="grid gap-2 rounded-xl border border-slate-200/60 bg-white p-2.5 shadow-sm sm:grid-cols-2">
                  <div className="flex min-w-0 items-center gap-2.5 rounded-lg bg-slate-50 px-3 py-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-indigo-100 text-indigo-600">
                      <FaUserGraduate size={13} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Education</p>
                      <p className="truncate text-[13px] font-bold text-slate-700">{tutorData.highestDegree || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex min-w-0 items-center gap-2.5 rounded-lg bg-slate-50 px-3 py-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-indigo-100 text-indigo-600">
                      <FaBriefcase size={13} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Department</p>
                      <p className="truncate text-[13px] font-bold text-slate-700">{tutorData.department || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
};

export default TutorCard;