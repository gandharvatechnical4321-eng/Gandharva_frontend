import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
const AddComment = ({ taskId, executiveName, clientId, onClose,close }) => {
  const [comment, setComment] = useState("");
  const [deadline, setDeadline] = useState("");
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [loading, setLoading] = useState(false);

  const convertToLocalISOString = (date) => {
    if (!date) return "";
    const localDate = new Date(date);
    localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
    return localDate.toISOString().slice(0, 16);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!comment.trim()) {
      alert("Comment is required");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/comment/addcomment`,
        {
          taskID: taskId,
          executiveName,
          clientID: clientId,
          comment,
          deadline: deadline ? new Date(deadline) : new Date(),
        },
        {
          headers: { Authorization: `Bearer ${Cookies.get("token")}` },
        }
      );

      console.log("✅ Comment added:", response.data);
      alert("Comment added successfully!");
      setComment(""); // Clear input after submission
      setDeadline("");
      fetchComments(); // Refresh comments list
    } catch (error) {
      console.error("❌ Error adding comment:", error.response?.data || error.message);
      alert("Failed to add comment.");
    }
  };

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/comment/allcomment/${taskId}`,
        {
          headers: { Authorization: `Bearer ${Cookies.get("token")}` },
        }
      );
      setComments(response.data.comments);
    } catch (error) {
      console.error("❌ Error fetching comments:", error.response?.data || error.message);
      alert("Failed to load comments.");
    } finally {
      setLoading(false);
    }
  };
  console.log({close})
useEffect(()=>{

    setShowComments(!showComments);
    if (!showComments && close) fetchComments();
},[close])
  const handleStatusChange = async (commentId, newStatus) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/comment/${commentId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${Cookies.get("token")}` },
        }
      );
      // 🔥 Update the state without refetching the comments
    setComments((prevComments) =>
        prevComments.map((comment) =>
          comment._id === commentId ? { ...comment, status: newStatus } : comment
        )
      );
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
    //   fetchComments(); // Refresh comments list
    
    } catch (error) {
      console.error("❌ Error updating status:", error.response?.data || error.message);
      alert("Failed to update status.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        {/* Comments List */}
        <h3 className="text-lg font-semibold mb-2">Comments:</h3>
        {showComments && (
          <div className="mt-4 max-h-60 overflow-y-auto border-t pt-2">
            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : comments.length > 0 ? (
              comments.map((comment, index) => (
                <div key={index} className={`${comment.status==="cancel"?" from-red-300 to-red-100":comment.status==="done"?"from-green-300 to-green-100":"from-gray-300 to-gray-100"} bg-gradient-to-r bg-gray-100 p-2 rounded-md mb-2`}>
                  <p className="text-sm">
                    <strong>{comment.executiveName}</strong>: {comment.comment}
                  </p>
                  <p className="text-xs text-gray-500">
                    Deadline: {comment.deadline ? new Date(comment.deadline).toLocaleString() : "No Deadline"}
                  </p>

                  {/* Status Dropdown */}
                  <div className="mt-2 gap-4 flex"> 
                    <select
                      value={comment.status}
                      onChange={(e) => handleStatusChange(comment._id, e.target.value)}
                      className="w-fit active:border-0  mt-1 p-1 border-0 rounded-md focus:ring-0 bg-gray-100 bg-opacity-50"
                    >
                      <option value="pending">Pending</option>
                      <option value="done">Done</option>
                      <option value="cancel">Cancel</option>
                    </select>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No comments found.</p>
            )}
          </div>
        )}

        <h2 className="text-xl font-semibold mb-4">Add Comment</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          ></textarea>

          <input
            type="datetime-local"
            min={convertToLocalISOString(new Date())}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={convertToLocalISOString(deadline)}
            onChange={(e) => setDeadline(e.target.value)}
          />

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => {
                setShowComments(!showComments);
                if (!showComments) fetchComments();
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              {showComments ? "Hide Comments" : "Show Comments"}
            </button>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Comment
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddComment;
