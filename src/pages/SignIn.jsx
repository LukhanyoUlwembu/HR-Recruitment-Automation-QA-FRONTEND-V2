import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ulwembuLogo from '../assets/ulwembu-logo.svg';
import normalWave from '../assets/normal_u60.svg';
import normalU0 from '../assets/normal_u0.svg';
import GoogleIcon from '../assets/Google-Icon.png';
import linkedinLogo from '../assets/linkedin-logo.png';
import Footer from '../components/navigation/Footer.jsx';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from './useAuth';
export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });

    const [errors, setErrors] = useState({ email: '', password: '' });
    const [loginError, setLoginError] = useState('');

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
        setLoginError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let newErrors = {};
        let isValid = true;

        if (!formData.email) {
            newErrors.email = 'Email is required';
            isValid = false;
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
            isValid = false;
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
            isValid = false;
        }

        setErrors(newErrors);

        if (isValid) {
            try {
                const response = await fetch(`${BASE_URL}/applicants/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: formData.email,
                        password: formData.password
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    sessionStorage.setItem("role", "applicant");
                    sessionStorage.setItem("userId", data.applicantId);
                    navigate('/jobs');
                } else {
                    setLoginError('Login failed. Please check your credentials.');
                }
            } catch (error) {
                console.error('Error during login:', error);
                setLoginError('Login failed. Please check your credentials.');
            }
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <div className="flex-grow flex justify-center bg-white relative">
                {/* Blue waves */}
                <div className="absolute mr-[90%] top-0 h-full w-1/2 overflow-visible z-0 pointer-events-none">
                    <img src={normalU0} alt="Blue Wave Outline" className="w-full h-full object-cover absolute top-0 right-5" style={{ transform: 'rotate(270deg)', opacity: 0.7, zIndex: 1 }} />
                    <img src={normalWave} alt="Blue Wave" className="w-full h-full object-cover absolute top-0 -left-20" style={{ transform: 'rotate(270deg)', opacity: 1, zIndex: 2 }} />
                </div>

                <div className="relative w-full max-w-md my-auto">
                    <div className="flex justify-center mb-0 mt-8">
                        <img src={ulwembuLogo} alt="Ulwembu Logo" className="h-24" />
                    </div>
                    <div className="bg-white p-10 rounded-md shadow-2xl mb-10">
                        <div className="mb-4 text-center">
                            <h2 className="text-xl font-semibold">Sign in</h2>
                        </div>
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={`block w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm`}
                                    placeholder="Enter your email"
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>
<div className="space-y-2">
  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
  <div className="relative">
    <input
      type={showPassword ? 'text' : 'password'}
      id="password"
      name="password"
      value={formData.password}
      onChange={handleInputChange}
      className={`block w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm pr-10`}
      placeholder="Enter your password"
    />
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute inset-y-0 right-2 flex items-center text-gray-500 cursor-pointer"
      aria-label={showPassword ? 'Hide password' : 'Show password'}
    >
      {showPassword ? (
        // Eye open icon
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ) : (
        // Eye off icon
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.258-3.592m3.258-2.208A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.958 9.958 0 01-1.272 2.592M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
        </svg>
      )}
    </button>
  </div>
  {errors.password && (
    <p className="text-red-500 text-xs mt-1">{errors.password}</p>
  )}
</div>

                            <div className="flex items-center justify-between">
                        <Link to="/reset-password" className="text-sm text-blue-500 hover:underline">Forgot your password?</Link>
                    </div>

                            {loginError && (
                                <p className="text-red-500 text-sm text-center">{loginError}</p>
                            )}

                            <button type="submit" className="w-full py-2 mt-2 text-white bg-blue-500 hover:bg-blue-600 rounded-md shadow-sm text-sm font-semibold flex items-center justify-center relative">
                                <span className="flex-1 flex justify-center items-center">Sign in</span>
                            </button>

                            <div className="flex items-center justify-center my-4">
                                <hr className="flex-grow border-t border-gray-300" />
                                <span className="mx-2 text-sm text-gray-400">or sign in with</span>
                                <hr className="flex-grow border-t border-gray-300" />
                            </div>
                            <div className="flex justify-center space-x-6">
                                <a href="#" className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow hover:opacity-80 transition-opacity border border-gray-200">
                                    <img src={linkedinLogo} alt="LinkedIn" className="w-6 h-6 object-contain" />
                                </a>
                                <a href="#" className="hover:opacity-80 transition-opacity flex items-center justify-center w-8 h-8">
                                    <img src={GoogleIcon} alt="Google" className="w-6 h-6 object-contain" />
                                </a>
                            </div>
                            <p className="text-center text-sm mt-4">
                                Don't have an account? <Link to="/signup" className="text-blue-500 hover:underline">Sign up</Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
