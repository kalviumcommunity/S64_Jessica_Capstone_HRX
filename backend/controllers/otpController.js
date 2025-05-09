const admin = require('../config/firebase');

const sendOTP = async (req, res) => {
    try {
        const { phoneNumber } = req.body;

        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                message: 'Phone number is required'
            });
        }

        // Validate phone number format (basic validation)
        const phoneRegex = /^\+[1-9]\d{1,14}$/;
        if (!phoneRegex.test(phoneNumber)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid phone number format. Please use international format (e.g., +1234567890)'
            });
        }

        // Note: The actual OTP sending is handled by Firebase on the client side
        // This endpoint just validates the phone number and returns success
        res.status(200).json({
            success: true,
            message: 'Phone number validated successfully. Please proceed with Firebase phone authentication on the client side.',
            phoneNumber
        });
    } catch (error) {
        console.error('Error in sendOTP:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process phone number verification',
            error: error.message
        });
    }
};

const verifyOTP = async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({
                success: false,
                message: 'ID token is required'
            });
        }

        // Verify the ID token
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        
        // Get the phone number from the decoded token
        const phoneNumber = decodedToken.phone_number;

        if (!phoneNumber) {
            return res.status(400).json({
                success: false,
                message: 'Phone number not found in token'
            });
        }

        // Create a custom token for your app's authentication
        const customToken = await admin.auth().createCustomToken(decodedToken.uid);

        res.status(200).json({
            success: true,
            message: 'Phone number verified successfully',
            phoneNumber,
            customToken
        });
    } catch (error) {
        console.error('Error in verifyOTP:', error);
        
        // Handle specific Firebase Auth errors
        if (error.code === 'auth/id-token-expired') {
            return res.status(401).json({
                success: false,
                message: 'Token has expired. Please request a new verification code.'
            });
        }
        
        if (error.code === 'auth/invalid-id-token') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. Please try again.'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to verify OTP',
            error: error.message
        });
    }
};

module.exports = {
    sendOTP,
    verifyOTP
}; 