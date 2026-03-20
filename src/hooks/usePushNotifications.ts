"use client";
import { useEffect, useState, useCallback } from "react";
import { getFirebaseMessaging } from "@/firebase/client";
import { getToken, onMessage } from "firebase/messaging";

const usePushNotifications = () => {
  const [fcmToken, setFcmToken] = useState<string>("");

  const generateFCMToken = useCallback(async () => {
    try {
      const messaging = await getFirebaseMessaging();
      if (!messaging) {
        console.log("Firebase Messaging is not supported.");
        return null;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        console.log("Notification permission not granted.");
        return null;
      }

      const token = await getToken(messaging, {
        vapidKey:
          "BOtXfQEhd_V-1mMvgl99KHhxdRwtZ6nVIf2-PUTSlaj5O7z_rYkKuSd5bcyVJEwPEvWcyGnu4mUs-zAkn9nb9vU",
      });

      if (token) {
        setFcmToken(token);

        // Set up message listener for foreground messages
        onMessage(messaging, (payload) => {
          console.log("Foreground message received:", payload);
        });

        return token;
      }
      return null;
    } catch (error) {
      console.error("Error getting FCM token:", error);
      return null;
    }
  }, []);

  useEffect(() => {
    generateFCMToken();
  }, []);

  return {
    fcmToken,
    generateFCMToken,
  };
};

export default usePushNotifications;
