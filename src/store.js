import { configureStore } from '@reduxjs/toolkit';
import messagesReducer from './features/messagesSlice';
import contactsReducer from './features/contactsSlice';
import tasksReducer from './features/taskSlice'
const store = configureStore({
  reducer: {
    messages: messagesReducer,
    contacts: contactsReducer,
    tasks: tasksReducer
  },
});

export default store;
