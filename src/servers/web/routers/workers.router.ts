import { Router } from "express";
import * as WorkersController from "../controllers/workers.controller";
const router = Router();

router.get("/", WorkersController.getAllWorkers);
router.post("/", WorkersController.createWorker);
router.get("/online", WorkersController.getOnlineWorkers);
router.get("/:workerId", WorkersController.getWorker);
router.put("/:workerId", WorkersController.editWorker);

export = router;
