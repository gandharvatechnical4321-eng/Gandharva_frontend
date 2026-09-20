import React from "react";
import {
  ClipboardList,
  Users,
  CalendarClock,
} from "lucide-react";

import TutorList from "./Section/TutorList";
import TaskDetails from "./Section/TaskDetails";

import { useDispatch, useSelector } from "react-redux";
import { setSelectedTask } from "../features/taskSlice";

const ThirdBox = () => {
  const dispatch = useDispatch();
  const selectedTask = useSelector((state) => state.tasks.selectedTask);

  const isTaskDetails = selectedTask !== "Tutor List";

  const setClickedValue = (value) => {
    if (value === "Tutor List") {
      dispatch(setSelectedTask("Tutor List"));
      return;
    }

    // This will directly show all task detail options,
    // same as what was previously coming under Upcoming.
    dispatch(setSelectedTask("Next 24hr"));
  };

  const tabs = [
    {
      label: "Task Details",
      value: "Task Details",
      active: isTaskDetails,
      icon: CalendarClock,
    },
    {
      label: "Tutors",
      value: "Tutor List",
      active: selectedTask === "Tutor List",
      icon: Users,
    },
  ];

  return (
    <section className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-white">
      {/* Header */}
      <div className="shrink-0 bg-gray-100 px-4 pt-4">
        

        {/* Tabs */}
        <div className="grid grid-cols-2 border-b border-slate-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setClickedValue(tab.value)}
                className={`relative flex min-w-0 items-center justify-center gap-1.5 px-1 pb-3 text-[11px] font-bold transition sm:text-xs ${
                  tab.active
                    ? "text-indigo-600"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Icon size={14} className="hidden sm:block" />
                <span className="truncate">{tab.label}</span>

                {tab.active && (
                  <span className="absolute bottom-0 left-1/2 h-0.5 w-20 -translate-x-1/2 rounded-full bg-indigo-600" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="min-h-0 flex-1 overflow-hidden bg-white">
        {selectedTask === "Tutor List" ? <TutorList /> : <TaskDetails />}
      </div>
    </section>
  );
};

export default ThirdBox;