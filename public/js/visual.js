const battChart = $('#battChart');
const snrChart = $('#snrChart');
const teqChart = $('#teqChart');
const dev_id = document.getElementById('dev-id').textContent.trim();

const parseData = function(sensor) {
	fetch('/sensor').then((res) => res.json()).then((data) => {
		const sensors = data.data;
		console.log(dev_id);
		console.log(sensors);
		sensors.forEach((sensorObj) => {
			if (sensorObj.dev_id.trim().localeCompare(dev_id) === 0) {
				console.log('pushing');
				sensor.batt.push(sensorObj.batt);
				sensor.snr1.push(sensorObj.snr1);
				sensor.snr2.push(sensorObj.snr2);
				sensor.snr3.push(sensorObj.snr3);
				sensor.snr4.push(sensorObj.snr4);
				sensor.teq1.push(sensorObj.teq1);
				sensor.teq2.push(sensorObj.teq2);
				sensor.teq3.push(sensorObj.teq3);
				sensor.teq4.push(sensorObj.teq4);
				sensor.date.push(sensorObj.date);
			}
		});

		console.log(sensor);
	});
};

const createCharts = async function() {
	const sensor = {
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

	await parseData(sensor);

	const batt_Chart = new Chart(battChart, {
		type: 'line',
		data: {
			labels: sensor.date,
			datasets: [
				{
					label: 'Battery Status',
					fill: false,
					backgroundColor: 'rgb(0, 184, 148)',
					borderColor: 'rgb(0, 184, 148)',
					data: sensor.batt
				}
			]
		},
		options: {
			scales: {
				yAxes: [
					{
						ticks: {
							beginAtZero: false
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
					backgroundColor: 'rgb(214, 48, 49)',
					borderColor: 'rgb(214, 48, 49)',
					data: sensor.snr1
				},
				{
					label: 'SNR 2',
					fill: false,
					backgroundColor: 'rgb(9, 132, 227)',
					borderColor: 'rgb(9, 132, 227)',
					data: sensor.snr2
				},
				{
					label: 'SNR 3',
					fill: false,
					backgroundColor: 'rgb(0, 206, 201)',
					borderColor: 'rgb(0, 206, 201)',
					data: sensor.snr3
				},
				{
					label: 'SNR 4',
					fill: false,
					backgroundColor: 'rgb(253, 203, 110)',
					borderColor: 'rgb(253, 203, 110)',
					data: sensor.snr4
				}
			]
		},
		options: {
			scales: {
				yAxes: [
					{
						ticks: {
							beginAtZero: false
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
					backgroundColor: 'rgb(214, 48, 49)',
					borderColor: 'rgb(214, 48, 49)',
					data: sensor.teq1
				},
				{
					label: 'TEQ 2',
					fill: false,
					backgroundColor: 'rgb(9, 132, 227)',
					borderColor: 'rgb(9, 132, 227)',
					data: sensor.teq2
				},
				{
					label: 'TEQ 3',
					fill: false,
					backgroundColor: 'rgb(0, 206, 201)',
					borderColor: 'rgb(0, 206, 201)',
					data: sensor.teq3
				},
				{
					label: 'TEQ 4',
					fill: false,
					backgroundColor: 'rgb(253, 203, 110)',
					borderColor: 'rgb(253, 203, 110)',
					data: sensor.teq4
				}
			]
		},
		options: {
			scales: {
				yAxes: [
					{
						ticks: {
							beginAtZero: false
						}
					}
				]
			}
		}
	});
};

$('#charts').ready(function() {
	createCharts();

	console.log('ready!');
});
