import express from 'express';
import { adminLogin, getAdminStats, getAllUsers } from '../../controllers/admin-controllers.js';

const router = express.Router();

router.post('/admin-login', adminLogin);
router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);

export default router;
