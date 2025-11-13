import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { BASE_URL } from './useAuth';
import {
  faEnvelope,
  faMapMarkerAlt,
  faCalendarAlt,
  faEye,
  faSearch,
  faFilter,
  faSort,
  faBriefcase,
  faBuilding,
  faClock,
  faFileText,
  faCheckCircle,
  faTimesCircle,
  faExclamationCircle,
  faArrowLeft
} from '@fortawesome/free-solid-svg-icons';

const MyJobApplications = () => {
  const navigate = useNavigate();
  const applicantId = sessionStorage.getItem("userId");
  const [profile, setProfile] = useState({});
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [interviewDetails, setInterviewDetails] = useState(null);
  const [jobDetails, setJobDetails] = useState(null);


 
  useEffect(() => {
    const fetchData = async () => {
      
      try {
        // Fetch profile data 
        const response = await fetch(
            `${BASE_URL}/applicants/${applicantId}`
        );
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        }
      } catch (err) {
        console.log("Error fetching profile:", err.message);
      }
      
    };

    fetchData();
  }, [applicantId]); 

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/applications/by-applicant/${applicantId}`
        );
        if (!response.ok) throw new Error("Reload Page");
        const data = await response.json();
        setApplications(data);
        
      } catch (err) {
        console.log(err.message);
      } 
    };

    fetchJobs();
  }, [applicantId]);

  const filterAndSortApplications = useCallback(() => {
    let filtered = [...applications];

    
    if (searchTerm) {
      filtered = filtered.filter(applications =>
        applications.jobPosting?.jobTitle .toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
   switch (sortBy) {
        case 'date':
          return new Date(b.applicationDate) - new Date(a.applicationDate);
        case 'title':
          return a.jobPosting?.jobTitle.localeCompare(b.jobPosting?.jobTitle);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    setFilteredApplications(filtered);
  }, [applications, searchTerm, statusFilter, sortBy]);

  useEffect(() => {
    filterAndSortApplications();
  }, [filterAndSortApplications]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Application':
        return 'bg-blue-100 text-blue-800';
      case 'Interview':
        return 'bg-blue-100 text-blue-800';
      case 'Offer':
        return 'bg-blue-100 text-blue-800';
      case 'Accepted':
        return 'bg-blue-100 text-blue-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Accepted':
      case 'Offer':
        return faCheckCircle;
      case 'Rejected':
        return faTimesCircle;
      case 'Interview':
        return faCalendarAlt;
      default:
        return faExclamationCircle;
    }
  };

  const handleViewDetails = (application) => {
  if ((application.status.name === 'Interview' ) && application.interviews?.length > 0) {
    const interview = application.interviews[0]; 
    const formattedInterview = {
      jobTitle: application.jobPosting?.jobTitle || 'Interview',
      interviewDate: new Date(interview.interviewDate).toLocaleDateString(),
      interviewTime: new Date(interview.interviewDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      interviewMode: interview.location || 'Microsoft Teams',
      contactPerson: interview.interviewer || 'Recruitment Team',
      interviewLink: interview.link,
      panel: interview.panel,
    };
    setInterviewDetails(formattedInterview);
  }
};


  const closeModal = () => setInterviewDetails(null);

  const getApplicationStats = () => {
    const total = applications.length;
    const pending = applications.filter(app =>
      ['Application'].includes(app.status)
    ).length;
    const interviews = applications.filter(app =>
      ['Interview'].includes(app.status)
    ).length;
    const offers = applications.filter(app =>
      ['Offer', 'Accepted'].includes(app.status)
    ).length;
    
    return { total, pending, interviews, offers };
  };

  const stats = getApplicationStats();
  const initials = (profile.name ? profile.name[0] : '') + (profile.surname ? profile.surname[0] : '');



  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/jobs')}
              className="flex items-center text-cyan-600 hover:text-cyan-700 font-medium"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Back to Dashboard
            </button>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Profile Section */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl font-bold">
                {initials}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile.name} {profile.surname}
                </h1>
                <div className="flex items-center text-gray-600 text-sm mt-1">
                  <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4 mr-2" />
                  {profile.email}
                </div>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 md:ml-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
                <div className="text-sm text-gray-600">Total Applications</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
                <div className="text-sm text-gray-600">Pending Review</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.interviews}</div>
                <div className="text-sm text-gray-600">Interviews</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.offers}</div>
                <div className="text-sm text-gray-600">Offers</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter & Search Applications</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <FontAwesomeIcon icon={faFilter} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Statuses</option>
                <option value="Application">Application</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="relative">
              <FontAwesomeIcon icon={faSort} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none"
              >
                <option value="date">Sort by Date</option>
                <option value="title">Sort by Job Title</option>
                <option value="status">Sort by Status</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-center md:justify-start">
              <span className="text-gray-600">
                Showing {filteredApplications.length} of {applications.length} applications
              </span>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          {filteredApplications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <FontAwesomeIcon icon={faFileText} className="text-gray-400 text-4xl mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'You haven\'t applied to any jobs yet.'
                }
              </p>
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
              >
                <FontAwesomeIcon icon={faSearch} className="mr-2" />
                Browse Jobs
              </Link>
            </div>
          ) : (
            filteredApplications.map((application) => (
              <div key={application.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                          <FontAwesomeIcon icon={faBriefcase} className="text-cyan-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">
                            {application.jobPosting.jobTitle}
                          </h3>
                          <div className="flex items-center gap-4 text-gray-600 mb-2">
                            <div className="flex items-center">
                              <FontAwesomeIcon icon={faBuilding} className="w-4 h-4 mr-2" />
                              {application.jobPosting.contract}
                            </div>
                            <div className="flex items-center">
                              <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4 mr-2" />
                              {application.jobPosting.location.province.name}
                            </div>
                            <div className="flex items-center">
                              <FontAwesomeIcon icon={faClock} className="w-4 h-4 mr-2" />
                              {new Date(application.jobPosting.jobDeadline).toLocaleDateString()}
                            </div>
                          </div>
                          <p className="text-gray-700 mb-3 line-clamp-2">
                            {application.description}
                          </p>
                          
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-3 ml-4">
                      {/* Status Badge */}
                      <div className="flex items-center gap-2">
                        <FontAwesomeIcon
                          icon={getStatusIcon(application.status.name)}
                          className={`w-4 h-4 ${
                            application.status.name === 'Accepted'
                              ? 'text-green-600'
                              : application.status.name === 'Rejected'
                                ? 'text-red-600'
                                : 'text-gray-600'
                          }`}
                        />
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status.name)}`}>
                          {(application.status.name === "Offer" && !application.offerLetter)
                            ? "Pending"
                            : application.status.name}
                        </span>

                      </div>

                   

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {(application.status.name === 'Interview') && (
                          <button
                            onClick={() => handleViewDetails(application)}
                            className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                          >
                            <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
                            Interview
                          </button>
                        )}
                        {application.status.name === 'Offer' && application.offerLetter && application.offerLetter.status.name ==='APPROVED' &&(
                          <Link
                            to ={`/offertemplate/${application.jobAppliedId}`}
                            className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                          >
                            <FontAwesomeIcon icon={faFileText} className="mr-1" />
                            View Offer
                          </Link>
                        )}
                         {application.status.name === 'Onboarding' && !application.onboarding  &&(
                          <Link
                            to ={`/applicant-onboard/${application.jobAppliedId}`}
                            className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                          >
                            <FontAwesomeIcon icon={faFileText} className="mr-1" />
                            Onboarding
                          </Link>
                        )}
                              <button
                        onClick={() => setJobDetails(application)}
                        className="px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                      >
                        <FontAwesomeIcon icon={faEye} className="mr-1" />
                        Details
                      </button>
                    {application.status.name !== 'Withdrawn' && application.status.name !== 'Rejected' && application.status.name !== 'Accepted' && (

  <button
    onClick={async () => {
      try {
        const res = await fetch(`${BASE_URL}/applications/withdraw/${application.jobAppliedId}`, {
          method: 'PUT'
        });
        if (res.ok) {
          const updatedList = applications.map(app =>
            app.jobAppliedId === application.jobAppliedId
              ? { ...app, status: 'Withdrawn' }
              : app
          );
          setApplications(updatedList);
        } else {
          alert('Failed to withdraw application');
        }
      } catch (err) {
        console.error('Error withdrawing:', err);
        alert('Error withdrawing application');
      }
    }}
    className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
  >
    Withdraw
  </button>
)}


                      </div>
                    </div>
                  </div>

                  {/* Additional Information for Special Statuses */}
                  {application.offerDeadline && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faClock} className="text-green-600 mr-2" />
                        <span className="text-green-800 font-medium">
                          Offer expires on {new Date(application.jobPosting.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {application.rejectionReason && (
                    <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faTimesCircle} className="text-red-600 mr-2" />
                        <span className="text-red-800">
                          Reason: {application.jobPosting.rejectionReason}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {application.startDate && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faCheckCircle} className="text-blue-600 mr-2" />
                        <span className="text-blue-800 font-medium">
                          Start date: {application.jobPosting.startDate}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Interview Details Modal */}
       {interviewDetails && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative">
      <button
        onClick={closeModal}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold"
      >
        ×
      </button>

      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <FontAwesomeIcon icon={faCalendarAlt} className="text-blue-600 text-xl" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Interview Details</h3>
            <p className="text-gray-600">{interviewDetails.jobTitle}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <p className="text-gray-900">{interviewDetails.interviewDate}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
              <p className="text-gray-900">{interviewDetails.interviewTime}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
            <p className="text-gray-900">{interviewDetails.interviewMode}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
            <p className="text-gray-900">{interviewDetails.contactPerson}</p>
          </div>

          {interviewDetails.panel && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Panel</label>
              <p className="text-gray-900 whitespace-pre-wrap">{interviewDetails.panel}</p>
            </div>
          )}

          {interviewDetails.interviewLink && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link</label>
              <a
                href={interviewDetails.interviewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline break-all"
              >
                Join Interview
              </a>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={closeModal}
            className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
          {interviewDetails.interviewLink && (
            <a
              href={interviewDetails.interviewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-center"
            >
              Join Now
            </a>
          )}
        </div>
      </div>
    </div>
  </div>
)}
{jobDetails && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative p-6">
      <button
        onClick={() => setJobDetails(null)}
        className="absolute top-4 right-4 text-xl font-bold text-gray-600"
      >
        ×
      </button>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Job Details
      </h2>
      <div className="space-y-3 text-gray-700">
        <p><strong>Title:</strong> {jobDetails?.jobPosting?.jobTitle}</p>
        <p><strong>Location:</strong> {jobDetails?.jobPosting?.location?.province.name.replace(/_/g, ' ')}</p>
        <p><strong>Contract:</strong> {jobDetails?.jobPosting?.contract}</p>
        <p><strong>Deadline:</strong> {new Date(jobDetails?.jobPosting?.jobDeadline).toLocaleDateString()}</p>
        <p><strong>Description:</strong></p>
        <p className="whitespace-pre-line">
          {jobDetails?.jobPosting?.jobDescription || "No description available."}
        </p>
      </div>
      <div className="mt-6 text-right">
        <button
          onClick={() => setJobDetails(null)}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

      </div>
    </div>
  );
};

export default MyJobApplications;