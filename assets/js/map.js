function initMap() {
        var chicago = {lat: 41.878, lng: -87.630};
        var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 10,
          center: chicago
        });
        var marker = new google.maps.Marker({
          position: chicago,
          map: map
        });
      };