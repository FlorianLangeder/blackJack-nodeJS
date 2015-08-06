function initChat(socket) {
	$('#msgInput').on("keypress", function(e) {
	    if(e.keyCode === 13) {
	    	var text = $('#msgInput').val();
	    	if(validText(text)) {
	    		socket.emit('sendMessage',text);
	    	}
	    	$('#msgInput').val('');
	    }
	});

	socket.on('setMessage',function(text){
		setText(text);
	});
}

function setText(text) {
	$('#chatlog').append(getTime() +":" + text + "<br/>");
	$('#chatlog').scrollTop($('#chatlog')[0].scrollHeight);
}

function validText(str) {
	if(isBlank(str)) 
		return false;

	return true;
}

function isBlank(str) {
    return (!str || /^\s*$/.test(str));
}

function getTime() {
	var now 	= new Date();
	var hour 	= now.getHours();
    var minute 	= now.getMinutes();
    var second  = now.getSeconds(); 
	 if(hour.toString().length == 1) {
        var hour = '0'+hour;
    }
    if(minute.toString().length == 1) {
        var minute = '0'+minute;
    }
    if(second.toString().length == 1) {
        var second = '0'+second;
    }   
	return hour + ":" + minute + ":" + second;  
}