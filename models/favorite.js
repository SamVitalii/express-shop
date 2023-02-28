import {INTEGER} from "sequelize";

import sequelize from "../util/db.js";

export const Favorite = sequelize.define('favorite', {
    id: {
        type: INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    }
});