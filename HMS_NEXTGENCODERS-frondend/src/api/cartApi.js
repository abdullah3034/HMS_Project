import axios from "axios";
import { z } from "zod";

export const packages = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  features: z.array(z.string()),
  image: z.string(),
  price: z.string(),
});



export const addToMyCart = async (packages) => {
  console.log("hi" + packages);
  const res = await axios.post(
    `http://localhost:8000/api/cart/add-to-cart`,
    packages
  );
  return res.data;
};

export const countMyCart = async (email) => {
  console.log("hi " + email);
  const res = await axios.get(
    `http://localhost:8000/api/cart/${email}/cart-count`
  );
  return res.data;
};

export const myCartItems = async (email) => {
  console.log("hi " + email);
  const res = await axios.get(
    `http://localhost:8000/api/cart/${email}/cart-item`
  );
  return res.data;
};

export const removeCartItems = async (id) => {
  console.log("hi " + id);
  const res = await axios.delete(
    `http://localhost:8000/api/cart/${id}/cart-item`
  );
  return res.data;
};

export const purchaseCartItems = async (allIds) => {
  console.log("hi " + allIds);
  const res = await axios.put(
    `http://localhost:8000/api/cart/purchase-item`,
    allIds
  );
  return res.data;
};

export const getPurchasedCartItems = async (email, role) => {
  console.log("hi " + email);
  console.log("hi " + role);
  const res = await axios.get(
    `http://localhost:8000/api/cart/${email}/${role}/purchased-item`
  );
  return res.data;
};
