import React, { useState } from "react";
import { getUserData } from './api';

const StudentDetails = () => {
    const [email, setEmail] = useState("");
    const [studentData, setStudentData] = useState(null);
    const [error, setError] = useState("");

    const handleSearch = async () => {
        if (!email) {
            setError("Please enter an email.");
            return;
        }

        try {
            setError("");
            const data = await getUserData(email);
            setStudentData(data);
        } catch (err) {
            setError("Failed to fetch student data. Please try again.");
            setStudentData(null);
        }
    };

    // Rest of the component remains the same
    return (
        <div style={styles.container}>
            <h2>Search Student Details</h2>
            <div style={styles.searchContainer}>
                <input
                    type="email"
                    placeholder="Enter Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={styles.input}
                />
                <button onClick={handleSearch} style={styles.button}>
                    Search
                </button>
            </div>
            {error && <p style={styles.error}>{error}</p>}
            {studentData && (
                <div style={styles.resultContainer}>
                    <img
                        src={studentData.photo}
                        alt={`${studentData.name}'s photo`}
                        style={styles.image}
                    />
                    <h3>{studentData.name}</h3>
                    <p><strong>Roll Number:</strong> {studentData.rollNo}</p>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        textAlign: "center",
        marginTop: "50px",
        fontFamily: "Arial, sans-serif",
    },
    searchContainer: {
        margin: "20px auto",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "10px",
    },
    input: {
        padding: "10px",
        width: "250px",
        borderRadius: "5px",
        border: "1px solid #ccc",
    },
    button: {
        padding: "10px 20px",
        borderRadius: "5px",
        border: "none",
        backgroundColor: "#4285F4",
        color: "#fff",
        cursor: "pointer",
    },
    error: {
        color: "red",
        marginTop: "10px",
    },
    resultContainer: {
        marginTop: "30px",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "10px",
        width: "300px",
        margin: "20px auto",
        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
    },
    image: {
        width: "150px",
        height: "150px",
        borderRadius: "10px",
        objectFit: "cover",
        marginBottom: "10px",
    },
};

export default StudentDetails;