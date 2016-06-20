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

$(".openbtn").click(function (){
    document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
    document.getElementsByClassName('overlap')[0].style.left = "0px";
});

$(".closebtn").click(function (){
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft= "0";
    document.getElementsByClassName('overlap')[0].style.left = "-180px";
});    

