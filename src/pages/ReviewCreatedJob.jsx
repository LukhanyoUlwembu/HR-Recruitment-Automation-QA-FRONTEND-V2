import React, { useState,useEffect } from 'react';
import { CheckCircle, ArrowRight, FileText, FileCheck, Award, Map, Calendar } from 'lucide-react';
import { useParams,useNavigate } from "react-router-dom";
import { BASE_URL } from './useAuth';
import Select from "react-select"; 
import AddressAutocomplete from "../components/map/AddressAutocomplete.jsx";

const ReviewPage = () => {
const { id } = useParams();
const [activeSection, setActiveSection] = useState('jobRequisition');
const [showApprovalSection, setShowApprovalSection] = useState(false);
const name = sessionStorage.getItem("empName");
const email = sessionStorage.getItem("empEmail");
const navigate = useNavigate();
const [jobReq,setJobReq]=useState({});
const [approval,setApproval]=useState({});
const [skills,setSkills] = useState([]);
const [province,setProvince]=useState([]);
const [jobSector,setJobSectors]=useState([]);
const [certificate,setCertificate] = useState([]);
const [selectedTags, setSelectedTags] =useState([]);
const [selectedCertTags, setSelectedCertTags] = useState([]);
const [errors, setErrors] = useState({});
const [location, setlocation] = useState({
    city: "",
    province:"",
    street: "",
    zip: "",
  });

const [formData, setFormData] = useState({
role: '',
department: '',
reportsTo: '',
industry:'',
jobDeadline:'',
description:'',
keyResponsibilities:'',
keyResultsArea: '',
formalEducation: '',
experience: '',
approverName: name,
reason: '',
approvalDate:new Date().toISOString().split("T")[0],
signature: email,
dateRequest: '',
expectedStart: '',
jobTitle: '',
hiringManager: '',
vacancy: '',
workType: '',
decision:false,
});

const handleAddressSelect = ({ address, city, province,street, zip, lat, lng }) => {
  setlocation((prev) => ({
    ...prev,
    address, 
    city,
    province,
    street,
    zip,
    lat,
    lng,
  })); 
};
useEffect(() => {
  let isMounted = true;

  const fetchData = async () => {
    try {
      const [
        jobRes,
        skillRes,
        certRes,
        provinceRes,
        sectorRes,
        approvalRes,
      ] = await Promise.all([
        fetch(`${BASE_URL}/job-requisitions/${id}`),
        fetch(`${BASE_URL}/dropdown/skills`),
        fetch(`${BASE_URL}/dropdown/certifications`),
        fetch(`${BASE_URL}/dropdown/provinces`),
        fetch(`${BASE_URL}/dropdown/sectors`),
        fetch(`${BASE_URL}/job-requisitions/approvals/${id}/job-id`)
      ]);

      if (!isMounted) return;

      if (!jobRes.ok) throw new Error("Failed to fetch Job Requisition");

      const jobData = await jobRes.json();
      setJobReq(jobData);
// Populate selected tags from jobData
setSelectedTags(jobData?.jobSkills?.map(s => s.skillName) || []);
setSelectedCertTags(
  jobData?.jobEducation?.map(e => e.certifiate) || []
);

// Prefill formData
setFormData(prev => ({
  ...prev,
  department: jobData?.client || '',
  keyResponsibilities: jobData?.responsibilities || '',
  //formalEducation: jobData?.jobEducation?.[0]?.educationName || '',
  educationLevels: jobData?.jobEducation?.[0]?.educationGrade.name || '',
  experience: jobData?.level.name || '',
  dateRequest: jobData?.dateOfRequest || '',
  expectedStart: jobData?.expectedStartDate || '',
  jobTitle: jobData?.jobTitle || '',
  reportsTo: jobData?.lineManager || '',
}));
      const [skills, certs, provinces, sectors, approvals] = await Promise.all([
        skillRes.ok ? skillRes.json() : [],
        certRes.ok ? certRes.json() : [],
        provinceRes.ok ? provinceRes.json() : [],
        sectorRes.ok ? sectorRes.json() : [],
        approvalRes.ok ? approvalRes.json() : [],
      ]);

      setSkills(skills);
      setCertificate(certs);
      setProvince(provinces);
      setJobSectors(sectors);
      setApproval(approvals);
    } catch (err) {
      console.error("Fetching error:", err.message);
    }
  };

  fetchData();

  return () => {
    isMounted = false; // Cleanup
  };
}, [id]);


const tabClasses = (tabName) =>
`flex items-center px-4 py-2 rounded-md transition-colors ${
    activeSection === tabName
    ? 'bg-blue-100 text-blue-600 font-medium'
    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
}`;

const handleChange = (e) => {
  const { id, name, value, type } = e.target;
  const key = id || name;
  setFormData((prev) => ({
      ...prev,
      [key]: type === 'radio' && key === 'decision'
        ? (value === 'approve')  
        : value,
  }));

  setlocation((prev) => ({ ...prev, [id]: value }));
  
};

const cont = async()=>{
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

    setActiveSection('jobPost');
}

const handlePost = async() => {
    const newErrors = {};
   
    setErrors({});

    if (!location.province) {
      newErrors.province = "Province is required.";
    }
    if (!location.city) {
      newErrors.city = "City is required.";
    }
    if (!location.street) {
      newErrors.street = "Street is required.";
    }
    if (!location.zip) {
      newErrors.zip = "Zip Code is required.";
    }

    if (!formData.formalEducation) {
      newErrors.formalEducation = "Eductaion is required.";
    }
     
    
    if (!formData.educationLevels) {
      newErrors.educationLevels = "Education Level is required.";
    }

    if (!formData.industry) {
      newErrors.industry = "Industry is required.";
    }

    if (!formData.description?.trim()) {
      newErrors.description = "Description is required.";
    }

    if (!formData.jobDeadline) {
      newErrors.jobDeadline = "Job deadline is required.";
    }

    if (!formData.workType?.trim()) {
      newErrors.workType = "Work Type is required.";
    }

    if (!formData.keyResponsibilities?.trim()) {
      newErrors.keyResponsibilities = "Key Responsibilities is required.";
    }

     if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

 try {
    const response = await fetch(`${BASE_URL}/postings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jobSector:formData.industry.name,
        jobTitle:jobReq.jobTitle,
        jobDescription:formData.description,
        jobSalary:jobReq.salary,
        type:formData.workType,
        level:formData.experience,
        contract:jobReq.employmentType,
        jobDeadline:formData.jobDeadline,
        approval:approval,
        location:location
      })
    });

    if (response.ok){   
       
        navigate(`/dashboard`)
} else{throw new Error('Something went wrong');}
  
  } catch (error) {
    console.error(error.message);
  }
};


const [isApproved, setIsApproved] = useState(false);
useEffect(() => {
const fetchCheck = async () => {
      
      try {
        const response = await fetch(
            `${BASE_URL}/job-requisitions/approvals/${id}/exist`
        );
        if (response.ok) {
          const data = await response.json();
          setIsApproved(data === true);
        }
      } catch (err) {
        console.log("Error fetching grades:", err.message);
      }
     
    };
    fetchCheck();
});

useEffect(() => {
      const educationLevelFormatted = formData.educationLevels
      ? formData.educationLevels.replace(/_/g, ' ')
      : 'Not specified';
  if (jobReq.jobTitle && formData.keyResponsibilities) {
    const newDesc = `We are looking for a talented ${jobReq.jobTitle} to ${formData.keyResponsibilities}.
Requirements:
- Skills: ${selectedTags.length > 0 ? selectedTags.map(cert => cert?.name || 'Unknown').join(', ')  : 'Not specified'}
- Certifications: ${selectedCertTags.length > 0 ? selectedCertTags.map(cert => cert?.name || 'Unknown').join(', ')  : 'Not specified'}
- Highest Education: ${educationLevelFormatted}`;

    setFormData(prev => ({ ...prev, description: newDesc }));
  }

  if (formData.educationLevels) {
    const newEdu = `${educationLevelFormatted} in ${formData.industry ? formData.industry.name : ''}`;


    setFormData(prev => ({ ...prev, formalEducation: newEdu }));
  }
}, [jobReq.jobTitle, formData.keyResponsibilities, selectedTags, selectedCertTags, formData.educationLevels, formData.industry, jobReq.educationLevels]);


return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
    <main className="flex-1 py-6 max-w-7xl mx-auto w-full">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6 ml-[45%]">Review Page</h1>
        
      <div className="mb-6">
   

  <div className="flex items-center justify-center mb-8 space-x-2">
    <button
      className={tabClasses('jobRequisition')}
      onClick={() => setActiveSection('jobRequisition')}
    >
      <Award className="h-5 w-5 mr-2" />
      Job Requisition
    </button>
    <button
      className={tabClasses('jobDescription')}
      onClick={() => setActiveSection('jobDescription')}
    >
      <FileCheck className="h-5 w-5 mr-2" />
      Job Description
    </button>
    <button
      className={tabClasses('jobPost')}
    >
      <FileText className="h-5 w-5 mr-2" />
      Job Post
    </button>
  </div>
</div>


        {activeSection === 'jobPost' && (
        <>
    {/* Conditionally render job post fields or approval form in-place */}
     
    <>
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div className="col-span-1 md:col-span-2">
    <div className="bg-white p-6 mb-6 border border-gray-300 rounded-[15px] box-border w-full">
      <div className="flex items-center mb-4">
        <div className="bg-blue-100 p-2 rounded-full">
          <FileText className="h-5 w-5 text-blue-600" />
        </div>
        <h2 className="text-xl font-medium text-gray-800 ml-2">Basic Information</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">Job Title</label>
            <input
              type="text"
              id="jobTitle"
              value={jobReq.jobTitle}
              onChange={handleChange}
              className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm border-gray-300"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">Department</label>
            <input
              type="text"
              id="department"
              value={jobReq.client}
              onChange={handleChange}
              className="block w-full px-3 py-2 mt-1 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm border-gray-300"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">Industry</label>
            <select
          className={`form-select block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
          value={formData.industry ? JSON.stringify(formData.industry) : ""}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              industry: e.target.value ? JSON.parse(e.target.value) : null, 
            }))
          }
        >
          <option value="">Select Industry</option>
          {jobSector.map((level) => (
            <option key={level} value={JSON.stringify(level)}>
              {level.name}
            </option>
          ))}
        </select>
            {errors.industry && <p className="text-red-500 text-xs mt-1">{errors.industry}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">Contract Type</label>
            <input
              type="text"
              id="contract"
              value={jobReq.employmentType}
              onChange={handleChange}
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">Job Deadline</label>
            <input
              type="date"
              id="jobDeadline"
              value={formData.jobDeadline}
              onChange={handleChange}
              className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            {errors.jobDeadline && <p className="text-red-500 text-xs mt-1">{errors.jobDeadline}</p>}
          </div>
        </div>

        <div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={handleChange}
              className={`form-textarea w-full px-3 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              rows="4"
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">Responsibilities</label>
            <textarea
              value={formData.keyResponsibilities}
              onChange={handleChange}
              className={`form-textarea w-full px-3 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                errors.keyResponsibilities ? 'border-red-500' : 'border-gray-300'
              }`}
              rows="4"
            />
            {errors.keyResponsibilities && <p className="text-red-500 text-xs mt-1">{errors.keyResponsibilities}</p>}
          </div>
        </div>
      </div>
    </div>
  </div>

  <div>
    <div className="bg-white p-6 mb-6 border border-gray-300 rounded-[15px] box-border w-full">
      <div className="flex items-center mb-4">
        <div className="bg-green-100 p-2 rounded-full">
          <Award className="h-5 w-5 text-green-600" />
        </div>
        <h2 className="text-xl font-medium text-gray-800 ml-2">Education & Experience</h2>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-medium mb-2">Formal Education</label>
        <input
          type="text"
          id="formalEducation"
          value={formData.formalEducation}
          onChange={handleChange}
          className={`block w-full px-3 py-2 mt-1 rounded-md shadow-sm focus:outline-none text-sm ${
            errors.formalEducation ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.formalEducation && <p className="text-red-500 text-xs mt-1">{errors.formalEducation}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-medium mb-2">Professional Certifications</label>
        <textarea
          className="form-textarea w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          rows="4"
           value={
    selectedCertTags.length > 0 
      ? selectedCertTags.map(cert => cert?.name || 'Unknown').join(', ') 
      : 'None'
  }
          readOnly
        ></textarea>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-medium mb-2">Experience</label>
        <input
  type="text"
  id="experience"
  value={formData.experience}
  readOnly
  className={`block w-full px-3 py-2 mt-1 rounded-md shadow-sm focus:outline-none text-sm ${
    errors.experience ? 'border-red-500' : 'border-gray-300'
  }`}
/>

        {errors.experience && <p className="text-red-500 text-xs mt-1">{errors.experience}</p>}
      </div>
    </div>
  </div>

  <div>
    <div className="bg-white p-6 mb-6 border border-gray-300 rounded-[15px] box-border w-full">
      <div className="flex items-center mb-4">
        <div className="bg-purple-100 p-2 rounded-full">
          <Map className="h-5 w-5 text-purple-600" />
        </div>
        <h2 className="text-xl font-medium text-gray-800 ml-2">Location</h2>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-medium mb-2">Work Type</label>
        <div className="flex space-x-4">
          {['onsite', 'remote', 'hybrid'].map((type) => (
            <label key={type} className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-blue-600"
                name="workType"
                value={type}
                checked={formData.workType === type}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, workType: e.target.value }))
                }
              />
              <span className="ml-2 text-gray-700 capitalize">{type}</span>
            </label>
          ))}
        </div>
        {errors.workType && <p className="text-red-500 text-xs mt-1">{errors.workType}</p>}
      </div>

      <div className="mb-4">
        <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Search Address</label>
              <AddressAutocomplete onAddressSelect={handleAddressSelect} />
            </div>
        <label className="block text-gray-700 text-sm font-medium mb-2">Province</label>
        <select
          className={`form-select block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            errors.province ? 'border-red-500' : 'border-gray-300'
          }`}
          value={location.province ? JSON.stringify(location.province) : ""}
          onChange={(e) =>
            setlocation((prev) => ({
              ...prev,
              province:e.target.value ? JSON.parse(e.target.value) : null, 
            }))
          }
        >
          <option value="">Select Province</option>
          {province.map((level) => (
            <option key={level} value={JSON.stringify(level)}>
              {level.name}
            </option>
          ))}
        </select>
        {errors.province && <p className="text-red-500 text-xs mt-1">{errors.province}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-medium mb-2">City</label>
        <input
          type="text"
          id="city"
          value={location.city}
          onChange={handleChange}
          className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"
        />
         {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-medium mb-2">Street</label>
        <input
          type="text"
          id="street"
          value={location.street}
          onChange={handleChange}
          className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"
        />
         {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-medium mb-2">Zip Code</label>
        <input
          type="text"
          id="zip"
          value={location.zip}
          onChange={handleChange}
          className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm"
        />
         {errors.zip && <p className="text-red-500 text-xs mt-1">{errors.zip}</p>}
      </div>
    </div>
  </div>
</div>

<div className="flex space-x-4 ml-[80%]">
  <button className="px-5 py-2 bg-blue-600 border border-gray-300 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
    Cancel
  </button>
  <button
    onClick={handlePost}
    className="px-5 py-2 bg-blue-600 border border-gray-300 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
  >
    Post
  </button>
</div>

</>
 
</>
)}
        
 {activeSection === 'jobDescription' && (
        <div className="max-w-md mx-auto mt-6 p-6 bg-white rounded-md shadow-md">
    <h3 className="font-bold text-center mb-4">Job Description Form</h3>
    <form onSubmit={e => e.preventDefault()}>
        {/* Role */}
        <div className="mb-3">
        <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="role">Job Title</label>
        <input
            type="text"
            id="role"
            value={jobReq.jobTitle}
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
            value={jobReq.client}
            onChange={handleChange}
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
            value={jobReq.lineManager}
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
            value={formData.keyResponsibilities}
            onChange={handleChange}
            className="form-select appearance-none block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter key responsibilities"
        ></textarea>
        {errors.keyResponsibilities && <p className="text-red-500 text-xs mt-1">{errors.keyResponsibilities}</p>}
        </div>

         <div className="mb-3">
             <label className="block text-gray-700 text-sm font-medium mb-2">Formal Education</label>
        <div className="relative">
            <input
            type="text"
            id="education"
            value={formData.educationLevels}
            onChange={handleChange}
            className="form-select appearance-none block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter Formal Education"
        />
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
      <div className="relative">
            <input
            type="text"
            id="experience"
            value={formData.experience}
            onChange={handleChange}
            className="form-select appearance-none block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter Formal Education"
        />
          {errors.experience && <p className="text-red-500 text-xs mt-1">{errors.experience}</p>}
       
        </div>
 
       
        </div>
        {/* Buttons */}
        <div className="flex space-x-4 ml-[76%]">
        <button
            type="button"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
            onClick={cont}
        >
            Continue
        </button>
        </div>
    </form>
    </div>

        )}
        

        {activeSection === 'jobRequisition' && (
            <>
            {!showApprovalSection ? (
            <>
        <div className="max-w-lg mx-auto mt-4 p-6 bg-white rounded-md shadow-md">
    <h3 className="font-bold text-center mb-4">Employee Requisition Form</h3>
    <form>

    <div className="mb-3">
        <label htmlFor="dateofrequest" className="block text-sm font-medium text-gray-700">Date of Request</label>
        <input
        type="text"
        id="dateofrequest"
        value={new Date(jobReq.dateOfRequest).toLocaleDateString()}
        readOnly
        className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
    </div>

    <div className="mb-3">
        <label htmlFor="expectedStart" className="block text-sm font-medium text-gray-700">Expected Start Date</label>
        <input
        type="text"
        id="expectedStart"
        value={new Date(jobReq.expectedStartDate).toLocaleDateString()}
        readOnly
        className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
    </div>

    <div className="mb-3">
        <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">Job Title</label>
        <input
        type="text"
        id="jobTitle"
        value={jobReq.jobTitle}
        readOnly
        className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
    </div>

    <div className="mb-3">
        <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department</label>
          <input
        type="text"
        id="department"
        value={jobReq.client}
        readOnly
        className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
    </div>

    <div className="mb-3">
        <label htmlFor="formManager" className="block text-sm font-medium text-gray-700">Hiring Manager</label>
        <input
        type="text"
        id="hiringManager"
        value={jobReq.lineManager}
                readOnly
        className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
    </div>

    <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700">Requisition Type</label>
        <div className="mt-1 space-x-8">
            <input
        type="requisitionType"
        id="department"
        value={jobReq.shortListingMethod}
        readOnly
        className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
        </div>
    </div>

    <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700">Employment Type</label>
        <div className="mt-1 space-x-6 ">
             <input
        type="text"
        id="emolymentType"
        value={jobReq.employmentType}
       readOnly
        className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
        </div>
    </div>

    <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700">Client Billing Rate</label>
        <input
        type="text"
        value={jobReq.billingRate}
        readOnly
        className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
    </div>

    <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700">New or Replacement Position?</label>
        <div className="mt-1 space-x-6 ">
             <input
        type="text"
        id="position"
        value={jobReq.positionType}
        readOnly
        className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
        </div>
    </div>

    <div className="mb-3">
        <label htmlFor="jobRating" className="block text-sm font-medium text-gray-700">Market Salary Benchmark</label>
        <input
        type="text"
        id="jobRating"
        value={jobReq.salaryBenchmark}
        readOnly
        className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
    </div>

    <div className="mb-3">
        <label htmlFor="jobRating" className="block text-sm font-medium text-gray-700">Salary to be offered</label>
        <input
        type="text"
        id="salary"
        value={jobReq.salary}
        readOnly
        className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
    </div>



      {/* Buttons */}
    <div className="flex space-x-4 ml-[73%]">
        <button
        disabled={isApproved}
   className={`px-8 py-2.5 rounded-md font-semibold transition duration-200 ease-in-out shadow-sm ${
                  isApproved
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}onClick={() => {
         if(!isApproved){setShowApprovalSection(true)}
    }
     }
    type="button"
    >
    {isApproved ? "Approved" : "Approve"}
    </button>
    </div>
    </form>
        </div>
</>) : (
      // Approval form rendered in-place
    <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-md mt-8">
        {/* Approver Name */}
        <label className="block text-sm font-medium text-gray-700 mb-1">Approver Name</label>
        <input
        type="text"
        name="approverName"
        value={name || ""}
        placeholder={name}
        onChange={handleChange}
        className="w-full mb-4 border border-gray-300 rounded-md p-2 text-sm"
        >
        </input>

        {/* Decision */}
        <label className="block text-sm font-medium text-gray-700 mb-1">Decision</label>
        <div className="flex gap-6 mb-4">
        <label className="inline-flex items-center">
            <input
            type="radio"
            name="decision"
            value="approve"
            checked={formData.decision === true}
            onChange={handleChange}
            className="form-radio text-blue-600"
            />
            <span className="ml-2 font-medium">Approve</span>
        </label>
        <label className="inline-flex items-center">
            <input
            type="radio"
            name="decision"
            value="decline"
            checked={formData.decision === false}
            onChange={handleChange}
            className="form-radio text-red-600"
            />
            <span className="ml-2 font-medium">Decline</span>
        </label>
        </div>

        {/* Reason/Description field for both approve and decline */}
        <label className="block text-sm font-medium mb-1 text-gray-700">
            Reason for decision
        </label>
      <textarea
        name="reason"
        value={formData.reason || ""}
        onChange={handleChange}
        rows={4}
        className={`w-full mb-1 border rounded-md p-2 text-sm text-gray-700 ${  errors.reason ? 'border-red-500' : 'border-gray-300'}`}
        placeholder={`Please provide a detailed reason for ${  formData.decision === 'decline' ? 'declining' : 'approving'} this request`}
        required
        />
        {errors.reason && ( <p className="text-red-500 text-xs mb-3">{errors.reason}</p>)}
            <div className="flex justify-between gap-4 mb-6">
            <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Approval Date</label>
                <div className="relative border-b border-gray-300 pb-1">
                <input
                    type="date"
                    name="approvalDate"
                    value={formData.approvalDate || new Date().toISOString().split("T")[0]}
                    onChange={handleChange}
                    className="w-full text-sm bg-transparent focus:outline-none"
                    />

                {typeof Calendar !== 'undefined' && (
                    <Calendar className="absolute right-0 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                )}
                </div>
            </div>

              {/* Signature */}
            <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Signature</label>
                <input
                    type="text"
                    name="signature"
                    value={formData.signature || email}
                    onChange={handleChange}
                    className="w-full text-sm bg-transparent focus:outline-none  border-b border-gray-300 pb-1"
                />
            </div>
            </div>
       
        <div className="flex space-x-4 justify-end mt-6">
        <button
            type="button"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
            Submit
        </button>
        <button
            type="button"
            onClick={() => setShowApprovalSection(false)}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
            Cancel
        </button>
        </div>
    </div>
    )}
</>
)}
        
    </main>
    </div>
);
};

export default ReviewPage;