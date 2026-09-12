import jwt from 'jsonwebtoken';
import Auth from '../models/auth/auth-model.js';
import { googleClient } from '../utils/google-client.js';

export const handleGoogleAuthService = async (tokenId, userType, isWeb, accountType, action = null) => {
  if (!tokenId) {
    throw { status: 400, message: 'Google tokenId is required' };
  }

  const normalizedAccountType = (accountType === 'college' || userType === 'college') ? 'college' : 'college_user';

  // Support Web, Android, iOS, and Legacy Client IDs
  const allowedAudiences = [
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_ID_MOBILE,
    process.env.GOOGLE_CLIENT_ID_WEB,
    '61664057766-ral4biepjmo0e3ueqtgghv0cfvprbact.apps.googleusercontent.com',
    '574038035729-6nlkp4a98fj3jdqkqlkub49asnskcnmh.apps.googleusercontent.com',
    '809028962389-buh0m92ilhd1n27vkuhi1og76g9kb5v2.apps.googleusercontent.com',
  ].filter(Boolean);

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: tokenId,
      audience: allowedAudiences,
    });
    payload = ticket.getPayload();
  } catch (verifyError) {
    console.warn('Google verifyIdToken with audience failed, trying direct verification:', verifyError.message);
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: tokenId,
      });
      payload = ticket.getPayload();
    } catch (secondError) {
      console.error('Google token verification failed completely:', secondError.message);
      throw { status: 401, message: 'Invalid or expired Google authentication token.' };
    }
  }

  const { email } = payload;
  if (!email) {
    throw { status: 400, message: 'Unable to retrieve email from Google token.' };
  }

  let existingAuth = await Auth.findOne({ email });

  if (action === 'signin') {
    if (!existingAuth) {
      throw {
        status: 404,
        message: `No account found for this Google email. Please sign up first as ${normalizedAccountType === 'college' ? 'College' : 'College User'}.`,
      };
    }

    if (normalizedAccountType === 'college' && existingAuth.userType !== 'college') {
      throw {
        status: 403,
        message: 'This Google account is registered as a College User. Please sign in as College User.',
      };
    }

    if (normalizedAccountType === 'college_user' && !['student', 'parent'].includes(existingAuth.userType)) {
      throw {
        status: 403,
        message: 'This Google account is registered as a College. Please sign in as College.',
      };
    }
  } else if (action === 'signup') {
    if (existingAuth) {
      if (normalizedAccountType === 'college' && existingAuth.userType !== 'college') {
        throw {
          status: 409,
          message: 'This Google account is already registered as a College User. Please sign in as College User.',
        };
      }
      if (normalizedAccountType === 'college_user' && !['student', 'parent'].includes(existingAuth.userType)) {
        throw {
          status: 409,
          message: 'This Google account is already registered as a College. Please sign in as College.',
        };
      }
      // If already registered with the same accountType, allow seamless login
    } else {
      const newUserType = normalizedAccountType === 'college' ? 'college' : 'student';
      existingAuth = new Auth({
        email,
        authProvider: 'google',
        userType: newUserType,
        isEmailVerified: true,
      });
      await existingAuth.save();
    }
  } else {
    // Fallback if action is not explicitly passed (e.g. mobile app sign-in/sign-up in one flow)
    if (existingAuth) {
      if (normalizedAccountType === 'college' && existingAuth.userType !== 'college') {
        throw {
          status: 403,
          message: 'This Google account is registered as a College User. Please sign in as College User.',
        };
      }
      if (normalizedAccountType === 'college_user' && !['student', 'parent'].includes(existingAuth.userType)) {
        throw {
          status: 403,
          message: 'This Google account is registered as a College. Please sign in as College.',
        };
      }
    } else {
      const newUserType = normalizedAccountType === 'college' ? 'college' : 'student';
      existingAuth = new Auth({
        email,
        authProvider: 'google',
        userType: newUserType,
        isEmailVerified: true,
      });
      await existingAuth.save();
    }
  }

  const token = jwt.sign(
    { id: existingAuth._id, email: existingAuth.email, userType: existingAuth.userType },
    process.env.SECRET,
    { expiresIn: '7d' }
  );

  return { auth: existingAuth, token };
};