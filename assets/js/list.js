var app ={
	
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
		profile.populateProfile();		
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
			newListItemContainer.addClass("list-container");
			rsvpBtn.addClass("btn btn-success margin-bot5");
			showBtn.addClass("btn btn-info margin-bot5");
			commentsBtn.addClass("btn btn-success margin-bot5");

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
		 		image.attr('class', 'saleImage');
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
			commentsBtn.attr("type","button");
			commentsBtn.attr("data-toggle","modal");
			commentsBtn.attr("data-target","#comments-popup");
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
		 	if(listing.endDate === undefined || listing.endDate === ""){
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
						if(listing.endDate === undefined || listing.endDate === ""){
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
	
};

firebase.initializeApp(config);

