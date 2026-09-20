// components/InterestNotification.jsx
import React, { useEffect } from 'react';
import useSound from 'use-sound';
import notificationSound from  '../../audio/notification.mp3'; // assuming in public folder
import { useSelector ,useDispatch } from 'react-redux';
import { setCommanSearch } from '../../features/taskSlice';
import { setSearchContact } from '../../features/contactsSlice';
const InterestNotification = ({ taskID, clientID, tutorID, onClose }) => {
    const dispatch = useDispatch()
  const [play] = useSound(notificationSound, { volume: 0.5 });
    const commanSearch = useSelector(state=>state.tasks.commanSearch) 
  useEffect(() => {
    play(); // Play sound on show
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose, play]);

  const onclickNotification =()=>{
    dispatch(setCommanSearch(taskID))
    dispatch(setSearchContact(clientID))
  }
  return (
    <button onClick={onclickNotification} className="fixed bottom-4 right-4 bg-white border border-gray-300 shadow-lg rounded-xl px-4 py-3 w-80 z-50 animate-slide-fade-in-out transition-all duration-300">
      <h4 className="text-md font-bold text-green-600">🎉 New Interest Shown</h4>
      <p className="  text-gray-600 font-semibold text-2xl">📌 {taskID}</p>
      <div className='flex justify-between'>
      <p className="text-sm text-gray-800 font-semibold">👤 Client ID: {clientID}</p>
      <p className="text-sm text-gray-800 font-semibold">🎓 Tutor ID: {tutorID}</p>
        </div>
    </button>
  );
};

export default InterestNotification;
