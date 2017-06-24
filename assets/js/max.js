var max = {
	object: {},
	popup: function() {
		$('#popup').html('<div class="popup"><button id="cancel" class="cancel">x</button><p>Title</p><input type="text" name="title" id="title"><p>Description</p><input type="text" name="description" id="description"><p>Dates</p><input type="date" name="date" id="date"><p>Start Time</p><input type="time" name="start" id="start"><p>End Time</p><input type="time" name="end" id="end"><p>Location</p><input type="text" name="location" id="location"><p>Keywords</p><input type="text" name="keyword" id="keyword"><button id="submit">submit</button></div>')
	},
	submit: function() {
		max.object.title = $('#title').val();
		max.object.description = $('#description').val();
		max.object.date = $('#date').val();
		max.object.start = $('#start').val();
		max.object.end = $('#end').val();
		max.object.location = $('#location').val();
		max.object.keyword = $('#keyword').val();
	},

	clearInputs: function() {
		$('#keyword').val('');
		$('#location').val('');
		$('#end').val('');
		$('#start').val('');
		$('#date').val('');
		$('#description').val('');
		$('#title').val('');
		
	},

	clearPopup: function(){
		$('#popup').html('');
	},

	apiCall: function() {
		$.ajax({
	      url: 'https://maps.googleapis.com/maps/api/geocode/json?address=' + max.object.location,
	      method: 'GET'
	    }).done(function(response) {
	    	var lat = response.results[0].geometry.location.lat;
	    	var lng = response.results[0].geometry.location.lng;
	    	console.log(lat + "    " + lng);
	    	max.object.lat = lat;
	    	max.object.lng = lng;
    		app.addNewListing();
			max.clearPopup()
			setTimeout(max.clearInputs, 1000)
	    }); 
   	} 

}

$(document).on('click', '#button', function() {
	max.popup()
});

$(document).on('click', '#submit', function() {
	max.submit();
	max.apiCall();
});

console.log([1,2,3])