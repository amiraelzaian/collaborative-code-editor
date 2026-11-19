
import "dotenv/config";
import express from "express";
import { prisma } from "./lib/prisma"
import { errorHandler } from "./middlewares/errorHandler.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.route"
import workspaceRouter from "./routes/workspace.route"
import inviteRouter from "./routes/invite.route"

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));


app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// // rate limmiter 
// const apiLimiter = rateLimit({
//     windowMs: 15 * 60 * 1000,
//     limit: 300,
//     standardHeaders: 'draft-7',
//     legacyHeaders: false,
//     message: { success: false, message: "Too many requests, try later" },
// })

// const loginLimiter = rateLimit({
//     windowMs: 15 * 60 * 1000,
//     limit: 10,
//     standardHeaders: "draft-7",
//     legacyHeaders: false,
//     message: { success: false, message: "Too many login attempts, try again in 15 minutes" }
// })
// // as if i use server like (nginx, render,railway) must add this proxy before limitters or all users will be considered as one ip
// app.set("trust proxy", 1);

// app.use('/api', apiLimiter);
// app.use('/api/v1/auth/login', loginLimiter)


// routes
app.use((req, res, next) => {
    console.log(req.method, req.originalUrl);
    next();
});


app.get("/", (req, res, next) => {
    res.send("test, route is mounted");
});

app.use("/api/v1/auth", authRouter)
app.use("/api/v1/workspaces", workspaceRouter)
app.use("/api/v1/invites", inviteRouter);



// 404 handler: must come after all routes.
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

// Global Express error handler: must come last.
app.use(errorHandler);

// Process-level error handlers.
process.on("unhandledRejection", (reason) => {
    console.error("Unhandled Rejection:", reason);

    // Investigate and fix the rejected Promise.
    // Use a process manager to restart the app if it exits.
    process.exit(1);
});

process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);

    // The process may be in an unsafe state.
    process.exit(1);
});

const port = Number(process.env.PORT) || 4000;

async function startServer() {
    try {
        await prisma.$connect();

        app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exitCode = 1;
        await prisma.$disconnect().catch(console.error);
    }
}

void startServer();