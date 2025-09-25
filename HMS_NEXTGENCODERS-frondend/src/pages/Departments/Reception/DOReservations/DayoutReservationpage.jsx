import React from "react";
import Sidebar2 from "../../../../components/reception/recSidebar/Recsidebar"; // Adjust the path to your Sidebar component
import   DayoutReservation from "../../../../components/reception/Dayout/Dayoutreservation"; // Adjust the path to your CheckInForm component
 // Adjust the path to your CheckInForm component

const DayoutReservationpage = () => {
  return (
    <div style={{ 
      display: 'grid',
      gridTemplateColumns: '20% 80%',
      
    }}>
      <div>
        <Sidebar2/>
      </div>
      <div style={{ padding: '20px' }}>
 <DayoutReservation/>
        
    </div>
    </div>
  );
};

export default DayoutReservationpage;