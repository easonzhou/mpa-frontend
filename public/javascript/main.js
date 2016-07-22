var $ = require('jquery');

$(".openbtn").click(function (){
    document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
    $(".overlap").css("left", "0px");
    $(".overlapSlider").css("left", "0px");

});

$(".closebtn").click(function (){
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft= "0";
    $(".overlap").css("left", "-180px");
    // since the jquery css is applied to the dom style attribute so we need to remove that attribute after applying the original position. Give back the control to css
    $('.overlap').removeAttr("style");
    $(".overlapSlider").css("left", "-980px");
    // since the jquery css is applied to the dom style attribute so we need to remove that attribute after applying the original position. Give back the control to css
    $('.overlapSlider').removeAttr("style");
});    

