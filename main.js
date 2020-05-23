const { app, ipcMain, Tray, Menu, screen, BrowserWindow } = require("electron");
const moment = require("moment");
require("dotenv").config({ path: `${__dirname}/.env` });

let mainWindow, timerWindow;
let canClose = false;

function createWindow(file, opts = {}, params = {}) {
  const win = new BrowserWindow(opts);
  win.loadURL(`file://${__dirname}/app/${file}.html`);

  win.webContents.on("did-finish-load", () => {
    win.webContents.send("load", params);
  });

  return win;
}

function hideMainWindow() {
  mainWindow.setSkipTaskbar(true);
  mainWindow.setOpacity(0);
}

function showMainWindow() {
  mainWindow.setSkipTaskbar(false);
  mainWindow.setOpacity(1);
  mainWindow.show();
  mainWindow.focus();
  if (app.show) app.show();
  app.focus({ steal: true });
}

ipcMain.on("startWork", (user) => {
  hideMainWindow();
  createTimerWindow({
    startTime: moment().toObject(),
    endTime: moment().add(process.env.POMODORO_MINUTES, "minutes").toObject()
  });
});

ipcMain.on("continueWork", (user) => {
  hideMainWindow();
  createTimerWindow({
    startTime: moment().toObject(),
    endTime: moment().add(5, "minutes").toObject()
  });
});

ipcMain.on("shortBreak", (user) => {
  createTimerWindow({
    startTime: moment().toObject(),
    endTime: moment()
      .add(process.env.SHORT_BREAK_MINUTES_MAXIMUM, "minutes")
      .toObject(),
    type: 2
  });
});

ipcMain.on("longBreak", (user) => {
  createTimerWindow({
    startTime: moment().toObject(),
    endTime: moment()
      .add(process.env.LONG_BREAK_MINUTES_MAXIMUM, "minutes")
      .toObject(),
    type: 2
  });
});

ipcMain.on("timerEnd", (_, params) => {
  if (!timerWindow.isDestroyed()) timerWindow.close();
  showMainWindow();
  mainWindow.send("timerEnd", params);
});

function createMainWindow() {
  const { powerSaveBlocker } = require("electron");
  powerSaveBlocker.start("prevent-display-sleep");
  mainWindow = createWindow("index", {
    frame: false,
    fullscreen: true,
    skipTaskbar: true,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      nativeWindowOpen: true
    }
  });

  mainWindow.setAlwaysOnTop(true, "normal", 50);

  mainWindow.on("close", (e) => {
    if (!canClose) {
      e.preventDefault();
      hideMainWindow();
    }
  });

  tray = new Tray(`${__dirname}/images/vinkas.png`);
  tray.on("click", showMainWindow);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Quit",
      click() {
        canClose = true;
        BrowserWindow.getAllWindows().forEach((window) => {
          window.close();
        });
        app.quit();
      }
    }
  ]);
  tray.setContextMenu(contextMenu);
}

function createTimerWindow(params = {}) {
  let opts = {
    frame: false,
    width: 240,
    height: 39,
    focusable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    minimizable: false,
    webPreferences: {
      nodeIntegration: true
    }
  };

  if (params["type"] === 2) {
    opts = Object.assign({}, opts, {
      parent: mainWindow
    });
  } else {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    opts = Object.assign({}, opts, {
      x: width - 240,
      y: height - 39
    });
  }

  timerWindow = createWindow("timer", opts, params);
  timerWindow.setAlwaysOnTop(true, "normal", 100);
}

function createAuthWindow() {
  const win = createWindow("auth", {
    parent: mainWindow,
    modal: true,
    frame: false,
    width: 600,
    height: 400,
    alwaysOnTop: true,
    minimizable: false,
    webPreferences: {
      nodeIntegration: true
    }
  });

  ipcMain.on("loggedIn", () => {});
}

app.whenReady().then(createMainWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});
