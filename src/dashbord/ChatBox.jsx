import { useState, useEffect, useRef, useMemo } from "react";
import { 
  FaSearch, 
  FaPaperPlane, 
  FaArrowDown, 
  FaArrowAltCircleUp,
  FaChevronUp,
  FaChevronDown
} from "react-icons/fa";
import { FaArrowLeft } from "react-icons/fa";
import { IoDocumentAttach } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { MdAddTask, MdMoreVert, MdPhone, MdEmojiEmotions } from "react-icons/md";
import axios from "axios";
import Cookies from "js-cookie";
import moment from "moment";
import { selectContact, changeLevelOfSelectedContact, changeBrandOfSelectedContact, } from "../features/contactsSlice";
import { useDispatch, useSelector } from "react-redux";
import {
  addMessage,
  setMessages,
  setOlderMessages,
  setShowForwardModal,
  selectForward,
  emptytMsgToForward,
} from "../features/messagesSlice";
import { addContact } from "../features/contactsSlice";
import MessageCard from "../cards/MessageCard";
import SendMediaForm from "../components/mediaSending";
import { addQuery } from "../features/taskSlice";
import quickReplies1 from "./quickReplyTexts";
import quickReplies2 from "./quickReplyTexts2";
import toast from "react-hot-toast";
import ActiveSessions from "./ActiveSessions";

const COMMON_EMOJIS = [
  "😀","😂","😅","😍","🥰","😘","😊","😇","😉","🙃",
  "😋","😎","🥳","😏","😒","😔","🥺","😭","😤","😡",
  "🤯","😳","🥶","😱","👍","👎","🙏","👏","🤝","✨",
  "🔥","💯","❤️","💔","🎉","🎊","🎁","🎈","💼","🚀"
];

let quickReplies = quickReplies2;

const ChatBox = ({ onBackToContacts }) => {
  const dispatch = useDispatch();

  const [enteredMessage, setEnteredMessage] = useState("");
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
  const [mediaOn, setMediaOn] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [filteredReplies, setFilteredReplies] = useState([]);
  const [contactLevel, setContactLevel] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // WhatsApp-style Search State
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [matchIndices, setMatchIndices] = useState([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const [contactBrand, setContactBrand] = useState("");
  const [isPastingImage, setIsPastingImage] = useState(false);
  const [pastedImage, setPastedImage] = useState(null);
  const [pastedImagePreview, setPastedImagePreview] = useState("");
  const [pastedImageCaption, setPastedImageCaption] = useState("");
  const [isSendingPastedImage, setIsSendingPastedImage] = useState(false);

  const deviceDetails = useSelector((state) => state.contacts.deviceDetails);
  const selectedContact = useSelector((state) => state.contacts.selectedContact);
  const allmessages = useSelector((state) => state.messages.chatMessages);
  const forwardMessages = useSelector(
    (state) => state.messages.forwardMessage || []
  );
  const selectForwardValue = useSelector(
    (state) => state.messages.selectForward
  );

  const currentMessages = allmessages[selectedContact?._id] || [];

  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  const quickReplies = useMemo(() => {
    return deviceDetails.device === "device 1" ? quickReplies1 : quickReplies2;
  }, [deviceDetails.device]);

  useEffect(() => {
    setEnteredMessage("");
    setContactLevel(selectedContact?.level || "new client");
    setContactBrand(selectedContact?.brand || "");
    setShowEmojiPicker(false);
    setIsSearching(false);
    setSearchQuery("");
  }, [selectedContact?._id]);

  useEffect(() => {
    if (selectedContact && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedContact?._id]);

  useEffect(() => {
    if (!isSearching || !searchQuery.trim()) {
      setMatchIndices((prev) => (prev.length ? [] : prev));
      setCurrentMatchIndex((prev) => (prev !== -1 ? -1 : prev));
      return;
    }

    const query = searchQuery.toLowerCase();

    const indices = currentMessages.reduce((acc, msg, idx) => {
      const textBody = msg?.message?.text?.body || "";

      if (textBody.toLowerCase().includes(query)) {
        acc.push(idx);
      }

      return acc;
    }, []);

    setMatchIndices((prev) => {
      const same =
        prev.length === indices.length &&
        prev.every((value, index) => value === indices[index]);

      return same ? prev : indices;
    });

    setCurrentMatchIndex((prev) => {
      if (indices.length === 0) return prev !== -1 ? -1 : prev;

      if (prev >= 0 && prev < indices.length) return prev;

      return 0;
    });
  }, [searchQuery, isSearching, currentMessages.length]);

  useEffect(() => {
    if (currentMatchIndex < 0 || currentMatchIndex >= matchIndices.length) return;

    const targetIdx = matchIndices[currentMatchIndex];
    const msg = currentMessages[targetIdx];

    if (!msg) return;

    const element = document.getElementById(`msg-wrapper-${msg._id || targetIdx}`);

    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentMatchIndex, matchIndices, currentMessages.length]);

  const handleSearchUp = () => {
    if (currentMatchIndex < matchIndices.length - 1) {
      setCurrentMatchIndex((prev) => prev + 1);
    }
  };

  const handleSearchDown = () => {
    if (currentMatchIndex > 0) {
      setCurrentMatchIndex((prev) => prev - 1);
    }
  };

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isScrolledUp = scrollTop + clientHeight < scrollHeight - 80;
      setShowScrollButton(isScrolledUp);
    }
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      setShowScrollButton(false);
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const chatBox = chatContainerRef.current;
    if (chatBox) {
      chatBox.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (chatBox) {
        chatBox.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const showOlderMsg = async () => {
    if (!selectedContact?._id) return;

    toast.loading("Loading...", {
      duration: 1000,
      position: "top-center",
      style: {
        background: "#F59E0B",
        color: "white",
        fontWeight: "bold",
        padding: "10px 14px",
        borderRadius: "10px",
        fontSize: "13px",
      },
    });

    const result = await axios.get(
      `${process.env.REACT_APP_BACKEND_URL}/api/getPostDataOnMongo/messages/${selectedContact?._id}`,
      {
        params: {
          skip: currentMessages.length || 0,
          limit: 70,
        },
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      }
    );

    if (result.data.messages.length === 0) {
      toast.error("No more messages are there...", {
        duration: 2000,
        position: "top-center",
        style: {
          background: "#EC4899",
          color: "white",
          fontWeight: "bold",
          padding: "10px 14px",
          borderRadius: "10px",
          fontSize: "13px",
        },
      });
    } else {
      toast.success("70 more old messages received.", {
        duration: 2000,
        position: "top-center",
        style: {
          background: "#10B981",
          color: "white",
          fontWeight: "bold",
          padding: "10px 14px",
          borderRadius: "10px",
          fontSize: "13px",
        },
      });
    }

    dispatch(
      setOlderMessages({
        chatId: selectedContact._id,
        messages: result.data.messages,
      })
    );
  };

  const handleChange = (e) => {
    let text = e.target.value;
    if (text === " ") text = "";

    setEnteredMessage(text);

    if (text.indexOf("/") === -1) {
      setShowQuickReplies(false);
    }

    if (text.endsWith("/")) {
      setShowQuickReplies(true);
      setFilteredReplies(quickReplies);
    } else if (showQuickReplies) {
      const searchText = text.split("/").pop().toLowerCase();
      setFilteredReplies(
        quickReplies.filter((reply) =>
          reply.title.toLowerCase().includes(searchText)
        )
      );
    } else {
      setShowQuickReplies(false);
    }
  };

  const handleEmojiClick = (emoji) => {
    setEnteredMessage((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  const handleQuickReplySelect = (reply) => {
    const textBeforeSlash = enteredMessage.substring(
      0,
      enteredMessage.lastIndexOf("/")
    );
    setEnteredMessage(textBeforeSlash + reply.message + "");
    setShowQuickReplies(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    const getMessages = async () => {
      if (!selectedContact?._id) return;
      const result = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/getPostDataOnMongo/messages/${selectedContact?._id}`,
        {
          params: { skip: 0, limit: 40 },
          headers: { Authorization: `Bearer ${Cookies.get("token")}` },
        }
      );
      dispatch(
        setMessages({
          chatId: selectedContact._id,
          messages: result.data.messages,
        })
      );
    };

    const currentMessagesLength = currentMessages?.length || 0;

    if (
      selectedContact &&
      (currentMessagesLength < 30 || selectedContact.unread_count)
    ) {
      getMessages();
    }
  }, [selectedContact, dispatch]);

  const copyToClipboard = (data) => {
    try {
      const formattedData =
        typeof data === "object" ? JSON.stringify(data, null, 2) : String(data);

      navigator.clipboard
        .writeText(formattedData)
        .then(() => {
          toast.success("🎉 Selected ID copied!", {
            duration: 1500,
            position: "top-center",
            style: {
              background: "#10B981",
              color: "white",
              fontWeight: "bold",
              padding: "10px 14px",
              borderRadius: "10px",
              fontSize: "13px",
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

  const checkQuickReplyMatch = (message) => {
    return (
      quickReplies.find(
        (qr) => qr.message.trim().toLowerCase() === message.trim().toLowerCase()
      ) || null
    );
  };

  const detectSensitiveInfo = (message) => {
    if (checkQuickReplyMatch(message)) {
      return false;
    }

    const patterns = {
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/g,
      contactNumber:
        /\b(?:\+\d{1,3}[-.\s]?)?(?:\(?\d{2,4}\)?[-.\s]?)?\d{1,5}[-.\s]?\d{1,5}[-.\s]?\d{1,5}\b/g,
      upiID: /\b[A-Za-z0-9.-]+@[A-Za-z]+\b/g,
    };

    const found = {
      email: message.match(patterns.email) || [],
      contactNumber: message.match(patterns.contactNumber) || [],
      upiID: message.match(patterns.upiID) || [],
    };

    const contactNumber = found.contactNumber.filter((phone) => phone.length >= 9);
    found.contactNumber = contactNumber;

    return found.email.length || found.contactNumber.length || found.upiID.length;
  };

  const handleSendMessage = async () => {
    try {
      if (!selectedContact) return;

      if (
        deviceDetails.role !== "admin" &&
        deviceDetails.role !== "owner" &&
        detectSensitiveInfo(enteredMessage)
      ) {
        alert("To send this message contact admin.");
        return;
      }

      if (!enteredMessage.trim()) {
        alert("Please enter message then send.");
        return;
      }

      const sendMSg = enteredMessage;
      setEnteredMessage("");
      setShowEmojiPicker(false);

      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/getPostDataOnMongo/sendmessage`,
        {
          phone_number: selectedContact.phone_number,
          message: {
            type: "text",
            text: { body: sendMSg },
          },
          direction: "sent",
          components: [],
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
      }
    } catch (error) {
      console.error("Error sending message:", error.response?.data || error.message);
    }
  };

  const handleChangeLevel = async (e) => {
    if (!selectedContact?._id) {
      toast.error("No contact selected.");
      return;
    }

    const previousLevel = contactLevel || selectedContact?.level || "new client";
    const newLevel = e.target.value;

    setContactLevel(newLevel);

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/getPostDataOnMongo/contact/${selectedContact._id}/level`,
        {
          level: newLevel,
          chatId: selectedContact.chatId,
          phone_number: selectedContact.phone_number,
          tutorID: selectedContact.tutorID,
          clientID: selectedContact.clientID,
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      const updatedContact = response.data?.data;

      if (!updatedContact) {
        throw new Error("Updated contact not received from backend.");
      }

      dispatch(changeLevelOfSelectedContact(updatedContact));
      dispatch(addContact(updatedContact));

      toast.success("Level updated successfully.");
    } catch (error) {
      setContactLevel(previousLevel);
      toast.error(error.response?.data?.message || "Failed to update level.");
    }
  };

  const handleChangeBrand = async (e) => {
    if (!selectedContact?._id) {
      toast.error("No contact selected.");
      return;
    }

    const previousBrand = contactBrand || "";
    const newBrand = e.target.value;

    setContactBrand(newBrand);

    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/getPostDataOnMongo/contact/${selectedContact._id}/brand`,
        { brand: newBrand },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      const updatedContact = response.data?.data;

      if (!updatedContact) {
        throw new Error("Updated contact not received from backend.");
      }

      dispatch(changeBrandOfSelectedContact(updatedContact));
      dispatch(addContact(updatedContact));

      toast.success("Brand updated successfully.");
    } catch (error) {
      setContactBrand(previousBrand);
      toast.error(error.response?.data?.message || "Failed to update brand.");
    }
  };

  const handleOptionClick = (action) => {
    if (action === "closechat") dispatch(selectContact(null));
    setContextMenu({ ...contextMenu, visible: false });
  };

  const addQueryFunction = async () => {
    try {
      if (!selectedContact?.chatId) return;

      const isConfirmed = window.confirm("Are you sure you want to add a query?");
      if (!isConfirmed) return;

      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/query/create`,
        { chatId: selectedContact.chatId },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        dispatch(addQuery(response.data));
        toast.success("Query Added Successfully.", {
          duration: 2000,
          position: "top-center",
          style: {
            background: "#10B981",
            color: "white",
            fontWeight: "bold",
            padding: "10px 14px",
            borderRadius: "10px",
            fontSize: "13px",
          },
        });
      } else {
        toast.success(response.data.message, {
          duration: 2000,
          position: "top-center",
          style: {
            background: "#EC4899",
            color: "white",
            fontWeight: "bold",
            padding: "10px 14px",
            borderRadius: "10px",
            fontSize: "13px",
          },
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add query.", {
        duration: 3000,
        position: "top-center",
        style: {
          background: "#EF4444",
          color: "white",
          fontWeight: "bold",
          padding: "10px 14px",
          borderRadius: "10px",
          fontSize: "13px",
        },
      });
    }
  };

  const contactInitial = selectedContact?.name?.charAt(0)?.toUpperCase() || "?";
  const isTutor = selectedContact?.tutorID && selectedContact?.tutorID !== "TI0000";
  const contactLabel = isTutor ? "Tutor" : "Client";

  const handlePasteImage = (event) => {
    const clipboardItems = Array.from(
      event.clipboardData?.items || []
    );

    const imageItem = clipboardItems.find(
      (item) =>
        item.kind === "file" &&
        item.type.startsWith("image/")
    );

    if (!imageItem) return;

    event.preventDefault();

    const imageFile = imageItem.getAsFile();

    if (!imageFile) {
      toast.error("Unable to read pasted screenshot.");
      return;
    }

    if (pastedImagePreview) {
      URL.revokeObjectURL(pastedImagePreview);
    }

    const previewUrl = URL.createObjectURL(imageFile);

    setPastedImage(imageFile);
    setPastedImagePreview(previewUrl);
    setPastedImageCaption("");
  };

  const closePastedImagePreview = () => {
    if (pastedImagePreview) {
      URL.revokeObjectURL(pastedImagePreview);
    }

    setPastedImage(null);
    setPastedImagePreview("");
    setPastedImageCaption("");
  };

  useEffect(() => {
    return () => {
      if (pastedImagePreview) {
        URL.revokeObjectURL(pastedImagePreview);
      }
    };
  }, [pastedImagePreview]);

  const sendPastedImage = async () => {
    if (!selectedContact?.phone_number) {
      toast.error("Please select a contact first.");
      return;
    }

    if (!pastedImage) {
      toast.error("No screenshot selected.");
      return;
    }

    if (isSendingPastedImage) return;

    try {
      setIsSendingPastedImage(true);

      const originalExtension =
        pastedImage.type?.split("/")[1] || "png";

      const extension =
        originalExtension === "jpeg"
          ? "jpg"
          : originalExtension;

      const filename = `screenshot-${Date.now()}.${extension}`;

      const formData = new FormData();

      formData.append(
        "recipient",
        selectedContact.phone_number
      );

      formData.append("mediaType", "image");
      formData.append(
        "caption",
        pastedImageCaption.trim()
      );
      formData.append("filename", filename);
      formData.append("file", pastedImage, filename);

      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/getPostDataOnMongo/send-media`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );

      const updatedContact =
        response.data?.contact;

      const savedMessage =
        response.data?.savedMessage;

      if (updatedContact && savedMessage) {
        dispatch(
          addContact({
            ...updatedContact,
            last_message_id: savedMessage,
          })
        );

        dispatch(
          addMessage({
            chatId: savedMessage.contact_id,
            message: savedMessage,
          })
        );
      }

      toast.success("Screenshot sent successfully.");

      closePastedImagePreview();
    } catch (error) {
      console.error(
        "Screenshot upload error:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.error ||
          "Failed to send screenshot."
      );
    } finally {
      setIsSendingPastedImage(false);
    }
  };

  return (
    <div
      className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-[var(--background,#f8fafc)]"
      onClick={() => {
        if (showEmojiPicker) setShowEmojiPicker(false);
      }}
    >
      {selectedContact ? (
        <>
          {/* Header - Compact SaaS Header */}
          <header className="shrink-0 border-b border-[var(--border,theme(colors.slate.200))] bg-[var(--card,white)] px-4 py-2.5 z-20 h-[60px] flex flex-col justify-center">
            {isSearching ? (
              <div className="flex w-full items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-150">
                <button
                  onClick={() => {
                    setIsSearching(false);
                    setSearchQuery("");
                  }}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                >
                  <IoMdClose size={18} />
                </button>
                <div className="relative flex-1 flex items-center">
                  <FaSearch className="absolute left-3 text-slate-400" size={13} />
                  <input
                    type="text"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search in conversation..."
                    className="h-9 w-full rounded-lg border border-[var(--border,theme(colors.slate.200))] bg-slate-50 pl-9 pr-24 text-xs font-medium outline-none transition-all focus:border-[var(--primary,theme(colors.blue.600))] focus:bg-white focus:ring-2 focus:ring-blue-500/10"
                  />
                  {searchQuery && (
                    <div className="absolute right-2 flex items-center gap-1 text-[10px] font-bold text-slate-500">
                      <span className="mr-1">
                        {matchIndices.length > 0 ? `${currentMatchIndex + 1} of ${matchIndices.length}` : "0 of 0"}
                      </span>
                      <button
                        onClick={handleSearchUp}
                        disabled={currentMatchIndex >= matchIndices.length - 1 || matchIndices.length === 0}
                        className="flex h-5 w-5 items-center justify-center rounded hover:bg-slate-200 disabled:opacity-30"
                      >
                        <FaChevronUp size={10} />
                      </button>
                      <button
                        onClick={handleSearchDown}
                        disabled={currentMatchIndex <= 0 || matchIndices.length === 0}
                        className="flex h-5 w-5 items-center justify-center rounded hover:bg-slate-200 disabled:opacity-30"
                      >
                        <FaChevronDown size={10} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3 animate-in fade-in duration-150">
                <div className="flex min-w-0 items-center gap-3">
                  {onBackToContacts && (
                    <button
                      type="button"
                      onClick={onBackToContacts}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 md:hidden"
                      aria-label="Back to contacts"
                      title="Back to contacts"
                    >
                      <FaArrowLeft size={14} />
                    </button>
                  )}

                  <div
                    className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-sm ${
                      isTutor
                        ? "bg-gradient-to-br from-teal-400 to-teal-500 text-white"
                        : "bg-gradient-to-br from-amber-300 to-amber-400 text-amber-900"
                    }`}
                  >
                    {contactInitial}
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(selectedContact.chatId)}
                        className="truncate text-xs font-semibold text-slate-900 transition-colors hover:text-blue-600 sm:text-sm"
                        title="Copy Chat ID"
                      >
                        {selectedContact.chatId || "Chat"}
                      </button>

                      <span className="hidden text-slate-300 sm:inline">·</span>

                      <p className="hidden truncate text-xs font-medium text-slate-500 sm:block">
                        {selectedContact.name}
                      </p>
                    </div>

                    <div className="mt-0.5 flex items-center gap-2">
                      <span
                        className={`rounded px-1.5 py-0.2 text-[9px] font-semibold tracking-wide uppercase ${
                          isTutor ? "bg-teal-50 text-teal-700" : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {contactLabel}
                      </span>

                      {isTutor && (
                        <>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedContact.tutorID)}
                            className="hidden text-[10px] font-medium text-teal-600 hover:underline lg:block"
                          >
                            {selectedContact.tutorID}
                          </button>

                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedContact.phone_number)}
                            className="hidden text-[10px] font-medium text-slate-600 hover:underline lg:block"
                          >
                            {selectedContact.phone_number?.slice(0, 5) || ""}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  {!isTutor && (
                    <select
                      className="hidden h-8 max-w-[80px] cursor-pointer rounded-lg border border-[var(--border,theme(colors.slate.200))] bg-slate-50 px-2 text-[11px] font-semibold text-purple-700 outline-none transition-all hover:bg-slate-100 focus:border-purple-500 focus:bg-white md:block"
                      value={contactBrand}
                      onChange={handleChangeBrand}
                      title="Change Brand"
                    >
                      <option value="">NA</option>
                      <option value="AW">AW</option>
                      <option value="GM">GM</option>
                      <option value="AG">AG</option>
                      <option value="IS">IS</option>
                      <option value="MA">MA</option>
                      <option value="GS">GS</option>
                      <option value="TH">TH</option>
                    </select>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsSearching(true)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-blue-600"
                    title="Search Messages"
                  >
                    <FaSearch size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={addQueryFunction}
                    className="hidden h-8 w-8 items-center justify-center rounded-lg text-blue-600 transition-colors hover:bg-blue-50 md:flex"
                    title="Add Query"
                  >
                    <MdAddTask size={16} />
                  </button>

                  <select
                    className="hidden h-8 max-w-[110px] cursor-pointer rounded-lg border border-[var(--border,theme(colors.slate.200))] bg-slate-50 px-2 text-[11px] font-semibold text-blue-700 outline-none transition-all hover:bg-slate-100 focus:border-blue-500 focus:bg-white lg:block"
                    value={contactLevel}
                    onChange={handleChangeLevel}
                    title="Change Level"
                  >
                    <option value="new client">New Client</option>
                    <option value="old client">Old Client</option>
                    <option value="tutor">Tutor</option>
                    <option value="useless">Useless</option>
                    <option value="int_comm">Int_Comm</option>
                  </select>

                  <button
                    type="button"
                    onClick={(e) => {
                      setContextMenu({
                        visible: true,
                        x: e.clientX,
                        y: e.clientY,
                      });
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                    title="More"
                  >
                    <MdMoreVert size={18} />
                  </button>
                </div>
              </div>
            )}
          </header>

          {/* Messages Area */}
          <main
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu({ visible: true, x: e.clientX, y: e.clientY });
            }}
            className="relative min-h-0 flex-1 overflow-hidden bg-slate-50/50"
          >
            {showScrollButton && (
              <button
                type="button"
                className="absolute bottom-4 left-1/2 z-40 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-blue-600 shadow-md backdrop-blur-sm transition-transform hover:scale-105"
                onClick={scrollToBottom}
                title="Scroll to bottom"
              >
                <FaArrowDown size={12} />
              </button>
            )}

            {selectForwardValue && (
              <div className="absolute bottom-3 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 shadow-xl">
                <span className="text-xs font-bold text-slate-700">
                  {forwardMessages.length} selected
                </span>

                <button
                  type="button"
                  disabled={forwardMessages.length === 0}
                  onClick={() => dispatch(setShowForwardModal(true))}
                  className="rounded-full bg-blue-600 px-3 py-1.5 text-[11px] font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Forward
                </button>

                <button
                  type="button"
                  onClick={() => {
                    dispatch(emptytMsgToForward([]));
                    dispatch(selectForward(false));
                    dispatch(setShowForwardModal(false));
                  }}
                  className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-600 transition hover:bg-slate-200"
                >
                  Cancel
                </button>
              </div>
            )}

            <div
              ref={chatContainerRef}
              className="flex h-full min-h-0 flex-col-reverse overflow-y-auto px-3 py-4 scrollbar-hide sm:px-6"
            >
              <div className="flex w-full flex-col-reverse gap-2.5">
                {currentMessages.map((msg, index, arr) => {
                  const msgDate = moment(msg.timestamp).startOf("day");
                  const nextMsgDate =
                    index < arr.length - 1
                      ? moment(arr[index + 1].timestamp).startOf("day")
                      : null;

                  const today = moment().startOf("day");
                  const yesterday = moment().subtract(1, "days").startOf("day");

                  let dateLabel = null;

                  if (!nextMsgDate || !msgDate.isSame(nextMsgDate)) {
                    if (msgDate.isSame(today)) {
                      dateLabel = "Today";
                    } else if (msgDate.isSame(yesterday)) {
                      dateLabel = "Yesterday";
                    } else {
                      dateLabel = msgDate.format("DD MMM YYYY");
                    }
                  }

                  const isMatched = matchIndices.includes(index);
                  const isFocusedMatch = currentMatchIndex !== -1 && matchIndices[currentMatchIndex] === index;

                  return (
                    <div 
                      key={msg.created_at || msg._id || index}
                      id={`msg-wrapper-${msg._id || index}`}
                      className={`transition-all duration-200 rounded-lg ${
                        isFocusedMatch
                          ? "bg-blue-100/40 p-1.5 -mx-1.5 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.2)]"
                          : isMatched
                          ? "bg-amber-50/50 p-1.5 -mx-1.5"
                          : ""
                      }`}
                    >
                      {dateLabel && (
                        <div className="my-3 flex justify-center">
                          <span className="rounded-full bg-white px-3 py-1 text-[9px] font-bold tracking-wider text-slate-400 uppercase shadow-sm border border-slate-100">
                            {dateLabel}
                          </span>
                        </div>
                      )}
                      <MessageCard msg={msg} />
                    </div>
                  );
                })}

                <button
                  type="button"
                  className="mx-auto my-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm border border-slate-100 transition-colors hover:text-blue-600"
                  onClick={showOlderMsg}
                  title="Load older messages"
                >
                  <FaArrowAltCircleUp size={14} />
                </button>
              </div>
            </div>

            {/* Quick Reply Dropdown */}
            {showQuickReplies && filteredReplies.length > 0 && (
              <ul className="absolute bottom-3 left-3 right-3 z-50 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white/95 p-1 shadow-xl backdrop-blur-md sm:left-6 sm:right-6 md:left-auto md:w-80">
                {filteredReplies.map((reply, index) => (
                  <li
                    key={index + reply.title}
                    className="cursor-pointer rounded-lg px-2.5 py-2 text-xs transition-colors hover:bg-slate-50"
                    onClick={() => handleQuickReplySelect(reply)}
                  >
                    <span className="font-semibold text-slate-900">
                      {reply.title}:
                    </span>{" "}
                    <span
                      className={`text-slate-600 ${
                        reply.des ? "italic font-normal" : ""
                      }`}
                    >
                      {reply.message}
                    </span>
                    {reply.des && (
                      <span className="text-slate-400">
                        {" "}
                        — {reply.des}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </main>

          {mediaOn && <SendMediaForm setMediaOn={setMediaOn} />}

          {/* Input Footer */}
          <footer className="shrink-0 border-t border-[var(--border,theme(colors.slate.200))] bg-[var(--card,white)] px-3 py-2.5 z-20">
            <div className="flex items-center gap-2">
              {/* Emoji Picker Button */}
              <div className="relative">
                {showEmojiPicker && (
                  <div 
                    className="absolute bottom-12 left-0 z-50 w-64 rounded-xl border border-slate-200 bg-white p-2.5 shadow-xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="grid grid-cols-8 gap-1.5">
                      {COMMON_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => handleEmojiClick(emoji)}
                          className="flex h-7 w-7 items-center justify-center rounded text-base hover:bg-slate-100 active:scale-90 transition-transform"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                    showEmojiPicker 
                      ? "bg-blue-50 text-blue-600" 
                      : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEmojiPicker(!showEmojiPicker);
                  }}
                  title="Insert Emoji"
                >
                  <MdEmojiEmotions size={20} />
                </button>
              </div>

              {/* File Upload Button */}
              <button
                type="button"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                onClick={() => setMediaOn(true)}
                title="Attach document"
              >
                <IoDocumentAttach size={20} />
              </button>

              <textarea
                ref={inputRef}
                value={enteredMessage}
                onChange={handleChange}
                onPaste={handlePasteImage}
                placeholder="Type a message or paste a screenshot..."
                rows={1}
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
                className="h-9 min-h-[36px] flex-1 resize-none rounded-lg border border-[var(--border,theme(colors.slate.200))] bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500/10"
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey
                  ) {
                    event.preventDefault();
                    handleSendMessage();
                  }
                }}
              />

              <button
                type="button"
                onClick={handleSendMessage}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--primary,theme(colors.blue.600))] text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95"
                title="Send message"
              >
                <FaPaperPlane size={13} />
              </button>
            </div>
          </footer>
        </>
      ) : (
        <div className="flex h-full min-h-0 flex-1 items-center justify-center bg-slate-50 p-6 text-center text-slate-500">
          {(Cookies.get("role") === "admin" ||
            Cookies.get("role") === "owner") ? (
            <div className="h-full w-full overflow-hidden">
              <ActiveSessions />
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white px-8 py-10 shadow-sm max-w-sm">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <FaPaperPlane size={20} />
              </div>
              <p className="text-sm font-semibold text-slate-900">
                Your Inbox is Ready
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Select a conversation from the left panel to start chatting.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Pasted screenshot preview */}
      {pastedImagePreview && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-slate-900 shadow-2xl">
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3">
              <div>
                <p className="text-xs font-bold text-white">
                  Screenshot preview
                </p>
                <p className="text-[10px] text-slate-400">
                  Add a caption before sending
                </p>
              </div>

              <button
                type="button"
                onClick={closePastedImagePreview}
                disabled={isSendingPastedImage}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-40"
              >
                <IoMdClose size={18} />
              </button>
            </div>

            {/* Image preview */}
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-black/40 p-6">
              <img
                src={pastedImagePreview}
                alt="Screenshot preview"
                className="max-h-[55vh] max-w-full rounded-lg object-contain"
              />
            </div>

            {/* Caption and actions */}
            <div className="shrink-0 border-t border-white/10 bg-slate-800 p-3">
              <textarea
                value={pastedImageCaption}
                onChange={(event) =>
                  setPastedImageCaption(event.target.value)
                }
                placeholder="Add a caption..."
                rows={2}
                disabled={isSendingPastedImage}
                className="w-full resize-none rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white outline-none placeholder:text-slate-500 focus:border-blue-500 disabled:opacity-50"
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey
                  ) {
                    event.preventDefault();
                    sendPastedImage();
                  }
                }}
              />

              <div className="mt-2.5 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={closePastedImagePreview}
                  disabled={isSendingPastedImage}
                  className="rounded-lg bg-white/10 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/20 disabled:opacity-40"
                >
                  Remove
                </button>

                <button
                  type="button"
                  onClick={sendPastedImage}
                  disabled={isSendingPastedImage}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-wait disabled:opacity-60"
                >
                  {isSendingPastedImage ? "Sending..." : "Send"}
                  {!isSendingPastedImage && <FaPaperPlane size={11} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu.visible && (
        <div
          className="fixed z-[90] min-w-[140px] rounded-lg border border-slate-200 bg-white/95 p-1 text-xs font-medium text-slate-700 shadow-xl backdrop-blur-md"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onMouseLeave={() =>
            setContextMenu({ ...contextMenu, visible: false })
          }
        >
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded px-2.5 py-2 transition-colors hover:bg-rose-50 hover:text-rose-600"
            onClick={() => handleOptionClick("closechat")}
          >
            <IoMdClose size={15} />
            Close Chat
          </button>

          <button
            type="button"
            className="flex w-full items-center gap-2 rounded px-2.5 py-2 transition-colors hover:bg-blue-50 hover:text-blue-700 md:hidden"
            onClick={addQueryFunction}
          >
            <MdAddTask size={15} />
            Add Query
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatBox;