var app ={
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

	//function to populate user section of the database
	addNewUser:function(){
		var newUsername =$("#newUsername").val();
		var newPassword =$("#newPassword").val();
		var confirmPassword =$("#confirmNewPassword").val();		
		$("#error-submit").text("");
		if(newPassword === confirmPassword){
			firebase.auth().createUserWithEmailAndPassword(newUsername, newPassword).then(function(result){
				app.updateUsers();
				$("#newUser-popup").hide();
				var user = firebase.auth().currentUser;

				user.sendEmailVerification().then(function() {
  					// Email sent.
  					console.log("email sent")
				}, function(error) {
  					// An error happened.
				});
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
				
				resolve(listingsArray);
			});
		});
	},

	//this function allows user to cancel an event from the profile screen if they are the organizer
	cancelEvent:function(clicked){
		//key for the specific listing user clicks on
		var listingKey = $(clicked).attr("data-listing-id");

		//set attribute of cancelled to true
		firebase.database().ref().child("listings").child(listingKey).update({
			cancelled:true,
		});

		//refresh profile without cancelled listings
		this.populateProfile();		
	},

	//this function updates the page display based on on if a user is logged in or not
	changeUserStatus:function(){
		if(firebase.auth().hc===null){
			$("#login-label").text("Login");
			$("#profile").attr("style","visibility: hidden");
		}
		else{
			$("#login-label").text("Logout");
			$("#profile").attr("style","visibility: visible");
		}
	},

	//this function displays all the saved comments for a particular event
	commentsThread:function(clicked){
		$("#comments-popup").show();
		$("#comments").html("");
		//key for the specific listing user clicks on
		var listingKey = $(clicked).attr("data-listing-id");
		//update submit button data attribute so correct listing can be updated on submit comment
		$("#comments-submit").attr("data-listing-id",listingKey);	
		var currentUser = firebase.auth().hc;

		//show selected event name
		firebase.database().ref().child("listings").child(listingKey).once("value", function(snapshot) {
			$("#comments-name").text(snapshot.val().name);
		});

		//show all comments for the event
		firebase.database().ref().child("listings").child(listingKey).child("comments").on("child_added", function(snapshot) {
			//if no comments have been made yet
			if(snapshot!==null){
				var newComment = snapshot.val();
				var newCommentLine = $("<div>");
				newCommentLine.text(newComment);			
				$("#comments").append(newCommentLine);
			}
				
		}, function (errorObject) {
				console.log("The read failed: " + errorObject.code);
		});
	},

	//this function adds new user input to the comments thread with a timestamp
	commentsThreadAdd:function(clicked){
		var listingKey = $(clicked).attr("data-listing-id");
		var currentUser = firebase.auth().hc;
		var currentUsername = null;

		if (currentUser === null){
			alert("user not logged in");
		}
		else{
			//get current user name
			firebase.database().ref().child("users").child(currentUser).once("value", function(snapshot) {
				currentUsername = snapshot.val().username.split("@")[0];
				var newComment = moment().format("MM-DD-YYYY hh:mm A")+" "+ currentUsername + ": " + $("#comments-new").val();
				var newCommentLine = $("<div>");
				$("#comments-new").val("")
				//save new comments to table
				firebase.database().ref().child("listings").child(listingKey).child("comments").push(newComment);
			});
		}
	},

	//sorts events on date to show ones which are occuring nearest to the future first
	dateSort:function(numResults, filter){
		app.getListings(filter).then(function(listingsArray){
			app.bubbleSortDate(listingsArray).then(function(array){
				var sortedArray = array;
				initMap(sortedArray,numResults);
				if(numResults ==="all"){
					for(var i=0;i<sortedArray.length;i++){
						app.generateListItem(sortedArray[i]);
					}
				}
				else{
					for(var i=0;i<numResults;i++){
						app.generateListItem(sortedArray[i]);
					}
				}
				
			});
		});
	},

	//math function for getDistanceInMi function
	deg2rad:function(deg) {
		return deg * (Math.PI/180)
	},

	//this function sorts results based on the distance from user location and any filters applied to search
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
					initMap(sortedArray,numResults);
					if(numResults ==="all"){
						for(var i=0;i<sortedArray.length;i++){
							app.generateListItem(sortedArray[i]);
						}
					}
					else{
						for(var i=0;i<numResults;i++){
							app.generateListItem(sortedArray[i],"distance");
						}
					}
				});
			});
		});	
	},

	//this function generates the list of all of the sales in the firebase DB.
	generateListItem: function(listing, type){
		
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
			var newListItemContainer = $("<div>");
			var expandedItemContainer=$("<div>");
			//sections to be included in container
			var containerName=$("<div>");
			var containerAddress=$("<div>");
			var containerDate=$("<div>");
			var containerStartTime=$("<div>");
			var containerEndTime=$("<div>");
			var containerShow=$("<div>");
			var containerOrganizer=$("<div>");
			var containerAttendees=$("<div>");
			var containerDescription=$("<div>");
			var containerImage=$("<div>");
			var containerKeywords=$("<div>");
			var containerDistance=$("<div>");
			var containerRSVP=$("<div>");
			var containerComments=$("<div>");
			var nameHeader=$("<strong>");
			var addressHeader=$("<strong>");
			var dateHeader=$("<strong>");
			var startTimeHeader=$("<strong>");
			var endTimeHeader=$("<strong>");
			var organizerHeader=$("<strong>");
			var attendeesHeader=$("<strong>");
			var descriptionHeader=$("<strong>");
			var imageHeader=$("<strong>");
			var keywordsHeader=$("<strong>");
			var distanceHeader=$("<strong>");
			var name=$("<p>");
			var address=$("<p>");
			var date=$("<p>");
			var startTime=$("<p>");
			var endTime=$("<p>");
			var organizer=$("<p>");
			var attendees=$("<p>");
			var description=$("<p>");
			var image=$("<img>");
			var keywords=$("<p>");
			var distance=$("<p>");
			var commentsBtn=$("<button>");
			var rsvpBtn=$("<button>");
			var showBtn=$("<button>");
			//add classes per designer requirements
			newListItemContainer.addClass("sale");
			containerName.addClass("saleName");
			containerAddress.addClass("saleAddress");
			containerDate.addClass("saleDate");
			containerStartTime.addClass("saleStart");
			containerEndTime.addClass("saleEnd");
			containerOrganizer.addClass("saleOrganizer");
			containerAttendees.addClass("saleAttendees");
			containerDescription.addClass("saleDescription");
			containerImage.addClass("saleImage");
			containerKeywords.addClass("saleKeywords");
			containerDistance.addClass("saleDistance");
			rsvpBtn.addClass("rsvpBtn");
			showBtn.addClass("showBtn");
			commentsBtn.addClass("commentsBtn");

			//append different sections into subsection containers
			containerName.append(nameHeader);
			containerName.append(name);
			containerAddress.append(addressHeader);
			containerAddress.append(address);
			containerDate.append(dateHeader);
			containerDate.append(date);
			containerStartTime.append(startTimeHeader);
			containerStartTime.append(startTime);
			containerEndTime.append(endTimeHeader);
			containerEndTime.append(endTime);
			containerShow.append(showBtn);
			containerOrganizer.append(organizerHeader);
			containerOrganizer.append(organizer);
			containerAttendees.append(attendeesHeader);
			containerAttendees.append(attendees);
			containerDescription.append(descriptionHeader);
			containerDescription.append(description);
			containerImage.append(imageHeader);
			containerImage.append(image);
			containerKeywords.append(keywordsHeader);
			containerKeywords.append(keywords);
			containerDistance.append(distanceHeader);
			containerDistance.append(distance);
			containerComments.append(commentsBtn);
			containerRSVP.append(rsvpBtn);
			containerComments.append(rsvpBtn);

			//append subsections to primary containers
			newListItemContainer.append(containerName);
			newListItemContainer.append(containerAddress);
			newListItemContainer.append(containerDate);
			newListItemContainer.append(containerStartTime);
			newListItemContainer.append(containerEndTime);
			newListItemContainer.append(expandedItemContainer);
			expandedItemContainer.append(containerOrganizer);
			expandedItemContainer.append(containerAttendees);
			expandedItemContainer.append(containerDescription);	
			expandedItemContainer.append(containerKeywords);
			expandedItemContainer.append(containerDistance);
			//if there is an image for the event, add it to the expanded list view with link
		 	if (listing.imgURL !== null){
		 		image.attr('data-url', listing.imgURL);
		 		image.attr("id","image-"+key);
		 		image.attr('class', 'image');
		 		expandedItemContainer.append(containerImage);
		 	}
			expandedItemContainer.append(containerRSVP);
			expandedItemContainer.append(containerComments);
			newListItemContainer.append(containerShow);

			//apply id information relative to listing so container data is interactive for click events
			expandedItemContainer.attr("id","expand-"+key);
			showBtn.addClass("js-expand");
			showBtn.attr("data-listing-id", key);
			showBtn.attr("data-visibility", "hide");
			rsvpBtn.attr("data-listing-id",key);
			rsvpBtn.addClass("js-rsvp");
			commentsBtn.attr("data-listing-id",key);
			commentsBtn.addClass("js-comments");
			attendees.attr("id","attendees-"+key);

			//set label values in html tags
		 	nameHeader.text("Name: ");
		 	addressHeader.text("Address: ");
		 	dateHeader.text("Date: ");
		 	startTimeHeader.text("Start Time: ");
		 	endTimeHeader.text("End Time: ");
		 	organizerHeader.text("Organizer: ");
		 	attendeesHeader.text("Attendees Count: ");
		 	descriptionHeader.text("Description: ");
		 	keywordsHeader.text("Keywords: ");
		 	distanceHeader.text("Distance: ");
		 	commentsBtn.text("Open Comments Thread");
		 	rsvpBtn.text("I'm Planning to Attend This Event!");
		 	showBtn.text("Show More Information");

		 	//get keywords and put them in a string to be displayed
		 	var keywordString = "";
		 	if(listing.keywords !== undefined){
		 		for (var i=0;i<Object.keys(listing.keywords).length;i++){
					var key = Object.keys(listing.keywords)[i];
		 			keywordString+=listing.keywords[key]+" ";
		 		}
		 	}

		 	//set information displayed in each subsection
		 	name.text(listing.name);
			address.text(listing.address);
		 	//if endDate exists, show both start date and end date
		 	if(listing.endDate === undefined){
		 		date.text(listing.date);
		 	}
		 	//else show just date
		 	else{
		 		date.text(listing.date + " to " + listing.endDate);
		 	}
		 	startTime.text(moment(new Date(listing.date+ " "+ listing.start_time)).format("hh:mm A"));
		 	endTime.text(moment(new Date(listing.date+ " "+ listing.end_time)).format("hh:mm A"));
		 	

		 	//need to retrieve username, don't want to display the userID
		 	firebase.database().ref().child("users").child(listing.organizer).once("value",function(snapshot){
				organizer.text(snapshot.val().username.split("@")[0]);
			});
		 	


		 	attendees.text(listing.attendees_count);
			description.text(listing.description);
			keywords.text(keywordString);
			distance.text((Math.round(listing.distance*100))/100+" miles");
			//put content in list container depending on order of firebase results
			$("#list").append(newListItemContainer);
			//hide expandable items to start with, will show with an on-click event
			expandedItemContainer.hide();
			//only show distance if user is doing a distance based search
			if(type !== "distance"){
				containerDistance.hide();
			}
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
					
					//set key equal to the child object key so we can grab data from this portion of the object
					var key = Object.keys(data)[i];
					//set element of listing array to object i in JSON
					listing = data[key];
					//set key as new attribute since array won't have keys anymore, we will need this for buttons
					listing.key=key;
					
					//don't show any cancelled listings
					if(!listing.cancelled){
						var eventStartTime = moment(new Date(listing.date+ " "+ listing.start_time));
						//if endDate exists, calculate endTime based on that date, otherwise just use single date
						if(listing.endDate === undefined){
							var eventEndTime = moment(new Date(listing.date+ " "+ listing.end_time));
						}
						else{
							var eventEndTime = moment(new Date(listing.endDate+ " "+ listing.end_time));
						}
						var startVsCurrent= eventStartTime.diff(moment(),"days");
						var endVsCurrent= eventEndTime.diff(moment(),"days");
						
						//add additional time keys to each listing
						listing.timeToStart = startVsCurrent;

						var keywordSearchTerm = $("#searchTerm").val();
						var matches = false;
						if(listing.keywords!==undefined){
							for (j=0; j<Object.keys(listing.keywords).length; j++) {
								var key =Object.keys(listing.keywords)[j];
								var keywordValue = listing.keywords[key];
								if(keywordValue == keywordSearchTerm){
									matches=true;
								}
							}
						}
						//two cases where we might want to include listing to be sorted:
						//no search term applied
						//keywords match the search term
						if((keywordSearchTerm ==="") ||  (matches === true)){
							if((endVsCurrent < 0) && ((filter === "all")||(filter==="past"))){
								listingsArray.push(listing);
							}
							//event in-progress
							if((endVsCurrent > 0) && (startVsCurrent < 0) && ((filter === "all")||(filter==="in-progress"))){
								listingsArray.push(listing);
							}
							//event hasn't started yet
							else if((startVsCurrent > 0)&&((filter === "all")||(filter==="upcoming"))){
								listingsArray.push(listing);
							}
						}
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
				mapCenter = {lat: userLat, lng: userLng};
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

				$("#popup").hide();

				
				$("#login-popup").hide();

			}).catch(function(error) {
				// Handle Errors here.
				var errorCode = error.code;
				var errorMessage = error.message;
				// ...
				$("#error-login").text(errorMessage);
			});	
	},

	//this function logs out user from firebase authentication tool
	logoutUser:function(){
		firebase.auth().signOut().then(function() {
			// Sign-out successful.
			$("#profile").attr("style","visibility:hidden");
			$("#login-label").text("Login");
		}).catch(function(error) {
			// An error happened.
		});
	},

	//this function sorts results based on the distance from current centered map location
	mapSort:function(numResults, filter){
		
		//retrieve an array of listings with distances from map location
		app.calcDistance(mapCenter.lat, mapCenter.lng, filter).then(function(listingsArray){
			//sort the array of listings based on distance
			app.bubbleSortDistance(listingsArray).then(function(array){
				var sortedArray = array;
				initMap(sortedArray,numResults);
				if(numResults ==="all"){
					for(var i=0;i<sortedArray.length;i++){
						app.generateListItem(sortedArray[i]);
					}
				}
				else{
					for(var i=0;i<numResults;i++){
						app.generateListItem(sortedArray[i],"distance");
					}
				}
			});
		});
	},

	//sorts events on names to show in alphabetic order
	nameSort:function(numResults,filter){
		app.getListings(filter).then(function(listingsArray){
			app.bubbleSortName(listingsArray).then(function(array){
				var sortedArray = array;
				initMap(sortedArray,numResults);
				if(numResults ==="all"){
					for(var i=0;i<sortedArray.length;i++){
						app.generateListItem(sortedArray[i]);
					}
				}
				else{
					for(var i=0;i<numResults;i++){
						app.generateListItem(sortedArray[i]);
					}
				}
			});
		});
	},
	
	//sort results based on the "attendees_count field"
	popularitySort:function(numResults, filter){
		app.getListings(filter).then(function(listingsArray){
			app.bubbleSortPopularity(listingsArray).then(function(array){
				var sortedArray = array;
				initMap(sortedArray,numResults);
				if(numResults ==="all"){
					for(var i=0;i<sortedArray.length;i++){
						app.generateListItem(sortedArray[i]);
					}
				}
				else{
					for(var i=0;i<numResults;i++){
						app.generateListItem(sortedArray[i]);	
					}
				}
			});
		});
	},

	//this function appends any listings the user is attending or hosting to the profile section
	populateProfile:function(){
		
		var currentUserID = firebase.auth().hc;
	 	var currentUsername = null;
	 	var listingsObject=null;
	 	var attendingObject=null;
	 	//clear any old data so new list is populated for user
	 	$("#profile-hosted").html("");
	 	$("#profile-attended").html("");

	 	firebase.database().ref().child("users").child(currentUserID).once("value",function(snapshot){
			currentUsername = snapshot.val().username;
			$("#profile-username").text(currentUsername.split("@")[0]);
			$("#profile-email").text(currentUsername);
			$("#profile-about").html(snapshot.val().description);
			
			//grab object of all the listing keys that the user is hosting and attending
			//will iterate through each of these objects and pull related listing data if they have data
			listingsObject = snapshot.val().hosting;
			attendingObject = snapshot.val().attending;
	
			//append each listing to listing section
			if(listingsObject !== undefined){
				for (var i=0;i<Object.keys(listingsObject).length;i++){
					//set key equal to the child object key so we can grab data from this portion of the object
					var key = Object.keys(listingsObject)[i];
					//set listingKey equal to the first listing item
					var listingKey = listingsObject[key];

					//grab listing data from listings portion of the firebase tree
					firebase.database().ref().child("listings").child(listingKey).once("value",function(snapshot){
						if (!snapshot.val().cancelled){
							var hostedContainer = $("<div>");
							hostedContainer.addClass("eventContainerProfile");
							var listingName=$("<div>");
							var cancelBtn =$("<button>");
							var listingAddress=$("<div>");
							var listingDate=$("<div>");

							listingName.text(snapshot.val().name);
							listingAddress.text(snapshot.val().address);
							if(snapshot.val().endDate===undefined){
								listingDate.text(snapshot.val().date);
							}
							else{
								listingDate.text(snapshot.val().date+" to "+snapshot.val().endDate);
							}
							cancelBtn.text("Cancel Event");
							cancelBtn.addClass("js-cancel-event");
							cancelBtn.attr("data-listing-id",listingKey)
							hostedContainer.append(listingName);
							hostedContainer.append(cancelBtn);
							hostedContainer.append(listingAddress);
							hostedContainer.append(listingDate);

							$("#profile-hosted").append(hostedContainer);
						}
						
					});
				}	
			}
			
			//append each listing to hosting section
			if(attendingObject !== undefined){
				for (var i=0;i<Object.keys(attendingObject).length;i++){
					if (!snapshot.val().cancelled){	
						//set key equal to the child object key so we can grab data from this portion of the object
						var key = Object.keys(attendingObject)[i];
						//set listingKey equal to the first listing item
						var attendingKey = attendingObject[key];	
						//grab listing data from listings portion of the firebase tree
						firebase.database().ref().child("listings").child(attendingKey).once("value",function(snapshot){
							var attendingContainer = $("<div>");
							attendingContainer.addClass("eventContainerProfile");
							var listingName=$("<div>");
							var listingAddress=$("<div>");
							var listingDate=$("<div>");

							listingName.text(snapshot.val().name);
							listingAddress.text(snapshot.val().address);
							if(snapshot.val().endDate===undefined){
								listingDate.text(snapshot.val().date);
							}
							else{
								listingDate.text(snapshot.val().date+" to "+snapshot.val().endDate);
							}
							attendingContainer.append(listingName);
							attendingContainer.append(listingAddress);
							attendingContainer.append(listingDate);

							$("#profile-attended").append(attendingContainer);
						});
					}
				}	
			}
		});
	},

	//this function updates the description text on save for the profile update
	profileDescriptionUpdate:function(){
		var currentUser = firebase.auth().hc;

		if($("#profile-update").attr("data-state")==="update"){
			var profileDescription = $("#profile-about").text();
			$("#profile-about").html("<input id='newDescription' placeholder='"+profileDescription+"'>");
			$("#profile-update").text("Save Changes");
			$("#profile-update").attr("data-state","save");
		}
		else{
			var profileDescription = $("#newDescription").val();
			$("#profile-about").html(profileDescription);
			$("#profile-update").text("Update");
			$("#profile-update").attr("data-state","update");
		}
		firebase.database().ref().child("users").child(currentUser).update({
			description:profileDescription,
		});
	},

	//this function sends an email to the user to reset his/her password if the account exists 
	resetPassword:function(){
		var emailAddress = $("#username").val();
		if (emailAddress===""){
			$("#error-login").html("Please enter your email address in the user field and click the 'Forgot Password' button");
		}
		else{
			firebase.auth().sendPasswordResetEmail(emailAddress).then(function() {
  				$("#error-login").html("Please check your email for steps to finish resetting your password");
			}, function(error) {
  		 		//An error happened.
  		 		$("#error-login").text(error);
			});
		}
	},
	//this function adds one to the attendees count when user clicks RSVP button
	rsvp:function(clicked){
		
		//key for the specific listing user clicks on
		var listingKey = $(clicked).attr("data-listing-id");
		var currentUser = firebase.auth().hc;
		var attendeesCount=null;

		//if user not logged in, don't do anything
		if (currentUser === null){
			alert("user not logged in");
		}
		else{	
			//check to see if user has already rsvp'd to the selected event, end function if this is the case
			var checkUserEvents = new Promise(function (resolve,reject) {
				var numEvents = firebase.database().ref().child("users").child(currentUser).child("attending").once("value").then(function(snapshot){
					//iterate through all of the events saved under current user to compare listingKey with one selected
					for(var i=0;i<snapshot.numChildren();i++){
						var key = Object.keys(snapshot.val())[i];
						var listing =snapshot.child(key).val();

						if (listing ===listingKey){
							alert("user already attending event");
							return;
						}
					}
					resolve();
				});
			});

			checkUserEvents.then(function(result){
				//if user has not yet rsvp'd for event, update attendees_count and user profile
				var getAttendeesCount = new Promise(function (resolve, reject) {
					firebase.database().ref().child("listings/"+listingKey).on("value", function(snapshot) {
							attendeesCount = snapshot.val().attendees_count;
							resolve(attendeesCount);
						}, function (errorObject) {
								console.log("The read failed: " + errorObject.code);
						});
					});

					//wait to grab current attendees count and update count by 1.
					getAttendeesCount.then(function(result){
						firebase.database().ref().child("listings/"+listingKey).update({
							attendees_count:result+1,
						});
						//also display updated count on expanded view for the listing
						var updateTarget = "#attendees-"+listingKey;
						$(updateTarget).text(result+1);
					});

					//update user table to show current user is attending event
					firebase.database().ref().child("users").child(currentUser).child("attending").push(listingKey);
			});
		}
	},

	//this function determines the filters, order, and num results parameters and runs the appropriate sort function
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
		else if (orderResults ==="date"){
			this.dateSort(numResults, filter);
		}
		else if (orderResults ==="map-closest"){
			this.mapSort(numResults, filter);
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
			$("#popup").hide();
		});	
	},	
};

firebase.initializeApp(config);

//watcher to change what nav buttons are displayed based on whether user is logged in or not
firebase.auth().onAuthStateChanged(function(user) {
	if (user) {
		app.changeUserStatus();
	}
});

//listener to initiate a search which populates list and map with new pins
$(document).on("click","#search", function(){
	app.search();
});

//listener to log that a user is "attending" a selected event
$(document).on("click", ".js-rsvp", function () {
	app.rsvp(this);
});

//listener to open the login popup or log out user depending on userStatus
$(document).on('click', '#login', function() {
	if($("#login-label").text() === "Login"){
		$("#login-popup").show();
	}
	else{
		app.logoutUser();
	}	
});

//listener to open the new user popup if that is selected on first login screen
$(document).on('click', '#add-user-submit', function() {
	$("#login-popup").hide();
	$("#newUser-popup").show();
});

//listener to initiate the login process, checking account information and displaying error or completing login
$(document).on('click', '#login-user-submit', function() {
	app.loginUser()
});

//listener to initiate the login process, checking account information and displaying error or completing login
$(document).on('click', '#password-reset', function() {
	app.resetPassword();
});

//listener to initiate the new user process, checking login and password (and displaying any errors) before saving to DB
$(document).on('click', '#create-user-submit', function() {
	app.addNewUser();
});

//listener to close login popups
$(document).on('click', '#cancel-user-submit', function() {
	$("#newUser-popup").hide();
	$("#login-popup").hide();
});

//listener to show expanded details on a selected event
$(document).on('click', '.js-expand', function() {
	var key = "#expand-"+($(this).attr("data-listing-id"));
	var imageKey ="#image-"+($(this).attr("data-listing-id"));
	var imageLink=$(imageKey).attr("data-url");
	$(imageKey).attr("src",imageLink);

	if($(this).attr("data-visibility")==="hide"){	
		$(key).show();
		$(this).attr("data-visibility","show");
		$(this).text("Collapse Extra Information");
	}
	else{
		$(this).attr("data-visibility","hide");
		$(key).hide();
		$(this).text("Show More Information");
	}
});

//listener to open user profile if the user is logged in.  Alternate clicks will close profile
$(document).on('click', '#profile', function() {
		$("#profile-container").show();
		app.populateProfile();
});

//listener to close user profile
$(document).on('click', '#profile-close', function() {
		$("#profile-container").hide();
});

//listener to update profile "about me" section for each user
$(document).on('click', '#profile-update', function() {
	app.profileDescriptionUpdate();
});

//listener to log that a user is "attending" a selected event
$(document).on("click", ".js-comments", function () {
	app.commentsThread(this);
});

//listener to close comments thread popup
$(document).on('click', '#comments-close', function() {
	$("#comments-popup").hide();
});

//listener to submit comments on popup
$(document).on('click', '#comments-submit', function() {
	app.commentsThreadAdd(this);
});

//listener to cancel event if you are organizer
$(document).on('click', '.js-cancel-event', function() {
	app.cancelEvent(this);
});