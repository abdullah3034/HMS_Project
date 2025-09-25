import React from "react";
import Sidebar2 from "../../../../components/reception/recSidebar/Recsidebar"; // Adjust the path to your Sidebar component
import GuestRes from "../../../../components/reception/Formedit/GuestRes"

const EditReservation1 = () => {
  return (
    <div style={{ 
      display: 'grid',
      gridTemplateColumns: '20% 80%',
      
    }}>
      <div>
        <Sidebar2/>
      </div>
      <div style={{ padding: '20px' }}>
        <GuestRes/>
      </div>
    </div>
  );
};

export default EditReservation1;