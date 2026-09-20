import React, { useState, useRef, useEffect } from "react";
import Draggable from "react-draggable";
import axios from "axios";
import Cookies from "js-cookie";
import { FiFilter } from "react-icons/fi"; // Import filter icon
import toast from "react-hot-toast";
const AllComments = ({showAllComments, setShowAllComents }) => {
  const nodeRef = useRef(null);
  const [comments, setComments] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);


  //copy
const copyToClipboard = (data) => {
    try {
      const formattedData = typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);
      navigator.clipboard.writeText(formattedData).then(() => {
        toast.success("🎉 Selected data Coppied!", {
          duration: 2000, // Time before disappearing (4 seconds)
          position: "top-center", // Change position
          style: {
            background: "#10B981", // Green background
            color: "white", // White text
            fontWeight: "bold",
            padding: "16px",
            borderRadius: "8px",
          },
        });
      }).catch((err) => {
        console.error('Failed to copy data: ', err);
      });
    } catch (error) {
      console.error('Error formatting data: ', error);
    }
  };
  // Fetch comments
  
  useEffect(() => {
  const fetchComments = async () => {
    setLoading(true);
    try { 
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/comment/search`,
        {
          params: { search, status: statusFilter, page, limit: 6 },
          headers: { Authorization: `Bearer ${Cookies.get("token")}` },
        }
      ); 
      setComments(response.data.comments);
      setTotalPages(response.data.totalPages);
    } catch (error) {
        alert("error")
      console.error("❌ Error fetching comments:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

      if(showAllComments)fetchComments();
  }, [page]); // Re-fetch on page/status change

  useEffect(() => {
    const fetchComments = async () => {
      setPage(1)
      setLoading(true);
      try { 
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/comment/search`,
          {
            params: { search, status: statusFilter, page, limit: 6 },
            headers: { Authorization: `Bearer ${Cookies.get("token")}` },
          }
        ); 
        setComments(response.data.comments);
        setTotalPages(response.data.totalPages);
      } catch (error) {
          alert("error")
        console.error("❌ Error fetching comments:", error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };
  
        if(showAllComments)fetchComments();
    }, [search, statusFilter]); // Re-fetch on page/status change
  
  // Status Change Handler
  const handleStatusChange = async (commentId, newStatus) => {
    try {
     const result= await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/comment/${commentId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${Cookies.get("token")}` },
        }
      );
      if(result.data){
        toast.success(`✅ Status updated to: ${newStatus}`,{
            duration: 2000, // Time before disappearing (4 seconds)
            position: "top-center", // Change position
            style: {
              background: "green", // Green background
              color: "white", // White text
              fontWeight: "",
              padding: "12px",
              borderRadius: "2px",
            },}) 
      }
      setComments((prev) =>
        prev.map((comment) =>
          comment._id === commentId ? { ...comment, status: newStatus } : comment
        )
      );
    } catch (error) {
      console.error("❌ Error updating status:", error.response?.data || error.message);
    }
  };

  return (
    <Draggable nodeRef={nodeRef}>
      <div
        ref={nodeRef}
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      >
        <div className="bg-white p-6 rounded-lg shadow-lg w-[50vw]">
          <h2 className="text-xl font-semibold mb-3 text-center">All Comments</h2>

          {/* Search Bar with Filter Icon */}
          <div className="flex items-center space-x-2 mb-3">
            <input
              type="text"
              placeholder="Search by Task ID or Client ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 p-2 border rounded-md"
            />
            <div className="relative">
              <button
                onClick={() => setShowFilter(!showFilter)}
                className="p-2 bg-gray-200 rounded-md"
              >
                <FiFilter size={18} />
              </button>

              {showFilter && (
                <div className="absolute right-0 mt-2 w-32 bg-white shadow-md border rounded-md p-2">
                  <button
                    className="block w-full text-left p-2 hover:bg-gray-100"
                    onClick={() => {
                      setSearch("");
                      setShowFilter(false);
                    }}
                  >
                    All Status
                  </button>
                  <button
                    className="block w-full text-left p-2 hover:bg-gray-100"
                    onClick={() => {
                      setSearch("pending");
                      setShowFilter(false);
                    }}
                  >
                    Pending
                  </button>
                  <button
                    className="block w-full text-left p-2 hover:bg-gray-100"
                    onClick={() => {
                      setSearch("done");
                      setShowFilter(false);
                    }}
                  >
                    Done
                  </button>
                  <button
                    className="block w-full text-left p-2 hover:bg-gray-100"
                    onClick={() => {
                        setSearch("cancel");
                      setShowFilter(false);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Comments List */}
          <div className="h-[70vh] overflow-y-auto">
            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : comments.length > 0 ? (
              comments.map((comment, index) => (
                <div
                  key={index}
                  className={`p-2 rounded-md mb-2 
                  ${comment.status === "cancel" ? "bg-red-100" : comment.status === "done" ? "bg-green-100" : "bg-gray-100"}`}
                >
                  
                  <div className="flex justify-between">
                  <p className="text-sm">
                    <strong>{comment.executiveName}</strong>: {comment.comment}
                  </p>
                     {/* Status Dropdown */}
                  <select
                    value={comment.status}
                    onChange={(e) => handleStatusChange(comment._id, e.target.value)}
                    className="mt-1 px-1 w-fit border rounded-md bg-indigo-200 bg-opacity-50"
                  >
                    <option value="pending">Pending</option>
                    <option value="done">Done</option>
                    <option value="cancel">Cancel</option>
                  </select>

                  </div>
                  


                  <div className="flex justify-between">
                   <div className="flex gap-2">
                     <button onClick={()=>copyToClipboard(comment.taskID)} className="text-xs font-semibold hover:bg-gray-200 p-1 rounded-lg">{comment.taskID}</button>
                    <button onClick={()=>copyToClipboard(comment.clientID)} className="text-xs font-semibold hover:bg-gray-200 p-1 rounded-lg">{comment.clientID}</button>
                  <p className="text-xs text-gray-500">
                    Deadline: {comment.deadline ? new Date(comment.deadline).toLocaleString() : "No Deadline"}
                  </p>
                  </div>
                  <p className="text-gray-600 italic text-xs float-right">{new Date(comment.createdAt).toLocaleString()}</p>
                  </div>

                 
                </div>
              ))
            ) : (
              <p className="text-gray-500">No comments found.</p>
            )}
          </div>

          {/* Pagination & Cancel Button */}
          <div className="mt-3 flex justify-between items-center">
            <button
              disabled={page <= 1}
              onClick={() => setPage((prev) => prev - 1)}
              className="px-3 py-1 bg-gray-300 rounded-md disabled:opacity-50"
            >
              Prev
            </button>
            <p className="text-sm">
              Page {page} of {totalPages}
            </p>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => prev + 1)}
              className="px-3 py-1 bg-gray-300 rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>

          {/* Cancel Button */}
          <button
            onClick={()=>setShowAllComents(false)}
            className="mt-4 w-full p-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Close
          </button>
        </div>
      </div>
    </Draggable>
  );
};

export default AllComments;
