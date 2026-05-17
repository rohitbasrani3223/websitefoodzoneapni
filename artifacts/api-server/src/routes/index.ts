import { Router, type IRouter } from "express";
import healthRouter from "./health";
import menuRouter from "./menu";
import categoriesRouter from "./categories";
import ordersRouter from "./orders";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(menuRouter);
router.use(categoriesRouter);
router.use(ordersRouter);
router.use(adminRouter);

export default router;
