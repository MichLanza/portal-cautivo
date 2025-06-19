// src/controllers/authController.ts
import { AppDataSource } from "../config/database";
import { User } from "../entities/User";
import { Request, Response } from "express";

export const registerUser = async (req: Request, res: Response) => {
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).send("Nombre y correo electrónico son requeridos.");
    }

    const userRepository = AppDataSource.getRepository(User);

    try {
        // Verificar si el usuario ya existe
        let user = await userRepository.findOne({ where: { email } });

        if (user) {
            console.log(`Usuario ${email} ya registrado. Re-autenticando.`);
            // Podrías actualizar la fecha de registro o simplemente proceder a la autenticación
        } else {
            // Crear y guardar nuevo usuario
            user = new User();
            user.name = name;
            user.email = email;
            await userRepository.save(user);
            console.log(`Usuario ${email} registrado exitosamente.`);
        }

        // --- Parte crucial para el portal cautivo ---
        // Después de registrar (o verificar) al usuario, debes redirigirlo
        // a la URL de autenticación del Controlador Omada.
        // El Controlador Omada espera una redirección para iniciar el proceso RADIUS.

        // Esta URL es genérica y debe ser reemplazada por la URL real
        // que tu Controlador Omada espera para "aprobar" al cliente.
        // Usualmente, el Omada AP/Controller pasará la MAC del cliente o alguna cookie/token
        // a tu página de portal cautivo para que puedas devolverla.
        // Para este ejemplo, haremos una redirección simple.

        // Simula la URL de redirección que el controlador Omada esperaría
        // NOTA: Esta URL es un EJEMPLO y debe ser la URL real de tu controlador Omada
        // o la URL que el controlador Omada te proporcionó para autenticar.
        // A menudo incluye la MAC del cliente, la IP original, etc.
        // Por ejemplo:
        // const omadaAuthUrl = `http://<IP_CONTROLADOR_OMADA>/portal/auth?mac=${req.query.mac}&ip=${req.query.ip}&param_a=${req.query.param_a}`;
        // Si el Omada no te pasa la MAC, tendrías que autenticar con RADIUS usando un nombre de usuario/contraseña genérico
        // que FreeRADIUS verificaría.

        // Para este ejemplo, simplemente haremos una redirección a una página de éxito
        // y tú deberás ajustar esto para la integración con Omada/RADIUS.
        const successRedirectUrl = `http://omada_controller_ip_or_hostname/portal/auth_success`; // ¡AJUSTAR ESTO!
        // O si quieres que tu propio servidor inicie el RADIUS directamente (más complejo):
        // await triggerRadiusAuth(email); // Una función que tú crearías para enviar una solicitud RADIUS.

        // La redirección final que el usuario verá para ser autenticado por el Omada
        // En un escenario real, esta URL la genera el controlador Omada
        // y tu portal cautivo debería usarla para indicar al Omada que el usuario está listo para autenticarse.
        // Por ejemplo: res.redirect(`http://<IP_OMADA_CONTROLLER>/portal/auth?mac=${macDelCliente}`);
        // Debido a la dificultad de obtener la MAC del cliente directamente desde el navegador,
        // la mejor práctica es que el Controlador Omada te pase parámetros a tu página
        // y tú los uses para redirigir de vuelta.
        // Para simplificar, asumiremos que, al llegar aquí, el usuario debe ser autenticado.

        // Redirección simple a una página de "éxito" para fines de demostración.
        // ¡DEBES REEMPLAZAR ESTO CON LA LÓGICA DE REDIRECCIÓN A LA URL DE AUTENTICACIÓN DEL CONTROLADOR OMADA!
        res.send(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Registro Exitoso</title>
                <style>
                    body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f4f4f4; text-align: center; }
                    .container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    h2 { color: #28a745; }
                    p { margin-top: 20px; }
                    .redirect-button {
                        background-color: #007bff;
                        color: white;
                        padding: 10px 15px;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 16px;
                        text-decoration: none;
                        display: inline-block;
                        margin-top: 20px;
                    }
                    .redirect-button:hover {
                        background-color: #0056b3;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>¡Gracias por registrarte!</h2>
                    <p>Ahora serás redirigido para completar la conexión.</p>
                    <a href="${successRedirectUrl}" class="redirect-button">Continuar</a>
                    <script>
                        // Redirecciona automáticamente después de unos segundos
                        setTimeout(function() {
                            window.location.href = "${successRedirectUrl}";
                        }, 3000); // Redirige después de 3 segundos
                    </script>
                </div>
            </body>
            </html>
        `);

    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).send("El correo electrónico ya está registrado.");
        }
        console.error("Error al registrar usuario:", error);
        res.status(500).send("Error interno del servidor al registrar el usuario.");
    }
};

// ******************************************************************************
// NOTA IMPORTANTE sobre la integración con RADIUS:
// La parte de "generar una solicitud RADIUS (Access-Request)" desde tu servidor web
// es más compleja y generalmente no se hace así directamente.
//
// El flujo más común es:
// 1. Cliente se conecta al Wi-Fi.
// 2. Omada AP redirige al cliente a tu `index.html`.
// 3. Cliente ingresa datos en `index.html` y los envía a `/register`.
// 4. Tu servidor guarda los datos en DB.
// 5. Tu servidor **redirecciona al cliente a una URL del controlador Omada**.
//    Esta URL le indica al Omada: "Cliente listo para autenticación".
//    Ejemplo de URL que Omada podría esperar:
//    `http://<IP_CONTROLADOR_OMADA>:8080/portal/auth?mac=<MAC_DEL_CLIENTE>&ip=<IP_DEL_CLIENTE>&apmac=<MAC_DEL_AP>`
//    Los parámetros como MAC o IP podrían ser pasados a tu `index.html` por el Omada
//    inicialmente como query parameters (e.g., `/?mac=...&ip=...`), y tu `index.html`
//    los capturaría y los enviaría a tu `/register` endpoint (o los guardaría en una cookie).
// 6. El Omada, al recibir esta redirección, inicia una solicitud **RADIUS Access-Request**
//    al FreeRADIUS. En esta solicitud, el Omada puede enviar el email del usuario (o un ID generado)
//    como `User-Name` y una contraseña predefinida.
// 7. FreeRADIUS consulta tu DB para verificar si ese `User-Name` (email) está registrado.
// 8. Si FreeRADIUS valida, envía `Access-Accept` al Omada.
// 9. Omada permite el acceso a la red al cliente.
//
// Mi código de ejemplo en `registerUser` asume que después de guardar en DB,
// redirigirás a una URL del controlador Omada para que él inicie la autenticación RADIUS.
// Debes obtener esa URL específica de la documentación o configuración de tu Omada.
// ******************************************************************************