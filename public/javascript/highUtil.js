var $ = require('jquery');
$('.title').text('High Utilization');
require('leaflet');
var d3 = require('d3');
require("leaflet.heat");

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

