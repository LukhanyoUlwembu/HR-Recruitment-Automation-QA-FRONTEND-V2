import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BASE_URL } from './useAuth';
const RemReviewPage = () => {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const name = sessionStorage.getItem("empName");
  const email = sessionStorage.getItem("empEmail");
  const [showApproval, setShowApproval] = useState(false);
  const [modal, setModal] = useState({ open: false, message: "", type: "success" });


  const [formData, setFormData] = useState({
    decision: null,
    reason: "",
    approvalDate: new Date().toISOString().split("T")[0],
    signature: email || "",
    approverName: name || ""
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await fetch(`${BASE_URL}/rem-forms/${id}`);
        if (!res.ok) throw new Error("Failed to fetch REM form");
        const data = await res.json();
        setForm(data);
      } catch (err) {
        console.error("Failed to fetch REM form:", err);
        setModal({ open: true, message: "Error fetching form.", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const val = type === "radio" ? value === "true" : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const validate = () => {
    const newErrors = {};
    if (formData.decision === null) newErrors.decision = "Decision must be selected.";
    if (!formData.reason.trim()) newErrors.reason = "Reason is required.";
    if (!formData.signature.trim()) newErrors.signature = "Signature is required.";
    if (!formData.approverName.trim()) newErrors.approverName = "Approver name is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async () => {
  if (!validate()) return;

  const action = formData.decision === true ? "approve" : "reject";
  const userEmail = sessionStorage.getItem("empEmail"); // current logged-in user

  let endpoint = "";
  if (action === "approve") {
    switch (sessionStorage.getItem("role")) { // userRole from sessionStorage
      case "Line Manager":
        endpoint = `${BASE_URL}/rem-forms/${id}/approve-manager`;
        break;
      case "HR Executive":
        endpoint = `${BASE_URL}/rem-forms/${id}/approve-hr`;
        break;
      case "CFO":
        endpoint = `${BASE_URL}/rem-forms/${id}/approve-cfo`;
        break;
      default:
        console.error("Unknown user role for approval");
        return;
    }
  } else {
    endpoint = `${BASE_URL}/rem-forms/${id}/reject`;
  }

  try {
    const res = await fetch(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, userEmail }) // send email
    });

    if (!res.ok) throw new Error("Action failed");

    setModal({
      open: true,
      message: `REM form ${action}d successfully.`,
      type: "success"
    });
  } catch (err) {
    console.error(`Failed to ${action} REM form`, err);
    setModal({
      open: true,
      message: "An error occurred while submitting the form.",
      type: "error"
    });
  }
};





  const closeModal = () => {
    setModal({ open: false, message: "", type: "success" });
    if (modal.type === "success") navigate("/dashboard");
  };

  // --- Modal component
  const Modal = ({ message, type }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
        <h2 className={`text-lg font-semibold mb-2 ${type === "success" ? "text-green-600" : "text-red-600"}`}>
          {type === "success" ? "Success" : "Error"}
        </h2>
        <p className="text-sm text-gray-700 mb-4">{message}</p>
        <button
          onClick={closeModal}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          OK
        </button>
      </div>
    </div>
  );

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!form) return <p className="text-red-500 text-center mt-10">Form not found.</p>;

  return (
    <>
    <div className="max-w-xl mx-auto mt-6 p-6 bg-white shadow-md rounded-md">
      {!showApproval ? (
        <>
          <h3 className="font-bold text-center mb-4 text-lg">Remuneration Form</h3>
          <form>
            {[ 
              { label: "Date Created", value: new Date(form.date).toLocaleDateString("en-GB") },
              { label: "Name", value: form.name },
              { label: "Position", value: form.position },
              { label: "Commencement Date", value: new Date(form.commencementDate).toLocaleDateString("en-GB") },
              { label: "Proposed Salary", value: form.proposedSalary },
              { label: "Billing Rate", value: form.billingRate },
              { label: "Client Name", value: form.clientName },
              { label: "Recommended By", value: form.recommendedBy },
              { label: "HR Comment", value: form.hrComment }
            ].map((item, idx) => (
              <div key={idx} className="mb-3">
                <label className="block text-sm font-medium">{item.label}</label>
                <input type="text" value={item.value} readOnly className="form-input" />
              </div>
            ))}
            <div className="mb-3">
              <label className="block text-sm font-medium">Description</label>
              <textarea value={form.description} readOnly className="form-input" />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowApproval(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                Approve
              </button>
            </div>
          </form>
        </>
      ) : (
        <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-md mt-8">
          {/* Approver Name */}
          <label className="block text-sm font-medium text-gray-700 mb-1">Approver Name</label>
          <input
            type="text"
            name="approverName"
            value={formData.approverName}
            onChange={handleChange}
            className="w-full mb-4 border border-gray-300 rounded-md p-2 text-sm"
          />
          {errors.approverName && <p className="text-red-500 text-xs mb-2">{errors.approverName}</p>}

          {/* Decision */}
          <label className="block text-sm font-medium text-gray-700 mb-1">Decision</label>
          <div className="flex gap-6 mb-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="decision"
                value="true"
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
                value="false"
                checked={formData.decision === false}
                onChange={handleChange}
                className="form-radio text-red-600"
              />
              <span className="ml-2 font-medium">Decline</span>
            </label>
          </div>
          {errors.decision && <p className="text-red-500 text-xs mb-3">{errors.decision}</p>}

          {/* Reason */}
          <label className="block text-sm font-medium mb-1 text-gray-700">Reason for decision</label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            rows={4}
            className={`w-full mb-1 border rounded-md p-2 text-sm text-gray-700 ${errors.reason ? 'border-red-500' : 'border-gray-300'}`}
            placeholder={`Please provide a detailed reason for ${formData.decision === false ? 'declining' : 'approving'} this request`}
            required
          />
          {errors.reason && <p className="text-red-500 text-xs mb-3">{errors.reason}</p>}

          {/* Approval Date & Signature */}
          <div className="flex justify-between gap-4 mb-6">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Approval Date</label>
              <input
                type="date"
                name="approvalDate"
                value={formData.approvalDate}
                onChange={handleChange}
                className="w-full text-sm bg-transparent border-b border-gray-300 pb-1"
              />
            </div>

            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Signature</label>
              <input
                type="text"
                name="signature"
                value={formData.signature}
                onChange={handleChange}
                className="w-full text-sm bg-transparent border-b border-gray-300 pb-1"
              />
              {errors.signature && <p className="text-red-500 text-xs">{errors.signature}</p>}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-4 justify-end mt-6">
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
            >
              Submit
            </button>
            <button
              type="button"
              onClick={() => setShowApproval(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
    {modal.open && <Modal message={modal.message} type={modal.type} />}
    </>
  );
};

export default RemReviewPage;

