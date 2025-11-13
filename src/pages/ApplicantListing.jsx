import React, { useState, useEffect } from 'react';
import { BASE_URL } from './useAuth';

const Database = () => {
  const [data, setData] = useState([]);
  const [nameFilter, setNameFilter] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    jobTitle: '',
    skills: '',
    status: '',
    gender: '',
    race: ''
  });

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch(`${BASE_URL}/applications`);
        if (!response.ok) throw new Error("Reload Page");
        const data = await response.json();
        setData(data);
      } catch (err) {
        console.log(err.message);
      }
    };

    fetchJobs();
  }, []);

  const handleDropdownChange = (type, value) => {
    setFilters((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  // Get the latest application for each unique applicant
  const getLatestApplicationPerApplicant = () => {
    const applicantsMap = new Map();
    const sortedData = [...data].sort((a, b) => new Date(b.created) - new Date(a.created));

    sortedData.forEach(application => {
      if (!applicantsMap.has(application.applicant.email)) {
        applicantsMap.set(application.applicant.email, application);
      }
    });

    return Array.from(applicantsMap.values());
  };

  const filteredData = getLatestApplicationPerApplicant().filter((entry) => {
    const nameMatch = `${entry.applicant.name} ${entry.applicant.surname}`.toLowerCase().includes(nameFilter.toLowerCase());

    const locationMatch =
      filters.location === '' || entry.applicant.location.province.name === filters.location;

    const jobTitleMatch =
      filters.jobTitle === '' || entry.jobPosting?.jobTitle === filters.jobTitle;

    const skillsMatch =
      filters.skills === '' ||
      (entry.applicant.applicantSkill &&
        entry.applicant.applicantSkill.some(
          skill => skill.skillName?.name.toLowerCase() === filters.skills.toLowerCase()
        ));

    const statusMatch =
      filters.status === '' || entry.status.name === filters.status;

    const genderMatch =
      filters.gender === '' || entry.applicant.gender.name === filters.gender;

    const raceMatch =
      filters.race === '' || entry.applicant.race.name === filters.race;

    return (
      nameMatch &&
      locationMatch &&
      jobTitleMatch &&
      skillsMatch &&
      statusMatch &&
      genderMatch &&
      raceMatch
    );
  });

  const getUniqueValues = (key) => {
    const values = data.flatMap((item) => {
      if (key === 'jobTitle' && item.jobPosting) {
        return [item.jobPosting.jobTitle];
      }
      if (key === 'location') {
        return [item.applicant.location.province.name];
      }
      if (key === 'skills') {
        return item.applicant.applicantSkill?.map(skill => skill.skillName.name) || [];
      }
      if (key === 'gender') {
        return [item.applicant.gender.name];
      }
      if (key === 'race') {
        return [item.applicant.race.name];
      }
      return [];
    }).filter(Boolean);

    return Array.from(new Set(values)).sort();
  };

  const getStatuses = () => {
    const statuses = data.map(item => item.status.name).filter(Boolean);
    return Array.from(new Set(statuses)).sort();
  };

  const getSkillNames = (skills) => {
    return skills?.map(skill => skill.skillName.name).join(', ') || 'N/A';
  };

  return (
    <div className="p-8 rounded-md shadow-2xl max-w-screen-xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-6">Applicant Database</h2>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <input
          type="text"
          placeholder="Filter by Name"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          className="h-12 flex-1 min-w-[180px] rounded border border-gray-300 px-4 text-sm shadow-sm"
        />

        <select
          className="h-12 flex-1 min-w-[180px] border rounded px-3 text-sm shadow-sm"
          value={filters.location}
          onChange={(e) => handleDropdownChange('location', e.target.value)}
        >
          <option value="">All Locations</option>
          {getUniqueValues('location').map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>

        <select
          className="h-12 flex-1 min-w-[180px] border rounded px-3 text-sm shadow-sm"
          value={filters.jobTitle}
          onChange={(e) => handleDropdownChange('jobTitle', e.target.value)}
        >
          <option value="">All Job Titles</option>
          {getUniqueValues('jobTitle').map((title) => (
            <option key={title} value={title}>{title}</option>
          ))}
        </select>

        <select
          className="h-12 flex-1 min-w-[180px] border rounded px-3 text-sm shadow-sm"
          value={filters.skills}
          onChange={(e) => handleDropdownChange('skills', e.target.value)}
        >
          <option value="">All Skills</option>
          {getUniqueValues('skills').map((skill) => (
            <option key={skill} value={skill}>
              {skill}
            </option>
          ))}
        </select>

        <select
          className="h-12 flex-1 min-w-[180px] border rounded px-3 text-sm shadow-sm"
          value={filters.status}
          onChange={(e) => handleDropdownChange('status', e.target.value)}
        >
          <option value="">All Statuses</option>
          {getStatuses().map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>

        <select
          className="h-12 flex-1 min-w-[180px] border rounded px-3 text-sm shadow-sm"
          value={filters.gender}
          onChange={(e) => handleDropdownChange('gender', e.target.value)}
        >
          <option value="">All Genders</option>
          {getUniqueValues('gender').map((gender) => (
            <option key={gender} value={gender}>{gender}</option>
          ))}
        </select>

        <select
          className="h-12 flex-1 min-w-[180px] border rounded px-3 text-sm shadow-sm"
          value={filters.race}
          onChange={(e) => handleDropdownChange('race', e.target.value)}
        >
          <option value="">All Races</option>
          {getUniqueValues('race').map((race) => (
            <option key={race} value={race}>{race}</option>
          ))}
        </select>

        <button
          onClick={() => {
            setNameFilter('');
            setFilters({
              location: '',
              jobTitle: '',
              skills: '',
              status: '',
              gender: '',
              race: ''
            });
          }}
          className="h-12 px-4 rounded bg-gray-200 hover:bg-gray-300 text-sm"
        >
          Clear Filters
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border rounded-md text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border-b">No</th>
              <th className="p-2 border-b">Email</th>
              <th className="p-2 border-b">First Name</th>
              <th className="p-2 border-b">Last Name</th>
              <th className="p-2 border-b">Location</th>
              <th className="p-2 border-b">Job Title</th>
              <th className="p-2 border-b">Skills</th>
              <th className="p-2 border-b">Status</th>
              <th className="p-2 border-b">Gender</th>
              <th className="p-2 border-b">Race</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((entry, idx) => (
                <tr key={entry.applicant.email} className="border-t hover:bg-gray-50">
                  <td className="p-2">{idx + 1}</td>
                  <td className="p-2">{entry.applicant.email}</td>
                  <td className="p-2">{entry.applicant.name}</td>
                  <td className="p-2">{entry.applicant.surname}</td>
                  <td className="p-2">{entry.applicant.location.province.name.replace(/_/g, ' ')}</td>
                  <td className="p-2">{entry.jobPosting?.jobTitle || ''}</td>
                  <td className="p-2">{getSkillNames(entry.applicant.applicantSkill).replace(/_/g, ' ')}</td>
                  <td className="p-2">{entry.status.name || 'N/A'}</td>
                  <td className="p-2">{entry.applicant.gender.name}</td>
                  <td className="p-2">{entry.applicant.race.name}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="p-4 text-center text-gray-500">
                  No matching records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Database;
