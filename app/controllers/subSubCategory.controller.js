const db = require("../models");
const Category = db.categories[0];
const SubCategory = db.categories[1];
const SubSubCategory = db.categories[2];
const Op = db.Sequelize.Op;

exports.create = (req, res) => {
  const { category, subCategory } = req.params;

  if (!req.body) {
    res.status(400).send({
      message: "Child Category can not be empty",
    });
    console.log("Child Category can not be empty");
    return;
  }

  if (!req.body.name) {
    res.status(400).send({
      message: "Child name can not be empty.",
    });
    console.log("Child name can not be empty.");
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
          .then((childData) => {
            if (childData) {
              let subCategoryId = childData.dataValues.id;

              const childCategoryData = {
                name: req.body.name,
                shortName: name,
                description: description,
                CategoryId: categoryId,
                SubCategoryId: subCategoryId,
              };

              // Check if data already exists
              SubSubCategory.findOne({
                where: {
                  [Op.or]: [
                    { name: childCategoryData.name },
                    { shortName: childCategoryData.shortName },
                  ],
                },
              })
                .then((entry) => {
                  if (entry) {
                    res.status(400).send({
                      message: "Parent already exists.",
                    });
                    console.log("Parent already exists.");
                    return;
                  } else {
                    SubSubCategory.create(childCategoryData)
                      .then((data) => {
                        res.send(data);
                      })
                      .catch((e) => {
                        res.status(500).send({
                          message:
                            e.message ||
                            `Some error occured during creation of the Child Category ${childCategoryData.shortName}. \n 
                        Please try again later.`,
                        });
                      });
                  }
                })
                .catch((err) => {
                  res.status(500).send({
                    message: `Error fetching parent category list`,
                  });
                });
            } else {
              res.status(400).send({
                message: `Parent Category "${subCategory}" not found.`,
              });
            }
          })
          .catch((err) => {
            res.status(500).send({
              message:
                err.message || `Parent category "${subCategory}" not found.`,
            });
          });
      } else
        res.status(400).send({
          message: `Parent Category "${subCategory}" not found.`,
        });
    })
    .catch((err) => {
      res.status(500).send({
        message: `Main category "${category}" not found.`,
      });
    });
};

exports.find = (req, res) => {
  const { category, subCategory, subSubCategory } = req.params;

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
          .then((childData) => {
            if (childData) {
              let subCategoryId = childData.dataValues.id;

              if (subSubCategory === "all") {
                SubSubCategory.findAll({
                  where: {
                    CategoryId: categoryId,
                    SubCategoryId: subCategoryId,
                  },
                })
                  .then((data) => {
                    res.send(data);
                  })
                  .catch((err) => {
                    res.status(500).send({
                      message:
                        err.message ||
                        "Some error occurred while retrieving Sub-Sub-Category.",
                    });
                  });
              } else {
                SubSubCategory.findOne({
                  where: {
                    shortName: subSubCategory,
                    CategoryId: categoryId,
                    SubCategoryId: subCategoryId,
                  },
                })
                  .then((data) => {
                    if (data) {
                      res.send(data);
                    } else {
                      res.status(404).send({
                        message: `Cannot find child category "${subSubCategory}."`,
                      });
                    }
                  })
                  .catch((err) => {
                    res.status(500).send({
                      message: `Error retrieving child category "${subSubCategory}."`,
                    });
                  });
              }
            } else {
              res.status(400).send({
                message: "Parent Category not found.",
              });
            }
          })
          .catch((err) => {
            res.status(500).send({
              message:
                err.message || `Error retrieving parent "${subCategory}"`,
            });
          });
      } else {
        res.status(400).send({
          message: `Main Category "${category}" not found.`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || `Error retrieving child category "${subSubCategory}".`,
      });
    });
};

exports.update = (req, res) => {
  const { category, subCategory, subSubCategory } = req.params;

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

              SubSubCategory.update(req.body, {
                where: {
                  shortName: subSubCategory,
                  CategoryId: categoryId,
                  SubCategoryId: subCategoryId,
                },
              })
                .then((num) => {
                  if (num == 1) {
                    res.send({
                      message: `Child Category "${subSubCategory}" was updated successfully.`,
                    });
                  } else {
                    res.send({
                      message: `Cannot update Child Category ${subSubCategory}. 
                        Maybe "${subSubCategory}" was not found or req.body is empty!`,
                    });
                  }
                })
                .catch((err) => {
                  res.status(500).send({
                    message: `Error updating child category "${subSubCategory}".`,
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
          message: `Main Category "${category}" not found.`,
        });
      }
    }
  );
};

exports.delete = (req, res) => {
  const { category, subCategory, subSubCategory } = req.params;

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
        }).then((childData) => {
          if (childData) {
            let subCategoryId = childData.dataValues.id;

            if (subSubCategory === "all") {
              SubSubCategory.destroy({
                where: {
                  CategoryId: categoryId,
                  SubCategoryId: subCategoryId,
                },
                truncate: false,
              })
                .then((nums) => {
                  res.send({
                    message: `All ${nums} child categories have been deleted successfully!`,
                  });
                })
                .catch((err) => {
                  res.status(500).send({
                    message:
                      err.message ||
                      "Some error occurred while removing all child categories.",
                  });
                });
            } else {
              SubSubCategory.destroy({
                where: {
                  shortName: subSubCategory,
                  CategoryId: categoryId,
                  SubCategoryId: subCategoryId,
                },
              })
                .then((num) => {
                  if (num == 1) {
                    res.send({
                      message: `Child category "${subSubCategory}" was deleted successfully!`,
                    });
                  } else {
                    res.send({
                      message: `Could not delete ${subSubCategory}. Maybe ${subSubCategory} was not found!`,
                    });
                  }
                })
                .catch((err) => {
                  res.status(500).send({
                    message: `Could not delete child category "${subSubCategory}".`,
                  });
                });
            }
          }
        });
      } else {
        res.status(500).send({
          message: `Couldn't find Main category "${category}".`,
        });
      }
    }
  );
};
