const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const db = require('../config/firebase');
const admin = require('firebase-admin');

// OTP endpoints
router.get("/otp", verifyToken, (req, res) => {
    res.json({ otp: req.app.locals.currentOTP, timestamp: req.app.locals.otpGeneratedAt });
});

// Auth endpoints
router.post("/login", verifyToken, async (req, res) => {
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

router.post("/logout", verifyToken, async (req, res) => {
    const email = req.user.email; // Ensure email is taken from token
    try {
        const sessionRef = db.collection("sessions").doc(email);
        await sessionRef.delete(); // Delete session from DB
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.error("Error during logout:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


// Session validation
router.post("/validate-session", async (req, res) => {
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


// Admin endpoints
router.post("/upload-csv", verifyToken, isAdmin, async (req, res) => {
    // ... CSV upload logic ...
});

router.post("/get-user-data", verifyToken, isAdmin, async (req, res) => {
    const email = req.user.email; 
    console.log("Email:", email);
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

router.get("/id-information", verifyToken, async (req, res) => {
    try {
        const email = req.user.email; // Extract email from the verified JWT token
        console.log("Email:", email);
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
        console.error("Error fetching ID information:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Helper functions
const extractFileId = (link) => {
    const match = link.match(/id=([\w-]+)/);
    return match ? match[1] : null;
};

module.exports = router;