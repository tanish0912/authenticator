const admin = require('firebase-admin');

// Array of allowed admin emails
const ADMIN_EMAILS = ['admin@sst.scaler.com', 'tanish.24bcs10008@sst.scaler.com'];

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log("No token provided");
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        if (!decodedToken.email.endsWith('@sst.scaler.com')) {
            console.log("Unauthorized email domain");
            return res.status(403).json({ message: 'Unauthorized email domain' });
        }
        req.user = decodedToken; // Attach decoded token to the request
        next(); // Pass control to the next middleware or route
    } catch (error) {
        console.error('Token verification failed:', error);
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
    if (!req.user || !req.user.email) {
        console.log("Authentication required");
        return res.status(401).json({ message: 'Authentication required' });
    }

    if (!ADMIN_EMAILS.includes(req.user.email)) {
        console.log("Admin access required");
        return res.status(403).json({ message: 'Admin access required' });
    }

    next(); // Pass control to the next middleware or route
};

module.exports = { verifyToken, isAdmin };
