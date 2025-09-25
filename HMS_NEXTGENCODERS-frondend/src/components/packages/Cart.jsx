import { useNavigate } from "react-router-dom";
import { usePackages } from "../../context/PackagesContext";
import { useMemo, useState } from "react";
import {
  myCartItems,
  purchaseCartItems,
  removeCartItems,
} from "../../api/cartApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { getUserFromToken } from "../../util/jwt.pharser";
import LogoutButton from "../auth/LogoutButton";
import Footer from "../Footer/Footer";

const Cart = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, purchasePackages } = usePackages();
  const [isProcessing, setIsProcessing] = useState(false);
  const email = localStorage.getItem("email");
  const queryClient = useQueryClient();

  const user = getUserFromToken();
  const role = user?.role[0];

  if (!user) {
    navigate("/login");
  } else if (role !== "OWNER") {
    navigate("/package-management");
  }

  const calculateTotal = () => {
    return cart.reduce(
      (total, item) => total + parseFloat(item.price) * item.quantity,
      0
    );
  };

  const { data: cartItemsData, isFetching: isCartItemsFetching } = useQuery({
    queryKey: ["cart-items", email],
    queryFn: () => myCartItems(email),
  });

  const cartTotalPrice = useMemo(() => {
    return cartItemsData?.reduce((sum, item) => sum + item.price, 0);
  }, [cartItemsData]);

  const { mutate: removeCartMutation } = useMutation({
    mutationFn: removeCartItems,
    onSuccess: () => {
      enqueueSnackbar("Cart Removed Successfully!", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["cart-items", email] });
    },
    onError: (error) => {
      console.error("Mutation failed:", error);
      const serverMessage =
        error?.response?.data?.message || "Failed to remove from cart!";
      enqueueSnackbar(serverMessage, { variant: "error" });
    },
  });

  const handleRemove = async (packageId) => {
    removeCartMutation(packageId);
  };

  const { mutate: purchaseCartMutation } = useMutation({
    mutationFn: purchaseCartItems,
    onSuccess: () => {
      enqueueSnackbar("Cart Purchased Successfully!", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["cart-items", email] });
    },
    onError: (error) => {
      console.error("Mutation failed:", error);
      const serverMessage =
        error?.response?.data?.message || "Failed to purchase cart Items";
      enqueueSnackbar(serverMessage, { variant: "error" });
    },
  });

  const handlePurchaseCartItem = async () => {
    try {
      const allIds = cartItemsData.map((item) => item._id);
      purchaseCartMutation(allIds);
      console.log("Purchase response:");
      navigate("/package-management");
    } catch (error) {
      console.error("Error purchasing items:", error);
    }
  };

  const handlePurchase = async () => {
    if (cartItemsData.length === 0) {
      alert("Your cart is empty");
      return;
    }

    try {
      setIsProcessing(true);

      // Here we would normally integrate with Stripe or another payment gateway
      // For now, we'll simulate a successful payment
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate payment processing

      const success = await purchasePackages();
      if (success) {
        // alert('Payment successful! Your packages have been purchased.');
        // Navigate to package management page after successful purchase
        navigate("/package-management");
      } else {
        throw new Error("Failed to purchase packages");
      }
    } catch (error) {
      console.error("Error purchasing packages:", error);
      alert("Failed to process payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your Cart</h1>
          <button
            onClick={() => navigate("/hms-home")}
            className="text-blue-600 hover:text-blue-800"
          >
            Browse More Packages
          </button>

          <LogoutButton onLogout={() => navigate("/login")} />
        </div>

        {cartItemsData?.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-8">
              Add some packages to your cart to see them here
            </p>
            <button
              onClick={() => navigate("/hms-home")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Browse Packages
            </button>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="divide-y divide-gray-200">
              {cartItemsData?.map((item) => (
                <div
                  key={item.id}
                  className="p-6 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-lg font-bold text-blue-600">
                        ${item.price}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(item._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">
                  Total:
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  ${cartTotalPrice}
                </span>
              </div>
              <div className="mt-4">
                <button
                  onClick={handlePurchaseCartItem}
                  disabled={isProcessing}
                  className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${
                    isProcessing ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Proceed to Payment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
};

export default Cart;
