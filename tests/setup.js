require('dotenv').config({ path: '.env.test' });

process.env.MONGODB_URI = 'mongodb://localhost:27017/reminder-app-test';
process.env.NODE_ENV = 'test'; 