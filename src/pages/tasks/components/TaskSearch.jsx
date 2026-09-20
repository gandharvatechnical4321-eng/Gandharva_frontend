import React, { useState } from "react";
import { Search, X } from "lucide-react";

const TaskSearch = ({ onSearch, placeholder = "Search tasks, clients, tutors..." }) => {
  const [localSearch, setLocalSearch] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(localSearch);
  };

  const handleClear = () => {
    setLocalSearch("");
    onSearch(""); // Automatically clear the applied search too
  };

  return (
    <form onSubmit={handleSearch} className="relative flex w-full max-w-md items-center shadow-sm">
      <div className="relative flex-1">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder={placeholder}
          className="h-10 w-full rounded-l-lg border border-slate-200 bg-white pl-9 pr-8 text-sm font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
        {localSearch && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={14} />
          </button>
        )}
      </div>
      <button
        type="submit"
        className="flex h-10 items-center justify-center rounded-r-lg border-y border-r border-indigo-600 bg-indigo-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 active:bg-indigo-800"
      >
        Search
      </button>
    </form>
  );
};

export default TaskSearch;