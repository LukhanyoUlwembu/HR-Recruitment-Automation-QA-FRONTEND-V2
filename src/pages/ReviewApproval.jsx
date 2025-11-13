import React, { useState,useEffect } from 'react';
import { CheckCircle, ArrowRight, FileText, FileCheck, Award, Map, Calendar } from 'lucide-react';
import { useParams,useNavigate } from "react-router-dom";
import { BASE_URL } from './useAuth';
import Select from "react-select"; 
import AddressAutocomplete from "../components/map/AddressAutocomplete.jsx";

const ReviewApproval = () => {
const { id } = useParams();
const [activeSection, setActiveSection] = useState('jobRequisition');
const [showApprovalSection, setShowApprovalSection] = useState(false);
const name = sessionStorage.getItem("empName");
const email = sessionStorage.getItem("empEmail");
const navigate = useNavigate();
const [jobReq,setJobReq]=useState({});
const [errors, setErrors] = useState({});
const [showModal, setShowModal] = useState(false);


const [formData, setFormData] = useState({
approverName: name,
reason: '',
approvalDate:new Date().toISOString().split("T")[0],
signature: email,
decision:null,
});



useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch(`${BASE_URL}/job-requisitions/${id}`);
        if (!response.ok) throw new Error("Reload Page");
        const data = await response.json();
        setJobReq(data);
      } catch (err) {
        console.log(err.message);
      } 
    };

    fetchJobs();
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

};


const handleSave = async() => {
    const newErrors = {};
   
    setErrors({});
     if (!formData.reason?.trim()) {
      newErrors.reason = "Reason is required.";
    }
    if (formData.decision == null || formData.decision === '') {
        newErrors.decision = 'Desicion is required';
      }

     if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

 try {
    const response = await fetch(`${BASE_URL}/job-requisitions/approvals/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jobRequisitionId: jobReq.jobRequisitionId,
        approverName: formData.approverName,
        approverSignature: formData.signature,
        decision: formData.decision
      })
    });

    if (response.ok){   
        setShowModal(true);
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
            `${BASE_URL}/job-requisitions/approvals/${id}/exist/${email}`
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
  </div>
</div>


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
    {isApproved ? "Submitted" : "Approve"}
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
          {errors.decision && ( <p className="text-red-500 text-xs mb-3">{errors.decision}</p>)}
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
            onClick={() => {
            handleSave();
            }}
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
    {showModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
      <h2 className="text-xl font-semibold text-blue-600 mb-4">Approval Submitted</h2>
      <p className="text-gray-700 mb-6">Your approval has been successfully submitted.</p>
      <div className="flex justify-end">
        <button
          onClick={() => {
            setShowModal(false);
            navigate("/dashboard");
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

    </div>
);
};

export default ReviewApproval;