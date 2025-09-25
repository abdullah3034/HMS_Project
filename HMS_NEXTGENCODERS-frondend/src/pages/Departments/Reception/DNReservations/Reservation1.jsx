import React from "react";
import Sidebar2 from "../../../../components/reception/recSidebar/Recsidebar"; // Adjust the path to your Sidebar component
import FormSection from "../../../../components/reception/Formsection1";

const Reservation1 = () => {
  return (
    <div style={{ 
      display: 'grid',
      gridTemplateColumns: '20% 80%',
      
    }}>
      <div>
        <Sidebar2/>
      </div>
      <div style={{ padding: '20px' }}>
        <FormSection/>
      </div>
    </div>
  );
};

export default Reservation1;
