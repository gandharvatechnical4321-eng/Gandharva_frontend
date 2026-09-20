import {
  MessageCircle,
  ClipboardList,
  GraduationCap,
  Users,
  BarChart3,
  Wallet,
  Bell,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useDispatch, useSelector } from "react-redux";
import { selectContact } from "../../features/contactsSlice";

const sidebarLinks = [
  {
    name: "Chats",
    path: "/dashboard/chats",
    icon: MessageCircle,
  },
  {
    name: "Tasks",
    path: "/dashboard/tasks",
    icon: ClipboardList,
  },
  {
    name: "Tutors",
    path: "/dashboard/tutors",
    icon: GraduationCap,
  },
  {
    name: "Clients",
    path: "/dashboard/clients",
    icon: Users,
  },
  {
    name: "Reports",
    path: "/dashboard/reports",
    icon: BarChart3,
  },
  {
    name: "Tutor Payments",
    path: "/dashboard/payments",
    icon: Wallet,
  },
  {
    name: "Notifications",
    path: "/dashboard/notifications",
    icon: Bell,
    badge: true,
  },
  {
    name: "Settings",
    path: "/dashboard/settings",
    icon: Settings,
  },
];

function Sidebar({
  collapsed = false,
  isMobileOpen = false,
  onClose,
  onLogout,
}) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const deviceRole = useSelector((state) => state.contacts?.deviceDetails?.role);
  const currentRole = String(deviceRole || Cookies.get("role") || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ");
  const visibleSidebarLinks = sidebarLinks.filter(
    (item) => item.name !== "Reports" || ["admin", "owner"].includes(currentRole)
  );

  const handleNavClick = () => {
    dispatch(selectContact(null));

    if (onClose) {
      onClose();
    }
  };

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("role");
    Cookies.remove("userName");
    Cookies.remove("email");

    dispatch(selectContact(null));

    if (onLogout) {
      onLogout();
    }

    navigate("/login", { replace: true });
    window.location.reload();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={onClose}
          className="fixed inset-x-0 bottom-0 top-16 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`
          fixed left-0 top-16 z-50
          h-[calc(100vh-4rem)] w-72
          border-r border-slate-200 bg-white
          shadow-2xl shadow-slate-900/10
          transition-all duration-300 ease-in-out
          lg:sticky lg:top-16 lg:z-30 lg:h-[calc(100vh-4rem)] lg:shadow-none
          ${collapsed ? "lg:w-20" : "lg:w-28"}
          ${
            isMobileOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        <div className="flex h-full min-h-0 flex-col">
          {/* Mobile Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-4 lg:hidden">
            <div className="min-w-0">
              <h2 className="truncate text-lg font-extrabold text-slate-900">
                BrandName
              </h2>
              <p className="text-xs font-bold uppercase tracking-wide text-orange-500">
                Dashboard Menu
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label="Close sidebar"
            >
              <X size={22} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4 lg:px-2 lg:py-2">
            <div className="flex flex-col gap-2">
              {visibleSidebarLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
  key={item.name}
  to={item.path}
  end
  onClick={handleNavClick}
  className={({ isActive }) =>
    `
      group relative flex items-center rounded-2xl transition-all duration-200
      w-full min-h-[52px] gap-3 px-4
      lg:flex-col lg:justify-center lg:gap-1 lg:px-0
      ${
        collapsed
          ? "lg:min-h-[60px] lg:w-[64px]"
          : "lg:min-h-[66px] lg:w-full"
      }
      ${
        isActive
          ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-200"
          : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
      }
    `
  }
>
                    {({ isActive }) => (
                      <>
                        <span
                          className={`
                            relative flex shrink-0 items-center justify-center
                            ${
                              isActive
                                ? "text-white"
                                : "text-slate-500 group-hover:text-indigo-600"
                            }
                          `}
                        >
                          <Icon size={22} strokeWidth={2.2} />

                          {item.badge && (
                            <span
                              className={`
                                absolute -right-1.5 -top-1.5 h-2.5 w-2.5 rounded-full ring-2
                                ${
                                  isActive
                                    ? "bg-white ring-indigo-500"
                                    : "bg-red-500 ring-white"
                                }
                              `}
                            />
                          )}
                        </span>

                        <span
                          className={`
                            truncate font-bold
                            text-sm lg:text-[12px]
                            ${collapsed ? "lg:hidden" : "lg:block"}
                          `}
                        >
                          {item.name}
                        </span>

                        {!isActive && (
                          <span className="pointer-events-none absolute inset-y-2 left-0 hidden w-1 rounded-r-full bg-indigo-500 opacity-0 transition group-hover:opacity-100 lg:block" />
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </nav>

          {/* Logout */}
          <div className="shrink-0 border-t border-slate-100 px-3 py-4 lg:px-2">
            <button
              type="button"
              onClick={handleLogout}
              className={`
                group flex w-full min-h-[52px] items-center gap-3 rounded-2xl px-4
                text-slate-500 transition hover:bg-red-50 hover:text-red-500
                lg:flex-col lg:justify-center lg:gap-1 lg:px-0
                ${
                  collapsed
                    ? "lg:min-h-[60px] lg:w-[64px]"
                    : "lg:min-h-[64px] lg:w-full"
                }
              `}
            >
              <LogOut size={22} />

              <span
                className={`
                  truncate text-sm font-bold lg:text-[12px]
                  ${collapsed ? "lg:hidden" : "lg:block"}
                `}
              >
                Logout
              </span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;