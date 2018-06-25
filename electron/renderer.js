const { ipcRenderer } = require("electron");
const { remote } = require("electron");
const mainProcess = remote.require("./main.js");

// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

ipcRenderer.on("asynchronous-reply", (event, arg) => {
    $("#info").append(arg + "<br/>");
    $("#info")
        .stop()
        .animate(
            {
                scrollTop: $("#info")[0].scrollHeight
            },
            800
        );
});

// send the message when DOMConentLoaded event trigger
document.addEventListener("DOMContentLoaded", function() {
    const myButton = document.getElementById("myButton");
    myButton.addEventListener("click", e => {
        e.preventDefault();
        const walletAddress = $("#walletAddress").val();
        const poolMiningHost = $("#poolMiningHost").val();
        const noOfThreads = $('#noOfThreads').val()
        const args = {
            'walletAddress': walletAddress,
            'poolMiningHost': poolMiningHost,
            'noOfThreads': noOfThreads
        }
        ipcRenderer.send("click", args);
        $('#myButton').prop('disabled', true);        
    });
});
