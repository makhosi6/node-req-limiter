const { rateLimitRedis } = require("@jwerre/rate-limit-redis");
const local = require("@two/rate-limit-redis");
// const { middleware } = require('@two/rate-limit-redis');
const express = require("express");
const { db_config } = require("./mod/db.config");
const limiter = require("./mod/limiter");
// const rateLimitRedis = require('./mod/redis-limiter');
const app = express();
const port = process.env.PORT || 9872;

//
// global.rateLimitRedis = rateLimitRedis;
// const www = process.env.WWW || './static';
// use trust proxy if behind load balancer
app.enable("trust proxy");
// console.log(`serving ${www}`);
app.get("/limiter", limiter, (req, res) => {
  res.send(200).json({
    key: "value",
  });
});

rateLimitRedis({
  redis: db_config,
  timeframe: 60,
  limit: 5,
  autoConnect: false,
  customRoutes: [
    {
      path: "/redis-limiter",
      method: "GET",
      timeframe: 60,
      limit: 5,
    },
  ],
});

local.rateLimitRedis({
  redis: db_config,
  timeframe: 60,
  limit: 5,
  autoConnect: false,
  customRoutes: [
    {
      path: "/local",
      method: "GET",
      timeframe: 60,
      limit: 5,
    },
  ],
})

app.get(
  "/local", local.middleware,   (req, res) => {
  if (res.status != 429)
      res.json({
        key: "value",
      });
    else res.send(429);
  })
app.get(
  "/redis-limiter",
  async (req, res, next) => {
    await global.rateLimitRedis
      .process(req)
      .then(function (result = {}) {
        console.log({ ress: result });
        // if (headers) {
        res.set("x-ratelimit-limit", result.limit);
        res.set("x-ratelimit-remaining", result.remaining);
        res.set("retry-after", result.retry);
        // }

        res.status(result.status);
        next();
      })
      .catch(next);
  },
  (req, res) => {
    if (res.status != 429)
      res.json({
        key: "value",
      });
    else res.send(429);
  }
);
app.get("/without", (req, res) => {
  res.send(200).json({
    key: "value",
  });
});
app.get("*", (req, res) => {
  res.send(404).json({
    msg: "Error",
  });
});
// app.get('*',  (req, res) => {
//     res.sendFile(`index.html`, { root: www });
// });
// app.get('*', (req, res) => {
//     res.sendFile(`index.html`, { root: www });
// });
// app.get('*', (req, res) => {
//     res.sendFile(`index.html`, { root: www });
// });
app.listen(port, () => console.log(`listening on http://localhost:${port}`));
