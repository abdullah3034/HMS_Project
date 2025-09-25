import React from "react";
import OwnerSidebar from "../../../../components/owner/ownSidebar/Ownsidebar";  
import OwnerDashboard from "./OwnDashboard";

const OwnDashboardpage = () => {
  return (
    <div style={{ 
      display: 'grid',
      gridTemplateColumns: '20% 80%',
      
    }}>
      <div>
        <OwnerSidebar/>
      </div>
      <div style={{ padding: '20px' }}>
        <OwnerDashboard/>
      </div>
    </div>
  );
};

export default OwnDashboardpage;
