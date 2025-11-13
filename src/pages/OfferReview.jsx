import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BASE_URL } from "./useAuth";

const OfferLetterReviewPage = () => {
  const { id } = useParams();
  const [offerLetter, setOfferLetter] = useState({});
  const [loading, setLoading] = useState(true);
  const [showApproval, setShowApproval] = useState(false);
  const [modal, setModal] = useState({ open: false, message: "", type: "success" });
  const [permissions, setPermissions] = useState([]);

  const name = sessionStorage.getItem("empName");
  const email = sessionStorage.getItem("empEmail");
  const role = sessionStorage.getItem("role");

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
// Fetch Offer Letter
    const fetchOfferLetter = async () => {
      try {
        const res = await fetch(`${BASE_URL}/applications/${id}`);
        if (!res.ok) throw new Error("Failed to fetch offer letter");
        const data = await res.json();

        if (!data.offerLetter) {
          setModal({ open: true, message: "No offer letter found.", type: "error" });
          return;
        }

        setOfferLetter(data.offerLetter);
      } catch (err) {
        console.error("Failed to fetch offer letter:", err);
        setModal({ open: true, message: "Error fetching offer letter.", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchOfferLetter();
    fetchPermissions();
  }, [id, role]);

  // Input handling
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const val = type === "radio" ? value === "true" : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  // Validation
  const validate = () => {
    const newErrors = {};
    if (formData.decision === null) newErrors.decision = "Decision must be selected.";
    if (!formData.reason.trim()) newErrors.reason = "Reason is required.";
    if (!formData.signature.trim()) newErrors.signature = "Signature is required.";
    if (!formData.approverName.trim()) newErrors.approverName = "Approver name is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Approval/Decline
  const handleSubmit = async () => {
    if (!validate()) return;

    const action = formData.decision === true ? "approve" : "reject";
    let endpoint = "";

    if (action === "approve") {
      // map role -> endpoint
          endpoint = `${BASE_URL}/offer-letters/${offerLetter.id}/approve/${email}`;
    } else {
      endpoint = `${BASE_URL}/offer-letters/${offerLetter.id}/reject`;
    }

    try {
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, userEmail: email })
      });

      if (!res.ok) throw new Error("Action failed");

      setModal({
        open: true,
        message: `Offer letter ${action}d successfully.`,
        type: "success"
      });
    } catch (err) {
      console.error(`Failed to ${action} offer letter`, err);
      setModal({
        open: true,
        message: "An error occurred while submitting the decision.",
        type: "error"
      });
    }
  };

  const closeModal = () => {
    setModal({ open: false, message: "", type: "success" });
    if (modal.type === "success") navigate("/dashboard");
  };

  // Modal Component
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
  if (!offerLetter) return <p className="text-red-500 text-center mt-10">Offer letter not found.</p>;

// Check permissions first
  if (!permissions.includes('approve_approvals')) {
    return (
      <div className="max-w-xl mx-auto mt-20 p-6 bg-blue-100 rounded-md text-center">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">Access Denied</h2>
        <p className="text-blue-600 mb-6">
          You do not have permission to approve offers.
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
    <>
      <div className="max-w-xl mx-auto mt-6 p-6 bg-white shadow-md rounded-md">
        {!showApproval ? (
          <>
            <h3 className="font-bold text-center mb-4 text-lg">Offer Letter</h3>
            <form>
              {[
                 
                { label: "Date Created", value:  new Date(offerLetter.created).toLocaleDateString()},
                { label: "Applicant Name", value: offerLetter.candidateName },
                { label: "Position", value: offerLetter.position },
                { label: "Commencement Date", value:  new Date( offerLetter.commencementDate).toLocaleDateString()},
                { label: "End Date", value: new Date(offerLetter.endDate).toLocaleDateString()},
                { label: "Remuneration", value: offerLetter.remunerations },
                { label: "Summary", value: offerLetter.summary },
                { label: "Prepared By", value: offerLetter.empName },
                { label: "Signature", value: offerLetter.empSignature }
              ].map((item, idx) => (
                <div key={idx} className="mb-3">
                  <label className="block text-sm font-medium">{item.label}</label>
                  <input type="text" value={item.value} readOnly className="form-input w-full" />
                </div>
              ))}
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
              className={`w-full mb-1 border rounded-md p-2 text-sm text-gray-700 ${errors.reason ? "border-red-500" : "border-gray-300"}`}
              placeholder={`Please provide a detailed reason for ${formData.decision === false ? "declining" : "approving"} this request`}
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

export default OfferLetterReviewPage;

