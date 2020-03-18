const socket = io();

socket.on('update', (state) => {
	console.log('receiving state');
	console.log(state);
	if (state) {
		console.log('Updating Chart');
		updateChart();
	}

})

const battChart = $('#battChart');
const snrChart = $('#snrChart');
const teqChart = $('#teqChart');
const dev_id = document.getElementById('dev-id').textContent.trim();
let range = 1;

let sensor = {
	batt: [],
	snr1: [],
	snr2: [],
	snr3: [],
	snr4: [],
	teq1: [],
	teq2: [],
	teq3: [],
	teq4: [],
	date: []
};

// parse all the DB data to datasets for graphing
async function parseData(sensor, range) {
	// parse past 24 hours
	if (range === 1) {
		console.log('Parsing day');
		await fetch('/chart').then((res) => res.json()).then((data) => {
			const sensors = data.data;
			console.log(dev_id);
			sensors.forEach((sensorObj) => {
				if (sensorObj.dev_id.trim().localeCompare(dev_id) === 0) {
					sensor.batt.push(sensorObj.batt);
					sensor.snr1.push(sensorObj.snr1);
					sensor.snr2.push(sensorObj.snr2);
					sensor.snr3.push(sensorObj.snr3);
					sensor.snr4.push(sensorObj.snr4);
					sensor.teq1.push(sensorObj.teq1);
					sensor.teq2.push(sensorObj.teq2);
					sensor.teq3.push(sensorObj.teq3);
					sensor.teq4.push(sensorObj.teq4);
					sensor.date.push(moment.utc(sensorObj.date).local().format('dd HH:mm:ss'));
				}
			});
		});
	} else {
		console.log('Parsing week');
		await fetch('/chart/week').then((res) => res.json()).then((data) => {
			const sensors = data.data;
			console.log(dev_id);
			sensors.forEach((sensorObj) => {
				if (sensorObj.dev_id.trim().localeCompare(dev_id) === 0) {
					sensor.batt.push(sensorObj.batt);
					sensor.snr1.push(sensorObj.snr1);
					sensor.snr2.push(sensorObj.snr2);
					sensor.snr3.push(sensorObj.snr3);
					sensor.snr4.push(sensorObj.snr4);
					sensor.teq1.push(sensorObj.teq1);
					sensor.teq2.push(sensorObj.teq2);
					sensor.teq3.push(sensorObj.teq3);
					sensor.teq4.push(sensorObj.teq4);
					sensor.date.push(moment.utc(sensorObj.date).local().format('ddd:HH:mm:ss'));
				}
			});
		});
	}
}

const charts = createChart();

async function createChart() {
	// wait for all data to be parsed then create charts
	// default parse range is past 24 hrs
	await parseData(sensor, 1);

	// create charts
	const batt_Chart = new Chart(battChart, {
		type: 'line',
		data: {
			labels: sensor.date,
			datasets: [
				{
					label: 'Battery Status',
					fill: false,
					lineTension: 0.3,
					backgroundColor: 'rgb(0, 184, 148)',
					borderColor: 'rgb(0, 184, 148)',
					data: sensor.batt
				}
			]
		},
		options: {
			scales: {
				xAxes: [
					{
						scaleLabel: {
							display: true,
							labelString: 'Time (24 Hours)'
						}
					}
				],
				yAxes: [
					{
						ticks: {
							// Include a dollar sign in the ticks
							callback: function(value, index, values) {
								return value + '%';
							},
							beginAtZero: false
						},
						scaleLabel: {
							display: true,
							labelString: 'Percentage'
						}
					}
				]
			}
		}
	});

	const snr_Chart = new Chart(snrChart, {
		type: 'line',
		data: {
			labels: sensor.date,
			datasets: [
				{
					label: 'SNR 1',
					fill: false,
					lineTension: 0.3,
					backgroundColor: 'rgb(214, 48, 49)',
					borderColor: 'rgb(214, 48, 49)',
					data: sensor.snr1
				},
				{
					label: 'SNR 2',
					fill: false,
					lineTension: 0.3,
					backgroundColor: 'rgb(9, 132, 227)',
					borderColor: 'rgb(9, 132, 227)',
					data: sensor.snr2
				},
				{
					label: 'SNR 3',
					fill: false,
					lineTension: 0.3,
					backgroundColor: 'rgb(0, 206, 201)',
					borderColor: 'rgb(0, 206, 201)',
					data: sensor.snr3
				},
				{
					label: 'SNR 4',
					fill: false,
					lineTension: 0.3,
					backgroundColor: 'rgb(253, 203, 110)',
					borderColor: 'rgb(253, 203, 110)',
					data: sensor.snr4
				}
			]
		},
		options: {
			scales: {
				xAxes: [
					{
						scaleLabel: {
							display: true,
							labelString: 'Time (24 Hours)'
						}
					}
				],
				yAxes: [
					{
						ticks: {
							beginAtZero: false
						},
						scaleLabel: {
							display: true,
							labelString: 'SNR Value'
						}
					}
				]
			}
		}
	});

	const teq_Chart = new Chart(teqChart, {
		type: 'line',
		data: {
			labels: sensor.date,
			datasets: [
				{
					label: 'TEQ 1',
					fill: false,
					lineTension: 0.3,
					backgroundColor: 'rgb(214, 48, 49)',
					borderColor: 'rgb(214, 48, 49)',
					data: sensor.teq1
				},
				{
					label: 'TEQ 2',
					fill: false,
					lineTension: 0.3,
					backgroundColor: 'rgb(9, 132, 227)',
					borderColor: 'rgb(9, 132, 227)',
					data: sensor.teq2
				},
				{
					label: 'TEQ 3',
					fill: false,
					lineTension: 0.3,
					backgroundColor: 'rgb(0, 206, 201)',
					borderColor: 'rgb(0, 206, 201)',
					data: sensor.teq3
				},
				{
					label: 'TEQ 4',
					fill: false,
					lineTension: 0.3,
					backgroundColor: 'rgb(253, 203, 110)',
					borderColor: 'rgb(253, 203, 110)',
					data: sensor.teq4
				}
			]
		},
		options: {
			scales: {
				xAxes: [
					{
						scaleLabel: {
							display: true,
							labelString: 'Time (24 Hours)'
						}
					}
				],
				yAxes: [
					{
						ticks: {
							beginAtZero: false
						},
						scaleLabel: {
							display: true,
							labelString: 'TEQ Value'
						}
					}
				]
			}
		}
	});

	return { batt_Chart: batt_Chart, snr_Chart: snr_Chart, teq_Chart: teq_Chart };
}

async function updateChart(range) {
	sensor = {
		batt: [],
		snr1: [],
		snr2: [],
		snr3: [],
		snr4: [],
		teq1: [],
		teq2: [],
		teq3: [],
		teq4: [],
		date: []
	};
	await parseData(sensor, range);

	charts
		.then((chartsObj) => {
			chartsObj.batt_Chart.data.labels = sensor.date;
			chartsObj.batt_Chart.data.datasets[0].data = sensor.batt;
			chartsObj.batt_Chart.update();

			chartsObj.snr_Chart.data.labels = sensor.date;
			chartsObj.snr_Chart.data.datasets.forEach((dataset, i) => {
				switch (i) {
					case 0:
						dataset.data = sensor.snr1;
						break;
					case 1:
						dataset.data = sensor.snr2;
						break;
					case 2:
						dataset.data = sensor.snr3;
						break;
					default:
						dataset.data = sensor.snr4;
				}
			});
			chartsObj.snr_Chart.update();

			chartsObj.teq_Chart.data.labels = sensor.date;
			chartsObj.teq_Chart.data.datasets.forEach((dataset, i) => {
				switch (i) {
					case 0:
						dataset.data = sensor.teq1;
						break;
					case 1:
						dataset.data = sensor.teq2;
						break;
					case 2:
						dataset.data = sensor.teq3;
						break;
					default:
						dataset.data = sensor.teq4;
				}
			});
			chartsObj.teq_Chart.update();
		})
		.catch((err) => {
			console.log(err);
		});
}

async function updateChart() {
	console.log(`Range: ${range}`);
	sensor = {
		batt: [],
		snr1: [],
		snr2: [],
		snr3: [],
		snr4: [],
		teq1: [],
		teq2: [],
		teq3: [],
		teq4: [],
		date: []
	};
	await parseData(sensor, range);

	charts
		.then((chartsObj) => {
			chartsObj.batt_Chart.data.labels = sensor.date;
			chartsObj.batt_Chart.data.datasets[0].data = sensor.batt;
			chartsObj.batt_Chart.update();

			chartsObj.snr_Chart.data.labels = sensor.date;
			chartsObj.snr_Chart.data.datasets.forEach((dataset, i) => {
				switch (i) {
					case 0:
						dataset.data = sensor.snr1;
						break;
					case 1:
						dataset.data = sensor.snr2;
						break;
					case 2:
						dataset.data = sensor.snr3;
						break;
					default:
						dataset.data = sensor.snr4;
				}
			});
			chartsObj.snr_Chart.update();

			chartsObj.teq_Chart.data.labels = sensor.date;
			chartsObj.teq_Chart.data.datasets.forEach((dataset, i) => {
				switch (i) {
					case 0:
						dataset.data = sensor.teq1;
						break;
					case 1:
						dataset.data = sensor.teq2;
						break;
					case 2:
						dataset.data = sensor.teq3;
						break;
					default:
						dataset.data = sensor.teq4;
				}
			});
			chartsObj.teq_Chart.update();
		})
		.catch((err) => {
			console.log(err);
		});
}

function weekChart() {
	range = 7;
	updateChart(range);
}

function dayChart() {
	range = 1;
	updateChart(range);
}
