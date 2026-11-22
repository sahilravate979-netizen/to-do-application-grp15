require('dotenv').config();

const { generateToken } = require('./utils/tokenUtils');

const token = generateToken(1);

console.log('Generated JWT Token:', token);