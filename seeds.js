const mongoose = require('mongoose'),
	csv = require('csv-parser'),
	fs = require('fs'),
	Tree = require('./models/tree');

function seedDB() {
	fs.readdir('./synthetic_data/', (err, subDir) => {
		if (err) {
			console.log(err);
		}

		subDir.forEach((dir) => {
			console.log(dir);
			fs.readdir(`./synthetic_data/${dir}`, (err, filenames) => {
				if (err) {
					console.log(err);
				}
				let data = [];
				filenames.forEach((file) => {
					fs
						.createReadStream(`./synthetic_data/${dir}/${file}`)
						.pipe(csv())
						.on('data', (row) => data.push(row))
						.on('end', () => {
							const latestData = data.slice(-1)[0];
							const newTree = {
								forest: dir,
								name: file.split('.')[0],
								time: latestData.time,
								hpv10: latestData.hpv10,
								hpv20: latestData.hpv20,
								hpv35: latestData.hpv35,
								hpv50: latestData.hpv50,
								batt: latestData.batt
							};

							Tree.create(newTree, (err, result) => {
								if (err) {
									console.log(err);
								} else {
									console.log(result);
								}
							});

							console.log('CSV file successfully processed');
						});
				});
			});
		});
	});
}

module.exports = seedDB;
