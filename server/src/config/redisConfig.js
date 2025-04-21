const session = require("express-session");
const RedisStore = require("connect-redis")(session); // v6 syntax
const { createClient } = require("redis");
const dotenv = require("dotenv");

dotenv.config();

// Initialize Redis Client
const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
  password: process.env.REDIS_PASSWORD || undefined,
  legacyMode: true,
});

redisClient.on("error", (err) => console.error("Redis Client Error:", err));

redisClient
  .connect()
  .then(() => {
    console.log("Redis Connected");
  })
  .catch(console.error);

// replacer function
function replacer(key, value) {
  if (typeof value === "function") {
    return undefined;
  }
  return value;
}

// Configure Redis Store with a custom serializer
const redisStore = new RedisStore({
  client: redisClient,
  prefix: "session:",
  disableTouch: false,
  serializer: {
    stringify: (data) => {
      try {
        const str = JSON.stringify(data, replacer);

        console.log("Storing session data:", str);
        return str;
      } catch (err) {
        console.error("Serializer error:", err);
        throw err;
      }
    },
    parse: JSON.parse,
  },
});

// Configure Express Session to use Redis
const sessionConfig = session({
  store: redisStore,
  secret: process.env.SESSION_SECRET || "supersecret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // set to false locally if not using HTTPS
    sameSite: "lax",
    maxAge: 15 * 60 * 1000, // 15-minute expiration
  },
});

module.exports = sessionConfig;
