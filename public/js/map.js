async function getKey() {
	let key = '';
	await fetch('/map/token').then((res) => res.json()).then((data) => {
		key = data;
	});

	return key;
}

/* async function getLatlng() {
	let lat = [];
	let long = [];
    let plot = { lat: lat, long: long };
    
    await fetch('/')
} */

async function loadMap() {
	const map = L.map('mapid').setView([ 42.350478, -71.105222 ], 15);
	let mapKey = '';

	await getKey()
		.then((result) => {
			mapKey = result;
		})
		.catch((err) => {
			console.log(err);
		});

	L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
		attribution:
			'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		maxZoom: 18,
		id: 'mapbox/streets-v11',
		tileSize: 512,
		zoomOffset: -1,
		accessToken: mapKey
	}).addTo(map);

	var marker = L.marker([ 42.350085, -71.10402 ]).addTo(map);

	var circle = L.circle([ 42.350085, -71.10402 ], {
		color: 'red',
		fillColor: '#f03',
		fillOpacity: 0.5,
		radius: 200
	}).addTo(map);

	marker.bindPopup('<a href="/sensor/rsf_node_Test"> Data </a>').openPopup();
}

loadMap();
