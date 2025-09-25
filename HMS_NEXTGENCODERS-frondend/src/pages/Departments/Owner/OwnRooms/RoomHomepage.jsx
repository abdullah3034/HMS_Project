import React from "react";
import OwnerSidebar from "../../../../components/owner/ownSidebar/Ownsidebar";  
import Home from "./RoomHome";

const RoomHomepage = () => {
  return (
    <div style={{ 
      display: 'grid',
      gridTemplateColumns: '20% 80%',
      
    }}>
      <div>
        <OwnerSidebar/>
      </div>
      <div style={{ padding: '20px' }}>
        <Home/>
      </div>
    </div>
  );
};

export default RoomHomepage;