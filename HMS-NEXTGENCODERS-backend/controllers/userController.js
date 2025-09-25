import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";

export const getUserData = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await userModel.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      userData: {
        name: user.name,
        isAccountVerified: user.isAccountVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDashboardData = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await userModel.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      dashboardData: {
        totalPackages: user.packages.length,
        activePackages: user.packages.filter((pkg) => pkg.status === "active")
          .length,
        totalSpent: user.totalSpent || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPackages = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await userModel.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      packages: user.packages,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyPackages = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await userModel.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      myPackages: user.packages,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCart = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await userModel.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      cart: user.cart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { userId } = req.body;
    const { packageId, quantity = 1 } = req.body;

    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const existingItem = user.cart.find((item) => item.packageId === packageId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      user.cart.push({ packageId, quantity });
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Item added to cart successfully",
      cart: user.cart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { userId } = req.body;
    const { packageId } = req.body;

    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.cart = user.cart.filter((item) => item.packageId !== packageId);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Item removed from cart successfully",
      cart: user.cart,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const purchasePackages = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await userModel.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.cart.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // Add cart items to packages
    user.packages.push(
      ...user.cart.map((item) => ({
        packageId: item.packageId,
        quantity: item.quantity,
        status: "active",
        purchaseDate: new Date(),
      }))
    );

    // Clear cart
    user.cart = [];
    await user.save();

    res.status(200).json({
      success: true,
      message: "Packages purchased successfully",
      packages: user.packages,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const assignPackageToDepartment = async (req, res) => {
  try {
    const { userId } = req.body;
    const { packageId, department } = req.body;

    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const packageItem = user.packages.find(
      (pkg) => pkg.packageId === packageId
    );
    if (!packageItem) {
      return res
        .status(404)
        .json({ success: false, message: "Package not found" });
    }

    packageItem.status = "active";
    await user.save();

    res.status(200).json({
      success: true,
      message: "Package assigned successfully",
      package: packageItem,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOwnerEmployeeList = async (req, res) => {
  try {
    const { email } = req.params;

    const employees = await userModel.find({
      ownerEmail: email,
      role: { $ne: "OWNER" },
    });

    if (!employees || employees.length === 0) {
      return res
        .status(200)
        .json([]);
    }

    return res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOwnerEmployee = async (req, res) => {
  try {
    const { _id, email, name, role, password, isActive } = req.body;

    if (!_id || !email || !name || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (isActive) {
      // Hash the password before updating
      if (!password) {
        return res
          .status(400)
          .json({ message: "Password is required for active users" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);

      const updatedEmployee = await userModel.findByIdAndUpdate(
        _id,
        { email, name, role, password: hashedPassword },
        { new: true }
      );

      return res.status(200).json(updatedEmployee);
    } else {
      // Don't update password if not active
      const updatedEmployee = await userModel.findByIdAndUpdate(
        _id,
        { email, name, role },
        { new: true }
      );

      return res.status(200).json(updatedEmployee);
    }
  } catch (error) {
    console.error("Error updating employee:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteOwnerEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Employee ID is required" });
    }

    const deletedEmployee = await userModel.findByIdAndDelete(id);

    if (!deletedEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    return res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
