const { ipcRenderer } = require("electron");
const { remote } = require("electron");
const mainProcess = remote.require("./main.js");

// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

// when DOM ready
document.addEventListener("DOMContentLoaded", function() {
    // set initial form values
    ipcRenderer.on("initFormParams", (event, args) => {
        // set device name
        $("#deviceName").val(args.defaultName);

        // set no. of threads
        // $('#noOfThreads').find('option').remove();
        for (let i = 0; i < args.maxThreads; i++) {
            $("#noOfThreads").append(
                $("<option>", { value: i + 1, html: i + 1 })
            );
        }
        $("#noOfThreads").val(args.maxThreads);
    });

    // handle mine button click
    $("#myButton").click(() => {
        const walletAddress = $("#walletAddress").val();
        const poolMiningHost = $("#poolMiningHost").val();
        const noOfThreads = $("#noOfThreads").val();
        const args = {
            walletAddress: walletAddress,
            poolMiningHost: poolMiningHost,
            noOfThreads: noOfThreads
        };
        // tells main process to start mining
        ipcRenderer.send("mine", args);
        // disable all fields once we start mining, except no. of threads
        $("#walletAddress").prop("disabled", true);
        $("#deviceName").prop("disabled", true);
        $("#poolMiningHost").prop("disabled", true);
    });

    // handle no. of threads change
    $("#noOfThreads").change(() => {
        args = $("#noOfThreads").val();
        ipcRenderer.send("noOfThreadsChanged", args);
    });

    // handle switch tab
    ipcRenderer.on("switchTab", (event, args) => {
        $(args).trigger("click");
    });

    // update logging div
    ipcRenderer.on("logging", (event, args) => {
        $("#info").append(args + "<br/>");
        $("#info")
            .stop()
            .animate(
                {
                    scrollTop: $("#info")[0].scrollHeight
                },
                0
            );
    });

    // update mine button
    ipcRenderer.on("mine-button", (event, args) => {
        $("#myButton").prop("disabled", args.disabled);
        $("#myButton").html(args.label);
    });
});
