import { handleGoogleAuthService } from '../services/google-auth-services.js';

export const googleAuth = async (req, res) => {
  try {
    const { tokenId, userType, isWeb, accountType, action } = req.body;

    const { auth, token } = await handleGoogleAuthService(
      tokenId,
      userType,
      isWeb !== undefined ? isWeb : true,
      accountType,
      action
    );

    res.status(200).json({
      status: 'success',
      message: action === 'signup' ? 'Account created successfully' : 'Login successful',
      data: {
        auth,
        token,
      },
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(error.status || 500).json({
      status: 'failed',
      message: error.message || 'Google authentication failed',
    });
  }
};