import { ForeignKey, Sequelize } from "sequelize-typescript";
import { envConfig } from "../config/config";
import Product from "./models/productModel";
import Category from "./models/categoryModel";
import User from "./models/userModel";
import Order from "./models/orderModel";
import Payment from "./models/paymentModel";
import OrderDetails from "./models/orderDetailsModel";
import Cart from "./models/cartModel";

const sequelize = new Sequelize(envConfig.connectionString as string, {
  models: [__dirname + "/models"],
});

try {
  sequelize
    .authenticate()
    .then(() => {
      console.log("Connected !!! 😀");
    })
    .catch((err) => {
      console.log("ERROR 😝 : ", err);
    });
} catch (error) {
  console.log(error);
}

// realtionships
// product table ma category id
Product.belongsTo(Category, { foreignKey: "categoryId" });
Category.hasOne(Product, { foreignKey: "categoryId" });

// User X Orders
// order table ma userid ,foreignKey chiyo
Order.belongsTo(User, { foreignKey: "userId" });
User.hasMany(Order, { foreignKey: "userId" });

// Payment X Order
// payment table ma orderId foreignkey chiyo
Payment.belongsTo(Order, { foreignKey: "orderId" });
Order.hasOne(Payment, { foreignKey: "orderId" });

// Order X OrderDetails
// OrderDetails ma orderId foreign key chiyo
OrderDetails.belongsTo(Order, { foreignKey: "orderId" });
Order.hasOne(OrderDetails, { foreignKey: "orderId" });

// Product X OrderDetails
// OrderDetails ma productId foreign key chiyo
OrderDetails.belongsTo(Product, { foreignKey: "productId" });
Product.hasOne(OrderDetails, { foreignKey: "productId" });

// Cart X userId
// cart ma userId foreign key
Cart.belongsTo(User, { foreignKey: "userId" });
User.hasOne(Cart, { foreignKey: "userId" });

// Cart X productId
// cart ma productId foreign key
Cart.belongsTo(Product, { foreignKey: "productId" });
Product.hasOne(Cart, { foreignKey: "productId" });

// database synchronization
sequelize.sync({ force: false, alter: false }).then(() => {
  console.log("synced !!");
});

export default sequelize;
