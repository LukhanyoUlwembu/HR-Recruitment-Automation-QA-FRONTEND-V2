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

  const Section = ({ title, children }) => (
    <section className="bg-white/70 backdrop-blur-sm border border-gray-200 shadow-sm p-6 rounded-2xl space-y-6">
      <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
        {title}
      </h2>
      {children}
    </section>
  );

  const Input = ({ label, ...props }) => (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        {...props}
        className="max-w-4xl border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
      />
    </div>
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full mx-auto my-0 space-y-10 p-6 md:p-10 bg-gradient-to-br from-gray-50 via-white to-gray-100 shadow-xl rounded-none min-h-screen"
    >
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
        MIE Background Screening Request Form
      </h1>
      <p className="text-center text-gray-600 max-w-xl mx-auto mb-8">
        Please complete all sections accurately. This form assists in processing
        the candidate's background screening request.
      </p>

      {/* Company Details */}
      <Section title="Company Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Company Name"
            type="text"
            value={formData.companyName}
            onChange={(e) => updateField("companyName", e.target.value)}
          />

          <Input
            label="Email"
            type="email"
            value={formData.companyEmail}
            onChange={(e) => updateField("companyEmail", e.target.value)}
          />

          <Input
            label="Agent Name"
            type="text"
            value={formData.agentName}
            onChange={(e) => updateField("agentName", e.target.value)}
          />

          <Input
            label="Mobile No"
            type="text"
            value={formData.agentMobile}
            onChange={(e) => updateField("agentMobile", e.target.value)}
          />
        </div>
      </Section>

      {/* Personal Info */}
      <Section title="Candidate Personal Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Surname"
            type="text"
            value={formData.surname}
            onChange={(e) => updateField("surname", e.target.value)}
          />

          <Input
            label="Full Names"
            type="text"
            value={formData.fullNames}
            onChange={(e) => updateField("fullNames", e.target.value)}
          />

          <Input
            label="Maiden Name"
            type="text"
            value={formData.maidenName}
            onChange={(e) => updateField("maidenName", e.target.value)}
          />

          <Input
            label="Mobile Number"
            type="text"
            value={formData.candidateMobile}
            onChange={(e) => updateField("candidateMobile", e.target.value)}
          />

          <Input
            label="Date of Birth"
            type="date"
            value={formData.dob}
            onChange={(e) => updateField("dob", e.target.value)}
          />

          <Input
            label="ID / Identifier"
            type="text"
            value={formData.idNumber}
            onChange={(e) => updateField("idNumber", e.target.value)}
          />
        </div>

        <Input
          label="Description of Identifier"
          type="text"
          placeholder="e.g. SA ID, Zimbabwean Passport"
          value={formData.idDescription}
          onChange={(e) => updateField("idDescription", e.target.value)}
        />
      </Section>

      {/* Background Checks */}
      <Section title="Background Screening Checks">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(formData.checks).map((key) => (
            <label
              key={key}
              className="flex items-center gap-3 p-3 border rounded-xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition"
            >
              <input
                type="checkbox"
                checked={formData.checks[key]}
                onChange={() => updateCheck(key)}
                className="h-5 w-5 accent-blue-600"
              />
              <span className="capitalize text-gray-700">{key}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* Signature */}
      <Section title="Acknowledgment & Signature">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Signature"
            type="text"
            value={formData.signature}
            onChange={(e) => updateField("signature", e.target.value)}
          />

          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => updateField("date", e.target.value)}
          />
        </div>
      </Section>

      {/* Submit */}
      <button
        type="submit"
        className="w-full mt-6 bg-blue-600 text-white py-3 rounded-xl font-semibold text-lg shadow-md hover:bg-blue-700 transition"
      >
        Submit
      </button>
    </form>
  );
}
