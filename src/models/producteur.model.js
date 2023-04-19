module.exports = (sequelize, Sequelize) => {
  const Producteur = sequelize.define("producteur", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING
    },
    description: {
      type: Sequelize.STRING
    },
    logo: {
      type: Sequelize.STRING
    },
    img: {
      type: Sequelize.STRING
    },
    region_img: {
      type: Sequelize.STRING
    },
    user_id: {
      type: Sequelize.INTEGER
    },
    ville_id: {
      type: Sequelize.INTEGER
    },
    departement_id: {
      type: Sequelize.INTEGER
    },
    region_id: {
      type: Sequelize.INTEGER
    },
    commune_id: {
      type: Sequelize.INTEGER
    },
    bg: {
      type: Sequelize.STRING
    },
    block_bg: {
      type: Sequelize.STRING
    },
    actif: {
      type: Sequelize.BOOLEAN
    },
    week: {
      type: Sequelize.BOOLEAN
    },
    receipt_of_purchase_orders: {
      type: Sequelize.JSON
    },
    franco_port: {
      type: Sequelize.INTEGER
    },
    franco_port_file:{
      type: Sequelize.STRING
    },
    minimum_commande:{
      type: Sequelize.INTEGER
    },
    unite:{
      type: Sequelize.STRING
    },
    cout_transport_kg:{
      type: Sequelize.DOUBLE
    },
    national_prix:{
      type: Sequelize.DOUBLE
    },
    national_unite:{
      type: Sequelize.STRING
    },
    bio: {
      type: Sequelize.BOOLEAN
    },
    fonction: {
      type: Sequelize.JSON
    },
    epicier_id:{
      type:Sequelize.INTEGER
    }

  }, {
    freezeTableName: true,
    tableName: 'producteur',
    timestamps: true,
    createdAt: false,
    updatedAt: false
  });

  Producteur.associate = (models) => {

    Producteur.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: "user",
      //onDelete: 'CASCADE'
    });

    Producteur.belongsTo(models.Ville, {
      foreignKey: 'ville_id',
      as: "ville",
      //onDelete: 'CASCADE'
    });

    Producteur.belongsTo(models.Departement, {
      foreignKey: 'departement_id',
      as: "departement",
      //onDelete: 'CASCADE'
    });

    Producteur.belongsTo(models.Region, {
      foreignKey: 'region_id',
      as: "region",
      //onDelete: 'CASCADE'
    });

    Producteur.belongsTo(models.Commune, {
      foreignKey: 'commune_id',
      as: "commune",
      //onDelete: 'CASCADE'
    });

    // Producteur.hasMany(models.Produit, {
    //   foreignKey: 'producteur_id',
    //   as: "producteur",
    // });

    Producteur.hasMany(models.Produit, { as: "producteur" });

    

  };

  return Producteur;
};
