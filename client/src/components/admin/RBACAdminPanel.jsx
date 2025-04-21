import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRBAC, RoleGuard } from "../../utils/rbacUtils";
import "../styles/RBACAdminPanel.css";
import { Toaster, toast } from "sonner";

const RBACAdminPanel = () => {
  // Lift roles state so both subcomponents share the same list.
  const [roles, setRoles] = useState([]);

  return (
    <RoleGuard
      roles={["admin"]}
      fallback={
        <div className="rbac-access-denied">
          Access Denied: Admin role required
        </div>
      }
    >
      <div className="rbac-admin-container">
        <h1 className="rbac-admin-title">
          Role-Based Access Control Management
        </h1>
        <div className="rbac-admin-tabs">
          <RolesManagement roles={roles} setRoles={setRoles} />
          <UsersRoleManagement roles={roles} />
        </div>
        <Toaster position="bottom-center" richColors />
      </div>
    </RoleGuard>
  );
};

const RolesManagement = ({ roles, setRoles }) => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [allPermissions, setAllPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state for creating/editing roles
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch roles and permissions (roles now come via props)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch roles
        console.log("Fetching roles...");
        const rolesResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/auth/rbac/roles`,
          { withCredentials: true }
        );
        console.log("Roles response:", rolesResponse.data);
        if (rolesResponse.data.success) {
          setRoles(rolesResponse.data.roles);
        }

        // Fetch permissions
        console.log("Fetching permissions...");
        const permissionsResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/auth/rbac/permissions`,
          { withCredentials: true }
        );
        console.log("Permissions response:", permissionsResponse.data);
        if (permissionsResponse.data.success) {
          setAllPermissions(permissionsResponse.data.permissions);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching RBAC data:", err);
        setError("Failed to load data. Please try again.");
        setLoading(false);
      }
    };

    fetchData();
  }, [setRoles]);

  // Fetch role details when a role is selected
  useEffect(() => {
    const fetchRoleDetails = async () => {
      if (!selectedRole) return;
      try {
        setLoading(true);
        console.log(`Fetching details for role ${selectedRole.id}...`);
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/auth/rbac/roles/${selectedRole.id}`,
          { withCredentials: true }
        );
        console.log("Role details response:", response.data);
        if (response.data.success) {
          const roleData = response.data.role;
          setRoleName(roleData.name);
          setRoleDescription(roleData.description || "");
          setSelectedPermissions(roleData.permissions.map((p) => p.id));
          setIsEditing(true);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching role details:", err);
        setError("Failed to load role details. Please try again.");
        setLoading(false);
      }
    };

    fetchRoleDetails();
  }, [selectedRole]);

  const handleRoleSelect = (role) => {
    console.log("Selected role:", role);
    setSelectedRole(role);
  };

  const handleCreateNew = () => {
    console.log("Creating new role form");
    setSelectedRole(null);
    setRoleName("");
    setRoleDescription("");
    setSelectedPermissions([]);
    setIsEditing(false);
  };

  const handlePermissionChange = (permissionId) => {
    console.log(`Toggling permission ${permissionId}`);
    setSelectedPermissions((prev) => {
      if (prev.includes(permissionId)) {
        return prev.filter((id) => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted");
    if (!roleName.trim()) {
      setError("Role name is required");
      return;
    }
    try {
      if (isEditing && selectedRole) {
        console.log(`Updating role ${selectedRole.id}...`);
        await axios.put(
          `${process.env.REACT_APP_API_URL}/auth/rbac/roles/${selectedRole.id}`,
          { name: roleName, description: roleDescription },
          { withCredentials: true }
        );
        await axios.put(
          `${process.env.REACT_APP_API_URL}/auth/rbac/roles/${selectedRole.id}/permissions`,
          { permissions: selectedPermissions },
          { withCredentials: true }
        );
        setRoles((prev) =>
          prev.map((role) =>
            role.id === selectedRole.id
              ? { ...role, name: roleName, description: roleDescription }
              : role
          )
        );
        toast.success("Role updated successfully");
      } else {
        console.log("Creating new role...");
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/auth/rbac/roles`,
          {
            name: roleName,
            description: roleDescription,
            permissions: selectedPermissions,
          },
          { withCredentials: true }
        );
        console.log("Create role response:", response.data);
        if (response.data.success) {
          const newRole = {
            id: response.data.roleId,
            name: roleName,
            description: roleDescription,
          };
          setRoles((prev) => [...prev, newRole]);
          setSelectedRole(newRole);
          setIsEditing(true);
          toast.success("Role created successfully");
        }
      }
      setError(null);
    } catch (err) {
      console.error("Error saving role:", err);
      setError(
        `Failed to save role: ${err.response?.data?.message || err.message}`
      );
      toast.error("Failed to save role");
    }
  };

  const handleDelete = async () => {
    if (!selectedRole) return;
    if (
      !window.confirm(
        `Are you sure you want to delete the role "${selectedRole.name}"?`
      )
    ) {
      return;
    }
    try {
      console.log(`Deleting role ${selectedRole.id}...`);
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/auth/rbac/roles/${selectedRole.id}`,
        { withCredentials: true }
      );
      console.log("Delete role response:", response.data);
      if (response.data.roles) {
        setRoles(response.data.roles);
      } else {
        setRoles((prev) => prev.filter((role) => role.id !== selectedRole.id));
      }
      handleCreateNew();
      toast.success("Role deleted successfully");
    } catch (err) {
      console.error("Error deleting role:", err);
      setError(
        `Failed to delete role: ${err.response?.data?.message || err.message}`
      );
      toast.error("Failed to delete role");
    }
  };

  if (loading && !roles.length) {
    return <div className="rbac-loading">Loading roles and permissions...</div>;
  }

  // Group permissions by category
  const permissionsByCategory = {};
  allPermissions.forEach((permission) => {
    const category = permission.category || "Other";
    if (!permissionsByCategory[category]) {
      permissionsByCategory[category] = [];
    }
    permissionsByCategory[category].push(permission);
  });

  return (
    <div className="rbac-roles-container">
      <h2 className="rbac-section-title">Roles Management</h2>
      {error && <div className="rbac-error">{error}</div>}
      <div className="rbac-panel">
        <div className="rbac-roles-list">
          <h3>Available Roles</h3>
          <ul>
            {roles.map((role) => (
              <li
                key={role.id}
                className={
                  selectedRole && selectedRole.id === role.id ? "selected" : ""
                }
                onClick={() => handleRoleSelect(role)}
              >
                {role.name}
              </li>
            ))}
          </ul>
          <button className="rbac-button-new" onClick={handleCreateNew}>
            Create New Role
          </button>
        </div>
        <div className="rbac-role-form">
          <h3>{isEditing ? "Edit Role" : "Create New Role"}</h3>
          <form onSubmit={handleSubmit}>
            <div className="rbac-form-group">
              <label htmlFor="roleName">Role Name:</label>
              <input
                id="roleName"
                type="text"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                required
              />
            </div>
            <div className="rbac-form-group">
              <label htmlFor="roleDescription">Description:</label>
              <textarea
                id="roleDescription"
                value={roleDescription}
                onChange={(e) => setRoleDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="rbac-form-group">
              <label>Permissions:</label>
              <div className="rbac-permissions-grid">
                {Object.keys(permissionsByCategory).map((category) => (
                  <div key={category} className="rbac-permission-category">
                    <h4>{category}</h4>
                    {permissionsByCategory[category].map((permission) => (
                      <div key={permission.id} className="rbac-permission-item">
                        <input
                          type="checkbox"
                          id={`permission-${permission.id}`}
                          checked={selectedPermissions.includes(permission.id)}
                          onChange={() => handlePermissionChange(permission.id)}
                        />
                        <label
                          htmlFor={`permission-${permission.id}`}
                          title={permission.description}
                        >
                          {permission.name}
                        </label>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="rbac-form-actions">
              <button type="submit" className="rbac-button-save">
                {isEditing ? "Update Role" : "Create Role"}
              </button>
              {isEditing && (
                <button
                  type="button"
                  className="rbac-button-delete"
                  onClick={handleDelete}
                >
                  Delete Role
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const UsersRoleManagement = ({ roles }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Starting RBAC admin data fetch...");
        try {
          const pingResponse = await axios.get(
            `${process.env.REACT_APP_API_URL}/auth/status`,
            {
              withCredentials: true,
            }
          );
          console.log("API connectivity check:", pingResponse.status);
        } catch (pingError) {
          console.error("API connectivity issue:", pingError);
        }
        console.log("Fetching users...");
        const usersResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/auth/users?limit=100`,
          {
            withCredentials: true,
          }
        );
        if (usersResponse.data) {
          const usersArray = Array.isArray(usersResponse.data)
            ? usersResponse.data
            : [];
          setUsers(usersArray);
        } else {
          setUsers([]);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error in RBAC admin data fetch:", err);
        setError("Failed to load data. Check console for details.");
        setUsers([]);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchUserRoles = async () => {
      if (!selectedUser) return;
      try {
        setLoading(true);
        console.log(`Fetching roles for user ${selectedUser.id}...`);
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/auth/rbac/users/${selectedUser.id}/roles`,
          { withCredentials: true }
        );
        if (response.data.success) {
          setUserRoles(response.data.roles || []);
        } else {
          setUserRoles([]);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user roles:", err);
        setError("Failed to load user roles. Please try again.");
        setUserRoles([]);
        setLoading(false);
      }
    };

    fetchUserRoles();
  }, [selectedUser]);

  const handleUserSelect = (user) => {
    console.log("Selected user:", user);
    setSelectedUser(user);
  };

  const handleRoleToggle = async (roleId) => {
    if (!selectedUser) return;
    try {
      const hasRole = userRoles.some((role) => role.id === roleId);
      if (hasRole) {
        const response = await axios.delete(
          `${process.env.REACT_APP_API_URL}/auth/rbac/users/${selectedUser.id}/roles/${roleId}`,
          { withCredentials: true }
        );
        if (response.data.roles) {
          setUserRoles(response.data.roles);
        } else {
          setUserRoles((prevRoles) =>
            prevRoles.filter((role) => role.id !== roleId)
          );
        }
        toast.success(
          `Role removed from ${selectedUser.username || selectedUser.email}`
        );
      } else {
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/auth/rbac/users/${selectedUser.id}/roles/${roleId}`,
          {},
          { withCredentials: true }
        );
        if (response.data.roles) {
          setUserRoles(response.data.roles);
        } else {
          const roleToAdd = roles.find((role) => role.id === roleId);
          if (roleToAdd) {
            setUserRoles((prevRoles) => [...prevRoles, roleToAdd]);
          }
        }
        toast.success(
          `Role assigned to ${selectedUser.username || selectedUser.email}`
        );
      }
    } catch (err) {
      console.error("Error updating user roles:", err);
      setError(
        `Failed to update user roles: ${
          err.response?.data?.message || err.message
        }`
      );
      toast.error("Failed to update user roles");
    }
  };

  const filteredUsers = users.filter((user) => {
    const searchString = searchTerm.toLowerCase();
    const username = (user.username || "").toLowerCase();
    const email = (user.email || "").toLowerCase();
    return username.includes(searchString) || email.includes(searchString);
  });

  if (loading && !users.length) {
    return <div className="rbac-loading">Loading users and roles...</div>;
  }

  return (
    <div className="rbac-users-container">
      <h2 className="rbac-section-title">User Role Assignment</h2>
      {error && <div className="rbac-error">{error}</div>}
      <div className="rbac-panel">
        <div className="rbac-users-list">
          <h3>Users</h3>
          <input
            type="text"
            placeholder="Search users..."
            className="rbac-search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <ul>
            {filteredUsers.map((user) => (
              <li
                key={user.id}
                className={
                  selectedUser && selectedUser.id === user.id ? "selected" : ""
                }
                onClick={() => handleUserSelect(user)}
              >
                {user.username || user.email}
              </li>
            ))}
          </ul>
        </div>
        <div className="rbac-user-roles">
          <h3>
            {selectedUser
              ? `Roles for ${selectedUser.username || selectedUser.email}`
              : "Select a user to manage roles"}
          </h3>
          {selectedUser && (
            <div className="rbac-role-checkboxes">
              {roles.length > 0 ? (
                roles.map((role) => (
                  <div key={role.id} className="rbac-role-checkbox">
                    <input
                      type="checkbox"
                      id={`user-role-${role.id}`}
                      checked={userRoles.some((r) => r.id === role.id)}
                      onChange={() => handleRoleToggle(role.id)}
                    />
                    <label htmlFor={`user-role-${role.id}`}>
                      <span className="role-name">{role.name}</span>
                    </label>
                  </div>
                ))
              ) : (
                <p>No roles available. Please create roles first.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RBACAdminPanel;
