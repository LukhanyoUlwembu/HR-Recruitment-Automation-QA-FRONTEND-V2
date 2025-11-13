import React, { useState, useEffect } from 'react'; 
import { useParams,useNavigate } from 'react-router-dom';
import { BASE_URL } from './useAuth';
const steps = [
  'Documents',
  'Background Check',
  'Contract Signing',
  'Induction',
  'Pre-boarding',
];

const StepDocuments = ({ uploaded, setUploaded }) => {
  const [documentLinks, setDocumentLinks] = useState({});
  const { id } = useParams();
 

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await fetch(`${BASE_URL}/onboarding/${id}`);
        const data = await res.json();
        
        // Map file types to expected document names
        const typeMapping = {
          'Id': 'IdCopy',
          'Certificate': 'Qualifications',
          'CV': 'CV',
          'Proof of Account': 'ProofOfAccount',
          'Proof of Tax': 'ProofOfTax',
          'Take on Form': 'TakeOnForm',
          'EA1': 'EA1Form',
          'Consent': 'Consent'
        };

        const newUploads = {};
        const links = {};

        data.onboardingFiles.forEach(file => {
          const docType = typeMapping[file.fileType.name] || file.fileType.name;
          newUploads[docType] = true;
          links[docType] = `${BASE_URL}/uploads/${file.fileName}`;
        });

        setUploaded(prev => ({ ...prev, ...newUploads }));
        setDocumentLinks(links);
      } catch (error) {
        console.error('Error fetching documents:', error);
      }
    };

    fetchDocs();
  }, [id, setUploaded]);

  const handleCheckboxChange = (key) => {
    setUploaded(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const renderCheckboxWithLink = (group, key, isChecked) => {
    const label = key.replace(/([A-Z])/g, " $1");
    const link = documentLinks[key];

    return (
      <label key={key} className="flex items-center space-x-2 text-gray-700">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={() => handleCheckboxChange(key)}
          className="form-checkbox text-blue-600 focus:ring-blue-500"
        />
        <span>
          {label}
          {link && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-blue-600 underline text-sm"
            >
              (View)
            </a>
          )}
        </span>
      </label>
    );
  };

  return (
    <div className="space-y-8">
      

      <div className="bg-white p-6 rounded-xl shadow border border-blue-100">
        <h3 className="text-xl font-semibold text-blue-700 mb-4 border-b pb-2">Uploaded Documents</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.keys(uploaded).map((key) =>
            renderCheckboxWithLink("uploaded", key, uploaded[key])
          )}
        </div>
      </div>
    </div>
  );
};

const StepBackgroundCheck = ({ formData, setFormData }) => {
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="space-y-6 bg-white p-6 rounded-xl shadow border border-blue-100">
      <h3 className="text-xl font-semibold text-blue-700 mb-4 border-b pb-2">Background Check</h3>
      <input
        name="fullName"
        placeholder="Full Name"
        value={formData.fullName}
        onChange={handleChange}
        className="w-full border border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded px-3 py-2 shadow-sm"
      />
      <div className="flex space-x-4">
  {[
    { value: 'clean', label: 'No Criminal Record' },
    { value: 'dirty', label: 'Criminal Record Present' }
  ].map((option) => (
    <label key={option.value} className="flex items-center space-x-2">
      <input 
        type="radio" 
        name="recordStatus" 
        value={option.value} 
        checked={formData.recordStatus === option.value} 
        onChange={handleChange} 
      />
      <span>{option.label}</span>
    </label>
  ))}
</div>
      <input
        name="signature"
        placeholder="Signature"
        value={formData.signature}
        onChange={handleChange}
        className="w-full border border-gray-300 focus:border-blue-500 rounded px-3 py-2 shadow-sm"
      />
      <input
        type="date"
        name="date"
        value={formData.date}
        onChange={handleChange}
        className="w-full border border-gray-300 focus:border-blue-500 rounded px-3 py-2 shadow-sm"
      />
    </div>
  );
};

const StepContractSigning = ({ formData, setFormData }) => {
  const toggleCheck = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: !prev[field],
      ...(field === 'signed' && { notSigned: false }),
      ...(field === 'notSigned' && { signed: false }),
    }));
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="space-y-6 bg-white p-6 rounded-xl shadow border border-blue-100">
      <h3 className="text-xl font-semibold text-blue-700 mb-4 border-b pb-2">Contract Signing</h3>
      <div className="flex space-x-4">
        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={formData.signed} onChange={() => toggleCheck('signed')} />
          <span>Signed</span>
        </label>
        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={formData.notSigned} onChange={() => toggleCheck('notSigned')} />
          <span>Not Signed</span>
        </label>
      </div>
      <input
        name="signature"
        placeholder="Signature"
        value={formData.signature}
        onChange={handleChange}
        className="w-full border border-gray-300 focus:border-blue-500 rounded px-3 py-2 shadow-sm"
      />
      <input
        type="date"
        name="dateSigned"
        value={formData.dateSigned}
        onChange={handleChange}
        className="w-full border border-gray-300 focus:border-blue-500 rounded px-3 py-2 shadow-sm"
      />
    </div>
  );
};

const StepInduction = ({ formData, setFormData }) => {
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const radioGroup = (name, options) => (
    <div className="flex space-x-4">
      {options.map((val) => (
        <label key={val} className="flex items-center space-x-2">
          <input type="radio" name={name} value={val} checked={formData[name] === val} onChange={handleChange} />
          <span>{val}</span>
        </label>
      ))}
    </div>
  );

  return (
    <div className="space-y-6 bg-white p-6 rounded-xl shadow border border-blue-100">
      <h3 className="text-xl font-semibold text-blue-700 mb-4 border-b pb-2">Induction</h3>
      <div>
        <h4 className="font-medium mb-1">Induction Type</h4>
        {radioGroup('inductionType', ['Online', 'Physical'])}
      </div>
      
    </div>
  );
};

const StepPreboarding = ({ formData, setFormData }) => {
  const checklist = ['WorkAccount', 'SystemAccess', 'AccessCard'];

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <div className="space-y-6 bg-white p-6 rounded-xl shadow border border-blue-100">
      <h3 className="text-xl font-semibold text-blue-700 mb-4 border-b pb-2">Pre-boarding Checklist</h3>
      {checklist.map((key) => (
        <div key={key}>
          <h4 className="font-medium">{key.replace(/([A-Z])/g, ' $1')}</h4>
          <div className="flex space-x-4 mt-1">
            {['Yes', 'No'].map((val) => (
              <label key={val} className="flex items-center space-x-2">
                <input type="radio" name={key} value={val} checked={formData[key] === val} onChange={handleChange} />
                <span>{val}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const { id } = useParams();
  const name = sessionStorage.getItem("empName");
  const signature = sessionStorage.getItem("empEmail");
  const today = new Date().toISOString().split('T')[0];
   const navigate = useNavigate();


  const [documentUploaded, setDocumentUploaded] = useState({
    IdCopy: false,
    Qualifications: false,
    CV: false,
    ProofOfTax: false,
    ProofOfAccount: false,
  });

  const [backgroundCheck, setBackgroundCheck] = useState({
    fullName: name,
    recordStatus: '',
    signature: signature,
    date: today,
  });

  const [contractForm, setContractForm] = useState({
    signed: false,
    notSigned: false,
    signature: signature,
    dateSigned: today,
  });

  const [induction, setInduction] = useState({
    inductionType: '',
  });

  const [preboarding, setPreboarding] = useState({});

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleDone = async () => {
    setIsLoading(true);
    setApiError(null);
    
    try {
      // Prepare the data to send to the API
      const onboardingData = {
        id: parseInt(id),
        isComplete: true,
        contactSigned: contractForm.signed,
        dateSigned: contractForm.dateSigned,
        inductionType: induction.inductionType,
        workAccount: preboarding.WorkAccount === 'Yes',
        systemAccess: preboarding.SystemAccess === 'Yes',
        securityAccess: preboarding.SecurityAccess === 'Yes',
        active: true
      }; 

      const response = await fetch(`${BASE_URL}/onboarding/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(onboardingData)
      });

      if (!response.ok) {
        throw new Error('Failed to update onboarding');
      }

      setIsSubmitted(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (error) {
      console.error('Error updating onboarding:', error);
      setApiError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return Object.values(documentUploaded).every(Boolean);
      case 1:
        return backgroundCheck.fullName.trim() !== '' &&
          backgroundCheck.recordStatus &&
          backgroundCheck.signature.trim() !== '' &&
          backgroundCheck.date.trim() !== '';
      case 2:
        return (contractForm.signed || contractForm.notSigned) &&
          contractForm.signature.trim() !== '' &&
          contractForm.dateSigned.trim() !== '';
      case 3:
        return induction.inductionType ;
      case 4:
        return ['WorkAccount', 'SystemAccess', 'AccessCard'].every(key => preboarding[key]);
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <StepDocuments
            uploaded={documentUploaded}
            setUploaded={setDocumentUploaded}
          />
        );
      case 1:
        return <StepBackgroundCheck formData={backgroundCheck} setFormData={setBackgroundCheck} />;
      case 2:
        return <StepContractSigning formData={contractForm} setFormData={setContractForm} />;
      case 3:
        return <StepInduction formData={induction} setFormData={setInduction} />;
      case 4:
        return <StepPreboarding formData={preboarding} setFormData={setPreboarding} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-6">
      <div className="w-full md:w-2/3 rounded-2xl p-6 space-y-6 bg-white shadow-lg">
        <h1 className='text-center font-bold text-2xl mb-6 text-blue-800'>New Employee Onboarding</h1>

        <div className="flex items-center justify-between w-full relative mb-8">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isActive = index === currentStep;
            return (
              <div key={index} className="flex-1 flex flex-col items-center relative">
                {index !== 0 && (
                  <div className={`absolute top-4 left-0 w-1/2 h-1 z-0 ${isCompleted ? 'bg-blue-600' : 'bg-blue-200'}`} />
                )}
                {index !== steps.length - 1 && (
                  <div className={`absolute top-4 right-0 w-1/2 h-1 z-0 ${index < currentStep - 1 ? 'bg-blue-600' : 'bg-blue-200'}`} />
                )}
                <div
                  onClick={() => setCurrentStep(index)}
                  className={`z-10 cursor-pointer w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                    ${isCompleted ? 'bg-blue-600 text-white' : isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}
                  `}
                >
                  {isCompleted ? '✔' : index + 1}
                </div>
                <span className="text-xs mt-1 text-center text-blue-800">{step}</span>
              </div>
            );
          })}
        </div>

        <div>{renderStep()}</div>

        {apiError && (
          <div className="text-red-500 text-center p-2 bg-red-50 rounded">
            {apiError}
          </div>
        )}

        <div className="flex justify-between">
          {currentStep > 0 ? (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded text-sm"
            >
              Previous
            </button>
          ) : (
            <div></div>
          )}

          {currentStep < steps.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              className={`px-4 py-2 rounded text-white ${isStepValid() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleDone}
              disabled={!isStepValid() || isLoading}
              className={`px-4 py-2 rounded text-white ${isStepValid() ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}
            >
              {isLoading ? 'Processing...' : 'Done'}
            </button>
          )}
        </div>

        {isSubmitted && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
            <div className="bg-white rounded-lg shadow-lg p-6 border border-green-200 text-center animate-fade-in scale-95">
              <div className="text-green-600 text-3xl mb-2">✅</div>
              <h2 className="text-xl font-semibold text-green-800 mb-2">Onboarding Completed</h2>
              <p className="text-gray-700">The onboarding process was successfully completed. You will be redirected shortly.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}