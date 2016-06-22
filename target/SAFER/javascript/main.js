var $ = require('jquery');

$(".openbtn").click(function (){
    document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
    $(".overlap").css("left", "0px");

});

$(".closebtn").click(function (){
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft= "0";
    $(".overlap").css("left", "-180px");
    $('.overlap').removeAttr("style");
});    

if(localStorage.length)
    $('#login').text('Logout');

$('#login').click(function() {
    localStorage.clear();
    window.location = "login.html";
})
