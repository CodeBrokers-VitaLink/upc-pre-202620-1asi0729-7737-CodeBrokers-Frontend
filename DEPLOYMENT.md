# Publicar el frontend en Render

La compilacion de produccion usa el backend HTTPS configurado en
`src/environments/environment.production.ts`. No se necesita un proxy de API.
Las variables de entorno de Render no sustituyen automaticamente los valores
TypeScript de Angular. No incluyas contrasenas de TiDB en el frontend.

## Configuracion manual

1. Publica estos cambios en GitHub.
2. En Render selecciona **New > Static Site** (no Web Service).
3. Conecta el repositorio del frontend y selecciona la rama que contiene los cambios.
4. Configura:

   | Campo | Valor |
   | --- | --- |
   | Name | vitalink-frontend |
   | Build Command | npm ci && npm run build |
   | Publish Directory | dist/vitalink-frontend/browser |
   | Environment: NODE_VERSION | 24.21.0 |

5. Crea el sitio. En Settings > Redirects/Rewrites agrega:
   Source `/*`, Destination `/index.html`, Action **Rewrite**.
   Esto permite recargar rutas como `/register` sin recibir 404.
6. Copia la URL HTTPS publica que Render asigne al frontend.
7. En el servicio del **backend**, cambia `FRONTEND_ORIGIN` por esa URL exacta,
   sin barra final ni rutas, y aplica el cambio con un nuevo despliegue.
   El backend actual permite un solo origen; al reemplazar localhost, el frontend
   local deja de estar autorizado para consultar este backend remoto.
8. Si las tablas ya fueron creadas, usa `DATABASE_DDL_AUTO=validate` en el backend.

Tambien puedes crear un Blueprint usando `render.yaml`; incluye la compilacion,
version de Node y regla Rewrite. No dupliques el sitio si ya lo creaste manualmente.

## Verificacion

- Abre la pagina principal y `/register` directamente; recarga ambas rutas.
- En las herramientas del navegador, Network debe mostrar consultas a la API de
  Render, nunca a localhost ni a `/api/v1` del sitio estatico.
- El catalogo `/clinics` debe responder 200; puede estar vacio en una base nueva.
- Con una base vacia puedes registrar primero un medico independiente.
  El registro familiar requiere un medico disponible y los campos del formulario.
- Prueba registro, inicio de sesion, una ruta protegida y cierre de sesion.
  Las cuentas nuevas se guardan en TiDB y pueden entrar en conflicto con una
  importacion posterior de datos locales: revisar IDs y correos antes de importar.
- Una instancia gratuita del backend puede tardar en despertar tras inactividad.

La base de datos y sus credenciales permanecen en el backend. El navegador solo
recibe la URL publica de la API y el token de la sesion autenticada.

Referencias:
https://render.com/docs/static-sites
https://render.com/docs/redirects-rewrites
