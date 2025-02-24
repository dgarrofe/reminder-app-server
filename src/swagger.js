const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Reminder App API',
    description: 'API para la aplicación de recordatorios'
  },
  host: 'localhost:3000',
  schemes: ['http'],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'Authorization',
      description: 'Bearer token de autenticación'
    }
  }
};

const outputFile = './swagger.json';
const endpointsFiles = [
  './routes/auth.routes.js',
  './routes/tasks.routes.js',
  './routes/ai.routes.js'
];

swaggerAutogen(outputFile, endpointsFiles, doc); 