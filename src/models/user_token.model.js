module.exports = (sequelize, Sequelize) => {
  const UserToken = sequelize.define("user_token", {
    id: {
      type: Sequelize.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    token: {
      type: Sequelize.STRING
    },
    user_id: {
      type: Sequelize.INTEGER
    },
    date_creation: {
      type: Sequelize.DATE
    },
  }, {
    freezeTableName: true,
    tableName: 'user_token',
    timestamps: true,
    createdAt: false,
    updatedAt: false
  });

  UserToken.associate = (models) => {

    UserToken.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: "user",
      //onDelete: 'CASCADE'
    });

  };

  return UserToken;
};
