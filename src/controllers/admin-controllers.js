import { loginAdminService, getAdminStatsService, getAllUsersService } from '../services/admin-services.js';

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const token = await loginAdminService({ email, password });

    if (token) {
      res.status(200).json({
        status: 'success',
        message: 'Admin login successful',
        token: token,
      });
    } else {
      res.status(401).json({
        status: 'failed',
        message: 'Invalid email or password',
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'Failed',
      message: error.message,
    });
  }
};

export const getAdminStats = async (req, res) => {
  try {
    const stats = await getAdminStatsService();
    res.status(200).json({
      status: 'success',
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      status: 'Failed',
      message: error.message,
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await getAllUsersService();
    res.status(200).json({
      status: 'success',
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      status: 'Failed',
      message: error.message,
    });
  }
};
