const moment = require("moment");

const secondsToTime = (seconds) => {
  let format;

  if (seconds < 60) {
    format = "s [sec]";
  } else if (seconds < 3600) {
    format = "m [min] s [sec]";
  } else {
    format = "H [hr] m [min]";
  }

  return moment().startOf("day").seconds(seconds).format(format);
};

const timeDiff = (endTime, startTime) => {
  return moment.duration(endTime.diff(startTime)).asSeconds();
};
