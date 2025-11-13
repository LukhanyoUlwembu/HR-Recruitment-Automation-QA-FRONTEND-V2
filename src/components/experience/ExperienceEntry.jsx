    import {React,useState} from "react";
    import Select from "react-select";

    const ExperienceEntry = ({ entry, onChange, onRemove }) => {
  const [validationErrors, setValidationErrors] = useState({});

  const validateFields = () => {
    const errors = {};
    if (!entry.companyName.trim()) errors.companyName = "Company is required.";
    if (!entry.jobTitle.trim()) errors.jobTitle = "Job title is required.";
    if (!entry.duties.trim()) errors.duties = "Duties are required.";
    if (!entry.referenceName.trim()) errors.referenceName = "Reference name is required.";
    if (!entry.phoneNumber.trim()) errors.phoneNumber = "Phone number is required.";
    if (!entry.startDate.trim()) errors.startDate = "From date is required.";
    if (!entry.current && !entry.endDate.trim()) errors.endDate = "To date is required.";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (!validateFields()) return;
    onChange("viewOnly", true);
  };

  return (
    <div className="border border-gray-300 rounded p-4 space-y-4">
      <input
        type="text"
        placeholder="Company Name"
        value={entry.company}
        onChange={(e) => onChange("companyName", e.target.value)}
        className={`border rounded px-3 py-2 w-full ${validationErrors.companyName ? "border-red-500" : "border-gray-300"}`}
      />
      {validationErrors.companyName && <p className="text-red-500 text-sm">{validationErrors.companyName}</p>}

      <input
        type="text"
        placeholder="Job Title"
        value={entry.jobTitle}
        onChange={(e) => onChange("jobTitle", e.target.value)}
        className={`border rounded px-3 py-2 w-full ${validationErrors.jobTitle ? "border-red-500" : "border-gray-300"}`}
      />
      {validationErrors.jobTitle && <p className="text-red-500 text-sm">{validationErrors.jobTitle}</p>}

      <textarea
        placeholder="Duties"
        value={entry.duties}
        onChange={(e) => onChange("duties", e.target.value)}
        className={`border rounded px-3 py-2 w-full min-h-[100px] ${validationErrors.duties ? "border-red-500" : "border-gray-300"}`}
      />
      {validationErrors.duties && <p className="text-red-500 text-sm">{validationErrors.duties}</p>}

      <input
        type="text"
        placeholder="Reference Name"
        value={entry.referenceName}
        onChange={(e) => onChange("referenceName", e.target.value)}
        className={`border rounded px-3 py-2 w-full ${validationErrors.referenceName ? "border-red-500" : "border-gray-300"}`}
      />
      {validationErrors.referenceName && <p className="text-red-500 text-sm">{validationErrors.referenceName}</p>}

      <input
        type="text"
        placeholder="Phone Number"
        value={entry.phoneNumber}
        onChange={(e) => onChange("phoneNumber", e.target.value)}
        className={`border rounded px-3 py-2 w-full ${validationErrors.phoneNumber ? "border-red-500" : "border-gray-300"}`}
      />
      {validationErrors.phoneNumber && <p className="text-red-500 text-sm">{validationErrors.phoneNumber}</p>}

      <label>
        From Date
        <input
          type="date"
          value={entry.startDate}
          onChange={(e) => onChange("startDate", e.target.value)}
          className={`border rounded px-3 py-2 w-full ${validationErrors.startDate ? "border-red-500" : "border-gray-300"}`}
        />
      </label>
      {validationErrors.startDate && <p className="text-red-500 text-sm">{validationErrors.startDate}</p>}

      {!entry.current && (
        <>
          <label>
            To Date
            <input
              type="date"
              value={entry.endDate}
              onChange={(e) => onChange("endDate", e.target.value)}
              className={`border rounded px-3 py-2 w-full ${validationErrors.endDate ? "border-red-500" : "border-gray-300"}`}
            />
          </label>
          {validationErrors.endDate && <p className="text-red-500 text-sm">{validationErrors.endDate}</p>}
        </>
      )}

      <label>
        <input
          type="checkbox"
          checked={entry.current}
          onChange={(e) => onChange("current", e.target.checked)}
        />{" "}
        Currently Working Here
      </label>

      <div className="flex justify-end gap-2">
        <button
          onClick={handleSave}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Save
        </button>
        <button
          onClick={onRemove}
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
        >
          Close
        </button>
      </div>
    </div>
  );
};
    export default ExperienceEntry;
