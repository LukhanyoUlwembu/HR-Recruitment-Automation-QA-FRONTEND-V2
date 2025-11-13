import React, { useState, useRef, useEffect } from "react";
import EducationSection from "../components/education/EducationSection";
import ExperienceSection from "../components/experience/ExperienceSection";
import Input from "../components/common/Input";
import DropdownSelect from "../components/common/DropdownSelect";
import AddressAutocomplete from "../components/map/AddressAutocomplete"; 

import Select from "react-select";
import { BASE_URL } from './useAuth';

const CVForm = () => {
  const educationRef = useRef();
  const experienceRef = useRef();
  const fileInputRef = useRef();

  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    age: "",
    idNumber: "",
    passport: "",
    address: "",
    city: "",
    provinceId: "",
    zip: "",
    gender: "",
    disabilityDescription:"",
    disabilityAccomodation:"",
    hasDisability:false,
    version:""
  });

  const [profile, setProfile] = useState({});
  const [skills, setSkills] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [fileTypes, setFileTypes] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedFileView, setselectedFileView] = useState([]);
  const [activeTab, setActiveTab] = useState("education");
  const [selectedFileType, setSelectedFileType] = useState("");
  const [gender, setGender] = useState([]);
  const [race, setRace] = useState([]);
  const [popupMessage, setPopupMessage] = useState("");   
  const [showPopup, setShowPopup] = useState(false);      
const genderOptions = gender
  .filter(g => g && g.name) // skip invalid objects
  .map(g => ({
    value: g.id,          // or g.id if you want the ID
    label: g.name.replace(/_/g, " ")
  }));

const raceOptions = race
  .filter(g => g && g.name)
  .map(g => ({
    value: g.id,          // or g.id
    label: g.name.replace(/_/g, " ")
  }));


  const [deletedFileIds, setDeletedFileIds] = useState([]);
  const [deletedExperienceIds, setDeletedExperienceIds] = useState([]);
  const [deletedEducationIds, setDeletedEducationIds] = useState([]);
  const [deletedSkillIds, setDeletedSkillIds] = useState([]);

const handleAddressSelect = ({ address, city, provinceId,street, zip, lat, lng }) => {
  setFormData((prev) => ({
    ...prev,
    address, 
    city,
    provinceId,
    street,
    zip,
    lat,
    lng,
  }));
  setShowAutocomplete(false); 
};


  useEffect(() => {
    const userId = sessionStorage.getItem("userId");

    const fetchProfile = async () => {
      const res = await fetch(`${BASE_URL}/applicants/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setFormData({
          firstName: data.name || "",
          lastName: data.surname || "",
          email: data.email || "",
          phone: data.phone || "",
          age: data.age || "",
          idNumber: data.idNumber || "",
          passport: data.passport || "",
          address: data.location?.street || "",
          city: data.location?.city || "",
          provinceId: data.location?.province.id || "",
          zip: data.location?.zipCode || "",
          gender: data.gender?.id ||"",
          race: data.race?.id ||"",
          hasDisability:data.hasDisability||false,
          disabilityDescription:data.disabilityDescription||"",
          disabilityAccomodation:data.disabilityAccomodation||"",
          version:data.version
        });
        setSelectedTags(data.applicantSkill?.map(s => s.skillName) || []);
setselectedFileView(
  (data.applicantFile || [])
    .map(f => ({
      file: null,
      fileType: f.fileType,
      fileName: f.fileName,
      addId: f.addId,
      filePath: f.filePath
    }))
);

      }
    };

    const fetchDropdown = async () => {
      const [skillsRes, fileTypesRes, provincesRes, genderRes,raceRes] = await Promise.all([
        fetch(`${BASE_URL}/dropdown/skills`),
        fetch(`${BASE_URL}/file-types/applicant`),
        fetch(`${BASE_URL}/dropdown/provinces`),
        fetch(`${BASE_URL}/dropdown/genders`),
        fetch(`${BASE_URL}/dropdown/races`)
      ]);

      if (skillsRes.ok) setSkills(await skillsRes.json());
      if (fileTypesRes.ok) setFileTypes(await fileTypesRes.json());
      if (provincesRes.ok) setProvinces(await provincesRes.json());
      if (genderRes.ok) setGender(await genderRes.json());
      if (raceRes.ok) setRace(await raceRes.json());
    };

    fetchProfile();
    fetchDropdown();
  }, []);

  const handleInputChange = (e) => {
   const { name, value, type, checked } = e.target;
        
        if (['age', 'idNumber', 'zip'].includes(name)) {
          if (value && !/^\d*$/.test(value)) {
            return;
          }
        }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'idNumber' && value ? { passport: '' } : {}),
      ...(name === 'passport' && value ? { idNumber: '' } : {})
    }));
  };

  const handleFileChange = (e) => {
  const file = e.target.files[0];
  
  if (!file) return;
  
  // Check if document type is selected
  if (!selectedFileType) {
    setPopupMessage("Please select a document type before uploading a file.");
    setShowPopup(true);
    return;
  }
  
  // Check file type
  const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
  const validExtensions = ['.pdf', '.docx', '.doc'];
  const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  
  if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
    setPopupMessage("Please upload only PDF or DOCX files");
    setShowPopup(true);
    return;
  }
  
  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size > maxSize) {
    setPopupMessage("File size exceeds 5MB limit");
    setShowPopup(true);
    return;
  }
  
  // Check for duplicate file names
  const fileNameExists = selectedFiles.some(f => f.file.name === file.name);
  if (fileNameExists) {
    setPopupMessage("A file with this name has already been added.");
    setShowPopup(true);
    return;
  }
  
  // If all validations pass, add the file
  setSelectedFiles(prev => [...prev, { file, fileType:selectedFileType }]);
  setselectedFileView(prev => [...prev, { file, fileType: selectedFileType}]);
  setSelectedFileType("");
  
  // Reset the file input
  e.target.value = '';
};

const handleDeleteSkill = (skill) => {
  const matched = profile.applicantSkill?.find(s => s.skillName === skill.value);
  if (matched?.id) {
    setDeletedSkillIds(prev => [...prev, matched.id]);
  }
  setSelectedTags(prev => prev.filter(t => t.value !== skill.value));
};


  const handleSubmit = async () => {
    event.preventDefault();
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = "First name is required.";
    if (!formData.lastName) newErrors.lastName = "Last name is required.";
    if (!formData.email) {
      newErrors.email = "Email is required.";
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
      newErrors.email = "Invalid email format.";
    }
    if (!formData.phone) newErrors.phone = "Phone number is required.";
    if (!formData.age) newErrors.age = "Age is required.";
    if (!formData.address) newErrors.address = "Street address is required.";
    if (!formData.city) newErrors.city = "City is required.";
    if (!formData.provinceId) newErrors.provinceId = "Province is required.";
    if (!formData.zip) newErrors.zip = "ZIP Code is required.";
    if (!formData.idNumber && !formData.passport) {
      newErrors.idNumber = "ID or Passport is required.";
      newErrors.passport = "ID or Passport is required.";
    }
   if (!formData.gender) newErrors.gender = "Gender is required.";
   if (!formData.race) newErrors.race = "Population group is required.";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Delete entries
    const deleteRequests = [
      ...deletedFileIds.map(id => fetch(`${BASE_URL}/applicants/file/${id}`, { method: 'DELETE' })),
      ...deletedExperienceIds.map(id => fetch(`${BASE_URL}/applicants/experience/${id}`, { method: 'DELETE' })),
      ...deletedEducationIds.map(id => fetch(`${BASE_URL}/applicants/education/${id}`, { method: 'DELETE' })),
      ...deletedSkillIds.map(id => fetch(`${BASE_URL}/applicants/skill/${id}`, { method: 'DELETE' }))
    ];

    await Promise.all(deleteRequests);

    const userId = sessionStorage.getItem("userId");
    const form = new FormData();

    const rawExperience = experienceRef.current?.getData?.() || [];
    // eslint-disable-next-line no-unused-vars
    const cleanExperience = rawExperience.map(({ viewOnly, id, ...rest }) => rest);

    const rawEducation = educationRef.current?.getData?.() || [];
    // eslint-disable-next-line no-unused-vars
    const cleanEducation = rawEducation.map(({ viewOnly, tempId, ...rest }) => rest);

    // eslint-disable-next-line no-unused-vars
    const cleanFiles = selectedFileView.filter(f => f.addId != null).map(({ file, ...rest }) => rest);
   console.log(formData.provinceId);
    const payload = {
      applicantId: userId,
      name: formData.firstName,
      surname: formData.lastName,
      email: formData.email,
      age: formData.age,
      passport: formData.passport,
      phone: formData.phone,
      password: profile.password,
      idNumber: formData.idNumber,
      race:{id:formData.race},
      gender:{id:formData.gender},
      version:formData.version,
      hasDisability:formData.hasDisability,
      disabilityDescription:formData.disabilityDescription,
      disabilityAccomodation:formData.disabilityAccomodation,
      location: {
        locationId: profile?.location?.locationId,
        street: formData.address,
        city: formData.city,
        province: {id:formData.provinceId},
        zipCode: formData.zip
      },
      applicantEducations: cleanEducation,
      workExperiences: cleanExperience,
      applicantFile: cleanFiles,
      applicantSkill: selectedTags.map(skill => ({skillName: { id: skill.value }
}))

    };

    form.append("payload", JSON.stringify(payload));

    selectedFiles.forEach(({ file, fileType }, index) => {
      if (file) {
        form.append(`files`, file);
        form.append(`fileType_${index}`, fileType);
      }
    });

    try {
      const response = await fetch(`${BASE_URL}/applicants/${userId}`, {
        method: "PUT",
        body: form
      });

      if (response.ok) {
        setPopupMessage("Profile updated successfully!");
        setShowPopup(true);
        setDeletedEducationIds([]);
        setDeletedExperienceIds([]);
        setDeletedSkillIds([]);
        setDeletedFileIds([]);
        const data = await response.json();
        setProfile(data);
        setFormData({
         firstName: data.name || "",
          lastName: data.surname || "",
          email: data.email || "",
          phone: data.phone || "",
          age: data.age || "",
          idNumber: data.idNumber || "",
          passport: data.passport || "",
          address: data.location?.street || "",
          city: data.location?.city || "",
          provinceId: data.location?.province.id || "",
          zip: data.location?.zipCode || "",
          gender: data.gender.id,
          race: data.race.id,
          hasDisability:data.hasDisability||false,
          disabilityDescription:data.disabilityDescription||"",
          disabilityAccomodation:data.disabilityAccomodation||"",
          version:data.version
        });
      } else {
        setPopupMessage("Failed to update profile.");
        setShowPopup(true);
      }
    } catch (err) {
      console.error("Error saving applicant:", err);
       setPopupMessage("An error occurred while saving the profile.");
    }
  };

  
  

  const renderTabContent = () => (
    <>
      <div style={{ display: activeTab === "education" ? "block" : "none" }}>
        <EducationSection
          ref={educationRef}
          initialEntries={profile.applicantEducations || []}
          onDelete={id => setDeletedEducationIds(prev => [...prev, id])}
        />
      </div>
      <div style={{ display: activeTab === "experience" ? "block" : "none" }}>
        <ExperienceSection
          ref={experienceRef}
          initialEntries={profile.workExperiences || []}
          onDelete={id => setDeletedExperienceIds(prev => [...prev, id])}
        />
      </div>
<div style={{ display: activeTab === "skills" ? "block" : "none" }}>
  <h2 className="text-lg font-semibold mb-2">Skills</h2>
  <Select
    options={skills.map(skill => ({
      value: skill.id,
      label: skill.name ? skill.name.replace(/_/g, " ") : ""
    }))}
    onChange={(selected) => {
      if (selected && !selectedTags.find(t => t.value === selected.value)) {
        setSelectedTags([...selectedTags, selected]);
      }
    }}
    placeholder="Select a skill..."
  />
  <div className="flex flex-wrap gap-2 mt-2">
    {selectedTags.map(tag => (
      <span
        key={tag.value}
        className="bg-gray-200 text-sm px-3 py-1 rounded-full"
      >
        {tag.name || tag.label||""}
        <button
          onClick={() => handleDeleteSkill(tag)}
          className="ml-2 text-red-500 hover:text-red-700"
        >
          ×
        </button>
      </span>
    ))}
  </div>
</div>

    </>
  );
 const [showAutocomplete, setShowAutocomplete] = useState(false); 
  return (
    <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-md p-8">
      <h2 className="text-xl font-semibold mb-6">Upload Your Documents</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Document Type</label>
<select
  value={selectedFileType}
  onChange={(e) => setSelectedFileType(e.target.value)}
  className="w-full border border-gray-300 rounded px-3 py-2"
>
  <option value="">Select Document Type</option>
  {fileTypes
    .filter(ft =>ft.name !== "EA1"
      && ft.name !== "Organogram File" && ft.name !== "Take on Form"
      && ft.name !== "Consent" && ft.name !== "Proof of Tax"
      && ft.name !== "Proof of Account"
    )
                .map(ft => (
      <option key={ft.id} value={ft.name}>
        {ft.name.replace(/_/g, " ")}
      </option>
    ))}
</select>

          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-blue-400"
          >
            <p className="text-sm text-gray-600">Click to upload file</p>
            <p className="text-xs text-gray-500 mt-1">(Only PDF and DOCX files, max 5MB)</p>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.docx,.doc"/>
          </div>

          <div className="mt-4 space-y-2">
  {selectedFileView.map(({ file, fileType, fileName }, index) => {
    return (
      <div key={index} className="border p-2 rounded flex justify-between items-center">
        <div>
          <p className="text-sm font-semibold"> {typeof fileType === "string" ? fileType: fileType?.name}</p>
          <p className="text-sm text-gray-600">{file?.name || fileName}</p>
        </div>
        <div className="flex items-center gap-2">
         
          <button
            onClick={() => setselectedFileView(selectedFileView.filter((_, i) => i !== index))}
            className="bg-red-500 text-white px-3 py-1 rounded text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    );
  })}
</div>

        </div>

        <div className="col-span-2">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} error={errors.firstName}/>
            <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} error={errors.lastName}/>
          </div>
          <Input label="Email Address" name="email" value={formData.email} onChange={handleInputChange} error={errors.email}/>
          <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleInputChange} error={errors.phone}/>
           <div className="grid grid-cols-2 gap-4">
            <Input label="ID Number" name="idNumber" value={formData.idNumber} onChange={handleInputChange} disabled={!!formData.passport} maxLength={13} error={errors.idNumber}/>
            <Input label="Passport Number" name="passport" value={formData.passport} onChange={handleInputChange} disabled={!!formData.idNumber} maxLength={9} error={errors.passport}/>
          </div>
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="">Select Gender</option>
                    {genderOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                </div>
                  <div>
                  <label className="block text-sm font-medium mb-1">Race</label>
                  <select
                    name="race"
                    value={formData.race}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="">Select Race</option>
                    {raceOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  {errors.race && <p className="text-red-500 text-xs mt-1">{errors.race}</p>}
                </div>
              </div>
          <Input label="Age" name="age" value={formData.age} onChange={handleInputChange} error={errors.age}/>
          {showAutocomplete ? (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Search Address</label>
              <AddressAutocomplete onAddressSelect={handleAddressSelect} />
            </div>
          ) : (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Address</label>
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm px-3 py-2 border rounded bg-gray-100 flex-1">
                  {formData.address}
                </div>
                <button
                  type="button"
                  onClick={() => setShowAutocomplete(true)}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Change
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <Input label="City" name="city" value={formData.city} onChange={handleInputChange} error={errors.city}/>
            <DropdownSelect
              label="Province"
              name="province"
              options={provinces}
              value={formData.provinceId}
              error={errors.provinceId}
              onChange={(e) => setFormData({ ...formData, provinceId: e.target.value })}
            /> 
              <Input label="ZIP Code" name="zip" value={formData.zip} onChange={handleInputChange} error={errors.zip}/>
          </div>
            <div className="mt-4">
    <label className="flex items-center space-x-2 text-sm">
      <input type="checkbox" name="hasDisability" checked={formData.hasDisability || false} onChange={(e) => setFormData({ ...formData, hasDisability: e.target.checked }) } />
      <span>Do you have a disability?</span>
    </label>
  </div>

  {/* Conditional Disability Description Field */} 
  {formData.hasDisability && (
    <><div className="mt-2">
              <Input label="Please specify your disability" name="disabilityDescription" value={formData.disabilityDescription || ""} onChange={handleInputChange} error={errors.disabilityDescription} />
            </div>
            <div className="mt-2">
                <Input label="Please specify how the company can accomodate your disability" name="disabilityAccomodation" value={formData.disabilityAccomodation || ""} onChange={handleInputChange} error={errors.disabilityAccomodation} />
              </div></>
  )}
        </div>
      </div>

      <div className="mt-10">
        <div className="flex gap-2 mb-4">
          {["education", "experience", "skills"].map(tab => (
            <button
              key={tab}
              className={`px-4 py-2 border rounded-t-md ${activeTab === tab ? "bg-white border-b-transparent" : "bg-gray-100 border-b"}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <div className="border border-t-0 p-6 bg-white">
          {renderTabContent()}
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button
          type="submit"
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Save Profile
        </button>
      </div>
       {/* === Inline Popup Modal === */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-80 text-center relative">
            <button
              className="absolute top-2 right-3 text-gray-400 hover:text-red-600 text-xl"
              onClick={() => setShowPopup(false)}
            >
              &times;
            </button>
            <p className="text-gray-800 text-lg">{popupMessage}</p>
            <button
              onClick={() => setShowPopup(false)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CVForm;
