// rbacUtils.js
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Create a context for RBAC
const RBACContext = createContext({
  roles: [],
  permissions: [],
  user: null,
  hasPermission: () => false,
  hasRole: () => false,
  loading: true,
  refetch: async () => {},
});

export const RBACProvider = ({ children }) => {
  const [rbacState, setRbacState] = useState({
    roles: [],
    permissions: [],
    user: null,
    loading: true,
  });

  // Expose the fetch function so it can be reused after login
  const fetchUserPermissions = async () => {
    try {
      console.log("⭐ RBAC: Fetching user auth status...");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/auth/check-auth`,
        { withCredentials: true }
      );

      console.log("⭐ RBAC: Auth status response:", response.data);

      if (response.data.success) {
        const userData = response.data.user;
        const userId = userData.id;
        console.log("⭐ RBAC: User authenticated, ID:", userId);

        try {
          console.log(`⭐ RBAC: Requesting roles for user ${userId}...`);
          const rbacResponse = await axios.get(
            `${process.env.REACT_APP_API_URL}/auth/rbac/public/users/${userId}/roles`,
            { withCredentials: true }
          );

          console.log("⭐ RBAC: Raw RBAC response:", rbacResponse);
          console.log("⭐ RBAC: RBAC response data:", rbacResponse.data);

          if (rbacResponse.data.success) {
            console.log(
              "⭐ RBAC: Setting state with roles:",
              rbacResponse.data.roles
            );
            console.log(
              "⭐ RBAC: Setting state with permissions:",
              rbacResponse.data.permissions
            );
            setRbacState({
              roles: rbacResponse.data.roles || [],
              permissions: rbacResponse.data.permissions || [],
              user: userData,
              loading: false,
            });
          } else {
            console.error(
              "⭐ RBAC: Failed to get roles - backend reported failure"
            );
            setRbacState({
              roles: [],
              permissions: [],
              user: userData,
              loading: false,
            });
          }
        } catch (rbacError) {
          console.error("⭐ RBAC: Error fetching roles:", rbacError);
          setRbacState({
            roles: [],
            permissions: [],
            user: userData,
            loading: false,
          });
        }
      } else {
        console.log("⭐ RBAC: User not authenticated");
        setRbacState({
          roles: [],
          permissions: [],
          user: null,
          loading: false,
        });
      }
    } catch (error) {
      console.error("⭐ RBAC: Error in auth check:", error);
      setRbacState({
        roles: [],
        permissions: [],
        user: null,
        loading: false,
      });
    }
  };

  useEffect(() => {
    fetchUserPermissions();
  }, []);

  // Perform case-insensitive, trimmed check for permission
  const hasPermission = (permissionName) => {
    const pname = permissionName.trim().toLowerCase();
    return rbacState.permissions.some(
      (p) => p.name.trim().toLowerCase() === pname
    );
  };

  // Perform case-insensitive, trimmed check for role
  const hasRole = (roleName) => {
    const rname = roleName.trim().toLowerCase();
    return rbacState.roles.some((r) => r.name.trim().toLowerCase() === rname);
  };

  return (
    <RBACContext.Provider
      value={{
        ...rbacState,
        hasPermission,
        hasRole,
        refetch: fetchUserPermissions,
      }}
    >
      {children}
    </RBACContext.Provider>
  );
};

export const useRBAC = () => {
  return useContext(RBACContext);
};

export const withPermission = (
  Component,
  permission,
  FallbackComponent = null
) => {
  return (props) => {
    const { hasPermission, loading } = useRBAC();

    if (loading) return <div>Loading...</div>;
    if (hasPermission(permission)) return <Component {...props} />;
    if (FallbackComponent) return <FallbackComponent {...props} />;
    return <div>You don't have permission to access this resource.</div>;
  };
};

export const withRole = (Component, roles, FallbackComponent = null) => {
  return (props) => {
    const { hasRole, loading } = useRBAC();

    if (loading) return <div>Loading...</div>;
    if (roles.some((role) => hasRole(role))) return <Component {...props} />;
    if (FallbackComponent) return <FallbackComponent {...props} />;
    return <div>You don't have the required role to access this resource.</div>;
  };
};

export const PermissionGuard = ({ permission, fallback = null, children }) => {
  const { hasPermission, loading } = useRBAC();

  if (loading) return null;
  if (hasPermission(permission)) return children;
  return fallback;
};

export const RoleGuard = ({ roles, fallback = null, children }) => {
  const { hasRole, loading } = useRBAC();

  if (loading) return null;
  if (roles.some((role) => hasRole(role))) return children;
  return fallback;
};
