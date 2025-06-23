// src/controllers/authController.ts
import { AppDataSource } from "../config/database";
import { Lead } from "../entities/Lead";
import { Request, Response } from "express";
import { OmadaHotspotApi } from "../services/OmadaHotspotService";
import dotenv from "dotenv";

dotenv.config();

export const registerUser = async (req: Request, res: Response) => {

  const { name, email, mac, ip, apmac, target, ssidName,site,radioId } = req.body;

  if (!name || !email) {
    return res.status(400).send("Nombre y correo electrónico son requeridos.");
  }

   const leadRepository = AppDataSource.getRepository(Lead);

  try {

    // if (user) {
    //     console.log(`Usuario ${email} ya registrado. Re-autenticando.`);
    //     // Podrías actualizar la fecha de registro o simplemente proceder a la autenticación
    // } else {
    //     // Crear y guardar nuevo usuario
       const lead = new Lead();
        lead.name = name;
        lead.email = email;
        await leadRepository.save(lead);
    // }
    console.log(`Usuario ${email} registrado exitosamente.`);

    const omadaApi = new OmadaHotspotApi(
      process.env.OMADA_BASE_URL || "",
      process.env.OMADA_CONTROLLER_ID || ""
    );

    const omadaToken = await omadaApi.loginHotspot(
      process.env.OMADA_USER || "",
      process.env.OMADA_PASSWORD || ""
    );  

    if (!omadaToken) {
      return res
        .status(500)
        .send("No se pudo autenticar con el hotspot Omada.");
    }

    const autorizado = await omadaApi.authorizeClient(
      omadaToken.token,
      mac,
      apmac,
      ssidName,
      radioId,
      target,      
      3600000000,
      omadaToken.cookie
    );

    const successRedirectUrl = `https://www.simple.com.ve/`;

    if (autorizado) {
      res.redirect(successRedirectUrl);
    } else {
      res.status(500).send("<h1>Error</h1>");
    }
   
  } catch (error: any) {
    // if (error.code === "ER_DUP_ENTRY") {
    //   return res.status(409).send("El correo electrónico ya está registrado.");
    // }
    console.error("Error al registrar usuario:", error);
    res.status(500).send("Error interno del servidor al registrar el usuario.");
  }
};
