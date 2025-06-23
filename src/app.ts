// ...empty file, will be implemented later...
// src/app.ts
import express from "express";
import path from "path";
import bodyParser from "body-parser";
import authRoutes from "./routes/authRoutes";

const app = express();

// Configurar body-parser para manejar los datos del formulario
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Servir archivos estáticos (tu formulario HTML)
app.use(express.static(path.join(__dirname, "public")));

// Rutas de la API
app.use("/api/register", authRoutes); // Tus rutas de registro

// Redirigir la raíz a tu formulario
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});


export default app;