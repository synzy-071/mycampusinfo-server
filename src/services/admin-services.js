import jwt from 'jsonwebtoken';
import College from '../models/school_details/college_model.js';
import User from '../models/user/user-model.js';
import Application from '../models/application/application-model.js';

export const loginAdminService = async ({ email, password }) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword || email !== adminEmail || password !== adminPassword) {
    return null;
  }

  const token = jwt.sign(
    { email: adminEmail, role: 'admin' },
    process.env.SECRET || 'fallback_secret',
    { expiresIn: '1h' }
  );

  return token;
};

export const getAdminStatsService = async () => {
  const totalColleges = await College.countDocuments();
  const totalUsers = await User.countDocuments();
  const totalApplications = await Application.countDocuments();

  return {
    totalColleges,
    totalUsers,
    totalApplications,
  };
};

export const getAllUsersService = async () => {
  return await User.find().select('-password');
};
