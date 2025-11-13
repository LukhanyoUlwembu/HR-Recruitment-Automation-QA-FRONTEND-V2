import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";
import { Phone, Mail, MapPin } from "lucide-react";
import { BASE_URL } from './useAuth';

const OfferTemplate = () => {
  const { id } = useParams();
  const [offerData, setOfferData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approvalData, setApprovalData] = useState({
    candidateName: "",
    signatureDate: "",
  });
  const navigate = useNavigate();

  const [popup, setPopup] = useState({ show: false, message: "", type: "info" });

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const res = await fetch(`${BASE_URL}/applications/${id}`);
        if (!res.ok) throw new Error("Failed to fetch application data");
        const data = await res.json();
        if (!data.offerLetter) throw new Error("No offer letter found");

        setOfferData(data.offerLetter);
        setApprovalData({
          candidateName: data.offerLetter.candidateName || "",
          signatureDate:
            data.offerLetter.signatureDate?.slice(0, 10) ||
            data.offerLetter.created?.slice(0, 10) ||
            "",
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOffer();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setApprovalData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (decision) => {
    if (decision && (!approvalData.candidateName || !approvalData.signatureDate)) {
      setPopup({
        show: true,
        message: "Please fill in your signature name and date before accepting.",
        type: "error",
      });
      return;
    }

    try {
      const payload = {
        id: offerData.id,
        candidateName: offerData.candidateName,
        candidateSignature: offerData.candidateSignature,
        empName: offerData.empName,
        empSignature: offerData.empSignature,
        position: offerData.position,
        summary: offerData.summary,
        remunerations: offerData.remunerations,
        commencementDate: offerData.commencementDate,
        endDate: offerData.endDate,
        created: offerData.created,
        version:offerData.version,
        decision: decision,
      };

      const res = await fetch(`${BASE_URL}/applications/offer-letter/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to submit your response");

      setPopup({
        show: true,
        message: decision
          ? "Thank you! Your acceptance has been recorded."
          : "You have rejected the offer.",
        type: decision ? "success" : "info",
      });
    } catch (err) {
      setPopup({
        show: true,
        message: "Error submitting your response: " + err.message,
        type: "error",
      });
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;
  if (!offerData) return null;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-md rounded-xl font-sans text-gray-800 relative">
      {/* Popup Modal */}
      {popup.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm relative">
            <h3 className={`text-lg font-semibold mb-2 ${
              popup.type === 'error'
                ? 'text-red-600'
                : popup.type === 'success'
                ? 'text-green-600'
                : 'text-blue-600'
            }`}>
              {popup.type === 'error'
                ? 'Error'
                : popup.type === 'success'
                ? 'Success'
                : 'Notice'}
            </h3>
            <p className="text-gray-800 mb-4">{popup.message}</p>
            <button
              onClick={() => {
                setPopup({ show: false, message: '', type: 'info' });
                if (popup.type === 'success' || popup.type === 'info') {
                  navigate("/applications");
                }
              }}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <img src={logo} alt="Ulwembu Logo" className="h-16" />
        <div className="text-right text-sm">
          <div className="flex items-center space-x-2">
            <Phone className="w-5 h-5 text-blue-600" />
            <span>0100350028</span>
          </div>
          <div className="flex items-center space-x-2 text-blue-600">
            <Mail className="w-5 h-5" />
            <span>info@ulwembus.com</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-800">
            <MapPin className="w-5 h-5 text-blue-500" />
            <span>29 Waterford Office Park, Fourways, Johannesburg, 2191</span>
          </div>
        </div>
      </div>

      {/* Offer Content */}
      <div className="text-sm leading-relaxed">
        <p className="mb-4">
          Date Created:{" "}
          {offerData.created ? new Date(offerData.created).toLocaleDateString() : ""}
        </p>
        <h2 className="text-lg font-semibold mt-6 mb-2">
          Offer of {offerData.position}
        </h2>
        <p className="mb-4">Dear {approvalData.candidateName || "Applicant"},</p>
        <p className="mb-4">
          Ulwembu Business Services would like to offer you the position of{" "}
          {offerData.position} as you have successfully completed our interview
          selection process.
        </p>
        <p className="mb-4">
          Please note that this offer is subject to the positive outcome of
          background checks which include criminal record checks, credit record
          checks, and previous employment references conducted as per Ulwembu's
          vetting procedure.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <strong>Commencement date:</strong>
            <p>
              {offerData.commencementDate
                ? new Date(offerData.commencementDate).toLocaleDateString()
                : ""}
            </p>
          </div>
          <div>
            <strong>End date:</strong>
            <p>
              {offerData.endDate
                ? new Date(offerData.endDate).toLocaleDateString()
                : ""}
            </p>
          </div>
          <div>
            <strong>Remunerations:</strong>
            <p>{offerData.remunerations}</p>
          </div>
        </div>

        {/* Acceptance Form */}
        <div className="mt-8 border-t border-gray-300 pt-4">
          <p className="font-semibold mb-2">Acceptance of Offer</p>

          <label htmlFor="candidateName" className="block font-medium mb-1">
            Signature
          </label>
          <input
            type="text"
            id="candidateName"
            name="candidateName"
            value={approvalData.candidateName}
            onChange={handleChange}
            className="w-full mb-4 p-2 border rounded"
            placeholder="Enter your full name"
          />

          <label htmlFor="signatureDate" className="block font-medium mb-1">
            Date
          </label>
          <input
            type="date"
            id="signatureDate"
            name="signatureDate"
            value={approvalData.signatureDate}
            onChange={handleChange}
            className="w-full mb-6 p-2 border rounded"
          />

          <div className="flex space-x-4">
            <button
              onClick={() => handleSubmit(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Accept Offer
            </button>
            <button
              onClick={() => handleSubmit(false)}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Reject Offer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferTemplate;
