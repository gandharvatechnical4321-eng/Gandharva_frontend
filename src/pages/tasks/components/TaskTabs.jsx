import React from "react";
import {
  ListTodo,
  CalendarClock,
  Clock3,
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  UserX,
} from "lucide-react";

const tabs = [
  { id: "all", label: "All", countKey: "total", icon: ListTodo },
  { id: "upcoming", label: "Upcoming", countKey: "upcoming", icon: CalendarClock },
  { id: "inProgress", label: "In Progress", countKey: "inProgress", icon: Clock3 },
  { id: "pendingReview", label: "Pending Review", countKey: "pendingReview", icon: ClipboardCheck },
  { id: "completed", label: "Completed", countKey: "completed", icon: CheckCircle2 },
  { id: "overdue", label: "Overdue", countKey: "overdue", icon: AlertTriangle },
  { id: "unassigned", label: "Unassigned", countKey: "unassigned", icon: UserX },
];

const TaskTabs = ({ activeTab, setActiveTab, stats = {} }) => {
  return (
    /* 
      Container securely hides native scrollbars across all browsers 
      while allowing smooth horizontal swiping on smaller screens 
    */
    <div className="flex w-full items-center gap-1 overflow-x-auto px-1 pb-2  [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`group flex shrink-0 items-center gap-2 rounded-md px-3 py-1.5 text-xs font-bold transition-all active:scale-95 ${
              isActive
                ? "bg-indigo-50 text-indigo-700 shadow-xs ring-1 ring-indigo-200/60"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            <Icon
              size={14}
              strokeWidth={isActive ? 2.5 : 2}
              className={`transition-colors ${
                isActive
                  ? "text-indigo-600"
                  : "text-slate-400 group-hover:text-slate-500"
              }`}
            />
            
            <span>{tab.label}</span>
            
            <span
              className={`flex h-4 min-w-[18px] items-center justify-center rounded-full px-1.5 text-[9px] font-black tracking-wider transition-colors ${
                isActive
                  ? "bg-indigo-100/80 text-indigo-700"
                  : "bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700"
              }`}
            >
              {stats?.[tab.countKey] ?? 0}
            </span>
          </button>
        );
      })} */}
    </div>
  );
};

export default TaskTabs;