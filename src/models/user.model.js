module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("user", {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    first_name: {
      type: Sequelize.STRING
    },
    last_name: {
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING
    },
    password: {
      type: Sequelize.STRING
    },
    token: {
      type: Sequelize.STRING
    },
    confirmation: {
      type: Sequelize.STRING
    },
    roles: {
      type: Sequelize.STRING
    },
    user_img: {
      type: Sequelize.STRING
    },
    phone: {
      type: Sequelize.STRING
    },
    actif: {
      type: Sequelize.BOOLEAN
    },
    region_id: {
      type: Sequelize.INTEGER
    },
    ville_id: {
      type: Sequelize.INTEGER
    },
    departement_id: {
      type: Sequelize.INTEGER
    },
    date_creation: {
      type: Sequelize.DATE
    },
    silence: {
      type: Sequelize.BOOLEAN
    },
    silence_from: {
      type: Sequelize.DATE
    },
    silence_to: {
      type: Sequelize.DATE
    },
    silence_forever: {
      type: Sequelize.BOOLEAN
    },
  }, {
    freezeTableName: true,
    tableName: 'user',
    timestamps: true,
    createdAt: false,
    updatedAt: false
  });

  User.associate = (models) => {

    User.belongsTo(models.Producteur, {
      foreignKey: 'user_id',
      as: "user",
      //onDelete: 'CASCADE'
    });

  };

  return User;
};
