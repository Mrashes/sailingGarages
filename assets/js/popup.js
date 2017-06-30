//#TODO
//Location handling


var popup = {
	object: {},
	//show popup
	popUp: function() {
		$('#event').show();
		$("#login-popup").hide();
		$("#newUser-popup").hide();
	},
	//hide popup
	popDown: function() {
		$('#event').hide()
		$("#newUser-popup").hide();
		$("#login-popup").hide();
	},

	validateChar : function(arg){
		var nameRegex = /^[a-zA-Z0-9':, \-]+$/;
		var valid = $('#'+arg).val().match(nameRegex);
		if(valid == null){
		    $('#validate').html("<p>Only characters A-Z, a-z, 0-9, '-',  ':', ''', and ',' are  acceptable.</p>");
		    return true;
		}
	},

	validateField: function() {
		//which fields you need
		var need = ['title', 'description', 'date', 'endDate','start', 'end', 'location']

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

	//need to build in promises, this doesn't work right now 6/25
	//worke	d a bit to incorporate promises but dunno is acurate
	// apiCallToo: function(arg) {
	// 	new Promise(
	// 		function(resolve, reject) {
	// 			$.ajax({
	// 		      url: 'https://maps.googleapis.com/maps/api/geocode/json?address=' + arg,
	// 		      method: 'GET'
	// 		    }).done(function(response) {
	// 		    	console.log(response.results);
	// 		    	//this doesn't work.  Fix this.
	// 		    	if (response.results === []){
	// 		    		console.log('results work')
	// 		    		resolve(return true)
	// 		    	}
	// 		    	else {
	// 					reject(Error("It broke"));
	// 				}
	// 			})
	// 		})
	// },


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
   	},
}

//listeners
$(document).on('click', '#addEvent', function() {
	popup.popUp();
});

$(document).on('click', '#submit', function() {
	if (popup.validateField()) {
		popup.submit();
		popup.apiCall();
	}
});

$(document).on('click', '.cancel', function() {
	popup.popDown()
});

$(document).on('click', '.popupContainer', function() {
	popup.popDown();
});

//Firebase image upload
// Create a root reference


// console.log(imagesRef.name === spaceRef.name)
// console.log(imagesRef.fullPath === spaceRef.fullPath)

// imageuploader
var imageUploader = function() {
	//I was told to do this all from firebase but I have no idea what it all was.
	var storage = firebase.storage();
	var storageRef = storage.ref();
	var fileName = document.getElementById('fileInput').files[0].name;
	var imagesRef = storageRef.child('images/'+fileName);
	var spaceRef = imagesRef.child(fileName);
	var path = spaceRef.fullPath;
	var nameBase = spaceRef.name;
	var imagesRef = spaceRef.parent;
	// Create a reference to 'mountains.jpg'
	var refName = fileName;

	var file = document.getElementById('fileInput').files[0]

	// Create a reference to 'images/mountains.jpg'
	var imagesRef = 'images/'+fileName;

	// Create the file metadata
	var metadata = {
	  contentType: document.getElementById('fileInput').files[0].type
	};

	// Upload file and metadata to the object 'images/mountains.jpg'
	var uploadTask = storageRef.child('images/' + refName).put(file, metadata);

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
	  }, function(error) {

	  // A full list of error codes is available at
	  // https://firebase.google.com/docs/storage/web/handle-errors
	  switch (error.code) {
	    case 'storage/unauthorized':
	      // User doesn't have permission to access the object
	      break;

	    case 'storage/canceled':
	      // User canceled the upload
	      break;

	    case 'storage/unknown':
	      // Unknown error occurred, inspect error.serverResponse
	      break;
	  }
	}, function() {
	  // Upload completed successfully, now we can get the download URL
	  var downloadURL = uploadTask.snapshot.downloadURL;
	});
}
