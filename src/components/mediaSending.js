import React, { useState } from "react";
import axios from "axios";
import { MdCancel } from "react-icons/md";
import Cookies from "js-cookie";
import { useDispatch, useSelector } from 'react-redux';
import { addMessage, setMessages, updateStatus } from '../features/messagesSlice';
import { addContact, updateLastMessageId } from '../features/contactsSlice';
const SendMediaForm = ({setMediaOn}) => { 
  const dispatch = useDispatch();
  const [mediaType, setMediaType] = useState("image");
  const [caption, setCaption] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [status, setStatus] = useState("");
  const selectedContact = useSelector((state) => state.contacts.selectedContact);
  console.log({mediaFile:mediaFile?.name})
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Sending...")
    if (!selectedContact || !mediaType || !mediaFile) {
      setStatus("All fields are required.");
      return;
    }

    const formData = new FormData();
    formData.append("recipient", selectedContact.phone_number);
    formData.append("mediaType", mediaType);
    formData.append("caption", caption);
    formData.append("file", mediaFile);
    formData.append("filename", mediaFile?.name);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/getPostDataOnMongo/send-media`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data", 
              "Authorization": `Bearer ${Cookies.get("token")}`, // Fetch token from cookies
          },
        }
      );
      console.log(response.data)

      if(response.data){
        setStatus("Media sent successfully!");
        const data= response.data
        data.contact.last_message_id = data?.savedMessage
        dispatch(addContact(data.contact));
        dispatch(addMessage({ chatId:data.savedMessage.contact_id, message:data.savedMessage }));
      setMediaOn(false);
      }
        
    } catch (error) {
      console.error("Error sending media:", error);
      setStatus("Failed to send media.");
    }
  };
  
  return (
    <div className="max-w-md absolute top-52 right-0 left-0 bg-slate-200 mx-auto mt-10 p-4 border border-gray-200 rounded-lg shadow-sm">
      <div className="flex justify-between">
        <h2 className="text-xl font-semibold text-indigo-500 mb-4">Send Media</h2>
      <button onClick={()=>setMediaOn(false)}><MdCancel size={25} color="red"/></button></div>
      <form onSubmit={handleSubmit} className="space-y-4">
         
        <div>
          <label className="block text-sm font-medium text-gray-700">Media Type</label>
          <select
            className="w-full mt-1 p-2 border rounded-md"
            value={mediaType}
            onChange={(e) => setMediaType(e.target.value)}
          >
            <option value="image">Image</option>
            <option value="video">Video</option>
            <option value="audio">Audio</option>
            <option value="document">Document</option>
            <option value="sticker">Sticker</option>
          </select>
        </div>
        {(mediaType === "image" || mediaType === "video") && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Caption</label>
            <input
              type="text"
              className="w-full mt-1 p-2 border rounded-md"
              placeholder="Enter Caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700">Media File</label>
          <input
            type="file"
            className="w-full mt-1"
            onChange={(e) => setMediaFile(e.target.files[0])}
            required
          />
        </div>
        <button
        disabled={status==="Sending..."}
          type="submit"
          className="w-full py-2 px-4 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition"
        >
          {status==="Sending..."?"Sending...":"Send Media"}
        </button>
      </form>
      {status && <p className="mt-4 text-sm text-gray-700">{status}</p>}
    </div>
  );
};

export default SendMediaForm;
