import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import OTPApp from "./OTPApp";

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const validateSession = async () => {
            const email = localStorage.getItem("email");
            const sessionId = localStorage.getItem("sessionId");

            if (email && sessionId) {
                try {
                    const response = await fetch("https://authenticator-zppp.onrender.com/validate-session", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email, sessionId }),
                    });

                    if (response.ok) {
                        setUser({ email, sessionId }); 
                    } else {
                        localStorage.removeItem("email");
                        localStorage.removeItem("sessionId");
                    }
                } catch (error) {
                    console.error("Error validating session:", error);
                }
            }

            setLoading(false);
        };

        validateSession();
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
        </Router>
    );
}

export default App;
