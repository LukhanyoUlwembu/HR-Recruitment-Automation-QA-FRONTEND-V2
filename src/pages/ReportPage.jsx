import React, { useEffect, useState } from 'react';
import { BASE_URL } from './useAuth';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c', '#d0ed57', '#8dd1e1'];

export default function ReportsPage() {
  const [data, setData] = useState({
    applicants: [],
    applications: [],
    jobs: [],
    remForms: [],
    loading: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [applicantRes, appRes, jobRes, remRes] = await Promise.all([
          fetch(`${BASE_URL}/applicants`),
          fetch(`${BASE_URL}/applications`),
          fetch(`${BASE_URL}/postings`),
          fetch(`${BASE_URL}/rem-forms`),
        ]);

        const [applicants, applications, jobs, remForms] = await Promise.all([
          applicantRes.json(),
          appRes.json(),
          jobRes.json(),
          remRes.json(),
        ]);

        setData({ applicants, applications, jobs, remForms, loading: false });
      } catch (error) {
        console.error('Error loading reports:', error);
      }
    };

    fetchData();
  }, []);

  const getJobTitle = (id) => data.jobs.find(j => j.jobPostingId === id)?.jobTitle || 'Unknown';

  const summaryStats = [
    { label: 'Applicants', value: data.applicants.length },
    { label: 'Applications', value: data.applications.length },
    { label: 'Open Jobs', value: data.jobs.length },
    { label: 'Offers Made', value: data.applications.filter(a => a.offerLetter !== null).length },
    {
      label: 'Requisitions',
      value: data.jobs.filter(j => j.approval?.jobRequisition).length
    },
    {
      label: 'Approved Requisitions',
      value: data.jobs.filter(j =>
        j.approval?.jobRequisition &&
        j.approval?.approver?.length &&
        j.approval.approver.every(a => a.decision === true)
      ).length
    },
    { label: 'REM Forms', value: data.remForms.length },
    { label: 'Approved REMs', value: data.remForms.filter(r => r.status.name === 'APPROVED').length },
  ];

  const applicationStatusData = Array.from(
    data.applications.reduce((map, app) => {
      const status = app.status.name || 'Unknown';
      map.set(status, (map.get(status) || 0) + 1);
      return map;
    }, new Map())
  ).map(([status, value]) => ({ name: status, value }));

  const requisitionApprovalData = [
    {
      name: 'Approved',
      value: data.jobs.filter(j =>
        j.approval?.jobRequisition &&
        j.approval.approver?.length &&
        j.approval.approver.every(ap => ap.decision === true)
      ).length
    },
    {
      name: 'Pending',
      value: data.jobs.filter(j =>
        j.approval?.jobRequisition &&
        (!j.approval.approver?.length || j.approval.approver.some(ap => ap.decision !== true))
      ).length
    }
  ];

  const buildRow = (application) => {
    const applicant = application.applicant || {};
    const job = application.jobPosting || {};
    return [
      applicant.name + ' ' + applicant.surname,
      job.jobTitle || 'Unknown',
      application.status.name,
      application.availability.name.replace(/_/g, ' '),
      application.offerLetter ? 'Yes' : 'No',
    ];
  };

  return (
    <div className="max-w-full px-8 py-10 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-8">Comprehensive HR Reports</h1>

      {data.loading ? (
        <p>Loading data...</p>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {summaryStats.map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-md text-center">
                <p className="text-2xl font-bold text-blue-600">{stat.value}</p>
                <p className="text-gray-700 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">Application Status Distribution</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={applicationStatusData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    label
                  >
                    {applicationStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">Requisition Approval Summary</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={requisitionApprovalData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Applications Table */}
          <Section title="Applications Overview">
            <SimpleTable
              headers={["Applicant", "Job", "Status", "Availability", "Offer"]}
              rows={data.applications.map(buildRow)}
            />
          </Section>

          {/* Requisitions & Approvals Table */}
          <Section title="Requisitions & Approvals">
            <SimpleTable
              headers={["Title", "Status", "Organogram"]}
              rows={data.jobs
                .filter(j => j.approval?.jobRequisition)
                .map(job => {
                  const req = job.approval.jobRequisition;
                  const approved = job.approval.approver?.every(a => a.decision === true);
                  const organogram = req.requisitionFile?.find(f => f.fileType === "Organogram File");

                  return [
                    req.jobTitle,
                    approved ? "Approved" : "Pending",
                    organogram ? (
                      <a href={`${BASE_URL}/uploads/${organogram.fileName}`} target="_blank" className="text-blue-600 underline">View</a>
                    ) : 'N/A'
                  ];
                })}
            />
          </Section>

          {/* REM Forms Table */}
          <Section title="REM Form Submissions">
            <SimpleTable
              headers={["Position", "Status", "Linked Job"]}
              rows={data.remForms.map(r => [
                r.position,
                r.status.name,
                getJobTitle(r.jobPosting?.jobPostingId)
              ])}
            />
          </Section>
        </>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-10">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">{title}</h2>
      {children}
    </div>
  );
}

function SimpleTable({ headers, rows }) {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-md">
      <table className="min-w-full text-sm text-left border">
        <thead className="bg-blue-100 text-blue-900">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-2 border-b border-blue-200">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b hover:bg-gray-50">
              {row.map((col, j) => (
                <td key={j} className="px-4 py-2">{col}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
