import React, { useEffect, useState } from "react";
import { MapPin, Briefcase, Clock, Share2 } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { BASE_URL } from "./useAuth";

const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [jobDetails, setJobDetails] = useState({});
  const [applicants, setApplicants] = useState([]);
  const [selectedApplicants, setSelectedApplicants] = useState(new Set());
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLonglistStage, setIsLonglistStage] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const role = sessionStorage.getItem("role") || "guest";
  const FRONTEND_URL = window.location.origin; // dynamically uses current domain

  // === Fetch Permissions ===
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const res = await fetch(`${BASE_URL}/permissions/${role}/roles`);
        if (!res.ok) throw new Error("Failed to fetch permissions");
        const data = await res.json();
        setPermissions(data || []);
      } catch (err) {
        console.error("Permissions error:", err);
        showPopupMessage("Failed to fetch permissions.");
      } finally {
        setLoading(false);
      }
    };
    fetchPermissions();
  }, [role]);

  // === Fetch job + applicants + stages ===
  const fetchApplicantsAndJob = async () => {
    setLoading(true);
    try {
      const [jobRes, applicantsRes, stagesRes] = await Promise.all([
        fetch(`${BASE_URL}/postings/${id}`),
        fetch(`${BASE_URL}/applications/by-job-posting/${id}`),
        fetch(`${BASE_URL}/dropdown/job-statuses`)
      ]);

      if (!jobRes.ok || !applicantsRes.ok || !stagesRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const jobData = await jobRes.json();
      const applicantsData = await applicantsRes.json();
      const stages = await stagesRes.json();

      setJobDetails(jobData);

      const sortedStages = [...stages].sort((a, b) => a.orderIndex - b.orderIndex);
      const hasLonglist = applicantsData.some(app => app.status?.name === "Longlist");
      setIsLonglistStage(hasLonglist);

      let filteredApplicants;
      if (hasLonglist) {
        filteredApplicants = applicantsData.filter(app => app.status?.name === "Longlist");
      } else {
        const stageIndexes = applicantsData.map(app => {
          const idx = sortedStages.findIndex(stage => stage.name === app.status?.name);
          return idx === -1 ? Infinity : idx;
        });
        const lowestIndex = Math.min(...stageIndexes);
        filteredApplicants = applicantsData.filter(app => {
          const idx = sortedStages.findIndex(stage => stage.name === app.status?.name);
          return idx === lowestIndex;
        });
      }

      setApplicants(filteredApplicants);
    } catch (err) {
      console.error(err);
      showPopupMessage(err.message || "Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicantsAndJob();
  }, [id]);

  // === Helper: show popup ===
  const showPopupMessage = (message) => {
    setPopupMessage(message);
    setShowPopup(true);
  };

  // === Move to shortlist ===
  const moveToShortlist = async (application) => {
    const hasPermission = permissions.some(p => p.name === "create_shortlist");
    if (!hasPermission) {
      showPopupMessage("You don't have permission to move applicants to shortlist.");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/applications/move-to-shortlist`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(application),
      });

      if (!res.ok) throw new Error("Failed to move to shortlist");
      showPopupMessage("Applicant successfully moved to shortlist.");
      await fetchApplicantsAndJob();
    } catch (error) {
      showPopupMessage(error.message);
    }
  };

  // === Handle share links ===
  const handleShare = (platform) => {
    const shareUrl = `${FRONTEND_URL}/job/${id}`;
    let url = "";
    if (platform === "linkedin") {
      url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    } else if (platform === "facebook") {
      url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // === Handle actions ===
  const handleActionChange = (e, application) => {
    const value = e.target.value;
    if (value === "moveToShortlist") {
      moveToShortlist(application);
      e.target.value = "";
    } else if (value) {
      navigate(value);
    }
  };

  // === Checkbox selection ===
  const toggleApplicantSelection = (jobAppliedId) => {
    setSelectedApplicants(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobAppliedId)) newSet.delete(jobAppliedId);
      else newSet.add(jobAppliedId);
      return newSet;
    });
  };

  // === Loading state ===
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <svg
          className="animate-spin h-10 w-10 text-blue-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
      </div>
    );
  }

  // === UI ===
  return (
    <div className="bg-white p-8 rounded-md shadow-2xl">
      {/* Job Info */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {jobDetails?.jobTitle || "Loading..."}
          </h1>
          <div className="flex mt-2 items-center space-x-4 text-gray-700">
            <div className="flex items-center space-x-1">
              <MapPin className="w-5 h-5" />
              <p>
                {jobDetails?.location?.city},{" "}
                {jobDetails?.location?.province?.name?.replace(/_/g, " ") || ""}
              </p>
            </div>
            <div className="flex items-center space-x-1">
              <Briefcase className="w-5 h-5" />
              <p>{jobDetails?.type || "N/A"}</p>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-5 h-5" />
              <p>
                {jobDetails?.jobDeadline
                  ? new Date(jobDetails.jobDeadline).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={() => handleShare("linkedin")}
            className="bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-800 transition"
          >
            <Share2 className="w-4 h-4" />
            <span>LinkedIn</span>
          </button>
          <button
            onClick={() => handleShare("facebook")}
            className="bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition"
          >
            <Share2 className="w-4 h-4" />
            <span>Facebook</span>
          </button>
        </div>
      </div>

      {/* Applicants Table */}
      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full border text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-2">
                <input
                  type="checkbox"
                  checked={applicants.length > 0 && selectedApplicants.size === applicants.length}
                  onChange={(e) =>
                    e.target.checked
                      ? setSelectedApplicants(new Set(applicants.map(a => a.jobAppliedId)))
                      : setSelectedApplicants(new Set())
                  }
                />
              </th>
              <th className="p-2">Applicant</th>
              <th className="p-2">Score</th>
              <th className="p-2">Date Applied</th>
              <th className="p-2">Status</th>
              <th className="p-2">Email</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applicants.length > 0 ? (
              applicants.map((application, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={selectedApplicants.has(application.jobAppliedId)}
                      onChange={() => toggleApplicantSelection(application.jobAppliedId)}
                    />
                  </td>
                  <td className="p-2">
                    {application.applicant?.name} {application.applicant?.surname}
                  </td>
                  <td className="p-2">{application.score || "N/A"}</td>
                  <td className="p-2">
                    {application.created
                      ? new Date(application.created).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="p-2">{application.status?.name || "Pending"}</td>
                  <td className="p-2">{application.applicant?.email}</td>
                  <td className="p-2">
                    <select
                      className="bg-cyan-600 text-white px-2 py-1 rounded-md hover:bg-cyan-700"
                      onChange={(e) => handleActionChange(e, application)}
                      defaultValue=""
                    >
                      <option value="">Select</option>
                      <option
                        value={`/Applicantprofile/${application.applicant?.applicantId}/${application.jobAppliedId}`}
                      >
                        View Profile
                      </option>
                      {isLonglistStage && (
                        <option value="moveToShortlist">Move to Shortlist</option>
                      )}
                      {application.status?.name === "Shortlist" && (
                        <option
                          value={`/schedule/${application.applicant?.applicantId}/${application.jobAppliedId}`}
                        >
                          Schedule Interview
                        </option>
                      )}
                      {application.status?.name === "Offer" && (
                        <option
                          value={`/create-offer/${application.applicant?.applicantId}/${application.jobPosting?.jobPostingId}`}
                        >
                          Create Offer
                        </option>
                      )}
                      {application.status?.name === "Onboarding" &&
                        application.onboarding && (
                          <option value={`/onboarding/${application.onboarding.id}`}>
                            Start Onboarding
                          </option>
                        )}
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center p-4 text-gray-500">
                  No applications found or still loading...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Popup modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-80 text-center relative">
            <button
              className="absolute top-2 right-3 text-gray-400 hover:text-red-600 text-xl"
              onClick={() => setShowPopup(false)}
            >
              &times;
            </button>
            <p className="text-gray-800 text-lg">{popupMessage}</p>
            <button
              onClick={() => setShowPopup(false)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetailsPage;
