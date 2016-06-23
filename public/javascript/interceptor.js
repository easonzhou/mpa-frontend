var url = window.location.href;

var $ = require('jquery');

if(localStorage.length) {
    $('#login').text('Logout');
} else {
    var paths = url.split('/');
    var pageName = paths[paths.length - 1];
    if (pageName != '' && pageName != 'index.html')
        window.location = "index.html";
}

$('#login').click(function() {
    localStorage.clear();
    window.location = "index.html";
});
