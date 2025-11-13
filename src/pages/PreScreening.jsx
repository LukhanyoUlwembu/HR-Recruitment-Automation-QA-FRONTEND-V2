import React, { useState, useEffect } from 'react';
import { CircleDot, CheckCircle, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { BASE_URL } from './useAuth';
export default function PreScreening() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [jobsQ, setJobDetails] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [formData, setFormData] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    console.log('Submitting answers:', formData);
    setShowPopup(true);
  };

const handleConfirmSubmit = async () => {
  try {
    const applicantId = sessionStorage.getItem("userId");
    const response = await fetch( `${BASE_URL}/applications/apply/${applicantId}/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      }
    });

    if (!response.ok) {
      throw new Error("Failed to submit job application");
    }

    navigate("/applications");
  } catch (error) {
    console.error("Submission error:", error.message);
    alert("Failed to apply. Please try again.");
  } finally {
    setShowPopup(false);
  }
};


  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handlePrevious = () => {
    navigate(`/details/${id}`);
  };

  useEffect(() => {
      const fetchJobs = async () => {
        try {
          const response = await fetch(
        `${BASE_URL}/postings/${id}`
      );
          if (!response.ok) throw new Error("Reload Page");
          const data = await response.json();
          setJobDetails(data);
        } catch (err) {
          console.log(err.message);
        }
      };
  
      fetchJobs();
    },[id]);

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="mb-8">
        
        <div className="flex justify-between mt-2 text-sm">
          <span>Basic Info</span>
          <span className="text-blue-500 font-medium">Pre-Screening</span>
          <span className="text-gray-500">Submit</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-blue-100 p-2 rounded-full">
              <CircleDot className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Pre-Screening Questions</h2>
          </div>
          <p className="text-gray-600">Please answer the following questions to proceed with your application.</p>
        </div>

        <div className="space-y-6">
         {Array.isArray(jobsQ.preScreening) &&
  jobsQ.preScreening.map((item) => (
    <div key={item.preScreeningId} className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {item.question}
      </label>
      <textarea
        name={`question_${item.preScreeningId}`}
        value={formData[`question_${item.preScreeningId}`] || ''}
        onChange={handleInputChange}
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        placeholder="Your answer..."
      />
    </div>
))}
          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={handlePrevious}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Previous
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              Link = "/applications"
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Confirm Submission</h3>
              </div>
              <button
                onClick={handleClosePopup}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Are you ready to submit your answers for the job application?
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleClosePopup}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}