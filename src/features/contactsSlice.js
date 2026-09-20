import { createSlice } from '@reduxjs/toolkit';
import axios from 'axios'; 
import notificationSound from "../audio/recived.mp3"; // Path to your notification sound
import messageSound from "../audio/chat.mp3";
import Cookies from "js-cookie";
 // Function to play sound
 const playSound = (soundFile) => {
  const audio = new Audio(soundFile);
  audio.play().catch((error) => console.error("Error playing sound:", error));
};

const contactsSlice = createSlice({
  name: 'contacts',
  initialState: {
    showAllTutorData:false,
    deviceDetails:{
      device:"Device 0",
      role:"user",
      phone_number:"916205792302"
    },
    searchContact:"",
    contacts: [],
    selectedContact: null, // To store the currently selected contact
    totalContactPage:1
  },
  reducers: {
  changeLevelOfSelectedContact: (state, action) => {
  const updatedContact = action.payload;

  if (!updatedContact?._id) return;

  if (state.selectedContact?._id === updatedContact._id) {
    state.selectedContact = {
      ...state.selectedContact,
      ...updatedContact,
    };
  }

  const contactIndex = state.contacts.findIndex(
    (contact) => contact._id === updatedContact._id
  );

  if (contactIndex !== -1) {
    state.contacts[contactIndex] = {
      ...state.contacts[contactIndex],
      ...updatedContact,
    };
  }
},

changeBrandOfSelectedContact: (state, action) => {
  const updatedContact = action.payload;

  if (!updatedContact?._id) return;

  if (state.selectedContact?._id === updatedContact._id) {
    state.selectedContact = {
      ...state.selectedContact,
      ...updatedContact,
    };
  }

  const contactIndex = state.contacts.findIndex(
    (contact) => contact._id === updatedContact._id
  );

  if (contactIndex !== -1) {
    state.contacts[contactIndex] = {
      ...state.contacts[contactIndex],
      ...updatedContact,
    };
  }
},
    setShowAllTutorData: (state, action) => {
      state.showAllTutorData = !state.showAllTutorData;
    },
    setDeviceDetails: (state, action) => {
      state.deviceDetails = action.payload;
    },
    setSearchContact: (state, action) => {
      state.searchContact = action.payload;
    },
    setTotalContactPage: (state, action) => {
      state.totalContactPage = action.payload;
    },
    //to set all contact 
    setContacts: (state, action) => {
      state.contacts = action.payload;
    },
    selectContact: (state, action) => {
      state.selectedContact = action.payload; // Save the selected contact details
    },
    addContact: (state, action) => {
      let newContact = action.payload;
      const contactIndex = state.contacts.findIndex(contact => contact._id === newContact._id);
      
      let updatedContact;
  
      if (contactIndex !== -1) {
         
       if(newContact.last_message_id?.direction === "received" && state.selectedContact?._id === newContact._id){
        newContact= {...newContact,unread_count:0}
      }
        // ✅ Update existing contact details but exclude phone_number
        const { phone_number, ...restNewContact } = newContact;
        updatedContact = { ...state.contacts[contactIndex], ...restNewContact };

        state.contacts.splice(contactIndex, 1); // Remove from current position
      } else {
        // ✅ New contact, add directly
        updatedContact = newContact;
      }
        // Play different sounds based on chat selection
        if (state.selectedContact?._id === newContact._id) {
          console.log({Sound:"messageSound"})
          playSound(messageSound); // Play sound for active chat
        } else {
          console.log({Sound:"notificationn"})
          playSound(notificationSound); // Play sound for new messages in other chats
        }
      // ✅ Find the correct insertion index
      let insertIndex = state.contacts.findIndex(contact => 
          !contact.pined && contact.lastMsgTime < updatedContact.lastMsgTime
      );
  
      if (insertIndex === -1) insertIndex = state.contacts.length; // Place at the end if needed
  
      // ✅ Ensure pined contacts stay at the top
      if (updatedContact.pined) {
          state.contacts.unshift(updatedContact); // Always add pined contacts at the top
      } else {
          state.contacts.splice(insertIndex, 0, updatedContact); // Insert in sorted position
      }
  
      // ✅ Handle unread messages
      if (newContact.last_message_id?.direction === "received") {
        console.log("fffffffffffffffffffffffffffffff",state.selectedContact?._id,newContact._id)
          if (state.selectedContact?._id === newContact._id) { 
              
              axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/getPostDataOnMongo/contacts/${state.selectedContact._id}/reset-unread`,{},{
                headers: {
                  Authorization: `Bearer ${Cookies.get("token")}`, // Fetch token from cookies
              },
              });
          }
      }
  },
   
      unreadZero: (state, action) => {
        const newContact = action.payload;
        const existingContact = state.contacts.find((contact) => contact._id === newContact._id);
      
        if (existingContact) {
          // If the contact exists, update its last_message_id
          existingContact.last_message_id = newContact.last_message_id;
           existingContact.unread_count=0
        } else {
          // If the contact does not exist, add it to the contacts array
          state.contacts.push(newContact);
        }
      },
      updateStatusOfLastMsg:(state,action)=>{
        const newStatus = action.payload;
        console.log({newStatus})
        const existingContact = state.contacts.find((contact) => contact._id === newStatus.contact_id);
        if(existingContact)existingContact.last_message_id.status=newStatus?.status
      },
      togglePin: (state, action) => {
        const { _id } = action.payload; // Contact ID to toggle
        const index = state.contacts.findIndex(contact => contact._id === _id);
        
        if (index !== -1) {
          // Extract the contact
          const contact = state.contacts.splice(index, 1)[0];
      
          // Toggle pined status
          contact.pined = !contact.pined;
      
          // Find the correct new position to insert the contact
          let insertIndex = state.contacts.findIndex(c => 
            (!contact.pined && c.pined) || 
            (!contact.pined && !c.pined && c.lastMsgTime < contact.lastMsgTime)
          );
      
          if (insertIndex === -1) {
            // If no correct index is found, push at the end
            state.contacts.push(contact);
          } else {
            // Insert at the calculated position
            state.contacts.splice(insertIndex, 0, contact);
          }
        }
      }
      
  },
});

export const {changeLevelOfSelectedContact,changeBrandOfSelectedContact,setShowAllTutorData,setDeviceDetails,setSearchContact,togglePin, setTotalContactPage, setContacts, selectContact,addContact , unreadZero,updateStatusOfLastMsg } = contactsSlice.actions;
export default contactsSlice.reducer;
