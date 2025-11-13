import React, { useEffect, useState } from "react";
import { FaUserShield, FaTrash } from "react-icons/fa";
import ManageDropdowns from "./ManageDropDown";
import ManageRolePermissions from "./ManageRolePermissions";
import { loginRequest } from '../authConfig';
import { useMsal } from '@azure/msal-react';
import { BASE_URL } from './useAuth';

const tabs = [
  { id: "employees", label: "Employees" },
  { id: "dropdowns", label: "Dropdown Lists" },
  { id: "permissions", label: "Role Permissions" },
];

const ManageEmployees = () => {
  const [activeTab, setActiveTab] = useState("employees");

  // === Your original ManageEmployees state and logic here ===
  const [employees, setEmployees] = useState([]);
  const [azureEmployees, setAzureEmployees] = useState([]);
  const [roles, setRoles] = useState([]); // array of Role entities
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const [selectedAzureUser, setSelectedAzureUser] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState(""); // store selected role ID for adding new employee

  // Modal state
  const [modal, setModal] = useState({ visible: false, title: "", message: "", onConfirm: null });

  const { instance, accounts } = useMsal();

  // Modal helpers
  const showModal = (title, message, onConfirm = null, confirmText = "OK", cancelText = "Cancel", showCancel = false) => {
    setModal({ visible: true, title, message, onConfirm, confirmText, cancelText, showCancel });
  };
  const closeModal = () => setModal({ visible: false, title: "", message: "", onConfirm: null });

  // Fetch Azure AD users
  useEffect(() => {
    if (activeTab !== "employees") return; // Only fetch on employees tab
    const fetchUsers = async () => {
      if (!accounts || accounts.length === 0) return;
      try {
        const account = accounts[0];
        const tokenResponse = await instance.acquireTokenSilent({
          ...loginRequest,
          account,
        });
        const accessToken = tokenResponse.accessToken;

        const response = await fetch('https://graph.microsoft.com/v1.0/users?$select=displayName,mail', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) throw new Error('Failed to fetch users from Microsoft Graph');

        const data = await response.json();

        const options = data.value
          .filter(user => user.mail && user.displayName)
          .map(user => ({
            value: user.mail,
            label: user.displayName,
          }));

        setAzureEmployees(options);
      } catch (err) {
        console.error('Error fetching users:', err);
        showModal("Error", "Failed to fetch Azure users.");
      }
    };
    fetchUsers();
  }, [accounts, instance, activeTab]);

  // Fetch employees and roles from backend
  useEffect(() => {
    if (activeTab !== "employees") return; // Only fetch on employees tab
    const fetchData = async () => {
      try {
        const [employeeRes, rolesRes] = await Promise.all([
          fetch(`${BASE_URL}/employees`),
          fetch(`${BASE_URL}/dropdown/roles`)
        ]);

        if (!employeeRes.ok || !rolesRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const employeesData = await employeeRes.json();
        const rolesData = await rolesRes.json();

        setEmployees(employeesData);
        setRoles(rolesData);
      } catch (err) {
        console.error("Error fetching employee data:", err);
        showModal("Error", "Failed to fetch employee data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  const handleRoleChange = async (employeeId, newRole) => {
    if (!newRole) {
      showModal("Validation Error", "Please select a role.");
      return;
    }

    setUpdating(employeeId);
    try {
      const employeeToUpdate = employees.find((e) => e.id === employeeId);
      const updatedEmployee = {
        ...employeeToUpdate,
        role: { id: newRole.id },
      }

      const res = await fetch(`${BASE_URL}/employees`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedEmployee)
      });

      if (!res.ok) throw new Error("Failed to update role");

      const returned = await res.json();
      setEmployees((prev) =>
        prev.map((emp) => (emp.id === employeeId ? returned : emp))
      );
      showModal("Success", "Role updated successfully.");
    } catch (err) {
      console.error("Error updating role:", err);
      showModal("Error", "Failed to update role. Try again.");
    } finally {
      setUpdating(null);
    }
  };

  const handleAddEmployee = async () => {
    if (!selectedAzureUser || !selectedRoleId) {
      showModal("Validation Error", "Please select both an Azure user and a role.");
      return;
    }

    try {
      const displayName = azureEmployees.find(u => u.value === selectedAzureUser)?.label;
      if (!displayName) {
        showModal("Validation Error", "Selected Azure user is invalid.");
        return;
      }

      const selectedRoleObj = roles.find(role => role.id === parseInt(selectedRoleId, 10));
      if (!selectedRoleObj) {
        showModal("Validation Error", "Selected role is invalid.");
        return;
      }

      const newUser = {
        name: displayName,
        email: selectedAzureUser,
        signature: selectedAzureUser,
        role: { id: selectedRoleObj.id }
      };

      const res = await fetch(`${BASE_URL}/employees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser)
      });

      if (!res.ok) throw new Error("Failed to add employee");

      const savedUser = await res.json();
      setEmployees(prev => [...prev, savedUser]);

      setSelectedAzureUser("");
      setSelectedRoleId("");
      showModal("Success", "Employee added successfully.");
    } catch (err) {
      console.error("Error adding employee:", err);
      showModal("Error", "Failed to add employee.");
    }
  };

  const handleDeleteEmployee = (id, name) => {
    showModal(
      "Confirm Delete",
      `Are you sure you want to delete employee "${name}"?`,
      () => confirmDelete(id),
      "Delete",
      "Cancel",
      true
    );
  };

  const confirmDelete = async (id) => {
    closeModal();
    try {
      const res = await fetch(`${BASE_URL}/employees/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete employee");

      setEmployees(prev => prev.filter(emp => emp.id !== id));
      showModal("Success", "Employee deleted.");
    } catch (err) {
      console.error("Error deleting employee:", err);
      showModal("Error", "Failed to delete employee.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      {/* Tabs navigation */}
      <nav className="mb-6 border-b border-gray-300 flex gap-6">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`py-2 px-4 font-semibold border-b-2 ${
              activeTab === id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
            type="button"
            aria-selected={activeTab === id}
            role="tab"
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Tab contents */}
      {activeTab === "employees" && (
        <>
          {/* Original ManageEmployees UI unchanged */}
          {modal.visible && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
              <div className="bg-white rounded shadow-lg max-w-md w-full p-6">
                <h3 className="text-lg font-semibold mb-4">{modal.title}</h3>
                <p className="mb-6">{modal.message}</p>
                <div className="flex justify-end gap-4">
                  {modal.showCancel && (
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                    >
                      {modal.cancelText}
                    </button>
                  )}
                  <button
                    onClick={modal.onConfirm || closeModal}
                    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {modal.confirmText}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <FaUserShield className="text-blue-600" />
              Manage Employees
            </h2>
          </div>

          {/* Add employee section */}
          <div className="mt-10 border-t pt-6 mb-10">
            <h3 className="text-lg font-semibold mb-4">Add Employee from Azure</h3>
            <div className="flex items-center gap-4 flex-wrap">
              <select
                className="px-3 py-2 border rounded w-64"
                onChange={(e) => setSelectedAzureUser(e.target.value)}
                value={selectedAzureUser}
              >
                <option value="">Select Azure User</option>
                {azureEmployees.map((user) => (
                  <option key={user.value} value={user.value}>
                    {user.label} ({user.value})
                  </option>
                ))}
              </select>

              <select
                className="px-3 py-2 border rounded w-40"
                onChange={(e) => setSelectedRoleId(e.target.value)}
                value={selectedRoleId}
              >
                <option value="">Select Role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name.replace(/_/g, " ")}
                  </option>
                ))}
              </select>

              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                onClick={handleAddEmployee}
                disabled={!selectedAzureUser || !selectedRoleId}
              >
                Add to System
              </button>
            </div>
          </div>

          {/* Existing employees table */}
          {loading ? (
            <p>Loading employees...</p>
          ) : (
            <table className="w-full border rounded overflow-hidden">
              <thead className="bg-gray-100 text-left text-sm font-semibold">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Current Role</th>
                  <th className="p-3">Change Role</th>
                  <th className="p-3">Delete</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{emp.name}</td>
                    <td className="p-3">{emp.email}</td>
                    <td className="p-3 font-medium text-blue-700">
                      {emp.role?.name.replace(/_/g, " ") || ""}
                    </td>
                    <td className="p-3">
                      <select
                        className="px-3 py-2 border rounded"
                        value={emp.role?.id || ""}
                        onChange={(e) => {
                          const selectedRoleId = parseInt(e.target.value, 10);
                          const selectedRoleObj = roles.find(role => role.id === selectedRoleId) || null;
                          handleRoleChange(emp.id, selectedRoleObj);
                        }}
                        disabled={updating === emp.id}
                      >
                        <option value="">Select Role</option>
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name.replace(/_/g, " ")}
                          </option>
                        ))}
                      </select>
                      {updating === emp.id && (
                        <span className="ml-2 text-sm text-gray-500">Saving...</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete Employee"
                        aria-label={`Delete ${emp.name}`}
                      >
                        <FaTrash size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {activeTab === "dropdowns" && <ManageDropdowns />}

      {activeTab === "permissions" && <ManageRolePermissions />}
    </div>
  );
};

export default ManageEmployees;
