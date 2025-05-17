import { useState, useEffect } from 'react';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth, signInWithPhone } from '../../Firebase';
import api from '../../services/apiService';

const PhoneAuth = ({ onSuccess }) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [verificationId, setVerificationId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Setup reCAPTCHA verifier only once
    useEffect(() => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'normal',
                'callback': () => {
                    // reCAPTCHA solved
                }
            });
            window.recaptchaVerifier.render();
        }
        // Cleanup on unmount
        return () => {
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
            }
        };
    }, []);

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
            // No need to call setupRecaptcha here anymore

            const confirmationResult = await signInWithPhoneNumber(
                auth,
                formattedPhone,
                window.recaptchaVerifier
            );
            setVerificationId(confirmationResult.verificationId);
            setSuccess('OTP sent successfully!');
        } catch (error) {
            console.error('Error sending OTP:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            // Verify OTP and get user data
            const userData = await signInWithPhone(phoneNumber, verificationId, otp);
            
            // Get the ID token
            const idToken = await auth.currentUser.getIdToken();

            // Verify with backend
            const response = await api.post('/otp/verify', { idToken });
            
            if (response.data.success) {
                setSuccess('Phone number verified successfully!');
                // Call the success callback with user data
                if (onSuccess) {
                    onSuccess(userData);
                }
            }
        } catch (error) {
            console.error('Error verifying OTP:', error);
            setError(error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}
            
            {success && (
                <div className="p-3 bg-green-100 text-green-700 rounded">
                    {success}
                </div>
            )}

            {!verificationId ? (
                <form onSubmit={handleSendOTP} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="+1234567890"
                            className="mt-1 block w-full rounded-md border border-border bg-input text-foreground shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                        />
                    </div>
                    
                    <div id="recaptcha-container" className="mb-4 bg-card rounded"></div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-hrms-blue text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {loading ? 'Sending...' : 'Send OTP'}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground">
                            Enter OTP
                        </label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            placeholder="Enter 6-digit OTP"
                            className="mt-1 block w-full rounded-md border border-border bg-input text-foreground shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            required
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-hrms-blue text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                </form>
            )}
        </div>
    );
};

export default PhoneAuth; 