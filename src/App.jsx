import "./App.css";
import { useEffect, useMemo, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { io } from "socket.io-client";
import Cookies from "js-cookie";
import axios from "axios";
import { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";

import MainBox from "./pages/MainBox";
import LoginPage from "./LoginPage";

import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import DashboardLayout from "./components/layout/DashboardLayout";

import {
  addContact,
  selectContact,
  setDeviceDetails,
  updateStatusOfLastMsg,
} from "./features/contactsSlice";

import { addMessage, updateStatus } from "./features/messagesSlice";
import { addInterestedTutorIfNotExists } from "./features/taskSlice";

import InterestNotification from "./thirdSection/card/notificationForTask";
import TasksPage from "./pages/tasks/TasksPage";
import TutorPaymentsPage from "./pages/TutorPaymentPage";
import TutorList from "./pages/Tutorlist";
import { Reports } from "./pages/Reports";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const normalizeRole = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ");

/* Clears chat-selected state when user goes outside chat page */
const RouteStateCleaner = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (location.pathname !== "/dashboard/chats") {
      dispatch(selectContact(null));
    }
  }, [location.pathname, dispatch]);

  return null;
};

/* Common placeholder page for sidebar pages - UPDATED TO COMPACT EMPTY STATE */
const DashboardPage = ({ title, description }) => (
  <div className="mx-auto w-full max-w-[1400px] px-4 py-5 sm:px-5 lg:px-6 lg:py-8">
    <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-xl border border-[var(--border,theme(colors.slate.200))] bg-[var(--card,white)] p-6 text-center shadow-sm">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50">
        <svg
          className="h-5 w-5 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
          />
        </svg>
      </div>
      <h1 className="text-base font-semibold text-slate-900">{title}</h1>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  </div>
);

function App() {
  const dispatch = useDispatch();
  const deviceRole = useSelector((state) => state.contacts?.deviceDetails?.role);
  const currentRole = normalizeRole(deviceRole || Cookies.get("role"));
  const canViewReports = ["admin", "owner"].includes(currentRole);

  const [token, setToken] = useState("");
  const [notification, setNotification] = useState(null);
  const [checkingToken, setCheckingToken] = useState(true);

  const socket = useMemo(() => {
    if (!BACKEND_URL) {
      console.error("REACT_APP_BACKEND_URL is missing in .env file");
      return null;
    }

    return io(BACKEND_URL, {
      transports: ["websocket"],
    });
  }, []);

  const removeToken = () => {
    Cookies.remove("token");
    Cookies.remove("role");
    Cookies.remove("userName");
    Cookies.remove("email");
    setToken("");
    dispatch(selectContact(null));
    console.log("Token removed from cookies");
  };

  const checkAvailability = async (savedToken) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/getPostDataOnMongo`, {
        headers: {
          Authorization: `Bearer ${savedToken}`,
        },
      });

      console.log("Token check response:", response.data);

      if (response?.data?.status) {
        dispatch(setDeviceDetails(response.data.data));
        setToken(savedToken);

        Cookies.set("role", response.data.data.role, {
          expires: 10,
          secure: window.location.protocol === "https:",
          sameSite: "Strict",
        });
      } else {
        removeToken();
      }
    } catch (error) {
      console.error(
        "Error checking availability:",
        error.response?.data || error
      );
      removeToken();
    } finally {
      setCheckingToken(false);
    }
  };

  useEffect(() => {
    const savedToken = Cookies.get("token");

    if (savedToken) {
      checkAvailability(savedToken);
    } else {
      setCheckingToken(false);
    }
  }, []);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        dispatch(selectContact(null));
      }
    };

    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [dispatch]);

  useEffect(() => {
    if (!socket) return;

    const handleStatusUpdate = (update) => {
      console.log("Status Update:", update);
    };

    const handleMessageStatus = (msgStatus) => {
      console.log("messageStatus:", msgStatus);

      dispatch(
        updateStatus({
          chatId: msgStatus.contact_id,
          messageId: msgStatus.message_id,
          newStatus: msgStatus.status,
        })
      );

      dispatch(updateStatusOfLastMsg(msgStatus));
    };

    const handleNewMessageReceived = (newMsg) => {
      console.log("newMessageReceived:", newMsg);

      const contact = newMsg?.contact;
      const savedMessage = newMsg?.savedMessage;

      if (!contact || !savedMessage) return;

      const updatedContact = {
        ...contact,
        last_message_id: savedMessage,
      };

      dispatch(addContact(updatedContact));

      dispatch(
        addMessage({
          chatId: savedMessage.contact_id,
          message: savedMessage,
        })
      );
    };

    const handleInterestShown = (interest) => {
      console.log("Interested Person update:", interest);

      const taskID = interest?.taskID;
      const newTutor = interest?.intrestedPerson;

      if (!taskID || !newTutor) return;

      dispatch(
        addInterestedTutorIfNotExists({
          taskID,
          newTutor,
        })
      );

      setNotification({
        taskID,
        clientID: newTutor.chatId,
        tutorID: newTutor.tutorID,
      });
    };

    socket.on("statusUpdate", handleStatusUpdate);
    socket.on("messageStatus", handleMessageStatus);
    socket.on("newMessageReceived", handleNewMessageReceived);
    socket.on("intrestShown", handleInterestShown);

    return () => {
      socket.off("statusUpdate", handleStatusUpdate);
      socket.off("messageStatus", handleMessageStatus);
      socket.off("newMessageReceived", handleNewMessageReceived);
      socket.off("intrestShown", handleInterestShown);
    };
  }, [socket, dispatch]);

  if (checkingToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background,#f8fafc)]">
        <div className="flex items-center gap-3 rounded-lg border border-[var(--border,theme(colors.slate.200))] bg-white px-5 py-3 shadow-sm">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />
          <span className="text-sm font-medium text-slate-600">
            Initializing workspace...
          </span>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {/* <RouteStateCleaner /> */}

      <div onContextMenu={(event) => event.preventDefault()}>
        {notification && (
          <InterestNotification
            {...notification}
            onClose={() => setNotification(null)}
          />
        )}

        <Toaster
          toastOptions={{
            className: "text-sm font-medium rounded-lg shadow-sm border border-slate-200",
          }}
        />

        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute token={token}>
                <LoginPage />
              </PublicRoute>
            }
          />

          <Route
            element={
              <ProtectedRoute token={token}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route
              path="/dashboard"
              element={<Navigate to="/dashboard/chats" replace />}
            />

            <Route path="/dashboard/chats" element={<MainBox />} />

            <Route path="/dashboard/tasks" element={<TasksPage />} />

            <Route
              path="/dashboard/payments"
              element={<TutorPaymentsPage />}
            />

            <Route
              path="/dashboard/tutors"
              element={<TutorList />}
            />

            <Route
              path="/dashboard/clients"
              element={
                <DashboardPage
                  title="Clients"
                  description="Client management page will come here."
                />
              }
            />

            <Route
              path="/dashboard/reports"
              element={
                canViewReports ? (
                  <Reports />
                ) : (
                  <Navigate to="/dashboard/tasks" replace />
                )
              }
            />

            <Route
              path="/dashboard/notifications"
              element={
                <DashboardPage
                  title="Notifications"
                  description="Notifications page will come here."
                />
              }
            />

            <Route
              path="/dashboard/settings"
              element={
                <DashboardPage
                  title="Settings"
                  description="Settings page will come here."
                />
              }
            />
          </Route>

          {/* Root Level Redirects */}
          <Route path="/chats" element={<Navigate to="/dashboard/chats" replace />} />
          <Route path="/tasks" element={<Navigate to="/dashboard/tasks" replace />} />
          <Route path="/tutors" element={<Navigate to="/dashboard/tutors" replace />} />
          <Route path="/clients" element={<Navigate to="/dashboard/clients" replace />} />
          <Route path="/reports" element={<Navigate to="/dashboard/reports" replace />} />
          <Route
            path="/notifications"
            element={<Navigate to="/dashboard/notifications" replace />}
          />
          <Route path="/settings" element={<Navigate to="/dashboard/settings" replace />} />

          <Route
            path="/"
            element={
              token ? (
                <Navigate to="/dashboard/chats" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="*"
            element={
              token ? (
                <Navigate to="/dashboard/chats" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;