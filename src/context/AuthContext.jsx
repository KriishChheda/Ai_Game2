import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase"; // we import the auth object from our firebase configuration to interact with Firebase Authentication
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
// these are functions from firebase auth module to handle user authentication and state changes

const AuthContext = createContext(); // this is a global object that will hold our authentication state and functions, allowing us to access them from any component in our app without prop drilling

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }
  // when signup is called with an email and password, it uses Firebase's createUserWithEmailAndPassword function to create a new user account. This function returns a promise that resolves with the user credentials if the signup is successful, or rejects with an error if it fails (e.g., if the email is already in use or the password is too weak).

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }
  // this function is similar to signup but instead of creating a new account, it attempts to sign in an existing user with the provided email and password. It also returns a promise that resolves with the user credentials if the login is successful, or rejects with an error if it fails (e.g., if the email/password combination is incorrect).

  function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = { user, signup, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// createContext creates a context object which is globally accessible in the component tree.
// useContext is a hook that allows components to consume the context value.