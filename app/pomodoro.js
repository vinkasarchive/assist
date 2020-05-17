const { ipcRenderer } = require("electron");
const moment = require("moment");
require("dotenv").config();

const NONE = 0,
  WORK_TIMER = 1,
  BREAK_TIMER = 2;
let format,
  timer,
  timerType = NONE,
  duration = 0,
  minutes = 0,
  seconds = 0;

const takeBreak = () => {
  timerDiv.innerHTML = "TAKE A BREAK!";
  ipcRenderer.send("takeBreak");
  seconds = 0;
  minutes = 0;
  timerType = BREAK_TIMER;
};

const formatTime = (seconds) => {
  if (seconds < 60) {
    format = "s [seconds]";
  } else if (seconds < 3600) {
    format = "m [minutes]";
  } else {
    format = "H [hours] m [minutes]";
  }

  return moment({}).startOf("day").seconds(seconds).format(format);
};

const tick = () => {
  seconds = seconds + 1;
  duration = duration + 1;
  minutes = seconds / 60;

  if (timerType === WORK_TIMER) {
    timerDiv.innerHTML = formatTime(seconds);
    if (seconds !== duration) timerDiv.innerHTML = formatTime(duration);
    if (minutes >= process.env.POMODORO_MINUTES) takeBreak();
  } else if (timerType === BREAK_TIMER) {
    timerDiv.innerHTML = formatTime(seconds);
  }
};

ipcRenderer.on("load", () => {
  timerType = WORK_TIMER;
  tick();
  timer = setInterval(tick, 1000);
  takeBreakButton.addEventListener("click", () => {
    takeBreak();
  });
});
