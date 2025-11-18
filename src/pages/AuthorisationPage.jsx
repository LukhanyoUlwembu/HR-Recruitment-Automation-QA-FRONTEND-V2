import React, { useState } from 'react';
import logo from "../assets/logo.svg";
import { Link, useNavigate } from 'react-router-dom';
import AuthImmg from "../assets/AuthImmg.png";
import { useAuth } from "./useAuth";
import { BASE_URL } from './useAuth';

const AuthPage = () => {
  const { login, getAccount } = useAuth();
  const navigate = useNavigate();

  const [showFirstClickMessage, setShowFirstClickMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    
    try {
      // Clear previous session data
      sessionStorage.clear();

      // First click just initiates Microsoft auth flow
      if (!showFirstClickMessage) {
        await login();
        setShowFirstClickMessage(true);
        setIsLoading(false);
        return;
      }

      // Second click completes the process
      const acc = getAccount();
      if (!acc?.username) {
        throw new Error("Account information not available - please try again");
      }

      // Fetch user profile
      // const response = await fetch(`${BASE_URL}/employees/${acc.username}`);
      const response = await fetch(
  `${BASE_URL}/employees/${encodeURIComponent(acc.username)}`
);

      if (!response.ok) throw new Error("Profile fetch failed");
      
      const data = await response.json();
      if (!data?.role) throw new Error("Invalid profile data");

      // Store session data
      sessionStorage.setItem("empEmail", acc.username);
      sessionStorage.setItem("empName", acc.name);
      sessionStorage.setItem("role", data.role.name);

      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setShowFirstClickMessage(false); 
       setShowErrorPopup(true);
    } finally {
      setIsLoading(false);
    }
  };
          {/* Error Popup Modal */}
      {showErrorPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl text-center max-w-md">
            <h2 className="text-2xl font-semibold mb-4 text-blue-600">Login Failed</h2>
            <p className="text-gray-800 mb-6">
              Please try again, or contact your administrator if you're unable to access your account.
            </p>
            <button
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
              onClick={() => setShowErrorPopup(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      {/* First Click Instructions */}
      {showFirstClickMessage && !isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl text-center max-w-md">
            <h2 className="text-2xl font-semibold mb-4 text-blue-600">Almost There!</h2>
            <p className="text-gray-800 mb-6">
              Please click the Recruiter button again to complete your login.
            </p>
            <button
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
              onClick={handleLogin}
            >
              Complete Login
            </button>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-40">
          <div className="bg-white p-6 rounded-xl shadow-xl text-center">
            <p className="text-blue-600 font-medium">Processing your login...</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
        <div className="text-center md:text-left">
          <img className="h-32 w-auto mx-36" src={logo} alt="logo" />
          <h1 className="text-blue-500 text-4xl md:text-6xl font-bold mt-8">
            We make life better!
          </h1>
          <p className="text-blue-500 mt-6 text-2xl md:text-3xl mx-20">
            Together Let's Make Hiring Better
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-10 ml-28 md:justify-start">
            <button
              className={`border-4 border-blue-500 py-4 px-6 rounded-2xl font-bold text-xl 
                ${isLoading ? 'bg-blue-100 text-blue-700' : 'text-blue-500 hover:bg-blue-50'}`}
              onClick={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Recruiter'}
            </button>
            <Link to="/signin">
              <button 
                className="border-4 border-blue-500 text-blue-500 py-4 px-6 rounded-2xl font-bold text-xl hover:bg-blue-50"
                disabled={isLoading}
              >
                Applicant
              </button>
            </Link>
          </div>
        </div>

        <img
          className="w-[300px] md:w-[400px] h-auto"
          src={AuthImmg}
          alt="Auth Illustration"
        />
      </div>
    </div>
  );
};

export default AuthPage;

