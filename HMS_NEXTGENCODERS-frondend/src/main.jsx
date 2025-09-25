import React from 'react'; // Add this line
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import App from './App.jsx';


import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import HMSHome from "./components/home/HMSHome";
import { AuthProvider } from "./context/AuthContext";
import { PackagesProvider } from "./context/PackagesContext";
import Packages from "./components/packages/Packages";
import Cart from "./components/packages/Cart";
import OwnerPackages from "./components/packages/OwnerPackages";
import PackageManagement from "./components/packages/PackageManagement";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SnackbarProvider } from "notistack";







//owner goes here
import RoomHomepage from './pages/Departments/Owner/OwnRooms/RoomHomepage.jsx';
import OwnsettingsPage from './pages/Departments/Owner/OwnSettings/Ownsettingpage.jsx';
import TransactionReportpage from "./pages/Departments/Owner/OwnReports/TransactionReportpage.jsx";
import StockReportpage from "./pages/Departments/Owner/OwnReports/Stockreportpage.jsx";
import CheckoutPage from "./pages/Departments/Owner/OwnReports/Checkoutpage.jsx";
import OwnDashboardpage from './pages/Departments/Owner/OwnDashboard/OwnDashboardpage.jsx';



//reception goes here
import FormSection from './components/reception/Formsection1.jsx';
import Reservation1 from './pages/Departments/Reception/DNReservations/Reservation1.jsx';
import Rooms from './pages/Departments/Reception/Rooms/Rooms.jsx';
import GuestRes from './components/reception/Formedit/GuestRes.jsx';
import EditReservation1 from './pages/Departments/Reception/DNReservations/EditReservation1.jsx';
import DayoutReservationpage from './pages/Departments/Reception/DOReservations/DayoutReservationpage.jsx';
import DayoutReservation from './components/reception/Dayout/DayoutReservation.jsx';
import Recepdashboardpage from './pages/Departments/Reception/Dashboardrecep/Recepdashboard.jsx'
import CreatePackages from './components/reception/Dayout/CreatePackages.jsx';
import DeletePackages from './components/reception/Dayout/DeletePackages.jsx';
import EditPackages from './components/reception/Dayout/EditPackages.jsx';
import PackageHome from './components/reception/Dayout/PackageHome.jsx';
import Packagespage from './pages/Departments/Reception/DOReservations/packagespage.jsx';






//resturent here
import ResCategories from "./pages/Departments/Restaurant/Categories/ResCategories.jsx";
import Products from "./pages/Departments/Restaurant/Products/Products";
import Analytics from "./pages/Departments/Restaurant/Analytics/Analytics.jsx";

import { NotificationProvider } from './context/NotificationContext.jsx';
import RestaurantPOS from './components/restaurant/RestaurantPOS';
import Dashboard from './pages/Departments/Restaurant/Dashboard/Dashboard.jsx';









const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PackagesProvider>
          <NotificationProvider>
            <SnackbarProvider maxSnack={3} autoHideDuration={2500}>
              <Router>
                <div className="min-h-screen bg-gray-100">
                  <Routes>
                    {/* Authentication Routes */}
                    <Route path="/" element={<Login />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/hms-home" element={<HMSHome />} />
                    <Route
                    path="/packages"
                    element={
                      <ProtectedRoute>
                        <Packages />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/cart" element={<Cart />} />
                  <Route
                    path="/my-packages"
                    element={
                      <ProtectedRoute>
                        <OwnerPackages />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/package-management"
                    element={
                      <ProtectedRoute>
                        <PackageManagement />
                      </ProtectedRoute>
                    }
                  />


                    {/*owner Routes */}
        <Route path="/rooms/home" element={<RoomHomepage />} />
        <Route path="/ownsettings" element={<OwnsettingsPage />} />
        <Route path="/Transactionreportspage" element={<TransactionReportpage />} />
        <Route path="/Stockreportspage" element={<StockReportpage />} />
        <Route path="/Checkoutpage" element={<CheckoutPage />} />
        <Route path="/ownedashboardpg" element={<OwnDashboardpage />} />


           {/* Reception Routes */}

            {/* Package Management Routes */}
                <Route path="/packages" element={<PackageHome />} />
                <Route path="/packages/add" element={<CreatePackages />} />
                <Route path="/packages/edit/:id" element={<EditPackages />} />
                <Route path="/packages/delete/:id" element={<DeletePackages />} />


        {/* Reception Routes */}
        <Route path="/reception" element={<FormSection />} />
        <Route path="/page1"  element={<Reservation1 />} />
        <Route path="/rooms" element={<Rooms/>} />
        <Route path="/guest" element={<GuestRes />} />
        
        <Route path="/edit-reservation" element={<EditReservation1 />} /> {/* Route for EditReservation1 component */}
        <Route path="/dayout" element={<DayoutReservation />} />
        <Route path="/dayout-create" element={<DayoutReservationpage />} /> {/* Route for DayoutReservationpage component */}
        <Route path="/dayout-packages" element={<Packagespage />} /> {/* Route for packagespage component */}
        <Route path="/recepdash" element={<Recepdashboardpage/>} />
       
     
        
        {/* Restaurant Routes */}

        
            <Route path="/restaurant/categories" element={<ResCategories />} />
            <Route path="/restaurant/products" element={<Products />} />
            <Route path="/restaurant/create-order" element={<RestaurantPOS />} />
            <Route path="/restaurant/dashboard" element={<Dashboard />} />
            <Route path="/restaurant/analytics" element={<Analytics />} />


                    

                    {/* Fallback route */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </div>
              </Router>
            </SnackbarProvider>
          </NotificationProvider>
        </PackagesProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
);