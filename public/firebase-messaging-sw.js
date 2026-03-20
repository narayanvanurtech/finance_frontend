// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging-compat.js');

try {
  firebase.initializeApp({
    apiKey: "AIzaSyDIuH-1JYs7EX8Jd8mN1it4Tdo9XgbKPuo",
    authDomain: "lead-management-3c2d2.firebaseapp.com",
    projectId: "lead-management-3c2d2",
    storageBucket: "lead-management-3c2d2.appspot.com",
    messagingSenderId: "7369187211",
    appId: "1:7369187211:web:72719d23ea039ea2d6998e",
  });
} catch (e) {
  console.error("Firebase initialization error in service worker:", e);
}

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log("[firebase-messaging-sw.js] Received background message:", payload);
  const { title, body } = payload.notification;

  self.registration.showNotification(title, {
    body,
    icon: "/icon.png",
  });
});
