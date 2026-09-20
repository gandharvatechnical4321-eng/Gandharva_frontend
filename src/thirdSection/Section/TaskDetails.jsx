import React from "react";

import { useDispatch, useSelector } from "react-redux";
import {
  MessageSquareText,
  Clock3,
  CalendarClock,
  ListTodo,
  UserX,
  AlertTriangle,
} from "lucide-react";

import Next24hr from "./taskDetails/Next24hr";
import UnassignedTask from "./taskDetails/UnassignedTask";
import UpcomingTask from "./taskDetails/UpcomingTask";
import PastTask from "./taskDetails/PastTask";
import Query from "./taskDetails/Query";
import OverdueTask from "./taskDetails/OverdueTask";

import { setSelectedTask } from "../../features/taskSlice";

const taskTabs = [
  {
    label: "Query",
    value: "Query",
    icon: MessageSquareText,
  },
  {
    label: "Next 24 hrs",
    value: "Next 24hr",
    icon: Clock3,
  },
  {
    label: "Upcoming",
    value: "Upcoming Task",
    icon: CalendarClock,
  },
  {
    label: "Overdue",
    value: "Overdue Task",
    icon: AlertTriangle,
  },
  {
    label: "All Tasks",
    value: "All Task",
    icon: ListTodo,
  },
  {
    label: "Unassigned",
    value: "Unassigned Task",
    icon: UserX,
  },
];

const TaskDetails = () => {
  const dispatch = useDispatch();
  const selectedTask = useSelector((state) => state.tasks.selectedTask);

  const handleTabClick = (value) => {
    dispatch(setSelectedTask(value));
  };

  return (
    <section className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-white">
      {/* Tabs */}
      <div className="shrink-0 border-b border-slate-200 bg-gray-200 px-2 pt-2">
        <div className="grid grid-cols-3 gap-1 sm:grid-cols-6">
          {taskTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedTask === tab.value;

            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => handleTabClick(tab.value)}
                className={`relative flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 pb-3 pt-2 text-[10px] font-bold transition sm:text-[11px] ${
                  isActive
                    ? tab.value === "Overdue Task"
                      ? "bg-red-50 text-red-600"
                      : "bg-indigo-50 text-indigo-600"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon size={14} className="hidden sm:block" />

                <span className="w-full truncate text-center">
                  {tab.label}
                </span>

                {isActive && (
                  <span
                    className={`absolute bottom-0 left-1/2 h-0.5 w-10 -translate-x-1/2 rounded-full sm:w-14 ${
                      tab.value === "Overdue Task"
                        ? "bg-red-600"
                        : "bg-indigo-600"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="min-h-0 flex-1 overflow-hidden bg-slate-50">
        {selectedTask === "Unassigned Task" && <UnassignedTask />}
        {selectedTask === "All Task" && <PastTask />}
        {selectedTask === "Upcoming Task" && <UpcomingTask />}
        {selectedTask === "Next 24hr" && <Next24hr />}
        {selectedTask === "Query" && <Query />}
        {selectedTask === "Overdue Task" && <OverdueTask />}
      </div>
    </section>
  );
};

export default TaskDetails;