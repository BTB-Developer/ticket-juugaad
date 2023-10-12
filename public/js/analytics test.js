// Sample data for the graph

fetch("/getGraphRecords")
    .then((res) => res.json())
    .then(({ result, data }) => {
        let labels = [];
        let graphData = [];

        data.forEach((currentObject) => {
            labels.push(currentObject.revenueGraph.month);
            graphData.push(currentObject.revenueGraph.revenue);
        });

        var graphDataToRepresent = {
            labels: labels,
            datasets: [
                {
                    label: "Revenue of month",
                    data: graphData,
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1,
                },
            ],
        };

        var options = {
            responsive: true,
            maintainAspectRatio: false,
        };

        var ctx = document.getElementById("views-graphic").getContext("2d");

        var chart = new Chart(ctx, {
            type: "line",
            data: graphDataToRepresent,
            options: options,
        });

        document.getElementById("selectGraphToShow").addEventListener("change", (e) => {
            labels = [];
            graphData = [];
            if (e.target.value === "revenue") {
                chart.data.datasets[0].label = "Revenue of month";
                data.forEach((currentObject) => {
                    labels.push(currentObject.revenueGraph.month);
                    graphData.push(currentObject.revenueGraph.revenue);
                });
            } else if (e.target.value === "orders") {
                chart.data.datasets[0].label = "Orders of month";
                data.forEach((currentObject) => {
                    labels.push(currentObject.orderGraph.month);
                    graphData.push(currentObject.orderGraph.orders);
                });
            }
            // else if (e.target.value === "pageviews") {
            //     // This is wrong data display
            //     data.forEach((currentObject) => {
            //         chart.data.datasets[0].label = "Page Views of month";
            //         // This is wrong data display
            //         labels.push(currentObject.revenueGraph.month); // This is wrong data display
            //         graphData.push(currentObject.revenueGraph.revenue); // This is wrong data display
            //     }); // This is wrong data display
            // }
            else if (e.target.value === "ticketsales") {
                chart.data.datasets[0].label = "Ticket Sales of month";
                data.forEach((currentObject) => {
                    labels.push(currentObject.ticketGraph.month);
                    graphData.push(currentObject.ticketGraph.tickets);
                });
            }
            chart.label = labels;
            chart.data.datasets[0].data = graphData;
            chart.update();
        });
    })
    .catch((error) => {
        console.log(error);
    });

// var data = {
//     labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
//     datasets: [
//         {
//             label: "Revenue of month",
//             data: [100, 200, 150, 250, 180, 73296], // Replace with your actual data
//             backgroundColor: "rgba(75, 192, 192, 0.2)",
//             borderColor: "rgba(75, 192, 192, 1)",
//             borderWidth: 1,
//         },
//     ],
// };

// // Configuration options for the chart
// var options = {
//     responsive: true,
//     maintainAspectRatio: false,
// };

// // Get the canvas element where the chart will be drawn
// var ctx = document.getElementById("views-graphic").getContext("2d");

// // Create the chart
// var chart = new Chart(ctx, {
//     type: "line",
//     data: data,
//     options: options,
// });
