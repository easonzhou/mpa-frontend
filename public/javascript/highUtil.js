var $ = require('jquery');
$('.title').text('High Utilization');
require('leaflet');
require('heatmap.js');
var HeatmapOverlay = require('leaflet-heatmap.js');
var d3 = require('d3');
require("leaflet-heat.js");

function initiateHeatMapLayer () {
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
    return heatmapLayer;
}

function heatMapDataHelper(data) {
	console.log("setupHeatMap");
    var max = 0;
    for (var i = 0; i < data.length; i++) {
        if(data[i]['count'] > max)
            max = data[i]['count'];
    }

	var testData = {
		max: max,
		data: data
	};

    return testData;
}

/*
d3.csv('data/congestion_location.csv', function(data) {
    var timeIndex = 0;
    var heatmapLayer = initiateHeatMapLayer();
	for(var i = 0; i < data.length; i++) {
		data[i]['count'] = parseFloat(data[i]['count']);
		data[i]['lat'] = parseFloat(data[i]['lat']);
		data[i]['lng'] = parseFloat(data[i]['lng']);
	}

    var stData = d3.nest()
        .key(function(d) { return d.time })
        .entries(data)
        .map(function (d) {
            return d.values;
        });

	var baseLayer = L.tileLayer(
			'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
			attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
			maxZoom: 18
			}
	);

	var map = new L.Map('map', {
		//center: new L.LatLng(25.6586, -80.3568),
		center: new L.LatLng(1.248646, 103.833332),
		zoom: 12,
		layers: [baseLayer, heatmapLayer]
	});

	heatmapLayer.setData(heatMapDataHelper(stData[timeIndex]));

    setInterval(function(d){
        timeIndex++;
        if (timeIndex > stData.length - 1)
            timeIndex = 0;
        heatmapLayer.setData(heatMapDataHelper(stData[timeIndex]));
    }, 1000);
});

d3.csv('data/congestion_location_onetime.csv', function(data) {
	var maxCount = 0; 
	for(var i = 0; i < data.length; i++) {
		data[i]['count'] = parseFloat(data[i]['CumDensity']);
		data[i]['lat'] = parseFloat(data[i]['lat']);
		data[i]['lng'] = parseFloat(data[i]['long']);
		if(data[i]['count'] > maxCount)
			maxCount = data[i]['count'];
	}
    var input = [];
	for(var i = 0; i < data.length; i++) {
		data[i]['count'] = parseFloat(data[i]['CumDensity']);
		data[i]['lat'] = parseFloat(data[i]['lat']);
		data[i]['lng'] = parseFloat(data[i]['long']);
		if(data[i]['count'] > maxCount)
			maxCount = data[i]['count'];

    }
	for(var i = 0; i < data.length; i++) {
        input.push([
                      data[i]['lat'],
                      data[i]['lng'],
                      data[i]['count'] / maxCount
                    ]);
    }
	console.log(input);
    console.log(maxCount);
	setupHeatMapLayer(input, maxCount);
    //setupHeatMapLayerUsingHeatmapJS(data, maxCount);
});
*/

function setupHeatMapLayer(heat, map, input) { 
    // set up heatmap layer: heat is the heatmaplayer, map is the map hander, and input is the input data
    if (heat === null) {
        heat = L.heatLayer(input, {
            radius: 20
        }).addTo(map);
        console.log("heat setup");
    } else {
        heat.setLatLngs(input);
        console.log("heat reset latlng");
    }
    return heat;
}

function setUpMap() { 
    //set up base map for leaflet.heat
    var baseLayer = L.tileLayer(
            'https://api.mapbox.com/styles/v1/eason1986/ciqnaw19w001xcank8mkjf9da/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZWFzb24xOTg2IiwiYSI6ImNpaDBocTdpZjB3YjZ2b20zbThjanpxcnAifQ.6Zv4yRKxaCvZ03eGFksNBw',{
            attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
            maxZoom: 18
        }
    );

    var map = new L.Map('map', {
        center: new L.LatLng(1.248646, 103.833332),
        zoom: 12,
        layers: [baseLayer]
    });

    return map;
}

/*
 * This is the code using websocket for real-time heatmap
 * 
 */
/*
var stompClient = null;

function setConnected(connected) {
    document.getElementById('connect').disabled = connected;
    document.getElementById('disconnect').disabled = !connected;
    //document.getElementById('conversationDiv').style.visibility = connected ? 'visible' : 'hidden';
    //document.getElementById('response').innerHTML = '';
}

function connect() {
    var socket = new SockJS('/SAFER_REST/vmimReal');
    stompClient = Stomp.over(socket);
    var map = setUpMap();
    var heat = null;
    stompClient.connect({}, function(frame) {
        //setConnected(true);
        //console.log('Connected: ' + frame);
        stompClient.subscribe('/topic/vmim', function(vmim){
            var vmimJSON = JSON.parse(vmim.body);
            var data = vmimJSON.vmimData.map(function (d) {
                return [d.latDeg, d.longDeg];
            });
            console.log(data.length);
            heat = setupHeatMapLayer(heat, map, data);
        });
    });
}

function disconnect() {
    if (stompClient != null) {
        stompClient.disconnect();
    }
    setConnected(false);
    console.log("Disconnected");
}

connect();
*/

var map = setUpMap();

$.ajax({
    type : "POST",
    url : "/SAFER_REST/getHighUtilData",
    dataType: 'json',
    data: { startLogtime : '2015-10-29 08:00:00', endLogtime: '2015-10-29 09:00:00'},
    success : function(data) {
        var len = data.length;				
        if(len == 0) {
            alert("No VMIM Data");
        }
        data = data.map(obj => d3.values(obj))
                   .map(arr => [arr[1], arr[0]]);
        var heat = setupHeatMapLayer(null, map, data);
    },
    error: function( data ){
        alert("Error fetching VMIM data " + data.responseText);
    },
    async: true
});

