import { useState ,useEffect} from "react";
import { useDispatch, useSelector } from 'react-redux';
import {togglePin, setContacts,selectContact, unreadZero  ,setTotalContactPage,setSearchContact,setShowAllTutorData } from '../features/contactsSlice';
import { FaAngleDown } from "react-icons/fa6";
import { addContact, updateLastMessageId } from '../features/contactsSlice';
import { addMessage, setMessages,selectForward,setOlderMessages } from '../features/messagesSlice';
import { motion } from "framer-motion";
import { RiCoinFill } from "react-icons/ri";//one contact_id
import { GiTwoCoins } from "react-icons/gi";//two contact_id
import { FaCoins } from "react-icons/fa6";//multi coin
import { FaGrinAlt } from "react-icons/fa";
import { GiTeacher } from "react-icons/gi";
import { MdOutlineMarkUnreadChatAlt } from "react-icons/md";
import Cookies from "js-cookie";
import AllComments from "../comment/AllComents";
import { FaComments } from "react-icons/fa";
import { Toaster, toast } from "react-hot-toast";
import { FaSearch, FaPaperPlane } from 'react-icons/fa';
import { MdCallReceived } from "react-icons/md";
import axios from "axios";
import AllTutorList from "../tutorDashboard/AllTutorList";
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
const UserCard = ({})=>{
  let [unreadOff,setUnreadOff] = useState(1)
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [addName, setAddName] = useState("");
  const [addContactNumber, setAddContactNumber] = useState("+91");
  const [addTemplate, setAddTemplate] = useState("/plsreply");
  const [sending, setSending] = useState(false);
  const [unread,setUnread]=  useState(false)
  const [showAllComments,setShowAllComents]=useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const searchContact= useSelector(state=>state.contacts.searchContact)
  const deviceDetails = useSelector(state=>state.contacts.deviceDetails)
  const [currentContactPage,setCurrentContactPage] = useState(1)
  let timeoutId = null; // Store timeout reference
    const [contactLimit] = useState(10); // Number of items per page
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  //####################to change to mark of the particular contacts #######################################################
  const [markMoney,setMarkMoney] = useState(false)
  const handleMouseEnterForMark = (id) => {
    if (timeoutId) clearTimeout(timeoutId); // Prevent closing if user moves back quickly
    setMarkMoney(id);
  };
  
  const handleMouseLeaveForMark = (id) => {
    timeoutId = setTimeout(() => {
      setMarkMoney(id);
    }, 500); // 2 seconds delay before closing
  };

async function updateContactMark(chatId, mark) {
  
  const allowedMarks = ['bed', 'unknown', 'average', 'good'];
  if (!allowedMarks.includes(mark)) {
    throw new Error('Invalid mark value');
  }
   
  try {
    const response = await axios.patch(`${process.env.REACT_APP_BACKEND_URL}/api/getPostDataOnMongo/mark`, { chatId, mark });
    return response.data;
  } catch (error) {
    console.error('Error updating contact mark:', error);
    // Axios puts server errors under `error.response.data`
    throw new Error(
      error.response?.data?.error || 'Failed to update mark'
    );
  }
}

const handleMarkUpdate = async (chatId, mark) => {
  try {
     
    const result = await updateContactMark(chatId, mark);
    console.log(result.message);
  } catch (error) {
    alert(error.message);
  }
};

  // ##############################################################################################################
  const handleMouseEnter = (id) => {
    if (timeoutId) clearTimeout(timeoutId); // Prevent closing if user moves back quickly
    setDropdownOpen(id);
  };
  
  const handleMouseLeave = (id) => {
    timeoutId = setTimeout(() => {
      setDropdownOpen(id);
    }, 500); // 2 seconds delay before closing
  };
  const dispatch = useDispatch();
  const contacts = useSelector((state) => state.contacts.contacts);
  const selectedContact = useSelector((state) => state.contacts.selectedContact);
  const totalContactPage = useSelector((state) => state.contacts.totalContactPage);
 
  // Add new contact/message handler

   const handleSendAddMsg = async () => {   
        setSending(true);
        try {
            if(!addContactNumber || !addTemplate || !addName){
                toast.error("Fill all details");
                setSending(false);
                return;
            }
            const response = await axios.post(
                `${process.env.REACT_APP_BACKEND_URL}/api/getPostDataOnMongo/sendfirstmessage`,
                {
                    phone_number:addContactNumber,
                    message:{
                        type:'text',
                        text:{body: addTemplate}
                    },
                    direction:"sent",
                    components:[],
                    name:addName
                },
                {
                    headers: { 'Content-Type': 'application/json',
                        Authorization: `Bearer ${Cookies.get("token")}`,
                    },
                }
            );
            let data=response.data.contact;
            data.last_message_id=response.data.savedMessage;
            console.log(data);
            if(data){
                dispatch(addContact(data));
                dispatch(addMessage({ chatId:response.data.savedMessage.contact_id, message:response.data.savedMessage }));
                toast.success("Message sent successfully!");
                setShowAddPopup(false);
                setAddName("");
                setAddContactNumber("");
                setAddTemplate("");
            }
        } catch (error) {
            toast.error('Error sending message: ' + (error.response?.data?.error || error.message));
            console.error('Error sending message:', error.response?.data || error.message);
        } finally {
            setSending(false);
        }
      };
  const fetchContactData = async (query, page) => {
    try {
       
      const skip = (page - 1) * contactLimit;
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/getPostDataOnMongo/searchcontact?q=${query}&skip=${skip}&limit=${contactLimit}`,
        {
          headers: {
              Authorization: `Bearer ${Cookies.get("token")}`, // Fetch token from localStorage
          },
      }      
      );
      const { data, pagination } = response?.data || {};
      console.log({data})
      dispatch(setContacts(data || []));
      dispatch(setTotalContactPage(Math.ceil(pagination.total / contactLimit))); // Calculate total pages
       
    } catch (err) {
      if (err.status === 401) {
        window.location.reload(); // Refresh the page if token is invalid
        return;
      }
      console.error("Error fetching tutor data:", err.status);
      toast.error("Failed to fetch tutor data.");
    }
  };
 
  // Fetch tutors based on the search term and page
  const fetchUnreadContact = async (query, page) => {
    if(unread){
      setUnread(false)
      setUnreadOff(e=>e+1);
      return;
    }
    try {
       setUnread(true)
      const skip = (page - 1) * contactLimit;
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/getPostDataOnMongo/unread`,{
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`, // Fetch token from cookies
      },
      });
      const { data } = response?.data || [];
      dispatch(setContacts(data || []));
      // dispatch(setTotalContactPage(Math.ceil(pagination.total / contactLimit))); // Calculate total pages
       
    } catch (err) {
      console.error("Error fetching tutor data:", err);
      toast.error("Failed to fetch tutor data.");
    }
  };
  
  // Fetch tutors on search term or page change (debounced)
    useEffect(() => {
      const delayDebounce = setTimeout(() => {
        if(searchContact!=="" ||searchContact===""|| currentContactPage!==1 || contacts.length===0)fetchContactData(searchContact, currentContactPage);
      }, 1000); // Delay the API call for 500ms
      return () => clearTimeout(delayDebounce);
    }, [ currentContactPage]);
    
    useEffect(() => {
      const delayDebounce = setTimeout(async() => {
        await setCurrentContactPage(1)
        if(searchContact!=="" ||searchContact===""|| currentContactPage!==1 || contacts.length===0)fetchContactData(searchContact, currentContactPage);
      }, 1000); // Delay the API call for 500ms
      return () => clearTimeout(delayDebounce);
    }, [searchContact,unreadOff]);

    const handleNextPage = () => {
      if (currentContactPage < totalContactPage) {
        setCurrentContactPage((prevPage) => prevPage + 1);
      }
    };

    const handlePrevPage = () => {
      if (currentContactPage > 1) {
        setCurrentContactPage((prevPage) => prevPage - 1);
      }
    };

    
  //to formate the date
  function formatDate(timestamp) {
    const inputDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isToday = inputDate.toDateString() === today.toDateString();
    const isYesterday = inputDate.toDateString() === yesterday.toDateString();
   

    if (isToday) {
        // Return time in "hh:mm am/pm" format
        const hours = inputDate.getHours();
        const minutes = inputDate.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'pm' : 'am';
        const formattedHours = hours % 12 || 12; // Convert 24-hour to 12-hour format
        return `${formattedHours}:${minutes}${ampm}`;
    } else if (isYesterday) {
        return "yesterday";
    } else {
        // Return date in "DD-MM-YYYY" format
        const day = inputDate.getDate().toString().padStart(2, '0');
        const month = (inputDate.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
        const year = inputDate.getFullYear();
        return `${day}-${month}-${year}`;
    }
}
  
  //to copy any data 
  const copyToClipboard = (data) => {
    try {
      const formattedData = typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);
      navigator.clipboard.writeText(formattedData).then(() => {
        toast.success("🎉 Selected ID Coppied!", {
          duration: 2000, // Time before disappearing (4 seconds)
          position: "top-left", // Change position
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
  // //to fetch all the users details 
  // useEffect(()=>{   
      
  //   const getContacts=async ()=>{
  //     console.log("contact api is called")
  //     const result= await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/getPostDataOnMongo/contacts`)
  //   dispatch(setContacts(result.data));
  //   console.log({resultasasa:result.data})
  //   }
  //   if(!contacts.length)getContacts()
  // },[dispatch]) 

  //when one contact is selected
  const handleContactClick =async (contact) => {
    dispatch(setSearchContact(""))
   await dispatch(selectContact(contact)); // Save selected contact details
    console.log({selectedContact})
    if(contact.unread_count){
      const token = Cookies.get("token")
      console.log({token})
      const resp=await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/getPostDataOnMongo/contacts/${contact._id}/reset-unread`,{},{
        headers: { Authorization: `Bearer ${token}` },
    })
      console.log({ressss:resp.data})
      if(resp.data){
           dispatch(unreadZero(contact));
      }
    }
   
  };


    // Toggle Pin Function
    const togglePinFunction = async (_id) => {
      try {
        const response = await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/getPostDataOnMongo/toggle-pin/${_id}`,{},{
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`, // Fetch token from cookies
        },
        });
        // console.log({pineddddd:response.data.contact})
        if(response.data)toast.success(response.data.message,{duration:2000,style:{backgroundColor:"green",color:"whitesmoke"}})
        dispatch(togglePin(_id))
        setUnreadOff(e=>e+1);
      } catch (error) {
        console.log("Error toggling pin:", error);
      }
    };
     // delete chats Function
     const deleteChat = async (_id) => {
      if (!window.confirm("Are you sure you want to delete this contact?")) return; // Ask for confirmation
      try {
        const response = await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/getPostDataOnMongo/delete-chat/${_id}`,{
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`, // Fetch token from cookies
        },
        });
        // console.log({pineddddd:response.data.contact})
        if(response.data)toast.success(response.data.message,{duration:2000,style:{backgroundColor:"green",color:"whitesmoke"}})
 
        setUnreadOff(e=>e+1);
      } catch (error) {
        console.log("Error deliting chats:", error);
      }
    };

     // Delete contact Function
     const deleteContact = async (_id) => {
      if (!window.confirm("Are you sure you want to delete this contact?")) return; // Ask for confirmation
      try {
        const response = await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/getPostDataOnMongo/delete-contact/${_id}`,{
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`, // Fetch token from cookies
        },
        });
        // console.log({pineddddd:response.data.contact})
        if(response.data)toast.success(response.data.message,{duration:2000,style:{backgroundColor:"green",color:"whitesmoke"}})
 
        setUnreadOff(e=>e+1);
      } catch (error) {
        console.error("Error deleting contact:", error);
      }
    };


    const encryptSensitiveInfo = (message) => {
      const patterns = {
          email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/g,
          contactNumber: /\b(?:\+\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{1,5}[-.\s]?\d{1,5}[-.\s]?\d{1,5}\b/g,
          upiID: /\b[A-Za-z0-9.-]+@[A-Za-z]+\b/g
      };
  
      return message
          .replace(patterns.email, (match) => maskString(match))
          .replace(patterns.contactNumber, (match) => maskPhone(match))
          .replace(patterns.upiID, (match) => maskString(match));
  };
  
  // Masking Function: Replaces part of the string with "*"
  const maskString = (str) => {
    if(deviceDetails.role === "admin" || deviceDetails.role === "owner")return str;
      if (str.length <= 3) return "###"; // If too short, mask everything
      if (str.length <= 6) return str.substring(0, 2) + "#".repeat(str.length - 4) + str.slice(-2); // Handle short strings
      return str.substring(0, 2) + "#".repeat(str.length - 6) + str.slice(-2);
  };
  
  const maskPhone = (str) => {
    if(deviceDetails.role==="admin" || deviceDetails.role === "owner")return str;
    if (str.length <= 8) return str; // If too short, mask everything
    return str.substring(0, 2) + "#".repeat(str.length - 6) + str.slice(-2);
  };
  
  
  function formatMsg(message) {
    message = encryptSensitiveInfo(message)
     
    return message;
  }

// const lastMessage= "this is my last message of this account I wanted  to say somthing  to krishna"
    return( <div className="">
      {showAllComments && <AllComments showAllComments={showAllComments} setShowAllComents={setShowAllComents}/>}
       <div className=" py-1 ">
                <div className="w-full m-auto justify-center px-1 pb-1 flex">
                {(deviceDetails.role==="admin" || deviceDetails.role === "owner") && <button onClick={()=>dispatch(setShowAllTutorData())} className="ml-2"><GiTeacher className="text-green-500 hover:text-green-600" size={23}/></button>}
                  <h1 className="text-center px-1 underline   font-bold text-green-800 capitalize">{deviceDetails.device}</h1>
                   <span className="text-red-700 font-bold">/</span>
                  <h1 className="text-center px-1 underline text-yellow-700 italic font-semibold capitalize">{deviceDetails.userName}</h1>
                  <button onClick={()=>setShowAllComents(true)} className="ml-2"><FaComments className="text-indigo-500 hover:text-indigo-600" size={23}/></button>
                  </div>
                <div className="relative flex items-center">
                  <input
                    type="text"      
                    value={searchContact}
                    onChange={(e)=>{if(e.target.value===" ")return; dispatch(setSearchContact(e.target.value))}}
                    placeholder="Search users"
                    className="w-full pl-10 pr-4 py-0 border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    aria-label="Search users"
                  />
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
                  {/* Add + icon */}
                  <button onClick={()=>setShowAddPopup(true)} className="  text-green-600" title="Add Contact/Message">
                    <span style={{fontSize: '22px', fontWeight: 'bold'}}>+</span>
                  </button>
                  <button onClick={fetchUnreadContact} className={`w-fit m-auto p-1 right-0 mx-2 ${unread?"text-indigo-700 bg-indigo-300 rounded-full":"text-indigo-500"} animate-blink`}>
                    <MdOutlineMarkUnreadChatAlt size={23} />
                  </button>
                  {/* Popup for adding contact/message */}
                  {showAddPopup && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
                      <div className="bg-white rounded-lg shadow-lg p-6 w-[350px] max-w-full">
                        <h2 className="text-lg font-bold mb-2 text-indigo-700">Add Contact & Message</h2>
                        <label className="block mb-1 text-sm font-semibold">Name</label>
                        <input type="text" value={addName} onChange={e=>setAddName(e.target.value)} className="w-full mb-2 px-2 py-1 border rounded" placeholder="Enter name" />
                        <label className="block mb-1 text-sm font-semibold">Contact</label>
                        <input type="text" value={addContactNumber} onChange={e=>setAddContactNumber(e.target.value)} className="w-full mb-2 px-2 py-1 border rounded" placeholder="Enter contact" />
                        <label className="block mb-1 text-sm font-semibold">Message</label>
                        <textarea value={addTemplate} onChange={e=>setAddTemplate(e.target.value)} className="w-full mb-2 px-2 py-1 border rounded" placeholder="Enter message" rows={3} />
                        <div className="flex justify-end gap-2 mt-2">
                          <button onClick={()=>setShowAddPopup(false)} className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
                          <button onClick={handleSendAddMsg} disabled={sending} className="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600 disabled:bg-gray-400">{sending?"Sending...":"Send Msg"}</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
      <div className="overflow-auto h-[84vh]">
      {contacts && contacts.length>0?(contacts.map((item)=>{
        // console.log({itemmmmmm:item})
        let lastMessage=(item.last_message_id?.message?.type===undefined)?"undefined":(item.last_message_id?.message?.type==='text')?formatMsg(item.last_message_id?.message?.text.body):item.last_message_id?.message?.type
        return <div  key={item._id}>
        <div 
        className={`flex px-1 justify-between border  border-gray-300 hover:bg-gray-50 cursor-pointer transition duration-150 ease-in-out ${selectedContact?._id === item._id ? 'bg-gray-50' : ''}`}
        onClick={() => handleContactClick(item)}
      >
        <div className="flex items-center">
     
        <div onMouseEnter={()=>{handleMouseEnterForMark(item._id)}}  onMouseLeave={()=>handleMouseLeaveForMark(null)} 
        className={`py-1 w-[30px] mr-2 text-center bg-gradient-to-r 
          ${item.tutorID!=="TI0000"?'from-green-300 via-green-100 to-green-300  text-green-500'
          :'from-yellow-400 via-yellow-100 to-yellow-400  text-yellow-700'
          }
          rounded-full font-bold`}>{item?.name[0]}</div>
       {/* Dropdown for mark money level################################################3 */}
       {markMoney=== item._id && (
        <motion.div
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}  
        transition={{ duration: 0.5, ease: "easeOut" }}
          className="z-50  fixed left-[3vw]  w-40 bg-white shadow-md rounded-lg text-gray-700"
          onMouseEnter={()=>handleMouseEnterForMark(item._id)}
          onMouseLeave={()=>handleMouseLeaveForMark(null)}
          onClick={(e) => e.stopPropagation()} // 👈 Add this to stop clicks from bubbling
        >
          <ul className="text-sm">
            <li
              className="px-4 py-2 hover:bg-gray-100 active:bg-gray-300 cursor-pointer"
              onClick={() => handleMarkUpdate(item.chatId,"good")}
            >
              High Amount
            </li>
            <li
              className="px-4  py-2 hover:bg-gray-100 active:bg-gray-300 cursor-pointer"
              onClick={() => handleMarkUpdate(item.chatId,"average")}
            >
              Average 
            </li>
             <li
              className="px-4  py-2 hover:bg-gray-100 active:bg-gray-300 cursor-pointer"
              onClick={() => handleMarkUpdate(item.chatId,"bed")}
            >
             low amount
            </li>
             <li
              className="px-4 py-2 hover:bg-gray-100 active:bg-gray-300 cursor-pointer"
              onClick={() => handleMarkUpdate(item.chatId,"unknown")}
            >
              unknown
            </li>
            {/* {Cookies.get("role")==="admin" &&<li
              className="px-4 py-2 text-red-500 hover:bg-red-100 active:bg-red-300 cursor-pointer"
              onClick={() => deleteChat(item._id)}
            >
              ❌ Delete Chats
            </li>}
            {Cookies.get("role")==="admin" &&<li
              className="px-4 py-2 text-red-500 hover:bg-red-100 active:bg-red-300 cursor-pointer"
              onClick={() => deleteContact(item._id)}
            >
              ❌ Delete Contact
            </li>} */}
          </ul>
        </motion.div>
      )}
      {/* ####################################################### */}
       <div>
       <p className={`font-medium text-sm text-gray-700 ${item.tutorID==="TI0000"?"text-yellow-600":""} `}>[{item.phone_number.slice(1,4)}..] {item.name.length>13?`${item.name.slice(0,13)}...`:item.name} <span className="bg-gray-700 rounded-full">{item.pined && "📌"}</span></p>
      
       <p className="text-xs flex font-medium"><button onClick={()=>copyToClipboard(item.chatId)} className="font-">{item.chatId}</button>
        <button onClick={()=>copyToClipboard(item.tutorID)} className="text-green-600">{item.tutorID==="TI0000"?"":`[${item.tutorID}]`}</button>
        {item.tutorID==="TI0000" && <span className="pl-1">{item.mark==="bed"? <RiCoinFill className="text-gray-500" size={21}/>
        : item.mark ==="average"? <GiTwoCoins className="text-yellow-600" size={21}/>
        :item.mark === "good"? <FaCoins size={21} className="text-yellow-600"/>
        :<FaGrinAlt className="text-gray-500" size={21}/>}</span>}
        </p>
        <p className="text-xs flex">
        {/* {item.last_message_id?.direction=="received"?"":( item.last_message_id?.status==-1)? failedMessage:item.last_message_id?.status==1?singleTick:item.last_message_id?.status==2?doubleTick:doubleTickSeen} </span> */}
        {(item.last_message_id?.direction)=="received"?<b><MdCallReceived /></b>:( (item.last_message_id?.status)==-1)? failedMessage:(item.last_message_id?.status==1)?singleTick:(item.last_message_id?.status==2)?doubleTick:(item.last_message_id?.status>2)?doubleTickSeen:""}
           {lastMessage?.length>25?lastMessage.slice(0,25)+"...":lastMessage}</p>

       </div>
        </div> 
        <div className={`flex flex-col text-xs ${(!item?.unread_count)?"":item.tutorID==="TI0000"?"text-yellow-700 font-bold":"text-green-500 font-bold"}`}>
          <span>{formatDate(item?.lastMsgTime)} <button onMouseEnter={()=>handleMouseEnter(item._id)}  onMouseLeave={()=>handleMouseLeave(null)}><FaAngleDown/></button> </span>
          {(item?.unread_count)?<span className={`rounded-full ${item.tutorID==="TI0000"?'bg-yellow-400':'bg-green-200'} w-fit px-1`}>{item?.unread_count}</span>:<span></span>}
         
          </div>
         
      </div>
       {/* Dropdown */}
       {dropdownOpen === item._id && (
        <motion.div
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}  
        transition={{ duration: 0.5, ease: "easeOut" }}
          className="  fixed left-[10vw]  w-40 bg-white shadow-md rounded-lg text-gray-700"
          onMouseEnter={()=>handleMouseEnter(item._id)}
          onMouseLeave={()=>handleMouseLeave(null)}
        >
          <ul className="text-sm">
            <li
              className="px-4 py-2 hover:bg-gray-100 active:bg-gray-300 cursor-pointer"
              onClick={() => togglePinFunction(item._id)}
            >
              📌 Pin
            </li>
            <li
              className="px-4  py-2 hover:bg-gray-100 active:bg-gray-300 cursor-pointer"
              onClick={() => console.log("Marked as unread" )}
            >
              📩 Mark as unread
            </li>
            {(Cookies.get("role") === "admin" ||
Cookies.get("role") === "owner") &&<li
              className="px-4 py-2 text-red-500 hover:bg-red-100 active:bg-red-300 cursor-pointer"
              onClick={() => deleteChat(item._id)}
            >
              ❌ Delete Chats
            </li>}
            {(Cookies.get("role") === "admin" ||
Cookies.get("role") === "owner") &&<li
              className="px-4 py-2 text-red-500 hover:bg-red-100 active:bg-red-300 cursor-pointer"
              onClick={() => deleteContact(item._id)}
            >
              ❌ Delete Contact
            </li>}
          </ul>
        </motion.div>
      )}
      </div>
       })):(
        <p>No contacts available</p>
      )}
      </div>
         {/* Pagination Controls */}
      <div className="flex px-1 justify-between items-center mt-2">
        <button
          className="px-3 py-1 bg-indigo-500 text-white rounded-lg shadow disabled:bg-gray-300"
          onClick={handlePrevPage}
          disabled={currentContactPage === 1}
        >
          Previous
        </button>
        <p>
          Page {currentContactPage} of {totalContactPage}
        </p>
        <button
          className="px-3 py-1 bg-indigo-500 text-white rounded-lg shadow disabled:bg-gray-300"
          onClick={handleNextPage}
          disabled={currentContactPage === totalContactPage}
        >
          Next
        </button>
      </div>
        </div>
    )
}
export default UserCard





































