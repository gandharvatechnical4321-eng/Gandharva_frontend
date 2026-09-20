import React, { useState ,useRef,useEffect} from "react"; 
import toast from "react-hot-toast";
import { MdCancel } from "react-icons/md";
import { IoSend } from "react-icons/io5";
import Draggable from "react-draggable";
import axios from "axios";
import Cookies from "js-cookie";
import { useDispatch,useSelector } from "react-redux";
import { selectForward,emptytMsgToForward, setShowForwardModal, } from "../features/messagesSlice";
import { addContact, selectContact } from "../features/contactsSlice";
import { addMessage } from "../features/messagesSlice";
const ForwardMessageCard = () => {
    const dispatch = useDispatch()
    const contacts= useSelector((state)=>state.contacts.contacts)
    const selectForwardValue = useSelector((state)=>state.messages.selectForward)
    const forwardMessages = useSelector((state)=>state.messages.forwardMessage)
    const nodeRef = useRef(null);
  const [search, setSearch] = useState("");
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [searchedContact,setSearchedContact]=useState(contacts)
const searchCo = async()=>{
  const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/getPostDataOnMongo/searchcontact?q=${search}&limit=11`,
    {
      headers: {
          Authorization: `Bearer ${Cookies.get("token")}`, // Fetch token from localStorage
      },
  }
  );
  const { data, pagination } = response?.data || {};
  setSearchedContact(data)
}
// Fetch tutors on search term or page change (debounced)
    useEffect(() => {
      const delayDebounce = setTimeout(() => {
        if(search.length>0)searchCo();
      }, 1000); // Delay the API call for 500ms
      return () => clearTimeout(delayDebounce);
    }, [search]);

  const handleSearch = async (e) => {
    setSearch(e.target.value);
 
  };

  const toggleContactSelection = (contact) => {
    setSelectedContacts((prev) =>
      prev.some((val) => val.phone_number === contact.phone_number)  // Check if contact already exists in selectedContacts
        ? prev.filter((value) => value.phone_number !== contact.phone_number) // Deselect if already selected
        : [...prev, contact] // Add to selected if not already
    );
    console.log({selectedContacts})
  };

  //to delay api call 
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
//   const handleSend = async () => {
//     dispatch(selectForward(false));

//     if (!selectedContacts.length || !forwardMessages.length) {
//         alert("Please select Message and contact...");
//         return;
//     }

//     for (const contact of selectedContacts) {
//         for (const message of forwardMessages) {
//             try {
//                 let msg = message.message;
//                 if (msg?.sha256) {
//                     delete msg.sha256;
//                 }

//                 const response = await axios.post(
//                     `${process.env.REACT_APP_BACKEND_URL}/api/getPostDataOnMongo/forwardmessage`,
//                     {
//                         phone_number: contact.phone_number,
//                         message: msg,
//                         direction: "sent",
//                         components: []
//                     },
//                     {
//                         headers: {
//                             'Content-Type': 'application/json',
//                             'Authorization': `Bearer ${Cookies.get("token")}`,
//                         },
//                     }
//                 );

//                 console.log({ ressdsdsds: response.data });

//                 let data = response.data.contact;
//                 data.last_message_id = response.data.savedMessage;

//                 if (data) {
//                     await dispatch(addContact(data));
//                     await dispatch(addMessage({ chatId: response.data.savedMessage.contact_id, message: response.data.savedMessage }));
//                 }

//             } catch (error) {
//                 console.error('Error sending message:', error.response?.data || error.message);
//             }

//             // ✅ Add delay after each message is sent
//             await new Promise(resolve => setTimeout(resolve, 1000));
//         }
//     }

//     dispatch(emptytMsgToForward([]));
//     setSelectedContacts([]); // Clear selected contacts after sending
// };

const [isSending, setIsSending] = useState(false);

const handleSend = async () => {
  if (isSending) return;

  if (selectedContacts.length === 0) {
    alert("Please select at least one contact.");
    return;
  }

  if (forwardMessages.length === 0) {
    alert("Please select at least one message.");
    return;
  }

  try {
    setIsSending(true);

    let successCount = 0;
    let failedCount = 0;

    console.log("Selected contacts:", selectedContacts.length);
    console.log("Selected messages:", forwardMessages.length);

    for (const contact of selectedContacts) {
      for (const selectedMessage of forwardMessages) {
        try {
          /*
            Create a new object.

            Do not do:
            let msg = selectedMessage.message;
            delete msg.sha256;

            That directly modifies the Redux message object.
          */
          const messageToForward = JSON.parse(
            JSON.stringify(selectedMessage.message)
          );

          delete messageToForward.sha256;

          if (messageToForward.image) {
            delete messageToForward.image.sha256;
          }

          if (messageToForward.video) {
            delete messageToForward.video.sha256;
          }

          if (messageToForward.audio) {
            delete messageToForward.audio.sha256;
          }

          if (messageToForward.document) {
            delete messageToForward.document.sha256;
          }

          const response = await axios.post(
            `${process.env.REACT_APP_BACKEND_URL}/api/getPostDataOnMongo/forwardmessage`,
            {
              phone_number: contact.phone_number,
              message: messageToForward,
              direction: "sent",
            },
            {
              headers: {
                Authorization: `Bearer ${Cookies.get("token")}`,
                "Content-Type": "application/json",
              },
            }
          );

          const savedMessage = response.data?.savedMessage;
          const updatedContact = response.data?.contact;

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

          successCount += 1;

          console.log(
            `Forwarded message ${selectedMessage.message_id} to ${contact.name}`
          );
        } catch (messageError) {
          failedCount += 1;

          console.error(
            "Failed forwarding one message:",
            {
              contact: contact.name,
              messageId: selectedMessage.message_id,
              error:
                messageError.response?.data ||
                messageError.message,
            }
          );
        }

        // Small delay between WhatsApp requests
        await new Promise((resolve) =>
          setTimeout(resolve, 700)
        );
      }
    }

    if (successCount > 0) {
      toast.success(
        `${successCount} message${
          successCount > 1 ? "s" : ""
        } forwarded successfully`
      );
    }

    if (failedCount > 0) {
      toast.error(
        `${failedCount} message${
          failedCount > 1 ? "s" : ""
        } could not be forwarded`
      );
    }

    /*
      Clear selection only after all requests finish.
    */
    if (failedCount === 0) {
      dispatch(emptytMsgToForward([]));
      
      dispatch(setShowForwardModal(false));
      dispatch(selectForward(false));
      setSelectedContacts([]);
    }
  } finally {
    setIsSending(false);
  }
};


  return (
    <Draggable nodeRef={nodeRef}>

    <div ref={nodeRef}
     className="drag-handle border-2 border-gray-300 bg-gradient-to-r from-green-50 via-blue-100 to-purple-50  pt-2 rounded-md cursor-move"
    >
        <div><button className="text-red-600 p-2 float-end" onClick={() => {
  dispatch(setShowForwardModal(false));
  dispatch(selectForward(false));
  dispatch(emptytMsgToForward([]));
  setSelectedContacts([]);
}}><MdCancel size={23}/></button></div>
      <div className="px-2">
        <input
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={handleSearch}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 mb-4"
        />
      </div>
      <div className="h-[64vh] overflow-y-auto">
        {searchedContact.map((contact) => (
            <div
              key={contact._id}
              className="flex justify-between items-center p-2 border-b border-gray-100 hover:bg-gray-50"
            >
              <span>{contact.name}</span>
              <button
                onClick={() => toggleContactSelection(contact)}
                className={`px-3 py-1 rounded-md text-white ${
                    selectedContacts.some((val) => val.phone_number === contact.phone_number)
                    ? "bg-red-500"
                    : "bg-indigo-500 hover:bg-indigo-600"
                }`}
              >
                {/* {selectedContacts.includes(contact.id) ? "Deselect" : "Select"} */}
                {selectedContacts.some(
  (selectedContact) =>
    selectedContact.phone_number ===
    contact.phone_number
)
  ? "Deselect"
  : "Select"}
              </button>
            </div>
          ))}
      </div>
      <div className="pb-4 pr-2"> 
        {/* <button
          onClick={handleSend}
          className="w-fit cursor-pointer float-right text-right rounded-full m-auto p-2 bg-indigo-500 text-white hover:bg-indigo-600"
          disabled={selectedContacts.length === 0}
        >
         <IoSend size={25}/>
        </button> */}
        <button
  onClick={handleSend}
  disabled={
    isSending ||
    selectedContacts.length === 0 ||
    forwardMessages.length === 0
  }
  className="float-right m-auto w-fit cursor-pointer rounded-full bg-indigo-500 p-2 text-right text-white hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
>
  {isSending ? (
    <span className="px-2 text-sm">
      Sending...
    </span>
  ) : (
    <IoSend size={25} />
  )}
</button>
      </div>
    </div>
    </Draggable>
  );
};

export default ForwardMessageCard;
