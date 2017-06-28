function initMap(array) {

        //console.log(array);
        var chicago = {lat: 41.878, lng: -87.630};
        //creates map centered on chicago

        var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 14,
          center: chicago
        });
        
        //adds starting "home" marker in chicago
        var marker = new google.maps.Marker({
          position: chicago,
          map: map
        });
        
        //creates an info window on home marker
        var infoWindow = new google.maps.InfoWindow({
          content:"Your location"
        });
        //makes the info window appear upon clicking the marker
        google.maps.event.addListener(marker, 'click', function() {
          infoWindow.open(map,marker);
        });

    
//location array
    if (array===undefined){

    }
    else {

       //a for loop that...
        for (var i = 0; i < array.length; i++) {
          var latitude=array[i].lat;
          var longitude=array[i].lng;
          //creates a new marker at every location in the locations array
          
          var newMarker = new google.maps.Marker({        
            position: {lat: latitude, lng: longitude},
            map: map
          });
          //creates an info window on the new markers
          var newInfoWindow = new google.maps.InfoWindow({
            content: array[i].name+"<br>"+array[i].date+"<br>"+array[i].start_time+"<br>"+array[i].address
          });

          // newInfoWindow.open(map,newMarker);

          //makes the info window appear upon clicking the marker
          google.maps.event.addListener(newMarker, 'click', (function(newMarker, newInfoWindow) {
            return function() {
              newInfoWindow.open(map,newMarker);
            }
          })(newMarker, newInfoWindow));

        };
    }
/*---------------------------------------------------------------------------
    //Dummy location array
    /*var locations=[{lat: 41.897, lng: -87.620}, {lat: 41.898, lng: -87.621}, {lat: 41.899, lng: -87.622}];
        
        //a for loop that...
        for (var i = 0; i < locations.length; i++) {
          //creates a new marker at every location in the locations array
          var newMarker = new google.maps.Marker({        
            position: locations[i],
            map: map
          });
          //creates an info window on the new markers
          var newInfoWindow = new google.maps.InfoWindow({
            content:"Test-Name"+"<br>"+"Test-Details"+"<br>"+"Test-Location"
          });

          // newInfoWindow.open(map,newMarker);

          //makes the info window appear upon clicking the marker
          google.maps.event.addListener(newMarker, 'click', (function(newMarker, newInfoWindow) {
            return function() {
              newInfoWindow.open(map,newMarker);
            }
          })(newMarker, newInfoWindow));

        };*/


}
   
