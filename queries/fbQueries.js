this.graph = require('fbgraph'); //Facebook Graph module

//Retrieves a user's facebook information given their token is present
exports.getUserInfo = function(fbtoken,cb){
	var facebookParameters = "fields=first_name, last_name, birthday, gender&" //Facebook information needed
	this.graph
	  .setAccessToken(fbtoken)
	  .get("/me?" + facebookParameters, function(err, response) {
	      cb(response); //Sent back as JSON
	  });
}