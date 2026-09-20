import { useEffect } from "react";
import {
  useDispatch,
  useSelector,
} from "react-redux";
import { useOutletContext } from "react-router-dom";

import ChatBox from "../dashbord/ChatBox";
import UserCard from "../cards/UserCard";
import ForwardMessageCard from "../cards/ForwardMsgCard";
import ThirdBox from "../thirdSection/ThirdBox";
import TaskUpdateCard from "../thirdSection/card/TaskUpdateCard";

import {
  selectContact,
} from "../features/contactsSlice";

import {
  selectForward,
  emptytMsgToForward,
  setShowForwardModal,
} from "../features/messagesSlice";

const MainBox = () => {
  const dispatch = useDispatch();
  const {
    isMobileThirdOpen = false,
    closeMobileThird = () => {},
  } = useOutletContext() || {};

  const selectedContact = useSelector(
    (state) => state.contacts.selectedContact
  );

  const openTaskUpdateCard = useSelector(
    (state) =>
      state.tasks.openTaskUpdateCard
  );

  const showForwardModal = useSelector(
    (state) =>
      state.messages.showForwardModal
  );

  useEffect(() => {
    return () => {
      dispatch(selectContact(null));
      dispatch(selectForward(false));
      dispatch(
        setShowForwardModal(false)
      );
      dispatch(
        emptytMsgToForward([])
      );
    };
  }, [dispatch]);

  return (
    <div className="relative flex h-full w-full overflow-hidden bg-gray-50">
      {/* Forward contacts modal */}
      {showForwardModal && (
        <>
          <button
            type="button"
            aria-label="Close forwarding modal"
            className="fixed inset-0 z-40 cursor-default bg-gray-900/20 backdrop-blur-sm"
            onClick={() =>
              dispatch(
                setShowForwardModal(
                  false
                )
              )
            }
          />

          <div className="fixed left-1/2 top-[5vh] z-50 w-[92vw] max-w-xl -translate-x-1/2">
            <ForwardMessageCard />
          </div>
        </>
      )}

      {/* Left column: contacts */}
      <div
        className={`shrink-0 flex-col border-r border-gray-200 bg-white md:flex md:w-[320px] xl:w-[360px] ${
          selectedContact ? "hidden" : "flex w-full"
        }`}
      >
        <div className="h-full w-full overflow-hidden">
          <UserCard />
        </div>
      </div>

      {/* Middle column: chat */}
      <div
        className={`relative z-10 flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white shadow-[-4px_0_24px_-12px_rgba(0,0,0,0.05)] ${
          selectedContact ? "flex" : "hidden md:flex"
        }`}
      >
        <ChatBox onBackToContacts={() => dispatch(selectContact(null))} />
      </div>

      {/* Right column: task section */}
      <div className="hidden shrink-0 flex-col border-l border-gray-200 lg:flex lg:w-[350px] xl:w-[500px]">
        <div className="h-full w-full overflow-y-auto overflow-x-hidden p-2">
          {openTaskUpdateCard && (
            <div className="mb-4">
              <TaskUpdateCard />
            </div>
          )}

          <ThirdBox />
        </div>
      </div>

      {/* Mobile third section, opened from the dashboard navbar */}
      {isMobileThirdOpen && (
        <>
          <button
            type="button"
            aria-label="Close task and tutor panel"
            onClick={closeMobileThird}
            className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm lg:hidden"
          />

          <div className="fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col overflow-hidden bg-white shadow-2xl lg:hidden">
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3">
              <div>
                <h2 className="text-sm font-black text-slate-900">
                  Tasks &amp; Tutors
                </h2>
                <p className="text-xs font-medium text-slate-500">
                  Manage tasks and tutor details
                </p>
              </div>

              <button
                type="button"
                onClick={closeMobileThird}
                className="rounded-xl px-3 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              {openTaskUpdateCard && (
                <div className="mb-4">
                  <TaskUpdateCard />
                </div>
              )}
              <ThirdBox />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MainBox;