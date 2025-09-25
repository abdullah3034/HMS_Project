import React from "react";
import OwnerSidebar from "../../../../components/owner/ownSidebar/Ownsidebar.jsx";  
import SettingsPage from "./OwnSettings.jsx";
;

const OwnsettingsPage = () => {
  return (
    <div style={{ 
      display: 'grid',
      gridTemplateColumns: '20% 80%',
      
    }}>
      <div>
        <OwnerSidebar/>
      </div>
      <div style={{ padding: '20px' }}>
        <SettingsPage/>
      </div>
    </div>
  );
};

export default OwnsettingsPage;