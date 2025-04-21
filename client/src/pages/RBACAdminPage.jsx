// src/pages/RBACAdminPage.jsx
import React from "react";
import RBACAdminPanel from "../components/admin/RBACAdminPanel";
import { RBACProvider } from "../utils/rbacUtils";

const RBACAdminPage = () => {
  return (
    <div className="no-scroll">
      <div className="h-screen w-full bg-slate-200 p-2 text-neutral-50 font-inter">
        <RBACProvider>
          <RBACAdminPanel />
        </RBACProvider>
      </div>
    </div>
  );
};

export default RBACAdminPage;
