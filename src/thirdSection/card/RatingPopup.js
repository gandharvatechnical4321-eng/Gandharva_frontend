import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import Cookies from "js-cookie";

const RatingPopup = ({tutorID, taskID,  setOnClose }) => {
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const submitRating = async () => {
    if (rating === 0) {
      setError("Please select a rating before submitting.");
      return;
    }
    setLoading(true);
    setError(null);
    
    try {
      if(!tutorID){
        toast.error("Tutor Is not assigned...",{
          duration: 2000, // Time before disappearing (4 seconds)
          position: "top-center", // Change position
          style: {
            background: "hotpink", // Green background
            color: "white", // White text
            fontWeight: "bold",
            padding: "12px",
            borderRadius: "8px",
          }})
      }
        console.log({tutorID, taskID, rating })
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/tutor/rate-tutor`, {tutorID, taskID, rating },{
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`, // Fetch token from cookies
      }
      });
       if(response.data.message){
        toast.success("Tutor Rating updated...",{
          duration: 2000, // Time before disappearing (4 seconds)
          position: "top-center", // Change position
          style: {
            background: "green", // Green background
            color: "white", // White text
            fontWeight: "bold",
            padding: "12px",
            borderRadius: "8px",
          }})
       }else{
        alert("Somthing is wrong contact devloper..")
       }
      setOnClose(false); // Close the popup after success
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed z-30 inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
        <h2 className="text-lg font-semibold mb-4">Rate the Tutor</h2>
        
        <div className="flex justify-center mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar 
              key={star}
              size={30} 
              className={`cursor-pointer ${star <= rating ? "text-yellow-500" : "text-gray-300"}`}
              onClick={() => setRating(star)}
            />
          ))}
        </div>
        
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        
        <button 
          className="bg-indigo-500 text-white px-4 py-2 rounded-md w-full hover:bg-indigo-600 disabled:opacity-50"
          onClick={submitRating} 
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
        
        <button 
          className="mt-2 text-gray-500 underline w-full" 
          onClick={()=>setOnClose(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default RatingPopup;
