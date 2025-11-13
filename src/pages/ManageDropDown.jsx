import React, { useEffect, useState } from "react";
import { FaTrash, FaPlus, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { BASE_URL } from "./useAuth";

const DROPDOWNS = [
  { label: "Availability", endpoint: "dropdown/availability-options" },
  { label: "Roles", endpoint: "dropdown/roles" },
  { label: "Provinces", endpoint: "dropdown/provinces" },
  { label: "Skills", endpoint: "dropdown/skills" },
  { label: "Currency", endpoint: "dropdown/currencies" },
  { label: "Job Sectors", endpoint: "dropdown/sectors" },
  { label: "Grades", endpoint: "dropdown/grades" },
  { label: "Gender", endpoint: "dropdown/genders" },
  { label: "Race", endpoint: "dropdown/races" },
  { label: "Document Type", endpoint: "file-types/applicant" },
  { label: "Certification", endpoint: "dropdown/certifications" },
  { label: "Experience", endpoint: "dropdown/experience-levels" },
  { label: "Job Status", endpoint: "dropdown/job-statuses" },
];

const ManageDropdowns = () => {
  const [dropdownData, setDropdownData] = useState([]);
  const [newEntry, setNewEntry] = useState({});
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState({}); // track add requests

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const result = {};
      for (const { endpoint } of DROPDOWNS) {
        try {
          const res = await fetch(`${BASE_URL}/${endpoint}`);
          const data = await res.json();

          // sort Job Status by orderIndex
          result[endpoint] =
            endpoint === "dropdown/job-statuses"
              ? data.sort((a, b) => a.orderIndex - b.orderIndex)
              : data;
        } catch (err) {
          console.error(`Failed to load ${endpoint}`, err);
          result[endpoint] = [];
        }
      }
      setDropdownData(result);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const handleAdd = async (endpoint) => {
    const value = newEntry[endpoint]?.name?.trim();
    const orderIndex = newEntry[endpoint]?.orderIndex;

    if (!value) return;

    setAdding((prev) => ({ ...prev, [endpoint]: true }));

    try {
      const body =
        endpoint === "dropdown/job-statuses"
          ? { name: value, orderIndex: orderIndex ?? 0 }
          : { name: value };

      const res = await fetch(`${BASE_URL}/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to add entry");

      const saved = await res.json();
      setDropdownData((prev) => ({
        ...prev,
        [endpoint]:
          endpoint === "dropdown/job-statuses"
            ? [...prev[endpoint], saved].sort((a, b) => a.orderIndex - b.orderIndex)
            : [...prev[endpoint], saved],
      }));
      setNewEntry((prev) => ({ ...prev, [endpoint]: {} }));
    } catch (err) {
      console.error(`Error adding to ${endpoint}`, err);
    } finally {
      setAdding((prev) => ({ ...prev, [endpoint]: false }));
    }
  };

  const handleDelete = async (endpoint, id) => {
    try {
      const res = await fetch(`${BASE_URL}/${endpoint}/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");

      setDropdownData((prev) => ({
        ...prev,
        [endpoint]: prev[endpoint].filter((entry) => entry.id !== id),
      }));
    } catch (err) {
      console.error(`Failed to delete from ${endpoint}`, err);
    }
  };

  const toggleExpand = (endpoint) => {
    setExpanded((prev) => ({ ...prev, [endpoint]: !prev[endpoint] }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Manage Dropdown Lists</h2>

      {loading ? (
        <p className="text-gray-600">Loading dropdowns...</p>
      ) : (
        DROPDOWNS.map(({ label, endpoint }) => (
          <div key={endpoint} className="mb-6 border rounded">
            <div
              className="cursor-pointer flex items-center justify-between p-4 bg-gray-100 hover:bg-gray-200"
              onClick={() => toggleExpand(endpoint)}
            >
              <h3 className="font-semibold text-lg">{label}</h3>
              {expanded[endpoint] ? <FaChevronUp /> : <FaChevronDown />}
            </div>

            {expanded[endpoint] && (
              <div className="p-4 space-y-4">
                <div className="flex flex-wrap gap-3 items-center">
                  <input
                    type="text"
                    placeholder={`Add new ${label.toLowerCase()}`}
                    className="border px-3 py-2 rounded w-72"
                    value={newEntry[endpoint]?.name || ""}
                    onChange={(e) =>
                      setNewEntry((prev) => ({
                        ...prev,
                        [endpoint]: { ...prev[endpoint], name: e.target.value },
                      }))
                    }
                  />

                  {endpoint === "dropdown/job-statuses" && (
                    <input
                      type="number"
                      placeholder="Order index"
                      className="border px-3 py-2 rounded w-32"
                      value={newEntry[endpoint]?.orderIndex || ""}
                      onChange={(e) =>
                        setNewEntry((prev) => ({
                          ...prev,
                          [endpoint]: {
                            ...prev[endpoint],
                            orderIndex: parseInt(e.target.value) || 0,
                          },
                        }))
                      }
                    />
                  )}

                  <button
                    onClick={() => handleAdd(endpoint)}
                    className={`px-4 py-2 rounded text-white flex items-center ${
                      !newEntry[endpoint]?.name?.trim() || adding[endpoint]
                        ? "bg-blue-300 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                    disabled={!newEntry[endpoint]?.name?.trim() || adding[endpoint]}
                  >
                    <FaPlus className="mr-1" /> Add
                  </button>
                </div>

                <ul className="divide-y border-t mt-4">
                  {dropdownData[endpoint]?.map((item) => (
                    <li
                      key={item.id}
                      className="flex justify-between items-center py-2"
                    >
                      <span>
                        {item.name?.replace(/_/g, " ")}
                        {endpoint === "dropdown/job-statuses" && (
                          <span className="ml-2 text-sm text-gray-500">
                            (Order: {item.orderIndex})
                          </span>
                        )}
                      </span>
                      <button
                        onClick={() => handleDelete(endpoint, item.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrash />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ManageDropdowns;
