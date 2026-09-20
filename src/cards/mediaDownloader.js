import React, { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useRef } from "react";
import mediaTypes from "./AllMediaTypes";
import { MdDownloading } from "react-icons/md";
import { MdDownloadForOffline } from "react-icons/md";
const MediaDownloader = ({filename, mimetype, mediaId, mediaType }) => {
  const [mediaUrl, setMediaUrl] = useState(null); // State to store the downloaded media URL
  const [loadingMedia,setLoadingMedia]=useState(false)
// Function to find the extension by type and mimeType
function getExtension(type, mimeType) {
  const category = mediaTypes[type];
  if (!category) {
    return `Invalid type: ${type}`; // Type not found
  }

  const media = category.find(item => item.mimeType === mimeType);
  if (media) {
    return media.extension;
  } else {
    return `MimeType ${mimeType} not found in ${type}`; // mimeType not found in the type category
  }
}

  const downloadMedia = async () => {
    try {
      setLoadingMedia(true)
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/getPostDataOnMongo/download-media/${mediaId}`,
        {
          responseType: "blob", // Ensure binary data is handled correctly
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`, // Fetch token from cookies
        },
        }
      );
        // Get the file type from the custom header
    // const fileType = response.headers;
    // console.log("File Type:");
      // Create a blob URL for the downloaded media
      const blob = new Blob([response.data]);
      
      const url = window.URL.createObjectURL(blob);
      setMediaUrl(url); // Update the state with the media URL
      const download= filename?filename:mediaType + getExtension(mediaType,mimetype)
 
      // Create a download link
      console.log({download})
      const link = document.createElement("a");
      link.href = url;
      console.log({mediaId,mediaType})
      link.setAttribute("download",`${download}`); // File name with extension
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      setLoadingMedia(false)
    } catch (error) {
      setLoadingMedia(false)
      console.error("Error downloading media:", error);
    }
  };

  // Render the appropriate preview for each media type
  const renderPreview = () => {
    if (!mediaUrl) return null;

    switch (mediaType) {
      case "image":
        return (
          <img
            src={mediaUrl}
            alt="Downloaded"
            className="mt-2 w-64 h-auto rounded-lg shadow-md"
          />
        );
      case "audio":
        return (
          <audio
            controls
            className="mt-2 w-64 rounded-lg shadow-md"
            src={mediaUrl}
          />
        );
      case "video":
        return (
          <video
            controls
            className="mt-2 w-64 rounded-lg shadow-md"
            src={mediaUrl}
          />
        );
      case "document":
        return (
         
           <p> Document is downloaded</p>
          
        );
      case "sticker":
        return (
          <img
            src={mediaUrl}
            alt="Downloaded Sticker"
            className="mt-2 w-32 h-32 rounded-lg shadow-md"
          />
        );
      default:
        return (
          <p className="text-red-500 mt-2">Unsupported media type: {mediaType}</p>
        );
    }
  };

  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      // Scroll to the rightmost side (end of content)
      containerRef.current.scrollLeft = containerRef.current.scrollWidth;
    }
  }, [filename, mediaType]); // Update scroll position when content changes

  return (
    <div  ref={containerRef}  className="flex overflow-auto text-wrap justify-between bg-slate-100 p-2">
      <div  className="text-wrap">{filename?filename:`${mediaType}`}</div>
      <div className="flex flex-col">
      <a
        onClick={downloadMedia}
        className="text-indigo-500 underline cursor-pointer hover:text-indigo-600 active:text-indigo-800 active:scale-110 transition"
      >
        {/* {mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} */}
        {loadingMedia?<MdDownloading size={23}/>:<MdDownloadForOffline size={23}/>}
      </a>

      {/* Display the downloaded media preview */}
      <p>{renderPreview()}</p>
      </div>
    </div>
  );
};

export default MediaDownloader;
