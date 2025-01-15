import React from "react";
import { useNavigate } from "react-router-dom";
import { auth, provider, signInWithPopup } from "../firebase";
import { login } from '../api';

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
    
            const sessionId = generateSessionId();
    
            try {
                await login(email, sessionId);
                localStorage.setItem("email", email);
                localStorage.setItem("sessionId", sessionId);               
                setUser({ email, sessionId });

                navigate("/otp");
            } catch (error) {
                if (error.message.includes("403")) {
                    alert("You are already logged in on another device. Logout first.");
                } else {
                    alert("Login failed. Please try again.");
                }
                await auth.signOut();
            }
        } catch (error) {
            console.error("Login failed:", error);
        }
    };
    

    const generateSessionId = () => {
        return Math.random().toString(36).substr(2) + Date.now().toString(36);
    };

    // Rest of the component remains the same (styles and return statement)
    return (
        <div style={styles.container}>
            <img
                src="https://assets-v2.scaler.com/assets/programs/undergrad/webp/sst-logo-044e63073f49b767e6bca532d5fe0145b768bb12699e822d7cbce37efaa5f8f4.webp.gz"
                alt="SST Logo"
                style={styles.logo}
            />
            <img
                src={require("../loginscreenimg.png")}
                alt="Login Screen Illustration"
                style={styles.image}
            />
            <p style={styles.text}>
                Verify your identity seamlessly & securely <br></br> with your SST email!
            </p>
            <button
                onClick={handleLogin}
                style={styles.button}
                onMouseEnter={(e) => {
                    e.target.style.backgroundColor = styles.buttonHover.backgroundColor;
                    e.target.style.boxShadow = styles.buttonHover.boxShadow;
                }}
                onMouseLeave={(e) => {
                    e.target.style.backgroundColor = styles.button.backgroundColor;
                    e.target.style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 0.1)";
                }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    style={styles.svgIcon}
                >
                    <path
                        fill="#EA4335"
                        d="M24 9.5c3.2 0 5.9 1.2 7.9 3.1l5.9-5.9C33.7 3.4 29.1 1.5 24 1.5 14.7 1.5 7 7.7 3.7 15.8l6.9 5.4c1.7-5.2 6.5-8.7 13.4-8.7z"
                    />
                    <path
                        fill="#34A853"
                        d="M46.1 24.5c0-1.5-.1-2.9-.4-4.3H24v8.6h12.5c-.5 2.7-1.8 5-3.8 6.6l6.3 4.9c3.7-3.4 5.9-8.4 5.9-14.2z"
                    />
                    <path
                        fill="#4A90E2"
                        d="M10.6 28.1c-1-2.8-1-5.8-.1-8.6L3.7 15.8C.4 21.4.4 27.7 3.7 33.3l6.9-5.2z"
                    />
                    <path
                        fill="#FBBC05"
                        d="M24 46.5c6.1 0 11.3-2 15.1-5.5l-6.3-4.9c-2.6 1.9-6 3-8.8 3-6.6 0-12.4-4.4-14.4-10.8l-6.9 5.4C7.1 41.7 14.6 46.5 24 46.5z"
                    />
                </svg>
                Continue with Google
            </button>
        </div>
    );
};

const styles = {
    container: {
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f8f9fa",
        position: "relative",
    },
    logo: {
        width: "150px",
        height: "auto",
        position: "absolute",
        top: "50px",
    },
    image: {
        width: "300px",
        height: "auto",
        marginBottom: "20px",
    },
    text: {
        fontSize: "18px",
        color: "#555",
        marginBottom: "40px",
        textAlign: "center",
    },
    button: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
        color: "black",
        fontSize: "16px",
        fontWeight: "bold",
        border: "1px solid #ccc",
        borderRadius: "5px",
        padding: "10px 20px",
        cursor: "pointer",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        transition: "background-color 0.3s ease, box-shadow 0.3s ease",
        marginTop: "80px",
    },
    buttonHover: {
        backgroundColor: "#f0f0f0",
        boxShadow: "0px 6px 8px rgba(0, 0, 0, 0.15)",
    },
    svgIcon: {
        width: "20px",
        height: "20px",
        marginRight: "10px",
    },
};

export default Login;