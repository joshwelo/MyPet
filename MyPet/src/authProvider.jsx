import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from './firebaseConfig'; 
import { doc, setDoc } from 'firebase/firestore';
export const registerUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create a user profile in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      username: email.split('@')[0], // Example username based on email
      userpassword: password,
      userphoto: './assets/1.png', // Default or blank user photo
      useremail: email
    });

    return { message: 'User registered successfully!' };
  } catch (error) {
    return { message: error.message };
  }
};

import React, { useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, initializeUser);
    return unsubscribe;
  }, []);

  async function initializeUser(user) {
    if (user) {
      setCurrentUser({ ...user });
      setUserLoggedIn(true);
    } else {
      setCurrentUser(null);
      setUserLoggedIn(false);
    }
    setLoading(false);
  }

  const value = {
    currentUser,
    userLoggedIn,
    loading,
    setCurrentUser,
    setUserLoggedIn,
    setLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}