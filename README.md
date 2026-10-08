# VitaLink Frontend

Aplicación Angular 22 con Angular Material, HttpClient y signals. La API se configura exclusivamente en `src/environments`.

## Ejecutar

```sh
npm install
npm start
```

Abrir http://localhost:4200. Para producción: `npm run build`. 

## Arquitectura

- `care/domain/model`: entidades independientes por recurso: `patient.entity.ts`, `alert.entity.ts`, `record.entity.ts` e `intervention.entity.ts`. `contact.entity.ts` conserva el contrato de contactos locales. `record-type.ts` contiene el vocabulario compartido y `care.snapshot.ts` agrupa el resultado de carga, sin definir entidades. Cada consumidor importa directamente del archivo correspondiente.
- `care/infrastructure/<recurso>/<recurso>.assembler.ts`: un assembler por entidad con conversión de DTO a entidad y de entidad a DTO.
- `care/infrastructure/<recurso>/<recurso>.response.ts`: contratos de respuesta independientes, sin alias hacia entidades del dominio. Contactos conserva su contrato preparado para una futura integración; la API actual no ofrece ese endpoint.
- `care/infrastructure/care/care.service.ts`: adaptador HTTP, URL mediante InjectionToken.
- `care/application/care.store.ts`: estado reactivo y coordinación de los casos de uso.
- `care/presentation`: selección de rol, espacio de cuidado y lista reutilizable de alertas. Cada componente tiene su `.ts`, `.html` y `.css`; las plantillas y los estilos propios se enlazan mediante `templateUrl` y `styleUrl`. Los estilos globales conservan únicamente las reglas comunes y el tema.
- `public/i18n/es.json` y `public/i18n/en.json`: los dos archivos únicos de traducciones con claves anidadas `app.*`, cargados por HTTP mediante ngx-translate.
- `shared/presentation/components/language-switcher`: componente reutilizable con archivos TS, HTML y CSS, TranslateService y botones Angular Material. El idioma se persiste y ambos selectores se sincronizan.
- `shared/i18n/localized-date.service.ts`: fechas localizadas en America/Lima; no contiene diccionarios.

Todas las vistas consumen el pipe `translate` de ngx-translate. La configuración del cargador está en `app.config.ts`. Toda la aplicación usa la familia tipográfica predeterminada del tema Angular Material, sin la sustitución anterior por Arial.


## Funcionalidad

Médico: resumen de alertas y pacientes distintos, prioridad visual, filtros por estado y fecha, búsqueda por nombre/ID sin acentos, pacientes asignados, detalle e historial descendente, cambios a en revisión/atendida, autor y observación, historial de intervenciones compartido.

Familia: selección de familiares autorizados, estado simple basado en registros, mediciones, casos abiertos, detalle y confirmación con un botón, historial, solicitud de ayuda sin duplicados, modo de botones grandes, contactos locales y listado de IDs de la red autorizada.

`providerId` y `familyId` en environment seleccionan los perfiles de demostración DR-01 y FC-01. Los pacientes P-999 y otros perfiles quedan fuera de las vistas de esos perfiles. Esto es filtrado de presentación, no autorización de servidor; la API pública no proporciona autenticación.

## API y límites del contrato actual

GET /patients, /alerts, /records, /interventions. PATCH /alerts/:id. POST /interventions, /alerts.

- La API no contiene contactos ni nombres/teléfonos de la red. El formulario guarda datos solo en localStorage, y la red muestra los familyIds reales. Para compartir contactos se necesita un recurso `/contacts` con id, familyId, patientIds, name, phone y email. No se inventan endpoints ni datos clínicos.
- Las alertas existentes no contienen recordId. Se muestra una medición relacionada por tipo y fecha, con una advertencia explícita de que no necesariamente originó la alerta. Las nuevas integraciones deberían entregar recordId para satisfacer la relación exacta.
- La ayuda crea una alerta HIGH/PENDING de tipo help. No envía notificaciones, SMS ni activa servicios de emergencia.
- Antes de cambiar estado se lee nuevamente la alerta. Si otro usuario ya la modificó, se recarga y se informa el conflicto. JSON Server no ofrece transacciones ni control de concurrencia atómico: el chequeo reduce duplicados, pero no garantiza exclusión entre escrituras simultáneas.
- El historial de intervención y el cambio de estado son dos peticiones. Un fallo parcial se informa y se recarga; no se anuncia éxito. Para garantías fuertes se requiere un endpoint transaccional en el backend.
- Render puede tardar en iniciar el servicio. La app muestra carga, errores, vacíos y permite actualizar.

## Validación


## Bounded context IAM

IAM contiene el login, usuarios, roles y sesión; Care contiene pacientes y seguimiento; Shared contiene componentes reutilizables e internacionalización. Cada entidad tiene su archivo, response y assembler. Los stores inyectan servicios directamente; no hay archivos repository ni spec.ts. Login tiene su propia carpeta con login.ts, login.html y login.css.

El login consulta users de la fake API configurada en environments, compara las credenciales de demostración y abre el dashboard según el rol. La sesión local almacena únicamente el ID y el rol. Cerrar sesión elimina esa sesión. roleGuard controla la navegación de la interfaz. No hay pantalla de registro; Solicitar acceso es visual.

El frontend obtiene los datos mediante HTTP desde `environment.apiUrl`. Configura la URL en `src/environments/environment.ts` para desarrollo y en `src/environments/environment.production.ts` para producción. La API debe exponer el recurso `/users` para el login. Credenciales y detalles en api-update/README.md. La autenticación de demostración compara contraseñas ficticias devueltas por la API y no ofrece autenticación segura de backend.
