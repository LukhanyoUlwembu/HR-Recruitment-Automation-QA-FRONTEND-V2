import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { Link } from "react-router-dom";
import { BASE_URL } from './useAuth';
const Notifications = () => {
  const [selectedTab, setSelectedTab] = useState("notification");
  const applicantId = sessionStorage.getItem("userId");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ keyword: "", location: "", title: "" });
  const [profile, setProfile] = useState({});
  const [previousStatuses, setPreviousStatuses] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [jobAlerts, setJobAlerts] = useState([]);
  const [allJobs, setAllJobs] = useState([]);

  useEffect(() => {
    const fetchApplicant = async () => {
      try {
        const res = await fetch(`${BASE_URL}/applicants/${applicantId}`);
        if (!res.ok) throw new Error("Reload Page");
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchApplications = async () => {
      try {
        const res = await fetch(`${BASE_URL}/applications/by-applicant/${applicantId}`);
        if (!res.ok) throw new Error("Failed to fetch applications");
        const data = await res.json();

        const applicantApps = data.filter(app => app.applicant.applicantId.toString() === applicantId);
        const statusChanges = [];
        const newStatuses = {};

        applicantApps.forEach(app => {
          newStatuses[app.jobAppliedId] = app.status;
          if (previousStatuses[app.jobAppliedId] && previousStatuses[app.jobAppliedId] !== app.status) {
            statusChanges.push(`Your application for ${app.jobPosting.jobTitle} has moved to '${app.status.name}'`);
          }
        });

        setNotifications(statusChanges);
        setPreviousStatuses(newStatuses);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchJobs = async () => {
      try {
        const res = await fetch(`${BASE_URL}/postings`);
        if (!res.ok) throw new Error("Failed to fetch jobs");
        const data = await res.json();
        setAllJobs(data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchJobAlerts = async () => {
      try {
        const res = await fetch(`${BASE_URL}/jobAlerts/applicant/${applicantId}`);
        if (!res.ok) throw new Error("Failed to fetch job alerts");
        const data = await res.json();
        setJobAlerts(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchApplicant();
    fetchApplications();
    fetchJobs();
    fetchJobAlerts();
  }, [applicantId, previousStatuses]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${BASE_URL}/jobAlerts/${applicantId}`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData })
      });
      if (!res.ok) throw new Error("Failed to save alert");
      setFormData({ keyword: "", location: "", title: "" });
      setShowModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const initials = (profile.name ? profile.name[0] : '') + (profile.surname ? profile.surname[0] : '');

const matchedAlerts = jobAlerts.flatMap(alert =>
  allJobs.filter(job =>
    (job.jobTitle?.toLowerCase() || '').includes((alert.title?.toLowerCase() || ''))
    &&(
      job.location?.province.toLowerCase() || '').includes((alert.location?.toLowerCase() || '')
    )
  )
);

  return (
    <div className="p-2 p-8 rounded-md shadow-2xl">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl font-bold">
          {initials}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{profile.name} {profile.surname}</h1>
          <div className="flex items-center text-gray-600 text-sm mt-1">
            <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4 mr-2" />
            {profile.email}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-start min-h-screen bg-white p-4">
        <h1 className="text-2xl font-bold mb-6">Notifications</h1>
        <div className="flex space-x-4 mb-6">
          <button
            className={`px-4 py-2 rounded ${selectedTab === "notification" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
            onClick={() => setSelectedTab("notification")}
          >Notification</button>
          <button
            className={`px-4 py-2 rounded ${selectedTab === "job" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
            onClick={() => setSelectedTab("job")}
          >Job Alerts</button>
        </div>

        {selectedTab === "notification" && (
          <div className="w-full max-w-2xl bg-gray-50 border rounded p-4 text-gray-700">
            {notifications.length === 0 ? (
              <div className="text-gray-400 text-center">You have no new notifications</div>
            ) : (
              notifications.map((note, index) => (
                <div key={index} className="mb-2">{note}</div>
              ))
            )}
          </div>
        )}

        {selectedTab === "job" && (
          <div className="w-full max-w-4xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Manage Job Alerts</h2>
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded flex items-center space-x-2"
              >
                <span className="text-lg font-semibold">＋</span>
                <span>Create Job Alert</span>
              </button>
            </div>
            <div className="border rounded overflow-hidden">
              <table className="w-full text-left">
                <thead className="border-b">
                  <tr>
                    <th className="px-4 py-2 font-semibold">Job Title</th>
                    <th className="px-4 py-2 font-semibold">Location</th>
                    <th className="px-4 py-2 font-semibold">Date Posted</th>
                  </tr>
                </thead>
                <tbody>
                  {matchedAlerts.map((job, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-2"><Link to={`/details/${job.jobPostingId}`}> {job.jobTitle}</Link></td>
                      <td className="px-4 py-2">{job.location.province.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-2">{new Date(job.created).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedTab === "none" && (
          <div className="text-gray-400 text-center">
            Your notifications will appear here
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Job Alert</h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block font-medium text-sm mb-1">Job Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block font-medium text-sm mb-1">Key Word</label>
                <input type="text" name="keyword" value={formData.keyword} onChange={handleInputChange} className="w-full border rounded px-3 py-2" required />
              </div>
              <div>
                <label className="block font-medium text-sm mb-1">Location</label>
                <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="w-full border rounded px-3 py-2" required />
              </div>
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Alert</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
