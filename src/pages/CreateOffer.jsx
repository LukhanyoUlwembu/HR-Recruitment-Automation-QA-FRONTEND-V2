import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BASE_URL } from './useAuth';

  const CreateRemForm = () => {
  const { idApplicant, id } = useParams();
  const [isRemFormExisting, setIsRemFormExisting] = useState(false);

  const role = sessionStorage.getItem("role");
  const [permissions, setPermissions] = useState([]);
  const navigate = useNavigate();

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    id: "",
    date: getCurrentDate(),
    name: "",
    position: "",
    commencementDate: "",
    previousSalary: "",
    proposedSalary: "",
    billingRate: "",
    clientName: "",
    description: "",
    recommendedBy: "",
    hrComment: "",
  });
const [popup, setPopup] = useState({
    show: false,
    message: "",
    type: "success",
  });

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
      } else {
        console.error("Failed to fetch permissions:", response.status);
      }
    } catch (err) {
      console.error("Error fetching permissions:", err);
    } 
  };


  const fetchJobs = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/applications/get-by-applicant-job/${idApplicant}/${id}`
      );
      if (!response.ok) throw new Error("Reload Page");
      const data = await response.json();
      if (data.remForm) {
        setIsRemFormExisting(true);
      }
      if (data.remForm && data.remForm.status.name === "APPROVED") {
        navigate(`/offer-letter/${data.jobAppliedId}`);
        return;
      }

      setFormData((prev) => ({
        ...prev,
        id: `${data.jobAppliedId}`,
        name: `${data.applicant.name} ${data.applicant.surname}`,
        position: data.jobPosting?.jobTitle || "",
        proposedSalary: data.jobPosting?.approval?.jobRequisition?.salary || "",
        billingRate: data.jobPosting?.approval?.jobRequisition?.billingRate || "",
        clientName: data.jobPosting?.approval?.jobRequisition?.client || "",
        commencementDate:
          data.jobPosting?.approval?.jobRequisition?.expectedStartDate?.slice(0, 10) || "",
        recommendedBy: data.jobPosting?.approval?.jobRequisition?.lineManager || "",
      }));
    } catch (err) {
      console.error("Error fetching job/application info:", err.message);
    }
  };

  fetchJobs();
  fetchPermissions();
}, [idApplicant, id, navigate, role]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // eslint-disable-next-line no-unused-vars
      const { id, ...formWithoutId } = formData;
      const response = await fetch(`${BASE_URL}/rem-forms/${formData.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formWithoutId),
      });

      if (!response.ok) throw new Error("Failed to submit REM form");

      setPopup({ show: true, message: "REM Form submitted successfully", type: "success" });
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
    console.error("Error submitting REM form:", error);
      setPopup({ show: true, message: "Submission failed", type: "error" });
    }
  };
  const closePopup = () => {
    setPopup({ ...popup, show: false });
  };

 
// Check permissions first
  if (!permissions.includes('create_rem_form')) {
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
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">
        REMUNERATION APPROVAL COMMITTEE FORM
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">Date Created</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">Applicant Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">Position</label>
          <input
            type="text"
            name="position"
            value={formData.position}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">Commencement Date</label>
          <input
            type="date"
            name="commencementDate"
            value={formData.commencementDate}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">Proposed Salary</label>
          <input
            type="text"
            name="proposedSalary"
            value={formData.proposedSalary}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">Billing Client Rate</label>
          <input
            type="text"
            name="billingRate"
            value={formData.billingRate}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">Client Name</label>
          <input
            type="text"
            name="clientName"
            value={formData.clientName}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">Candidate Experience Summary</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">Recommended By</label>
          <input
            type="text"
            name="recommendedBy"
            value={formData.recommendedBy}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">HR Comments</label>
          <textarea
            name="hrComment"
            value={formData.hrComment}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <button
  type="submit"
  disabled={isRemFormExisting}
  className={`px-4 py-2 rounded ${
    isRemFormExisting
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-blue-600 text-white hover:bg-blue-700"
  }`}
>
  {isRemFormExisting ? "REM Form Already Exists" : "Submit"}
</button>

      </form>
       {/* Popup Modal */}
      {popup.show && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
            <h3
              className={`text-lg font-semibold mb-4 ${
                popup.type === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              {popup.type === "success" ? "Success" : "Error"}
            </h3>
            <p className="mb-4">{popup.message}</p>
            <button
              onClick={closePopup}
              className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateRemForm;
