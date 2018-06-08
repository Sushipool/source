const { ipcRenderer } = require( "electron" );
const { remote } = require('electron');
const mainProcess = remote.require('./main.js');

// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

//ipcRenderer.on will receive the “btnclick-task-finished'” info from main process
// ipcRenderer.on('btnclick-task-finished', function(event,param) {
//     $('#info').html('loaded a popup');      //show message . Here we can use jquery
//  });

// document.addEventListener( "DOMContentLoaded", () => {
//  // const nodeJsVersion = process.versions.node;
//  // const chromiumVersion = process.versions.chrome;
//  // const electronVersion = process.versions.electron;
//  // const e = document.getElementById("info");
//  // e.textContent = `I'm running Node.js ${electronVersion} Chromium ${chromiumVersion} Electron ${electronVersion}`;
//
//      const myButton = document.getElementById("myButton");
//      myButton.addEventListener("click", e => {
//          console.log("I was clicked.");
//          ipcRenderer.send("btnclick", { message: "The button was clicked" });
//      });
//
// } );

// send the message when DOMConentLoaded event trigger
document.addEventListener('DOMContentLoaded', function() {
    const myButton = document.getElementById("myButton");
    myButton.addEventListener("click", e => {
        console.log("I was clicked.");
        // mainProcess.onClick();
        ipcRenderer.send('click');
    });
});

     // const myButton = document.getElementById("myButton");
     // myButton.addEventListener("click", e => {
     //     console.log("I was clicked.");
     //           mainProcess.onClick();
     // });

// document
//   .querySelector('#myButton')
//   .addEventListener('click', () => {
//       console.log("I was clicked.");
//       // ipcRenderer.send('click');
//       mainProcess.onClick();
//   });