# VitaLink Frontend

Frontend Angular para el backend de VitaLink incluido en Backend-develop.zip.

## Funcionalidades de esta rama

- Registro publico de medicos independientes o afiliados a una clinica.
- Registro de familiares con su paciente, seleccion del medico responsable, consentimiento y cuatro mediciones iniciales simuladas.
- Inicio y cierre de sesion con el backend. El frontend adjunta el token a las solicitudes protegidas y vuelve al inicio al expirar la sesion.
- Panel y perfil para medico, familiar y paciente, con datos vinculados a la cuenta autenticada.
- Actualizacion de alertas con nota y version esperada. El frontend recarga los datos ante un conflicto y el backend registra la intervencion.

## Desarrollo local

Requisitos del frontend: Node.js 22.22.3 o posterior dentro de la rama 22, Node.js 24.15.0 o posterior dentro de la rama 24, o Node.js 26 o posterior. Para ejecutar el backend mediante Compose se requiere Docker.

1. Extrae Backend-develop.zip en una carpeta separada. En la carpeta que contiene compose.yaml, ejecuta:

   ```powershell
   docker compose up --build
   ```

2. En la carpeta del frontend, ejecuta:

   ```powershell
   npm ci
   npm start
   ```

3. Abre http://localhost:4200. El frontend usa http://localhost:8080/api/v1. El origen permitido por defecto en el backend es http://localhost:4200.

El backend en modo desarrollo incluye las cuentas de demostracion ana@vitalink.demo (medico) y maria@vitalink.demo (familiar). Ambas usan la clave Demo12345. Para entrar como paciente se necesita una cuenta de paciente ya creada en el backend.

## Verificacion y produccion

Ejecuta npm run test:ci para las pruebas de frontend y npm run build para generar la compilacion de produccion. La URL del backend de Render se configura en src/environments/environment.production.ts. El desarrollo local conserva localhost:8080. Consulta DEPLOYMENT.md para publicar el frontend y autorizar su origen en el backend.
