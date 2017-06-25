$(document).ready(function() {

	var app ={
		//function to populate listing section of the database.
		addNewListing:function(){
			//Title of Listing

			var newName =$('#title').val();
			//Description
			var newDescription = $('#description').val('');
			//Address - need to verify format required for Google Maps
			var newAddress = $('#location').val('');
			//Date of Event
			var newDate = $('#date').val('');;
			//Keywords - assume we have array of keywords
			var newKeywords = $('#keyword').val();
			//times - need to agree on proper format
			var newStartTime = max.object.start = $('#start').val();
			var newEndTime = max.object.end = $('#end').val();

		
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
		  	});
			
			//set database for each keyword in keyword array
			for (var i=0;i<newKeywords.length;i++){
				var keyword = newKeywords[i];
			  	firebase.database().ref().child("listings/"+key+"/keywords").push().set(keyword);
			};
			max.clearInput();

		},

		//function to populate user section of the database
		addNewUser:function(){
			//All of this is placeholder information for now, just getting it set up so we can add to the DB easily when we finalize functionality
			var newUsername ="tstorti";
			var newPassword ="password";
			//Contact Info - not important for functionality we've discussed, may be useful for display purposes
			var newFirstName="Tony";
			var newLastName="Storti";
			var newEmail = "tonystorti@gmail.com";
			
			//Listings - create array with any listings that user posted
			var userListings = [];
			//Attending - have array with any listings that user is attending
			var userAttending = [];
		
			//rating - just a placeholder value for now
			var newRating = 0;
			
			//set basic variables for new child in firebase
			firebase.database().ref().child("users").push().set({
				"username": newUsername,
				"password": newPassword,
				"contact": {
					"first_name": newFirstName,
					"last_name": newLastName,
					"email":newEmail,
				},
				"rating":newRating,
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
			
			var rootRef = firebase.database().ref("listings");

			if (orderResults ==="popularity"){
				this.popularitySort(numResults);
			}
			else if (orderResults ==="closest"){
				this.distanceSort(numResults);
			}
			else if (orderResults ==="name"){
				this.nameSort(numResults);
			}
			else if (orderResults ==="happening-soon"){
				this.dateSort(numResults);
			}

			//need to return for the map function
			//time, time, address, lat, lng
			
		},
		
		
		//math function for getDistanceInMi function
		deg2rad:function(deg) {
			return deg * (Math.PI/180)
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
		bubbleSortDate: function(array){
			return new Promise(
        	function (resolve, reject) {
				var newArray = array;
				sorted = true;
				for (var i = 0; i < newArray.length - 1; i++) {
					// if the value of the current index is less than the next index, we know
					// the list is not properly sorted and swap their positions.
					if (newArray[i].timeToStart < newArray[i + 1].timeToStart) {
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

		//function grabs all the listings from firebase and puts them in an array
		getListings: function(){
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
						listingsArray[i] = data[key];
						//set key as new attribute since array won't have keys anymore.
						listingsArray[i].key =key;
					}
					resolve(listingsArray);
				});
			});

			
		},
		//adds distance to an array of listings objects based on userLocation
		calcDistance: function(userLat, userLng){
			return new Promise(
        	function (resolve, reject) {
				//wait to get array of all the listings data 	
				app.getListings().then(function(listingsArray) {
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
		//adds a status key with past, in-progress, or future value depending on current time
		calcDateDiff: function(){
			return new Promise(
        	function (resolve, reject) {
				//wait to get array of all the listings data 	
				app.getListings().then(function(listingsArray) {
					//and add distance to each object
					for(var i=0;i<listingsArray.length;i++){
					
						var eventStartTime = moment(new Date(listingsArray[i].date+ " "+ listingsArray[i].start_time));
 						var eventEndTime = moment(new Date(listingsArray[i].date+ " "+ listingsArray[i].end_time));
 						var startVsCurrent= eventStartTime.diff(moment(),"minutes");
						var endVsCurrent= eventEndTime.diff(moment(),"minutes");
						
						if(endVsCurrent < 0){
							listingsArray[i].status = "past";
							listingsArray[i].timeToStart = startVsCurrent;
						}
						else if(startVsCurrent < 0){
							listingsArray[i].status = "in-progress";
							listingsArray[i].timeToStart = startVsCurrent;
						}
						else{
							listingsArray[i].status = "future";
							listingsArray[i].timeToStart = startVsCurrent;
						}
						
					}
					resolve(listingsArray);
				});
			});
		},

		distanceSort:function(numResults){
			//wait to get userLocation, then set lat, lng
			app.getUserLocation().then(function(location){
				var userLat = location[0];
				var userLng = location[1];
				//retrieve an array of listings with distances from user location
				app.calcDistance(userLat, userLng).then(function(listingsArray){
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
		//sorts events on date to show ones which are occuring nearest to the future first
		dateSort:function(numResults){
			//retrieve an array of listings with distances from user location
			app.calcDateDiff().then(function(listingsArray){
				//sort the array of listings based on distance
				app.bubbleSortDate(listingsArray).then(function(array){
					var sortedArray = array;
					for(var i=0;i<numResults;i++){
						app.generateListItem(sortedArray[i]);
					}
				});
			});
		},

		//sort results based on the "attendees_count field"
		popularitySort:function(numResults){
			app.getListings().then(function(listingsArray){
				app.bubbleSortPopularity(listingsArray).then(function(array){
					var sortedArray = array;
					for(var i=0;i<numResults;i++){
						app.generateListItem(sortedArray[i]);
					}
				});
			});
		},
		//sorts events on names to show in alphabetic order
		nameSort:function(numResults){
			app.getListings().then(function(listingsArray){
				app.bubbleSortName(listingsArray).then(function(array){
					var sortedArray = array;
					for(var i=0;i<numResults;i++){
						app.generateListItem(sortedArray[i]);
					}
				});
			});
		},

	};
	
	firebase.initializeApp(config);
	
	$("#search").on("click", function(){
		app.search();
		app.rsvp();
	});
	

});