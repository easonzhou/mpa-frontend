var $ = require('jquery');
$('.title').text('High Utilization');
require('leaflet');
var d3 = require('d3');
require("leaflet.heat");
var vis = require('vis');

var heat = null;
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
var arrItems = [
		{id: 1, content: '08:00~09:00 2015-10-29', start: '2015-10-29 08:00:00', end: '2015-10-29 09:00:00'},
		{id: 2, content: '09:00~10:00 2015-10-29', start: '2015-10-29 09:00:00', end: '2015-10-29 10:00:00'},
		{id: 3, content: '10:00~11:00 2015-10-29', start: '2015-10-29 10:00:00', end: '2015-10-29 11:00:00'},
		{id: 4, content: '11:00~12:00 2015-10-29', start: '2015-10-29 11:00:00', end: '2015-10-29 12:00:00'},
		{id: 5, content: '12:00~13:00 2015-10-29', start: '2015-10-29 12:00:00', end: '2015-10-29 13:00:00'},
		{id: 6, content: '13:00~14:00 2015-10-29', start: '2015-10-29 13:00:00', end: '2015-10-29 14:00:00'},
		{id: 7, content: '14:00~15:00 2015-10-29', start: '2015-10-29 14:00:00', end: '2015-10-29 15:00:00'},
		{id: 8, content: '15:00~16:00 2015-10-29', start: '2015-10-29 15:00:00', end: '2015-10-29 16:00:00'},
		{id: 9, content: '16:00~17:00 2015-10-29', start: '2015-10-29 16:00:00', end: '2015-10-29 17:00:00'},
		{id: 10, content: '17:00~18:00 2015-10-29', start: '2015-10-29 17:00:00', end: '2015-10-29 18:00:00'},
		{id: 11, content: '18:00~19:00 2015-10-29', start: '2015-10-29 18:00:00', end: '2015-10-29 19:00:00'},
		{id: 12, content: '19:00~20:00 2015-10-29', start: '2015-10-29 19:00:00', end: '2015-10-29 20:00:00'},
]
// Create a DataSet (allows two way data-binding)
var items = new vis.DataSet(arrItems);

function setUpSlider() {
	// DOM element where the Timeline will be attached
	var container = document.getElementById('sliderVis');

	// Configuration for the Timeline
	var options = {};

	// Create a Timeline
	var timeline = new vis.Timeline(container, items, options);
	timeline.setSelection([1]);
	timeline.on('select', function (properties) {
		var startTime = arrItems[properties.items[0] - 1].start;
		var endTime = arrItems[properties.items[0] - 1].end;
		showHeatMap(startTime, endTime);
	});
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

function showHeatMap(startTime, endTime) {
	spinner.show();
	$.ajax({
		type : "POST",
		url : "/SAFER_REST/getHighUtilData",
		dataType: 'json',
		data: { startLogtime : startTime, endLogtime: endTime},
		success : function(data) {
			spinner.hide();
			var len = data.length;				
			if(len == 0) {
				alert("No VMIM Data");
			}
			data = data.map(obj => d3.values(obj))
				.map(arr => [arr[1], arr[0]]);
			heat = setupHeatMapLayer(heat, map, data);
		},
		error: function( data ){
			spinner.hide();
			alert("Error fetching VMIM data " + data.responseText);
		},
		async: true
	});
}
var map = setUpMap();
var spinner = $('.loading');
setUpSlider();
showHeatMap('2015-10-29 08:00:00', '2015-10-29 09:00:00');
