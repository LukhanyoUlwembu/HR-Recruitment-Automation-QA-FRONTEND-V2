import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Clock } from "lucide-react";
import { BASE_URL } from './useAuth';
export default function JobListing() {
  const [jobsData, setJobsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    contract: "",
    type: "",
    jobProvince: "",
    search: ""
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch(`${BASE_URL}/postings`);
        if (!response.ok) throw new Error("Reload Page");
        const data = await response.json();
        setJobsData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);


     const contracts = useMemo(() => [...new Set(jobsData.map(j => j.contract).filter(Boolean))], [jobsData]);
     const types = useMemo(() => [...new Set(jobsData.map(j => j.type).filter(Boolean))], [jobsData]);
     const provinces = useMemo(() => [...new Set(jobsData.map(j => j.location?.province.name).filter(Boolean))], [jobsData]);
 
     const filteredJobs = jobsData.filter((job) => {
       const contractMatch = filters.contract
         ? job.contract?.toLowerCase() === filters.contract.toLowerCase()
         : true;
       const typeMatch = filters.type
         ? job.type?.toLowerCase() === filters.type.toLowerCase()
         : true;
       const locationMatch = filters.jobProvince
         ? job.location?.province?.name.toLowerCase().includes(filters.jobProvince.toLowerCase())
         : true;
       const searchMatch = filters.search
         ? job.jobTitle?.toLowerCase().includes(filters.search.toLowerCase())
         : true;
 
       return contractMatch && typeMatch && locationMatch && searchMatch;
     });
  if (loading) return <p className="p-4 text-center">Loading jobs...</p>;
  if (error) return <p className="p-4 text-red-500 text-center">Error: {error}</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Filters */}
      <div className="border border-blue-300 p-4 rounded-md mb-6">
      <div className="flex flex-wrap gap-4 items-center">
  <span className="font-medium">Job Filters :</span>

  <select
    className="border border-gray-300 rounded-md px-3 py-2 text-sm min-w-[150px] flex-1"
    value={filters.contract}
    onChange={(e) => setFilters(f => ({ ...f, contract: e.target.value }))}
  >
    <option value="">Contract</option>
    {contracts.map((c, idx) => (
      <option key={idx} value={c}>{c}</option>
    ))}
  </select>

  <select
    className="border border-gray-300 rounded-md px-3 py-2 text-sm min-w-[150px] flex-1"
    value={filters.type}
    onChange={(e) => setFilters(f => ({ ...f, type: e.target.value }))}
  >
    <option value="">Job Type</option>
    {types.map((t, idx) => (
      <option key={idx} value={t}>{t}</option>
    ))}
  </select>

  <select
    className="border border-gray-300 rounded-md px-3 py-2 text-sm min-w-[150px] flex-1"
    value={filters.jobProvince}
    onChange={(e) => setFilters(f => ({ ...f, jobProvince: e.target.value }))}
  >
    <option value="">Location</option>
    {provinces.map((p, idx) => (
      <option key={idx} value={p}>{p.replace(/_/g, ' ')}</option>
    ))}
  </select>

  <input
    type="text"
    placeholder="Search Title"
    className="border border-gray-300 rounded-md px-3 py-2 text-sm min-w-[150px] flex-1"
    value={filters.search}
    onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
  />
</div>

      </div>

      {/* Job Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredJobs.map((job) => (
          <div
            key={job.jobPostingId}
            className="border border-blue-300 rounded-md p-4 text-center space-y-2 bg-white hover:shadow-md hover:border-blue-500 transition duration-200 ease-in-out"
          >
            <h3 className="font-semibold text-lg">{job.jobTitle}</h3>
            <div className="text-sm flex justify-center gap-2 items-center">
              <span className="flex items-center gap-1">
                <MapPin className="inline h-4 w-4" />
                {job.location?.province.name}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="inline h-4 w-4" />
                {new Date(job.jobDeadline).toLocaleDateString()}
              </span>
            </div>
            <div className="text-xs text-gray-500">{job.contract}</div>
            <button
              onClick={() => navigate(`/details/${job.jobPostingId}`)}
              className="border border-blue-500 text-blue-500 px-4 py-2 rounded-md hover:bg-blue-50 w-full font-semibold"
            >
              View Job
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}