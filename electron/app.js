const { ipcRenderer } = require( "electron" );

document.addEventListener( "DOMContentLoaded", () => {
    const nodeJsVersion = process.versions.node;
    const chromiumVersion = process.versions.chrome;
    const electronVersion = process.versions.electron;
    const e = document.getElementById("info");
    e.textContent = `I'm running Node.js ${electronVersion} Chromium ${chromiumVersion} Electron ${electronVersion}`;
} );