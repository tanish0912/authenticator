import React, { useState, useEffect, useRef } from "react";

const OTPApp = ({ user, setUser }) => {
    const [otp, setOtp] = useState("------");
    const [timer, setTimer] = useState(30);
    const [status, setStatus] = useState("");
    const [userData, setUserData] = useState(null);
    const intervalRef = useRef(null);

    const fetchUserData = async () => {
        try {
            const response = await fetch("https://otp-app-backend-oufd.onrender.com/get-user-data", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: user.email }),
            });

            const data = await response.json();

            if (response.ok) {
                setUserData(data);
            } else {
                console.error("Error fetching user data:", data.message);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    const fetchOTP = async () => {
        try {
            setOtp("Loading...");
            setStatus("");

            const response = await fetch("https://otp-app-backend-oufd.onrender.com/otp");
            const data = await response.json();

            const otpTimestamp = data.timestamp;
            const serverTime = new Date(otpTimestamp);
            const now = new Date();
            const elapsed = Math.floor((now - serverTime) / 1000);
            const remainingTime = 30 - elapsed;

            if (remainingTime > 0) {
                setOtp(data.otp);
                startCountdown(remainingTime);
            } else {
                fetchOTP();
            }
        } catch (error) {
            setOtp("------");
            setStatus("Error fetching OTP. Retrying...");
            setTimeout(fetchOTP, 3000);
        }
    };

    const startCountdown = (remainingTime) => {
        setTimer(remainingTime);

        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        intervalRef.current = setInterval(() => {
            setTimer((prev) => {
                if (prev > 1) {
                    return prev - 1;
                } else {
                    clearInterval(intervalRef.current);
                    fetchOTP();
                    return 0;
                }
            });
        }, 1000);
    };

    useEffect(() => {
        fetchUserData();
        fetchOTP();

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    const handleLogout = async () => {
        try {
            await fetch("https://otp-app-backend-oufd.onrender.com/logout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: user.email }),
            });

            localStorage.removeItem("email");
            localStorage.removeItem("sessionId");

            setUser(null);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <div className="container">
            <div className="card">
                {userData && (
                    <div className="profile-section">
                        <div className="image-container">
                            <img
                                alt="User Profile"
                                src={userData.photo}
                                className="profile-image"
                            />
                        </div>
                        <h2 className="user-name">{userData.name}</h2>
                        <h3 className="roll-no">Roll No: {userData.rollNo}</h3>
                    </div>
                )}

                <div className="otp-section">
                    <h3 className="otp-label">Your One-Time Password</h3>
                    <div className="otp-display">{otp}</div>
                    <div className="timer-container">
                        <div className="timer-dot"></div>
                        <span className="timer-text">Expires in: </span>
                        <span className="timer-seconds">{timer} seconds</span>
                    </div>
                </div>

                {status && <div className="error-message">{status}</div>}

                <button onClick={handleLogout} className="logout-button">
                    Logout
                </button>
            </div>

            <style jsx>{`
                .container {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    background-color: #2563eb; /* Royal blue background from the image */
                }

                .card {
                    background: white;
                    border-radius: 20px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    padding: 32px;
                    width: 100%;
                    max-width: 400px;
                }

                .profile-section {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    margin-bottom: 32px;
                }

                .image-container {
                    width: 250px;
                    height: 250px;
                    margin-bottom: 24px;
                    border-radius: 15px;
                    overflow: hidden;
                }

                .profile-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .user-name {
                    font-size: 24px;
                    font-weight: bold;
                    color: #333;
                    margin: 0 0 8px 0;
                }

                .roll-no {
                    font-size: 18px;
                    color: #666;
                    margin: 0;
                }

                .otp-section {
                    background-color: white;
                    border-radius: 15px;
                    padding: 24px;
                    margin-bottom: 24px;
                    text-align: center;
                }

                .otp-label {
                    font-size: 18px;
                    color: #666;
                    margin-bottom: 16px;
                }

                .otp-display {
                    font-size: 36px;
                    font-weight: bold;
                    color: #2563eb; /* Same blue as background */
                    letter-spacing: 2px;
                    margin-bottom: 16px;
                }

                .timer-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }

                .timer-dot {
                    width: 10px;
                    height: 10px;
                    background-color: #22c55e; /* Green color from the image */
                    border-radius: 50%;
                    animation: pulse 1.5s infinite;
                }

                .timer-text {
                    font-size: 18px;
                    color: #666;
                }

                .timer-seconds {
                    font-size: 18px;
                    color: #22c55e; /* Green color from the image */
                }

                .error-message {
                    color: #dc3545;
                    text-align: center;
                    margin-bottom: 24px;
                }

                .logout-button {
                    width: 100%;
                    background-color: #2563eb; /* Same blue as background */
                    color: white;
                    border: none;
                    border-radius: 12px;
                    padding: 12px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .logout-button:hover {
                    background-color: #1d4ed8; /* Slightly darker blue */
                    transform: scale(1.02);
                }

                @keyframes pulse {
                    0% {
                        transform: scale(0.95);
                        opacity: 0.5;
                    }
                    50% {
                        transform: scale(1.05);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(0.95);
                        opacity: 0.5;
                    }
                }
            `}</style>
        </div>
    );
};

export default OTPApp;