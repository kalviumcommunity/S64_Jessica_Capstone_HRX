// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, PhoneAuthProvider, signInWithCredential } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "hrx-hrms-4880a.firebaseapp.com",
  projectId: "hrx-hrms-4880a",
  storageBucket: "hrx-hrms-4880a.firebasestorage.app",
  messagingSenderId: "787591023396",
  appId: "1:787591023396:web:54255b0ea8acd0ced6c1b1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Google Sign In function
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    // Extract only the necessary user data
    const userData = {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName,
      photoURL: result.user.photoURL,
      emailVerified: result.user.emailVerified
    };
    return userData;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

// Phone Sign In function
export const signInWithPhone = async (phoneNumber, verificationId, otp) => {
  try {
    const credential = PhoneAuthProvider.credential(verificationId, otp);
    const result = await signInWithCredential(auth, credential);
    // Extract only the necessary user data
    const userData = {
      uid: result.user.uid,
      phoneNumber: result.user.phoneNumber,
      emailVerified: result.user.emailVerified
    };
    return userData;
  } catch (error) {
    console.error("Error signing in with phone:", error);
    throw error;
  }
};

export { auth, googleProvider, PhoneAuthProvider };