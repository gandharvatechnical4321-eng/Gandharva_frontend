import React, { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
const ActiveSessions = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showTable, setShowTable] = useState(false);

    const fetchSessions = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = Cookies.get("token");
            const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/auth/active-sessions`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data.success) {
                setSessions(response.data.sessions); 
                setShowTable(true);
            } else {
                setError(response.data.msg);
            }
        } catch (err) {
            setError("Failed to fetch active sessions.");
        } finally {
            setLoading(false);
        }
    };

    const expireSession = async (tokenToExpire) => {
        try {
            const token = Cookies.get("token");
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/auth/expire-token`, { token: tokenToExpire }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data.success) {
                setSessions(sessions.filter(session => session.token !== tokenToExpire));
                alert("Token expired successfully");
            } else {
                alert(response.data.message);
            }
        } catch (err) {
            alert("Failed to expire token.");
        }
    };

    return (
        <div className="p-4">
            <button 
                className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
                onClick={fetchSessions} 
                disabled={loading}
            >
                {loading ? "Loading..." : "Get Active Sessions"}
            </button>
            
            {error && <p className="text-red-500">{error}</p>}
            <div className="h-[50vh] overflow-auto">
            {showTable && sessions.length > 0 && (
                <table className="w-full border-collapse border  border-gray-300">
                    <thead>
                        <tr className="bg-gray-100">
                        <th className="border p-2">Device</th>
                        <th className="border p-2">name</th>
                            <th className="border p-2">Email</th>
                            <th className="border p-2">role</th>
                            <th className="border p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sessions.map((session) => (
                            <tr key={session._id}>
                                <td className="border p-2">{session?.device?session?.device:"NA"}</td>
                                <td className="border p-2">{session.userName}</td>
                                <td className="border p-2">{session.userId.email}</td>
                                <td className="border p-2">{session.role}</td>
                                <td className="border p-2">
                                    <button 
                                        className="bg-red-500 text-white px-3 py-1 rounded"
                                        onClick={() => expireSession(session.token)}
                                    >
                                        Expire
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            </div>
        </div>
    );
};

export default ActiveSessions;