import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import proposalsRouter from "./proposals.js";
import templatesRouter from "./templates.js";
import aiRouter from "./ai.js";
import orgRouter from "./org.js";
import adminRouter from "./admin.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(proposalsRouter);
router.use(templatesRouter);
router.use(aiRouter);
router.use(orgRouter);
router.use(adminRouter);

export default router;
