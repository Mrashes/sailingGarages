var popup = {
	object: {},
	popup: function() {
		$('#popup').html('<div class="popupContainer"><div class="popup"><button id="cancel" class="cancel">x</button><p>Title (required)</p><input type="text" name="title" id="title"><p>Description (required)</p><input type="text" name="description" id="description"><p>Dates (required)</p><input type="date" name="date" id="date"><p>Start Time (required)</p><input type="time" name="start" id="start"><p>End Time (required)</p><input type="time" name="end" id="end"><p>Location (required)</p><input type="text" name="location" id="location"><p>Keywords</p><input type="text" name="keyword" id="keyword"><div id="validate"></div><button id="submit">submit</button></div></div>')
	},

	validateChar : function(arg){
		var nameRegex = /^[a-zA-Z0-9,-:]+$/;
		var valid = $('#'+arg).val().match(nameRegex);
		if(valid == null){
		    $('#validate').html('<p>Only characters A-Z, a-z, 0-9, \'-\',  \':\', and \',\' are  acceptable.</p>');
		    return true;
		}
	},

	validateField: function() {
		//which fields you need
		var need = ['title', 'description', 'date', 'start', 'end', 'location']

		for (i=0; i<need.length; i++){
			//checks each need's value
			if ($('#'+need[i]).val() === ''){
				//if empty return false
				$('#validate').html('<p>Please fill in all fields</p>')
				console.log('broke at ' + need[i])
				return false
			}
			else if (popup.validateChar(need[i])) {
				console.log('broke at ' + need[i])
				return false
			}
			else if (need[i] === 'location') {
				console.log($('#'+need[i]).val())
				if (popup.apiCallToo($('#'+need[i]).val())){
					$('#validate').html('<p>Please use a Valid Address</p>')
					console.log('broke at ' + need[i])
					return false
				}
			}
		}
		setTimeout(console.log('end of main function'), 10000)
		setTimeout(popup.false, 10000)
	},

	submit: function() {
		//submits data to an object
		popup.object.title = $('#title').val();
		popup.object.description = $('#description').val();
		popup.object.date = $('#date').val();
		popup.object.start = $('#start').val();
		popup.object.end = $('#end').val();
		popup.object.location = $('#location').val();
		popup.object.keyword = $('#keyword').val();
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


	//need to build in promises, this doesn't work right now 6/25
	apiCallToo: function(arg) {
		$.ajax({
	      url: 'https://maps.googleapis.com/maps/api/geocode/json?address=' + arg,
	      method: 'GET'
	    }).done(function(response) {
	    	console.log(response.results);
	    	//this doesn't work.  Fix this.
	    	if (response.results === []){
	    		console.log('results work')
	    		return true
	    	}
	    	
		})
	},

	apiCall: function() {
		$.ajax({
	      url: 'https://maps.googleapis.com/maps/api/geocode/json?address=' + popup.object.location,
	      method: 'GET'
	    }).done(function(response) {
	    	//this pulls lat and lng data from maps api
	    	var lat = response.results[0].geometry.location.lat;
	    	var lng = response.results[0].geometry.location.lng;
	    	popup.object.lat = lat;
	    	popup.object.lng = lng;
	    	//runs the programs
    		app.addNewListing();
			popup.clearPopup()
			setTimeout(popup.clearInputs, 1000)
	    }); 
   	} 

}

//listeners
$(document).on('click', '#button', function() {
	popup.popup()
});

$(document).on('click', '#submit', function() {
	if (popup.validateField()){
		popup.submit();
		// popup.apiCall();
	}
	else {
		
	}
});

$(document).on('click', '#cancel', function() {
	popup.clearPopup()
});