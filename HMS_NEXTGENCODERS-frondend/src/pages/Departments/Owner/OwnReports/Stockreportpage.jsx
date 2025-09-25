import React from "react";
import OwnerSidebar from "../../../../components/owner/ownSidebar/Ownsidebar";  
import StockReport from "./StockRepo.jsx";

const StockReportpage = () => {
  return (
    <div style={{ 
      display: 'grid',
      gridTemplateColumns: '20% 80%',
      
    }}>
      <div>
        <OwnerSidebar/>
      </div>
      <div style={{ padding: '20px' }}>
        <StockReport/>
      </div>
    </div>
  );
};

export default StockReportpage;