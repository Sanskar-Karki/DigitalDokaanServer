import { Request, Response } from "express";
import sendResponse from "../services/sendResponse";
import Order from "../database/models/orderModel";
import OrderDetails from "../database/models/orderDetailsModel";
import {
  PaymentMethod,
  PaymentStatus,
  TransactionStatus,
} from "../globals/types";
import Payment from "../database/models/paymentModel";
import axios from "axios";

interface IProduct {
  productId: string;
  productQty: string;
}

interface OrderRequest extends Request {
  user?: {
    id: string;
  };
}

class OrderController {
  async createOrder(req: OrderRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { phoneNumber, shippingAddress, totalAmount, paymentMethod } =
      req.body;
    const products: IProduct[] = req.body.products;

    // Validate request data
    if (
      !phoneNumber ||
      !shippingAddress ||
      !totalAmount ||
      products.length === 0
    ) {
      sendResponse(
        res,
        400,
        "Please provide all the information before creating an order"
      );
      return;
    }

    // Create order
    const orderData = await Order.create({
      phoneNumber,
      shippingAddress,
      totalAmount,
      userId,
    });

    // Create order details for each product
    for (const product of products) {
      await OrderDetails.create({
        quantity: product.productQty,
        productId: product.productId,
        orderId: orderData.id,
      });
    }

    // Create payment entry
    let paymentData = await Payment.create({
      orderId: orderData.id,
      paymentMethod,
    });

    if (paymentMethod === PaymentMethod.Khalti) {
      // Khalti integration logic
      const data = {
        return_url: "https://localhost:5173/",
        website_url: "https://localhost:5173/",
        amount: totalAmount * 100, // Convert to paisa (1 rupee = 100 paisa)
        purchase_order_id: orderData.id,
        purchase_order_name: "order_" + orderData.id,
      };

      const response = await axios.post(
        "https://a.khalti.com/api/v2/epayment/initiate/",
        data,
        {
          headers: {
            Authorization: "Key 02ada457127d4b7f9a869bf107094c9d",
          },
        }
      );

      // Update payment data with Khalti response
      const khaltiResponse = response.data;
      paymentData.pidx = khaltiResponse.pidx;
      await paymentData.save();

      res.status(200).json({
        message: "Order created successfully",
        url: khaltiResponse.payment_url,
        pidx: khaltiResponse.pidx,
      });
      return;
    } else if (paymentMethod === PaymentMethod.Esewa) {
      // Esewa integration logic (to be implemented)
    } else {
      res.status(200).json({
        message: "Order created successfully",
      });
    }
  }

  async verifyTransaction(req: OrderRequest, res: Response): Promise<void> {
    const { pidx } = req.body;

    // Validate pidx
    if (!pidx) {
      res.status(400).json({
        message: "Please provide pidx",
      });
      return;
    }

    const response = await axios.post(
      "https://a.khalti.com/api/v2/epayment/lookup/",
      { pidx },
      {
        headers: {
          Authorization: "Key 02ada457127d4b7f9a869bf107094c9d",
        },
      }
    );

    const data = response.data;
    if (data.status === "Completed") {
      await Payment.update(
        { paymentStatus: PaymentStatus.Paid },
        { where: { pidx } }
      );

      res.status(200).json({
        message: "Payment verified successfully!",
      });
    } else {
      res.status(400).json({
        message: "Payment not verified or cancelled",
      });
    }
  }
}

export default new OrderController();

/* Example Request Body:
{
  shippingAddress: "Itahari",
  phoneNumber: 912323,
  totalAmount: 1232,
  products: [
    {
      productId: 89123123,
      productQty: 2,
    },
    {
      productId: 123123,
      productQty: 1,
    },
  ],
}
*/
