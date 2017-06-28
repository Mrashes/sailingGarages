var popup = {
	object: {},
	//show popup
	popUp: function() {
		$('#event').show();
	},
	//hide popup
	popDown: function() {
		$('#event').hide()
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
			// else if (need[i] === 'location') {
			// 	console.log($('#'+need[i]).val())
			// 	if (popup.apiCallToo($('#'+need[i]).val())){
			// 		$('#validate').html('<p>Please use a Valid Address</p>')
			// 		console.log('broke at ' + need[i])
			// 		return false
			// 	}
			// }
		}
		//key for new event is already defined in addNewListing as key
		var currentUser = firebase.auth().hc;

		if (currentUser === null){
		        $('#validate').html("Please login");
		        return false;
		}
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
		popup.object.keyword = popup.object.keyword.toLowerCase().split(' ');
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
			popup.popDown()
			setTimeout(popup.clearInputs, 1000)
	    }); 
   	} 

}



//listeners
$(document).on('click', '#addEvent', function() {
	popup.popUp();
});

$(document).on('click', '#submit', function() {
	if (popup.validateField()){
		popup.submit();
		popup.apiCall();
	}
	else {
		
	}
});

$(document).on('click', '#cancel', function() {
	popup.popDown()
});