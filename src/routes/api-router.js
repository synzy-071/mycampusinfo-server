import express from "express";
import { authRoutes, collegeRoutes, userRoutes, applicationRoutes, chatbotRoutes, formRoutes, paymentRoutes} from './api-routes/index.js';

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/colleges", collegeRoutes);
router.use("/users", userRoutes);
router.use("/application", applicationRoutes);
router.use("/chatbot", chatbotRoutes);
router.use("/form", formRoutes);
router.use("/payment", paymentRoutes);

export default router;