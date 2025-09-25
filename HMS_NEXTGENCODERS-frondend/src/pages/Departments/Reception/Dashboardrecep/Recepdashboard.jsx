import React from "react";
import Sidebar2 from "../../../../components/reception/recSidebar/Recsidebar"; // Adjust the path to your Sidebar component
import DashboardStats from "../../../../components/reception/Dashboard/DashboardStats"

const Recepdashboardpage = () => {
  return (
    <div style={{ 
      display: 'grid',
      gridTemplateColumns: '20% 80%',
      
    }}>
      <div>
        <Sidebar2/>
      </div>
      <div style={{ padding: '20px' }}>
        <DashboardStats/>
      </div>
    </div>
  );
};

export default Recepdashboardpage;