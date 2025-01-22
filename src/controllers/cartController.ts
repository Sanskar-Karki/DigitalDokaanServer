import { Request, Response } from "express";
import sendResponse from "../services/sendResponse";
import Cart from "../database/models/cartModel";
import Product from "../database/models/productModel";

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

class CartController {
  // Add a product to the cart
  async addToCart(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { productId, quantity } = req.body;

    // Validate request body
    if (!productId || typeof quantity !== "number" || quantity <= 0) {
      sendResponse(res, 400, "Please provide a valid productId and quantity");
      return;
    }

    // Check if the product already exists in the user's cart
    const cartItem = await Cart.findOne({
      where: { productId, userId },
    });

    if (cartItem) {
      // If product exists, increment the quantity
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      // Else, add a new cart item
      await Cart.create({ userId, productId, quantity });
    }

    res.status(200).json({ message: "Product added to Cart" });
  }

  // Retrieve all items in the user's cart
  async getMyCartItems(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;

    const cartItems = await Cart.findAll({
      where: { userId },
      include: [
        {
          model: Product,
          attributes: ["id", "productName", "productPrice", "productImageUrl"],
        },
      ],
    });

    if (!cartItems.length) {
      sendResponse(res, 400, "No items in the cart, it is empty");
      return;
    }

    res.status(200).json({
      message: "Cart items fetched successfully",
      data: cartItems,
    });
  }

  // Delete a specific item from the user's cart
  async deleteMyCartItem(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { productId } = req.params;

    // Check if the product exists
    const productExists = await Product.findByPk(productId);
    if (!productExists) {
      res.status(400).json({ message: "No product found for the provided ID" });
      return;
    }

    // Remove the product from the user's cart
    const deleted = await Cart.destroy({
      where: { productId, userId },
    });

    if (!deleted) {
      res
        .status(400)
        .json({ message: "Failed to delete the product from the cart" });
      return;
    }

    res.status(200).json({ message: "Product deleted from cart successfully" });
  }

  // Update the quantity of an item in the user's cart
  async updateCartItemQuantity(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { productId } = req.params;
    const { quantity } = req.body;

    // Validate the quantity
    if (typeof quantity !== "number" || quantity <= 0) {
      sendResponse(res, 400, "Please provide a valid quantity");
      return;
    }

    // Find the cart item
    const cartItem = await Cart.findOne({
      where: { userId, productId },
    });

    if (!cartItem) {
      sendResponse(res, 404, "No cart item found for the provided product ID");
      return;
    }

    // Update the quantity
    cartItem.quantity = quantity;
    await cartItem.save();

    res.status(200).json({ message: "Cart quantity updated successfully" });
  }
}

export default new CartController();
