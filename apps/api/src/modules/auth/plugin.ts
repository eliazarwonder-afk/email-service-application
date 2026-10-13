import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from "fastify";
import fp from "fastify-plugin";
import { auth } from "./auth";

declare module "fastify" {
  interface FastifyRequest {
    user?: any;
    session?: any;
  }
}

/**
 * Converts a Fastify request into a Web Standard Request object
 */
export function toWebRequest(req: FastifyRequest): Request {
  const protocol = req.protocol;
  const host = req.headers.host || "localhost:4000";
  const url = `${protocol}://${host}${req.raw.url}`;

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) {
      if (Array.isArray(value)) {
        value.forEach((v) => headers.append(key, v));
      } else {
        headers.set(key, value);
      }
    }
  }

  const reqInit: RequestInit = {
    method: req.method,
    headers,
  };

  if (req.body && req.method !== "GET" && req.method !== "HEAD") {
    reqInit.body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
  }

  return new Request(url, reqInit);
}

const authPluginCallback: FastifyPluginAsync = async (fastify) => {
  // Mount Better Auth endpoints at /api/auth/*
  fastify.all("/api/auth/*", async (req: FastifyRequest, reply: FastifyReply) => {
    const webRequest = toWebRequest(req);
    const response = await auth.handler(webRequest);

    reply.status(response.status);

    response.headers.forEach((value, key) => {
      reply.header(key, value);
    });

    const bodyText = await response.text();
    try {
      return reply.send(JSON.parse(bodyText));
    } catch {
      return reply.send(bodyText);
    }
  });

  // Fastify decorator to populate user & session
  fastify.decorateRequest("user", null);
  fastify.decorateRequest("session", null);

  fastify.addHook("preHandler", async (req: FastifyRequest) => {
    try {
      const webReq = toWebRequest(req);
      const sessionResult = await auth.api.getSession({
        headers: webReq.headers,
      });

      if (sessionResult) {
        req.user = sessionResult.user;
        req.session = sessionResult.session;
      }
    } catch {
      // Unauthenticated request; routes with requireAuth will reject
    }
  });
};

export const authPlugin = fp(authPluginCallback, {
  name: "auth-plugin",
});

/**
 * Pre-handler guard to require an active session
 */
export async function requireAuth(req: FastifyRequest, reply: FastifyReply) {
  if (!req.user || !req.session) {
    return reply.status(401).send({
      statusCode: 401,
      error: "Unauthorized",
      message: "You must be signed in to access this resource.",
    });
  }
}
