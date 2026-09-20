import {useEffect, useMemo, useState } from "react";
import {
  Menu,
  Bell,
  ClipboardList,
  ChevronDown,
  LogOut,
  User,
  MessageCircle,
} from "lucide-react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

// If your Navbar is inside src/components/layout/Navbar.jsx, this path is correct.
// If your Navbar is directly inside src/components/Navbar.jsx, change it to "../features/contactsSlice".
import { selectContact, setSearchContact } from "../../features/contactsSlice";

function Navbar({
  onMenuClick,
  isMobileOpen = false,
  onThirdClick,
  isMobileThirdOpen = false,
  notificationCount = null,
  logoSrc = "/logo.png",
}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);

  const deviceDetails = useSelector(
    (state) => state?.contacts?.deviceDetails || {}
  );

  const contacts = useSelector((state) => state?.contacts?.contacts || []);

  const getValidValue = (value) => {
    if (!value) return "";
    if (value === "undefined") return "";
    if (value === "null") return "";
    return value;
  };
  

  const userName =
    getValidValue(deviceDetails?.name) ||
    getValidValue(deviceDetails?.fullName) ||
    getValidValue(Cookies.get("userName")) ||
    "User";

  const role =
    getValidValue(deviceDetails?.role) ||
    getValidValue(Cookies.get("role")) ||
    "Operation Executive";

  const email =
    getValidValue(deviceDetails?.email) ||
    getValidValue(Cookies.get("email")) ||
    "";

 const BACKEND_URL = String(
  process.env.REACT_APP_BACKEND_URL || ""
).replace(/\/$/, "");

const profileImageUrl =
  getValidValue(deviceDetails?.profileImageUrl) ||
  getValidValue(Cookies.get("profileImageUrl")) ||
  "";

const profileImageSrc = profileImageUrl
  ? profileImageUrl.startsWith("http")
    ? profileImageUrl
    : `${BACKEND_URL}${profileImageUrl}`
  : "";

  const phoneNumber = getValidValue(deviceDetails?.phone_number);
  const firstLetter = userName?.charAt(0)?.toUpperCase() || "U";

  const unreadContacts = useMemo(() => {
    return contacts.filter((item) => Number(item?.unread_count || 0) > 0);
  }, [contacts]);

  const unreadNotificationCount = useMemo(() => {
    if (typeof notificationCount === "number") return notificationCount;

    return contacts.reduce((total, item) => {
      return total + Number(item?.unread_count || 0);
    }, 0);
  }, [contacts, notificationCount]);

  const getContactName = (contact) => {
    return (
      contact?.name ||
      contact?.pushname ||
      contact?.phone_number ||
      "Unknown"
    );
  };

  const getContactId = (contact) => {
    return (
      contact?.chatId ||
      contact?.chatID ||
      contact?.contact_id ||
      contact?.phone_number ||
      "No ID"
    );
  };

  const getLastMessage = (contact) => {
    const msg = contact?.last_message_id?.message;

    if (!msg?.type) return "No message yet";

    if (msg.type === "text") {
      return msg?.text?.body || "Text message";
    }

    return msg.type;
  };

  const handleUnreadClick = async (contact) => {
    const contactId = getContactId(contact);

    setNotificationOpen(false);
    setProfileOpen(false);

    dispatch(setSearchContact(contactId));
    await dispatch(selectContact(contact));

    navigate("/dashboard/chats");
  };

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("role");
    Cookies.remove("userName");
    Cookies.remove("email");

    navigate("/login", { replace: true });
    window.location.reload();
  };


  useEffect(() => {
  setProfileImageError(false);
}, [profileImageSrc]);

  return (
    <header className="sticky top-0 z-40 h-16 w-full border-b border-slate-200/80 bg-white/95 px-3 shadow-sm backdrop-blur-xl sm:px-5">
      <div className="flex h-full items-center justify-between gap-3">
        {/* Left */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95 lg:hidden"
            aria-label={isMobileOpen ? "Close sidebar" : "Open sidebar"}
            aria-expanded={isMobileOpen}
          >
            <Menu size={22} />
          </button>

          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl shadow-sm sm:h-11 sm:w-11 ${
                logoError
                  ? "bg-gradient-to-br from-blue-600 via-indigo-500 to-orange-400"
                  : " bg-white"
              }`}
            >
              {!logoError ? (
                <img
                  src="/logo.png"
                  alt="BrandName Logo"
                  className="h-full w-full object-cover scale-110 "
                  onError={() => setLogoError(true)}
                />
              ) : (
                <span className="text-lg font-black text-white">G</span>
              )}
            </div>

            <div className="min-w-0 leading-tight">
              <h1 className="truncate text-[15px] font-black tracking-tight text-slate-950 sm:text-[22px]">
                BrandName
              </h1>

              <p className="hidden truncate text-xs font-bold text-orange-500 sm:block">
                Operations Dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={onThirdClick}
            className={`flex h-10 w-10 items-center justify-center rounded-2xl transition lg:hidden ${
              isMobileThirdOpen
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
            aria-label={
              isMobileThirdOpen
                ? "Close tasks and tutors"
                : "Open tasks and tutors"
            }
            aria-expanded={isMobileThirdOpen}
            title="Tasks and Tutors"
          >
            <ClipboardList size={21} />
          </button>

          {/* Notification */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setNotificationOpen((prev) => !prev);
                setProfileOpen(false);
              }}
              className={`relative flex h-10 w-10 items-center justify-center rounded-2xl transition ${
                notificationOpen
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
              aria-label="Notifications"
              title="Unread Notifications"
            >
              <Bell size={21} />

              {unreadNotificationCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white shadow-sm ring-2 ring-white">
                  {unreadNotificationCount > 99
                    ? "99+"
                    : unreadNotificationCount}
                </span>
              )}
            </button>

            {notificationOpen && (
              <div className="absolute right-0 top-14 z-50 w-[330px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl sm:w-[380px]">
                <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white px-4 py-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      Unread Messages
                    </h3>

                    <p className="text-xs font-bold text-slate-500">
                      {unreadNotificationCount} unread message
                      {unreadNotificationCount === 1 ? "" : "s"}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <MessageCircle size={18} />
                  </div>
                </div>

                <div className="max-h-[360px] overflow-y-auto p-2">
                  {unreadContacts.length > 0 ? (
                    unreadContacts.map((contact) => {
                      const unreadCount = Number(contact?.unread_count || 0);
                      const name = getContactName(contact);
                      const contactId = getContactId(contact);
                      const lastMessage = getLastMessage(contact);

                      return (
                        <button
                          key={contact?._id || contactId}
                          type="button"
                          onClick={() => handleUnreadClick(contact)}
                          className="flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-slate-50"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-black text-white">
                            {name?.charAt(0)?.toUpperCase() || "U"}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="truncate text-sm font-black text-slate-900">
                                {name}
                              </p>

                              <span className="flex min-h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-black text-white">
                                {unreadCount > 99 ? "99+" : unreadCount}
                              </span>
                            </div>

                            <p className="mt-0.5 truncate text-xs font-bold text-slate-500">
                              {contactId}
                            </p>

                            <p className="mt-1 truncate text-xs font-semibold text-slate-400">
                              {lastMessage}
                            </p>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                        <Bell size={24} />
                      </div>

                      <p className="text-sm font-black text-slate-800">
                        No unread messages
                      </p>

                      <p className="mt-1 text-xs font-semibold text-slate-400">
                        You are all caught up.
                      </p>
                    </div>
                  )}
                </div>

                
              </div>
            )}
          </div>

          <div className="hidden h-8 w-px bg-slate-200 sm:block" />

          {/* Profile */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setProfileOpen((prev) => !prev);
                setNotificationOpen(false);
              }}
              className="flex min-w-0 items-center gap-2 rounded-2xl px-1 py-1 transition hover:bg-slate-50 sm:px-2"
            >
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 font-black text-white ring-2 ring-slate-100 sm:h-11 sm:w-11">
                {profileImageSrc && !profileImageError ? (
                  <img
                    src={profileImageSrc}
                    alt={`${userName} profile`}
                    className="h-full w-full object-cover"
                    onError={() => {
                      console.error("Profile image failed:", profileImageSrc);
                      setProfileImageError(true);
                    }}
                  />
                ) : (
                  <span>{firstLetter || <User size={20} />}</span>
                )}
              </div>

              <div className="hidden max-w-[210px] text-left leading-tight lg:block">
                <p className="truncate text-sm font-black text-slate-900">
                  {userName}
                </p>

                <p className="truncate text-xs font-bold capitalize text-slate-500">
                  {role || "Operation Executive"}
                </p>

                {!email && phoneNumber && (
                  <p className="truncate text-[11px] font-semibold text-slate-400">
                    {phoneNumber}
                  </p>
                )}
              </div>

              <ChevronDown
                size={17}
                className={`hidden text-slate-500 transition lg:block ${
                  profileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-14 z-50 w-72 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
                <div className="border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 font-black text-white">
                      {firstLetter}
                    </div>

                    <div className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
  <div className="flex min-w-0 items-start justify-between gap-3">
    <div className="min-w-0">
      <p
        className="truncate text-sm font-black leading-5 text-slate-900"
        title={userName}
      >
        {userName || "Unknown User"}
      </p>

      <span className="mt-1 inline-flex max-w-full items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-indigo-700">
        <span className="truncate">{role || "No Role"}</span>
      </span>
    </div>

    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
  </div>

        <div className="mt-2.5 space-y-1 border-t border-slate-200 pt-2">
          {phoneNumber && (
            <div className="flex min-w-0 items-center gap-2">
              <span className="w-11 shrink-0 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Phone
              </span>

              <p
                className="truncate text-[11px] font-semibold text-slate-600"
                title={phoneNumber}
              >
                {phoneNumber}
              </p>
            </div>
          )}

          {email && (
            <div className="flex min-w-0 items-center gap-2">
              <span className="w-11 shrink-0 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Email
              </span>

              <p
                className="truncate text-[11px] font-semibold text-slate-600"
                title={email}
              >
                {email}
              </p>
            </div>
          )}
        </div>
      </div>
                  </div>
                </div>

                <div className="space-y-1 p-2">
                  

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-black text-red-600 transition hover:bg-red-50"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;