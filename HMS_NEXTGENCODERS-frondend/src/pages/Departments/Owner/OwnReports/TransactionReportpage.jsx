import React from "react";
import OwnerSidebar from "../../../../components/owner/ownSidebar/Ownsidebar";  
import TransactionReport from "./TransactionReports";

const TransactionReportpage = () => {
  return (
    <div style={{ 
      display: 'grid',
      gridTemplateColumns: '20% 80%',
      
    }}>
      <div>
        <OwnerSidebar/>
      </div>
      <div style={{ padding: '20px' }}>
        <TransactionReport/>
      </div>
    </div>
  );
};

export default TransactionReportpage;