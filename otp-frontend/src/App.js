import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import OTPApp from "./OTPApp";
import { validateSession } from './api';
import { auth } from "./firebase";
import StudentDetails from "./StudentDetails";

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkSession = () => {
            auth.onAuthStateChanged(async (currentUser) => {
                if (currentUser) {
                    const email = localStorage.getItem("email");
                    const sessionId = localStorage.getItem("sessionId");
                    try {
                        const token = await currentUser.getIdToken();
                        await validateSession(email, sessionId); // Validate session with token
                        setUser({ email, sessionId });
                    } catch (error) {
                        console.error("Session validation failed:", error);
                        localStorage.removeItem("email");
                        localStorage.removeItem("sessionId");
                    }
                } else {
                    console.log("No user is signed in");
                }
                setLoading(false);
            });
        };

        checkSession();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <Router>
            <Routes>
                <Route
                    path="/"
                    element={user ? <Navigate to="/otp" /> : <Login setUser={setUser} />}
                />
                <Route
                    path="/otp"
                    element={
                        user ? (
                            <OTPApp user={user} setUser={setUser} />
                        ) : (
                            <Navigate to="/" />
                        )
                    }
                />
            </Routes>
            <Routes>
            <Route path="/student-details" element={<StudentDetails />} />
            </Routes>
        </Router>
    );
}

export default App;


