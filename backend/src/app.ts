import express, {
  NextFunction,
  Request,
  Response
} from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import productRoutes from "./routes/product.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import saleRoutes from "./routes/sale.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

app.disable("x-powered-by");

app.use(
  cors({
    origin: "http://localhost:5173"
  })
);

app.use(helmet());

app.use(
  express.json({
    limit: "100kb"
  })
);

const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many requests. Please try again later."
  }
});

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many login attempts. Please try again later."
  }
});

app.use("/api", apiRateLimiter);

app.use("/api/auth", authRateLimiter, authRoutes);

app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/users", userRoutes);

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    message: "Paint Store Management System API"
  });
});

app.use((_req: Request, res: Response): void => {
  res.status(404).json({
    message: "Route not found"
  });
});

app.use(
  (
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
  ): void => {
    console.error("Unhandled application error:", error);

    if (res.headersSent) {
      return;
    }

    res.status(500).json({
      message: "Internal server error"
    });
  }
);

export default app;