import { INTEGER } from "sequelize";

import sequelize from "../util/db.js";

export const Cart = sequelize.define('cart', {
    id: {
        type: INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    }
});