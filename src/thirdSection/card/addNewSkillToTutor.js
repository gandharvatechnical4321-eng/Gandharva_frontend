import React, { useState } from "react";
import { FaStar, FaWrench, FaTools } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const AddNewSkillToTutor = ({ tutor, onUpdateSkills }) => {
  const [skills, setSkills] = useState({
    expertSkills: tutor.expertSkills || [],
    intermediateSkills: tutor.intermediateSkills || [],
    beginnerSkills: tutor.beginnerSkills || [],
  });

  const [newSkill, setNewSkill] = useState({ type: "expertSkills", value: "" });

  const handleAddSkill = () => {
    if (newSkill.value.trim() === "") return;
    setSkills((prev) => ({
      ...prev,
      [newSkill.type]: [...prev[newSkill.type], newSkill.value],
    }));
    setNewSkill({ type: "expertSkills", value: "" });

    if (onUpdateSkills) {
      onUpdateSkills({
        ...skills,
        [newSkill.type]: [...skills[newSkill.type], newSkill.value],
      });
    }
  };

  const handleSkillRemove = (type, index) => {
    const updatedSkills = skills[type].filter((_, i) => i !== index);
    setSkills((prev) => ({ ...prev, [type]: updatedSkills }));

    if (onUpdateSkills) {
      onUpdateSkills({ ...skills, [type]: updatedSkills });
    }
  };

  return (
    <motion.div
      className="p-4 bg-white shadow-md rounded-lg flex flex-col items-start gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Display Existing Skills */}
      <div className="w-full">
        <p className="text-sm font-semibold mb-1">Skills:</p>
        <div className="flex flex-wrap gap-2">
          {skills.expertSkills.map((skill, index) => (
            <span key={index} className="flex items-center gap-1 text-green-600 text-xs bg-green-100 px-2 py-1 rounded-lg">
              <FaStar /> {skill}
              <button
                onClick={() => handleSkillRemove("expertSkills", index)}
                className="text-red-500 hover:text-red-700 ml-1"
              >
                ✕
              </button>
            </span>
          ))}
          {skills.intermediateSkills.map((skill, index) => (
            <span key={index} className="flex items-center gap-1 text-yellow-600 text-xs bg-yellow-100 px-2 py-1 rounded-lg">
              <FaWrench /> {skill}
              <button
                onClick={() => handleSkillRemove("intermediateSkills", index)}
                className="text-red-500 hover:text-red-700 ml-1"
              >
                ✕
              </button>
            </span>
          ))}
          {skills.beginnerSkills.map((skill, index) => (
            <span key={index} className="flex items-center gap-1 text-gray-600 text-xs bg-gray-100 px-2 py-1 rounded-lg">
              <FaTools /> {skill}
              <button
                onClick={() => handleSkillRemove("beginnerSkills", index)}
                className="text-red-500 hover:text-red-700 ml-1"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Add New Skill Section */}
      <div className="w-full">
        <p className="text-sm font-semibold mb-1">Add New Skill:</p>
        <div className="flex items-center gap-2">
          <select
            value={newSkill.type}
            onChange={(e) => setNewSkill((prev) => ({ ...prev, type: e.target.value }))}
            className="text-sm px-2 py-1 border rounded-lg focus:outline-none"
          >
            <option value="expertSkills">Expert</option>
            <option value="intermediateSkills">Intermediate</option>
            <option value="beginnerSkills">Beginner</option>
          </select>
          <input
            type="text"
            placeholder="Enter skill"
            value={newSkill.value}
            onChange={(e) => setNewSkill((prev) => ({ ...prev, value: e.target.value }))}
            className="text-sm px-2 py-1 border rounded-lg focus:outline-none flex-grow"
          />
          <button
            onClick={handleAddSkill}
            className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Add
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default AddNewSkillToTutor;
