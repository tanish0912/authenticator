const express = require('express'); 
const cors = require('cors');

const app = express();
app.use(cors()); 

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

app.get('/otp', (req, res) => {
    res.json({ otp: currentOTP, timestamp: otpGeneratedAt }); 
});

const PORT = 3000; 
app.listen(PORT, () => {
    console.log(`Server is running!`);
});
