/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ulwembuLogo from '../assets/ulwembu-logo.svg';
import normalWave from '../assets/normal_u60.svg';
import normalU0 from '../assets/normal_u0.svg';
import Footer from '../components/navigation/Footer.jsx';
import { BASE_URL } from './useAuth';
export default function ResetPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const api = {
    checkEmailExists: async (email) => {
      const res = await fetch(`${BASE_URL}/applicants/email?email=${email}`);
      return await res.json(); 
    },
    sendOtp: async (email) => {
      const res = await fetch(`${BASE_URL}/auth/otp/reset/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('Failed to send OTP');
    },
    verifyOtp: async (email, otp) => {
      const res = await fetch(`${BASE_URL}/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      if (!res.ok) throw new Error('Invalid or expired OTP');
    },
    resetPassword: async (email, password) => {
      const res = await fetch(`${BASE_URL}/applicants/reset-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error('Failed to reset password');
    },
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email) return setErrors({ email: 'Please enter your email' });

    try {
      const exists = await api.checkEmailExists(email);
      if (!exists) {
        setErrors({ email: 'Email not found. Please sign up.' });
      } else {
        await api.sendOtp(email);
        setErrors({});
        setStep(2);
      }
    } catch (err) {
      setErrors({ email: 'Something went wrong. Please try again.' });
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otp) return setErrors({ otp: 'Please enter the OTP' });

    try {
      await api.verifyOtp(email, otp);
      setErrors({});
      setStep(3);
    } catch (err) {
      setErrors({ otp: 'Invalid or expired OTP' });
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};
    let isValid = true;

    if (!formData.newPassword) {
      newErrors.newPassword = 'Please enter a new password';
      isValid = false;
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
      isValid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);

    if (isValid) {
      try {
        await api.resetPassword(email, formData.newPassword);
        navigate('/signin');
      } catch (err) {
        setErrors({ newPassword: 'Failed to reset password. Try again.' });
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow flex justify-center bg-white relative">
        {/* Blue wave background */}
        <div className="absolute -left-32 top-0 h-full w-1/2 overflow-visible z-0 pointer-events-none">
          <img src={normalU0} alt="Blue Wave Outline" className="w-full h-full object-cover absolute top-0 right-5" style={{ transform: 'rotate(270deg)', opacity: 0.7, zIndex: 1 }} />
          <img src={normalWave} alt="Blue Wave" className="w-full h-full object-cover absolute top-0 -left-20" style={{ transform: 'rotate(270deg)', opacity: 1, zIndex: 2 }} />
        </div>

        <div className="relative z-10 w-full max-w-md my-auto">
          <div className="flex justify-center mb-4 mt-8">
            <img src={ulwembuLogo} alt="Ulwembu Logo" className="h-24" />
          </div>
          <div className="bg-white p-10 rounded-md shadow-2xl mb-10">
            <div className="mb-6 text-center">
              <h2 className="text-xl font-semibold mb-4">Reset Password</h2>
              <p className="text-gray-600 text-sm">Please follow the steps to reset your password.</p>
            </div>

            {step === 1 && (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`block w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm text-sm`}
                    placeholder="Enter your email"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <button type="submit" className="w-full py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-md shadow-sm text-sm font-semibold">
                  Send OTP
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Enter OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className={`block w-full px-3 py-2 border ${errors.otp ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm text-sm`}
                    placeholder="Enter the OTP sent to your email"
                  />
                  {errors.otp && <p className="text-red-500 text-xs mt-1">{errors.otp}</p>}
                </div>
                <button type="submit" className="w-full py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-md shadow-sm text-sm font-semibold">
                  Verify OTP
                </button>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handlePasswordChange}
                    className={`block w-full px-3 py-2 border ${errors.newPassword ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm text-sm`}
                    placeholder="Enter new password"
                  />
                  {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handlePasswordChange}
                    className={`block w-full px-3 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm text-sm`}
                    placeholder="Confirm new password"
                  />
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
                <button type="submit" className="w-full py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-md shadow-sm text-sm font-semibold">
                  Reset Password
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
