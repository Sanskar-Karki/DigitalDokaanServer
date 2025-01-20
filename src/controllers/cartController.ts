import { Request, response, Response } from "express";
import sendResponse from "../services/sendResponse";
import Cart from "../database/models/cartModel";
import Product from "../database/models/productModel";
interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}
class CartController {
  async addToCart(req: AuthRequest, res: Response) {
    // userId,porductId,quantity
    const userId = req.user?.id;
    const { productId, quantity } = req.body;
    if (!productId || !quantity) {
      sendResponse(res, 400, "Please provide productId , quantity");
      return;
    }
    // check if that product already exist on that user cart

    let cartofUser = await Cart.findOne({
      where: {
        productId,
        userId,
      },
    });
    if (cartofUser) {
      // if product exist qty++
      cartofUser.quantity += quantity;
      await cartofUser?.save();
    } else {
      // else insert item
      await Cart.create({
        userId,
        productId,
        quantity,
      });
    }
    res.status(200).json({
      message: "Product added to Cart",
    });
  }
  async getMyCartItems(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    const cartItems = await Cart.findAll({
      where: {
        userId,
      },
      include: [
        {
          model: Product,
          attributes: ["id", "productName", "productPrice", "productImageUrl"],
        },
      ],
    });
    if (cartItems.length === 0) {
      sendResponse(res, 400, "No items in the cart , its empty");
    } else {
      res.status(200).json({
        message: "Cart items fetch successfully",
        data: cartItems,
      });
    }
  }

  async deleteMyCartItem(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    const { productId } = req.params;
    // check prodcut exist for that id
    const product = await Product.findByPk(productId);
    if (!product) {
      res.status(400).json({
        message: "No product for that id",
      });
      return;
    }
    // delete product for that user id
    await Cart.destroy({
      where: {
        productId,
        userId,
      },
    });
    res.status(200).json({
      message: "Product from cart deleted successfully!!!",
    });
  }

  async updateCartItemQuantity(req: AuthRequest, res: Response) {
    const userId = req.user?.id;
    const { productId } = req.params;
    const { quantity } = req.body;
    if (!quantity) {
      sendResponse(res, 400, "Please provide quantity");
    }
    const cartItem = await Cart.findOne({
      where: {
        userId,
        productId,
      },
    });
    if (!cartItem) {
      sendResponse(res, 404, "No item of that product id");
    } else {
      cartItem.quantity = quantity;
      await cartItem.save();
      res.status(200).json({
        message: "Cart Quantity Updated!!!",
      });
    }
  }
}

export default new CartController();
