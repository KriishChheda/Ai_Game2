import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import GamePage from "./components/GamePage";
import Auth from "./components/Auth";
import Profile from "./components/Profile"; // 1. Import the Profile component
import { AuthProvider, useAuth } from "./context/AuthContext";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth(); // It's good practice to check a 'loading' state if your AuthContext has one
  
  if (loading) return <div className="bg-black min-h-screen" />; // Prevent flicker during auth check
  return user ? children : <Navigate to="/auth" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/auth" element={<Auth />} />

          {/* Protected Routes - Only accessible if logged in */}
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <GamePage />
              </PrivateRoute>
            } 
          />

          <Route 
            path="/profile" 
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } 
          />

          {/* Fallback: Redirect any unknown routes to the game or login */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;