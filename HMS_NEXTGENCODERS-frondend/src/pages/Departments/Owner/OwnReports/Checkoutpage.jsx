import React from "react";
import OwnerSidebar from "../../../../components/owner/ownSidebar/Ownsidebar.jsx";  
import CheckoutP from "./Checkout.jsx";

const CheckoutPage = () => {
  return (
    <div style={{ 
      display: 'grid',
      gridTemplateColumns: '20% 80%',
      
    }}>
      <div>
        <OwnerSidebar/>
      </div>
      <div style={{ padding: '20px' }}>
        <CheckoutP/>
      </div>
    </div>
  );
};

export default CheckoutPage;