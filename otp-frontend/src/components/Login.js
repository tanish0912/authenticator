import React from "react";
import { useNavigate } from "react-router-dom";
import { auth, provider, signInWithPopup } from "../firebase";

const Login = ({ setUser }) => {
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const email = result.user.email;

          
            if (!email.endsWith("@sst.scaler.com")) {
                alert("Access Denied: Only @sst.scaler.com emails are allowed.");
                await auth.signOut();
                return;
            }

           
            const rollNo = email.split("@")[0].split(".")[1].toUpperCase(); // Extract roll number after "."
            

            // Validate roll number with backend
            const response = await fetch("https://authenticator-zppp.onrender.com/validate-rollno", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rollNo }),
            });

            if (!response.ok) {
                const data = await response.json();
                alert(`Access Denied: ${data.message}`);
                await auth.signOut();
                return;
            }

            const sessionId = generateSessionId(); // Generate session ID

            // Call backend to create session
            const sessionResponse = await fetch("https://authenticator-zppp.onrender.com/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, sessionId }),
            });

            if (sessionResponse.status === 403) {
                alert("You are already logged in on another device. Logout first.");
                await auth.signOut();
                return;
            }

            if (sessionResponse.ok) {
                localStorage.setItem("email", email);
                localStorage.setItem("sessionId", sessionId);

                setUser(result.user);
                navigate("/otp");
            } else {
                alert("Login failed. Please try again.");
            }
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    const generateSessionId = () => {
        return Math.random().toString(36).substr(2) + Date.now().toString(36);
    };

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h2>Welcome to the App</h2>
            <button onClick={handleLogin} style={styles.button}>
                Login with Google
            </button>
        </div>
    );
};

const styles = {
    button: {
        backgroundColor: "#4285F4",
        color: "#fff",
        padding: "10px 20px",
        fontSize: "16px",
        borderRadius: "5px",
        border: "none",
        cursor: "pointer",
    },
};

export default Login;
