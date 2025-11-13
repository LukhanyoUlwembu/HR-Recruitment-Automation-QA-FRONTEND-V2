import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "./useAuth";

const ApprovalsDashboard = () => {
  const [jobRequisitions, setJobRequisitions] = useState([]);
  const [remForms, setRemForms] = useState([]);
  const navigate = useNavigate();
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const role = sessionStorage.getItem("role");

  useEffect(() => {
    fetchApprovals();
    fetchPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  // Fetch permissions function (now not based on role)
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

  const fetchApprovals = async () => {
    try {
      const [resJob, resRem] = await Promise.all([
        fetch(`${BASE_URL}/job-requisitions`),
        fetch(`${BASE_URL}/rem-forms`),
      ]);

      if (!resJob.ok || !resRem.ok) throw new Error("Failed to fetch data");

      const jobData = await resJob.json();
      const remData = await resRem.json();

      setJobRequisitions(jobData.filter((job) => job.active === true));
      const roleStageMap = {
        Line_Manager: "MANAGER_APPROVAL_PENDING",
        Human_Resource: "HR_APPROVAL_PENDING",
        CFO: "CFO_APPROVAL_PENDING",
        Admin: null 
      };

      const currentStage = roleStageMap[role];

      const filteredRemForms = remData.filter(form => {
        if (role === "Admin" || role === "Line Manager" || role === "CFO"|| role === "HR Executive") return true;
        return form.status.name === currentStage;
      });

      setRemForms(filteredRemForms.filter((form) => form.status.name != "APPROVED" && form.status.name != "REJECTED"));
    } catch (error) {
      console.error("Error fetching data:", error);
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
    !(
      permissions.includes("view_approvals") 
    )
  ) {
    return (
      <div className="max-w-xl mx-auto mt-20 p-6 bg-blue-100 rounded-md text-center">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">Access Denied</h2>
        <p className="text-blue-600 mb-6">
          You do not have permission to view or approve approvals.
        </p>
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
   <div className="flex flex-col flex-1 p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-6">Approvals Dashboard</h2>

      {/* Job Requisition Approvals — Visible only to HR/Admin */}
      {(role === "Human Resource" || role === "Admin") && (
        <div className="mb-10">
          <h3 className="text-2xl font-semibold mb-4">Job Requisition Approvals</h3>
          {jobRequisitions.length === 0 ? (
            <p className="text-gray-500">No active job requisitions found.</p>
          ) : (
            jobRequisitions.map(job => (
              <div key={job.jobRequisitionId} className="p-6 border border-neutral-300 rounded-xl mb-4 shadow-sm bg-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-xl font-bold mb-1">{job.jobTitle}</h4>
                    <p className="text-gray-700">Submitted by: {job.lineManager || "Unknown"}</p>
                    <p className="text-gray-700">Date: {new Date(job.dateOfRequest).toLocaleDateString("en-GB")}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/review-approval/${job.jobRequisitionId}`)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    View
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* REM Form Approvals — Role-aware */}
      {(role === "Line Manager"  || role === "CFO" || role === "HR Executive" || role === "Admin") && (
        <div>
          <h3 className="text-2xl font-semibold mb-4">Pending REM Form Approvals</h3>
          {remForms.length === 0 ? (
            <p className="text-gray-500">No pending REM forms</p>
          ) : (
            remForms.map(form => (
              <div key={form.id} className="p-6 border border-neutral-300 rounded-xl mb-4 shadow-sm bg-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-xl font-bold mb-1">{form.position}</h4>
                    <p className="text-gray-700">Candidate: {form.name}</p>
                    <p className="text-gray-700">Status: {form.status.name}</p>
                    <p className="text-gray-700">Date: {new Date(form.date).toLocaleDateString("en-GB")}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/rem-review/${form.id}`)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    View
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
export default ApprovalsDashboard;
