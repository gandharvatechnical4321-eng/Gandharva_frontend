import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function DashboardLayout() {
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileThirdOpen, setIsMobileThirdOpen] = useState(false);

  useEffect(() => {
    setIsMobileSidebarOpen(false);
    setIsMobileThirdOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsMobileSidebarOpen(false);
        setIsMobileThirdOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    document.body.style.overflow =
      isMobileSidebarOpen || isMobileThirdOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileSidebarOpen, isMobileThirdOpen]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      <div className="shrink-0">
        <Navbar
          onMenuClick={() => {
            setIsMobileThirdOpen(false);
            setIsMobileSidebarOpen((isOpen) => !isOpen);
          }}
          isMobileOpen={isMobileSidebarOpen}
          onThirdClick={() => {
            setIsMobileSidebarOpen(false);
            setIsMobileThirdOpen((isOpen) => !isOpen);
          }}
          isMobileThirdOpen={isMobileThirdOpen}
        />
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        <main
          key={location.pathname}
          className="w-0 min-w-0 flex-1 overflow-hidden"
        >
          <div className="h-full w-full overflow-y-auto overflow-x-hidden">
            <Outlet
              context={{
                isMobileThirdOpen,
                closeMobileThird: () => setIsMobileThirdOpen(false),
              }}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;