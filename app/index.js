const { ipcRenderer } = require("electron");
const db = firebase.database();
let user, dbUserPath, datePath, durationToday, sessions;

const sum = (obj) => Object.values(obj).reduce((a, b) => a + b);

const sessionUpdated = (data) => {
  sessions[data.key] = data.val().duration;
  durationToday = sum(sessions);
  durationSpan.innerHTML = secondsToTime(durationToday);
  db.ref(datePath).update({ duration: durationToday });
};

ipcRenderer.on("load", () => {
  firebase.auth().onAuthStateChanged(function (u) {
    user = u;
    if (user) {
      sessions = {};
      userDiv.innerHTML = user.email;
      body.classList.remove("anon");
      dbUserPath = `users/${user.uid}/assist`;
      const date = moment().format("YYYY/MM/DD");
      datePath = `${dbUserPath}/log/${date}`;
      const sessionsPath = `${datePath}/sessions`;
      db.ref(sessionsPath).on("child_added", sessionUpdated);
      db.ref(sessionsPath).on("child_changed", sessionUpdated);
    } else window.location.href = "auth.html";
  });

  startWorkButton.addEventListener("click", () => {
    ipcRenderer.send("startWork");
  });

  continueWorkButton.addEventListener("click", () => {
    ipcRenderer.send("continueWork");
  });

  shortBreakButton.addEventListener("click", () => {
    ipcRenderer.send("shortBreak");
    body.classList.remove("work");
    body.classList.remove("break");
  });

  longBreakButton.addEventListener("click", () => {
    ipcRenderer.send("longBreak");
    body.classList.remove("work");
    body.classList.remove("break");
  });
});

ipcRenderer.on("timerEnd", (_, params) => {
  if (params["type"] == 1) {
    body.classList.add("break");
    body.classList.remove("work");

    if (user) {
      const startTime = moment(params["startTime"]);
      const endTime = moment(params["endTime"]);
      const date = startTime.format("YYYY/MM/DD");
      const sessionId = `${startTime.format("hhmmss")}`;
      session = db.ref(`${dbUserPath}/log/${date}/sessions/${sessionId}`);
      const duration = timeDiff(endTime, startTime);
      session.set({
        startTime: startTime.format(),
        endTime: endTime.format(),
        duration: duration
      });
    }
  } else if (params["type"] == 2) {
    body.classList.add("work");
    body.classList.remove("break");
  }
});
