var popup = {
	//object to stash files while async functions are occuring to ensure they all get sent
	object: {},

	//function to populate listing section of the database.
	addNewListing:function(){
		//Title of Listing
		var newName = popup.object.title;
		//Description
		var newDescription = popup.object.description;
		//Address - need to verify format required for Google Maps
		var newAddress = popup.object.location;
		//Date of Event start and end
		var newDate = popup.object.date;
		var newEndDate = popup.object.endDate
		//Keywords - assume we have array of keywords
		var newKeywords = popup.object.keyword;
		//times - need to agree on proper format
		var newStartTime =  popup.object.start;
		var newEndTime = popup.object.end;
		var newImage = popup.object.imgURL;
	
		//Below are data fields that we may want to have once we add users functionality.  I've added these to the tree, we can use placeholder for time being.
		//organizer - username of listing organizer.  placeholder for now.
		var newAttendeesCount = 0;

		//get a unique key to add a listings child.  I did this so we could iterate through arrays for 2nd children
		var key = firebase.database().ref().child("listings").push().getKey();
		//also save the listing to the user who is hosting the listing
		var currentUser = firebase.auth().hc;

		firebase.database().ref().child("users").child(currentUser).child("hosting").push(key);
		
		//set basic variables for new child in firebase
		firebase.database().ref().child("listings/"+key).set({
			"name": newName,
			"description": newDescription,
			"date": newDate,
			"endDate": newEndDate,
			"start_time":newStartTime,
			"end_time":newEndTime,
			"address":newAddress,
			"organizer":currentUser,
			"attendees_count":newAttendeesCount,
			"lat": popup.object.lat,
			"lng": popup.object.lng,
			"imgURL": popup.object.imgURL
	  	});
		
		//set database for each keyword in keyword array
		for (var i=0;i<newKeywords.length;i++){
			var keyword = newKeywords[i];
		  	firebase.database().ref().child("listings/"+key+"/keywords").push().set(keyword);
		};
	},

	//this checks for valid characters in a field
	validateChar : function(arg){
		var nameRegex = /^[a-zA-Z0-9':,()\ \-]+$/;
		var valid = $('#'+arg).val().match(nameRegex);
		if(valid == null){
		    $('#validate').html("<p>Please use valid characters in line "+arg+"</p>");
		    return true;
		}
	},

	//this verifies all required fields
	validateField: function() {
		return new Promise(
			function(resolve, reject) {
				var need = ['title', 'description', 'date','start', 'end', 'location']

				for (i=0; i<need.length; i++){
					//checks each need's value
					if ($('#'+need[i]).val() === ''){
						//if empty return false
						$('#validate').html('<p>Please fill in '+need[i]+'</p>')
						reject(false);
					}
					else if (popup.validateChar(need[i])) {
						reject(false);
					}
					else if (need[i] === 'location') {
						popup.apiCallToo($('#location').val()).then(function(results) {
							if (results) {
								$('#validate').html('<p>Please use a valid address on location</p>')
								reject(false);
							}
						})
					}
				};
				//key for new event is already defined in addNewListing as key
				var currentUser = firebase.auth().hc;

				if (currentUser === null){
				        $('#validate').html("Please login");
				        reject(false);
				}
				else{
					resolve(true);
				}
		});
	},

	submit: function() {
		//submits data to an object
		popup.object.title = $('#title').val();
		popup.object.description = $('#description').val();
		popup.object.date = $('#date').val();
		popup.object.endDate = $('#endDate').val();
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
		$('#endDate').val('')
		$('#description').val('');
		$('#title').val('');
		
	},

	//verify real address and not gobble D gook
	apiCallToo: function(arg) {
		return new Promise(
			function(resolve, reject) {
				$.ajax({
			      url: 'https://maps.googleapis.com/maps/api/geocode/json?address=' + arg,
			      method: 'GET'
			    }).done(function(response) {
			    	//They use weird status codes so I have incoporated if there are zero results to allow error correction
			    	if (response.status === 'ZERO_RESULTS'){
			    		resolve(true) ;
			    	}
			    	else {
						resolve(false);
					}
				})
			})
	},

	//This ajax call converts address given to lat long from google maps
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
    		this.addNewListing();
			setTimeout(popup.clearInputs, 1000)
	    }); 
   	},
	   	// imageuploader, sends this all to firebase
	imageUploader: function() {
		return new Promise(
		function(resolve, reject) {
			//this all establishes where the file is going in firebase
			var storage = firebase.storage();
			var storageRef = storage.ref();
			//if file is added
			
			var fileName = document.getElementById('fileInput').files[0].name;
			var imagesRef = storageRef.child('images/'+fileName);
			var file = document.getElementById('fileInput').files[0]

			// Create the file metadata
			var metadata = {
			  contentType: document.getElementById('fileInput').files[0].type
			};

			// Upload file and metadata to the object 'images/mountains.jpg'
			var uploadTask = imagesRef.put(file, metadata);

			// Listen for state changes, errors, and completion of the upload.
			uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
			  function(snapshot) {
			    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
			    var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
			    console.log('Upload is ' + progress + '% done');
			    switch (snapshot.state) {
			      case firebase.storage.TaskState.PAUSED: // or 'paused'
			        console.log('Upload is paused');
			        break;
			      case firebase.storage.TaskState.RUNNING: // or 'running'
			        console.log('Upload is running');
			        break;
			    }
			    $('#fileInput').val('')
			  }, function(error) {

			  // A full list of error codes is available at
			  // https://firebase.google.com/docs/storage/web/handle-errors
			  switch (error.code) {
			    case 'storage/unauthorized':
			      // User doesn't have permission to access the object
			      reject();
			      break;

			    case 'storage/canceled':
			      // User canceled the upload
			      reject();
			      break;

			    case 'storage/unknown':
			      // Unknown error occurred, inspect error.serverResponse
			      reject();
			      break;
			  }
			}, function() {
			  // Upload completed successfully, now we can get the download URL
			  popup.object.imgURL = uploadTask.snapshot.downloadURL;
			  resolve();
			});
		})
	},
}


