var app ={
	//function to populate listing section of the database.
	addNewListing:function(){
		//Title of Listing
		var newName = popup.object.title;
		//Description
		var newDescription = popup.object.description;
		//Address - need to verify format required for Google Maps
		var newAddress = popup.object.location;
		//Date of Event
		var newDate = popup.object.date;
		//Keywords - assume we have array of keywords
		var newKeywords = popup.object.keyword;
		//times - need to agree on proper format
		var newStartTime =  popup.object.start;
		var newEndTime = popup.object.end;

	
		//Below are data fields that we may want to have once we add users functionality.  I've added these to the tree, we can use placeholder for time being.
		//organizer - username of listing organizer.  placeholder for now.
		var newOrganizer="placeholder";
		var newAttendeesCount = 0;

		//get a unique key to add a listings child.  I did this so we could iterate through arrays for 2nd children
		var key = firebase.database().ref().child("listings").push().getKey();
		
		//set basic variables for new child in firebase
		firebase.database().ref().child("listings/"+key).set({
			"name": newName,
			"description": newDescription,
			"date": newDate,
			"start_time":newStartTime,
			"end_time":newEndTime,
			"address":newAddress,
			"organizer":newOrganizer,
			"attendees_count":newAttendeesCount,
			"lat": popup.object.lat,
			"lng": popup.object.lng,
	  	});
		
		//set database for each keyword in keyword array
		for (var i=0;i<newKeywords.length;i++){
			var keyword = newKeywords[i];
		  	firebase.database().ref().child("listings/"+key+"/keywords").push().set(keyword);
		};
	},

	//function to populate user section of the database
	addNewUser:function(){
		var newUsername =$("#newUsername").val();
		var newPassword =$("#newPassword").val();
		var confirmPassword =$("#confirmNewPassword").val();		
		$("#error-submit").text("");
		if(newPassword === confirmPassword){
			firebase.auth().createUserWithEmailAndPassword(newUsername, newPassword).then(function(result){
				app.updateUsers();
			}).catch(function(error) {
				// Handle Errors here.
				var errorCode = error.code;
				var errorMessage = error.message;
				$("#error-submit").text(errorMessage);
			});	
		}
		else{
			$("#error-submit").text("Passwords do not match.  Please submit again");
		}
		
	},
	//this function updates users portion of firebaseDB with newUser ID
	updateUsers:function(){
		var newUsername =$("#newUsername").val();
		var key = firebase.auth().hc;
		//write whatever initial information we want for the user
		firebase.database().ref().child("users").child(key).set({
			"username": newUsername,
			"email": newUsername,
			"rating": 0,
			"numReviews":0,
		}).then(function(){
			$("#popup").html("");
		});
		
	},
	
	bubbleSortDate: function(array){
		return new Promise(
    	function (resolve, reject) {
			var newArray = array;
			sorted = true;
			for (var i = 0; i < newArray.length - 1; i++) {
				// if the value of the current index is less than the next index, we know
				// the list is not properly sorted and swap their positions.
				if (newArray[i].timeToStart > newArray[i + 1].timeToStart) {
					var temp = newArray[i];
					newArray[i] = newArray[i + 1];
					newArray[i + 1] = temp;
					sorted=false;
				}
				if(sorted===false){
					app.bubbleSortDate(newArray);
				}
			}
			resolve(newArray);
		});			
	},

	bubbleSortDistance: function(array){
		return new Promise(
    	function (resolve, reject) {
			var newArray = array;
			sorted = true;
			for (var i = 0; i < newArray.length - 1; i++) {
				// if the value of the current index is less than the next index, we know
				// the list is not properly sorted and swap their positions.
				if (newArray[i].distance > newArray[i + 1].distance) {
					var temp = newArray[i];
					newArray[i] = newArray[i + 1];
					newArray[i + 1] = temp;
					sorted=false;
				}
				if(sorted===false){
					app.bubbleSortDistance(newArray);
				}
			}
			resolve(newArray);
		});			
	},

	bubbleSortPopularity: function(array){
		return new Promise(
    	function (resolve, reject) {
			var newArray = array;
			sorted = true;
			for (var i = 0; i < newArray.length - 1; i++) {
				// if the value of the current index is less than the next index, we know
				// the list is not properly sorted and swap their positions.
				if (newArray[i].attendees_count < newArray[i + 1].attendees_count) {
					var temp = newArray[i];
					newArray[i] = newArray[i + 1];
					newArray[i + 1] = temp;
					sorted=false;
				}
				if(sorted===false){
					app.bubbleSortPopularity(newArray);
				}
			}
			resolve(newArray);
		});			
	},

	bubbleSortName: function(array){
		return new Promise(
    	function (resolve, reject) {
			var newArray = array;
			sorted = true;
			for (var i = 0; i < newArray.length - 1; i++) {
				// if the value of the current index is less than the next index, we know
				// the list is not properly sorted and swap their positions.
				if (newArray[i].name > newArray[i + 1].name) {
					var temp = newArray[i];
					newArray[i] = newArray[i + 1];
					newArray[i + 1] = temp;
					sorted=false;
				}
				if(sorted===false){
					app.bubbleSortName(newArray);
				}
			}
			resolve(newArray);
		});			
	},

	//adds distance to an array of listings objects based on userLocation
	calcDistance: function(userLat, userLng, filter){
		return new Promise(
    	function (resolve, reject) {
			//wait to get array of all the listings data 	
			app.getListings(filter).then(function(listingsArray) {
				//and add distance to each object
				for(var i=0;i<listingsArray.length;i++){
					var savedLat = listingsArray[i].lat;
					var savedLng = listingsArray[i].lng;
					listingsArray[i].distance = app.getDistanceInMi(savedLat, savedLng, userLat, userLng);
				}
				//console.log(listingsArray);
				resolve(listingsArray);
			});
		});
	},

	//sorts events on date to show ones which are occuring nearest to the future first
	dateSort:function(numResults, filter){
		app.getListings(filter).then(function(listingsArray){
			app.bubbleSortDate(listingsArray).then(function(array){
				var sortedArray = array;
				for(var i=0;i<numResults;i++){
					app.generateListItem(sortedArray[i]);
				}
			});
		});
	},

	//math function for getDistanceInMi function
	deg2rad:function(deg) {
		return deg * (Math.PI/180)
	},

	distanceSort:function(numResults, filter){
		//wait to get userLocation, then set lat, lng
		app.getUserLocation().then(function(location){
			var userLat = location[0];
			var userLng = location[1];
			//retrieve an array of listings with distances from user location
			app.calcDistance(userLat, userLng, filter).then(function(listingsArray){
				//sort the array of listings based on distance
				app.bubbleSortDistance(listingsArray).then(function(array){
					var sortedArray = array;
					for(var i=0;i<numResults;i++){
						app.generateListItem(sortedArray[i]);
					}
				});
			});
		});	
	},

	//this function generates the list of all of the sales in the firebase DB.
	generateListItem: function(listing, order){
		
			//make sure there are still listings to display
			if(listing !== undefined){
				//key of child branch (any buttons can have this as a data address to target this element in firebaseDB)
				var key = listing.key;
			}
			else
			{
				return;
			}
			

			//Container for a single list item
			var newListContainer = $("<div>");
			//sections to be included in container
			var title=$("<div>");
			var description=$("<div>");
			var date =$("<div>");
			var address=$("<div>");
			var time=$("<div>");
			var organizer =$("<div>");
			var rsvpBtn =$("<button>");
			var attendeesCount =$("<div>");

			//append different sections into container
			newListContainer.append(title);
			newListContainer.append(description);
			newListContainer.append(date);
			newListContainer.append(address);
			newListContainer.append(time);
			newListContainer.append(organizer);
			newListContainer.append(rsvpBtn);
			newListContainer.append(attendeesCount);

			rsvpBtn.attr("data-listing-id",key);
			rsvpBtn.addClass("js-rsvp");

			//set values in html tags
		 	title.text(listing.name);
		 	description.text(listing.description);
		 	date.text(listing.date);
		 	address.text(listing.address);
		 	time.text(listing.start_time +" to " + listing.end_time);
		 	organizer.text(listing.organizer);
		 	rsvpBtn.text("RSVP!");
		 	attendeesCount.text(listing.users_attending);
			
			//put content in list container depending on order of firebase results
			$("#list").append(newListContainer);
	},

	//calculates distance between two lat/lng pairs
	getDistanceInMi: function(lat1,lon1,lat2,lon2) {
				
		var R = 3959; // Radius of the earth in mi
		var dLat = app.deg2rad(lat2-lat1);  // deg2rad below
		var dLon = app.deg2rad(lon2-lon1); 
		var a = 
		Math.sin(dLat/2) * Math.sin(dLat/2) +
		Math.cos(app.deg2rad(lat1)) * Math.cos(app.deg2rad(lat2)) * 
		Math.sin(dLon/2) * Math.sin(dLon/2)
		; 
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		var d = R * c; // Distance in mi
		return d;
	},

	//function grabs all the listings from firebase and puts them in an array
	getListings: function(filter){
		return new Promise(
    	function (resolve, reject) {
			var firebaseURL = "https://sailinggarages.firebaseio.com/listings.json"
			var listingsArray = [];
			$.ajax({
				url: firebaseURL,
				method: "GET"
			}).done(function(data) {
				for (var i=0;i<Object.keys(data).length;i++){
					
					var key = Object.keys(data)[i];
					//set element of listing array to object i in JSON
					listing = data[key];
					//set key as new attribute since array won't have keys anymore.
					listing.key =key;
					
					var eventStartTime = moment(new Date(listing.date+ " "+ listing.start_time));
						var eventEndTime = moment(new Date(listing.date+ " "+ listing.end_time));
						var startVsCurrent= eventStartTime.diff(moment(),"days");
					var endVsCurrent= eventEndTime.diff(moment(),"days");
					
					//add additional time keys to each listing
					listing.timeToStart = startVsCurrent;

					//event has already ended
					if((endVsCurrent < 0) && (filter !== "in-progress")&&(filter!=="upcoming")){
						listingsArray.push(listing);
					}
					//event in-progress
					else if((startVsCurrent < 0) && (filter !== "upcoming")&&(filter!=="past")){
						listingsArray.push(listing);
					}
					//event hasn't started yet
					else if((startVsCurrent > 0)&&(filter !== "past")&&(filter!=="in-progress")){
						listingsArray.push(listing);
					}
				
				}
				resolve(listingsArray);
			});
		});
	},

	//function gets current user location and uses placeholder if it is not grabbed
	getUserLocation:function(){
		return new Promise(
    	function (resolve, reject) {	

			function success(position) {
				var crd = position.coords;
				userLat = crd.latitude;
				userLng = crd.longitude;
				resolve([userLat, userLng]);	
			};

			function error(err) {
				//placeholder lat/lng in case user doesn't allow geolocation
				var userLat = 41.878;
				var userLng = -87.630;
				console.warn(`ERROR(${err.code}): ${err.message}`);
			};

			//get user's current location
			navigator.geolocation.getCurrentPosition(success, error);
		});
	},

	//this function will attempt to authenticate user based on login information.  if successful will resolve value for get user data
	loginUser:function(){
			var username =$("#username").val();
			var password =$("#password").val();

			firebase.auth().signInWithEmailAndPassword(username, password).then(function(result){
				$("#popup").html("");
				firebase.database().ref().child("users").child(firebase.auth().hc).on("value",function(snapshot){
					//show any information you want about the user...
					console.log(username);
				});

			}).catch(function(error) {
				// Handle Errors here.
				var errorCode = error.code;
				var errorMessage = error.message;
				// ...
				$("#error-login").text(errorMessage);
			});			
	},

	//sorts events on names to show in alphabetic order
	nameSort:function(numResults,filter){
		app.getListings(filter).then(function(listingsArray){
			app.bubbleSortName(listingsArray).then(function(array){
				var sortedArray = array;
				for(var i=0;i<numResults;i++){
					app.generateListItem(sortedArray[i]);
				}
			});
		});
	},
	
	loginUserForm:function(){
		var popupContainer = $("<div>");
		var userInformation = $("<div>");
		var userName = $("<input>");
		var password = $("<input>");
		var submit =$("<button>");
		var cancel =$("<button>");
		var addUser =$("<button>");
		var error=$("<div>");

		popupContainer.addClass("popup");

		userInformation.text("Login with your email and password");
		userName.attr("placeholder", "username");
		userName.attr("id", "username");
		password.attr("placeholder", "password");
		password.attr("id", "password");
		submit.text("Login");
		submit.attr("id", "login-user-submit");
		cancel.text("Cancel");
		cancel.attr("id", "cancel-user-submit");
		addUser.text("Add New User");
		addUser.attr("id", "add-user-submit");
		error.attr("id", "error-login");
		
		popupContainer.append(userInformation);
		userInformation.append(userName);
		userInformation.append(password);
		userInformation.append(submit);
		userInformation.append(cancel);
		userInformation.append(addUser);
		userInformation.append(error);
		$("#popup").append(popupContainer);	
	},

	newUserForm:function(){
		var popupContainer = $("<div>");
		var userInformation = $("<div>");
		var userName = $("<input>");
		var password = $("<input>");
		var confirmPassword = $("<input>");
		var submit =$("<button>");
		var cancel =$("<button>");
		var error=$("<div>");

		popupContainer.addClass("popup");

		userInformation.text("Create new account with your email and password");
		userName.attr("placeholder", "username");
		userName.attr("id", "newUsername");
		password.attr("placeholder", "password");
		password.attr("id", "newPassword");
		confirmPassword.attr("placeholder", "confirm password");
		confirmPassword.attr("id", "confirmNewPassword");
		submit.text("Create Account");
		submit.attr("id", "create-user-submit");
		cancel.text("Cancel");
		cancel.attr("id", "cancel-user-submit");
		error.attr("id", "error-submit");
		
		popupContainer.append(userInformation);
		userInformation.append(userName);
		userInformation.append(password);
		userInformation.append(confirmPassword);
		userInformation.append(submit);
		userInformation.append(cancel);
		userInformation.append(error);
		$("#popup").append(popupContainer);	
	},
	
	//sort results based on the "attendees_count field"
	popularitySort:function(numResults, filter){
		app.getListings(filter).then(function(listingsArray){
			app.bubbleSortPopularity(listingsArray).then(function(array){
				var sortedArray = array;
				for(var i=0;i<numResults;i++){
					app.generateListItem(sortedArray[i]);
				}
			});
		});
	},

	//this function adds one to the attendees count when user clicks RSVP button
	rsvp:function(){
		//listener function for all of the rsvp buttons
		$('body').on("click", ".js-rsvp", function () {
			
			//key for the specific listing user clicks on
			var listingKey = $(this).attr("data-listing-id");
			var attendeesCount=null;

			firebase.database().ref().child("listings/"+listingKey).on("value", function(snapshot) {
					attendeesCount = snapshot.val().attendees_count;
			}, function (errorObject) {
					console.log("The read failed: " + errorObject.code);
			});

			attendeesCount++;

			firebase.database().ref().child("listings/"+listingKey).update({
					attendees_count:attendeesCount,
				});
		});
	},

	search:function(){
		
		$("#list").html("");

		var numResults = $("#results-count").val();
		var orderResults = $("#results-order").val();
		var filter = $("#results-filter").val();
		
		var rootRef = firebase.database().ref("listings");

		if (orderResults ==="popularity"){
			this.popularitySort(numResults, filter);
		}
		else if (orderResults ==="closest"){
			this.distanceSort(numResults, filter);
		}
		else if (orderResults ==="name"){
			this.nameSort(numResults, filter);
		}
		else if (orderResults ==="happening-soon"){
			this.dateSort(numResults, filter);
		}

		//TODO: return for the map function
		//time, time, address, lat, lng
		//waiting on requirements from Jeremy
	},	
};

firebase.initializeApp(config);

$(document).on("click","#search", function(){
	app.search();
	app.rsvp();
})

$(document).on('click', '#login', function() {
	app.loginUserForm();

});

$(document).on('click', '#add-user-submit', function() {
	app.newUserForm();

});

$(document).on('click', '#login-user-submit', function() {
	app.loginUser()
});

$(document).on('click', '#create-user-submit', function() {
	app.addNewUser();
});

$(document).on('click', '#cancel-user-submit', function() {
	$("#popup").html("");
});