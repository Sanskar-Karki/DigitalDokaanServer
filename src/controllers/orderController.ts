import { Request, Response } from "express";
import sendResponse from "../services/sendResponse";
import Order from "../database/models/orderModel";
import OrderDetails from "../database/models/orderDetailsModel";
import { PaymentMethod } from "../globals/types";
import Payment from "../database/models/paymentModel";

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
    if (
      !phoneNumber ||
      !shippingAddress ||
      !totalAmount ||
      products.length == 0
    ) {
      sendResponse(
        res,
        400,
        "Please provide all the information before Creating an Order"
      );
      return;
    }

    // for order Model
    const orderData = await Order.create({
      phoneNumber,
      shippingAddress,
      totalAmount,
      userId,
    });

    // for orderDtails Model

    products.forEach(async function (product) {
      await OrderDetails.create({
        quantity: product.productQty,
        productId: product.productId,
        orderId: orderData.id,
      });
    });
    // for payment Model
    if (paymentMethod == PaymentMethod.COD) {
      await Payment.create({
        orderId: orderData.id,
        PaymentMethod,
      });
    } else if (paymentMethod == PaymentMethod.Khalti) {
      // khalti integration logic
    } else {
      // esewa integration logic
    }
    res.status(200).json({
      message: "Order created successfully",
    });
  }
}

export default new OrderController();

/* 
{  
    shippingAddress : "Itahari", 
    phoneNumber : 912323, 
    totalAmount : 1232, 
    products : [{
 productId : 89123123, 
 qty : 2 
},
 {productId : 123123, 
 qty : 1
}]
}
*/
