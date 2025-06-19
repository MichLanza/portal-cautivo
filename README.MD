¡Hola! Entiendo lo que quieres hacer: un portal cautivo personalizado con registro de usuarios y almacenamiento en una base de datos, utilizando tu TP-Link Omada AC1750.

Aquí te explico cómo abordar tu proyecto, considerando las capacidades de tu dispositivo y las alternativas para lograr un portal cautivo avanzado:

¿Tu TP-Link Omada AC1750 (EAP245) tiene una API para esto?
El TP-Link Omada AC1750 (modelo EAP245) es un Access Point (AP) gestionado por el controlador Omada (hardware o software). La gestión del portal cautivo se realiza principalmente a través del Controlador Omada, no directamente en el AP individual con una API abierta para la integración que deseas.

El Controlador Omada tiene su propio sistema de portal cautivo con opciones de personalización, pero generalmente están limitadas a lo que el propio controlador ofrece (páginas de bienvenida, vouchers, autenticación RADIUS básica, etc.). No hay una API pública y documentada en el EAP245 o en el controlador Omada que te permita integrar directamente tu propio formulario HTML/JavaScript externo, capturar los datos del formulario, y luego autorizar al usuario para conectarse a la red a través de ese proceso personalizado que describes.

¿Cómo puedes lograr tu portal cautivo personalizado?
Dado lo anterior, tendrás que externalizar la lógica del portal cautivo. La forma más común y robusta de lograr lo que quieres es utilizando un servidor RADIUS junto con tu servidor web para el portal.

Aquí te detallo los componentes y el flujo:

1. Componentes necesarios:

TP-Link Omada AC1750 (EAP245): Actuará como tu Access Point, configurado para reenviar las solicitudes de autenticación al servidor RADIUS.
Controlador Omada: Necesario para gestionar el EAP245 y configurar el portal cautivo para usar autenticación RADIUS externa.
Servidor Web (donde alojarás tu portal): Aquí es donde estará tu página HTML con el formulario de nombre y correo. Puede ser un servidor LAMP (Linux, Apache/Nginx, MySQL, PHP) o similar.
Servidor RADIUS: Este es el componente clave para la autenticación y autorización. Un software popular y robusto es FreeRADIUS.
Base de Datos: Para almacenar los nombres y correos electrónicos de los usuarios registrados (por ejemplo, MySQL/MariaDB, PostgreSQL).
2. Flujo del Portal Cautivo Personalizado:

Conexión inicial: Un usuario se conecta a la red Wi-Fi de tu TP-Link Omada.

Redirección del Portal Cautivo (Omada): El TP-Link Omada, a través de la configuración del Controlador Omada, detecta que el usuario no está autenticado y lo redirige automáticamente a la URL de tu servidor web personalizado (donde está alojado tu formulario).

Visualización del Formulario (Servidor Web): El usuario ve tu página web con el formulario para ingresar su nombre y correo.

Envío del Formulario (Servidor Web/Script): Cuando el usuario envía el formulario:

Tu script en el servidor web (por ejemplo, PHP, Python con Flask/Django, Node.js con Express) recibe los datos (nombre, correo).
Importante: Este script también necesitará obtener la dirección MAC del dispositivo del usuario. A veces, los portales cautivos pasan esta información como un parámetro de URL, o puedes intentar obtenerla del encabezado X-Forwarded-For o de otras formas, aunque obtener la MAC de forma confiable desde un navegador puede ser complejo si no la proporciona el AP. La forma más robusta es que el RADIUS se la dé al servidor web.
Almacenamiento en DB: El script guarda el nombre y el correo en tu base de datos.
Comunicación con RADIUS: Aquí viene la parte clave. Tu script en el servidor web debe generar una solicitud de autenticación RADIUS (Access-Request) al servidor FreeRADIUS. Para hacer esto, típicamente se envía el "usuario" (por ejemplo, puedes usar el correo electrónico como nombre de usuario, o generar un ID único) y una "contraseña" (puede ser una contraseña fija predefinida para tu portal cautivo).
Redirección para autenticación RADIUS: Después de que los datos se almacenan y la solicitud RADIUS se procesa o se prepara, el script en tu servidor web redirecciona al usuario de vuelta a una URL específica proporcionada por el controlador Omada que es la URL de autenticación del portal cautivo. Esta URL suele incluir parámetros como la MAC del cliente, la IP original, etc.
Autenticación RADIUS (Controlador Omada <-> FreeRADIUS):

El Controlador Omada recibe al usuario que ha sido redirigido de tu portal.
El Controlador Omada, configurado para usar un servidor RADIUS externo, envía la solicitud de autenticación (Access-Request) al FreeRADIUS.
FreeRADIUS:
FreeRADIUS recibe la solicitud del Controlador Omada.
FreeRADIUS puede configurarse para hacer una consulta a tu base de datos para verificar si el usuario (por ejemplo, la MAC del dispositivo o el nombre de usuario/correo que le pasaste) ya se ha registrado o tiene permiso.
Si la verificación es exitosa, FreeRADIUS envía un Access-Accept de vuelta al Controlador Omada. Si falla, envía un Access-Reject.
Acceso a la Red: Si el Controlador Omada recibe un Access-Accept, permite al usuario acceder a la red. Si recibe un Access-Reject, mantiene al usuario en el portal cautivo o lo redirige a una página de error.

3. Pasos para la implementación:

Configurar tu Servidor Web:

Instala Apache/Nginx, PHP/Python/Node.js y MySQL/MariaDB.
Crea tu base de datos y la tabla para almacenar los registros de usuarios.
Diseña tu página HTML con el formulario.
Crea el script backend que maneje el envío del formulario, almacene los datos en la DB y luego inicie la autenticación RADIUS.
Instalar y Configurar FreeRADIUS:

Instala FreeRADIUS en tu servidor (puede ser el mismo servidor web o uno diferente).
Configura clients.conf para permitir que el Controlador Omada se conecte a FreeRADIUS (especifica la IP del Controlador Omada y una clave compartida secreta).
Configura default o un sitio virtual para manejar las solicitudes de autenticación.
Configura el módulo sql para que FreeRADIUS pueda consultar tu base de datos (para verificar si un usuario ya se registró y puede autenticarse).
¡Muy Importante! La parte más avanzada aquí es cómo FreeRADIUS sabrá que un usuario que llega desde el Omada ya pasó por tu formulario. Puedes usar la dirección MAC del cliente como identificador principal o generar un usuario temporal en tu base de datos cuando se registra en el formulario.
Configurar el Controlador Omada:

Ve a la configuración del Portal Cautivo.
Selecciona "External RADIUS Server" como método de autenticación.
Ingresa la IP de tu servidor FreeRADIUS y la clave compartida secreta.
Configura la URL de Redirección: Aquí es donde pones la URL de tu portal cautivo personalizado (http://tu_servidor_web/tu_portal.html).
Asegúrate de configurar los "walled gardens" (jardines vallados) para que los usuarios puedan acceder a tu servidor web y FreeRADIUS antes de autenticarse. Esto significa que la IP de tu servidor web y la IP de tu servidor FreeRADIUS deben estar permitidas sin autenticación inicial.
Desafíos y Consideraciones:
Complejidad: Este es un proyecto de nivel intermedio a avanzado. Requiere conocimientos de redes, administración de servidores (Linux), desarrollo web (HTML, CSS, JavaScript, un lenguaje de backend como PHP/Python/Node.js) y configuración de FreeRADIUS.
Dirección MAC: Obtener la dirección MAC del cliente de forma confiable en un entorno de portal cautivo puede ser un desafío. El AP (Omada) es quien mejor conoce esta información.
Seguridad: Asegura tu servidor web y tu servidor FreeRADIUS. Usa HTTPS para tu portal cautivo si es posible (requiere un certificado SSL).
Mantenimiento: Necesitarás mantener los servidores actualizados y monitorear su rendimiento.
Alternativas comerciales: Si esto es demasiado complejo, existen soluciones de portal cautivo comerciales (cloud-based) que ofrecen mayor flexibilidad y menos configuración, pero tienen un costo.
Si tienes conocimientos en las áreas mencionadas, este proyecto es totalmente factible. ¡Mucha suerte!

```
portal-cautivo-backend/
├── src/
│   ├── app.ts
│   ├── config/
│   │   └── database.ts
│   ├── controllers/
│   │   └── authController.ts
│   ├── entities/
│   │   └── User.ts
│   ├── public/
│   │   └── index.html  <-- Tu formulario HTML
│   ├── routes/
│   │   └── authRoutes.ts
│   └── server.ts
├── package.json
├── tsconfig.json
└── .env
```

```
mkdir portal-cautivo-backend
cd portal-cautivo-backend
npm init -y

npm install express typeorm mysql2 dotenv body-parser
npm install --save-dev typescript @types/node @types/express @types/body-parser ts-node-dev
```