const { RateLimitRedis } = require("@jwerre/rate-limit-redis");
const { db_config } = require("./db.config");

const rateLimitRedis = new RateLimitRedis({
    redis: db_config,
    timeframe: 60,
    limit: 120,
    autoConnect: false,
  });



module.exports = rateLimitRedis;