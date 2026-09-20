import React from "react";
import {
  CalendarClock,
  Clock3,
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  UserX,
  ListTodo,
} from "lucide-react";

const statCards = [
  {
    key: "total",
    label: "Total Tasks",
    icon: ListTodo,
    color: "bg-slate-100 text-slate-700",
  },
  {
    key: "upcoming",
    label: "Upcoming",
    icon: CalendarClock,
    color: "bg-blue-50 text-blue-700",
  },
  {
    key: "inProgress",
    label: "In Progress",
    icon: Clock3,
    color: "bg-indigo-50 text-indigo-700",
  },
  {
    key: "pendingReview",
    label: "Pending Review",
    icon: ClipboardCheck,
    color: "bg-amber-50 text-amber-700",
  },
  {
    key: "completed",
    label: "Completed",
    icon: CheckCircle2,
    color: "bg-emerald-50 text-emerald-700",
  },
  {
    key: "overdue",
    label: "Overdue",
    icon: AlertTriangle,
    color: "bg-red-50 text-red-700",
  },
  {
    key: "unassigned",
    label: "Unassigned",
    icon: UserX,
    color: "bg-violet-50 text-violet-700",
  },
];

const TaskStats = ({ stats = {} }) => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
      {statCards.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.key}
            className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.color}`}
              >
                <Icon size={16} strokeWidth={2.2} />
              </div>
              <p className="text-xl font-bold tracking-tight text-slate-900">
                {stats?.[item.key] ?? 0}
              </p>
            </div>
            <p className="mt-2.5 truncate text-xs font-semibold text-slate-500">
              {item.label}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default TaskStats;