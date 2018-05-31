const { ipcRenderer } = require( "electron" );

// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

//ipcRenderer.on will receive the “btnclick-task-finished'” info from main process
ipcRenderer.on('btnclick-task-finished', function(event,param) {
    $('#message').html('loaded a popup');      //show message . Here we can use jquery
 });