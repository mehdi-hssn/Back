module.exports = (sequelize, Sequelize) => {
  const Produit = sequelize.define("produit", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    libelle: {
      type: Sequelize.STRING
    },
    prix: {
      type: Sequelize.DOUBLE
    },
    poids: {
      type: Sequelize.DOUBLE
    },
    type_poids: {
      type: Sequelize.STRING
    },
    prix_kg: {
      type: Sequelize.DOUBLE
    },
    producteur_id: {
      type: Sequelize.INTEGER
    },
    categorie_id: {
      type: Sequelize.INTEGER
    },
    img: {
      type: Sequelize.STRING
    },
    description: {
      type: Sequelize.STRING
    },
    tasting: {
      type: Sequelize.JSON
    },
    categorie_produit_id: {
      type: Sequelize.INTEGER
    },
    type_id: {
      type: Sequelize.INTEGER
    },
    maxqty: {
      type: Sequelize.INTEGER
    },
    tva: {
      type: Sequelize.DOUBLE
    },
    poids_brut: {
      type: Sequelize.DOUBLE
    },
    type_conditionnement: {
      type: Sequelize.STRING
    },
    autre_type_conditionnement: {
      type: Sequelize.STRING
    },
    conditionnee_par: {
      type: Sequelize.INTEGER
    },
    actif: {
      type: Sequelize.BOOLEAN
    }
  }, {
    freezeTableName: true,
    tableName: 'produit',
    timestamps: true,
    createdAt: false,
    updatedAt: false
  });

  Produit.associate = (models) => {

    Produit.belongsTo(models.Producteur, {
      foreignKey: "producteur_id",
      as: "producteur",
    });

    // Produit.belongsTo(models.Producteur, {
    //   foreignKey: 'producteur_id',
    //   as: "producteur",
    // });

    Produit.belongsTo(models.Categorie, {
      foreignKey: 'categorie_id',
      as: "categorie",
      //onDelete: 'CASCADE'
    });
    Produit.belongsTo(models.Type, {
      foreignKey: 'type_id',
      as: "type",
      //onDelete: 'CASCADE'
    });
    Produit.hasMany(models.Feature, {
      foreignKey: 'produit_id',
      as: "feature",
    });
  };

  return Produit;
};
