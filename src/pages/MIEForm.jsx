import { useState } from "react";

export default function MieProcessingForm() {
  const [formData, setFormData] = useState({
    companyName: "",
    companyEmail: "",
    agentName: "",
    agentMobile: "",

    surname: "",
    fullNames: "",
    maidenName: "",
    candidateMobile: "",
    dob: "",
    idNumber: "",
    idDescription: "",

    checks: {
      credit: false,
      sanctions: false,
      qualification: false,
      identity: false,
      employment: false,
      insurance: false,
      criminal: false,
      drivers: false,
      fraud: false,
      social: false,
    },

    signature: "",
    date: "",
  });

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const updateCheck = (name) => {
    setFormData({
      ...formData,
      checks: {
        ...formData.checks,
        [name]: !formData.checks[name],
      },
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("FORM DATA:", formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto bg-white shadow-md p-8 rounded-xl space-y-8"
    >
      {/* ===========================================================
          COMPANY DETAILS
      ============================================================ */}
      <section>
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">
          Company Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium">Company Name</label>
            <input
              type="text"
              value={formData.companyName}
              onChange={(e) => updateField("companyName", e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={formData.companyEmail}
              onChange={(e) => updateField("companyEmail", e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Agent Name</label>
            <input
              type="text"
              value={formData.agentName}
              onChange={(e) => updateField("agentName", e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Mobile No</label>
            <input
              type="text"
              value={formData.agentMobile}
              onChange={(e) => updateField("agentMobile", e.target.value)}
              className="input"
            />
          </div>
        </div>
      </section>

      {/* ===========================================================
          PERSONAL INFORMATION
      ============================================================ */}
      <section>
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">
          Candidate Personal Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium">Surname</label>
            <input
              type="text"
              value={formData.surname}
              onChange={(e) => updateField("surname", e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Full Names</label>
            <input
              type="text"
              value={formData.fullNames}
              onChange={(e) => updateField("fullNames", e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Maiden Name</label>
            <input
              type="text"
              value={formData.maidenName}
              onChange={(e) => updateField("maidenName", e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Mobile Number</label>
            <input
              type="text"
              value={formData.candidateMobile}
              onChange={(e) => updateField("candidateMobile", e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Date of Birth</label>
            <input
              type="date"
              value={formData.dob}
              onChange={(e) => updateField("dob", e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">ID / Identifier</label>
            <input
              type="text"
              value={formData.idNumber}
              onChange={(e) => updateField("idNumber", e.target.value)}
              className="input"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium">
            Description of Identifier
          </label>
          <input
            type="text"
            value={formData.idDescription}
            onChange={(e) => updateField("idDescription", e.target.value)}
            placeholder="e.g. SA ID, Zimbabwean Passport"
            className="input"
          />
        </div>
      </section>

      {/* ===========================================================
          BACKGROUND CHECKS
      ============================================================ */}
      <section>
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">
          Background Screening Checks
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(formData.checks).map((key) => (
            <label key={key} className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.checks[key]}
                onChange={() => updateCheck(key)}
                className="h-5 w-5"
              />
              <span className="capitalize">{key.replace("_", " ")}</span>
            </label>
          ))}
        </div>
      </section>

      {/* ===========================================================
          SIGNATURE
      ============================================================ */}
      <section>
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">
          Acknowledgment & Signature
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Signature</label>
            <input
              type="text"
              value={formData.signature}
              onChange={(e) => updateField("signature", e.target.value)}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => updateField("date", e.target.value)}
              className="input"
            />
          </div>
        </div>
      </section>

      {/* ===========================================================
          SUBMIT BUTTON
      ============================================================ */}
      <button
        type="submit"
        className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
      >
        Submit
      </button>
    </form>
  );
}
