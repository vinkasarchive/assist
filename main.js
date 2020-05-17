const { app, ipcMain, Tray, Menu, BrowserWindow } = require("electron");
let mainWindow;
let canCloseWindows = false;

function createWindow(file, opts = {}) {
  const win = new BrowserWindow(opts);
  // win.webContents.openDevTools();
  win.loadURL(`file://${__dirname}/app/${file}.html`);

  win.webContents.on("did-finish-load", () => {
    win.webContents.send("load");
  });

  win.on("close", (e) => {
    if (!canCloseWindows) e.preventDefault();
  });

  return win;
}

function createMainWindow() {
  mainWindow = createWindow("index", {
    show: false,
    webPreferences: {
      nodeIntegration: true,
      nativeWindowOpen: true
    }
  });

  mainWindow.on("close", (e) => {
    if (!canCloseWindows) e.preventDefault();
    mainWindow.minimize();
    mainWindow.hide();
  });

  ipcMain.on("loggedIn", (user) => {
    const win = createPomodoroWindow();
  });

  tray = new Tray("images/vinkas.png");
  tray.on("click", () => {
    mainWindow.show();
  });

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Quit",
      click() {
        canCloseWindows = true;
        BrowserWindow.getAllWindows().forEach((window) => {
          window.close();
        });
        app.quit();
      }
    }
  ]);
  tray.setContextMenu(contextMenu);
}

function createPomodoroWindow() {
  const win = createWindow("pomodoro", {
    frame: false,
    width: 300,
    height: 100,
    alwaysOnTop: true,
    minimizable: false,
    webPreferences: {
      nodeIntegration: true
    }
  });

  ipcMain.on("takeBreak", () => {
    win.maximize();
    win.show();
  });
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
