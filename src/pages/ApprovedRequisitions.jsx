import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from './useAuth';

const ApprovedRequisitions = () => {
  const [approvedList, setApprovedList] = useState([]);
  const navigate = useNavigate();
  const role = sessionStorage.getItem("role");
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState([]);

  useEffect(() => {
    fetchApprovedRequisitions();
    fetchPermissions();
  }, [role]);

  const fetchApprovedRequisitions = async () => {
    try {
      const response = await fetch(`${BASE_URL}/job-requisitions/approvals`);
      if (!response.ok) throw new Error("Failed to fetch data");

      const data = await response.json();

      // ✅ Only include where the final approval decision is true
      const approved = data.filter((approval) => approval.decision === true && approval.jobRequisition.active === false && approval.active == true);

      setApprovedList(approved);
    } catch (error) {
      console.error("Error fetching approvals:", error);
    }
  };
 
 // Fetch permissions function
  const fetchPermissions = async () => {
    if (!role) {
      console.error("No role found in session storage");
      setLoading(false);
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
    } finally {
      setLoading(false);
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
  
  // Check permissions first
  if (!permissions.includes('create_job_post')) {
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
    <div className="flex flex-col flex-1 p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-6">Approved Requisitions</h2>

      {approvedList.length === 0 ? (
        <p className="text-gray-500 text-center">No approved requisitions found.</p>
      ) : (
        approvedList.map((approval, index) => {
          const job = approval.jobRequisition;
          return (
            <div key={index} className="p-6 border border-gray-300 rounded-xl mb-4 shadow-sm bg-white">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xl font-bold mb-1">{job.jobTitle}</h4>
                  <p className="text-gray-700">Submitted by: {job.lineManager || "Unknown"}</p>
                  <p className="text-gray-700">
                    Date: {new Date(job.dateOfRequest).toLocaleDateString("en-GB")}
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/review/${job.jobRequisitionId}`)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  View
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default ApprovedRequisitions;

