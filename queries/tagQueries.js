//This is a middleware file that will create a tag
var pool = require('../node_modules/database/DBPool');
itself = require('./tagQueries');

//This function will create a tag and put it into the database
//First checks to see if the tag is actually present
//If it isnt then it'll make a new one
//Returns the tag id of the inserted tag
exports.createTag = function(name, cb){
	itself.tagExistsName(name, function(response){
		if(response == null){ //If the tag does not exist
			var query = "INSERT INTO tags (tid, name) values (NULL, \'" + name + "\')";
			pool.sendQuery(query, function(res2){
				if(res2 == null){
					cb(null);
				}
				else{ //If the query was successful, return the insert id
					cb(res2.insertId);
				}
			});
		}
		else{
			cb(response); // This is the TID
		}
	});
}

//This is a debug function that will be used to delete a tag
exports.deleteTag = function(tid, cb){
	var query = "delete from tags where tid = \'" + tid +"\'";
	pool.sendQuery(query, function(response,err){
		if(err){
			console.log(err);
			cb(null);
		}
		else{
			cb(response);
		}
	});
}

//DEBUG
//This will modify the name of a tag based on the tid entered and a name string
//Returns true if successful, NULL if unsuccessful
exports.modifyTag = function(tid, newName, cb){
	var query = "update tags set name = \'" + newName + "\' where tags.tid = " + tid;
	pool.sendQuery(query, function(response){
		if(response == null){
			cb(null);
		}
		else{
			cb(true);
		}
	});
}

//This is a function to see if a tag already exists
//Takes in a string for a name and a callback reference
//Either returns true or null
exports.tagExistsName = function(name, cb){
	searchName = name.toLowerCase(); //All tags are lowercase for matching purposes
	var query = "select * from tags where name = \'" + searchName + "\'";
	pool.sendQuery(query, function(response){
		if(response == null || response.length == 0){ //Error or empty set
			console.log("Tag does not already exist");
			cb(null);
		}
		else{ //Tag exists
			cb(response[0].tid); //Returning the tag id
		}
	});
}

//This is a function that will take in a TID 
//Will return the tag's name or will return NULL if it isn't present
exports.getTagNameTID = function(tid, cb){
	var query = "select * from tags where tid = \'" + tid +"\'"
	pool.sendQuery(query, function(response){
		if(response == null || response.length < 1){
			cb(null);
		}
		else{
			cb(response[0].name); //Returning the name of the tag
		}
	});
}








