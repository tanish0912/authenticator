const express = require("express");
const cors = require("cors");
const apiRoutes = require('./routes/api');

const app = express();

app.use(cors());
app.use(express.json());

// Initialize OTP generation
app.locals.currentOTP = null;
app.locals.otpGeneratedAt = null;

const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

const regenerateOTP = () => {
    app.locals.currentOTP = generateOTP();
    app.locals.otpGeneratedAt = Date.now();
    console.log("New OTP generated:", app.locals.currentOTP, "at", app.locals.otpGeneratedAt);
};

regenerateOTP();
setInterval(regenerateOTP, 30000);

// API Routes
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});