import React, { useState, useEffect } from 'react';
import { BASE_URL } from './useAuth';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FileText,
  ArrowLeft,
  Clock,
  Building,
  Briefcase
} from 'lucide-react';

export default function JobDescription() {
  const { id } = useParams();
  const nid = sessionStorage.getItem("userId");
  const navigate = useNavigate();

  const [jobsDetails, setJobDetails] = useState({});
  const [profile, setProfile] = useState({});
  const [availability, setAvailability] = useState([]);
  const [isApplied, setIsApplied] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    resume: null,
    coverLetter: null,
    availability: '',
  });

  const [selectedCVId, setSelectedCVId] = useState('');
  const [selectedCoverLetterId, setSelectedCoverLetterId] = useState('');

  useEffect(() => {
    const fetchApplicant = async () => {
      try {
        const response = await fetch(`${BASE_URL}/applicants/${nid}`);
        if (!response.ok) throw new Error('Reload Page');
        const data = await response.json();
        setProfile(data);
        setFormData({
          firstName: data.name || '',
          lastName: data.surname || '',
          email: data.email || '',
          phone: data.phone || '',
          resume: null,
          coverLetter: null,
          availability: '',
        });
      } catch (err) {
        console.log(err.message);
      }
    };
    fetchApplicant();
  }, [nid]);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const response = await fetch(`${BASE_URL}/dropdown/availability-options`);
        if (!response.ok) throw new Error('Reload Page');
        const data = await response.json();
        setAvailability(data);
      } catch (err) {
        console.log(err.message);
      }
    };
    fetchAvailability();
  }, []);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(`${BASE_URL}/postings/${id}`);
        if (!response.ok) throw new Error("Reload Page");
        const data = await response.json();
        setJobDetails(data);
      } catch (err) {
        console.log(err.message);
      }
    };
    fetchJob();
  }, [id]);

  useEffect(() => {
    const checkIfApplied = async () => {
      try {
        const response = await fetch(`${BASE_URL}/applications/exists/${nid}/${id}`);
        if (!response.ok) throw new Error("Reload Page");
        const data = await response.json();
        setIsApplied(data === true);
      } catch (err) {
        console.log(err.message);
      }
    };
    checkIfApplied();
  }, [id, nid]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData((prev) => ({ ...prev, [name]: files[0] }));
  };

  const getFilesByType = (type) => {
    return profile?.applicantFile?.filter((f) => f.fileType.name === type) || [];
  };

  const buildApplicationPayload = () => {
    return {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      availability: {id:Number(formData.availability)},
      selectedCVId,
      selectedCoverLetterId,
    };
  };
  console.log()
  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!selectedCVId && !formData.resume) newErrors.resume = 'Please select or upload a CV';
    if (!formData.availability) newErrors.availability = 'Availability is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const applyDirectly = async () => {
    const formDataToSend = new FormData();
    const jobApplied = {
      applicant: {
        applicantId: nid
      },
      jobPosting: {
        jobPostingId: id
      },
      applicantFile:[{
          addId:selectedCVId
      },
      {
        addId:selectedCoverLetterId
      }],
      availability:  {id:Number(formData.availability)}
    };

    formDataToSend.append(
      "application",
      new Blob([JSON.stringify(jobApplied)], { type: "application/json" })
    );

    if (formData.resume) {
      formDataToSend.append("cv", formData.resume);
    }
    if (formData.coverLetter) {
      formDataToSend.append("coverLetter", formData.coverLetter);
    }

    try {
      const response = await fetch(`${BASE_URL}/applications`, {
        method: "POST",
        body: formDataToSend
      });
      if (!response.ok) throw new Error("Failed to apply");
      navigate("/applications");
      setIsApplied(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApply = async () => {
    if (isApplied) return;

    if (!validateForm()) {
      return;
    }

    try {
      const prescreeningData = jobsDetails.prescreening;
      if (!prescreeningData || prescreeningData.length === 0) {
        await applyDirectly();
      } else {
        sessionStorage.setItem("pendingApplication", JSON.stringify(buildApplicationPayload()));
        navigate(`/prescreening/${id}`);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate('/jobs')}
          className="inline-flex items-center text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Jobs
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-blue-300">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-blue-100 p-2 rounded-full">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{jobsDetails.jobTitle}</h2>
            </div>

            <div className="space-y-4 text-gray-600">
              <div className="flex items-center gap-2"><Clock className="h-4 w-4" />{jobsDetails.type}</div>
              <div className="flex items-center gap-2"><Building className="h-4 w-4" />{jobsDetails.jobSector?.replace(/_/g, ' ')}</div>
              <div className="flex items-center gap-2"><Briefcase className="h-4 w-4" />{jobsDetails.contract}</div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-2">Job Description</h3>
              <p className="text-gray-600 whitespace-pre-line">{jobsDetails.jobDescription}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <form className="space-y-6 bg-white p-6 border border-blue-300 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Application Form</h2>

            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <h3 className="text-lg font-semibold text-blue-600">Basic Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    readOnly
                    placeholder="First Name"
                    className={`w-full px-3 py-2 border rounded-md shadow-sm ${errors.firstName ? 'border-red-500' : 'border-gray-300'} focus:ring-blue-500 focus:border-blue-500`}
                  />
                  {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
                </div>
                <div>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    readOnly
                    placeholder="Last Name"
                    className={`w-full px-3 py-2 border rounded-md shadow-sm ${errors.lastName ? 'border-red-500' : 'border-gray-300'} focus:ring-blue-500 focus:border-blue-500`}
                  />
                  {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    readOnly
                    placeholder="Email"
                    className={`w-full px-3 py-2 border rounded-md shadow-sm ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:ring-blue-500 focus:border-blue-500`}
                  />
                  {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                </div>
                <div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    readOnly
                    placeholder="Phone"
                    className={`w-full px-3 py-2 border rounded-md shadow-sm ${errors.phone ? 'border-red-500' : 'border-gray-300'} focus:ring-blue-500 focus:border-blue-500`}
                  />
                  {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg space-y-6">
              <h3 className="text-lg font-semibold text-blue-600">Documents</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resume / CV*</label>
                <select
                  value={selectedCVId}
                  onChange={(e) => setSelectedCVId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm mb-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select existing CV</option>
                  {getFilesByType("CV").map((f) => (
                    <option key={f.addId} value={f.addId}>{f.fileName}</option>
                  ))}
                </select>
                <input
                  type="file"
                  name="resume"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm ${errors.resume ? 'border-red-500' : 'border-gray-300'} focus:ring-blue-500 focus:border-blue-500`}
                  disabled={!!selectedCVId}
                />
                {errors.resume && <p className="text-red-500 text-sm">{errors.resume}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Letter</label>
                <select
                  value={selectedCoverLetterId}
                  onChange={(e) => setSelectedCoverLetterId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm mb-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select existing Cover Letter</option>
                  {getFilesByType("Cover Letter").map((f) => (
                    <option key={f.addId} value={f.addId}>{f.fileName}</option>
                  ))}
                </select>
                <input
                  type="file"
                  name="coverLetter"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                <select
                  name="availability"
                  value={formData.availability}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm ${errors.availability ? 'border-red-500' : 'border-gray-300'} focus:ring-blue-500 focus:border-blue-500`}
                >
                  <option value="">Select</option>
                  {availability.map((a) => (
                    <option key={a} value={a.id}>{a.name}</option>
                  ))}
                </select>
                {errors.availability && <p className="text-red-500 text-sm">{errors.availability}</p>}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleApply}
                type="button"
                disabled={isApplied}
                className={`px-8 py-2.5 rounded-md font-semibold transition duration-200 ease-in-out shadow-sm ${
                  isApplied
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                {isApplied ? "Applied" : "Apply"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
