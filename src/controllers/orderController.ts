import { Request, Response } from "express";
import sendResponse from "../services/sendResponse";
import Order from "../database/models/orderModel";
import OrderDetails from "../database/models/orderDetailsModel";
import { PaymentMethod } from "../globals/types";
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
    let paymentData = await Payment.create({
      orderId: orderData.id,
      PaymentMethod,
    });
    if (paymentMethod == PaymentMethod.Khalti) {
      // khalti integration logic
      const data = {
        return_url: "https://localhost:5173/",
        website_url: "https://localhost:5173/",
        amount: totalAmount * 100, // paisa ma dinu parxa 100 paisa = 1 rupya
        purchase_order_id: orderData.id,
        purchase_order_name: "order_" + orderData.id,
      };
      const response = await axios.post(
        "https://dev.khalti.com/api/v2/epayment/initiate/",
        data,
        {
          headers: {
            Authorization: "Key 02ada457127d4b7f9a869bf107094c9d",
          },
        }
      );
      // gives pidx transaction id in data object
      const khaltiResponse = response.data;
      paymentData.pidx = khaltiResponse.pidx;
      paymentData.save();
      console.log(khaltiResponse);
      res.status(200).json({
        message: "Order created successfully",
        url: khaltiResponse.payment_url,
      });
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
