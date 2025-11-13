import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { useParams, useNavigate } from 'react-router-dom';
import { BASE_URL } from './useAuth';
import { FaSpinner } from "react-icons/fa";

const ApplicantProfile = () => {
  const [profile, setProfile] = useState({});
  const [application, setApplication] = useState({});
  const [loading, setLoading] = useState(false);
  const [voting, setVoting] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('Information');
  const [formData, setFormData] = useState({
    formNotes: ""
  });
  
  const navigate = useNavigate();
  const { id, jobId } = useParams();
  
  const name = sessionStorage.getItem("empName");
  const email = sessionStorage.getItem("empEmail");

  useEffect(() => {
    const fetchApplicant = async () => {
      setLoading(true);
      try {
        const responseProfile = await fetch(`${BASE_URL}/applicants/${id}`);
        const responseApplication = await fetch(`${BASE_URL}/applications/${jobId}`);
        if (!responseProfile.ok || !responseApplication.ok) {
          throw new Error('Failed to fetch applicant data. Please reload.');
        }
        const dataProfile = await responseProfile.json();
        const dataApplication = await responseApplication.json();
        setProfile(dataProfile);
        setApplication(dataApplication);
      } catch (err) {
        console.error(err.message);
        setModalMessage("You already casted a vote for this applicant.");
        setShowModal(true);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicant();
  }, [id, jobId]);

  // Submit vote on application with notes
  const submitVote = async (decision) => {
    if (!formData.formNotes || formData.formNotes.trim() === "") {
      setModalMessage("Please add notes before voting.");
      setShowModal(true);
      return;
    }

    const payload = {
      decision: decision,
      notes: formData.formNotes,
      status: application.status,
      name: name,
      signature: email,
    };

    setVoting(true);
    try {
      const response = await fetch(`${BASE_URL}/applications/pass-vote/${jobId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const updatedApplication = await response.json();
        setApplication(updatedApplication);
        setModalMessage("Your vote has been recorded.");
        navigate("/dashboard");
      } else {
        setModalMessage("You already casted a vote for this applicant.");
      }
    } catch (err) {
      setModalMessage("Something went wrong while voting.");
      console.error(err.message);
    } finally {
      setVoting(false);
      setShowModal(true);
    }
  };

  const initials =
    (profile.name ? profile.name[0] : '') +
    (profile.surname ? profile.surname[0] : '');

  const sortedEdu = [...(profile.applicantEducations || [])].sort(
    (a, b) => new Date(b.dateObtained) - new Date(a.dateObtained)
  );
  const sortedExp = [...(profile.workExperiences || [])].sort(
    (a, b) => new Date(b.startDate) - new Date(a.startDate)
  );

  return (
    <div className="border p-8 rounded-md shadow-2xl">
      {/* Header */}
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

      {/* Tabs */}
      <div className="flex justify-center space-x-4 my-6 text-lg">
        {["Information", "Documents", "Action"].map((tab) => (
          <p
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`cursor-pointer hover:underline ${
              activeTab === tab ? "font-bold underline" : ""
            }`}
          >
            {tab}
          </p>
        ))}
      </div>

      {/* Information Section */}
      {activeTab === "Information" && (
        <>
          <div className="flex justify-center space-x-9 mb-6">
            {[
              {
                icon: profile.applicantSkill?.length ?? 0,
                title: "Skills Added",
                subtitle: `${profile.applicantSkill?.length ?? 0} skill(s)`
              },
              {
                icon: profile.applicantEducations?.length ?? 0,
                title: "Education Records",
                subtitle: `${profile.applicantEducations?.length ?? 0} total`
              },
              {
                icon: profile.applicantFile?.length ?? 0,
                title: "Documents",
                subtitle: `${profile.applicantFile?.length ?? 0} uploaded`
              }
            ].map((item, i) => (
              <div key={i} className="flex items-center space-x-3">
                <p className="text-white text-2xl font-bold p-3 border-2 rounded-full w-16 h-16 text-center bg-blue-500 flex items-center justify-center">
                  {item.icon}
                </p>
                <div className="pt-4 text-base">
                  <p className="border-b font-medium">{item.title}</p>
                  <p className="text-gray-600 -mt-1">{item.subtitle}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="text-center mb-6">
            <p className="text-xl font-semibold">Summary</p>
            <p className="text-[15px] text-gray-700 mt-1">
              {sortedEdu.length > 0 && (
                <>
                  Holds a <strong>{sortedEdu[0].educationGrade.name.replace(/_/g, ' ')} </strong> 
                  from <strong>{sortedEdu[0].institution}</strong>.
                </>
              )}
              {sortedExp.length > 0 && (
                <>
                  {' '}
                  {sortedExp[0].current ? (
                    <>
                      Currently working as a <strong>{sortedExp[0].jobTitle}</strong> at{" "}
                      <strong>{sortedExp[0].companyName}</strong> since{" "}
                      {new Date(sortedExp[0].startDate).toLocaleDateString()}.
                    </>
                  ) : (
                    <>
                      Previously worked as a <strong>{sortedExp[0].jobTitle}</strong> at{" "}
                      <strong>{sortedExp[0].companyName}</strong> from{" "}
                      {new Date(sortedExp[0].startDate).toLocaleDateString()} to{" "}
                      {new Date(sortedExp[0].endDate).toLocaleDateString()}.
                    </>
                  )}
                </>
              )}
              {sortedEdu.length === 0 && sortedExp.length === 0 && (
                <>No education or work experience information available.</>
              )}
            </p>
          </div>

          {/* Cards */}
          <div className="flex justify-center flex-wrap gap-4">
            <div className="w-48 h-auto border-2 rounded-xl p-2 shadow-sm hover:shadow-md">
              <p className="font-semibold">Skills</p>
              <ul className="text-sm list-disc ml-4">
                {profile.applicantSkill?.map((skill) => (
                  <li key={skill.applicantSkiillId}>
                    {skill.skillName.name.replace(/_/g, ' ')}
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-48 h-auto border-2 rounded-xl p-2 shadow-sm hover:shadow-md">
              <p className="font-semibold">Experience</p>
              <ul className="text-sm list-disc ml-4">
                {sortedExp.map((exp) => (
                  <li key={exp.workExperienceId}>
                    {exp.jobTitle} @ {exp.companyName}
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-48 h-auto border-2 rounded-xl p-2 shadow-sm hover:shadow-md">
              <p className="font-semibold">Education</p>
              <ul className="text-sm list-disc ml-4">
                {sortedEdu.map((edu) => (
                  <li key={edu.educationId}>
                    {edu.educationGrade.name.replace(/_/g, ' ') } - {edu.educationName} - {edu.institution}
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-48 h-auto border-2 rounded-xl p-2 shadow-sm hover:shadow-md">
  <p className="font-semibold mb-2">Affiliation</p>
  <ul className="text-sm list-disc ml-4 space-y-1">
    <li>Currently work at Ulwembu: {profile.conflictOfInterest?.workCurrent ? "Yes" : "No"}</li>
    <li>Worked at Ulwembu before: {profile.conflictOfInterest?.workBefore ? "Yes" : "No"}</li>
    <li>Has relatives at Ulwembu: {profile.conflictOfInterest?.relatives ? "Yes" : "No"}</li>
    {profile.conflictOfInterest?.relatives && profile.conflictOfInterest?.relativesInfo && (
      <li className="ml-4 list-none">• {profile.conflictOfInterest.relativesInfo}</li>
    )}
    <li>Close friends/partners at Ulwembu: {profile.conflictOfInterest?.friends ? "Yes" : "No"}</li>
    {profile.conflictOfInterest?.friends && profile.conflictOfInterest?.friendsInfo && (
      <li className="ml-4 list-none">• {profile.conflictOfInterest.friendsInfo}</li>
    )}
    <li>Business relationship with Ulwembu: {profile.conflictOfInterest?.businessRelation ? "Yes" : "No"}</li>
    {profile.conflictOfInterest?.businessRelation && profile.conflictOfInterest?.businessInfo && (
      <li className="ml-4 list-none">• {profile.conflictOfInterest.businessInfo}</li>
    )}
  </ul>
</div>
          </div>
        </>
      )}

      {/* Documents Section */}
      {activeTab === "Documents" && (
        <div className="flex justify-center">
          <div className="overflow-x-auto w-[80%]">
            <table className="min-w-full table-fixed border rounded-md text-left border-separate">
              <thead>
                <tr>
                  <th className="p-2 border-b">Type</th>
                  <th className="p-2 border-b">File Name</th>
                  <th className="p-2 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {application.applicantFile?.map((doc, i) => {
                  const publicUrl = doc.filePath.replace(
                    "C:\\Users\\User\\OneDrive - Ulwembu Business Services\\Documents\\Backend\\uploads\\",
                    `${BASE_URL}/uploads/`
                  );
                  return (
                    <tr key={i}>
                      <td className="p-2 border-b">{doc.fileType.name.replace(/_/g, ' ')}</td>
                      <td className="p-2 border-b">{doc.fileName}</td>
                      <td className="p-2 border-b space-x-2">
                        <a
                          href={publicUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          View
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Notes Section */}
      {activeTab === "Action" && (
        <div className="mt-4">
          <p className="text-lg font-semibold mb-2">Cast Your Vote</p>

          <div className="mb-2">
            <p className="text-gray-700 text-sm">
              <strong>Current Status:</strong> {application.status.name}
            </p>
            <p className="text-gray-700 text-sm">
              <strong>Previous Notes:</strong> {application.notes || "No notes added."}
            </p>
          </div>

          <textarea
            rows="4"
            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300"
            placeholder="Write your thoughts here..."
            value={formData.formNotes}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, formNotes: e.target.value }))
            }
          ></textarea>

          <div className="flex items-center space-x-4 mt-4">
            <button
              onClick={() => submitVote(true)}
              disabled={
                voting || !["Application", "Screening", "Interview"].includes(application.status.name)
              }
              className={`px-4 py-2 rounded text-white ${
                ["Application", "Screening", "Interview"].includes(application.status.name)
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {voting ? <FaSpinner className="inline animate-spin mr-2" /> : null}
              Recommend
            </button>

            <button
              onClick={() => submitVote(false)}
              disabled={voting}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Reject
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
            <h2 className="text-lg font-bold mb-2 text-gray-800">Notification</h2>
            <p className="text-gray-700">{modalMessage}</p>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <FaSpinner className="animate-spin text-4xl text-blue-600" />
        </div>
      )}
    </div>
  );
};

export default ApplicantProfile;
