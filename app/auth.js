const { ipcRenderer } = require("electron");

ipcRenderer.on("load", () => {
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      ipcRenderer.send("loggedIn");
    } else {
      const ui = new firebaseui.auth.AuthUI(firebase.auth());
      ui.start("#firebaseAuthDiv", {
        signInOptions: [firebase.auth.EmailAuthProvider.PROVIDER_ID],
        signInSuccessUrl: "index.html"
      });
    }
  });
});
