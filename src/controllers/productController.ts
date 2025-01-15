import { Request, Response } from "express";
import Product from "../database/models/productModel";
import Category from "../database/models/categoryModel";

class ProductConroller {
  async createProduct(req: Request, res: Response): Promise<void> {
    const {
      productName,
      productDescription,
      productPrice,
      productTotalStock,
      discount,
      categoryId,
    } = req.body;
    console.log(req.file);
    const filename = req.file
      ? req.file.filename
      : "https://ragnorhydraulics.com/wp-content/uploads/2024/07/Default-Product-Images.png";
    if (
      !productName ||
      !productDescription ||
      !productPrice ||
      !productTotalStock ||
      !categoryId
    ) {
      res.status(400).json({
        message: "Please provide all the information",
      });
      return;
    }
    await Product.create({
      productName,
      productDescription,
      productPrice,
      productTotalStock,
      discount: discount || 0,
      categoryId,
      productImageUrl: filename,
    });
    res.status(200).json({
      message: "Product created Successfully",
    });
  }
  async getAllProduct(req: Request, res: Response): Promise<void> {
    // category id thorugh name dekhauna parxa so id lai join garauna parxa
    const datas = await Product.findAll({
      // join garna lai
      include: [
        {
          model: Category,
          attributes: ["id", "categoryName"],
        },
      ],
    });
    res.status(200).json({
      message: "Products fetched successfylly",
      data: datas,
    });
  }
  async getSingleProduct(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const datas = await Product.findAll({
      where: {
        id,
      },
      include: [
        {
          model: Category,
          attributes: ["id", "categoryName"],
        },
      ],
    });
    res.status(200).json({
      message: "Products fetched successfylly",
      data: datas,
    });
  }
  async deleteProduct(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const datas = await Product.findAll({
      where: {
        id,
      },
    });
    if (datas.length === 0) {
      res.status(404).json({
        message: "No product with that id",
      });
      return;
    }
    await Product.destroy({
      where: {
        id,
      },
    });
    res.status(200).json({
      message: "Product deleted successfylly",
    });
  }
}

export default new ProductConroller();
