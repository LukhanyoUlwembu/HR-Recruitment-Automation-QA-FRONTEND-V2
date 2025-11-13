import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BASE_URL } from "./useAuth";

const JobListings = () => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [archive, setArchive] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (activeTab === "active") {
          // Fetch job postings (these exist even without applications)
          const jobRes = await fetch(`${BASE_URL}/postings`);
          if (!jobRes.ok) throw new Error("Failed to fetch job postings");
          const jobData = await jobRes.json();

          // Filter only active job postings
          const activeJobs = jobData.filter((job) => job.active === true);

          // Fetch applications to attach their statuses to jobs
          const appRes = await fetch(`${BASE_URL}/applications`);
          if (!appRes.ok) throw new Error("Failed to fetch applications");
          const appData = await appRes.json();

          setJobs(activeJobs);
          setApplications(appData);
          setError(null);
        } else {
          // Archived jobs
          const archiveRes = await fetch(`${BASE_URL}/postings`);
          if (!archiveRes.ok) throw new Error("Failed to fetch archived jobs");
          const archiveData = await archiveRes.json();
          const archivedJobs = archiveData.filter((posting) => posting.active === false);
          setArchive(archivedJobs);
          setError(null);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
        setJobs([]);
        setArchive([]);
      }
    };

    fetchData();
    setSearchTerm("");
  }, [activeTab]);

  // Merge applications with job postings
  const jobsWithStatus = jobs.map((job) => {
    const relatedApps = applications.filter(
      (app) => app.jobPosting.jobPostingId === job.jobPostingId
    );
    if (relatedApps.length > 0) {
      // pick the latest status
      const latestApp = relatedApps[relatedApps.length - 1];
      return { ...job, status: latestApp.status };
    } else {
      return { ...job, status: "No applications" };
    }
  });

  // Filter by search term
  const filteredJobs = jobsWithStatus.filter((job) =>
    job.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredArchivedJobs = archive.filter((job) =>
    job.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group jobs by status
  const statuses = ["Application", "Screening", "Interview", "Offer", "Onboarding", "No applications"];
  const jobsByStatus = statuses.reduce((acc, status) => {
    acc[status] = filteredJobs.filter((job) => job.status === status);
    return acc;
  }, {});
  const maxJobsInStatus = Math.max(...Object.values(jobsByStatus).map((jobs) => jobs.length));

  return (
    <div className="bg-white p-8 rounded-md shadow-2xl">
      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="Search"
          className="w-[450px] h-10 rounded-md px-4 border border-gray-300 shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex justify-between items-start mb-4">
        <div className="ml-[8%]">
          <p className="text-2xl font-bold">
            {activeTab === "active" ? "Active Jobs" : "Archived Jobs"}
          </p>
        </div>

        <div className="mr-[10%] mt-2">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-4 py-2 rounded-md mr-2 ${
              activeTab === "active" ? "bg-blue-600 text-white" : "bg-gray-200 text-black"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab("archived")}
            className={`px-4 py-2 rounded-md ${
              activeTab === "archived" ? "bg-blue-600 text-white" : "bg-gray-200 text-black"
            }`}
          >
            Archived
          </button>
        </div>
      </div>

      {error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : (
        <div className="flex justify-center">
          <div className="w-[1020px] border-3 border-gray-300 rounded-[19px] overflow-x-auto">
            <table className="w-[1020px] table-fixed text-left border-separate border-spacing-y-2">
              <thead>
                {activeTab === "active" ? (
                  <tr className="text-gray-900 font-semibold text-base">
                    {statuses.map((status) => (
                      <th key={status} className="px-4 py-2">
                        {status}
                      </th>
                    ))}
                  </tr>
                ) : (
                  <tr className="text-gray-900 font-semibold text-base">
                    <th className="px-4 py-2">Title</th>
                    <th className="px-4 py-2">Closed Date</th>
                  </tr>
                )}
              </thead>
              <tbody className="text-sm text-black">
                {activeTab === "archived" ? (
                  filteredArchivedJobs.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="text-center py-4">
                        No jobs found.
                      </td>
                    </tr>
                  ) : (
                    filteredArchivedJobs.map((job, index) => (
                      <tr key={index} className="bg-white rounded-md shadow-sm">
                        <td className="px-4 py-2">
                          <Link to={`/database/${job.title}`}>{job.title}</Link>
                        </td>
                        <td className="px-4 py-2">{job.closedDate}</td>
                      </tr>
                    ))
                  )
                ) : filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan={statuses.length} className="text-center py-4">
                      No jobs found.
                    </td>
                  </tr>
                ) : (
                  Array.from({ length: maxJobsInStatus }).map((_, rowIndex) => (
                    <tr key={rowIndex} className="bg-white rounded-md shadow-sm">
                      {statuses.map((status, colIndex) => {
                        const job = jobsByStatus[status][rowIndex];
                        return (
                          <td key={colIndex} className="px-4 py-2">
                            {job ? (
                              <Link to={`/jobDetail/${job.jobPostingId}`}>
                                {job.jobTitle}
                              </Link>
                            ) : null}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobListings;
