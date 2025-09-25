import express from 'express'
import userAuth from '../middleware/userAuth.js';
import { 
    getUserData, 
    getDashboardData, 
    getPackages, 
    getCart, 
    getMyPackages,
    addToCart,
    removeFromCart,
    purchasePackages,
    assignPackageToDepartment,
    getOwnerEmployeeList,
    updateOwnerEmployee,
    deleteOwnerEmployee
} from '../controllers/userController.js';

const userRouter = express.Router();

// Basic user routes
userRouter.get('/data', userAuth, getUserData);
userRouter.get('/dashboard', userAuth, getDashboardData);
userRouter.get('/packages', userAuth, getPackages);
userRouter.get('/my-packages', userAuth, getMyPackages);
userRouter.get('/cart', userAuth, getCart);

// Cart operations
userRouter.post('/cart/add', userAuth, addToCart);
userRouter.post('/cart/remove', userAuth, removeFromCart);
userRouter.post('/cart/purchase', userAuth, purchasePackages);

// Package management
userRouter.post('/packages/assign', userAuth, assignPackageToDepartment);

//employee management
userRouter.get('/:email/owner-employee', getOwnerEmployeeList);
userRouter.put('/update-employee', updateOwnerEmployee);
userRouter.delete('/:id/delete-employee', deleteOwnerEmployee);
export default userRouter;

