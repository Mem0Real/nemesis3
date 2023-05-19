module.exports = (sequelize, Sequelize) => {
  const Categories = sequelize.define("Categories", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
    },
    shortName: {
      type: Sequelize.STRING,
    },
    description: {
      type: Sequelize.STRING,
    },
  });

  const SubCategories = sequelize.define("SubCategories", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
    },
    shortName: {
      type: Sequelize.STRING,
    },
    description: {
      type: Sequelize.STRING,
    },
  });

  const SubSubCategories = sequelize.define("SubSubCategories", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
    },
    shortName: {
      type: Sequelize.STRING,
    },
    description: {
      type: Sequelize.STRING,
    },
  });

  const Items = sequelize.define("Items", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: Sequelize.STRING,
    },
    shortName: {
      type: Sequelize.STRING,
    },
    type: {
      type: Sequelize.STRING,
    },
    description: {
      type: Sequelize.STRING,
    },
    quantity: {
      type: Sequelize.INTEGER,
    },
    images: {
      type: Sequelize.ARRAY(Sequelize.TEXT),
    },
  });

  Categories.hasMany(SubCategories);
  SubCategories.hasMany(SubSubCategories);
  SubCategories.belongsTo(Categories);
  SubSubCategories.belongsTo(SubCategories);
  SubSubCategories.belongsTo(Categories);
  Items.belongsTo(SubSubCategories);
  Items.belongsTo(SubCategories);
  Items.belongsTo(Categories);

  return [Categories, SubCategories, SubSubCategories, Items];
};
