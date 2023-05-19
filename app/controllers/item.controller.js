const db = require("../models");
const Category = db.categories[0];
const SubCategory = db.categories[1];
const SubSubCategory = db.categories[2];
const Item = db.categories[3];

const Op = db.Sequelize.Op;

exports.create = (req, res) => {
  const { category, subCategory, subSubCategory } = req.params;

  if (!req.body) {
    res.status(400).send({
      message: "Item can not be empty",
    });
    console.log("Item can not be empty");
    return;
  }

  if (!req.body.name) {
    res.status(400).send({
      message: "Item name can not be empty.",
    });
    console.log("Item name can not be empty.");
    return;
  }

  // Create & format shortname if empty
  let name, description;

  if (!req.body.shortName) {
    name = req.body.name;
    name = name.toLowerCase();
    name = name.replace(" ", "-");
  } else name = req.body.shortName;

  if (!req.body.description) {
    description = req.body.name;
  } else description = req.body.description;

  // Check if selected category & subcategory exist
  Category.findOne({ attributes: ["id"], where: { shortName: category } })
    .then((data) => {
      if (data) {
        let categoryId = data.dataValues.id;

        SubCategory.findOne({
          attributes: ["id"],
          where: { shortName: subCategory, CategoryId: categoryId },
        })
          .then((parentData) => {
            if (parentData) {
              let subCategoryId = parentData.dataValues.id;

              SubSubCategory.findOne({
                attributes: ["id"],
                where: {
                  shortName: subSubCategory,
                  CategoryId: categoryId,
                  SubCategoryId: subCategoryId,
                },
              })
                .then((childData) => {
                  if (childData) {
                    let subSubCategoryId = childData.dataValues.id;
                    let subSubCategoryName = childData.dataValues.shortName;

                    const itemData = {
                      name: req.body.name,
                      shortName: name,
                      type: subSubCategoryName,
                      description: description,
                      quantity: req.body.quantity,
                      images: req.body.images,
                      CategoryId: categoryId,
                      SubCategoryId: subCategoryId,
                      SubSubCategoryId: subSubCategoryId,
                    };

                    // Check if data already exists
                    Item.findOne({
                      where: {
                        [Op.or]: [
                          { name: itemData.name },
                          { shortName: itemData.shortName },
                        ],
                      },
                    })
                      .then((entry) => {
                        if (entry) {
                          res.status(400).send({
                            message: "Item already exists.",
                          });
                          console.log("Item already exists.");
                          return;
                        } else {
                          Item.create(itemData)
                            .then((data) => {
                              res.send(data);
                            })
                            .catch((e) => {
                              res.status(500).send({
                                message:
                                  e.message ||
                                  `Some error occured during creation of the Child Category ${itemData.shortName}. \n 
                              Please try again later.`,
                              });
                            });
                        }
                      })
                      .catch((err) => {
                        res.status(500).send({
                          message:
                            err.message ||
                            `Error fetching parent category list`,
                        });
                      });
                  } else {
                    res.status(500).send({
                      message: `Child category ${subSubCategory}" not found.`,
                    });
                  }
                })
                .catch((err) => {
                  res.status(500).send({
                    message:
                      err.message ||
                      `Child category ${subSubCategory}" not found.`,
                  });
                });
            } else {
              res.status(400).send({
                message: `Parent Category ${subCategory}" not found.`,
              });
            }
          })
          .catch((err) => {
            res.status(500).send({
              message:
                err.message || `Parent category ${subCategory}" not found.`,
            });
          });
      } else
        res.status(400).send({
          message: `Parent Category ${subCategory}" not found.`,
        });
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || `Main category ${category}" not found.`,
      });
    });
};

exports.find = (req, res) => {
  const { category, subCategory, subSubCategory, item } = req.params;

  // Check if selected category & subcategory exist
  Category.findOne({ attributes: ["id"], where: { shortName: category } })
    .then((data) => {
      if (data) {
        let categoryId = data.dataValues.id;

        SubCategory.findOne({
          attributes: ["id"],
          where: {
            shortName: subCategory,
            CategoryId: categoryId,
          },
        })
          .then((parentData) => {
            if (parentData) {
              let subCategoryId = parentData.dataValues.id;

              SubSubCategory.findOne({
                attributes: ["id"],
                where: {
                  shortName: subSubCategory,
                  CategoryId: categoryId,
                  SubCategoryId: subCategoryId,
                },
              }).then((childData) => {
                if (childData) {
                  let subSubCategoryId = childData.dataValues.id;

                  if (item === "all") {
                    Item.findAll({
                      where: {
                        CategoryId: categoryId,
                        SubCategoryId: subCategoryId,
                        SubSubCategoryId: subSubCategoryId,
                      },
                    })
                      .then((data) => {
                        res.send(data);
                      })
                      .catch((err) => {
                        res.status(500).send({
                          message:
                            err.message ||
                            `Some error occurred while retrieving items.`,
                        });
                      });
                  } else {
                    Item.findOne({
                      where: {
                        shortName: item,
                        CategoryId: categoryId,
                        SubCategoryId: subCategoryId,
                        SubSubCategoryId: subSubCategoryId,
                      },
                    })
                      .then((data) => {
                        if (data) {
                          res.send(data);
                        } else {
                          res.status(404).send({
                            message: `Cannot find item ${item}.`,
                          });
                        }
                      })
                      .catch((err) => {
                        res.status(500).send({
                          message:
                            err.message || `Error retrieving item ${item}.`,
                        });
                      });
                  }
                } else {
                  res.status(400).send({
                    message: `Child Category ${subSubCategory} not found.`,
                  });
                }
              });
            } else {
              res.status(400).send({
                message: `Parent Category ${subCategory} not found.`,
              });
            }
          })
          .catch((err) => {
            res.status(500).send({
              message:
                err.message ||
                `Error retrieving parent category ${subCategory}"`,
            });
          });
      } else {
        res.status(400).send({
          message: `Main Category ${category}" not found.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || `Error retrieving parent category ${subCategory}".`,
      });
    });
};

exports.update = (req, res) => {
  const { category, subCategory, subSubCategory, item } = req.params;

  // Check if selected category & subcategory exist
  Category.findOne({ attributes: ["id"], where: { shortName: category } }).then(
    (data) => {
      if (data) {
        let categoryId = data.dataValues.id;

        SubCategory.findOne({
          attributes: ["id"],
          where: {
            shortName: subCategory,
            CategoryId: categoryId,
          },
        })
          .then((childData) => {
            if (childData) {
              let subCategoryId = childData.dataValues.id;

              SubSubCategory.findOne({
                attributes: ["id"],
                where: {
                  shortName: subSubCategory,
                  CategoryId: categoryId,
                  SubCategoryId: subCategoryId,
                },
              })
                .then((childData) => {
                  if (childData) {
                    let subSubCategoryId = childData.dataValues.id;

                    Item.update(req.body, {
                      where: {
                        shortName: item,
                        CategoryId: categoryId,
                        SubCategoryId: subCategoryId,
                        SubSubCategoryId: subSubCategoryId,
                      },
                    })
                      .then((num) => {
                        if (num == 1) {
                          res.send({
                            message: `Item ${item} was updated successfully.`,
                          });
                        } else {
                          res.send({
                            message: `Cannot update Item ${item}. 
                            Maybe ${item} was not found or req.body is empty!`,
                          });
                        }
                      })
                      .catch((err) => {
                        res.status(500).send({
                          message:
                            err.message || `Error updating item ${item}.`,
                        });
                      });
                  }
                })
                .catch((err) => {
                  res.status(500).send({
                    message:
                      err.message ||
                      `Couldn't find child category ${subSubCategory}".`,
                  });
                });
            } else {
              res.status(500).send({
                message: `Parent '${subCategory}' not found.`,
              });
            }
          })
          .catch((err) => {
            res.status(500).send({
              message: err.message || `Error retrieving Parent ${subCategory}`,
            });
          });
      } else {
        res.status(400).send({
          message: `Main Category ${category}" not found.`,
        });
      }
    }
  );
};

exports.delete = (req, res) => {
  const { category, subCategory, subSubCategory, item } = req.params;

  // Check if selected category, subcategory & subsubcategory exist
  Category.findOne({ attributes: ["id"], where: { shortName: category } })
    .then((data) => {
      if (data) {
        let categoryId = data.dataValues.id;

        SubCategory.findOne({
          attributes: ["id"],
          where: {
            shortName: subCategory,
            CategoryId: categoryId,
          },
        })
          .then((childData) => {
            if (childData) {
              let subCategoryId = childData.dataValues.id;

              SubSubCategory.findOne({
                attributes: ["id"],
                where: {
                  shortName: subSubCategory,
                  CategoryId: categoryId,
                  SubCategoryId: subCategoryId,
                },
              })
                .then((childData) => {
                  if (childData) {
                    let subSubCategoryId = childData.dataValues.id;

                    if (item === "all") {
                      Item.destroy({
                        where: {
                          CategoryId: categoryId,
                          SubCategoryId: subCategoryId,
                          SubSubCategoryId: subSubCategoryId,
                        },
                        truncate: false,
                      })
                        .then((nums) => {
                          res.send({
                            message: `All ${nums} items have been deleted successfully!`,
                          });
                        })
                        .catch((err) => {
                          res.status(500).send({
                            message:
                              err.message ||
                              "Some error occurred while removing all items.",
                          });
                        });
                    } else {
                      Item.destroy({
                        where: {
                          shortName: item,
                          CategoryId: categoryId,
                          SubCategoryId: subCategoryId,
                          SubSubCategoryId: subSubCategoryId,
                        },
                      })
                        .then((num) => {
                          if (num == 1) {
                            res.send({
                              message: `Item ${item} was deleted successfully!`,
                            });
                          } else {
                            res.send({
                              message: `Could not delete ${item}. Maybe ${item} was not found!`,
                            });
                          }
                        })
                        .catch((err) => {
                          res.status(500).send({
                            message:
                              err.message || `Could not delete item ${item}.`,
                          });
                        });
                    }
                  } else {
                    res.status(500).send({
                      message: `Error retrieving Child ${subSubCategory}`,
                    });
                  }
                })
                .catch((err) => {
                  res.status(500).send({
                    message:
                      err.message ||
                      `Error retrieving Child Category ${subSubCategory}`,
                  });
                });
            } else {
              res.status(500).send({
                message: `Error retrieving Parent ${subCategory}`,
              });
            }
          })
          .catch((err) => {
            res.status(500).send({
              message: err.message || `Error retrieving Parent ${subCategory}`,
            });
          });
      } else {
        res.status(500).send({
          message: `Couldn't find Main category ${category}".`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || `Error retrieving Main Category ${category}`,
      });
    });
};
