import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { BASE_URL } from "./useAuth";

const OfferLetter = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const name = sessionStorage.getItem("empName");
  const email = sessionStorage.getItem("empEmail");
  const role = sessionStorage.getItem("role");

  const [formData, setFormData] = useState({
    created: "",
    position: "",
    candidateName: "",
    commencementDate: "",
    endDate: "",
    summary: "",
    remunerations: "",
    empSignature: email,
    empName: name,
  });

  const [errors, setErrors] = useState({});
  const [offerExists, setOfferExists] = useState(false);
  const [popup, setPopup] = useState({ show: false, message: "", type: "info" });
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await fetch(`${BASE_URL}/permissions/${role}/roles`, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          const permissionNames = data.map((p) => p.name);
          setPermissions(permissionNames);
        } else {
          console.error("Failed to fetch permissions:", response.status);
        }
      } catch (err) {
        console.error("Error fetching permissions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [role]);

  // Fetch application data only after permissions load
  useEffect(() => {
    if (loading) return; // wait until permissions are fetched
                 
    if (!permissions.includes("create_offer")) {
      setPopup({
        show: true,
        message: "You do not have permission to  create offer letters.",
        type: "error",
      });
      return;
    }

    const fetchApplication = async () => {
      try {
        const res = await fetch(`${BASE_URL}/applications/${id}`);
        if (!res.ok) throw new Error("Failed to fetch application.");
        const data = await res.json();
        const rem = data.remForm;

        if (!rem || rem.status.name !== "APPROVED") {
          setPopup({
            show: true,
            message: "REM Form is missing or not approved.",
            type: "error",
          });
          return;
        }

        const offer = data.offerLetter;
        if (offer?.id) {
          setOfferExists(true);
        }

        setFormData({
          created: new Date().toISOString().slice(0, 10),
          position: rem.position || "",
          candidateName: rem.name || "",
          commencementDate: rem.commencementDate?.slice(0, 10) || "",
          endDate: offer?.date?.slice(0, 10) || "",
          summary: rem.description || "",
          remunerations: rem.proposedSalary || "",
          empSignature: email,
          empName: name,
        });
      } catch (err) {
        console.error(err);
        setPopup({
          show: true,
          message: "Error loading application.",
          type: "error",
        });
      }
    };

    fetchApplication();
  }, [loading, permissions, id, email, name]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.created) newErrors.created = "Date Created is required";
    if (!formData.position) newErrors.position = "Position is required";
    if (!formData.candidateName) newErrors.candidateName = "Applicant name is required";
    if (!formData.commencementDate) newErrors.commencementDate = "Commence date is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";
    if (!formData.summary) newErrors.summary = "Summary is required";
    if (!formData.remunerations) newErrors.remunerations = "Remuneration is required";
    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/applications/offer-letter/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Submission failed");
      setPopup({
        show: true,
        message: "Offer Letter Created",
        type: "success",
      });
    } catch (err) {
      console.error(err);
      setPopup({
        show: true,
        message: "Error submitting offer",
        type: "error",
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto mt-20 p-6 bg-gray-100 rounded-md text-center">
        <h2 className="text-xl font-bold text-gray-700 mb-4">Loading...</h2>
        <p className="text-gray-600">Checking permissions...</p>
      </div>
    );
  }
     
  if (
    popup.show &&
    popup.type === "error" &&
    !permissions.includes("view_offer_letters") &&
    !permissions.includes("create_offer_letters")
  ) {
    return (
      <div className="max-w-xl mx-auto mt-20 p-6 bg-blue-100 rounded-md text-center">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">Access Denied</h2>
        <p className="text-blue-600 mb-6">{popup.message}</p>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow-md relative">
      {/* Popup Modal */}
      {popup.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm relative">
            <h3
              className={`text-lg font-semibold mb-2 ${
                popup.type === "error"
                  ? "text-red-600"
                  : popup.type === "success"
                  ? "text-green-600"
                  : "text-blue-600"
              }`}
            >
              {popup.type === "error"
                ? "Error"
                : popup.type === "success"
                ? "Success"
                : "Notice"}
            </h3>
            <p className="text-gray-800 mb-4">{popup.message}</p>
            <button
              onClick={() => {
                setPopup({ show: false, message: "", type: "info" });
                if (popup.type === "success") navigate("/dashboard");
              }}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              OK
            </button>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-semibold text-center mb-6">Create Offer Letter</h2>

      <label className="block text-sm text-gray-700 mb-1">Date Created</label>
      <input
        type="date"
        name="created"
        value={formData.created}
        onChange={handleChange}
        className="w-full mb-4 p-2 border rounded"
      />
      {errors.created && (
        <p className="text-red-500 text-sm -mt-3 mb-3">{errors.created}</p>
      )}

      <label className="block text-sm text-gray-700 mb-1">Position</label>
      <input
        type="text"
        name="position"
        value={formData.position}
        onChange={handleChange}
        className="w-full mb-4 p-2 border rounded"
      />
      {errors.position && (
        <p className="text-red-500 text-sm -mt-3 mb-3">{errors.position}</p>
      )}

      <label className="block text-sm text-gray-700 mb-1">Applicant Name</label>
      <input
        type="text"
        name="candidateName"
        value={formData.candidateName}
        onChange={handleChange}
        className="w-full mb-4 p-2 border rounded"
      />
      {errors.candidateName && (
        <p className="text-red-500 text-sm -mt-3 mb-3">{errors.candidateName}</p>
      )}

      <label className="block text-sm text-gray-700 mb-1">Commence Date</label>
      <input
        type="date"
        name="commencementDate"
        value={formData.commencementDate}
        onChange={handleChange}
        className="w-full mb-4 p-2 border rounded"
      />
      {errors.commencementDate && (
        <p className="text-red-500 text-sm -mt-3 mb-3">{errors.commencementDate}</p>
      )}

      <label className="block text-sm text-gray-700 mb-1">End Date</label>
      <input
        type="date"
        name="endDate"
        value={formData.endDate}
        onChange={handleChange}
        className="w-full mb-4 p-2 border rounded"
      />
      {errors.endDate && (
        <p className="text-red-500 text-sm -mt-3 mb-3">{errors.endDate}</p>
      )}

      <label className="block text-sm text-gray-700 mb-1">Summary</label>
      <textarea
        name="summary"
        rows={4}
        value={formData.summary}
        onChange={handleChange}
        className="w-full mb-4 p-2 border rounded"
      />
      {errors.summary && (
        <p className="text-red-500 text-sm -mt-3 mb-3">{errors.summary}</p>
      )}

      <label className="block text-sm text-gray-700 mb-1">Remunerations</label>
      <input
        type="text"
        name="remunerations"
        value={formData.remunerations}
        onChange={handleChange}
        className="w-full mb-6 p-2 border rounded"
      />
      {errors.remunerations && (
        <p className="text-red-500 text-sm -mt-5 mb-6">{errors.remunerations}</p>
      )}

      <div className="flex justify-between">
        <Link to="/dashboard">
          <button className="px-4 py-2 border rounded text-gray-600">Cancel</button>
        </Link>
        <button
          onClick={handleSubmit}
          className={`px-6 py-2 rounded text-white ${
            offerExists ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
          disabled={offerExists}
        >
          {offerExists ? "Offer Already Created" : "Submit Offer"}
        </button>
      </div>
    </div>
  );
};

export default OfferLetter;
