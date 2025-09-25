import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

export const PackagesContext = createContext();

export const usePackages = () => {
  const context = useContext(PackagesContext);
  if (!context) {
    throw new Error('usePackages must be used within a PackagesProvider');
  }
  return context;
};

export const PackagesProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [packages, setPackages] = useState([]);
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [ownerPackages, setOwnerPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch packages from backend
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/user/packages');
        if (response.data.success) {
          setPackages(response.data.packages);
        } else {
          throw new Error(response.data.message || 'Failed to fetch packages');
        }
      } catch (error) {
        console.error('Error fetching packages:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  // Fetch owner's purchased packages
  // useEffect(() => {
  //   const fetchOwnerPackages = async () => {
  //     try {
  //       setLoading(true);
  //       const response = await axios.get('/api/user/owner-packages');
  //       if (response.data.success) {
  //         setOwnerPackages(response.data.packages);
  //       } else {
  //         throw new Error(response.data.message || 'Failed to fetch owner packages');
  //       }
  //     } catch (error) {
  //       console.error('Error fetching owner packages:', error);
  //       setError(error.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchOwnerPackages();
  // }, []);

  // Fetch cart from backend if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetch(`/api/user/cart?userId=${user._id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setCart(data.cart);
        });
    }
  }, [isAuthenticated, user]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, isAuthenticated]);

  // const addToCart = async (packageItem) => {
  //   try {
  //     setCart(prevCart => {
  //       const existingItem = prevCart.find(item => item.id === packageItem.id);
  //       if (existingItem) {
  //         return prevCart.map(item =>
  //           item.id === packageItem.id
  //             ? { ...item, quantity: item.quantity + 1 }
  //             : item
  //         );
  //       }
  //       return [...prevCart, { ...packageItem, quantity: 1 }];
  //     });
  //     // Optionally, send to backend if authenticated
  //     if (isAuthenticated && user) {
  //       await fetch('/api/user/add-to-cart', {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify({ userId: user._id, packageId: packageItem.id, quantity: 1 })
  //       });
  //     }
  //     return true;
  //   } catch (error) {
  //     console.error('Error adding to cart:', error);
  //     throw new Error('Failed to add item to cart');
  //   }
  // };

  const removeFromCart = async (packageId) => {
    try {
      setCart(prevCart => prevCart.filter(item => item.id !== packageId));
      if (isAuthenticated && user) {
        await fetch('/api/user/remove-from-cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user._id, packageId })
        });
      }
      return true;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw new Error('Failed to remove item from cart');
    }
  };

  const purchasePackages = async () => {
    try {
      // Simulate successful payment and package purchase
      const purchasedPackages = cart.map(item => ({
        ...item,
        status: 'active',
        purchaseDate: new Date().toISOString(),
        subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year subscription
      }));

      // Update owner packages in state
      setOwnerPackages(prevPackages => [...prevPackages, ...purchasedPackages]);

      // Clear the cart in state
      setCart([]);

      // Clear the cart in localStorage for guests
      if (!isAuthenticated) {
        localStorage.removeItem('cart');
      }

      // Clear the cart in backend for authenticated users
      if (isAuthenticated && user) {
        await fetch('/api/user/clear-cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user._id })
        });
      }

      return true;
    } catch (error) {
      console.error('Error purchasing packages:', error);
      throw new Error('Failed to purchase packages');
    }
  };

  const value = {
    packages,
    cart,
    ownerPackages,
    loading,
    error,
    // addToCart,
    removeFromCart,
    purchasePackages
  };

  return (
    <PackagesContext.Provider value={value}>
      {children}
    </PackagesContext.Provider>
  );
};