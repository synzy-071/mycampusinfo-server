import admin from "firebase-admin";
import { getApps } from "firebase-admin/app";
//import serviceAccount from "../../config/firebase-service-account.json" with { type: "json" };
import dotenv from "dotenv";
dotenv.config();
const serviceAccount = JSON.parse(process.env.FCM_SERVER_KEY);
if (!getApps().length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
export const pushNotification = async ({ deviceToken, title, body }) => {
  try {
 
    const message = {
      token: deviceToken,
      notification: {
        title,
        body,
      },
    };

    const response = await admin.messaging().send(message);

  

    return response;
  } catch (err) {
 
    throw err;
  }
};