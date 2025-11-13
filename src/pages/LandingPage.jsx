import React, { useState } from 'react';
  import { Menu, X, MapPin, Clock, ArrowDown } from 'lucide-react';
  import { Link } from "react-router-dom";
  import logo from "../assets/logo.svg";
  import Background from "../assets/Background.jpg";
  import Footer from '../components/navigation/Footer.jsx';
  import { HashLink } from 'react-router-hash-link';
  import { useEffect, useMemo } from 'react';
import { BASE_URL } from './useAuth';
  const JobDetailsModal = ({ job, onClose }) => {
    if (!job) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
          <h2 className="text-xl font-semibold text-800">Sign In Required</h2>
        <p className="text-600 mb-4">You must be signed in to apply for jobs.</p>
          <button
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
            onClick={onClose}
          >
            &times;
          </button>
          <h2 className="text-2xl font-bold mb-2">{job.jobTitle}</h2>
          <div className="mb-2 text-700">
            <span className="font-semibold">Location:</span> {job.location?.province.name}
          </div>
          <div className="mb-2 text-700">
            <span className="font-semibold">Deadline:</span> {new Date(job.jobDeadline).toLocaleDateString()}
          </div>
          <div className="mb-2 text-700">
            <span className="font-semibold">Contract:</span> {job.contract}
          </div>
          <div className="mb-2 text-700">
            <span className="font-semibold">Type:</span> {job.type}
          </div>
          <div className="mb-4 text-700">
            <span className="font-semibold">Description:</span> {job.jobDescription}
          </div>
          {/* Add more job details as needed */}
        </div>
      </div>
    );
  };

  const LandingPage = () => {
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [jobs, setJobs] = useState([]);
    const [filters, setFilters] = useState({
      contract: "",
      type: "",
      jobProvince: "",
      search: ""
    });
    const [selectedJob, setSelectedJob] = useState(null);
    const toggleNavbar = () => setMobileDrawerOpen(!mobileDrawerOpen);
    
  useEffect(() => {
      const fetchJobs = async () => {
        try {
          const response = await fetch(
            `${BASE_URL}/postings`
          );
          if (!response.ok) throw new Error("Reload Page");
          const data = await response.json();
          setJobs(data);
        } catch (err) {
          console.log(err);
          }
      };
  
      fetchJobs();
    }, []);
    const contracts = useMemo(() => [...new Set(jobs.map(j => j.contract).filter(Boolean))], [jobs]);
    const types = useMemo(() => [...new Set(jobs.map(j => j.type).filter(Boolean))], [jobs]);
    const provinces = useMemo(() => [...new Set(jobs.map(j => j.location?.province.name).filter(Boolean))], [jobs]);

    const filteredJobs = jobs.filter((job) => {
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


    return (
      <div>
        {/* NAVBAR */}
        <nav className="sticky top-0 z-50 w-full h-20 py-4 border bg-white shadow-md">
          <div className="container mx-auto px-4 relative text-sm">
            <div className="flex justify-between items-center">
              <img className="h-14 w-32" src={logo} alt="logo" />
              <div className="hidden lg:flex space-x-4">
                <Link to="/auth">
                  <button className="border-2 border-blue-500 text-blue-500 py-2 px-4 rounded-md font-bold">Sign In</button>
                </Link>
                <Link to="/signup">
                  <button className="border-2 border-blue-500 text-blue-500 py-2 px-4 rounded-md font-bold mr-6">Sign Up</button>
                </Link>
              </div>
              <div className="lg:hidden">
                <button onClick={toggleNavbar}>
                  {mobileDrawerOpen ? <X /> : <Menu />}
                </button>
              </div>
            </div>

            {mobileDrawerOpen && (
              <div className="fixed right-0 bg-white w-full p-8 flex flex-col items-center z-20">
                <div className="flex space-x-4 mt-6">
                  <Link to="/auth" className="border px-4 py-2 rounded">Sign In</Link>
                  <Link to="/signup" className="bg-gradient-to-r from-blue-400 to-green-500 px-4 py-2 rounded text-white">Sign Up</Link>
                </div>
              </div>
            )}
          </div>
        </nav>

  {/* HERO SECTION */}
  <div
    className="relative h-screen w-full bg-cover bg-center flex items-center"
    style={{ backgroundImage: `url(${Background})` }}
  >
    <div className="absolute inset-0 bg-zinc-950 bg-opacity-50 z-0"></div>
    <div className="relative z-10 text-white px-6 md:px-24 max-w-3xl">
      <h1 className="text-4xl md:text-6xl font-bold leading-tight">
        We make life better!
      </h1>
      <p className="mt-4 text-lg md:text-xl">
        Making Hiring Better Both For The Recruiter & Applicant
      </p>
  <HashLink
    smooth
    to="#AppJobs"
    className="inline-flex items-center gap-2 mt-4 hover:bg-blue-500 text-white text-2xl font-bold py-3 px-6 rounded-md transition duration-300"
  >
    Browse and Search Jobs
    <ArrowDown size={24} />
  </HashLink>
    </div>
  </div>


        {/* JOBS SECTION */}
        <section id="AppJobs" className="max-w-6xl mx-auto p-6">
          <div className="border border-blue-300 p-4 rounded-md mb-6">
          <div className="flex flex-wrap gap-4 items-center">
    <span className="font-medium">Job Filters :</span>

    <select
      className="border border-gray-300 rounded-md px-3 py-2 text-sm min-w-[150px] flex-1"
      value={filters.contract}
      onChange={(e) => setFilters(f => ({ ...f, contract: e.target.value }))}
    >
      <option value="">Type</option>
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
                  {job.location?.province.name.replace(/_/g, ' ')}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="inline h-4 w-4" />
                  {new Date(job.jobDeadline).toLocaleDateString()}
                </span>
              </div>
              <div className="text-xs text-gray-500">{job.contract}</div>
              <button
                onClick={() => setSelectedJob(job)}
                className="border border-blue-500 text-blue-500 px-4 py-2 rounded-md hover:bg-blue-50 w-full font-semibold"
              >
                View Job
              </button>
            </div>
          ))}
        </div>
        {/* Modal for job details */}
        <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />
        </section>

        {/* STATS */}
          <div
    className="p-8 rounded-md flex justify-center space-x-12 my-20"
    style={{ backgroundImage: `url(${Background})` }}
  >
          {[
            { label: "Skills Match", value: "100", suffix: "%" },
            { label: "Active Job Seekers", value: "140K", suffix: "+" },
            { label: "Job Opportunities", value: "25K", suffix: "+" },
          ].map((stat, i) => (
            <div key={i} className={`flex items-center space-x-4 ${i < 2 ? 'border-r pr-12' : ''}`}>
              <h2 className="text-5xl font-bold text-blue-500">
                {stat.value}<span className="text-5xl ml-1 text-green-500">{stat.suffix}</span>
              </h2>
              <p className="text-sm text-gray-700 mt-4">{stat.label}</p>
            </div>
          ))}
        </div>
		
        <div className="max-w-6xl mx-auto p-6 bg-blue-50 rounded-lg border border-blue-100 shadow-sm">
  <p className="text-gray-700 leading-relaxed">
    <span className="block text-lg font-semibold text-blue-800 mb-3">
      Data Protection Notice
    </span>
    In compliance with the <span className="font-medium">POPIA Act</span> and <span className="font-medium">GDPR</span>, 
    applicant information is stored securely and retained for a period of 5 years. 
    This information will be used in accordance with the applicant's consent provided to UBS 
    when applying and sharing their personal information with the recruitment team.
    <br /><br />
    <span className="block bg-blue-100 p-3 rounded-md border-l-4 border-blue-500 italic">
      Should you wish to revoke this permission, please email{" "}
      <a href="mailto:applicantdelete@ulwembubs.com" className="text-blue-600 hover:underline font-medium">
        applicantdelete@ulwembubs.com
      </a>{" "}
      with your first name, last name and identity number.
    </span>
  </p>
</div>
        <Footer />
      </div>
      
    );
  };

  export default LandingPage;