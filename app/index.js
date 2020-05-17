const { ipcRenderer } = require("electron");
const moment = require("moment");
let duration = 65;
let format, timer;

const tick = () => {
  duration = duration - 1;

  if (duration >= 3600) {
    format = "H:mm:ss";
  } else if (duration >= 60) {
    format = "mm:ss";
  } else {
    format = "ss";
  }

  const time = moment({}).startOf("day").seconds(duration).format(format);
  timerDiv.innerHTML = time;

  if (duration <= 0) {
    clearInterval(timer);
  }
};

ipcRenderer.on("init", (event, t) => {
  tick();
  timer = setInterval(tick, 1000);
});
