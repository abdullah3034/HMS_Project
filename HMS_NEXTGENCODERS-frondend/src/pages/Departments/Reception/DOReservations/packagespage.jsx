import React from "react";
import Sidebar2 from "../../../../components/reception/recSidebar/Recsidebar"; // Adjust the path to your Sidebar component
import  PackageHome from "../../../../components/reception/Dayout/PackageHome"; // Adjust the path to your CheckInForm component
 // Adjust the path to your CheckInForm component

const Packagespage = () => {
  return (
    <div style={{ 
      display: 'grid',
      gridTemplateColumns: '20% 80%',
      
    }}>
      <div>
        <Sidebar2/>
      </div>
      <div style={{ padding: '20px' }}>
 <PackageHome/>
        
    </div>
    </div>
  );
};

export default Packagespage;