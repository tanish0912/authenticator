const express = require('express'); 
const cors = require('cors');

const app = express();
app.use(cors()); 
let currentOTP = null;
const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString(); 
};
const regenerateOTP = () => {
    currentOTP = generateOTP();
    console.log("New OTP generated:", currentOTP); 
};

regenerateOTP();
setInterval(regenerateOTP, 30000);
app.get('/otp', (req, res) => {
    res.json({ otp: currentOTP });
});
const PORT = 3000; 
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
