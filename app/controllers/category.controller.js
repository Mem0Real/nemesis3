const db = require("../models");
const Category = db.categories[0];
const Op = db.Sequelize.Op;

exports.create = (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: "Category can not be empty",
    });
    console.log("Category can not be empty");
    return;
  }

  if (!req.body.name) {
    res.status(400).send({
      message: "Category name can not be empty.",
    });
    console.log("Category name can not be empty.");
    return;
  }

  let name, description;

  if (!req.body.shortName) {
    name = req.body.name;
    name = name.toLowerCase();
    name = name.replace(" ", "-");
  } else name = req.body.shortName;

  if (!req.body.description) {
    description = req.body.name;
  } else description = req.body.description;

  const category = {
    name: req.body.name,
    shortName: name,
    description: description,
  };

  Category.findOne({
    where: {
      [Op.or]: [{ name: category.name }, { shortName: category.shortName }],
    },
  }).then((entry) => {
    if (entry) {
      res.status(400).send({
        message: "Category already exists.",
      });
      console.log("Category already exists.");
      return;
    } else {
      Category.create(category)
        .then((data) => {
          res.send(data);
        })
        .catch((e) => {
          res.status(500).send({
            message:
              e.message ||
              "Some error occured during creation of the category. Please try again later.",
          });
        });
    }
  });
};

exports.find = (req, res) => {
  const { category } = req.params;

  if (category === "all") {
    Category.findAll()
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving Categories.",
        });
      });
  } else {
    Category.findOne({
      where: {
        shortName: category,
      },
    })
      .then((data) => {
        if (data) {
          res.send(data);
        } else {
          res.status(404).send({
            message: `Cannot find Category ${category}.`,
          });
        }
      })
      .catch((err) => {
        res.status(500).send({
          message: `Error retrieving Category ${category}`,
        });
      });
  }
};

exports.update = (req, res) => {
  const { category } = req.params;

  if (category === "all" || !category) {
    res.status(500).send({
      message: `Incorrect category. Please select a category to update.`,
    });
  } else {
    Category.update(req.body, {
      where: { shortName: category },
    })
      .then((num) => {
        if (num == 1) {
          res.send({
            message: `${category} updated successfully.`,
          });
        } else {
          res.send({
            message: `Cannot update \'${category}\'. Maybe \'${category}\' was not found or req.body is empty!`,
          });
        }
      })
      .catch((err) => {
        res.status(500).send({
          message: `Error updating ${category}`,
        });
      });
  }
};

exports.delete = (req, res) => {
  const { category } = req.params;
  if (category === "all") {
    Category.destroy({
      where: {},
      truncate: false,
    })
      .then((nums) => {
        res.send({
          message: `All ${nums} categories have been deleted successfully!`,
        });
      })
      .catch((err) => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while removing all categories.",
        });
      });
  } else {
    Category.destroy({
      where: { shortName: category },
    })
      .then((num) => {
        if (num == 1) {
          res.send({
            message: "Category was deleted successfully!",
          });
        } else {
          res.send({
            message: `Cannot delete Category \'${category}\'. Maybe Category was not found!`,
          });
        }
      })
      .catch((err) => {
        res.status(500).send({
          message: `Could not delete Category with \'${category}\'`,
        });
      });
  }
};
