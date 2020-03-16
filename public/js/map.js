const map = L.map('mapid').setView([ 42.350478, -71.105222 ], 15);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
	attribution:
		'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
	maxZoom: 18,
	id: 'mapbox/streets-v11',
	tileSize: 512,
	zoomOffset: -1,
	accessToken: 'pk.eyJ1IjoieWNoZW4wMSIsImEiOiJjazd1bWRhbXAwbTJ4M21wMHRhOHVqeWx2In0.9T-xyeU47_JoFIjYMRzhWw'
}).addTo(map);

var marker = L.marker([ 42.350085, -71.10402 ]).addTo(map);

var circle = L.circle([ 42.350085, -71.10402 ], {
	color: 'red',
	fillColor: '#f03',
	fillOpacity: 0.5,
	radius: 200
}).addTo(map);

marker.bindPopup('<a href="/sensor/rsf_node_Test"> Data </a>').openPopup();