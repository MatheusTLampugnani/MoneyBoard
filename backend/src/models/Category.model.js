import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Category = sequelize.define(
  'Category',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING, // Ex: '#FF5733'
      allowNull: true,
    },
    icon: {
      type: DataTypes.STRING, // Ex: 'fa-solid fa-car' (para usar com FontAwesome)
      allowNull: true,
    },
    // A chave estrangeira 'userId' será adicionada automaticamente pela associação
  },
  {
    tableName: 'categories',
    timestamps: false, // Geralmente não precisamos de timestamps para categorias
  }
);

export default Category;