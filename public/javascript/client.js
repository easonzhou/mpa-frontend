var $ = require('jquery');
var map = require('./sgGisMap.js');
var ui = require('./ui.js');
var simulationEngine = require('./simulationEngine.js');

ui.setUpBindingButtons();

map.drawSgGisMap(function(){
    $.get("/api/data/", function(data, status){
//    $.get("http://localhost:8080/SAFER/sample", function(data, status){
        simulationEngine.animate(data, 1435037400);
    });
    console.log("Drawing finishes!");
	map.initCanvasOverlay();
});

$('.title').text('Sense Making');

