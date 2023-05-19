module.exports = (app) => {
  const category = require("../controllers/category.controller.js");
  const Subcategory = require("../controllers/subCategory.controller.js");
  const SubSubcategory = require("../controllers/subSubCategory.controller.js");
  const Item = require("../controllers/item.controller.js");

  let router = require("express").Router();

  // Categories
  router.post("/", category.create);
  router.post("/:category/", Subcategory.create);
  router.post("/:category/:subCategory/", SubSubcategory.create);
  router.post("/:category/:subCategory/:subSubCategory/", Item.create);

  router.get("/:category", category.find);
  router.get("/:category/:subCategory", Subcategory.find);
  router.get("/:category/:subCategory/:subSubCategory", SubSubcategory.find);
  router.get("/:category/:subCategory/:subSubCategory/:item", Item.find);

  router.put("/:category", category.update);
  router.put("/:category/:subCategory", Subcategory.update);
  router.put("/:category/:subCategory/:subSubCategory", SubSubcategory.update);
  router.put("/:category/:subCategory/:subSubCategory/:item", Item.update);

  router.delete("/:category", category.delete);
  router.delete("/:category/:subCategory", Subcategory.delete);
  router.delete(
    "/:category/:subCategory/:subSubCategory",
    SubSubcategory.delete
  );
  router.delete("/:category/:subCategory/:subSubCategory/:item", Item.delete);

  app.use("/api/categories", router);
};
