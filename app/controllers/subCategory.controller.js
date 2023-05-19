const db = require("../models");

const Category = db.categories[0];
const SubCategory = db.categories[1];
const Op = db.Sequelize.Op;

exports.create = (req, res) => {
  const { category } = req.params;
  // Check if not empty
  if (!req.body) {
    res.status(400).send({
      message: "Sub-Category data can not be empty",
    });
    console.log("Sub-Category data can not be empty");
    return;
  }

  if (!req.body.name) {
    res.status(400).send({
      message: "Sub-Category name can not be empty.",
    });
    console.log("Sub-Category name can not be empty.");
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

  // Check if selected category exists
  Category.findOne({ attributes: ["id"], where: { shortName: category } })
    .then((data) => {
      if (data) {
        let categoryId = data.dataValues.id;

        const subCategoryData = {
          name: req.body.name,
          shortName: name,
          description: description,
          CategoryId: categoryId,
        };

        // Check if data already exists
        SubCategory.findOne({
          where: {
            [Op.or]: [
              { name: subCategoryData.name },
              { shortName: subCategoryData.shortName },
            ],
          },
        }).then((entry) => {
          if (entry) {
            res.status(400).send({
              message: "Sub-Category already exists.",
            });
            console.log("Sub-Category already exists.");
            return;
          } else {
            // Create subcategory data
            SubCategory.create(subCategoryData)
              .then((data) => {
                res.send(data);
              })
              .catch((e) => {
                res.status(500).send({
                  message:
                    e.message ||
                    "Some error occured during creation of the sub-category. Please try again later.",
                });
              });
          }
        });
      } else {
        res.status(400).send({
          message: "Parent Category not found.",
        });
      }
    })
    .catch(() => {
      res.status(400).send({
        message: "Parent Category not found.",
      });
    });
};

exports.find = (req, res) => {
  const { category, subCategory } = req.params;
  if (category === "all" || !category) {
    res.status(500).send({
      message: `Incorrect category. Please select a proper category.`,
    });

    console.log(`Incorrect category. Please select a proper category.`);
  } else if (!subCategory) {
    res.status(500).send({
      message: `Incorrect sub-category. Please select a proper sub-category.`,
    });

    console.log(`Incorrect sub-category. Please select a proper sub-category.`);
  } else {
    Category.findOne({ attributes: ["id"], where: { shortName: category } })
      .then((data) => {
        if (data) {
          let categoryId = data.dataValues.id;
          if (subCategory === "all") {
            SubCategory.findAll({
              where: {
                CategoryId: categoryId,
              },
            })
              .then((data) => {
                res.send(data);
              })
              .catch((err) => {
                res.status(500).send({
                  message:
                    err.message ||
                    "Some error occurred while retrieving Categories.",
                });
              });
          } else {
            SubCategory.findOne({
              where: {
                CategoryId: categoryId,
                shortName: subCategory,
              },
            })
              .then((data) => {
                if (data) {
                  res.send(data);
                } else {
                  res.status(404).send({
                    message: `Cannot find SubCategory ${subCategory}.`,
                  });
                }
              })
              .catch((err) => {
                res.status(500).send({
                  message: `Error retrieving SubCategory ${subCategory}`,
                });
              });
          }
        } else {
          res.status(400).send({
            message: "Parent Category not found.",
          });
        }
      })
      .catch(() => {
        res.status(400).send({
          message: "Parent Category not found.",
        });
      });
  }
};

exports.update = (req, res) => {
  const { category, subCategory } = req.params;
  if (category === "all" || !category) {
    res.status(500).send({
      message: `Incorrect category. Please select a category to update.`,
    });

    console.log(`Incorrect category. Please select a proper category.`);
  } else if (subCategory === "all" || !subCategory) {
    res.status(500).send({
      message: `Incorrect sub-category. Please select a proper sub-category.`,
    });

    console.log(`Incorrect sub-category. Please select a proper sub-category.`);
  } else {
    Category.findOne({ where: { shortName: category } })
      .then((data) => {
        if (data) {
          let categoryId = data.dataValues.id;

          SubCategory.update(req.body, {
            where: { CategoryId: categoryId, shortName: subCategory },
          })
            .then((num) => {
              if (num == 1) {
                res.send({
                  message: `${subCategory} updated successfully.`,
                });
              } else if (num == 0) {
                res.send({
                  message: `${subCategory} not found.`,
                });
              } else {
                res.send({
                  message: `Cannot update "${subCategory}" from "${categoryName}". \n Please try again later.`,
                });
              }
            })
            .catch((err) => {
              res.status(500).send({
                message: `Error updating '${subCategory}. Error: ${err}'`,
              });
            });
        } else {
          res.status(400).send({
            message: `Parent Category ${category} not found.`,
          });
        }
      })
      .catch(() => {
        res.status(400).send({
          message: `Parent Category ${category} not found.`,
        });
      });
  }
};

exports.delete = (req, res) => {
  const { category, subCategory } = req.params;
  if (category === "all" || !category) {
    res.status(500).send({
      message: `Incorrect category. Please select a category to update.`,
    });

    console.log(`Incorrect category. Please select a proper category.`);
  } else {
    Category.findOne({ attributes: ["id"], where: { shortName: category } })
      .then((data) => {
        if (data) {
          let categoryId = data.dataValues.id;
          if (subCategory === "all") {
            SubCategory.destroy({
              where: { CategoryId: categoryId },
              truncate: false,
            })
              .then((nums) => {
                res.send({
                  message: `All ${nums} sub-categories have been deleted successfully!`,
                });
              })
              .catch((err) => {
                res.status(500).send({
                  message:
                    err.message ||
                    "Some error occurred while removing all sub-categories.",
                });
              });
          } else {
            SubCategory.destroy({
              where: { CategoryId: categoryId, shortName: subCategory },
            })
              .then((num) => {
                if (num == 1) {
                  res.send({
                    message: `"${subCategory}" was deleted successfully!`,
                  });
                } else if (num == 0) {
                  res.send({
                    message: `${subCategory} not found.`,
                  });
                } else {
                  res.send({
                    message: `Could not delete "${subCategory}".`,
                  });
                }
              })
              .catch((err) => {
                res.status(500).send({
                  message: `Could not delete "${subCategory}". Error: ${err}`,
                });
              });
          }
        } else {
          res.status(400).send({
            message: "Parent Category not found.",
          });
        }
      })
      .catch(() => {
        res.status(400).send({
          message: "Parent Category not found.",
        });
      });
  }
};
