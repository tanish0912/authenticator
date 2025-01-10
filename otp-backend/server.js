const express = require("express");
const cors = require("cors");
const db = require("./firebase"); 
const admin = require("firebase-admin"); 

const app = express();
const fs = require("fs");
const csv = require("csv-parser");

app.use(cors());
app.use(express.json());

let currentOTP = null;
let otpGeneratedAt = null;


const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};


const regenerateOTP = () => {
    currentOTP = generateOTP();
    otpGeneratedAt = Date.now();
    console.log("New OTP generated:", currentOTP, "at", otpGeneratedAt);
};

regenerateOTP();
setInterval(regenerateOTP, 30000);


app.get("/otp", (req, res) => {
    res.json({ otp: currentOTP, timestamp: otpGeneratedAt });
});

app.post("/login", async (req, res) => {
    const { email, sessionId } = req.body;

    try {
        const sessionRef = db.collection("sessions").doc(email);
        const sessionDoc = await sessionRef.get();

        if (sessionDoc.exists) {
            return res.status(403).json({ message: "Session already exists. Logout first." });
        }

        await sessionRef.set({
            sessionId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        res.status(200).json({ message: "Login successful" });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.post("/logout", async (req, res) => {
    const { email } = req.body;

    try {
        const sessionRef = db.collection("sessions").doc(email);
        await sessionRef.delete();

        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.error("Error during logout:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.post("/validate-session", async (req, res) => {
    const { email, sessionId } = req.body;

    try {
        const sessionRef = db.collection("sessions").doc(email);
        const sessionDoc = await sessionRef.get();

        if (!sessionDoc.exists || sessionDoc.data().sessionId !== sessionId) {
            return res.status(401).json({ message: "Invalid session" });
        }

        res.status(200).json({ message: "Session is valid" });
    } catch (error) {
        console.error("Error validating session:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});




// Endpoint to upload CSV data to Firestore
app.post("/upload-csv", async (req, res) => {
    const filePath = "./data.csv"; // Path to your CSV file
    const students = [];

    try {
        // Read and parse CSV
        fs.createReadStream(filePath)
            .pipe(csv())
            .on("data", (row) => {
                // Adjust row keys to match your CSV headers
                const rollNo = row["Roll number"].trim();
                const name = row["Full Name"].trim();
                const photo = row["Profile picture"].trim();

                students.push({ rollNo, name, photo });
            })
            .on("end", async () => {
                // Insert students into Firestore
                const batch = db.batch(); // Batch writes for efficiency
                students.forEach((student) => {
                    const studentRef = db.collection("students").doc(student.rollNo);
                    batch.set(studentRef, {
                        rollNo: student.rollNo,
                        name: student.name,
                        photo: student.photo,
                    });
                });

                await batch.commit();
                res.status(200).json({ message: "CSV data uploaded successfully" });
            });
    } catch (error) {
        console.error("Error uploading CSV:", error);
        res.status(500).json({ message: "Error uploading CSV" });
    }
});


app.post("/validate-rollno", async (req, res) => {
    const { rollNo } = req.body; 
    try {
        const studentRef = db.collection("students").doc(rollNo);
        const studentDoc = await studentRef.get();

        if (!studentDoc.exists) {
            // Roll number not found in database
            return res.status(404).json({ message: "Roll number not found in database" });
        }

        // Roll number is valid
        res.status(200).json({ message: "Roll number is valid" });
    } catch (error) {
        console.error("Error validating roll number:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


const extractFileId = (link) => {
    // Updated regex to extract `id` parameter from the given Drive URLs
    const match = link.match(/id=([\w-]+)/);
    return match ? match[1] : null;
};

app.post("/get-user-data", async (req, res) => {
    const { email } = req.body;

    try {
        const rollNo = email.split("@")[0].split(".")[1].toUpperCase();
        const studentRef = db.collection("students").doc(rollNo);
        const studentDoc = await studentRef.get();

        if (!studentDoc.exists) {
            return res.status(404).json({ message: "User not found" });
        }

        const { name, photo } = studentDoc.data();
        const fileId = extractFileId(photo);
        const thumbnailPhoto = fileId
            ? `https://drive.google.com/thumbnail?id=${fileId}`
            : photo;

        res.status(200).json({ name, rollNo, photo: thumbnailPhoto });
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});






const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
