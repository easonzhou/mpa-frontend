var $ = require('jquery');
$('form').submit(false);

 
//Below function Executes on click of login button
function validate(){
	var username = document.getElementById("username").value;
	var password = document.getElementById("password").value;
    
    $.ajax({
        type : "POST",
        url : "/SAFER_REST/checkLogin",
        dataType: 'json',
        data: { userId : username, pass: password},
        success : function(data) {
            var len = data.length;        
            if (data.hasOwnProperty('error')) {
                $(".alert-danger").show("slow");
                return false;
            }
            if( data.isValidLogin == true ) {
                localStorage.setItem('userId', data.userId);
                localStorage.setItem('userModules', data.userModules);
		        window.location = "map.html"; //redirecting to other page
		        return false;
            } else {
                $(".alert-warning").show("slow");
		        return false;
            }

        }
    });

	//if ( username == "mpa" && password == "mpa"){
	//	alert ("Login successfully");
	//	window.location = "map.html"; //redirecting to other page
	//	return false;
	//}
	//else{
	//	attempt --;//Decrementing by one
	//	alert("You have left "+attempt+" attempt;");
	//	
	//	//Disabling fields after 3 attempts
	//	if( attempt == 0){
	//		document.getElementById("username").disabled = true;
	//		document.getElementById("password").disabled = true;
	//		document.getElementById("submit").disabled = true;
	//		return false;
	//	}
	//}
}

$('#submit').click(validate);
$('.title').text('SAFER');
$('.title').css("width", "100px");
