import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePackages } from "../../context/PackagesContext";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getPurchasedCartItems } from "../../api/cartApi";
import { useEffect, useMemo, useState } from "react";
import AddEmployeeDialog from "./AddOrEditEmployeeDialog";
import { getUserFromToken } from "../../util/jwt.pharser.js";
import {
  deleteOwnerEmployee,
  fetchEmployeeList,
} from "../../api/employeeApi.js";
import { enqueueSnackbar, useSnackbar } from "notistack";
import Footer from "../Footer/Footer.jsx";
import { Edit2, Trash2 } from "lucide-react";
import LogoutButton from "../auth/LogoutButton.jsx";

const PackageManagement = () => {
  const { ownerPackages } = usePackages();
  const navigate = useNavigate();

  const user = getUserFromToken();
  const email = user?.ownerEmail;
  const userEmail = user?.email;
  const userName = user?.name;
  const role = user?.role[0];
  const roles = user?.role;
  if (!user) {
    navigate("/login");
  }

  // Fixed handlePackageClick function with debugging
  const handlePackageClick = (packageId) => {
    console.log("Clicked package ID:", packageId); // Add this for debugging
    
    switch (packageId) {
      case 5: // Owner Package
        navigate("/ownedashboardpg");
        break;
      case 1: // Reception Package
        navigate("/recepdash");
        break;
      case 2: // Restaurant Package
        navigate("/restaurant/dashboard");
        break;
      case 3: // Kitchen Package
        navigate("/kitchen-dashboard");
        break;
      case 4: // Housekeeping Package
        navigate("/housekeeping-dashboard");
        break;
      default:
        console.warn(`No route defined for package ID: ${packageId}`);
        // You might want to show a notification or handle this case
        enqueueSnackbar(`No dashboard available for this package (ID: ${packageId})`, { 
          variant: "warning" 
        });
        break;
    }
  };

  const { data: ownerEmployeeData, isFetching: isEmployeeDataFetching } =
    useQuery({
      queryKey: ["owner-employee", email],
      queryFn: () => fetchEmployeeList(email),
      enabled: !!email,
    });
  const queryClient = useQueryClient();

  const { mutate: deleteEmployeeMutation } = useMutation({
    mutationFn: deleteOwnerEmployee,
    onSuccess: () => {
      enqueueSnackbar("Employee Deleted Successfully!", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["owner-employee", email] });
    },
    onError: (error) => {
      const serverMessage =
        error?.response?.data?.message || "Failed to Delete Employee";
      enqueueSnackbar(serverMessage, { variant: "error" });
    },
  });

  const { data: purchasedItemData, isFetching: isPurchasedItemFetching } =
    useQuery({
      queryKey: ["cart-items", email, roles],
      queryFn: () => getPurchasedCartItems(email, roles),
      enabled: !!email && !!roles,
    });

  const cartTotalPrice = useMemo(() => {
    return purchasedItemData?.reduce((sum, item) => sum + item.price, 0);
  }, [purchasedItemData]);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const handleDeleteEmployee = (id) => {
    enqueueSnackbar("Are you sure you want to delete this employee?", {
      variant: "default",
      persist: true,
      action: (key) => (
        <>
          <button
            onClick={() => {
              deleteEmployeeMutation(id);
              closeSnackbar(key);
            }}
            style={{
              marginRight: 8,
              color: "#4caf50",
              border: "none",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            Ok
          </button>
          <button
            onClick={() => {
              closeSnackbar(key);
            }}
            style={{
              color: "#f44336",
              border: "none",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </>
      ),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                <img src="/favicon.svg" alt="Nexus Hotel" className="w-6 h-6" />
                <span>
                  Powered by{" "}
                  <span className="font-semibold text-gray-800">Nexus</span>
                </span>
              </div>

              {role === "OWNER" ? (
                <h1 className="text-3xl font-bold text-gray-900">
                  Package Management
                </h1>
              ) : (
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome to {email}'s HMS
                </h1>
              )}
              {role === "OWNER" ? (
                <p className="mt-2 text-gray-600">
                  Manage your purchased HMS packages
                </p>
              ) : (
                <p className="mt-2 text-gray-600">
                  Work Your HMS packages with here
                </p>
              )}
            </div>
            <div className="flex gap-4 items-center">
              {(purchasedItemData?.length === 0 ||
                purchasedItemData?.length === 5) &&
              role === "OWNER" ? (
                <>
                  <button
                    onClick={() => navigate("/hms-home")}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
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
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                    Back to Home
                  </button>
                  <LogoutButton onLogout={() => navigate("/login")} />
                </>
              ) : role === "OWNER" ? (
                <>
                  <button
                    onClick={() => navigate("/hms-home")}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
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
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Add More Packages
                  </button>
                  <LogoutButton onLogout={() => navigate("/login")} />
                </>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <LogoutButton onLogout={() => navigate("/login")} />
                  <div className="text-lg font-medium text-gray-800">
                    Hi, {userName}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      {role === "OWNER" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <svg
                    className="w-6 h-6 text-blue-600"
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
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Total Packages
                  </h3>
                  <p className="text-3xl font-bold text-blue-600">
                    {purchasedItemData?.length}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Active Packages
                  </h3>
                  <p className="text-3xl font-bold text-green-600">
                    {
                      purchasedItemData?.filter(
                        (pkg) => pkg.status === "PURCHASED"
                      )?.length
                    }
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Total Investment
                  </h3>
                  <p className="text-3xl font-bold text-purple-600">
                    ${cartTotalPrice}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Packages Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          {role === "OWNER" ? (
            <h2 className="text-2xl font-bold text-gray-900">
              Your Purchased Packages
            </h2>
          ) : (
            <h2 className="text-2xl font-bold text-gray-900">
              Working Packages
            </h2>
          )}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
              Active:{" "}
              {
                purchasedItemData?.filter((pkg) => pkg.status === "PURCHASED")
                  .length
              }
            </span>
          </div>
        </div>
        {purchasedItemData?.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-gray-100">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
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
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              No packages purchased yet
            </h3>
            <p className="mt-1 text-gray-500">
              Start by purchasing some HMS packages to manage your hotel
              efficiently.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {purchasedItemData?.map((pkg, index) => (
              <motion.div
                key={`package-${pkg.id}-${index}`} // Fixed: Added unique key
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer group"
                onClick={() => {
                  console.log("Package clicked:", pkg); // Debug log
                  handlePackageClick(pkg.pkgId);

                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="relative h-48">
                  <img
                    src={pkg.image}
                    alt={pkg.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-4 right-4">
                    {role === "OWNER" ? (
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          pkg.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {pkg.status}
                      </span>
                    ) : (
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          pkg.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        WORKING
                      </span>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100 font-semibold text-lg">
                      Click to Open Dashboard
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {pkg.name}
                  </h3>
                  <p className="text-gray-600 mt-2">{pkg.description}</p>
                  {role === "OWNER" && (
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-lg font-bold text-blue-600">
                        ${pkg.price}
                      </span>
                      <span className="text-sm text-gray-500">
                        Purchased on:{" "}
                        {new Date(pkg.purchaseDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
        <div className="flex mt-5">
          {role === "OWNER" && (
            <button
              className="bg-blue-600 hover:bg-blue-700 mt-8 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
              onClick={() => {
                setEditingEmployee(null);
                setIsDialogOpen(true);
              }}
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add Employee
            </button>
          )}
        </div>
        {role === "OWNER" && (
          <div className="overflow-x-auto mt-6">
            {isEmployeeDataFetching && (
              <div className="w-full px-6">
                <div className="h-1 bg-gray-200 rounded overflow-hidden">
                  <div className="h-full bg-blue-600 animate-pulse w-full"></div>
                </div>
              </div>
            )}
            <table className="min-w-full border border-gray-200 bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-gray-100 text-gray-700 text-left text-sm uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3 border-b">#</th>
                  <th className="px-6 py-3 border-b">EMPLOYEE ID</th>
                  <th className="px-6 py-3 border-b">Name</th>
                  <th className="px-6 py-3 border-b">Email</th>
                  <th className="px-6 py-3 border-b">Role</th>
                  <th className="px-6 py-3 border-b">Action</th>
                </tr>
              </thead>
              <tbody className="text-gray-800 text-sm">
                {ownerEmployeeData?.map((employee, index) => (
                  <tr
                    key={`employee-${employee._id}`} // Fixed: Added unique key
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-3 border-b">{index + 1}</td>
                    <td className="px-6 py-3 border-b">{employee._id}</td>
                    <td className="px-6 py-3 border-b">{employee.name}</td>
                    <td className="px-6 py-3 border-b">{employee.email}</td>
                    <td className="px-6 py-3 border-b">
                      <div className="flex flex-wrap gap-2">
                        {employee?.role?.map((r, idx) => (
                          <span
                            key={`role-${employee._id}-${idx}`} // Fixed: Added unique key
                            className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-6 py-3 border-b">
                      <button
                        onClick={() => {
                          setEditingEmployee(employee);
                          setIsDialogOpen(true);
                        }}
                        className="text-blue-600 hover:underline mr-4"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          handleDeleteEmployee(employee._id);
                        }}
                        className="text-red-600 hover:underline"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <AddEmployeeDialog
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingEmployee(null);
        }}
        defaultValues={editingEmployee}
      />
      <Footer />
    </div>
  );
};

export default PackageManagement;