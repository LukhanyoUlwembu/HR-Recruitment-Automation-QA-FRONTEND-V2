import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from './useAuth';
import Select from "react-select"; 
export default function MultiStepVacancyForm() {
  const [step, setStep] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const name = sessionStorage.getItem("empName");
  const email = sessionStorage.getItem("empEmail");
  const [currency, setCurrency] = useState([]);
  const role = sessionStorage.getItem("role");
  const navigate = useNavigate();
  const [certificate,setCertificate] = useState([]);
  const [skills,setSkills] = useState([]);
  const [exps,setExps] = useState([]);
  const [educationLevels,setGradetype]=useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedCertTags, setSelectedCertTags] = useState([]);
  const [permissions, setPermissions] = useState([]);

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  

  const [formData, setFormData] = useState({
    organogramFile: null,
    created:getCurrentDate(),
    dateOfRequest: getCurrentDate(),
    clientBillingRate: '',
    expectedStartDate: '',
    jobTitle: '',
    client: '',
    currency: '',
    hiringManager: name,
    lineManager: name,
    shortlistingMethod: '',
    employmentType: '',
    fixedTermContract: null,
    billingRate: '',
    positionType: '',
    salaryBenchmark: '',
    salary: '',
    lmSign: email,
    lmDate: getCurrentDate(),
    experience:'',
    keyResponsibilities:'',
    formalEducation:'',
    educationLevels:''
  });

  const [errors, setErrors] = useState({
    dateOfRequest: '',
    expectedStartDate: '',
    billingRate: '',
    jobTitle: '',
    client: '',
    hiringManager: '',
    lineManager: '',
    currency: '',
    shortlistingMethod: '',
    employmentType: '',
    fixedTermContract: null,
    positionType: '',
    salaryBenchmark: '',
    salary: '',
    lmSign: '',
    lmDate: '',
  });

  const [modalContent, setModalContent] = useState({
  title: '',
  message: ''
});

const openModal = (title, message) => {
  setModalContent({ title, message });
  setShowModal(true);
};


  useEffect(() => {


// Fetch permissions function
  const fetchPermissions = async () => {
    if (!role) {
      console.error("No role found in session storage");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/permissions/${role}/roles`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Extract permission names from the response
        const permissionNames = data.map((p) => p.name);
        setPermissions(permissionNames);
        console.log("Permissions loaded:", permissionNames);
      } else {
        console.error("Failed to fetch permissions:", response.status);
      }
    } catch (err) {
      console.error("Error fetching permissions:", err);
    } 
  };

  const fetchCurrencyList = async () => {
    try {
      const response = await fetch(`${BASE_URL}/dropdown/currencies`);
      if (response.ok) {
        const data = await response.json();
        setCurrency(data);
      }
    } catch (err) {
      console.log("Error fetching currency:", err.message);
    }
  };
const fetchSkillList = async () => {
      
      try {
        const response = await fetch(
            `${BASE_URL}/dropdown/skills`
        );
        if (response.ok) {
          const data = await response.json();
          setSkills(data);
        }
      } catch (err) {
        console.log("Error fetching files:", err.message);
      }
      
    };
    const fetchCertList = async () => {
      
      try {
        const response = await fetch(
            `${BASE_URL}/dropdown/certifications`
        );
        if (response.ok) {
          const data = await response.json();
          setCertificate(data);
        }
      } catch (err) {
        console.log("Error fetching files:", err.message);
      }
      
    };
      const fetchExpList = async () => {
      
      try {
        const response = await fetch(
            `${BASE_URL}/dropdown/experience-levels`
        );
        if (response.ok) {
          const data = await response.json();
          setExps(data);
        }
      } catch (err) {
        console.log("Error fetching files:", err.message);
      }
      
    };
    const fetchEducationList = async () => {
      
      try {
        const response = await fetch(
            `${BASE_URL}/dropdown/grades`
        );
        if (response.ok) {
          const data = await response.json();
          setGradetype(data);
        }
      } catch (err) {
        console.log("Error fetching grades:", err.message);
      }
      
    };

    
    fetchEducationList();
    fetchExpList();
    fetchCertList();
    fetchSkillList();
   fetchCurrencyList();
   fetchPermissions();
// eslint-disable-next-line react-hooks/exhaustive-deps
},[]);
 

const handleChange = (e) => {
  const { name, type, value, checked, files } = e.target;
  
  // For number fields (billingRate, salaryBenchmark, salary)
  if (['billingRate', 'salaryBenchmark', 'salary'].includes(name)) {
    // Allow empty string (for backspace/delete) or valid numbers with optional decimal
    if (value === '' || /^(\d+\.?\d*|\.\d+)$/.test(value)) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    return;
  }

  if (type === 'file' && files.length > 0) {
    const newFile = files[0];
    
    // Check if file name already exists in any file field
    const isDuplicate = Object.values(formData).some(val => {
      return val instanceof File && val.name === newFile.name;
    });

    if (isDuplicate) {
      openModal("Duplicate File", "A file with this name has already been uploaded.");
      return;
    }

    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 
                       'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const validExtensions = ['.pdf', '.doc', '.docx'];
    const fileExtension = newFile.name.substring(newFile.name.lastIndexOf('.')).toLowerCase();

    if (!validTypes.includes(newFile.type) && !validExtensions.includes(fileExtension)) {
      openModal("Invalid File Type", "Please upload only PDF or Word documents (PDF, DOC, DOCX)");
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (newFile.size > maxSize) {
      openModal("File Too Large", "Maximum file size is 5MB. Please upload a smaller file.");
      return;
    }

    // If validations pass, update the form data
    setFormData(prev => ({
      ...prev,
      [name]: newFile,
    }));
  } else {
    const fieldValue = type === 'checkbox' ? checked : value;
    setFormData(prev => ({
      ...prev,
      [name]: fieldValue,
    }));
  }
};
const cont = async(e)=>{
  

  e.preventDefault();
    let newErrors = {};

    if (!formData.dateOfRequest) {
      newErrors.dateOfRequest = 'Date of request is required';
    } 
    
    if (!formData.expectedStartDate) {
      newErrors.expectedStartDate = 'Expected start date is required';
    }

    if (!formData.jobTitle) {
      newErrors.jobTitle = 'Job Title is required';
    } 
    
    if (!formData.client) {
      newErrors.client = 'Client is required';
    }
    
    if (!formData.hiringManager) {
      newErrors.hiringManager = 'Hiring Manager is required';
    } 
    
    if (!formData.currency) {
      newErrors.currency = 'Currency is required';
    }
    
    if (!formData.lineManager) {
      newErrors.lineManager = 'Line Manager is required';
    }
  

    
    if (!formData.shortlistingMethod) {
      newErrors.shortlistingMethod = 'Short Listing Method is required';
    }
    
    if (!formData.employmentType) {
      newErrors.employmentType = 'Employment Type is required';
    }

    if (formData.employmentType === 'Fixed term contract' && !formData.fixedTermContract) {
      newErrors.fixedTermContract = 'Contract Duration is required for Fixed term contracts';
    }
    
    // // Number validations
    // if (!formData.billingRate) {
    //   newErrors.billingRate = 'Billing rate is required';
    // } else if (!/^\d*\.?\d+$/.test(formData.billingRate)) {
    //   newErrors.billingRate = 'Please enter a valid number';
    // }

    if (!formData.salaryBenchmark) {
      newErrors.salaryBenchmark = 'Salary benchmark is required';
    } else if (!/^\d*\.?\d+$/.test(formData.salaryBenchmark)) {
      newErrors.salaryBenchmark = 'Please enter a valid number';
    }

    if (!formData.salary) {
      newErrors.salary = 'Salary is required';
    } else if (!/^\d*\.?\d+$/.test(formData.salary)) {
      newErrors.salary = 'Please enter a valid number';
    }
    
    if (!formData.lmSign) {
      newErrors.lmSign = 'Line Manager signature is required';
    }
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      console.log(newErrors);
      return;
    }

     setStep(3);
}
const handleNext = () => {
  // Check if required files are uploaded
  if (!formData.organogramFile) {
    openModal("Missing Document", "Please upload the Organogram file before proceeding.");
    return;
  }
  
  setStep(2);
};
  const handleSubmit = async () => {

 const newErrors = {};
   
    setErrors({});

    if (!formData.keyResponsibilities) {
      newErrors.keyResponsibilities = "Key responsibilities are required.";
    }
     if (!selectedTags) {
      newErrors.skills = "Skills are required.";
    }
      if (!formData.educationLevels) {
      newErrors.education = "Education is required.";
    }

    if (!formData.experience.trim('')) {
      newErrors.experience = "Experience is required.";
    }

   
     if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

  
    const form = new FormData();
    form.append('organogramFile', formData.organogramFile);
  const jobEducationList = selectedCertTags.map(cert => ({
//  educationName: { id: Number(formData.educationLevels) },
  educationGrade: { id: Number(formData.educationLevels) },
  certifiate: { id: Number(cert.id) }
}));

const jobRequisition = {
  lineManager: formData.lineManager,
  jobTitle: formData.jobTitle,
  created: formData.created,
  department: formData.department,               // FIXED
  dateOfRequest: formData.dateOfRequest,
  expectedStartDate: formData.expectedStartDate,
  client: formData.client,
  shortListingMethod: formData.shortlistingMethod,  // FIXED
  currency: { id: Number(formData.currency) },
  employmentType: formData.employmentType,
  fixedTermMonths: formData.fixedTermContract
    ? { id: Number(formData.fixedTermContract) }    // FIXED
    : null,
  billingRate: parseFloat(formData.billingRate),
  positionType: formData.positionType,
  salaryBenchmark: parseFloat(formData.salaryBenchmark),
  salary: parseFloat(formData.salary),
  jobEducation: jobEducationList,
  jobSkills: selectedTags.map(tag => ({
    skillName: { id: Number(tag.id) }
  })),
  level: { id: Number(formData.experience) },
  responsibilities: formData.keyResponsibilities,
};


    form.append('jobRequisition', new Blob([JSON.stringify(jobRequisition)], {
      type: 'application/json',
    }));
     console.log(jobRequisition);
    try {
      const response = await fetch(`${BASE_URL}/job-requisitions`, {
        method: 'POST',
        body: form,
      });


      if (response.ok) {
        openModal("Success", "Requisition Submitted Successfully!");
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        openModal("Failed", "Submission failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      openModal("Error", "An error occurred while submitting the form.");
    }
  };
// Check permissions first
  if (!permissions.includes('create_job_requisition')) {
    return (
      <div className="max-w-xl mx-auto mt-20 p-6 bg-blue-100 rounded-md text-center">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">Access Denied</h2>
        <p className="text-blue-600 mb-6">
          You do not have permission to create job posts.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Go to Dashboard
        </button>
      </div>
    );
  } 
  return (
    <div className="max-w-4xl mx-auto mt-10 p-8 bg-white shadow-xl rounded-2xl">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {step === 1 ? 'Step 1: Vacancy Identification' : 'Step 2: Employee Requisition Form'}
      </h2>

      {step === 1 && (
        <form className="space-y-6">
          <Input errors={errors} type="file" name="organogramFile" label="Upload Updated Organogram" onChange={handleChange} />
          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={handleNext}
              className="w-auto p-2 mt-4 text-white bg-blue-500 hover:bg-blue-600 rounded-md shadow-sm text-md font-semibold"
            >
              Next
            </button>
          </div>
        </form>
      )}
         {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Input errors={errors} name="dateOfRequest" label="Date of Request" value={formData.dateOfRequest} onChange={handleChange} type="date" />
            <Input errors={errors} name="expectedStartDate" label="Expected Start Date" value={formData.expectedStartDate} onChange={handleChange} type="date" />
            <Input errors={errors} name="jobTitle" label="Job Title" value={formData.jobTitle} onChange={handleChange} />
            <Input errors={errors} name="hiringManager" label="Hiring Manager Name" value={formData.hiringManager} onChange={handleChange} />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <RadioGroup errors={errors} label="New or replacement position?" name="positionType" options={['New', 'Replacement']} value={formData.positionType} onChange={handleChange} />
            <RadioGroup errors={errors} label="Department or Client?" name="client" options={['Internal Department', 'External Client']} value={formData.department} onChange={handleChange} />
            <RadioGroup errors={errors} label="Pre-screening Method" name="shortlistingMethod" options={['Telephonic Interviews','Competency-based Assessments']} value={formData.shortlistingMethod} onChange={handleChange} />
            <RadioGroup errors={errors} label="Employment Type" name="employmentType" options={['Permanent', 'Fixed term contract']} value={formData.employmentType} onChange={handleChange}/>
            {formData.employmentType === 'Fixed term contract' && (
              <RadioGroup errors={errors} label="Contract Duration" name="fixedTermContract" value={formData.fixedTermContract} onChange={handleChange}
                options={[
                  { label: '1 Month', value: 'One' },
                  { label: '2 Months', value: 'Two' },
                  { label: '3 Months', value: 'Three' },
                  { label: '12 Months', value: 'Twelve' },
                  { label: 'Other', value: 'Other' }
                ]}
              />
            )}
          </div>

          <div className="mb-4">
            <label className="block font-medium mb-2">Currency</label>
            <select
              className={`form-select block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.currency ? 'border-red-500' : 'border-gray-300'
              }`}
              value={formData.currency}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  currency: e.target.value,
                }))
              }
            >
              <option value="">Select Currency</option>
              {currency.map((level) => (
                <option key={level} value={level.id}>
                  {level.name}
                </option>
              ))}
            </select>
            {errors.currency && <p className="text-red-500 text-xs mt-1">{errors.currency}</p>}
          </div>

          <Input 
            errors={errors} 
            name="billingRate" 
            label="Client Billing Rate" 
            value={formData.billingRate} 
            onChange={handleChange} 
            type="text"
            inputMode="decimal"
          />
          <Input 
            errors={errors} 
            name="salaryBenchmark" 
            label="Market Salary Benchmark" 
            value={formData.salaryBenchmark} 
            onChange={handleChange} 
            type="text"
            inputMode="decimal"
          />
          <Input 
            errors={errors} 
            name="salary" 
            label="Salary to be offered" 
            value={formData.salary} 
            onChange={handleChange} 
            type="text"
            inputMode="decimal"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input errors={errors} name="lmSign" label="Line Manager Signature" value={formData.lmSign} onChange={handleChange} />
          </div>

          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="bg-gray-300 text-gray-800 px-6 py-3 rounded-xl hover:bg-gray-400"
            >
              Back
            </button>
            <button
            type="button"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
            onClick={cont}
        >
            Continue
        </button>
          </div>
        </form>
      )}
      {step === 3 && (
        <div className="max-w-md mx-auto mt-6 p-6 bg-white rounded-md shadow-md">
    <h3 className="font-bold text-center mb-4">Job Description Form</h3>
    <form onSubmit={e => e.preventDefault()}>
        {/* Role */}
        <div className="mb-3">
        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="role">Job Title</label>
        <input
            type="text"
            id="role"
            value={formData.jobTitle}
            onChange={handleChange}
            className="form-select appearance-none block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter role"
        />
        {errors.jobTitle && <p className="text-red-500 text-xs mt-1">{errors.jobTitle}</p>}
        </div>

      

{/* Department */}
<div className="mb-3">
  <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="department">Department</label>
  <input
      type="text"
      id="department"
      value={formData.department}   
      onChange={(e) =>
        setFormData(prev => ({
          ...prev,
          department: e.target.value,   
        }))
      }
      className="form-select appearance-none block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      placeholder="Enter department"
  />
  {errors.department && <p className="text-red-500 text-xs mt-1">{errors.department}</p>}
</div>


        {/* Reports To */}
        <div className="mb-3">
        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="reportsTo">Reports To</label>
        <input
            type="text"
            id="reportsTo"
            value={formData.lineManager}
            onChange={handleChange}
            className="form-select appearance-none block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter supervisor/manager"
        />
        {errors.lineManager && <p className="text-red-500 text-xs mt-1">{errors.lineManager}</p>}
        </div>

       
        {/* Key Responsibilities */}
        <div className="mb-3">
        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="keyResponsibilities">Key Responsibilities</label>
        <textarea
            id="keyResponsibilities"
            rows="3"
            value={undefined}
            onChange={handleChange}
            className="form-select appearance-none block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter key responsibilities"
            name="keyResponsibilities"
            checked={ undefined}
            type={'text'}
            readOnly={false}
        ></textarea>
        {errors.keyResponsibilities && <p className="text-red-500 text-xs mt-1">{errors.keyResponsibilities}</p>}
        </div>

         <div className="mb-3">
             <label className="block text-gray-700 text-sm font-medium mb-2">Formal Education</label>
        <div className="relative">
           <select className="form-select appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
           value={formData.educationLevels}
         onChange={(e) =>
    setFormData((prev) => ({
      ...prev,
      educationLevels: e.target.value,
    }))
  }
        >
          <option value="">Select Education Level</option>
          {educationLevels.map((level) => (
            <option key={level} value={level.id}>
              {level.name}
            </option>
          ))}
        </select>
         <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
            </div>
             {errors.education && <p className="text-red-500 text-xs mt-1">{errors.education}</p>}
       
        </div>
         </div>
        

        {/* Practical/Technical Certification */}
        <div className="">
        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="certification">Certifications</label>
          <div className="space-y-4">
              <div className="flex gap-2 items-center">
                <div className="w-full">
                  <Select
                    options={certificate.map((cert) => ({ label: cert.name, value: cert }))}
                    onChange={(selectedOption) => {
                      const cert = selectedOption?.value;
                      if (cert && !selectedCertTags.includes(cert)) {
                        setSelectedCertTags([...selectedCertTags, cert]);
                      }
                    }}
                    placeholder="Select or search for a certificate..."
                    className="w-full"
                  />
                </div>
              </div>
                    <div className="flex flex-wrap gap-2">
                        {selectedCertTags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-gray-200 text-sm px-3 py-1 rounded-full flex items-center"
                  >
                    {tag.name}
                    <button
                      onClick={() =>
                        setSelectedCertTags(selectedCertTags.filter((t) => t !== tag))
                      }
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
                    </div>
                  </div>
        </div>

      
        <div className="">
              <label className="block text-gray-700 text-sm font-medium mb-2 " htmlFor="Skills">Skills</label>
        <div className="space-y-4">
              <div className="flex gap-2 items-center">
                <div className="w-full">
                  <Select
                    options={skills.map((skill) => ({ label: skill.name, value: skill }))}
                    onChange={(selectedOption) => {
                      const skill = selectedOption?.value;
                      if (skill && !selectedTags.includes(skill)) {
                        setSelectedTags([...selectedTags, skill]);
                      }
                    }}
                    placeholder="Select or search for a skill..."
                    className="w-full"
                  />
                </div>
              </div>
                    <div className="flex flex-wrap gap-2">
                        {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-gray-200 text-sm px-3 py-1 rounded-full flex items-center"
                  >
                    {tag.name}
                    <button
                      onClick={() =>
                        setSelectedTags(selectedTags.filter((t) => t !== tag))
                      }
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
                    </div>
                     {errors.skills && <p className="text-red-500 text-xs mt-1">{errors.skills}</p>}
       
                  </div>
               
        </div>
          {/* Experience */}
        <div className="mb-9">
        <label className="block text-gray-700 text-sm font-medium mb-2 " htmlFor="experienceSkills">Experience</label>
      <div className="space-y-4">
              <div className="flex gap-2 items-center">
                 <select className="form-select appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          value={formData.experience}
           onChange={(e) =>
    setFormData((prev) => ({
      ...prev,
      experience: e.target.value,
    }))
  }
        >
          <option value="">Select Years of Experience</option>
          {exps.map((level) => (
            <option key={level.name} value={level.id}>
              {level.name}
            </option>
          ))}
        </select>
             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
            </div>
              </div>  
         </div>
          {errors.experience && <p className="text-red-500 text-xs mt-1">{errors.experience}</p>}
       
        </div>
        {/* Buttons */}
        <div className="flex justify-between mt-6">
          <button
              type="button"
              onClick={() => setStep(2)}
              className="bg-gray-300 text-gray-800 px-6 py-3 rounded-xl hover:bg-gray-400"
            >
              Back
            </button>
        <button
              type="submit"
              onClick={handleSubmit}
              className="bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-700"
            >
              Submit
            </button>
        </div>
    </form>
    </div>

        )}
      

{showModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-md text-center">
      <h2 className="text-xl font-semibold mb-4 text-blue-600">{modalContent.title}</h2>
      <p className="text-gray-700 mb-6">{modalContent.message}</p>
      <button
        onClick={() => setShowModal(false)}
        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md"
      >
        OK
      </button>
    </div>
  </div>
)}
    </div>
  );
}

const Input = ({ errors, name, label, value, onChange, type = 'text', checked, readOnly = false, inputMode }) => (
  <div className="flex flex-col">
    <label htmlFor={name} className="mb-1 font-medium">{label}</label>
    <input
      id={name}
      name={name}
      type={type}
      inputMode={inputMode}
      onChange={onChange}
      value={type !== 'file' && !readOnly ? value : undefined}
      checked={type === 'checkbox' ? checked : undefined}
      readOnly={readOnly}
      className={`border ${errors[name] ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2`}
      // Add accept attribute for file inputs
      accept={type === 'file' ? '.pdf,.docx' : undefined}
    />
    {type === 'file' && (
      <p className="text-xs text-gray-500 mt-1">Accepted formats: PDF, DOCX (Max 5MB)</p>
    )}
    {errors[name] && (
      <p className="text-red-500 text-xs mt-1">{errors[name]}</p>
    )}
  </div>
);

const RadioGroup = ({ errors, label, name, options, value, onChange }) => (
  <fieldset className="flex flex-col mb-4">
    <legend className="font-medium mb-2">{label}</legend>
    <div className="flex flex-wrap gap-4">
      {options.map((option) => {
        const isObject = typeof option === 'object';
        const optionLabel = isObject ? option.label : option;
        const optionValue = isObject ? option.value : option;

        return (
          <label key={optionValue} className="flex items-center gap-2">
            <input
              type="radio"
              name={name}
              value={String(optionValue)}
              checked={String(value) === String(optionValue)}
              onChange={(e) => {
                let parsedValue = e.target.value;
                if (parsedValue === 'true') parsedValue = true;
                else if (parsedValue === 'false') parsedValue = false;
                onChange({
                  target: {
                    name,
                    value: parsedValue,
                  },
                });
              }}
            />
            {optionLabel}
          </label>
        );
      })}
    </div>

    {errors[name] && (
      <p className="text-red-500 text-xs mt-1">{errors[name]}</p>
    )}
  </fieldset>
);