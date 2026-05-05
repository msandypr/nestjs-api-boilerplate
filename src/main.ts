import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { apiReference } from "@scalar/nestjs-api-reference";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import type { Request, Response } from "express";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security (relax CSP for Scalar docs)
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'",
            "https://cdn.jsdelivr.net",
          ],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            "https://fonts.googleapis.com",
          ],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https://cdn.jsdelivr.net"],
          connectSrc: ["'self'", "https://cdn.jsdelivr.net"],
        },
      },
    }),
  );
  app.use(
    rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 100, // limit each IP to 100 requests per window
    }),
  );

  // CORS
  app.enableCors();

  // API prefix
  app.setGlobalPrefix("api", {
    exclude: ["/"],
  });

  // OpenAPI / Scalar docs
  const config = new DocumentBuilder()
    .setTitle("NestJS API Boilerplate")
    .setDescription("API documentation for NestJS Boilerplate")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Serve OpenAPI JSON spec
  app.use("/openapi.json", (_req: Request, res: Response) => {
    res.json(document);
  });

  // Mount Scalar API Reference
  app.use(
    "/docs",
    apiReference({
      url: "/openapi.json",
      theme: "deepSpace",
      authentication: {
        preferredSecurityScheme: "bearer",
      },
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`API Docs available at: http://localhost:${port}/docs`);
}
void bootstrap();
