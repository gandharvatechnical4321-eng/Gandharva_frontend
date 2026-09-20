import { createSlice } from '@reduxjs/toolkit';

const messagesSlice = createSlice({
  name: 'messages',
  initialState: {
    chatMessages: {}, // Stores messages by chat ID
    forwardMessage:[],
    selectForward:false,
    showForwardModal: false,
  },

  
  reducers: {
     // ✅ Remove a message by message_id and chatId
     removeMessage: (state, action) => {
      const { chatId, message_id } = action.payload;
      if (state.chatMessages[chatId]) {
        state.chatMessages[chatId] = state.chatMessages[chatId].filter(
          (message) => message.message_id !== message_id
        );
      }
    },
    // Add one message to a particular chat ID
    addMessage: (state, action) => {
        const { chatId, message } = action.payload;
      
        // If the chatId doesn't exist, initialize an empty array for it
        if (!state.chatMessages[chatId]) {
          state.chatMessages[chatId] = [];
        }
      
        // Add the new message and sort the array by timestamp
        state.chatMessages[chatId] = [message, ...state.chatMessages[chatId]]
        // .sort(
        //   (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        // );
      },
      
    // Set or replace all messages for a particular chat ID
    setMessages: (state, action) => {
      const { chatId, messages } = action.payload;
      state.chatMessages[chatId] = messages;
    },
    setOlderMessages: (state, action) => {
      const { chatId, messages } = action.payload;
      state.chatMessages[chatId] = [ ...(state.chatMessages[chatId] || []),...messages,];
  },
    updateStatus: (state, action) => {
      const { chatId, messageId, newStatus } = action.payload;
      console.log({ chatId, messageId, newStatus })
      // Check if the chatId exists
      if (state.chatMessages[chatId]) {
        // Find the message by its ID and update its status
        state.chatMessages[chatId] = state.chatMessages[chatId].map((message) => 
          message.message_id === messageId 
            ? { ...message, status: newStatus } 
            : message
        );
      }
    }, 
    updateReplyMsg: (state, action) => {
      const { chatId, messageId, replyMsg } = action.payload;
      
      // Check if the chatId exists
      if (state.chatMessages[chatId]) {
        // Find the message by its ID and update its status
        state.chatMessages[chatId] = state.chatMessages[chatId].map((message) => 
          message.message_id === messageId 
            ? { ...message, replyMsg } 
            : message
        );
      }
    },
    selectMsgToForword:(state,action)=>{
      state.forwardMessage=[...state.forwardMessage,action.payload]
    },
    deselectMsgToForward: (state, action) => {
      state.forwardMessage = state.forwardMessage.filter(
        (msg) => msg.message_id !== action.payload.message_id // Adjust 'id' to your message identifier
      );
    },
    emptytMsgToForward: (state, action) => {
       state.forwardMessage= action.payload // Adjust 'id' to your message identifier
      
    },
    selectForward:(state,action)=>{
      state.selectForward=action.payload
    },
    setShowForwardModal: (state, action) => {
  state.showForwardModal = action.payload;
},
  },
});

export const {removeMessage,setOlderMessages, addMessage, setMessages, updateStatus, updateReplyMsg, selectMsgToForword, selectForward, deselectMsgToForward, emptytMsgToForward, setShowForwardModal, } = messagesSlice.actions;
export default messagesSlice.reducer;
