import { OAuth2Client } from 'google-auth-library';

export const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID || '61664057766-ral4biepjmo0e3ueqtgghv0cfvprbact.apps.googleusercontent.com'
);