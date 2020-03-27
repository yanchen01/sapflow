let mapKey = '';
let nodes = [];
let dev_id = [];

async function getKey() {
	await fetch('/map/token').then((res) => res.json()).then((data) => {
		mapKey = data.key;
	});
}

async function getLatlng() {
	await fetch('/map').then((res) => res.json()).then((data) => {
		console.log(data);
		data.data.forEach((doc) => {
			if (!dev_id.includes(doc.dev_id)) {
				dev_id.push(doc.dev_id);
				const node = { dev_id: doc.dev_id, lat: doc.lat, long: doc.long };
				nodes.push(node);
			}
		});
	});
}

async function loadMap() {
	const map = L.map('mapid').setView([ 42.350478, -71.105222 ], 15);

	await getKey();

	L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
		attribution:
			'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		maxZoom: 18,
		id: 'mapbox/streets-v11',
		tileSize: 512,
		zoomOffset: -1,
		accessToken: mapKey
	}).addTo(map);

    await getLatlng();
    
    let markers = [];

	nodes.forEach((node) => {
		if (node.lat != undefined && node.long != undefined) {
			const marker = L.marker([ node.lat, node.long ]).addTo(map)
			marker.bindPopup(` <p> Device ID: ${node.dev_id} </p>
			<p> Latitude: ${node.lat} &nbsp; Longitude: ${node.long} </p>
			<p> <a href="/sensor/${node.dev_id}"> See Sensor Data </a> </p>`);
			markers.push(marker);
		}
	});

	const circle = L.circle([ 42.350085, -71.10402 ], {
		color: 'green',
		fillColor: '#0aad72',
		fillOpacity: 0.4,
		radius: 400
	}).addTo(map);
	
	circle.bindPopup(`<h6> Forest Number: 1 </h6>`)
}

loadMap();
