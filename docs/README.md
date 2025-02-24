# Documentación de la API

## Autenticación

El proceso de autenticación tiene tres pasos:

1. **Registro (Sign Up)**
   ```http
   POST /api/auth/signup
   {
     "email": "user@example.com",
     "password": "123456"
   }
   ```
   Devuelve un `customToken`

2. **Obtener ID Token**
   ```http
   POST https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken
   {
     "token": "custom-token-from-signup",
     "returnSecureToken": true
   }
   ```
   Devuelve un `idToken`

3. **Verificar Token**
   ```http
   POST /api/auth/verify
   Authorization: Bearer id-token-from-step-2
   ```

### Variables de Entorno en Postman

- `baseUrl`: URL base de la API (default: http://localhost:3000)
- `firebaseApiKey`: API Key de Firebase (web)
- `customToken`: Token recibido del signup
- `idToken`: Token recibido al intercambiar el customToken

### Flujo de Autenticación

1. Registrar usuario con email/password
2. Recibir customToken
3. Intercambiar customToken por idToken
4. Usar idToken en todas las peticiones subsiguientes

### Headers Requeridos
Todas las rutas (excepto signup) requieren:
```
Authorization: Bearer <id-token>
```

### Endpoints Disponibles

#### Auth
- POST /api/auth/auth - Maneja autenticación (requiere token de Firebase)

#### Tasks
- POST /api/tasks - Crear nueva tarea
- GET /api/tasks - Obtener todas las tareas

#### AI Features
- POST /api/voice-to-task - Convertir audio a tareas

## Colección de Postman

La colección de Postman incluye todos los endpoints disponibles en la API. Para usarla:

1. Importa el archivo `postman_collection.json` en Postman
2. Configura las variables de entorno:
   - `baseUrl`: URL base de la API (por defecto: http://localhost:3000)
   - `authToken`: Token de autenticación de Firebase

### Actualización

La colección se mantiene actualizada con todos los endpoints disponibles en la API. Si se añaden nuevos endpoints o se modifican los existentes, se actualizará este archivo. 