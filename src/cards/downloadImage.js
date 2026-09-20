import React from "react";
import axios from "axios";
import { useState } from "react";
const ImageDownloader = ({ mediaId }) => {
    const [imageUrl, setImageUrl] = useState(null); // State to store the downloaded image URL

  const downloadImage = async () => {
    try {
        console.log({mediaId})
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/getPostDataOnMongo/download-media/${mediaId}`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`, // Fetch token from cookies
      },
        responseType: "blob", // Ensure binary data is handled correctly
      });

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      setImageUrl(url); // Update the state with the image URL

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${mediaId}.jpg`); // Image file name
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  return (
    <div className="p-1">
      <a
        onClick={downloadImage}
        className=" text-blue-500 underline cursor-pointer  hover:text-blue-600 transition"
      >
        Download Image
      </a>

      {/* Display the image if it is downloaded */}
      {imageUrl && (
        <div className="mt-2">
          <p className="text-gray-700">Downloaded Image:</p>
          <img
            src={imageUrl}
            alt="Downloaded"
            className="mt-2 w-64 h-[200px] rounded-lg shadow-md"
          />
        </div>
      )}
    </div>
  );
};

export default ImageDownloader;
