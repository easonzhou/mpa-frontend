var attempt = 3; //Variable to count number of attempts
var $ = require('jquery');

//Below function Executes on click of login button
function validate(){
	var username = document.getElementById("username").value;
	var password = document.getElementById("password").value;
    
    $.ajax({
        type : "POST",
        url : "http://localhost:8080/SAFER_REST/checkLogin",
        dataType: 'json',
        data: { userId : username, pass: password},
        success : function(data) {
            var len = data.length;        
            console.log(data);
            if (data.hasOwnProperty('error'))
                alert(data.error);
            if( data.isValidLogin == true ) {
		        alert ("Login successfully");
                localStorage.setItem('userId', data.userId);
                localStorage.setItem('userModules', data.userModules);
		        window.location = "map.html"; //redirecting to other page
		        return false;
            } else {
	        	attempt --;//Decrementing by one
	        	alert("Invalid username and password! You have left "+attempt+" attempt;");
	        	
	        	//Disabling fields after 3 attempts
	        	if( attempt == 0){
	        		document.getElementById("username").disabled = true;
	        		document.getElementById("password").disabled = true;
	        		document.getElementById("submit").disabled = true;
	        		return false;
	        	}
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
