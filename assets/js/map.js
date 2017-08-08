//temporary center and zoom for map (will update as user moves map)
var mapCenter = {lat: 41.878, lng: -87.630};
var zoom = 14;

function initMap(array,numResults) {

  //creates map centered on chicago
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: zoom,
    center: mapCenter
  });
  
  //listener to update the center and zoom based on whatever the user changes
  google.maps.event.addListener(map, 'bounds_changed', function() {
    var newLat = map.getCenter().lat();
    var newLng = map.getCenter().lng();
    zoom = map.getZoom(); 
    mapCenter = {lat: newLat, lng: newLng};    
  });

//location array
  if (array!==undefined){
      //set variable to place certain number of markers on the map
      var markerCount = null;
      if(numResults ==="all"){
          markerCount=array.length;
        }
        else{
          if (numResults<array.length){
            markerCount=numResults;
          }
          else{
            markerCount=array.length;
          }
        }
     //a for loop that...
      for (var i = 0; i < markerCount; i++) {
        var latitude=array[i].lat;
        var longitude=array[i].lng;
        //creates a new marker at every location in the locations array
        
        var newMarker = new google.maps.Marker({        
          position: {lat: latitude, lng: longitude},
          map: map,
        });
        //creates an info window on the new markers
        var newInfoWindow = new google.maps.InfoWindow({
          content: "<div class='blacktext'><div>" +array[i].name+"</div><div>"+array[i].date+"</div><div>"+array[i].start_time+"</div><div>"+array[i].address+"</div></div>",
        });

        //makes the info window appear upon clicking the marker
        google.maps.event.addListener(newMarker, 'click', (function(newMarker, newInfoWindow) {
          return function() {
            newInfoWindow.open(map,newMarker);
          }
        })(newMarker, newInfoWindow));

      };
  }
};
   
