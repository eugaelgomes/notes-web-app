const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const { getClientIp } = require("@/middlewares/ip-address");
const { loginLimiter } = require("@/middlewares/limiters");
const { sessionMiddleware } = require("@/middlewares/session");

// util p/ transformar string de origens em array limpinho
function parseAllowedOrigins(env) {
  return (env || "http://localhost:3000,http://localhost:3001,http://localhost:80,https://notes.codaweb.com.br,http://localhost:5173")
    .split(",")
    .map(s => s.trim().replace(/\/+$/, "")) // remove barra final
    .filter(Boolean);
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildMatcher(allowed) {
  if (allowed.includes("*")) {
    // wildcard tipo https://*.dominio.com
    const pattern = "^" + allowed.split("*").map(escapeRegExp).join(".*") + "$";
    const re = new RegExp(pattern);
    return (origin) => re.test(origin);
  }
  return origin => origin === allowed;
}

function makeCorsOptions(allowedOrigins) {
  const isDev = process.env.NODE_ENV !== "production";

  // em dev, libera qualquer localhost / 127.0.0.1 em qualquer porta
  const devMatchers = isDev
    ? [
        origin => /^http:\/\/localhost(:\d+)?$/.test(origin),
        origin => /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin),
      ]
    : [];

  const matchers = allowedOrigins.map(buildMatcher).concat(devMatchers);

  return {
    origin(origin, cb) {
      
      if (!origin) {
        return cb(null, true);
      }

      const normalized = origin.replace(/\/+$/, "");
      const ok = matchers.some(fn => fn(normalized));

      if (ok) {
        return cb(null, true);
      }

      return cb(new Error("Origem não permitida pelo CORS"));
    },
    credentials: true, // ESSENCIAL para cookies HttpOnly
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Cookie", // Importante para cookies
    ],
    exposedHeaders: ["Content-Range", "X-Content-Range", "Set-Cookie"],
    maxAge: 600,
    optionsSuccessStatus: 204,
  };
}

function configureGlobalMiddlewares(app) {
  // Cookie Parser (para processar cookies HttpOnly)
  app.use(cookieParser());
  
  // Session
  app.use(sessionMiddleware);

  // Body parsers
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // Proxy
  app.set("trust proxy", 1);

  // Middleware IP + limiters
  app.use(getClientIp);
  app.use(loginLimiter);

  // --- CORS ---
  const allowedOrigins = parseAllowedOrigins(process.env.ALLOWED_ORIGINS);
  app.use(cors(makeCorsOptions(allowedOrigins)));
  // opcional: responde preflight em todas
  // app.options("*", cors(makeCorsOptions(allowedOrigins)));

  // --- Helmet ---
  app.use(
    helmet({
      hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            process.env.TRUSTED_CDN || "https://trusted.cdn.com",
          ],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
    })
  );
}

module.exports = { configureGlobalMiddlewares };
