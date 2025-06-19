// src/config/database.ts
import "reflect-metadata"; // Necesario para TypeORM
import { DataSource } from "typeorm";
import { User } from "../entities/User";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "mssql",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "3306"),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: true, // ¡En producción, esto debería ser `false` y usar migraciones!
    logging: false,
    entities: [User],
    migrations: [],
    subscribers: [],
    // options: { encrypt: false }
});