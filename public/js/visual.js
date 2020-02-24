const chart = document.getElementById('lineChart');

let lineChart = new Chart(chart, {
	type: 'line',
	data: {
		labels: [ 'January', 'February', 'March', 'April', 'May', 'June', 'July' ],
		datasets: [
			{
				label: 'SNR Values',
				backgroundColor: 'rgb(255, 99, 132)',
				borderColor: 'rgb(255, 99, 132)',
				fill: false,
				lineTension: 0.1,
				data: [ 100, 10, 20, 60, 20, 30, 45 ]
			}
		]
	},
	options: {
		scales: {
			yAxes: [
				{
					ticks: {
						beginAtZero: true
					}
				}
			]
		}
	}
});
