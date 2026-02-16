importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyD434Fijtu5Nr28VW_Q4v0ZS899SQZpPVc",
  authDomain: "push-notification-82194.firebaseapp.com",
  projectId: "push-notification-82194",

  // 🔥 FIXED HERE TOO
  storageBucket: "push-notification-82194.appspot.com",

  messagingSenderId: "133822818220",
  appId: "1:133822818220:web:503f0764fbd47064cabc09",
});

const messaging = firebase.messaging();
self.addEventListener("push", function(event) {
  console.log("🔥 Push received in SW");

  const data = event.data.json();

  self.registration.showNotification(data.notification.title, {
    body: data.notification.body,
    icon: "/icon.png"
  });
});