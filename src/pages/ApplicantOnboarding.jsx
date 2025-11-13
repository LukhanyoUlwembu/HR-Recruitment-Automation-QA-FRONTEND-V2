import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BASE_URL } from './useAuth';

const OnboardingPortal = () => {
  const [step, setStep] = useState(1);
  const [uploads, setUploads] = useState({});
  const [uploadStatus, setUploadStatus] = useState({});
  const [missingFields, setMissingFields] = useState([]);
  const { applicationId } = useParams();
  const navigate = useNavigate();

  const steps = [
    {
      title: 'Step 1: Onboarding Documents',
      description: 'Download, sign, and upload the onboarding forms.',
      downloads: [
        { name: 'Take On Form', url: '/downloads/take_on_form.pdf' },
        { name: 'EA1', url: '/downloads/ea1.pdf' },
        { name: 'Consent', url: '/downloads/consent.pdf' },
      ],
      uploads: [
        { label: 'Signed Take On Form', key: 'TakeOnForm' },
        { label: 'Signed EA1', key: 'EA1Form' },
        { label: 'Signed Consent', key: 'Consent' },
      ],
    },
    {
      title: 'Step 2: Upload Supporting Documents',
      description: 'Upload all required supporting documents.',
      downloads: [],
      uploads: [
        { label: 'ID Copy', key: 'IdCopy' },
        { label: 'Qualifications', key: 'Qualifications' },
        { label: 'CV', key: 'CV' },
        { label: 'Proof Of Tax', key: 'ProofOfTax' },
        { label: 'Proof Of Account', key: 'ProofOfAccount' },
      ],
    },
  ];

  const currentStep = steps[step - 1];

  const handleUpload = (e, key) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploads(prev => ({ ...prev, [key]: file }));
    setUploadStatus(prev => ({ ...prev, [key]: "Uploading..." }));
    setMissingFields(prev => prev.filter(m => m !== key)); // remove from missing if now present

    setTimeout(() => {
      setUploadStatus(prev => ({ ...prev, [key]: "✅ Ready" }));
    }, 500);
  };

  const validateStep = () => {
    const requiredKeys = currentStep.uploads.map(field => field.key);
    const missing = requiredKeys.filter(key => !uploads[key]);
    setMissingFields(missing);
    return missing.length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
      setMissingFields([]);
    }
  };

  const handleFinalSubmit = () => {
    if (!validateStep()) return;

    if (!applicationId) {
      alert("Missing application ID.");
      return;
    }

    const formData = new FormData();
    const onboarding = { active: true };

    formData.append("onboarding", new Blob([JSON.stringify(onboarding)], {
      type: "application/json"
    }));
    formData.append("id", uploads["IdCopy"]);
    formData.append("qualification", uploads["Qualifications"]);
    formData.append("cv", uploads["CV"]);
    formData.append("proofOfAccount", uploads["ProofOfAccount"]);
    formData.append("proofOfTax", uploads["ProofOfTax"]);
    formData.append("takeOnForm", uploads["TakeOnForm"]);
    formData.append("ea1", uploads["EA1Form"]);
    formData.append("consent", uploads["Consent"]);
    formData.append("applicationId", applicationId);

    fetch(`${BASE_URL}/onboarding`, {
      method: "POST",
      body: formData,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Submission failed");
        return res.json();
      })
      .then(() => {
        alert("All documents submitted and onboarding created!");
        setUploads({});
        setUploadStatus({});
        navigate('/applications');
      })
      .catch(() => {
        alert("Something went wrong. Please try again.");
      });
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">{currentStep.title}</h1>
      <p className="mb-4 text-gray-600">{currentStep.description}</p>

      {currentStep.downloads.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Downloads:</h2>
          <ul className="list-disc list-inside space-y-1">
            {currentStep.downloads.map(file => (
              <li key={file.name}>
                <a href={file.url} className="text-blue-600 underline" download>
                  {file.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Uploads:</h2>
        {currentStep.uploads.map(field => (
          <div key={field.key} className="mb-4">
            <label className="block mb-1 font-medium text-gray-700">
              {field.label}
            </label>
            <input
              type="file"
              onChange={(e) => handleUpload(e, field.key)}
              className={`w-full border p-2 rounded-md ${
                missingFields.includes(field.key) ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {uploadStatus[field.key] && (
              <span className="text-sm text-gray-600">{uploadStatus[field.key]}</span>
            )}
            {missingFields.includes(field.key) && (
              <p className="text-red-500 text-sm">Please upload this file.</p>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setStep(prev => prev - 1)}
          disabled={step === 1}
          className={`px-4 py-2 rounded-md text-white ${
            step === 1 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          Back
        </button>
        {step < steps.length ? (
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleFinalSubmit}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            Submit
          </button>
        )}
      </div>
    </div>
  );
};

export default OnboardingPortal;
