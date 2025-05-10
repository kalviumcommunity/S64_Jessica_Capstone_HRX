const { createClient } = require('redis');
const dotenv = require('dotenv');

dotenv.config();

// console.log('REDIS_URL being used:', process.env.REDIS_URL);

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis client connected successfully!'));

(async () => {
  await redisClient.connect();
})();

module.exports = redisClient; 