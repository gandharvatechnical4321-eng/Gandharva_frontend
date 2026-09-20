import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  togglePin,
  setContacts,
  selectContact,
  unreadZero,
  setTotalContactPage,
  setSearchContact,
  setShowAllTutorData,
} from "../features/contactsSlice";
import AllTutorList from "../tutorDashboard/AllTutorList";
import { createPortal } from "react-dom";
import { setSelectedTask } from "../features/taskSlice";
import { addContact } from "../features/contactsSlice";
import { addMessage } from "../features/messagesSlice";
import { motion } from "framer-motion";
import { RiCoinFill } from "react-icons/ri";
import { GiTwoCoins, GiTeacher } from "react-icons/gi";
import { FaCoins, FaAngleDown } from "react-icons/fa6";
import {
  FaComments,
  FaGrinAlt,
  FaSearch,
  FaWhatsapp,
} from "react-icons/fa";
import {
  MdOutlineMarkUnreadChatAlt,
  MdCallReceived,
} from "react-icons/md";
import Cookies from "js-cookie";
import AllComments from "../comment/AllComents";
import { toast } from "react-hot-toast";
import axios from "axios";

const singleTick = (
  <svg
    className="h-4 w-4 text-gray-400"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M8 12l3 3 7-7-1.41-1.41L11 12.17l-2.59-2.58L8 12z" />
  </svg>
);

const doubleTick = (
  <svg
    className="h-4 w-4 text-gray-400"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M8 12l3 3 7-7-1.41-1.41L11 12.17l-2.59-2.58L8 12z" />
    <path d="M10 14l3 3 7-7-1.41-1.41L13 14.17l-2.59-2.58L10 14z" />
  </svg>
);

const doubleTickSeen = (
  <svg
    className="h-4 w-4 text-blue-500"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M8 12l3 3 7-7-1.41-1.41L11 12.17l-2.59-2.58L8 12z" />
    <path d="M10 14l3 3 7-7-1.41-1.41L13 14.17l-2.59-2.58L10 14z" />
  </svg>
);

const failedMessage = (
  <svg
    className="h-4 w-4 text-rose-500"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
    <path d="M13 7h-2v6h2V7zm0 8h-2v2h2v-2z" />
  </svg>
);

const getInitial = (name = "") => {
  return name?.charAt(0)?.toUpperCase() || "?";
};

const getShortName = (name = "", size = 18) => {
  if (!name) return "Unknown";
  return name.length > size ? `${name.slice(0, size)}...` : name;
};

// const isTutorContact = (contact) => {
//   const tutorID =
//     contact?.tutorID ||
//     contact?.tutorDetails?.tutorID ||
//     contact?.tutor_id ||
//     "";

//   return (
//     Boolean(tutorID && tutorID !== "TI0000" && tutorID !== "NA") ||
//     contact?.type === "tutor" ||
//     contact?.role === "tutor"
//   );
// };

const CLIENT_LEVELS = [
  "client",
  "new client",
  "old client",
  "useless",
  "int_comm",
];

const isValidTutorID = (tutorID) => {
  const value = String(tutorID || "").trim().toUpperCase();

  return (
    value !== "" &&
    value !== "TI0000" &&
    value !== "NA" &&
    value !== "N/A" &&
    value !== "NULL" &&
    value !== "UNDEFINED"
  );
};

const isValidChatID = (chatID) => {
  const value = String(chatID || "").trim().toUpperCase();

  return (
    value !== "" &&
    value !== "NA" &&
    value !== "N/A" &&
    value !== "NULL" &&
    value !== "UNDEFINED"
  );
};

const isTutorContact = (contact) => {
  const savedLevel = String(contact?.level || "")
    .trim()
    .toLowerCase();

  // Manual tutor selection always has first priority.
  if (savedLevel === "tutor") {
    return true;
  }

  // Manually selected client-related levels always remain clients.
  if (CLIENT_LEVELS.includes(savedLevel)) {
    return false;
  }

  const tutorID =
    contact?.tutorID ||
    contact?.tutorDetails?.tutorID ||
    contact?.tutor_id ||
    "";

  const chatID =
    contact?.chatId ||
    contact?.chatID ||
    contact?.chat_id ||
    "";

  // Automatic decision only when no manual level is present.
  return isValidChatID(chatID) && isValidTutorID(tutorID);
};

const getContactType = (contact) => {
  return isTutorContact(contact) ? "Tutor" : "Client";
};

const TutorDashboardModal = ({ onClose }) => {
  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-slate-950/60 backdrop-blur-sm">
      <div className="flex h-screen w-screen flex-col bg-slate-50">
        {/* Full Screen Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-black text-slate-900 sm:text-xl">
              Tutor Dashboard
            </h2>
            <p className="truncate text-xs font-bold text-slate-500 sm:text-sm">
              Full tutor details, ratings, skills, status and records
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-xl font-black text-red-600 transition hover:bg-red-100"
            title="Close Tutor Dashboard"
          >
            ×
          </button>
        </div>

        {/* Full Screen Body */}
        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-3 sm:p-5">
          <div className="mx-auto h-full w-full max-w-[1600px]">
            <AllTutorList />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

const UserCard = ({ onContactSelect }) => {
  const dispatch = useDispatch();
  const timeoutRef = useRef(null);

  const [unreadOff, setUnreadOff] = useState(1);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [addName, setAddName] = useState("");
  const [addContactNumber, setAddContactNumber] = useState("+91");
  const [addTemplate, setAddTemplate] = useState("/plsreply");
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(false);
  const [showAllComments, setShowAllComents] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [currentContactPage, setCurrentContactPage] = useState(1);
  const [contactLimit, setContactLimit] = useState(10);
  const [markMoney, setMarkMoney] = useState(false);

  const showAllTutorData = useSelector(
  (state) => state.contacts.showAllTutorData
);


  const [chatFilterType, setChatFilterType] = useState("all");

  const searchContact = useSelector((state) => state.contacts.searchContact);
  const deviceDetails = useSelector((state) => state.contacts.deviceDetails);
  const contacts = useSelector((state) => state.contacts.contacts);
  const selectedContact = useSelector((state) => state.contacts.selectedContact);
  const totalContactPage = useSelector((state) => state.contacts.totalContactPage);

  const unreadTotal = contacts?.reduce(
    (total, item) => total + Number(item?.unread_count || 0),
    0
  );

  const totalContacts = contacts?.length || 0;

  const currentContacts = contacts || [];

const clientTotal = currentContacts.filter(
  (contact) => !isTutorContact(contact)
).length;

const tutorTotal = currentContacts.filter(
  (contact) => isTutorContact(contact)
).length;

const filteredContactsByType = currentContacts.filter((contact) => {
  const isTutor = isTutorContact(contact);

  if (chatFilterType === "tutors") return isTutor;
  if (chatFilterType === "clients") return !isTutor;
  if (chatFilterType === "unread") {
    return Number(contact?.unread_count || 0) > 0;
  }

  return true;
});

  useEffect(() => {
    const updateResponsiveLimit = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const availableHeight = height - 230;
      let heightBasedLimit = Math.floor(availableHeight / 76);

      if (width < 640) {
        heightBasedLimit = Math.min(heightBasedLimit, 6);
      } else if (width < 1024) {
        heightBasedLimit = Math.min(heightBasedLimit, 8);
      } else if (width < 1440) {
        heightBasedLimit = Math.min(heightBasedLimit, 10);
      } else {
        heightBasedLimit = Math.min(heightBasedLimit, 12);
      }

      const finalLimit = Math.max(4, heightBasedLimit);
      setContactLimit(finalLimit);
    };

    updateResponsiveLimit();
    window.addEventListener("resize", updateResponsiveLimit);

    return () => window.removeEventListener("resize", updateResponsiveLimit);
  }, []);

  const handleMouseEnterForMark = (id) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setMarkMoney(id);
  };

  const handleMouseLeaveForMark = (id) => {
    timeoutRef.current = setTimeout(() => {
      setMarkMoney(id);
    }, 500);
  };

  async function updateContactMark(chatId, mark) {
    const allowedMarks = ["bed", "unknown", "average", "good"];
    if (!allowedMarks.includes(mark)) {
      throw new Error("Invalid mark value");
    }

    try {
      const response = await axios.patch(
        `${process.env.REACT_APP_BACKEND_URL}/api/getPostDataOnMongo/mark`,
        { chatId, mark }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating contact mark:", error);
      throw new Error(
        error.response?.data?.error || "Failed to update mark"
      );
    }
  }

  const handleMarkUpdate = async (chatId, mark) => {
    try {
      const result = await updateContactMark(chatId, mark);
      toast.success(result?.message || "Mark updated");
      setMarkMoney(false);
      setUnreadOff((e) => e + 1);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleMouseEnter = (id) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setDropdownOpen(id);
  };

  const handleMouseLeave = (id) => {
    timeoutRef.current = setTimeout(() => {
      setDropdownOpen(id);
    }, 500);
  };

  const handleSendAddMsg = async () => {
    setSending(true);

    try {
      if (!addContactNumber || !addTemplate || !addName) {
        toast.error("Fill all details");
        setSending(false);
        return;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/getPostDataOnMongo/sendfirstmessage`,
        {
          phone_number: addContactNumber,
          message: {
            type: "text",
            text: { body: addTemplate },
          },
          direction: "sent",
          components: [],
          name: addName,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );

      let data = response.data.contact;
      data.last_message_id = response.data.savedMessage;

      if (data) {
        dispatch(addContact(data));
        dispatch(
          addMessage({
            chatId: response.data.savedMessage.contact_id,
            message: response.data.savedMessage,
          })
        );

        toast.success("Message sent successfully!");
        setShowAddPopup(false);
        setAddName("");
        setAddContactNumber("+91");
        setAddTemplate("/plsreply");
      }
    } catch (error) {
      toast.error(
        "Error sending message: " +
          (error.response?.data?.details ||
            error.response?.data?.error ||
            error.message)
      );
      console.error("Error sending message:", error.response?.data || error.message);
    } finally {
      setSending(false);
    }
  };

  const fetchContactData = async (query, page) => {
    try {
      const skip = (page - 1) * contactLimit;
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/getPostDataOnMongo/searchcontact?q=${query}&skip=${skip}&limit=${contactLimit}`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );

      const { data, pagination } = response?.data || {};
      dispatch(setContacts(data || []));
      dispatch(setTotalContactPage(Math.ceil(pagination.total / contactLimit)));
    } catch (err) {
      if (err.status === 401 || err.response?.status === 401) {
        window.location.reload();
        return;
      }
      console.error("Error fetching contact data:", err);
      toast.error("Failed to fetch contact data.");
    }
  };

  const fetchUnreadContact = async () => {
    if (unread) {
      setUnread(false);
      setUnreadOff((e) => e + 1);
      return;
    }

    try {
      setUnread(true);
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/getPostDataOnMongo/unread`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );

      const { data } = response?.data || [];
      dispatch(setContacts(data || []));
    } catch (err) {
      console.error("Error fetching unread data:", err);
      toast.error("Failed to fetch unread contacts.");
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchContactData(searchContact, currentContactPage);
    }, 700);

    return () => clearTimeout(delayDebounce);
  }, [currentContactPage, contactLimit]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setCurrentContactPage(1);
      fetchContactData(searchContact, 1);
    }, 700);

    return () => clearTimeout(delayDebounce);
  }, [searchContact, unreadOff]);

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

  function formatDate(timestamp) {
    if (!timestamp) return "";

    const inputDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isToday = inputDate.toDateString() === today.toDateString();
    const isYesterday = inputDate.toDateString() === yesterday.toDateString();

    if (isToday) {
      const hours = inputDate.getHours();
      const minutes = inputDate.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      const formattedHours = hours % 12 || 12;
      return `${formattedHours}:${minutes} ${ampm}`;
    }

    if (isYesterday) {
      return "Yesterday";
    }

    const day = inputDate.getDate().toString().padStart(2, "0");
    const month = (inputDate.getMonth() + 1).toString().padStart(2, "0");
    const year = inputDate.getFullYear();

    return `${day}-${month}-${year}`;
  }

  const copyToClipboard = (data) => {
    try {
      const formattedData =
        typeof data === "object" ? JSON.stringify(data, null, 2) : String(data);

      navigator.clipboard
        .writeText(formattedData)
        .then(() => {
          toast.success("🎉 Selected ID copied!", {
            duration: 2000,
            position: "top-left",
            style: {
              background: "#10B981",
              color: "white",
              fontWeight: "bold",
              padding: "16px",
              borderRadius: "8px",
            },
          });
        })
        .catch((err) => {
          console.error("Failed to copy data: ", err);
        });
    } catch (error) {
      console.error("Error formatting data: ", error);
    }
  };

  const handleContactClick = async (contact) => {
    dispatch(setSearchContact(""));
    await dispatch(selectContact(contact));
    onContactSelect?.(contact);

    if (contact.unread_count) {
      const token = Cookies.get("token");
      const resp = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/getPostDataOnMongo/contacts/${contact._id}/reset-unread`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (resp.data) {
        dispatch(unreadZero(contact));
      }
    }
  };
const markAsUnreadFunction = async (contact) => {
  try {
    if (!contact?._id) return;

    const response = await axios.put(
      `${process.env.REACT_APP_BACKEND_URL}/api/getPostDataOnMongo/contacts/${contact._id}/mark-unread`,
      {},
      {
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      }
    );

    if (response.data) {
      toast.success(response.data.message || "Marked as unread");
      setUnreadOff((e) => e + 1);
      setDropdownOpen(null);
    }
  } catch (error) {
    console.error("Error marking unread:", error);
    toast.error(error.response?.data?.message || "Failed to mark as unread");
  }
};

  const togglePinFunction = async (_id) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/getPostDataOnMongo/toggle-pin/${_id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );

      if (response.data) {
        toast.success(response.data.message, {
          duration: 2000,
          style: { backgroundColor: "green", color: "whitesmoke" },
        });
      }

      dispatch(togglePin(_id));
      setUnreadOff((e) => e + 1);
    } catch (error) {
      console.log("Error toggling pin:", error);
    }
  };

  const deleteChat = async (_id) => {
    if (!window.confirm("Are you sure you want to delete this contact?")) return;

    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/api/getPostDataOnMongo/delete-chat/${_id}`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );

      if (response.data) {
        toast.success(response.data.message, {
          duration: 2000,
          style: { backgroundColor: "green", color: "whitesmoke" },
        });
      }

      setUnreadOff((e) => e + 1);
    } catch (error) {
      console.log("Error deleting chats:", error);
    }
  };

  const deleteContact = async (_id) => {
    if (!window.confirm("Are you sure you want to delete this contact?")) return;

    try {
      const response = await axios.delete(
        `${process.env.REACT_APP_BACKEND_URL}/api/getPostDataOnMongo/delete-contact/${_id}`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );

      if (response.data) {
        toast.success(response.data.message, {
          duration: 2000,
          style: { backgroundColor: "green", color: "whitesmoke" },
        });
      }

      setUnreadOff((e) => e + 1);
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };

  const encryptSensitiveInfo = (message) => {
    if (!message) return "";

    const patterns = {
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/g,
      contactNumber:
        /\b(?:\+\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{1,5}[-.\s]?\d{1,5}[-.\s]?\d{1,5}\b/g,
      upiID: /\b[A-Za-z0-9.-]+@[A-Za-z]+\b/g,
    };

    return String(message)
  .replace(patterns.email, (match) => {
    console.log("EMAIL:", match, match.length);
    return maskString(match);
  })
  .replace(patterns.contactNumber, (match) => {
    console.log("PHONE:", match, match.length);
    return maskPhone(match);
  })
  .replace(patterns.upiID, (match) => {
    console.log("UPI:", match, match.length);
    return maskString(match);
  });
  };

const maskString = (value) => {
  if (deviceDetails.role === "admin" || deviceDetails.role === "owner") {
    return value;
  }

  if (!value) return "";

  const str = String(value);

  if (str.length <= 3) {
    return "#".repeat(str.length);
  }

  if (str.length <= 6) {
    const count = Math.max(0, str.length - 4);

    return (
      str.slice(0, 2) +
      "#".repeat(count) +
      str.slice(-2)
    );
  }

  const count = Math.max(0, str.length - 4);

  return (
    str.slice(0, 2) +
    "#".repeat(count) +
    str.slice(-2)
  );
};

  const maskPhone = (value) => {
  if (deviceDetails.role === "admin" || deviceDetails.role === "owner") {
    return value;
  }

  if (!value) return "";

  const str = String(value);

  if (str.length <= 4) return str;

  return (
    str.slice(0, 2) +
    "#".repeat(Math.max(0, str.length - 4)) +
    str.slice(-2)
  );
};

  function formatMsg(message) {
    return encryptSensitiveInfo(message);
  }

  const getLastMessage = (item) => {
    const msgType = item.last_message_id?.message?.type;
    if (msgType === undefined) return "No message yet";
    if (msgType === "text") {
      return formatMsg(item.last_message_id?.message?.text?.body || "");
    }
    return msgType;
  };

  return (
    <div className="flex h-[100%] min-h-0 w-full flex-col bg-gray-100 overflow-hidden shadow-sm border border-gray-100 rounded-xl">

       {showAllTutorData && (
      <TutorDashboardModal
        onClose={() => dispatch(setShowAllTutorData())}
      />
    )}
      

      {/* Header */}
      <div className="shrink-0 border-b border-gray-100 bg-white px-4 py-4 z-10">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-50">
              <FaWhatsapp className="shrink-0 text-green-500" size={18} />
            </div>
            <h2 className="truncate text-base font-bold text-gray-900 tracking-tight">
              Whatsapp Chat
            </h2>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {(deviceDetails?.role === "admin" || Cookies.get("role") === "owner") && (
  <button
    type="button"
    onClick={() => dispatch(setShowAllTutorData())}
    className="flex h-9 w-9 items-center justify-center rounded-xl text-teal-600 transition-colors hover:bg-teal-50"
    title="Tutor Dashboard"
  >
    <GiTeacher size={20} />
  </button>
)}

            
            

           
          </div>
        </div>

        {/* Search */}
        <div className="relative group">
          <FaSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-blue-500" size={14} />

          <input
            type="text"
            value={searchContact}
            onChange={(e) => {
              if (e.target.value === " ") return;
              dispatch(setSearchContact(e.target.value));
            }}
            placeholder="Search conversations..."
            className="h-11 w-full rounded-2xl border border-gray-200 bg-gray-50/50 pl-10 pr-12 text-sm font-medium text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            aria-label="Search users"
          />

          <button
            type="button"
            onClick={() => setShowAddPopup(true)}
            className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl bg-blue-600 text-lg font-medium text-white shadow-sm transition-transform hover:scale-105 hover:bg-blue-700 active:scale-95"
            title="Add Contact/Message"
          >
            +
          </button>
        </div>

        {/* Segmented Tabs */}
        {/* Segmented Tabs */}
<div className="mt-4 rounded-2xl bg-gray-100/80 p-1 ring-1 ring-gray-200/70">
  <div className="grid grid-cols-4 gap-1">
    <button
      type="button"
      onClick={() => {
        setChatFilterType("all");
        if (unread) fetchUnreadContact();
      }}
      className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-extrabold transition-all ${
        chatFilterType === "all" && !unread
          ? "bg-white text-blue-700 shadow-sm ring-1 ring-blue-100"
          : "text-gray-500 hover:bg-white/70 hover:text-gray-800"
      }`}
    >
      All
      
    </button>

    <button
      type="button"
      onClick={() => {
        setChatFilterType("unread");
        if (!unread) fetchUnreadContact();
      }}
      className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-extrabold transition-all ${
        unread || chatFilterType === "unread"
          ? "bg-white text-blue-700 shadow-sm ring-1 ring-blue-100"
          : "text-gray-500 hover:bg-white/70 hover:text-gray-800"
      }`}
    >
      Unread
      <span
        className={`rounded-lg px-1.5 py-0.5 text-[10px] font-black ${
          unread || chatFilterType === "unread"
            ? "bg-blue-100 text-blue-700"
            : "bg-gray-200 text-gray-600"
        }`}
      >
        {unreadTotal}
      </span>
    </button>

    <button
      type="button"
      onClick={() => {
        setChatFilterType("clients");
        if (unread) fetchUnreadContact();
        dispatch(setSearchContact(""));
      }}
      className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-extrabold transition-all ${
        chatFilterType === "clients" && !unread
          ? "bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-100"
          : "text-gray-500 hover:bg-white/70 hover:text-gray-800"
      }`}
    >
      Clients
      
    </button>

    <button
      type="button"
      onClick={() => {
        setChatFilterType("tutors");
        if (unread) fetchUnreadContact();
        dispatch(setSearchContact(""));
      }}
      className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-extrabold transition-all ${
        chatFilterType === "tutors" && !unread
          ? "bg-white text-violet-700 shadow-sm ring-1 ring-violet-100"
          : "text-gray-500 hover:bg-white/70 hover:text-gray-800"
      }`}
    >
      Tutors
     
    </button>
  </div>
</div>
      </div>

      {/* Add Contact Popup */}
      {showAddPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 px-4 backdrop-blur-sm transition-opacity">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-[400px] rounded-[24px] bg-white p-6 shadow-2xl"
          >
            <h2 className="mb-5 text-xl font-bold text-gray-900">
              New Message
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                  Recipient Name
                </label>
                <input
                  type="text"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                  Contact Number
                </label>
                <input
                  type="text"
                  value={addContactNumber}
                  onChange={(e) => setAddContactNumber(e.target.value)}
                  className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  placeholder="+91"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-600">
                  Initial Message
                </label>
                <textarea
                  value={addTemplate}
                  onChange={(e) => setAddTemplate(e.target.value)}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  placeholder="Type your message..."
                  rows={3}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddPopup(false)}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSendAddMsg}
                disabled={sending}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? "Sending..." : "Send Message"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Contact List */}
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        {filteredContactsByType && filteredContactsByType.length > 0 ? (
          <div className="space-y-1.5">
            {filteredContactsByType.map((item) => {
              const isTutor = isTutorContact(item);
              const isSelected = selectedContact?._id === item._id;
              const lastMessage = getLastMessage(item);
              const unreadCount = Number(item?.unread_count || 0);
              const name = item?.name || "Unknown";
              // const contactType = isTutor ? "Tutor" : "Client";
              const contactType = getContactType(item);

              return (
                <div key={item._id} className="relative">
                  {/* Changed outer button to div to prevent invalid HTML nesting */}
                  <div
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleContactClick(item)}
                    onClick={() => handleContactClick(item)}
                    className={`group flex w-full cursor-pointer items-center gap-3 rounded-2xl border p-2.5 text-left transition-all duration-200 outline-none ${
                      isSelected
                        ? "border-blue-100 bg-blue-50/60 shadow-[0_2px_10px_-3px_rgba(59,130,246,0.1)] ring-1 ring-blue-500/10"
                        : "border-transparent bg-white hover:border-gray-100 hover:bg-gray-50/80 hover:shadow-sm"
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      onMouseEnter={() => handleMouseEnterForMark(item._id)}
                      onMouseLeave={() => handleMouseLeaveForMark(null)}
                      className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold shadow-sm ${
                        isTutor
                          ? "bg-gradient-to-br from-teal-400 to-teal-500 text-white"
                          : "bg-gradient-to-br from-amber-300 to-amber-400 text-amber-900"
                      }`}
                    >
                      {getInitial(name)}

                      <span
                        className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-white ${
                          isTutor ? "bg-teal-500" : "bg-amber-400"
                        }`}
                      />
                    </div>

                    {/* Main Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center gap-2">
                        <p className="truncate text-sm font-bold text-gray-900">
                          <span
                              role="button"
                              tabIndex={0}
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(item.chatId);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.stopPropagation();
                                  copyToClipboard(item.chatId);
                                }
                              }}
                              className="hover:text-blue-700 hover:underline"
                            >
                              {item.chatId || item.phone_number?.slice(1, 7) || "ID"}
                            </span>
                          <span className="mx-1.5 font-normal text-gray-300">|</span>
                          <span className="font-semibold text-gray-700">{getShortName(name, 18)}</span>
                        </p>

                        {item.pined && (
                          <span className="shrink-0 text-xs drop-shadow-sm">📌</span>
                        )}
                      </div>

                      <div className="mt-0.5 flex items-center gap-2">
                        <span
                          className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase ${
                            isTutor ? "bg-teal-50 text-teal-700" : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {contactType}
                        </span>

                        {isTutor && item.tutorID && (
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(item.tutorID);
                            }}
                            onKeyDown={(e) => {
                              if(e.key === 'Enter') {
                                e.stopPropagation();
                                copyToClipboard(item.tutorID);
                              }
                            }}
                            className="hidden truncate text-[11px] font-semibold text-teal-600 transition-colors hover:text-teal-800 hover:underline sm:block"
                          >
                            {item.tutorID}
                          </div>
                        )}

                        {/* {!isTutor && (
                          <span className="text-gray-400">
                            {item.mark === "bed" ? (
                              <RiCoinFill className="text-gray-300" size={15} />
                            ) : item.mark === "average" ? (
                              <GiTwoCoins className="text-gray-950" size={15} />
                            ) : item.mark === "good" ? (
                              <FaCoins className="text-gray-950" size={15} />
                            ) : (
                              <FaGrinAlt className="text-gray-300" size={14} />
                            )}
                          </span>
                        )} */}
                      </div>

                      <div className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-gray-500">
                        {item.last_message_id?.direction === "received" ? (
                          <MdCallReceived className="shrink-0 text-gray-400" />
                        ) : item.last_message_id?.status === -1 ? (
                          failedMessage
                        ) : item.last_message_id?.status === 1 ? (
                          singleTick
                        ) : item.last_message_id?.status === 2 ? (
                          doubleTick
                        ) : item.last_message_id?.status > 2 ? (
                          doubleTickSeen
                        ) : null}

                        <span className="truncate">
                          {lastMessage?.length > 34
                            ? `${lastMessage.slice(0, 34)}...`
                            : lastMessage}
                        </span>
                      </div>
                    </div>

                    {/* Right Meta */}
                    <div
                      className={`flex shrink-0 flex-col items-end gap-2 text-xs ${
                        unreadCount
                          ? isTutor
                            ? "font-bold text-teal-600"
                            : "font-bold text-blue-600"
                          : "font-medium text-gray-400"
                      }`}
                    >
                      <span className="whitespace-nowrap">
                        {formatDate(item?.lastMsgTime)}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {unreadCount ? (
                          <span className="flex min-h-[22px] min-w-[22px] items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                            {unreadCount}
                          </span>
                        ) : (
                          <span className="h-[22px]" />
                        )}

                        <div
                          role="button"
                          tabIndex={0}
                          onMouseEnter={() => handleMouseEnter(item._id)}
                          onMouseLeave={() => handleMouseLeave(null)}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.key === 'Enter' && e.stopPropagation()}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                        >
                          <FaAngleDown />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mark Money Dropdown
                  {markMoney === item._id && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute left-[60px] top-full z-50 mt-1 w-40 rounded-xl border border-gray-100 bg-white/95 py-1.5 text-sm font-medium text-gray-700 shadow-xl ring-1 ring-black/5 backdrop-blur-md"
                      onMouseEnter={() => handleMouseEnterForMark(item._id)}
                      onMouseLeave={() => handleMouseLeaveForMark(null)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        className="block w-full px-4 py-2 text-left transition-colors hover:bg-blue-50 hover:text-blue-700"
                        onClick={() => handleMarkUpdate(item.chatId, "good")}
                      >
                        High Amount
                      </button>
                      <button
                        type="button"
                        className="block w-full px-4 py-2 text-left transition-colors hover:bg-blue-50 hover:text-blue-700"
                        onClick={() => handleMarkUpdate(item.chatId, "average")}
                      >
                        Average
                      </button>
                      <button
                        type="button"
                        className="block w-full px-4 py-2 text-left transition-colors hover:bg-blue-50 hover:text-blue-700"
                        onClick={() => handleMarkUpdate(item.chatId, "bed")}
                      >
                        Low Amount
                      </button>
                      <button
                        type="button"
                        className="block w-full px-4 py-2 text-left transition-colors hover:bg-blue-50 hover:text-blue-700"
                        onClick={() => handleMarkUpdate(item.chatId, "unknown")}
                      >
                        Unknown
                      </button>
                    </motion.div>
                  )} */}

                  {/* Action Dropdown */}
                  {dropdownOpen === item._id && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-8 top-10 z-50 w-44 rounded-xl border border-gray-100 bg-white/95 py-1.5 text-sm font-medium text-gray-700 shadow-xl ring-1 ring-black/5 backdrop-blur-md"
                      onMouseEnter={() => handleMouseEnter(item._id)}
                      onMouseLeave={() => handleMouseLeave(null)}
                    >
                      <button
                        type="button"
                        className="block w-full px-4 py-2.5 text-left transition-colors hover:bg-blue-50 hover:text-blue-700"
                        onClick={() => togglePinFunction(item._id)}
                      >
                        📌 Pin Chat
                      </button>
                      <button
                        type="button"
                        className="block w-full px-4 py-2.5 text-left transition-colors hover:bg-blue-50 hover:text-blue-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsUnreadFunction(item);
                        }}
                      >
                        📩 Mark as Unread
                      </button>

                      {(Cookies.get("role") === "admin" || Cookies.get("role") === "owner") && (
                        <>
                          <div className="mx-3 my-1 h-px bg-gray-100" />
                          <button
                            type="button"
                            className="block w-full px-4 py-2.5 text-left text-rose-600 transition-colors hover:bg-rose-50"
                            onClick={() => deleteChat(item._id)}
                          >
                            ❌ Clear Chats
                          </button>
                          <button
                            type="button"
                            className="block w-full px-4 py-2.5 text-left text-rose-600 transition-colors hover:bg-rose-50"
                            onClick={() => deleteContact(item._id)}
                          >
                            ❌ Delete Contact
                          </button>
                        </>
                      )}
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <FaWhatsapp className="text-green-500" size={32} />
            </div>
            <p className="text-base font-bold text-gray-800">
              No contacts found
            </p>
            <p className="mt-1.5 max-w-[200px] text-sm text-gray-500">
              Search or add a new conversation to get started.
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="shrink-0 border-t border-gray-100 bg-gray-50/50 px-4 py-3.5">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
            onClick={handlePrevPage}
            disabled={currentContactPage === 1}
          >
            Previous
          </button>

          <p className="whitespace-nowrap text-xs font-semibold text-gray-500">
            Page <span className="text-gray-900">{currentContactPage}</span> of{" "}
            <span className="text-gray-900">{totalContactPage || 1}</span>
          </p>

          <button
            type="button"
            className="rounded-xl border border-transparent bg-blue-100 px-4 py-2 text-xs font-bold text-blue-700 shadow-sm transition-all hover:bg-blue-200 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
            onClick={handleNextPage}
            disabled={currentContactPage >= totalContactPage}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserCard;