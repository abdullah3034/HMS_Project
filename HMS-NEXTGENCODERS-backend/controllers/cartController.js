import Cart from "../models/CartModels.js";

export const addToCart = async (req, res) => {
  try {
    const {
      name,
      description,
      pkgId,
      image,
      price,
      features, // <-- add this line
      userEmail,
      userId,
      purchaseDate,
    } = req.body;

    // Basic validation
    if (
      !name ||
      !description ||
      !pkgId ||
      !image ||
      price === undefined ||
      !features || // <-- add validation for features
      !userEmail ||
      !userId ||
      !purchaseDate
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const cartExistingItem = await Cart.findOne({
      name,
      userEmail,
      status: "INCART",
    });
    if (cartExistingItem) {
      return res
        .status(409)
        .json({ success: false, message: "Item already in Cart" });
    }
    const purchaseExistingItem = await Cart.findOne({
      name,
      userEmail,
      status: "PURCHASED",
    });
    if (purchaseExistingItem) {
      return res
        .status(409)
        .json({ success: false, message: "Item already Purchased" });
    }

    const newItem = await Cart.create({
      name,
      description,
      pkgId,
      image,
      price,
      features,
      userEmail,
      userId,
      purchaseDate,
    });

    res.status(201).json({
      success: true,
      message: "Item added to cart",
      cartItem: newItem,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const countMyCart = async (req, res) => {
  try {
    const { userEmail } = req.params;

    if (!userEmail) {
      return res.status(400).json({ message: "User email is required" });
    }

    const itemCount = await Cart.countDocuments({
      userEmail,
      status: "INCART",
    });

    return res.status(200).json({ count: itemCount });
  } catch (error) {
    console.error("Error counting cart items:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const myCartItems = async (req, res) => {
  try {
    const { userEmail } = req.params;

    if (!userEmail) {
      return res.status(400).json({ message: "User email is required" });
    }

    const items = await Cart.find({ userEmail, status: "INCART" });

    return res.status(200).json(items);
  } catch (error) {
    console.error("Error fetching cart items:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const myPurchasedItems = async (req, res) => {
  try {
    const { userEmail, role } = req.params;

    if (!userEmail) {
      return res.status(400).json({ message: "User email is required" });
    }

    // Convert the role string into an array, assuming comma-separated
    const roles = role.split(",");

    let query = {
      userEmail,
      status: "PURCHASED",
    };

    // If "OWNER" is one of the roles, fetch all purchased items for the user
    if (!roles.includes("OWNER")) {
      query.name = { $in: roles };
    }

    const items = await Cart.find(query);
    return res.status(200).json(items);
  } catch (error) {
    console.error("Error fetching cart items:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const removeCartItems = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "id is required" });
    }

    const items = await Cart.findByIdAndDelete(id);

    return res.status(200).json({ message: "Deleted" });
  } catch (error) {
    console.error("Error fetching cart items:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const purchaseCartItems = async (req, res) => {
  try {
    const allIds = req.body;
    if (!Array.isArray(allIds)) {
      return res.status(400).json({ message: "Expected an array of IDs" });
    }

    await Cart.updateMany(
      { _id: { $in: allIds } },
      { $set: { status: "PURCHASED" } }
    );

    res.status(200).json({ message: "Cart items purchased successfully" });
  } catch (error) {
    console.error("Error purchasing cart items:", error);
    res.status(500).json({ message: "Server error" });
  }
};
