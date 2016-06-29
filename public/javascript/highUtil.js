var $ = require('jquery');
$('.title').text('High Utilization');
require('leaflet');
require('heatmap.js');
var HeatmapOverlay = require('leaflet-heatmap.js');
var d3 = require('d3');

function setupHeatMapLayer(data, maxValue) {
	console.log("setupHeatMap");
	var testData = {
		max: maxValue,
		data: data
	};
	var baseLayer = L.tileLayer(
			'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
			attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
			maxZoom: 18
			}
	);

	var cfg = {
		// radius should be small ONLY if scaleRadius is true (or small radius is intended)
		"radius": .01,
		"maxOpacity": .8, 
		// scales the radius based on map zoom
		"scaleRadius": true, 
		// if set to false the heatmap uses the global maximum for colorization
		// if activated: uses the data maximum within the current map boundaries 
		//   (there will always be a red spot with useLocalExtremas true)
		"useLocalExtrema": true,
		// which field name in your data represents the latitude - default "lat"
		latField: 'lat',
		// which field name in your data represents the longitude - default "lng"
		lngField: 'lng',
		// which field name in your data represents the data value - default "value"
		valueField: 'count'
	};


	var heatmapLayer = new HeatmapOverlay(cfg);

	var map = new L.Map('map', {
		//center: new L.LatLng(25.6586, -80.3568),
		center: new L.LatLng(1.248646, 103.833332),
		zoom: 12,
		layers: [baseLayer, heatmapLayer]
	});

	heatmapLayer.setData(testData);

	// make accessible for debugging
	layer = heatmapLayer;
}

d3.csv('data/congestion_location_onetime.csv', function(data) {
	var maxCount = 0;
	for(var i = 0; i < data.length; i++) {
		data[i]['count'] = parseFloat(data[i]['CumDensity']);
		data[i]['lat'] = parseFloat(data[i]['lat']);
		data[i]['lng'] = parseFloat(data[i]['long']);
		if(data[i]['count'] > maxCount)
			maxCount = data[i]['count'];
	}
	console.log(data);
	setupHeatMapLayer(data, maxCount);
});
