import jwt from 'jsonwebtoken';
import Auth from '../models/auth/auth-model.js';
import OTP from '../models/auth/otp-model.js';
import { sendVerificationEmail, sendOtpToEmail } from '../utils/email.js';
import mongoose from 'mongoose';
// import { createNotificationService } from './notification-services.js';
 import { pushNotification } from '../utils/send-notification.js';

export const getAuth = async ({authId}) => {
  const auth = await Auth.findById(new mongoose.Types.ObjectId(authId));

  if (!auth) {
    throw {
        status: 404,
        message: 'Auth data not found',
      };
  }
  return { auth };
};

export const registerUserService = async ({ email, password, userType, authProvider, deviceToken }) => {
  const existingAuth = await Auth.findOne({ email });

  if (existingAuth) {
    const createdTime = existingAuth.createdAt;
    const now = new Date();
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

    if (!existingAuth.isEmailVerified && createdTime < fifteenMinutesAgo) {
      await Auth.deleteOne({ _id: existingAuth._id });
    } else {
      throw {
        status: 409,
        message: existingAuth.isEmailVerified
          ? 'Student already registered'
          : 'Student already registered but email not verified. Please check your inbox or try again later.',
      };
    }
  }

  const newAuth = new Auth({ email, password, userType, authProvider, isEmailVerified: true, deviceToken });
  await newAuth.save();

  const token = jwt.sign({ id: newAuth._id, email: newAuth.email }, process.env.SECRET, {
    expiresIn: '15m',
  });

  // await sendVerificationEmail({ email, token });
  return { email, token };
};

export const loginUserService = async ({ email, password, deviceToken }) => {
  const auth = await Auth.findOne({ email });

  if (!auth) {
    throw { status: 404, message: 'User not found' };
  }

  if (auth.password !== password) {
    throw { status: 401, message: 'Incorrect password' };
  }

  if (!auth.isEmailVerified) {
    throw { status: 401, message: 'Please verify your email' };
  }

  const token = jwt.sign(
    { id: auth._id, email: auth.email },
    process.env.SECRET,
    { expiresIn: '30d' }
  );

  // Update latest device token
  auth.deviceToken = deviceToken;
  await auth.save();
await pushNotification({
  deviceToken: auth.deviceToken,
  title: "Logged In",
  body: "You have successfully logged in.",
});
  return { auth, token };
};

export const verifyEmailService = async (token) => {
  const { email, id } = jwt.verify(token, process.env.SECRET);
  const auth = await Auth.findOne({ email });

  if (!auth.isEmailVerified) {
    auth.isEmailVerified = true;
    await auth.save();
    return 'verified';
  } else {
    return 'alreadyVerified';
  }
};

export const resetPasswordService = async (token, oldPassword, newPassword) => {
  const { email } = jwt.verify(token, process.env.SECRET);
  const auth = await Auth.findOne({ email });

  if (auth.password !== oldPassword) throw { status: 403, message: 'Password is incorrect' };
  if (auth.password === newPassword) throw { status: 403, message: 'Password cannot be same' };

  auth.password = newPassword;
  await auth.save();
};

export const sendOtpService = async (email) => {
  const auth = await Auth.findOne({ email });
  if (!auth) throw { status: 404, message: 'Email not registered' };

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  await OTP.deleteMany({ email });
  await new OTP({ email, otp: otpCode }).save();

  await sendOtpToEmail({ email, otp: otpCode });
};

export const verifyOtpResetPasswordService = async ({ email, otp, newPassword }) => {
  const otpDoc = await OTP.findOne({ email, otp });
  if (!otpDoc) throw { status: 400, message: 'Invalid or expired OTP' };

  const auth = await Auth.findOne({ email });
  if (!auth) throw { status: 404, message: 'User not found' };
  if (auth.password === newPassword) throw { status: 400, message: "Password couldn't be same" };

  auth.password = newPassword;
  await auth.save();
  await OTP.deleteMany({ email });
};