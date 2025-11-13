import React, { useEffect, useState } from "react";
import { FaKey, FaSpinner, FaCheck, FaExclamationTriangle } from "react-icons/fa";
import { BASE_URL } from "./useAuth";

const ManageRolePermissions = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [status, setStatus] = useState({
    loading: false,
    error: null,
    success: null
  });
  const [initialPermissions, setInitialPermissions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setStatus({ loading: true, error: null, success: null });
      try {
        const [rolesRes, permsRes] = await Promise.all([
          fetch(`${BASE_URL}/dropdown/roles`),
          fetch(`${BASE_URL}/permissions`)
        ]);

        if (!rolesRes.ok) throw new Error("Failed to load roles");
        if (!permsRes.ok) throw new Error("Failed to load permissions");

        const [rolesData, permissionsData] = await Promise.all([
          rolesRes.json(),
          permsRes.json()
        ]);

        setRoles(rolesData);
        setPermissions(permissionsData);
        setStatus({ loading: false, error: null, success: null });
      } catch (err) {
        console.error("Error fetching data:", err);
        setStatus({ loading: false, error: err.message, success: null });
      }
    };

    fetchData();
  }, []);

  const handleRoleSelect = (roleId) => {
    setSelectedRoleId(roleId);
    const role = roles.find((r) => r.id === roleId);
    const rolePermissions = role?.permissions?.map((p) => p.id) || [];
    setSelectedPermissions(rolePermissions);
    setInitialPermissions(rolePermissions);
  };

  const togglePermission = (permissionId) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const hasChanges = () => {
    if (selectedPermissions.length !== initialPermissions.length) return true;
    return !selectedPermissions.every(perm => initialPermissions.includes(perm));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedRoleId) return;

    setStatus({ loading: true, error: null, success: null });

    try {
      const res = await fetch(`${BASE_URL}/permissions/assign?roleId=${selectedRoleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedPermissions),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to assign permissions");
      }

      // fetch updated roles to avoid stale state
      const rolesRes = await fetch(`${BASE_URL}/dropdown/roles`);
      if (!rolesRes.ok) throw new Error("Failed to reload roles");
      const updatedRoles = await rolesRes.json();
      setRoles(updatedRoles);

      const updatedRole = updatedRoles.find(r => r.id === selectedRoleId);
      const updatedRolePermissions = updatedRole?.permissions?.map(p => p.id) || [];

      setSelectedPermissions(updatedRolePermissions);
      setInitialPermissions(updatedRolePermissions);

      setStatus({ loading: false, error: null, success: "Permissions updated successfully!" });
    } catch (err) {
      console.error("Error saving permissions:", err);
      setStatus({ loading: false, error: err.message, success: null });
      setSelectedPermissions(initialPermissions);
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FaKey className="text-blue-600" /> Manage Role Permissions
        </h2>
      </div>

      {status.error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded flex items-center gap-2">
          <FaExclamationTriangle /> {status.error}
        </div>
      )}

      {status.success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded flex items-center gap-2">
          <FaCheck /> {status.success}
        </div>
      )}

      <div className="mb-6">
        <label className="block mb-2 font-semibold">Select Role:</label>
        <select
          className="px-3 py-2 border rounded w-64"
          onChange={(e) => handleRoleSelect(parseInt(e.target.value))}
          value={selectedRoleId || ""}
          disabled={status.loading}
        >
          <option value="">-- Select Role --</option>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      {selectedRoleId && (
        <form onSubmit={handleSave}>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Assign Permissions:</h3>
            {permissions.length === 0 ? (
              <p>Loading permissions...</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {permissions.map((perm) => (
                  <label key={perm.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(perm.id)}
                      onChange={() => togglePermission(perm.id)}
                      disabled={status.loading}
                    />
                    <span>{perm.name.replace(/_/g, " ")}</span>
                  </label>
                ))}
              </div>
            )}

            <button
              type="submit"
              className={`mt-6 px-4 py-2 rounded flex items-center gap-2 ${
                status.loading || !hasChanges()
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
              disabled={status.loading || !hasChanges()}
            >
              {status.loading ? (
                <>
                  <FaSpinner className="animate-spin" /> Saving...
                </>
              ) : (
                "Save Permissions"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ManageRolePermissions;
