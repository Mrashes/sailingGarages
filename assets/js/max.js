var max = {
	object: {},
	popup: function() {
		$('#popup').html('<div class="popup"><button id="cancel" class="cancel">x</button><p>Title (required)</p><input type="text" name="title" id="title"><p>Description (required)</p><input type="text" name="description" id="description"><p>Dates (required)</p><input type="date" name="date" id="date"><p>Start Time (required)</p><input type="time" name="start" id="start"><p>End Time (required)</p><input type="time" name="end" id="end"><p>Location (required)</p><input type="text" name="location" id="location"><p>Keywords</p><input type="text" name="keyword" id="keyword"><button id="submit">submit</button></div>')
	},

	required: function() {
		//which fields you need
		var need = ['title', 'description', 'date', 'start', 'end', 'location']
		for (i=0; i<need.length; i++){
			//checks each need's value
			if ($('#'+need[i]).val() === ''){
				//if empty return false
				console.log('broke at ' + need[i])
				return false
			}
		}
		return true
	},

	submit: function() {
		//submits data to an object
		max.object.title = $('#title').val();
		max.object.description = $('#description').val();
		max.object.date = $('#date').val();
		max.object.start = $('#start').val();
		max.object.end = $('#end').val();
		max.object.location = $('#location').val();
		max.object.keyword = $('#keyword').val();
	},

	clearInputs: function() {
		//clear input field
		$('#keyword').val('');
		$('#location').val('');
		$('#end').val('');
		$('#start').val('');
		$('#date').val('');
		$('#description').val('');
		$('#title').val('');
		
	},

	clearPopup: function(){
		//clears the html
		$('#popup').html('');
	},

	apiCall: function() {
		$.ajax({
	      url: 'https://maps.googleapis.com/maps/api/geocode/json?address=' + max.object.location,
	      method: 'GET'
	    }).done(function(response) {
	    	//this pulls lat and lng data from maps api
	    	var lat = response.results[0].geometry.location.lat;
	    	var lng = response.results[0].geometry.location.lng;
	    	max.object.lat = lat;
	    	max.object.lng = lng;
	    	//runs the programs
    		app.addNewListing();
			max.clearPopup()
			setTimeout(max.clearInputs, 1000)
	    }); 
   	} 

}

//listeners
$(document).on('click', '#button', function() {
	max.popup()
});

$(document).on('click', '#submit', function() {
	if (max.required()){
		max.submit();
		max.apiCall();
	}
	else {
		alert('Please fill in all fields')
	}
});

$(document).on('click', '#cancel', function() {
	max.clearPopup()
});