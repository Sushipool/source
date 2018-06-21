const { ipcRenderer } = require( "electron" );
const { remote } = require('electron');
const mainProcess = remote.require('./main.js');

// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

 ipcRenderer.on('asynchronous-reply', (event, arg) => {
  $('#info').append(arg + '<br/>');      //show message . Here we can use jquery
  // $('#info').scrollTop($('#info')[0].scrollHeight);
  $('#info').stop().animate({
    scrollTop: $('#info')[0].scrollHeight
  }, 800);
})

// send the message when DOMConentLoaded event trigger
document.addEventListener('DOMContentLoaded', function() {
    const myButton = document.getElementById("myButton");
    const walletAddress = document.getElementById("walletAddress").value;
    myButton.addEventListener("click", e => {
        console.log("I was clicked.");
        ipcRenderer.send('click', walletAddress);
    });
});