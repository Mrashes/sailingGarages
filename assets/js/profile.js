var profile = {
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
							if(snapshot.val().endDate===undefined || snapshot.val().endDate===""){
								listingDate.text(snapshot.val().date);
							}
							else{
								listingDate.text(snapshot.val().date+" to "+snapshot.val().endDate);
							}
							cancelBtn.text("Cancel Event");
							cancelBtn.addClass("margin-bot10 btn btn-danger js-cancel-event");
							cancelBtn.attr("data-listing-id",snapshot.getKey())
							hostedContainer.append(listingName);
							hostedContainer.append(listingAddress);
							hostedContainer.append(listingDate);
                            hostedContainer.append(cancelBtn);
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
							if(snapshot.val().endDate===undefined || snapshot.val().endDate===""){
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


};