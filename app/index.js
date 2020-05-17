const { ipcRenderer } = require("electron");
const moment = require("moment");
require("dotenv").config();
let duration = 65;
let format, timer;

const tick = () => {
  duration = duration - 1;

  if (duration >= 3600) {
    format = "H:m:s";
  } else if (duration >= 60) {
    format = "m:s";
  } else {
    format = "s";
  }

  const time = moment({}).startOf("day").seconds(duration).format(format);
  timerDiv.innerHTML = time;

  if (duration <= 0) {
    clearInterval(timer);
  }
};

ipcRenderer.on("init", () => {
  const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGE_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
  };
  firebase.initializeApp(firebaseConfig);
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      userDiv.innerHTML = user.email;
      duration = process.env.DURATION_SECONDS;
      tick();
      timer = setInterval(tick, 1000);
    } else {
      const ui = new firebaseui.auth.AuthUI(firebase.auth());
      ui.start("#firebaseAuthDiv", {
        signInOptions: [firebase.auth.EmailAuthProvider.PROVIDER_ID],
        signInSuccessUrl: "index.html"
      });
    }
  });
});
