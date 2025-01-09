/*
sure hunxa jasto lagne category lai pailai seed garera rakhne
additional category ,custom categories halna milne ni banauna paryo
delete,fetch,update
*/

import { Request, Response } from "express";
import Category from "../database/models/categoryModel";

class CategoryController {
  // different json file ma rakhda ni hunxa category data
  categoryData = [
    {
      categoryName: "Electronics",
    },
    {
      categoryName: "Groceries",
    },
    {
      categoryName: "Foods",
    },
  ];
  async seedCategory(): Promise<void> {
    // caregoryData array ko sabai kura create gardinxa eakcati ma
    const datas = await Category.findAll();
    if (datas.length === 0) {
      // category table empty xa vane matra seed garne, i.e first ma matra seed hunxa
      await Category.bulkCreate(this.categoryData);
      console.log("Categories seedded successfully");
    } else {
      console.log("Categories already seedded");
    }
  }
  async addCategory(req: Request, res: Response): Promise<void> {
    // login xa ki xaina check garna paryo ra
    // admin ho ki haina check garne before letting to add Category
    //@ts-ignore
    console.log(req.user);
    const { categoryName } = req.body;
    if (!categoryName) {
      res.status(400).json({
        message: "Please provide categoryName",
      });
      return;
    }
    await Category.create({
      categoryName,
    });
    res.status(200).json({
      message: "Category created successfully",
    });
  }
  async getCategory(req: Request, res: Response): Promise<void> {
    const data = await Category.findAll();
    res.status(200).json({
      message: "fetched categories",
      data,
    });
  }
  async deleteCategory(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({
        message: "Please provide id to delete",
      });
    }
    // category.findall ko sata primary key vako case ma cai direclty ok le find garda vo, returns single record or null
    const data = await Category.findByPk(id);
    if (!data) {
      res.status(404).json({
        message: "No category with that id",
      });
    } else {
      await Category.destroy({
        where: {
          id,
        },
      });
      res.status(200).json({
        message: "Category deleted successfully",
      });
    }
  }
  async updateCategory(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { categoryName } = req.body;
    if (!id || categoryName) {
      res.status(400).json({
        message: "Please provide id and categoryName to update",
      });
      return;
    }
    const data = await Category.findAll({
      where: {
        id,
      },
    });
    if (data.length === 0) {
      res.status(400).json({
        message: "No category with that id",
      });
    } else {
      await Category.update(
        // kun column lai k ley update garne
        {
          categoryName: categoryName,
        },
        // kosko update garne ? req.params ko id ko update garne
        {
          where: { id },
        }
      );
      res.status(200).json({
        message: "Category updated successfuly",
      });
    }
  }
}

// object create na gari instanciate garna paryo vane mathi static rakhne natra new CAtegroyContorller use garne
export default new CategoryController();
