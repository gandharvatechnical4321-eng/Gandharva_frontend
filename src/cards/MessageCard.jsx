import react, { useEffect, useState } from "react";
import { TiArrowForward } from "react-icons/ti";
// import ImageCard from "./imageCard"; 
import MediaDownloader from "./mediaDownloader";
import { useDispatch ,useSelector} from "react-redux";
import axios from "axios";
import Cookies from "js-cookie";
import { selectForward,selectMsgToForword,deselectMsgToForward,updateReplyMsg,removeMessage } from "../features/messagesSlice";
import { MdDelete } from "react-icons/md"; 

 import toast from "react-hot-toast";
const singleTick=<svg class="w-6 h-6 text-gray-700" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
 <path d="M8 12l3 3 7-7-1.41-1.41L11 12.17l-2.59-2.58L8 12z" />
</svg>
const doubleTick= <svg class="w-6 h-6 text-gray-700" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
 <path d="M8 12l3 3 7-7-1.41-1.41L11 12.17l-2.59-2.58L8 12z" /> 
 <path d="M10 14l3 3 7-7-1.41-1.41L13 14.17l-2.59-2.58L10 14z" />
</svg>
const doubleTickSeen=<svg class="w-6 h-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
 <path d="M8 12l3 3 7-7-1.41-1.41L11 12.17l-2.59-2.58L8 12z" />
 <path d="M10 14l3 3 7-7-1.41-1.41L13 14.17l-2.59-2.58L10 14z" />
</svg>
const failedMessage= <svg class="w-5 h-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
<path d="M13 7h-2v6h2V7zm0 8h-2v2h2v-2z" />
</svg> 

const MessageCard = ({msg})=>{
  const dispatch = useDispatch()
  const deviceDetails = useSelector(state=>state.contacts.deviceDetails)
  const [reply, setReply] = useState({msg:"loading...",time:"..."});
  const forwardMessage = useSelector((state)=>state.messages.forwardMessage)
  const selectForwardValue = useSelector((state)=>state.messages.selectForward)
  const selectedContact = useSelector((state) => state.contacts.selectedContact);
  const [mediaType,setMediaType] =  useState("") 
// Function to convert URLs and emails into clickable links
  const renderMessageWithLinks = (message) => {
    // Regex for URLs (http, https, or www)
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}(\/[^\s]*)?)/g;
    // Regex for emails
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})/g;
    // Regex for phone numbers (basic match, you can adjust this for more specific formats)
    const phoneRegex = /(\+?[0-9]{1,4}[-\s]?[0-9]+[-\s]?[0-9]+[-\s]?[0-9]+)/g;

    // Split the message into words and map over each word
    return message.split(' ').map((word, index) => {
      // If the word matches a URL
      if (urlRegex.test(word)) {
        // Prepend https:// if the word starts without a scheme
        const url = word.startsWith('http') || word.startsWith('https') ? word : `${word}`;
        return (
          <a
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {word}
          </a>
        );
      }

      // If the word matches an email
      if (emailRegex.test(word)) {
        return (
          <a
            key={index}
            href={`mailto:${word}`}
            className="text-blue-500 hover:underline"
          >
            {word}
          </a>
        );
      }

      // If the word matches a phone number (you can adjust the regex for better matching)
      if (phoneRegex.test(word)) {
        return (
          <a
            key={index}
            href={`tel:${word}`}
            className="text-blue-500 hover:underline"
          >
            {word}
          </a>
        );
      }

      // Return the word if it doesn't match any regex
      return `${word} `;
    });
  };
  
  const encryptSensitiveInfo = (message) => {
    const patterns = {
        email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/g,
        contactNumber: /(?<=\s|\+|^)(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{1,5}[\s.-]?\d{1,5}[\s.-]?\d{1,9}\b/g,
        // contactNumber: /\b(?:\+\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{1,5}[-.\s]?\d{1,5}[-.\s]?\d{1,5}\b/g, 
        upiID: /\b[A-Za-z0-9.-]+@[A-Za-z]+\b/g
    };

    return message
        .replace(patterns.email, (match) => maskString(match))
        .replace(patterns.contactNumber, (match) => maskPhone(match))
        .replace(patterns.upiID, (match) => maskString(match));
};

// Masking Functions
const maskString = (value) => {
  if (deviceDetails.role === "admin" || deviceDetails.role === "owner") {
    return value;
  }

  if (value === null || value === undefined) return "";

  const str = String(value);

  if (str.length <= 2) {
    return "#".repeat(str.length);
  }

  const visibleStart = 2;
  const visibleEnd = 2;

  const hidden = Math.max(
    0,
    str.length - visibleStart - visibleEnd
  );

  return (
    str.slice(0, visibleStart) +
    "#".repeat(hidden) +
    str.slice(-visibleEnd)
  );
};

const maskPhone = (str) => {
  if (deviceDetails.role === "admin" ||
deviceDetails.role === "owner" ) return str;
  if (str.length <= 7) return str;
  return str.substring(0, 2) + "#".repeat(str.length - 6) + str.slice(-2);
};

function formatMsg(message) {
  // ✅ Detect and format URLs first
  message = message.replace(
    /(https?:\/\/[^\s]+)/g,
    `<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline break-all">$1</a>`
  );
 

  // ✅ Now encrypt sensitive info (emails, phone numbers, UPI)
  message = encryptSensitiveInfo(message);

  // ✅ Format phone numbers (only detect if preceded by a space to avoid detecting inside URLs)
  message = message.replace(
    /(?<=\s)(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g,
    (phone) => {
      if (phone.length > 9 && phone.length < 14 && deviceDetails.role === "user") return `&&&&&&&&`;
      return `<a href="tel:${phone}" class="text-blue-500">${phone}</a>`; 
    }
  );  

  // Format bold text
  message = message.replace(/\*(.*?)\*/g, "<strong>$1</strong>");

  // Format strikethrough text
  message = message.replace(/~(.*?)~/g, "<del>$1</del>");

  // Handle new lines
  message = message.replace(/\n/g, "<br />");

  return message;
}


 

useEffect(()=>{
  const showMediaType=()=>{
    const mediaTypes = ['audio', 'image', 'video', 'document', 'sticker'];
    for(const type of mediaTypes ){
      if(msg.message?.type==type && msg.message[type].id){
            setMediaType(type) 
      }
    }
  }
  showMediaType()
},[msg])  
       

useEffect(() => {
  if (msg?.message?.context?.id && !msg.replyMsg) {
    replyMessage(msg.message.context.id);
    console.log("reply msg is called")
  } else {
    setReply("Not found");
  }
}, [msg]);

const replyMessage = async (id) => {
  try {
    const res = await axios.post(
      `${process.env.REACT_APP_BACKEND_URL}/api/getPostDataOnMongo/replymessage`,
      { message_id: id },
      {
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`, // Fetch token from cookies
      },
      }
    );
    
    if (res.data.message) {
      const message = res.data.message[0].message;
      dispatch(updateReplyMsg({ chatId:msg.contact_id, messageId:msg.message_id, replyMsg:{msg:message.type ==="text" ? message.text.body.length>100?`${message.text.body.slice(0,99)}......`:message.text.body : message.type,time:res.data.message[0].timestamp}}))
      setReply({msg:message.type ==="text" ? message.text.body : message.type,time:res.data.message[0].timestamp});
    } else {
      setReply("Message is not existing...");
    }
  } catch (error) {
    setReply("Error fetching message");
    console.error("Error fetching reply:", error);
  }
}; 
 // Delete contact Function
     const deleteMessage = async (_id) => {
      if (!window.confirm("Are you sure you want to delete this contact?")) return; // Ask for confirmation
      try {
        const response = await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/getPostDataOnMongo/delete/${_id}`,{
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`, // Fetch token from cookies
        },
        });
        
        // console.log({pineddddd:response.data.contact})
        if(response.data){
          dispatch(removeMessage({chatId:selectedContact._id,message_id:_id}))
          toast.success(response.data.message,{duration:2000,style:{backgroundColor:"green",color:"whitesmoke"}});
        }
  
      } catch (error) {
        console.error("Error deleting contact:", error);
      }
    };
  // if(msg?.message?.context?.id)console.log({msg})
    return(
     
          <div
        key={msg.message_id}
        className={`flex mt-1  overscroll-auto text-wrap ${msg.direction === 'sent' ? 'justify-end' :msg.direction === 'received' ? 'justify-start':'justify-center'}`}
      >
         {selectForwardValue && <input className="cursor-pointer" checked={!!forwardMessage.find(item=>item.message_id==msg.message_id)}  type="checkbox" onChange={(e)=>{if(e.target.checked)dispatch(selectMsgToForword(msg));else dispatch(deselectMsgToForward(msg));}}/>}
        <div
          className={`max-w-xs px-2 group  py-0 rounded-lg ${
            msg.direction === 'sent' ? 'bg-slate-300' :msg.direction === 'received'? 'bg-gray-200  text-sm':msg.direction === 'sent'?'text-gray-400 bg-gray-100  text-sm':'text-gray-400 bg-gray-100 text-xs'
          }`}
        > 
         
          {msg.direction==="sent" && <span className="text-xs italic text-green-700 underline font-bold">{msg?.messageSenderName? msg?.messageSenderName:"NA"}</span>}
        {(Cookies.get("role") === "admin" ||Cookies.get("role") === "owner") && <button onClick={()=>deleteMessage(msg.message_id)} className="text-red-600 active:text-red-700 float-right  opacity-0   group-hover:opacity-100 transition-opacity duration-3000"><MdDelete size={15}/></button>} 
        
        {msg.message?.context && <div className="bg-white  rounded-sm p-1 ">
          <p className="text-xs text-wrap text-gray-800">{(msg?.replyMsg?.msg)?msg?.replyMsg?.msg:"loading..."}</p>
          <p className="text-[9px] right-0 w-full text-gray-800 bg-white px-1 font-semibold text-wrap"> {new Date(msg?.replyMsg?.time).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                    timeZone: 'Asia/Kolkata'
                  })}</p>
        </div>}
             {mediaType && msg.message?.type!=='text' && <MediaDownloader filename={msg.message[mediaType]?.filename} mimetype={msg.message[mediaType]?.mime_type} mediaId={msg.message[mediaType]?.id} mediaType={msg.message?.type}/>} 
          {/* <p className="text-wrap">{(msg.message?.type=='text')?renderMessageWithLinks(msg.message?.text.body):(msg?.message[mediaType]?.caption)?renderMessageWithLinks(msg?.message[mediaType]?.caption):""}</p> */}
          <p className="text-wrap min-w-24" dangerouslySetInnerHTML={{ __html: formatMsg(
         msg.message?.type === 'text'
        ? msg.message?.text.body
        : msg?.message[mediaType]?.caption || ""
) }} />
        <span className="flex text-end text-[8px] font-semibold text-blue-900 float-end">{msg.direction !== 'both'&& 
           new Date(msg.timestamp).toLocaleString('en-IN', {
                    // day: '2-digit',
                    // month: '2-digit',
                    // year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                    timeZone: 'Asia/Kolkata'
                  })}
           {msg.direction=="received"?"":( msg.status==-1)? failedMessage:msg.status==1?singleTick:msg.status==2?doubleTick:msg.status>2?doubleTickSeen:""} </span>
        </div>
          {msg.direction !== "both" && (
  <button
    type="button"
    title="Select message to forward"
    className="ml-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-indigo-500 transition hover:bg-indigo-100 hover:text-indigo-700"
    onClick={() => {
      const alreadySelected =
        forwardMessage.some(
          (item) =>
            item.message_id === msg.message_id
        );

      dispatch(selectForward(true));

      if (alreadySelected) {
        dispatch(
          deselectMsgToForward(msg)
        );
      } else {
        dispatch(
          selectMsgToForword(msg)
        );
      }
    }}
  >
    <TiArrowForward size={23} />
  </button>
)}
      </div>
     
    )


}

export default MessageCard