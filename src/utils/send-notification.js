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
export const pushNotification = async ({ deviceToken, title, body, data }) => {
  try {
 
    const message = {
      token: deviceToken,
      notification: {
        title,
        body,
      },
    };

    if (data) {
      // Ensure all data values are strings for FCM
      const stringifiedData = {};
      for (const [key, value] of Object.entries(data)) {
        stringifiedData[key] = String(value);
      }
      message.data = stringifiedData;
    }

    const response = await admin.messaging().send(message);

  

    return response;
  } catch (err) {
 
    throw err;
  }
};