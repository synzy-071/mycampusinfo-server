import express from "express";
import { authRoutes, collegeRoutes, userRoutes, applicationRoutes, chatbotRoutes, formRoutes, paymentRoutes, adminRoutes} from './api-routes/index.js';

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/colleges", collegeRoutes);
router.use("/users", userRoutes);
router.use("/application", applicationRoutes);
router.use("/chatbot", chatbotRoutes);
router.use("/form", formRoutes);
router.use("/payment", paymentRoutes);
router.use("/admin", adminRoutes);

export default router;