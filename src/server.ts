// src/server.ts
import "reflect-metadata"; // Debe ser lo primero
import app from "./app";
import { AppDataSource } from "./config/database";

const PORT = process.env.PORT || 3000;

AppDataSource.initialize()
    .then(() => {
        console.log("Conexión a la base de datos establecida.");
        app.listen(PORT, () => {
            console.log(`Servidor escuchando en http://localhost:${PORT}`);
        });
    })
    .catch((error) => console.error("Error al conectar a la base de datos:", error));