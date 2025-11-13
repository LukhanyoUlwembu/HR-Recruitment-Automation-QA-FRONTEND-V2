import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "./useAuth";

const RecruiterNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const email = sessionStorage.getItem("empEmail");
  const [employee, setEmployee] = useState({});

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const response = await fetch(`${BASE_URL}/employees/${email}`);
        if (!response.ok) throw new Error("Failed to fetch employee");
        const data = await response.json();
        if (!data) return;
        setEmployee(data);
      } catch (err) {
        console.error("Error fetching employee:", err);
      }
    };

    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${BASE_URL}/applications`);
        if (!res.ok) throw new Error("Failed to fetch notifications");

        const data = await res.json();

        // keep only relevant notifications
        const filtered = data.filter((app) => {
          const createOfferLetter =
            app.remForm?.status.name === "APPROVED" && !app.offerLetter;

          const managerApproval =
            app.offerLetter &&
            app.offerLetter.status.name === "MANAGER_APPROVAL_PENDING";

          const hrApproval =
            app.offerLetter &&
            app.offerLetter.status.name === "HR_APPROVAL_PENDING";

          const adminApproval =
            app.offerLetter &&
            app.offerLetter.status.name === "CFO_APPROVAL_PENDING";

          // 🔑 filter by role
          if (createOfferLetter) return true;
          if (managerApproval && employee.role?.name === "Line Manager") return true;
          if (hrApproval && employee.role?.name === "HR Executive") return true;
          if (adminApproval && employee.role?.name === "CFO") return true;

          return false;
        });

        setNotifications(filtered);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    // fetch employee first, then notifications
    fetchEmployee().then(fetchNotifications);
  }, [email, employee.role?.name]);

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-white shadow-md rounded-md">
      <h2 className="text-xl font-bold mb-6">Recruiter Notifications</h2>

      {loading ? (
        <p className="text-gray-600 text-center">Loading...</p>
      ) : notifications.length === 0 ? (
        <p className="text-gray-500 text-center">No new notifications.</p>
      ) : (
        <div className="space-y-4">
          {notifications.map((app) => {
            const createOfferLetter =
              app.remForm?.status.name === "APPROVED" && !app.offerLetter;
            const managerApproval =
              app.offerLetter &&
              app.offerLetter.status.name === "MANAGER_APPROVAL_PENDING";
            const hrApproval =
              app.offerLetter &&
              app.offerLetter.status.name === "HR_APPROVAL_PENDING";
            const adminApproval =
              app.offerLetter &&
              app.offerLetter.status.name === "CFO_APPROVAL_PENDING";

            const applicantName = `${app.applicant?.name || ""} ${
              app.applicant?.surname || ""
            }`.trim();

            let message = "";
            if (createOfferLetter) message = "ready to be created";
            else if (managerApproval) message = "waiting for your approval (Line Manager)";
            else if (hrApproval) message = "waiting for your approval (HR)";
            else if (adminApproval) message = "waiting for your approval (CFO)";

            let statusText = createOfferLetter
              ? `REM Form Status: ${app.remForm?.status.name}`
              : `Offer Letter Status: ${app.offerLetter?.status.name}`;

            return (
              <div
                key={app.jobAppliedId}
                className="flex items-start p-4 rounded-md border bg-gray-50 hover:bg-gray-100 transition"
              >
                {/* Avatar */}
                <div className="flex items-center justify-center bg-gray-300 rounded-full h-10 w-10 text-white font-bold mr-4">
                  {applicantName.charAt(0).toUpperCase() || "A"}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <p className="text-sm text-gray-800">
                    Offer letter for <strong>{applicantName || "Applicant"}</strong> is {message}.
                  </p>
                  <div className="text-xs text-gray-500 mt-1">{statusText}</div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col ml-3 mt-2 gap-2">
                  {createOfferLetter && (
                    <button
                      onClick={() => navigate(`/offer-letter/${app.jobAppliedId}`)}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                    >
                      Create Offer
                    </button>
                  )}
                  {(managerApproval || hrApproval || adminApproval) && (
                    <button
                      onClick={() => navigate(`/offer-approve/${app.jobAppliedId}`)}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                    >
                      Approve Offer
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecruiterNotifications;
