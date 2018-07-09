const { ipcRenderer } = require("electron");
const { remote } = require("electron");
const mainProcess = remote.require("./main.js");
const Chart = require("chart.js");

// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.


// when DOM ready
document.addEventListener("DOMContentLoaded", function() {
	
    // set initial form values
    ipcRenderer.on("initFormParams", (event, args) => {

        // set wallet address
        $("#walletAddress").val(args.walletAddress);

        // set device name
        $("#deviceName").val(args.deviceName);

        // set no. of threads
        // $('#noOfThreads').find('option').remove();
        for (let i = 0; i < args.numThreads; i++) {
            $("#noOfThreads").append(
                $("<option>", { value: i + 1, html: i + 1 })
            );
        }
        $("#noOfThreads").val(args.numThreads);

        // set pool mining host
        $('#poolMiningHost').val(args.poolMiningHost);

    });

    // handle mine button click
    $("#startMine").click(() => {
        const walletAddress = $("#walletAddress").val();
        const poolMiningHost = $("#poolMiningHost").val();
        const noOfThreads = $("#noOfThreads").val();
        const args = {
            walletAddress: walletAddress,
            poolMiningHost: poolMiningHost,
            noOfThreads: noOfThreads
        };
        // tells main process to start mining
        ipcRenderer.send("startMine", args);
        // disable all fields once we start mining, except no. of threads
        $("#walletAddress").prop("disabled", true);
        $("#deviceName").prop("disabled", true);
        $("#poolMiningHost").prop("disabled", true);
    });

    $("#stopMine").click(() => {
        ipcRenderer.send("stopMine", args);
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
        $("#startButton").prop("disabled", !args.disabled);
        $("#stopButton").prop("disabled", args.disabled);
    });
	
	// update dashboard
	const DATA_LENGTH = 20; // number of data points visible at any point	
	const hashrates = [];
	ipcRenderer.on("dashboard", (event, args) => {
		if (args.hasOwnProperty("status")) {
			$("#dashboard-status").html(args.status);
		}
		if (args.hasOwnProperty("hashrate")) {
			// show in dashboard
			const hrString = args.hashrate;
			$("#dashboard-hashrate").html(hrString);
			// and also plot the hashrates
			const hr = parseFloat(hrString.split(' ')[0]);
			hashrates.push(hr);
			let labels = [...hashrates.keys()];
			const canvas = document.getElementById("chartjs-0");
			canvas.style.backgroundColor = 'white';
			const myLineChart = new Chart(canvas, {
				type: 'line',
				data: {
					labels: labels,
					datasets: [{
						label: "Hash rates",
						data: hashrates,
						fill: false,
						borderColor: "rgb(75, 192, 192)",
						lineTension: 0.1
					}]
				},
				options: {
					animation: {
						duration: 0, // general animation time
					},
					hover: {
						animationDuration: 0, // duration of animations when hovering an item
					},
					responsiveAnimationDuration: 0, // animation duration after a resize
				}				
			});				
			if (hashrates.length > DATA_LENGTH) {
				hashrates.shift(); // pop if too long
			}			
		}		
		if (args.hasOwnProperty("peers")) {
			$("#dashboard-peers").html(args.peers);
		}					
		if (args.hasOwnProperty("block")) {
			$("#dashboard-block").html(args.block);
		}							
	});
	
});
