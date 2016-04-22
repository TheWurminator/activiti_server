var pool = require('../node_modules/database/DBPool');
var tagQueries = require('./tagQueries');
var userQueries = require('./userQueries');
var itself = require('./activitiQueries'); //Since these methods are exported, we must reference itself

//Will create a user based on a JSON info file and a uid
exports.createActiviti = function(info, uid, cb){
	//This will catch an error, so the entire server doesn't crash when the JSON is wrong
	try {
		var addQuery = "insert into activitis (aid, name, description, cost, max_attendees, start_date, end_date, latitude, longitude, uid) values (\'null\', + \'" + info.name + "\', \'" + info.description + "\', \'" + info.cost + "\', \'" + info.max_attendees + "\', \'" + info.start_date + "\', \'" + info.end_date + "\', \'" + info.latitude + "\', \'" + info.longitude + "\', \'" + uid + "\')";
		console.log(addQuery);
		pool.sendQuery(addQuery, function(response){
			if(response == null){
				cb(null);
			}
			else{
				try{
					itself.setTags(response.insertId, info.tags, function(res2){ //Sets the tags for the user
						if(res2 == null){
							cb(null);
						}
						else{
							cb(true);
						}
					});
					}
				catch(e){
					console.log("Tag placement error");
				}
			}
		});
	}
	catch(e){
		console.log("Some fields were not found, incorrect JSON : createActiviti");
		cb(null);
	}
};

//This checks to see if a specific user is the owner of an activiti
exports.checkOwner = function(aid, uid, cb){
	var query = "select * from activitis where activitis.aid = \'" + aid + "\'";
	pool.sendQuery(query, function(response){
		if(response == null){
			cb(null);
		}
		else{
			if(response['uid'] == uid){
				cb(true);
			}
			else{
				cb(null);
			}
		}
	});
}

//This will set a user to attend a specific activiti
exports.setUserAttending = function(aid, uid, cb){
	var query = "insert into attending (uid, aid) values (\'"+uid+"\', \'"+aid+"\')";
	pool.sendQuery(query, function(response){
		if(response == null){
			cb(null);
		}
		else{
			cb(true);
		}
	});
}

//This will return all of the users attending an Activiti
exports.getUsersAttending = function(aid, cb){
	var query = "select uid from attending where attending.aid = \'" + aid + "\'";
	pool.sendQuery(query, function(response){
		console.log(response.length);
		if(response == null || response.length < 1){
			cb(null);
		}
		else{
			cb(response);
		}
	});
}

//This will remove a user that is attending an Activiti
exports.removeUserAttending = function(aid, uid, cb){
	var query = "delete from attending where attending.uid = \'"+uid+"\' and attending.aid = \'"+aid+"\'";
	pool.sendQuery(query, function(response){
		if(response == null){
			cb(null);
		}
		else{
			cb(true);
		}
	});
}

//Deletes an Activiti
exports.deleteActiviti = function(aid, uid, cb){
	var query = "delete from activitis where activitis.aid = \'" + aid + "\'";
	pool.sendQuery(query, function(response){
		if(response == null || response.affectedRows == 0){
			cb(null);
		}
		else{
			cb(response);
		}
	}); 
};

//This is a function that will set the tags for the Activiti
exports.setTags = function(aid, tags, cb){
	for(x = 0; x < tags.length; x++){ //Need to run through the available tags
		var save = tags[x].toLowerCase(); //Make all tags lowercase for matching purposes
		tagQueries.createTag(save, function(response){
			if(response == null){
				console.log("There was an error creating the tag");
				cb(null);
			}
			else{
				//The tag was created, now we need to do something about it
				setTagActiviti(aid, response, function(res){
					if(res == null){
						console.log("Could not add the tag, for some reason");
					}
					else{
						//Keep iterating through the tags
					}
				});
			}
		});
	}
	cb(true);
}

//This will set a specific tag for an activiti
function setTagActiviti(aid, tid, cb){
	var query = "insert into activiti_tags (aid, tid) values (\'" + aid + "\', \'" + tid + "\')";
	pool.sendQuery(query, function(response){
		if(response == null){
			cb(null);
		}
		else{
			cb(true);
		}
	});
}

//Gets activiti information, sends it up through callback
exports.getActiviti = function(aid, cb){
	var query = "select * from activitis where aid = \'" + aid + "\'";
	pool.sendQuery(query, function(response, err){
		if(err){
			console.log(err);
		}
		if(response.length < 1){ //Response can be an empty set
			cb(null);
		}
		else{
			cb(response);
		}				
	});
};

//Update activiti information, 
//First we need to update certain parts, then update the tags separately
//We can just assume that this will work since it will catch if the original json is incorrect
//Once the JSON is correct, they can pretty much change whatever they want
exports.updateActiviti = function(aid, info, cb){
	for(x in info){
		if(x != "tags"){
			var query = "update activitis set " + x + " = \'" + info[x] + "\' where activitis.aid = " + parseInt(aid);
			pool.sendQuery(query, function(response){
				console.log("Affected rows = " + response.affectedRows);
				if(response === null || response.affectedRows < 1){
					console.log("Query Error : updateActiviti");
				}
				else{
				}
			});
		}
		else{
			itself.setTags(aid, info[x], function(response){
				console.log("It all works");
			});
		}
	}
	cb(true);
};

//This is a function that will fetch the tags for an activiti
//Takes in an activiti id, and returns a json with tags(tid, name)
exports.getTagsActiviti = function(activiti_id, cb){
	var query = "select t.name, atag.tid from tags t inner join activiti_tags atag on atag.tid = t.tid where atag.aid = \'"+activiti_id+"\'";
	pool.sendQuery(query, function(response){
		if(response == null){
			cb(null);
		}
		else{
			cb(response);
		}
	});
}

