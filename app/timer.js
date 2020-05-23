const { ipcRenderer } = require("electron");

const WORK_TIMER = 1,
  BREAK_TIMER = 2;
let timer, timerType, seconds, startTime, endTime;

const timerEnd = (seconds) => {
  ipcRenderer.send("timerEnd", {
    type: timerType,
    seconds: seconds,
    startTime: startTime.toObject(),
    endTime: moment().toObject()
  });
};

const tick = () => {
  seconds = timeDiff(endTime, moment());
  timerDiv.innerHTML = secondsToTime(seconds);
  if (seconds <= 0) timerEnd();
};

ipcRenderer.on("load", (_, params) => {
  startTime = moment(params["startTime"]);
  endTime = moment(params["endTime"]);
  timerType = params["type"] || WORK_TIMER;

  if (timerType === WORK_TIMER) {
    timerEndButton.innerHTML = "Break";
  } else if (timerType === BREAK_TIMER) {
    timerEndButton.innerHTML = "Work";
  }

  tick();
  timer = setInterval(tick, 1000);
  timerEndButton.addEventListener("click", () => {
    timerEnd(seconds);
  });
});
