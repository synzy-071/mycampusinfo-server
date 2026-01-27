import express from "express";
import { createOrder, verifyPayment } from "../../controllers/payment-controller.js";

const router = express.Router();

router.post("/create-order/:formId", createOrder);
router.post("/verify/:formId", verifyPayment);

export default router;
