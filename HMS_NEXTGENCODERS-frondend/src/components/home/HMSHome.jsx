import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { usePackages } from "../../context/PackagesContext";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { addToMyCart, countMyCart } from "../../api/cartApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { email } from "zod";
import { enqueueSnackbar } from "notistack";
import { getUserFromToken } from "../../util/jwt.pharser";
import LogoutButton from "../auth/LogoutButton";

const HMSHome = () => {
  const navigate = useNavigate();
  const { addToCart, cart, ownerPackages } = usePackages();
  const { isAuthenticated } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  const user = getUserFromToken();
  const role = user?.role[0];

  if (!user) {
    navigate("/login");
  } else if (role !== "OWNER") {
    navigate("/package-management");
  }

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Define the specific packages
  const packages = [
    {
      id: 5,
      name: "Owner Package",
      description:
        "Complete hotel management solution with advanced analytics and reporting.",
      features: [
        "Revenue management",
        "Staff performance tracking",
        "Financial reporting",
        "Business analytics",
        "Multi-property management",
      ],
      image:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3",
      price: 39,
    },
    {
      id: 1,
      name: "Reception Package",
      description:
        "Streamline your front desk operations with our comprehensive reception management system.",
      features: [
        "Guest check-in/check-out",
        "Reservation management",
        "Room allocation",
        "Billing & invoicing",
        "Guest profile management",
      ],
      image:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3",
      price: 29,
    },
    {
      id: 2,
      name: "Restaurant Package",
      description:
        "Efficiently manage your restaurant operations and enhance dining experience.",
      features: [
        "Table reservations",
        "Order management",
        "Menu customization",
        "Billing integration",
        "Customer feedback",
      ],
      image:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3",
      price: 24,
    },
    {
      id: 3,
      name: "Kitchen Package",
      description: "Optimize kitchen operations and inventory management.",
      features: [
        "Inventory tracking",
        "Recipe management",
        "Order processing",
        "Cost control",
        "Waste management",
      ],
      image:
        "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?ixlib=rb-4.0.3&fit=crop&w=800&h=600",
      price: 19,
    },
    {
      id: 4,
      name: "Housekeeping Package",
      description:
        "Maintain high standards of cleanliness and room maintenance.",
      features: [
        "Room status tracking",
        "Cleaning schedules",
        "Maintenance requests",
        "Inventory management",
        "Quality control",
      ],
      image:
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3",
      price: 14,
    },
  ];

  const handlePackageSelect = async (pkg) => {
    if (!isAuthenticated) {
      alert("Please login to add packages to your cart");
      navigate("/login");
      return;
    }

    // Check if package is already purchased
    const isAlreadyPurchased = ownerPackages.some((item) => item.id === pkg.id);
    if (isAlreadyPurchased) {
      alert("You have already purchased this package!");
      return;
    }

    // Check if package is already in cart
    const isInCart = cart.some((item) => item.id === pkg.id);
    if (isInCart) {
      alert("This package is already in your cart!");
      return;
    }

    const success = await addToCart(pkg);
    // if (success) {
    //   // Show success message
    //   alert('Package added to cart successfully!');
    // }
  };

  // Function to check if a package is already purchased
  const isPackagePurchased = (packageId) => {
    return ownerPackages.some((pkg) => pkg.id === packageId);
  };

  // Function to check if a package is in the cart
  const isPackageInCart = (packageId) => {
    return cart.some((item) => item.id === packageId);
  };
  const email = localStorage.getItem("email");
  const queryClient = useQueryClient();

  const { mutate: addToCartMutation } = useMutation({
    mutationFn: addToMyCart,
    onSuccess: () => {
      enqueueSnackbar("Cart Added Successfully!", { variant: "success" });

      queryClient.invalidateQueries({ queryKey: ["my-cart"] });
      if (email) {
        queryClient.invalidateQueries({ queryKey: ["cart-count", email] });
        queryClient.invalidateQueries({ queryKey: ["cart-items", email] });
      }
    },
    onError: (error) => {
      const serverMessage =
        error?.response?.data?.message || "Failed to add package to cart!";
      enqueueSnackbar(serverMessage, { variant: "error" });
    },
  });

  const handleAddtoMyCart = (pkg) => {
    console.log(pkg);

    const email = localStorage.getItem("email");
    const userId = localStorage.getItem("userId");

    const updatedPkg = {
      ...pkg,
      pkgId: pkg.id,
      userEmail: email,
      userId: userId,
      purchaseDate: new Date().toISOString(),
    };

    addToCartMutation(updatedPkg);
  };

  const { data: cartCountData, isFetching: isCountFetching } = useQuery({
    queryKey: ["cart-count", email],
    queryFn: () => countMyCart(email),
  });

  const cartCount = useMemo(() => {
    return cartCountData?.count || 0;
  }, [cartCountData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Cart Button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-4 right-4 z-50 flex gap-4"
      >
        <button
          onClick={() => navigate("/package-management")}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
        >
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
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          My Packages
        </button>
        {ownerPackages.length !== packages.length && (
          <button
            onClick={() => navigate("/cart")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
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
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Your Cart ({cartCount})
          </button>
        )}

        <LogoutButton onLogout={() => navigate("/login")} />
      </motion.div>

      {/* Hero Section */}
      <div
        className="relative h-[80vh] bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50"></div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 h-full flex flex-col items-center justify-center text-white text-center px-4"
        >
          <h1 className="text-6xl font-bold mb-6 tracking-tight">
            Nexus Hotel Management System
          </h1>
          <p className="text-2xl max-w-3xl mb-8 text-gray-200">
            Elevate your hotel operations with Nexus HMS - Where luxury meets
            efficiency
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              document
                .getElementById("packages")
                .scrollIntoView({ behavior: "smooth" })
            }
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl text-lg"
          >
            Explore Packages
          </motion.button>
        </motion.div>
      </div>

      {/* Features Overview */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Nexus HMS?
            </h2>
            <p className="text-xl text-gray-600">
              Experience the next generation of hotel management solutions
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
                title: "Comprehensive Management",
                description:
                  "Seamlessly manage all aspects of your hotel operations from a single platform, including reservations, housekeeping, and inventory",
              },
              {
                icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                title: "Revenue Optimization",
                description:
                  "Maximize your hotel's revenue with dynamic pricing, occupancy management, and comprehensive financial reporting tools",
              },
              {
                icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
                title: "Guest Experience",
                description:
                  "Enhance guest satisfaction with personalized services, quick check-in/out, and efficient complaint resolution systems",
              },
              {
                icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
                title: "Security & Compliance",
                description:
                  "Ensure data security and regulatory compliance with advanced encryption and audit trail features",
              },
              {
                icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z",
                title: "Real-time Analytics",
                description:
                  "Make data-driven decisions with real-time analytics and customizable dashboards for performance monitoring",
              },
              {
                icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
                title: "24/7 Support",
                description:
                  "Get round-the-clock technical support and regular system updates to ensure smooth operations",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="p-8 bg-blue-50 rounded-2xl hover:bg-blue-100 transition-colors duration-300"
              >
                <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6 transform hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d={feature.icon}
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Packages Section */}
      <div id="packages" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-[1800px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Nexus HMS Packages
            </h2>
            <p className="text-xl text-gray-600">
              Choose from our specialized packages to enhance your hotel's
              operations
            </p>
          </motion.div>

          {ownerPackages.length === packages.length ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 bg-white rounded-2xl shadow-xl"
            >
              <h3 className="text-3xl font-bold text-green-600 mb-4">
                Congratulations!
              </h3>
              <p className="text-xl text-gray-600 mb-6">
                You have purchased all available packages.
              </p>
              <p className="text-lg text-gray-500">
                You now have access to all our premium features.
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-5 gap-4">
              {packages.map((pkg, index) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col h-[600px]"
                >
                  <div className="h-[280px] w-full overflow-hidden">
                    <img
                      src={pkg.image}
                      alt={pkg.name}
                      className="w-full h-full object-cover object-center transform hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-1">
                      {pkg.name}
                    </h3>
                    <p className="text-base text-gray-600 mb-4 line-clamp-3">
                      {pkg.description}
                    </p>
                    <ul className="space-y-2 mb-4">
                      {pkg.features.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-center text-gray-600 text-base"
                        >
                          <svg
                            className="w-5 h-5 mr-2 text-green-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="line-clamp-1">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-blue-600">
                          ${pkg.price}
                        </span>
                        {isPackagePurchased(pkg.id) ? (
                          <span className="text-purple-600 text-base font-semibold">
                            Purchased
                          </span>
                        ) : isPackageInCart(pkg.id) ? (
                          <span className="text-green-600 text-base font-semibold">
                            In Cart
                          </span>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleAddtoMyCart(pkg)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold py-2 px-4 rounded-lg transition-colors duration-300 shadow hover:shadow-md"
                          >
                            Add to Carts
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Ready to Transform Your Hotel with Nexus HMS?
            </h2>
            <p className="text-2xl mb-12 text-gray-200">
              Experience the future of hotel management with our comprehensive
              suite of features
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {[
                {
                  icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
                  title: "Streamlined Operations",
                  description: "Automate daily tasks and improve efficiency",
                },
                {
                  icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                  title: "Revenue Growth",
                  description: "Maximize profits with smart pricing tools",
                },
                {
                  icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
                  title: "Guest Satisfaction",
                  description: "Deliver exceptional guest experiences",
                },
                {
                  icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
                  title: "Data Security",
                  description: "Protect your business with advanced security",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="p-6 bg-white/10 rounded-xl backdrop-blur-sm"
                >
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d={feature.icon}
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-200">{feature.description}</p>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-blue-900 hover:bg-blue-50 font-semibold py-4 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl text-lg"
              >
                Request Demo
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HMSHome;
