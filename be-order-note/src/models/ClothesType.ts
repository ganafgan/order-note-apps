import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class ClothesType extends Model {
  public id!: string;
  public userId!: string;
  public name!: string;
  public sizes!: string[]; // Array of strings (S, M, L, etc.)
  public basePrice!: number;
  public sellingPrice!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ClothesType.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sizes: {
      type: DataTypes.JSON, // Stores array as JSON string
      allowNull: false,
      get() {
        const rawValue = this.getDataValue('sizes');
        if (typeof rawValue === 'string') {
          try {
            return JSON.parse(rawValue);
          } catch (e) {
            return [];
          }
        }
        return rawValue || [];
      },
    },
    basePrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    sellingPrice: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'clothes_types',
  }
);

export default ClothesType;
