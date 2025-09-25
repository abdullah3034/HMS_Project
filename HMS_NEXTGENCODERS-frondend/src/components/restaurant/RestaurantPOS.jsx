import React, { useEffect, useState } from "react";
import Ressidebar from "./resSidebar/Ressidebar";
import styles from "./RestaurantPOS.module.css";
import { fetchCategories } from "../../api/categoryApi";
import { fetchProductsByCategory, updateMultipleProductStock } from "../../api/productApi";
import { createOrder } from "../../api/orderApi";
import LowStockAlert from "./LowStockAlert";

const RestaurantPOS = () => {
  // State for categories, subcategories, products, selection
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedMain, setSelectedMain] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Billing/order state
  const [billItems, setBillItems] = useState([]);

  // Popup state
  const [showReceipt, setShowReceipt] = useState(false);
  const [showGuestPopup, setShowGuestPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showCardPopup, setShowCardPopup] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [orderProcessing, setOrderProcessing] = useState(false);
  
  // Card payment state
  const [cardDetails, setCardDetails] = useState({
    cardHolderName: '',
    cardNumber: '',
    expireDate: '',
    cvv: ''
  });
  const [cardErrors, setCardErrors] = useState({});

  // Order type state
  const [orderType, setOrderType] = useState("Take Away");

  // Bill meta (for demo, generate on open)
  const [billMeta, setBillMeta] = useState({ date: '', time: '', billNo: '' });
  const [cashAmount, setCashAmount] = useState(0);
  const [changeAmount, setChangeAmount] = useState(0);

  // Generate bill meta when showing receipt
  const handleShowReceipt = () => {
    const now = new Date();
    setBillMeta({
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      billNo: Math.floor(Math.random() * 90000 + 10000),
    });
    
    // Set cash amount equal to total for convenience
    setCashAmount(totalAmount);
    // Calculate change (0 if cash equals total)
    setChangeAmount(0);
    
    setShowReceipt(true);
  };
  
  // Handle card payment
  const handleCardPayment = () => {
    // Validate card details
    const errors = {};
    if (!cardDetails.cardHolderName.trim()) {
      errors.cardHolderName = "Card holder name is required";
    }
    
    if (!cardDetails.cardNumber || cardDetails.cardNumber.length < 13) {
      errors.cardNumber = "Valid card number is required";
    }
    
    if (!cardDetails.expireDate || cardDetails.expireDate.length < 5) {
      errors.expireDate = "Valid expiry date is required";
    }
    
    if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
      errors.cvv = "Valid CVV is required";
    }
    
    if (Object.keys(errors).length > 0) {
      setCardErrors(errors);
      return;
    }
    
    // Process card payment (simulated)
    setOrderProcessing(true);
    
    // Simulate payment processing delay
    setTimeout(() => {
      // Close card popup
      setShowCardPopup(false);
      
      // Reset card details
      setCardDetails({
        cardHolderName: '',
        cardNumber: '',
        expireDate: '',
        cvv: ''
      });
      
      setCardErrors({});
      
      // Create order with card payment
      handleCheckout(true);
    }, 1500);
  };
  
  // Handle checkout process
  const handleCheckout = async (isWalkin = true, guest = null) => {
    if (billItems.length === 0) return;
    
    try {
      setOrderProcessing(true);
      
      // Prepare order data
      const orderData = {
        items: billItems.map(item => ({
          productId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          amount: item.amount
        })),
        total: totalAmount,
        // Set status based on order type
        status: isWalkin ? "completed" : "payment pending",
        orderType: orderType,
        isWalkin: isWalkin
      };
      
      // Add guest info if not a walk-in order
      if (!isWalkin && guest) {
        orderData.guestInfo = {
          guestId: guest.id.toString(),
          guestName: guest.name,
          roomNo: guest.room
        };
      }
      
      // Create order in backend
      const order = await createOrder(orderData);
      
      // Update product stock after successful order creation
      if (order && order.status === "completed") {
        try {
          const stockUpdates = billItems.map(item => ({
            productId: item._id,
            quantity: -item.quantity // Negative to reduce stock
          }));
          
          await updateMultipleProductStock(stockUpdates);
          console.log("Stock updated successfully");
        } catch (stockError) {
          console.error("Error updating stock:", stockError);
          // Don't fail the order if stock update fails
        }
      }
      
      // Store created order and show success popup
      setCreatedOrder(order);
      setShowSuccessPopup(true);
      
      // Close receipt popup if open
      setShowReceipt(false);
      
      // Clear cart after successful order
      setBillItems([]);
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Failed to create order. Please try again.");
    } finally {
      setOrderProcessing(false);
    }
  };

  // Dummy guest+room list
  const guestList = [
    { id: 1, name: 'John Doe', room: '101' },
    { id: 2, name: 'Jane Smith', room: '102' },
    { id: 3, name: 'Alice Johnson', room: '201' },
    { id: 4, name: 'Bob Lee', room: '202' },
    { id: 5, name: 'Charlie Brown', room: '301' },
    { id: 6, name: 'David Kim', room: '302' },
    { id: 7, name: 'Eva Green', room: '303' },
  ];
  const [guestSearch, setGuestSearch] = useState("");
  const [selectedGuest, setSelectedGuest] = useState(null);

  // Filtered guest list
  const filteredGuests = guestList.filter(g => {
    const q = guestSearch.trim().toLowerCase();
    return (
      g.name.toLowerCase().includes(q) ||
      g.room.toLowerCase().includes(q)
    );
  });

  // Handle guest select
  const handleSelectGuest = (guest) => {
    setSelectedGuest(guest);
    setShowGuestPopup(false);
    
    // Process the order for the selected guest
    if (billItems.length > 0) {
      handleCheckout(false, guest);
    }
  };


  // Add or update product in bill
  const handleAddToBill = (product) => {
    // Ensure product has a valid price
    if (!product || typeof product.price !== 'number' || isNaN(product.price)) {
      console.error('Invalid product or price:', product);
      return;
    }
    
    setBillItems((prev) => {
      const idx = prev.findIndex((item) => item._id === product._id);
      if (idx !== -1) {
        // Update quantity
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          quantity: updated[idx].quantity + 1,
          amount: (updated[idx].quantity + 1) * updated[idx].price,
        };
        return updated;
      } else {
        // Add new item
        return [
          ...prev,
          {
            _id: product._id,
            name: product.name,
            price: product.price,
            quantity: 1,
            amount: product.price,
          },
        ];
      }
    });
  };

  // Remove item from bill
  const handleRemoveFromBill = (_id) => {
    setBillItems((prev) => prev.filter(item => item._id !== _id));
  };

  // Calculate total
  const totalAmount = billItems.reduce((sum, item) => sum + item.amount, 0);

  // Fetch all categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      const data = await fetchCategories();
      setCategories(data);
      const mains = data.filter(cat => !cat.parentId);
      setMainCategories(mains);
      // Select first main by default
      if (mains.length > 0) setSelectedMain(mains[0]._id);
      setLoading(false);
    };
    loadCategories();
  }, []);

  // Update subcategories when main changes
  useEffect(() => {
    if (!selectedMain) {
      setSubCategories([]);
      setSelectedSub(null);
      return;
    }
    const subs = categories.filter(cat => {
      if (!cat.parentId) return false;
      const parentId = typeof cat.parentId === "object" ? cat.parentId._id : cat.parentId;
      return parentId === selectedMain;
    });
    setSubCategories(subs);
    // Select first sub by default, if exists
    setSelectedSub(subs.length > 0 ? subs[0]._id : null);
  }, [selectedMain, categories]);

  // Reset search when category changes
  useEffect(() => {
    setSearchQuery("");
  }, [selectedMain, selectedSub]);

  // Fetch products when selectedMain or selectedSub changes
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      let catId = selectedSub || selectedMain;
      if (!catId) {
        setProducts([]);
        setLoading(false);
        return;
      }
      try {
        // Fetch products for the selected category
        const prods = await fetchProductsByCategory(catId);
        
        // Filter to only show active products and ensure price is available
        const activeProducts = prods.filter(product => 
          product.active && 
          product.price !== undefined && 
          product.price !== null
        );
        
        setProducts(activeProducts);
        setFilteredProducts(activeProducts);
      } catch (error) {
        console.error('Error loading products:', error);
        setProducts([]);
      }
      setLoading(false);
    };
    
    // Only load products if we have a valid category selected
    if (selectedMain) {
      loadProducts();
    }
  }, [selectedMain, selectedSub]);

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <div className={styles.sidebar}><Ressidebar /></div>

      {/* Main POS Area */}
      <div className={styles.mainArea}>
        {/* Top Tabs: Main Categories */}
        <div className={styles.tabsRow}>
          <div className={styles.scrollRow}>
            {mainCategories.map((cat) => (
              <div
                key={cat._id}
                className={
                  selectedMain === cat._id
                    ? `${styles.tab} ${styles.selectedTab}`
                    : styles.tab
                }
                onClick={() => {
                  setSelectedMain(cat._id);
                  setSelectedSub(null); // Reset subcategory selection
                }}
              >
                {cat.name}
              </div>
            ))}
          </div>
        </div>

        {/* Sub Tabs: Subcategories */}
        <div className={styles.subTabsRow}>
          <div className={styles.scrollRow}>
            {subCategories.map((sub) => (
              <div
                key={sub._id}
                className={
                  selectedSub === sub._id
                    ? `${styles.subTab} ${styles.selectedTab}`
                    : styles.subTab
                }
                onClick={() => setSelectedSub(sub._id)}
              >
                {sub.name}
              </div>
            ))}
          </div>
        </div>

        {/* Tiles Grid: Products */}
        <div className={styles.tilesGrid}>
          {loading ? (
            <div style={{ gridColumn: "span 6", textAlign: "center", padding: 40 }}>Loading...</div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ gridColumn: "span 6", textAlign: "center", padding: 40 }}>
              {searchQuery ? "No products match your search" : selectedMain ? "No active products found in this category" : "Please select a category"}
            </div>
          ) : (
            filteredProducts.map((prod) => (
              <div
                className={styles.tile}
                key={prod._id}
                onClick={() => handleAddToBill(prod)}
                style={{ cursor: "pointer" }}
                title="Add to bill"
              >
                <div className={styles.tileName}>{prod.name}</div>
                <div className={styles.tilePrice}>Rs.{prod.price ? prod.price.toFixed(2) : '0.00'}</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Order Section (unchanged) */}
      <div className={styles.orderSection}>
        {/* Search & Toggle */}
        <div className={styles.orderTop}>
          <input 
            className={styles.searchInput} 
            placeholder="Search Products" 
            value={searchQuery}
            onChange={(e) => {
              const query = e.target.value;
              setSearchQuery(query);
              
              if (query.trim() === "") {
                // If search is cleared, show all products in the selected category
                setFilteredProducts(products);
              } else {
                // Filter products based on search query
                const filtered = products.filter(product => 
                  product.name.toLowerCase().includes(query.toLowerCase())
                );
                setFilteredProducts(filtered);
              }
            }}
          />
          <div className={styles.toggleRow}>
            <label>
              <input
                type="radio"
                name="orderType"
                checked={orderType === "Take Away"}
                onChange={() => setOrderType("Take Away")}
              /> Take Away
            </label>
            <label>
              <input
                type="radio"
                name="orderType"
                checked={orderType === "Din in"}
                onChange={() => setOrderType("Din in")}
              /> Din in
            </label>
          </div>
        </div> 
        {/* Order List */}
        <div className={styles.orderList}>
          <table className={styles.orderTable}>
            <thead>
              <tr>
                <th>No</th><th>Name</th><th>Quantity</th><th>Price</th><th>Amount</th><th></th>
              </tr>
            </thead>
            <tbody>
              {billItems.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: '#aaa' }}>No items</td></tr>
              ) : (
                billItems.map((item, idx) => (
                  <tr key={item._id}>
                    <td>{String(idx + 1).padStart(2, '0')}</td>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>{Number(item.price).toFixed(2)}</td>
                    <td>{Number(item.amount).toFixed(2)}</td>
                    <td>
                      <button
                        className={styles.removeBtn}
                        title="Remove"
                        onClick={() => handleRemoveFromBill(item._id)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Total & Buttons */}
        <div className={styles.totalRow}>Total Amount <span>{totalAmount.toFixed(2)}</span></div>
        <div className={styles.buttonRow}>
          <button className={styles.actionBtn} onClick={handleShowReceipt} disabled={billItems.length === 0 || orderProcessing}>Cash</button>
          <button className={styles.actionBtn} onClick={() => setShowCardPopup(true)} disabled={billItems.length === 0 || orderProcessing}>Card</button>
          <button className={styles.actionBtn} disabled={billItems.length === 0 || orderProcessing} onClick={() => setShowGuestPopup(true)}>Add to Bill</button>
        </div>
        <div className={styles.buttonRow}>
          <button className={styles.actionBtn} disabled={billItems.length === 0}>Send to Kitchen</button>
          <button className={styles.actionBtn} disabled={billItems.length === 0}>Add a Note</button>
        </div>
      </div>
    {/* Guest Select Popup */}
    {showGuestPopup && (
      <div className={styles.receiptOverlay}>
        <div className={styles.guestPopup}>
          <div className={styles.guestContent}>
            <h2 className={styles.receiptTitle}>Select Guest</h2>
            <input
              className={styles.guestSearch}
              placeholder="Search by Room No or Name"
              value={guestSearch}
              onChange={e => setGuestSearch(e.target.value)}
              autoFocus
            />
            <div className={styles.guestList}>
              {filteredGuests.length === 0 ? (
                <div className={styles.guestEmpty}>No guests found.</div>
              ) : (
                filteredGuests.map((g) => (
                  <div
                    key={g.id}
                    className={
                      g.id === (selectedGuest && selectedGuest.id)
                        ? styles.guestRowSelected
                        : styles.guestRow
                    }
                    onClick={() => handleSelectGuest(g)}
                  >
                    <div className={styles.guestName}>{g.name}</div>
                    <div className={styles.guestRoom}>Room {g.room}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    )}
    {/* Card Payment Popup */}
    {showCardPopup && (
      <div className={styles.receiptOverlay}>
        <div className={styles.cardPopup}>
          <div className={styles.cardContent}>
            <h2 className={styles.cardTitle}>Card Payment</h2>
            <div className={styles.cardForm}>
              <div className={styles.cardFormGroup}>
                <label>Card Holder Name</label>
                <input 
                  type="text" 
                  value={cardDetails.cardHolderName}
                  onChange={(e) => setCardDetails({...cardDetails, cardHolderName: e.target.value})}
                  className={cardErrors.cardHolderName ? styles.cardInputError : ''}
                />
                {cardErrors.cardHolderName && <div className={styles.cardErrorText}>{cardErrors.cardHolderName}</div>}
              </div>
              
              <div className={styles.cardFormGroup}>
                <label>Card No</label>
                <input 
                  type="text" 
                  value={cardDetails.cardNumber}
                  onChange={(e) => {
                    // Only allow numbers and limit to 16 digits
                    const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                    setCardDetails({...cardDetails, cardNumber: value});
                  }}
                  className={cardErrors.cardNumber ? styles.cardInputError : ''}
                />
                {cardErrors.cardNumber && <div className={styles.cardErrorText}>{cardErrors.cardNumber}</div>}
              </div>
              
              <div className={styles.cardFormRow}>
                <div className={styles.cardFormGroup}>
                  <label>Expire Date</label>
                  <input 
                    type="text" 
                    placeholder="MM/YY"
                    value={cardDetails.expireDate}
                    onChange={(e) => {
                      // Format as MM/YY
                      let value = e.target.value.replace(/\D/g, '');
                      if (value.length > 2) {
                        value = value.slice(0, 2) + '/' + value.slice(2, 4);
                      }
                      setCardDetails({...cardDetails, expireDate: value});
                    }}
                    className={cardErrors.expireDate ? styles.cardInputError : ''}
                  />
                  {cardErrors.expireDate && <div className={styles.cardErrorText}>{cardErrors.expireDate}</div>}
                </div>
                
                <div className={styles.cardFormGroup}>
                  <label>CVV</label>
                  <input 
                    type="text" 
                    value={cardDetails.cvv}
                    onChange={(e) => {
                      // Only allow numbers and limit to 3-4 digits
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setCardDetails({...cardDetails, cvv: value});
                    }}
                    className={cardErrors.cvv ? styles.cardInputError : ''}
                  />
                  {cardErrors.cvv && <div className={styles.cardErrorText}>{cardErrors.cvv}</div>}
                </div>
              </div>
            </div>
            
            <div className={styles.cardBtnRow}>
              <button 
                className={styles.cardBtnCancel} 
                onClick={() => {
                  setShowCardPopup(false);
                  setCardDetails({
                    cardHolderName: '',
                    cardNumber: '',
                    expireDate: '',
                    cvv: ''
                  });
                  setCardErrors({});
                }}
              >
                Cancel
              </button>
              <button 
                className={styles.cardBtnConfirm} 
                onClick={() => handleCardPayment()}
                disabled={orderProcessing}
              >
                {orderProcessing ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    
    {/* Success Popup */}
    {showSuccessPopup && (
      <div className={styles.receiptOverlay}>
        <div className={styles.successPopup}>
          <div className={styles.successContent}>
            <h2 className={styles.successTitle}>Order Placed Successfully!</h2>
            <div className={styles.successInfo}>
              <p>Order No: <strong>{createdOrder?.orderNo}</strong></p>
              <p>Total Amount: <strong>Rs.{createdOrder?.total.toFixed(2)}</strong></p>
              <p>Status: <strong>{createdOrder?.status}</strong></p>
              {!createdOrder?.isWalkin && (
                <p>Guest: <strong>{createdOrder?.guestInfo?.guestName} (Room {createdOrder?.guestInfo?.roomNo})</strong></p>
              )}
            </div>
            <div className={styles.successBtnRow}>
              <button 
                className={styles.successBtnPrint} 
                onClick={() => {
                  // Set receipt data for printing
                  setBillMeta({
                    date: new Date(createdOrder?.createdAt).toLocaleDateString(),
                    time: new Date(createdOrder?.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    billNo: createdOrder?.orderNo,
                  });
                  // Show receipt for printing
                  setShowSuccessPopup(false);
                  setShowReceipt(true);
                }}
              >
                Print Receipt
              </button>
              <button 
                className={styles.successBtnDone} 
                onClick={() => {
                  setShowSuccessPopup(false);
                  setCreatedOrder(null);
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    
    {/* Receipt Popup */}
    {showReceipt && (
      <div className={styles.receiptOverlay}>
        <div className={styles.receiptPopup}>
          <div className={styles.receiptContent}>
            <h2 className={styles.receiptTitle}>Receipt</h2>
            <div className={styles.receiptMeta}>
              <div>Bill Date : <span>{billMeta.date}</span></div>
              <div>Bill Time : <span>{billMeta.time}</span></div>
              <div>Bill No : <span>{billMeta.billNo}</span></div>
              <div>Order Type : <span>{orderType}</span></div>
            </div>
            <table className={styles.receiptTable}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {billItems.map((item, idx) => (
                  <tr key={item._id}>
                    <td>{item.name}</td>
                    <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                    <td>{Number(item.price).toFixed(2)}</td>
                    <td>{Number(item.amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className={styles.receiptTotals}>
              <div><span>Total :</span> <span>{totalAmount.toFixed(2)}</span></div>
              <div>
                <span>Cash :</span>
                <input 
                  type="number"
                  min={totalAmount}
                  step="0.01"
                  value={cashAmount}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || totalAmount;
                    setCashAmount(value);
                    setChangeAmount(Math.max(0, value - totalAmount));
                  }}
                  style={{ 
                    width: '80px',
                    marginLeft: '8px',
                    padding: '4px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
              </div>
              <div><span>Change :</span> <span>{changeAmount.toFixed(2)}</span></div>
            </div>
            <div className={styles.receiptBtnRow}>
              <button className={styles.receiptBtnCancel} onClick={() => setShowReceipt(false)}>Cancel</button>
              <button 
                className={styles.receiptBtnCheckout} 
                onClick={() => handleCheckout(true)}
                disabled={orderProcessing}
              >
                {orderProcessing ? "Processing..." : "Checkout"}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    
    {/* Low Stock Alert */}
    <LowStockAlert />
  </div>
  );
};

export default RestaurantPOS;
