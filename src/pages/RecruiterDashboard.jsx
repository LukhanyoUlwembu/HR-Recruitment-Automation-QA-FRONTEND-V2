import React, { useState, useEffect } from 'react';
import { ArrowBigRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import createjobpost from '../assets/create-job-post.svg';
import jobrequisition from '../assets/job-requisition.svg';
import trackapplicants from '../assets/track-applicants.svg';
import { BASE_URL } from './useAuth';

const Dashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [stages, setStages] = useState([]);

  const dashfeat = [
    { title: 'Create Job Post', image: createjobpost, link: '/approved-requisitions' },
    { title: 'Job Requisition', image: jobrequisition, link: '/requisition' },
    { title: 'View Approvals', image: trackapplicants, link: '/approvaldash' },
  ];


  const fetchApplications = () => {
    fetch(`${BASE_URL}/applications`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setJobs(data);
        }
      })
      .catch((err) => {
        console.error("Error fetching jobs:", err);
      });
  };

  useEffect(() => {
    fetchApplications();

    const fetchStages = async () => {
      try {
        const res = await fetch(`${BASE_URL}/dropdown/job-statuses`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setStages(data);
        }
      } catch (err) {
        console.error("Error fetching stages:", err);
      }
    };

    fetchStages();
  }, []);

 // Filter out the ones we don’t want
const filteredStages = stages
  .filter(
    (stage) =>
      stage.name !== "Rejected" &&
      stage.name !== "Withdrawn" &&
      stage.name !== "Accepted"
  )
  // Sort them by orderIndex
  .sort((a, b) => a.orderIndex - b.orderIndex);

const jobSlowestStageMap = {};

jobs.forEach((job) => {
  const jobId = job.jobPosting.jobPostingId;

  // match job.status against stage.name
  const statusIndex = filteredStages.findIndex(
    (stage) => stage.name === job.status.name
  );
  if (statusIndex === -1) return;

  if (!jobSlowestStageMap[jobId]) {
    jobSlowestStageMap[jobId] = {
      slowestStageIndex: statusIndex,
      job,
    };
  } else {
    if (statusIndex < jobSlowestStageMap[jobId].slowestStageIndex) {
      jobSlowestStageMap[jobId].slowestStageIndex = statusIndex;
      jobSlowestStageMap[jobId].job = job;
    }
  }
});

// Initialize buckets in order
const jobsByStage = filteredStages.reduce((acc, stage) => {
  acc[stage.name] = [];
  return acc;
}, {});

// Fill the buckets
Object.values(jobSlowestStageMap).forEach(({ slowestStageIndex, job }) => {
  const stage = filteredStages[slowestStageIndex];
  if (stage) {
    jobsByStage[stage.name].push(job);
  }
});

const maxJobsInStage = Math.max(
  ...Object.values(jobsByStage).map((jobs) => jobs.length),
  0
);

  return (
    <div className="flex flex-col items-center p-6">
      {/* Dashboard Feature Cards */}
      <div className="flex flex-wrap justify-center items-center gap-6 mb-10">
        {dashfeat.map((feat, index) => (
          <Link
            key={index}
            to={feat.link}
            className="relative w-80 h-52 rounded-2xl overflow-hidden shadow-lg group"
          >
            <img
              src={feat.image}
              alt={feat.title}
              className="w-full h-full object-cover transform group-hover:scale-105 transition duration-300"
            />
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
              <h3 className="text-white text-xl font-semibold text-center">
                {feat.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>

      {/* Active Jobs Section */}
      <div className="w-full px-6 md:px-28">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Active Jobs</h2>
          <Link
            to="/jobListing"
            className="flex items-center text-sm font-medium text-black hover:underline"
          >
            View all <ArrowBigRight className="ml-1" />
          </Link>
        </div>

        <div className="border-2 border-gray-300 rounded-[19px] overflow-x-auto">
          <table className="w-full table-fixed text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-gray-900 font-semibold text-base">
                {filteredStages.map((stage, idx) => (
                  <th key={idx} className="px-4 py-2">{stage.name}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm text-black">
              {Array.from({ length: maxJobsInStage }).map((_, rowIndex) => (
                <tr key={rowIndex} className="bg-white rounded-md shadow-sm">
                  {filteredStages.map((stage, colIndex) => {
                    const job = jobsByStage[stage.name][rowIndex];
                    return (
                      <td key={colIndex} className="px-4 py-2">
                        {job ? (
                          <Link to={`/jobDetail/${job.jobPosting.jobPostingId}`}>
                            {job.jobPosting.jobTitle}
                          </Link>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
