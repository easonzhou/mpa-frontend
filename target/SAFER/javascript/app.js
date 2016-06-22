/**
 * Created by yinsheng on 2/3/16.
 */

var url = "http://localhost:6003";

/*
   (function(angular) {
   'use strict';
   angular.module('safermApp', [])
   .controller('selectorController', function($scope, $http) {
   $scope.data = {
   vesselSelect: null,
   availableVessels: []
   };

   $http({
   method: 'GET',
   url: url + "/imoids"
   }).then(function successCallback(response) {
   $scope.data.availableVessels = response.data;

   }, function errorCallback(response) {
   console.log(response)
   });
   });
   })(window.angular);
   */

/*
   function uploadFunction(){
   console.log("upload function called");
   $.ajax({
   method: 'POST',
   url: url + "/api/photo"
   }
   */

/* this is test */
/*
$('#uploadForm').ajaxForm({
    clearForm: true,
    dataType: 'json',
    success: function(res) {
        for(var key in res)
            sgGisMap.drawVesselTrajectory(res[key], key);

        $('.progress-bar').css('width', '0%').attr('aria-valuenow', 0);
        $(".fileinput-upload-button").addClass('hidden');
    },
    error: function(res) {
        alert(res.responseText);
        $('.progress-bar').css('width', '0%').attr('aria-valuenow', 0);
        $(".fileinput-upload-button").addClass('hidden');
    },
    uploadProgress: function(event, position, total, percentageComplete){
        $('.progress-bar').css('width', percentageComplete+'%').attr('aria-valuenow', percentageComplete);
    }
}); 
*/


function fileSelected(){
    $(".fileinput-upload-button").removeClass('hidden');
}
