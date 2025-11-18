import React, { useState } from 'react';
import ulwembuLogo from '../assets/ulwembu-logo.svg';
import normalWave from '../assets/normal_u60.svg';
import normalU0 from '../assets/normal_u0.svg';
import normalU56 from '../assets/normal_u56.svg'; 
import normalU59 from '../assets/normal_u59.svg'; 
import GoogleIcon from '../assets/Google-Icon.png';
import linkedinLogo from '../assets/linkedin-logo.png';
import {Link} from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/navigation/Footer.jsx';
import { BASE_URL } from './useAuth';

export default function SignUp() {
  const navigate = useNavigate();
  const [conflictFormCompleted, setConflictFormCompleted] = useState(false);
  const [currentStep, setCurrentStep] = useState('signup');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    surname: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
    otp: '',
    declaireaffiliation:false,
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    surname: '',
    password: '',
    confirmPassword: '',
    termsAccepted: '',
    otp: '',
    declaireaffiliation:'',
    
  });

  const [showConflictQuestions, setShowConflictQuestions] = useState(false);
  const [conflictAnswers, setConflictAnswers] = useState({
    workCurrent: null,
    workBefore: null,
    relatives: null,
    relativesInfo: "",
    friends: null,
    friendsInfo: "",
    businessRelation: null,
    businessInfo: "",
  });

  const handleConflictChange = (e) => {
    const { name, value } = e.target;
    let normalizedValue;
    if (value === "Yes") {
      normalizedValue = true;
    } else if (value === "No") {
      normalizedValue = false;
    } else {
      normalizedValue = value; // for textareas (strings)
    }
    setConflictAnswers((prev) => ({ ...prev, [name]: normalizedValue }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

const handleSignUpSubmit = async (e) => {
  e.preventDefault();

  let newErrors = {};
  let isValid = true;

  // Basic form validations
  if (!formData.name.trim()) {
    newErrors.name = 'Name is required';
    isValid = false;
  }

  if (!formData.surname.trim()) {
    newErrors.surname = 'Surname is required';
    isValid = false;
  }

  if (!formData.email) {
    newErrors.email = 'Email is required';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    newErrors.email = 'Please enter a valid email address';
    isValid = false;
  }

  if (!formData.password) {
    newErrors.password = 'Password is required';
    isValid = false;
  } else if (!(formData.password.length >= 8 && /\d/.test(formData.password))) {
    newErrors.password = 'Password must be at least 8 characters and include a number';
    isValid = false;
  }

  if (!formData.confirmPassword) {
    newErrors.confirmPassword = 'Please confirm your password';
    isValid = false;
  } else if (formData.password !== formData.confirmPassword) {
    newErrors.confirmPassword = 'Passwords do not match';
    isValid = false;
  }

  if (!formData.termsAccepted) {
    newErrors.termsAccepted = 'Accept the Terms of Service';
    isValid = false;
  }

  if (!formData.declaireaffiliation) {
    newErrors.declaireaffiliation = 'You must Declare Affiliation';
    isValid = false;
  }

  setErrors(newErrors);

  if (!isValid) return;

  // Continue if valid
  await handleResendOTP();
  setCurrentStep('verify');
};



 


    const handleSubmit = async (e) => {
        e.preventDefault();
        let newErrors = {};
        let isValid = true;

        // Validate OTP
        if (!formData.otp) {
            newErrors.otp = 'OTP is required';
            isValid = false;
        } else if (formData.otp.length !== 6) {
            newErrors.otp = 'OTP must be 6 digits';
            isValid = false;
        }

        setErrors(newErrors);

        if (isValid) {
            try {
                // OTP verification endpoint
                const response = await fetch(`${BASE_URL}/auth/otp/verify`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: formData.email,
                        otp: formData.otp
                    })
                });
                     console.log(response);
                if (response.ok) {
                  try {
                const response = await fetch(`${BASE_URL}/applicants`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: formData.name,
                        surname: formData.surname,
                        email: formData.email,
                        password: formData.password,
                        conflictOfInterest: conflictAnswers
                    })
                });

                if (response.ok) {
                 
                    const data = await response.json();
                    console.log(data);
                    sessionStorage.setItem("role", "applicant");
                    sessionStorage.setItem("userId", data.applicantId);
                    navigate(`/profile`); 
                } else {
                    throw new Error('Something went wrong');
                }
            } catch (error) {
                console.error(error.message);
                setErrors(prev => ({
                    ...prev,
                    general: 'Registration failed. Please try again.'
                }));
            }
                } else {
                    throw new Error('Invalid OTP');
                }
            } catch (error) {
                console.error(error.message);
                setErrors(prev => ({
                    ...prev,
                    otp: 'Invalid OTP. Please try again.'
                }));
            }
        }
    };

    const handleResendOTP = async () => {
        try {
            // eslint-disable-next-line no-unused-vars
            const response = await fetch(`${BASE_URL}/auth/otp/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: formData.email
                })
            });
        } catch (error) {
            console.error(error.message);
           
        }
    };

    const handleBackToSignup = () => {
        setCurrentStep('signup');
        setFormData(prev => ({ ...prev, otp: '' }));
        setErrors(prev => ({ ...prev, otp: '' }));
    };

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);


    return (
        <div className="flex flex-col min-h-screen">
            <div className="flex-grow flex justify-center bg-white relative">
                {/* Left blue wave with outline */}
                <div className="absolute mr-[90%] w-[90%] h-full overflow-visible">
                    {/* Outline SVG */}
                    <img
                        src={normalU0}
                        alt="Blue Wave Outline"
                        className="w-full h-full object-cover absolute top-0 right-5"
                        style={{
                            transform: 'rotate(270deg)',
                            opacity: 0.7,
                            zIndex: 1
                        }}
                    />
                    {/* Filled SVG */}
                    <img
                        src={normalWave}
                        alt="Blue Wave"
                        className="w-full h-full object-cover absolute top-0 -left-20"
                        style={{
                            transform: 'rotate(270deg)',
                            opacity: 1,
                            zIndex: 2,
                        }}
                    />
                </div>
                
                <div className="relative z-10 w-full max-w-md my-auto">
                    <div className="flex justify-center mb-15">
                        <img src={ulwembuLogo} alt="Ulwembu Logo" className="h-24" />
                    </div>
                    
                    {/* Conditional rendering based on current step */}
                    {currentStep === 'signup' ? (
                        // Sign Up Form
                        <div className="bg-white p-5 rounded-md shadow-2xl mb-6">
                            <div className="mb-4 text-center">
                                <h2 className="text-xl font-semibold">Sign up</h2>
                            </div>
                            {errors.general && (
                                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                    {errors.general}
                                </div>
                            )}
                            <form className="space-y-4" onSubmit={handleSignUpSubmit}>
                                <div className="space-y-2">
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className={`block w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm`}
                                        placeholder="Enter your name"
                                    />
                                    {errors.name && (
                                        <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="surname" className="block text-sm font-medium text-gray-700">Surname</label>
                                    <input
                                        type="text"
                                        id="surname"
                                        name="surname"
                                        value={formData.surname}
                                        onChange={handleInputChange}
                                        className={`block w-full px-3 py-2 border ${errors.surname ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm`}
                                        placeholder="Enter your surname"
                                    />
                                    {errors.surname && (
                                        <p className="text-red-500 text-xs mt-1">{errors.surname}</p>
                                    )}
                                </div>
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
                                    {errors.email && (
                                        <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                                    )}
                                </div>
<div className="space-y-2">
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
      placeholder="Create a password"
    />
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute inset-y-0 right-2 flex items-center text-gray-500"
      aria-label={showPassword ? 'Hide password' : 'Show password'}
    >
      {showPassword ? (
        // Eye Open Icon
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ) : (
        // Eye Off Icon
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
</div>
<div className="space-y-2">
                                    <div className="space-y-2">
  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
  <div className="relative">
    <input
      type={showConfirmPassword ? 'text' : 'password'}
      id="confirmPassword"
      name="confirmPassword"
      value={formData.confirmPassword}
      onChange={handleInputChange}
      className={`block w-full px-3 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm pr-10`}
      placeholder="Confirm your password"
    />
    <button
      type="button"
      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
      className="absolute inset-y-0 right-2 flex items-center text-gray-500"
      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
    >
      {showConfirmPassword ? (
        // Eye Open Icon
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ) : (
        // Eye Off Icon
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.258-3.592m3.258-2.208A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.958 9.958 0 01-1.272 2.592M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
        </svg>
      )}
    </button>
  </div>
  {errors.confirmPassword && (
    <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
  )}
</div>
</div>
<div className="flex flex-col md:flex-row space-x-26 mt-4">
  <div className="flex-1 flex items-center rounded px-3 py-2">
    <label className="inline-flex items-center text-sm w-full">
      <input
        type="checkbox"
        name="termsAccepted"
        checked={formData.termsAccepted}
        onChange={handleInputChange}
        className="mr-2"
      />
     <a href="/public/Terms of Service - UBS.pdf" target='_blank'  className="text-blue-500 hover">Terms and Conditions</a>
     
    </label>
  </div>
  <div className="flex-1 flex items-center rounded px-3 py-2">
    <label className="inline-flex items-center text-sm w-full">
     <div className="flex items-center space-x-2">
  <input
    type="checkbox"
    checked={conflictFormCompleted}
    readOnly
    className="form-checkbox text-blue-600"
  />
  <button
    type="button"
    onClick={() => {
      setShowConflictQuestions(true);
    }}
    className="text-sm text-blue-600 underline hover:text-blue-800"
  >
    Declare Affiliation 
  </button>
  {conflictFormCompleted && (
    <svg
      className="w-4 h-4 text-blue-600"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )}
</div>


    </label>
  </div>
</div>
<div className="flex grid-cols-2 space-x-28">
{errors.termsAccepted && (
  <p className="text-red-500 text-xs mt-1">{errors.termsAccepted}</p>
)}
{errors.declaireaffiliation && (
  <p className="text-red-500 text-xs mt-1">{errors.declaireaffiliation}</p>
)}
</div>
{showConflictQuestions && (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white w-full max-w-lg p-6 rounded-lg shadow-xl relative overflow-y-auto max-h-[90vh]">
      <h2 className="text-lg font-semibold mb-4">Conflict of Interest Declaration</h2>

      <div className="space-y-4">
{/* Current Work */}
<div>
  <label className="block text-sm font-medium">Do you currently work with Ulwembu?</label>
  <select
    name="workCurrent"
    value={conflictAnswers.workCurrent === null ? "" : conflictAnswers.workCurrent ? "Yes" : "No"}
    onChange={handleConflictChange}
    className={`w-full border rounded p-2 text-sm ${conflictAnswers.workCurrent === null ? 'border-red-500' : 'border-gray-300'}`}
  >
    <option value="">Select</option>
    <option value="Yes">Yes</option>
    <option value="No">No</option>
  </select>
  {conflictAnswers.workCurrent === null && <p className="text-red-500 text-xs mt-1">This question is required</p>}
</div>

{/* Past Work */}
<div>
  <label className="block text-sm font-medium">Have you previously worked with Ulwembu?</label>
  <select
    name="workBefore"
    value={conflictAnswers.workBefore === null ? "" : conflictAnswers.workBefore ? "Yes" : "No"}
    onChange={handleConflictChange}
    className={`w-full border rounded p-2 text-sm ${conflictAnswers.workBefore === null ? 'border-red-500' : 'border-gray-300'}`}
  >
    <option value="">Select</option>
    <option value="Yes">Yes</option>
    <option value="No">No</option>
  </select>
  {conflictAnswers.workBefore === null && <p className="text-red-500 text-xs mt-1">This question is required</p>}
</div>

{/* Relatives */}
<div>
  <label className="block text-sm font-medium">Do you have relatives at Ulwembu?</label>
  <select
    name="relatives"
    value={conflictAnswers.relatives === null ? "" : conflictAnswers.relatives ? "Yes" : "No"}
    onChange={handleConflictChange}
    className={`w-full border rounded p-2 text-sm ${conflictAnswers.relatives === null ? 'border-red-500' : 'border-gray-300'}`}
  >
    <option value="">Select</option>
    <option value="Yes">Yes</option>
    <option value="No">No</option>
  </select>
  {conflictAnswers.relatives === null && <p className="text-red-500 text-xs mt-1">This question is required</p>}
  {conflictAnswers.relatives && (
    <textarea
      name="relativesInfo"
      placeholder="Name and relationship"
      value={conflictAnswers.relativesInfo}
      onChange={handleConflictChange}
      className={`w-full mt-2 border rounded p-2 text-sm ${!conflictAnswers.relativesInfo.trim() ? 'border-red-500' : 'border-gray-300'}`}
    />
  )}
</div>

{/* Friends */}
<div>
  <label className="block text-sm font-medium">Close friends or partners at Ulwembu?</label>
  <select
    name="friends"
    value={conflictAnswers.friends === null ? "" : conflictAnswers.friends ? "Yes" : "No"}
    onChange={handleConflictChange}
    className={`w-full border rounded p-2 text-sm ${conflictAnswers.friends === null ? 'border-red-500' : 'border-gray-300'}`}
  >
    <option value="">Select</option>
    <option value="Yes">Yes</option>
    <option value="No">No</option>
  </select>
  {conflictAnswers.friends === null && <p className="text-red-500 text-xs mt-1">This question is required</p>}
  {conflictAnswers.friends && (
    <textarea
      name="friendsInfo"
      placeholder="Provide their names"
      value={conflictAnswers.friendsInfo}
      onChange={handleConflictChange}
      className={`w-full mt-2 border rounded p-2 text-sm ${!conflictAnswers.friendsInfo.trim() ? 'border-red-500' : 'border-gray-300'}`}
    />
  )}
</div>

{/* Business */}
<div>
  <label className="block text-sm font-medium">Previous business relationship with Ulwembu?</label>
  <select
    name="businessRelation"
    value={conflictAnswers.businessRelation === null ? "" : conflictAnswers.businessRelation ? "Yes" : "No"}
    onChange={handleConflictChange}
    className={`w-full border rounded p-2 text-sm ${conflictAnswers.businessRelation === null ? 'border-red-500' : 'border-gray-300'}`}
  >
    <option value="">Select</option>
    <option value="Yes">Yes</option>
    <option value="No">No</option>
  </select>
  {conflictAnswers.businessRelation === null && <p className="text-red-500 text-xs mt-1">This question is required</p>}
  {conflictAnswers.businessRelation && (
    <textarea
      name="businessInfo"
      placeholder="Explain the relationship"
      value={conflictAnswers.businessInfo}
      onChange={handleConflictChange}
      className={`w-full mt-2 border rounded p-2 text-sm ${!conflictAnswers.businessInfo.trim() ? 'border-red-500' : 'border-gray-300'}`}
    />
  )}
</div>

      </div>

      <div className="flex justify-end mt-6 space-x-3">
        <button
          type="button"
          onClick={() => setShowConflictQuestions(false)}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
        >
          Cancel
        </button>
<button
  type="button"
  onClick={() => {
    const requiredFieldsValid =
      conflictAnswers.workCurrent !== null &&
      conflictAnswers.workBefore !== null &&
      conflictAnswers.relatives !== null &&
      conflictAnswers.friends !== null &&
      conflictAnswers.businessRelation !== null &&
      (!conflictAnswers.relatives || conflictAnswers.relativesInfo.trim()) &&
      (!conflictAnswers.friends || conflictAnswers.friendsInfo.trim()) &&
      (!conflictAnswers.businessRelation || conflictAnswers.businessInfo.trim());

    if (!requiredFieldsValid) {
      alert('Please answer all required conflict questions before continuing.');
      return;
    }

    setShowConflictQuestions(false);
    setConflictFormCompleted(true);
    setFormData(prev => ({ ...prev, declaireaffiliation: true }));
  }}
  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
>
  Save & Close
</button>

      </div>
    </div>
  </div>
)}


<button
  type="submit"
  disabled={showConflictQuestions && !conflictFormCompleted}
  className="w-full py-2 mt-4 text-white bg-blue-500 hover:bg-blue-600 rounded-md shadow-sm text-sm font-semibold flex items-center justify-center relative disabled:opacity-50"
>
  Sign up
</button>

                                <div className="flex items-center justify-center my-4">
                                    <hr className="flex-grow border-t border-gray-300" />
                                    <span className="mx-2 text-sm text-gray-400">or sign in with</span>
                                    <hr className="flex-grow border-t border-gray-300" />
                                </div>
                                <div className="flex justify-center space-x-6">
                                    {/* LinkedIn */}
                                    <a href="#" className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow hover:opacity-80 transition-opacity border border-gray-200">
                                        <img src={linkedinLogo} alt="LinkedIn" className="w-6 h-6 object-contain" />
                                    </a>
                                    {/* Google */}
                                    <a href="#" className="hover:opacity-80 transition-opacity flex items-center justify-center w-8 h-8">
                                        <img src={GoogleIcon} alt="Google" className="w-6 h-6 object-contain" />
                                    </a>
                                </div>
                                <p className="text-center text-sm mt-4">
                                    Already have an account? <Link to='/signin' className="text-blue-500 hover:underline">Sign in</Link>
                                </p>
                            </form>
                        </div>
                    ) : (
                        // Email Verification Form
                        <div className="bg-white p-8 rounded-md shadow-2xl mb-6">
                            {/* Icons Container */}
                            <div className="relative flex justify-center mb-6">
                                <div className="relative">
                                    {/* Mail Icon */}
                                    <img
                                        src={normalU56}
                                        alt="Mail Icon"
                                        style={{
                                            width: '118px',
                                            height: '76px',
                                            padding: '2px',
                                            opacity: 1
                                        }}
                                    />
                                    {/* Lock Icon */}
                                    <img
                                        src={normalU59}
                                        alt="Lock Icon"
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            position: 'absolute',
                                            right: '-13px',
                                            bottom: '-15px',
                                            padding: '2px',
                                            opacity: 1,
                                            zIndex: 2,
                                            backgroundColor: 'white',
                                            borderRadius: '50%',
                                            boxShadow: '0 0 0 4px white'
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="mb-6 text-center">
                                <h2 className="text-xl font-semibold mb-4">Verify Email</h2>
                                <p className="text-gray-600 text-sm">
                                    We've sent a one-time password (OTP) to <strong>{formData.email}</strong>.
                                    Please enter it below to verify your email address.
                                </p>
                            </div>
                            <form className="space-y-4" onSubmit={handleSubmit}>
                                <div className="space-y-2">
                                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700">Enter OTP</label>
                                    <input
                                        type="text"
                                        id="otp"
                                        name="otp"
                                        maxLength={6}
                                        value={formData.otp}
                                        onChange={handleInputChange}
                                        className={`block w-full px-3 py-2 border ${errors.otp ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm tracking-widest text-center`}
                                        placeholder="Enter 6-digit OTP"
                                    />
                                    {errors.otp && (
                                        <p className="text-red-500 text-xs mt-1">{errors.otp}</p>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-2 mt-4 text-white bg-blue-500 hover:bg-blue-600 rounded-md shadow-sm text-sm font-semibold flex items-center justify-center relative"
                                >
                                    <span className="flex-1 flex justify-center items-center">
                                        Verify
                                    </span>
                                </button>
                                <div className="text-center mt-4 space-y-2">
                                    <button
                                        type="button"
                                        onClick={handleResendOTP}
                                        className="text-blue-500 hover:text-blue-600 text-sm hover:underline"
                                    >
                                        Resend OTP
                                    </button>
                                    <br />
                                    <button
                                        type="button"
                                        onClick={handleBackToSignup}
                                        className="text-gray-500 hover:text-gray-600 text-sm hover:underline"
                                    >
                                        Back to Sign Up
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
  }
