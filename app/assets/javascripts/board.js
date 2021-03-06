//= require cable
//= require_self
//= require_tree .

App = {};

App.cable = ActionCable.createConsumer();

App.messages = App.cable.subscriptions.create('DrawChannel', {
  received: function(data) {
  	if(hashid == data.hash) {
    	drawLine(data.x, data.y, data.x1, data.y2, data.color1, data.size1, data.highl);
  	}
  }
});

$(function() { 

	var time = $.now();
	var down = false; //Class Variable to track is mouse is down
	var drawMode = true;
	var currentColor = "blue";

	canvas = $("#board");
	console.log(canvas.height);
	console.log(canvas.width);
	context = canvas[0].getContext("2d");
	context.canvas.height = canvas.height();//set the Canvas width and Height
	context.canvas.width = canvas.width();
	$('#savedImage').on('load', function() {
		context.drawImage($('#savedImage')[0],0,0);
	});
	if($('#savedImage') != null){
		context.drawImage($('#savedImage')[0],0,0);
	}
	canvas.on("mousedown", function(e){
		if(drawMode) {down = true;} //set the class variable to down
		 });
	canvas.on("touchstart", function(e){
		if(drawMode) {down = true;} //set the class variable to down
		});
	var xPrev = null;
	var yPrev = null;
	canvas.on("mousemove", function(e){ //Mouse moved
		if(drawMode) {
		if(down) { //If mouse is down
			if(xPrev == null && yPrev == null) { //If the start of a new line
				draw(e.pageX,e.pageY,e.pageX,e.pageY);
			}
			else { // If the line has already started
				draw(xPrev,yPrev,e.pageX,e.pageY);
			}
			xPrev = e.pageX; //set the previous position
			yPrev = e.pageY;
		}
	}
	});
	canvas.on("touchmove", function(e){ //Mouse moved
		if(drawMode) {
			// Prevents user from scrolling
			e.preventDefault();
			if(down) { //If mouse is down
				if ( e.originalEvent.changedTouches ) {
							e = e.originalEvent.changedTouches[0];
							x = e.pageX;
							y = e.pageY;
					}
				if(xPrev == null && yPrev == null) { //If the start of a new line
					draw(x,y,x,y);
				}
				else { // If the line has already started
					draw(xPrev,yPrev,x,y);
				}
				xPrev = x; //set the previous position
				yPrev = y;
		}
	}
	else {
		// Lets user scroll again, no drawing.
		$(document).unbind('touchmove');
	}
	});
	canvas.on('mouseup mouseleave touchend',function(e){
		down = false; //set the class variable to not down
		xPrev = null;  //reset the previous positions of the line
		yPrev = null;
	});
	
	function setTool(toolt) {
		tool = toolt;
		context.strokeStyle = tool.color;
		context.lineWidth = tool.size*2;
		context.fillStyle = tool.color;
		if(tool.highlighter) {
			context.globalCompositeOperation = "multiply";
		}
		else {
			context.globalCompositeOperation = "source-over";
		}
	}

	// Change this to correct colors if changed!
	var currentSecondaryColor = 'rgb(246, 76, 114)';
	var currentTertiaryColor = 'rgb(125, 99, 143)';

	function changeToolColor(color) {
		document.getElementById("myModal").style.display = "none";
		if(document.getElementById('marker').style.color == currentSecondaryColor) {
			setTool(new marker(tool.size,color));
		} else {
			setTool(new marker(5,color));
		}
		currentColor = color;
		changeClassButtonColor('wb-button', currentTertiaryColor);
		changeSingleButtonColor('marker', currentSecondaryColor);
	}

	function draw(xPrev,yPrev,xPos,yPos) {
		context.strokeStyle = tool.color;
		context.lineWidth = tool.size*2;
		context.fillStyle = tool.color;
		context.beginPath();
		context.arc(xPrev, yPrev, tool.size, 0, 2 * Math.PI);
		context.fill();
		context.beginPath();
		context.moveTo(xPrev,yPrev);
		context.lineTo(xPos,yPos);
		context.stroke();
		if($.now() - time> 5) {
			$.ajax({
		    method: "POST",
		    url: "/update",
		    data: {
		      'hash': hashid,
		      'x': xPrev,
		      'y': yPrev,
		      'x1': xPos,
		      'y2': yPos,
		      'color1': tool.color,
		      'size1': tool.size,
		      'highl': tool.highlighter,
		    }
		  	});
		  	time =$.now(); 
		}
	}
	class writable {
		constructor(size,color) {
			this.size = size;
			this.color = color;
		}	
	}

	class marker extends writable {
		constructor(size,color) {
			super(size,color);
			this.highlighter = false;
		}
	}

	class highlighter extends writable {
		constructor(size,color) {
			super(size,color);
			this.highlighter = true;
		}
	}

	var modal = document.getElementById("myModal");

	$('#marker').click(function() {
		setTool(new marker(5,currentColor));
		changeClassButtonColor('wb-button', currentTertiaryColor);
		changeSingleButtonColor('marker', currentSecondaryColor);
	});
	
	/*$('#highlighter').click(function() {
		setTool(new highlighter(20,"yellow"));
		changeClassButtonColor('wb-button', currentTertiaryColor);
		changeSingleButtonColor('highlighter', currentSecondaryColor);
	});*/
	
	$('#eraser').click(function() {
		setTool(new marker(100,"white"));
		changeClassButtonColor('wb-button', currentTertiaryColor);
		changeSingleButtonColor('eraser', currentSecondaryColor);
	});
	
	// Color and Modal Stuff
	$('#colors').click(function() {
		modal.style.display = "block";
	});
	
	//Colors
	$('#blue').click(function() {
    changeToolColor("blue");
	});

	$('#red').click(function() {
    changeToolColor("red");
	});

	$('#green').click(function() {
    changeToolColor("green");
	});

	$('#brown').click(function() {
    changeToolColor("brown");
	});

	$('#purple').click(function() {
    changeToolColor("purple");
	});

	$('#black').click(function() {
    changeToolColor("black");
	});

	$('#deeppink').click(function() {
    changeToolColor("deeppink");
	});

	$('#gold').click(function() {
    changeToolColor("gold");
	});

	$('#lightseagreen').click(function() {
    changeToolColor("lightseagreen");
	});

	$('#mediumspringgreen').click(function() {
    changeToolColor("mediumspringgreen");
	});

	$('#teal').click(function() {
    changeToolColor("teal");
	});

	$('#slategrey').click(function() {
    changeToolColor("slategrey");
	});
	//End Colors

	window.onclick = function(event) {
		if(event.target == modal) {
			modal.style.display = "none";
		}
	}

	// End Modal Stuff
	
	$('#plus').click(function() {
		if(document.getElementById('marker').style.color == currentSecondaryColor) {
			setTool(new marker(tool.size+5,currentColor));
		} else if (document.getElementById('highlighter').style.color == currentSecondaryColor) {
			setTool(new highlighter(tool.size+5,"yellow"));
		} else if (document.getElementById('eraser').style.color == currentSecondaryColor) {
			setTool(new marker(tool.size+5, "white"));
		}
	});
	
	$('#minus').click(function() {
		if(document.getElementById('marker').style.color == currentSecondaryColor) {
			setTool(new marker(tool.size-5,currentColor));
		} else if (document.getElementById('highlighter').style.color == currentSecondaryColor) {
			setTool(new highlighter(tool.size-5,"yellow"));
		} else if(document.getElementById('eraser').style.color == currentSecondaryColor){
			setTool(new marker(tool.size-5, "white"));
		}
	});

	var tool = new marker(5,"blue"); //default marker tool of  size and blue color
	context.strokeStyle = tool.color;
	context.lineWidth = tool.size*2;
	context.fillStyle = tool.color;


function dataURLtoBlob(dataURL) {
	var binary = atob(dataURL.split(',')[1]);
	var array = [];
	for(var i = 0; i < binary.length; i++) {
	    array.push(binary.charCodeAt(i));
	}
 	return new Blob([new Uint8Array(array)], {type: 'image/png'});
}

$("#save").click(function() {
	saveURL(document.querySelector('#board').toDataURL());
	alert("Whiteboard successfully saved!");
});

$('#drawmode').click(function() {
	drawMode = !drawMode;
	var drawModeButton = document.getElementById('drawmode');
	if(drawMode) 
		drawModeButton.style.color = 'green';
	else
		drawModeButton.style.color = 'red';
});

function saveURL(dataURL) {
	var file= dataURLtoBlob(dataURL);
	var fd = new FormData();
	fd.append("image", file);
	fd.append("id",id)
	$.ajax({
	   url: "/save",
	   type: "POST",
	   data: fd,
	   processData: false,
	   contentType: false,
	});
}
});

function drawLine(xPrev,yPrev,xPos,yPos,color,size,highlighter) {
	context.strokeStyle = color;
	context.lineWidth = size*2;
	context.fillStyle = color;
	context.beginPath();
	context.arc(xPrev, yPrev, size, 0, 2 * Math.PI);
	context.fill();
	context.beginPath();
	context.moveTo(xPrev,yPrev);
	context.lineTo(xPos,yPos);
	context.stroke();
}

function changeClassButtonColor(className, color) {
	var restButtons = document.getElementsByClassName(className);
	for(var i = 0; i < restButtons.length; i++) {
	  restButtons[i].style.color = color;
	}
}

function changeSingleButtonColor(idName, color) {
  var button = document.getElementById(idName);
	button.style.color = color;
}