import jwt from 'jsonwebtoken';
import Auth from '../models/auth/auth-model.js';
import { googleClient } from '../utils/google-client.js';

export const handleGoogleAuthService = async (tokenId, userType, isWeb, accountType) => {
  if (!tokenId) {
    throw { status: 400, message: 'Google tokenId is required' };
  }
  if (!accountType || !['college_user', 'college'].includes(accountType)) {
      throw { status: 400, message: 'Invalid account type for college portal.' };
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: tokenId,
    audience: isWeb ? process.env.GOOGLE_CLIENT_ID_WEB : process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const { email } = payload;

  let existingAuth = await Auth.findOne({ email });

  if (existingAuth) {
      if (accountType === 'college' && existingAuth.userType !== 'college') {
          throw { status: 401, message: 'Invalid credentials or account type.' };
      }
      if (accountType === 'college_user' && !['student', 'parent'].includes(existingAuth.userType)) {
          throw { status: 401, message: 'Invalid credentials or account type.' };
      }
  } else {
    let newUserType = userType || 'student';
    if (accountType === 'college') newUserType = 'college';
    else if (accountType === 'college_user') newUserType = 'student';

    existingAuth = new Auth({
      email,
      authProvider: 'google',
      userType: newUserType,
      isEmailVerified: true,
    });
    await existingAuth.save();
  }

  const token = jwt.sign(
    { id: existingAuth._id, email: existingAuth.email, userType: existingAuth.userType },
    process.env.SECRET,
    { expiresIn: '7d' }
  );

  return { auth: existingAuth, token };
};