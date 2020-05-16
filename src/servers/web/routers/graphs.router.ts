import { Router } from "express";
import * as GraphsController from "../controllers/graphs.controller";
const router = Router();

router.get("/:tasksetId/info", GraphsController.plotInfo);

export = router;
