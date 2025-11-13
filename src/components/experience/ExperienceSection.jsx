import React, { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import ExperienceEntry from "./ExperienceEntry";

const ExperienceSection = forwardRef(({ initialEntries = [], onDelete }, ref) => {
  const [entries, setEntries] = useState([]);

  const formatExperiences = (experienceList) => {
    return experienceList.map((exp) => ({
      workExperienceId: exp.workExperienceId,
      id: Date.now() + exp.workExperienceId,
      companyName: exp.companyName || "",
      jobTitle: exp.jobTitle || "",
      duties: exp.duties || "",
      referenceName: exp.referenceName || "",
      phoneNumber: exp.phoneNumber || "",
      startDate: exp.startDate?.split("T")[0] || "",
      endDate: exp.endDate?.split("T")[0] || "",
      current: exp.current || false,
      version:exp.version,
      viewOnly: true,
    }));
  };

  useEffect(() => {
    const fetchExperienceData = async () => {
      try {
        const idp = sessionStorage.getItem("userId");
        const response = await fetch(`http://localhost:8080/applicants/${idp}`);
        if (response.ok) {
          const data = await response.json();
          const workExperiences = data.workExperiences || [];
          const formatted = formatExperiences(workExperiences);
          setEntries(formatted);
        } else if (initialEntries.length > 0) {
          setEntries(formatExperiences(initialEntries));
        }
      } catch (err) {
        console.error("Error fetching experience:", err.message);
        if (initialEntries.length > 0) {
          setEntries(formatExperiences(initialEntries));
        }
      }
    };

    fetchExperienceData();
  }, [initialEntries]);

  useImperativeHandle(ref, () => ({
    validate: () => {
      const hasUnsaved = entries.some((entry) => !entry.viewOnly);
      return hasUnsaved ? "Please save or remove all experience entries." : null;
    },
    getData: () => entries,
    setData: (data) => {
      const formatted = formatExperiences(data);
      setEntries(formatted);
    },
  }));

  const handleChange = (id, field, value) => {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
  };

  const addEntry = () => {
    const hasUnsaved = entries.some((entry) => !entry.viewOnly);
    if (hasUnsaved) {
      alert("Please save or close the current experience entry before adding a new one.");
      return;
    }
    setEntries((prev) => [
      ...prev,
      {
        id: Date.now(),
        companyName: "",
        jobTitle: "",
        duties: "",
        referenceName: "",
        phoneNumber: "",
        startDate: "",
        endDate: "",
        current: false,
        viewOnly: false,
      },
    ]);
  };

  const removeEntry = (id) => {
    const entry = entries.find(e => e.id === id);
    if (entry?.workExperienceId && onDelete) {
      onDelete(entry.workExperienceId); // Notify parent to delete from backend
    }
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Experience</h2>
      {entries.map((entry) =>
        entry.viewOnly ? (
          <div key={entry.id} className="border border-gray-300 rounded p-4 space-y-4">
            <div className="flex justify-between">
              <div>
                <h3 className="text-lg font-semibold">{entry.companyName || "Company Name"}</h3>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => handleChange(entry.id, "viewOnly", false)}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => removeEntry(entry.id)}
                  className="text-red-600 hover:underline text-sm"
                >
                  Delete
                </button>
              </div>
            </div>

            <div
              className="prose prose-sm"
              dangerouslySetInnerHTML={{
                __html: entry.duties || "<p>No duties listed.</p>",
              }}
            />

            <div className="text-sm text-gray-700 space-y-1">
              <p>
                <strong>Reference:</strong> {entry.referenceName} ({entry.phoneNumber})
              </p>
              <p>
                <strong>Duration:</strong> {entry.startDate} - {entry.current ? "Present" : entry.endDate}
              </p>
            </div>
          </div>
        ) : (
          <ExperienceEntry
            key={entry.id}
            entry={entry}
            onChange={(field, value) => handleChange(entry.id, field, value)}
            onRemove={() => removeEntry(entry.id)}
          />
        )
      )}
      <div className="flex justify-end">
        <button
          onClick={addEntry}
          className="bg-blue-600 text-white px-6 py-2 rounded-md"
        >
          Add Experience
        </button>
      </div>
    </div>
  );
});

export default ExperienceSection;
