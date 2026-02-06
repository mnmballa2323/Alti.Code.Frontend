import express from "express";
import { BorgController } from "./borg.controller.js";

const router = express.Router();

router.post("/task", BorgController.startTask);
router.get("/task/:id", BorgController.getTaskStatus);

export const BorgRoutes = router;
