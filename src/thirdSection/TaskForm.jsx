import React, { useState } from "react";
import axios from "axios";

const TaskForm = ({ taskID, clientID }) => {
  const [formData, setFormData] = useState({
    taskID: taskID || "T-00123",
    clientDetails: {
      clientID: clientID || "C-54321",
      name: "",
      subject: "",
      totalAmount: "",
      receivedAmount: "",
      duration: "",
      type: "assignment",
    },
    tutorDetails: {
      tutorID: "NA",
      name: "NA",
      totalAmount: "",
      amountPaid: "",
    },
    status: "New Task",
    agentDetails: {
      name: "",
      comment: "",
    },
    driveLink: "NA",
    clientDeadline: "",
    tutorDeadline: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === "checkbox" ? checked : value;

    if (name.includes(".")) {
      const [section, field] = name.split(".");

      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...(prev?.[section] || {}),
          [field]: finalValue,
        },
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  const safeNumber = (value) => {
    if (value === "" || value === null || value === undefined) return 0;
    return Number(value);
  };

  const preparePayload = () => {
    return {
      ...formData,
      clientDetails: {
        ...formData.clientDetails,
        totalAmount: safeNumber(formData.clientDetails.totalAmount),
        receivedAmount: safeNumber(formData.clientDetails.receivedAmount),
        duration: safeNumber(formData.clientDetails.duration),
      },
      tutorDetails: {
        ...formData.tutorDetails,
        totalAmount: safeNumber(formData.tutorDetails.totalAmount),
        amountPaid: safeNumber(formData.tutorDetails.amountPaid),
      },
      tutorDeadline: formData.tutorDeadline || new Date("2000-01-01T00:00:00Z"),
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = preparePayload();
    console.log(payload);

    // try {
    //   const response = await axios.post("http://localhost:5000/api/tasks", payload);
    //   console.log("Task saved:", response.data);
    // } catch (error) {
    //   console.error("Error saving task:", error);
    // }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-lg sm:p-8"
      >
        <h1 className="mb-6 text-center text-2xl font-semibold text-blue-600">
          Create New Task
        </h1>

        {/* Client Details */}
        <div className="mb-6 space-y-4">
          <h2 className="text-lg font-medium text-gray-800">Client Details</h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="clientID" className="block text-sm text-gray-700">
                Client ID <span className="text-red-500">*</span>
              </label>

              <input
                id="clientID"
                name="clientDetails.clientID"
                type="text"
                value={formData?.clientDetails?.clientID || ""}
                readOnly
                className="mt-2 w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 text-sm"
              />
            </div>

            <div>
              <label htmlFor="taskID" className="block text-sm text-gray-700">
                Task ID <span className="text-red-500">*</span>
              </label>

              <input
                id="taskID"
                name="taskID"
                type="text"
                value={formData?.taskID || ""}
                readOnly
                className="mt-2 w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="clientName"
                className="block text-sm text-gray-700"
              >
                Client Name <span className="text-red-500">*</span>
              </label>

              <input
                id="clientName"
                name="clientDetails.name"
                type="text"
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                value={formData?.clientDetails?.name || ""}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm text-gray-700">
                Subject
              </label>

              <input
                id="subject"
                name="clientDetails.subject"
                type="text"
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                value={formData?.clientDetails?.subject || ""}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="totalAmount"
                className="block text-sm text-gray-700"
              >
                Total Amount <span className="text-red-500">*</span>
              </label>

              <input
                id="totalAmount"
                name="clientDetails.totalAmount"
                type="number"
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                value={formData?.clientDetails?.totalAmount || ""}
                onChange={handleChange}
                onWheel={(e) => e.target.blur()}
                required
              />
            </div>

            <div>
              <label
                htmlFor="receivedAmount"
                className="block text-sm text-gray-700"
              >
                Received Amount <span className="text-red-500">*</span>
              </label>

              <input
                id="receivedAmount"
                name="clientDetails.receivedAmount"
                type="number"
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                value={formData?.clientDetails?.receivedAmount || ""}
                onChange={handleChange}
                onWheel={(e) => e.target.blur()}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="duration" className="block text-sm text-gray-700">
                Duration
              </label>

              <input
                id="duration"
                name="clientDetails.duration"
                type="number"
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                value={formData?.clientDetails?.duration || ""}
                onChange={handleChange}
                onWheel={(e) => e.target.blur()}
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm text-gray-700">
                Type <span className="text-red-500">*</span>
              </label>

              <select
                id="type"
                name="clientDetails.type"
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                value={formData?.clientDetails?.type || "assignment"}
                onChange={handleChange}
                required
              >
                <option value="assignment">Assignment</option>
                <option value="project">Project</option>
                <option value="session">Session</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tutor Details */}
        <div className="mb-6 space-y-4">
          <h2 className="text-lg font-medium text-gray-800">Tutor Details</h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="tutorName" className="block text-sm text-gray-700">
                Tutor Name
              </label>

              <input
                id="tutorName"
                name="tutorDetails.name"
                type="text"
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                value={formData?.tutorDetails?.name || ""}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="amountPaid" className="block text-sm text-gray-700">
                Amount Paid
              </label>

              <input
                id="amountPaid"
                name="tutorDetails.amountPaid"
                type="number"
                className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                value={formData?.tutorDetails?.amountPaid || ""}
                onChange={handleChange}
                onWheel={(e) => e.target.blur()}
              />
            </div>
          </div>
        </div>

        {/* Agent Details */}
        <div className="mb-6 space-y-4">
          <h2 className="text-lg font-medium text-gray-800">Agent Details</h2>

          <div>
            <label htmlFor="agentName" className="block text-sm text-gray-700">
              Agent Name <span className="text-red-500">*</span>
            </label>

            <input
              id="agentName"
              name="agentDetails.name"
              type="text"
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              value={formData?.agentDetails?.name || ""}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label
              htmlFor="agentComment"
              className="block text-sm text-gray-700"
            >
              Agent Comment
            </label>

            <textarea
              id="agentComment"
              name="agentDetails.comment"
              rows="4"
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              value={formData?.agentDetails?.comment || ""}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Deadline and Status */}
        <div className="mb-6 space-y-4">
          <div>
            <label
              htmlFor="clientDeadline"
              className="block text-sm text-gray-700"
            >
              Client Deadline <span className="text-red-500">*</span>
            </label>

            <input
              required
              id="clientDeadline"
              name="clientDeadline"
              type="datetime-local"
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              value={formData?.clientDeadline || ""}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm text-gray-700">
              Status
            </label>

            <select
              id="status"
              name="status"
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              value={formData?.status || "New Task"}
              onChange={handleChange}
            >
              <option value="New Task">New Task</option>
              <option value="Advance Received">Advance Received</option>
              <option value="Tutor Notified">Tutor Notified</option>
              <option value="Tutor Assigned">Tutor Assigned</option>
              <option value="Solution Received">Solution Received</option>
              <option value="Task Completed">Task Completed</option>
              <option value="Being Modified">Being Modified</option>
              <option value="Cancel">Cancel</option>
              <option value="Refund">Refund</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mb-4">
          <button
            type="submit"
            className="w-full rounded-lg bg-blue-500 px-4 py-2 text-sm text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;