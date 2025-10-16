import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/api/test")
      .then(res => setMessage(res.data.message))
      .catch(err => console.error("❌ Backend connection failed:", err));
  }, []);

  return (
    <div className="p-10 text-center">
      <h1 className="text-2xl font-bold text-blue-600">Project Management System</h1>
      <p className="mt-4 text-gray-700">{message || "Connecting to backend..."}</p>
    </div>
  );
}

export default App;
