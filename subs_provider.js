//var mongo = require('mongojs')
//var crypto = require('crypto');

var fs = require('fs');

SubsProvider = function(host, port) {
    this.MAX_FILE_SIZE = 33333;
    this.ended = {2:true,3:true,5:true,6:true}; // Store homework endedness
    this.homeworks = {2:4,3:7,5:5,6:10}; // Store homework sizes
};

SubsProvider.prototype.is_valid_number = function(n){
    return !isNaN(parseFloat(n)) && isFinite(n) && parseInt(Number(n)) == Number(n);
}

SubsProvider.prototype.gen_path = function(user_data, hw_data){
    console.log("DATA",hw_data);
    var username = user_data.username;
    var hwid = hw_data.hwid;
    var pid = hw_data.pid;
    if(!this.is_valid_number(hwid) || !this.is_valid_number(pid)) return "";
    hwid = parseInt(hwid);
    pid = parseInt(pid);
    try {
	console.log("making dir");
	fs.mkdirSync("sub_data/"+username+"/");
	console.log("made");
    } catch(e) {
	if (e.code != 'EEXIST'){
	    console.log("EXC: ",e);
	    throw e;
	}
    }
    if(hwid in this.homeworks && 0 <= pid && pid < this.homeworks[hwid]){
	return "sub_data/" + username + "/" + hwid + "." + pid
    }
    return "";
}

SubsProvider.prototype.get = function(user_data, hw_data, callback) {
    var count = 0;
    if(hw_data.hwid in this.homeworks){
	count = this.homeworks[hw_data.hwid];
    }
    else{
	console.log("HWID problem", hw_data);
	callback("Invalid homework ID");
	return;
    }
    var read_data = [];
    for(var i = 0; i < count; i++){
	hw_data.pid = i;
	var path = this.gen_path(user_data, hw_data);
	if(path == ""){
	    console.log("File inaccessible");
	    callback("File read error");
	    return;
	}
	try{
	    var buf = fs.readFileSync(path, "ASCII");
	    read_data.push(buf.toString());
	}
	catch(e){
	    read_data.push("");
	}
    }
    callback(null, read_data);
};

SubsProvider.prototype.save = function(user_data, hw_data, callback) {
    var path = this.gen_path(user_data, hw_data);
    if(path == "" || this.ended[hw_data.hwid]){
	console.log("Uh oh");
	callback("Homework has ended");
	return;
    }
    var text = hw_data.text;
    if(text.length > this.MAX_FILE_SIZE){
	callback("is too large");
    }
    fs.writeFile(path, text, function(error){
	console.log(error, " E ");
	if(error)
	    callback("An error occurred");
	else
	    callback(null, "success");
    });
};

exports.SubsProvider = SubsProvider;
