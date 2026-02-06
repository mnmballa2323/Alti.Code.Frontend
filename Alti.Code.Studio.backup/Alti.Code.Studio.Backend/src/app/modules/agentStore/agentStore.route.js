import express from "express";
import { AgentStoreController } from "./agentStore.controller.js";

const router = express.Router();

router.post("/create", AgentStoreController.createAgent);
router.get("/", AgentStoreController.getAllAgents);
router.get("/:id", AgentStoreController.getAgent);
router.post("/install/:agentId", AgentStoreController.installAgent);

export const AgentStoreRoutes = router;
