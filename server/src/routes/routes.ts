import { Router } from "express";
import { getItems, getItemDetail } from "../controllers/itemsController.js";

const router = Router();

router.get("/", getItems);
router.get("/:id", getItemDetail);

export default router;

