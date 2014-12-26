var clipboard_timer;
var counting = false;
var clipboard_visible = false;
var sticky_clipboard = false;
var data;
var first_click = true;
var clone_count = 0;
var clipboard_fully_visible = false;
var currentMousePos = { x: -1, y: -1 };
var small_clipboard_open = false;
var in_popup = false;
var mouse_down = false;
var clear_to_catch = true;
var point_queue = [];
var guesture_track_time = 50;
var x_axis = {i:1, j:0};
var circle_radius_base = 70;
var circle = false;
var skip_first_element;
var dragging_folder = false;
var start_drag_x = 0;
var start_drag_y = 0;

$(document).on("click", ".page-dimmer", function(){closeCircle();});


document.addEventListener("dragover", function(e){
    e = e || window.event;
    var dragX = e.pageX, dragY = e.pageY;
    currentMousePos.x = dragX;
    currentMousePos.y = dragY;
    if(mouse_down && small_clipboard_open && dragX > ($(".popUpClipboard").offset().left + 150)) {
    	resetPopUp();
    }
    if(dragging_folder) {
    	$(".open-folder").css('left', dragX - start_drag_x);
    	$(".open-folder").css('top', dragY);
    }
}, false);


$(document).mousemove(function(event) {
    currentMousePos.x = event.pageX;
    currentMousePos.y = event.pageY;
});
$(document).mousedown(function(){
	mouse_down = true;
	// console.log("mouse down");
});
$(document).mouseup(function(){
	mouse_down = false;
	// console.log("mouse up");
});
$(document).on( "keydown", function( event ) {
	if(counting) {
		return;
	}
	else {
		if(event.which == 67) {
			beginTimer();
		}
	}
});

$(document).on( "keyup", function( event ) {
  if(event.which == 67) {
  	counting = false;
  	clearTimeout(clipboard_timer);
  }
});

$(document).on( "keyup", function( event ) {
  if(event.which == 88) {
  	if(small_clipboard_open) {
  		resetPopUp();
  	}
  }
});



function beginTimer() {
	counting = true;
	clipboard_timer = setTimeout(function(){
		sticky_clipboard = true;
		toggleClipboard();
	}, 500);
}

function toggleClipboard() {
	if(clipboard_visible) {
		sticky_clipboard = false;
		$("#clipboard").css('right', "-100%");
		clipboard_visible = false;
		setTimeout(function(){
			clipboard_fully_visible = false;
		}, 700);
		$(".clipboard-hover").show();
	}
	else {
		$("#clipboard").css('right', 0);
		clipboard_visible = true;
		setTimeout(function(){
			clipboard_fully_visible = true;
		}, 700);
	}
}


$(document).on('click', '.arrange-desktop', function(){
	arrangeDesktop();
	$(".context-menu").hide();
});

$(document).on('click', '.paste-option', function(e){
	createPasteCircle(e.pageX - 30, e.pageY - 25);
	$(".context-menu").hide();
});

$(document).ready(function(){
	arrangeDesktop();
	$('.clipboard-hover').hover(function(){
		$(this).hide();
		showClipboard();
	});
	$(".clipboard-hover").on('dragover', function(evt) {
		$(this).hide();
		showClipboard();
	});

	$("#clipboard").hover(function(){
		//Hover In code
	}, function(){
		//Hover out code
		if(!sticky_clipboard) {
			hideClipboard();
		}
	});
	$(".drop-item").mouseenter(function(evt) {
		var id = evt.target.id;
		var hcount = $("#" + id).attr("hcount");
		hcount++;
		$("#" + id).attr("hcount", hcount);
		if (hcount == 2) {
			$("#" + id).attr("hcount", 0);
			copyToClipboard(id);
			// should show clipboard here but doesn't
			sticky_clipboard = true;
			showClipboard();
			setTimeout(function(){hideClipboard()}, 1000);
		}
		setTimeout(function() {
			hcount = $("#" + id).attr("hcount");
			hcount--;
			$("#" + id).attr("hcount", hcount);
		}, 1500);
	});
});

function showClipboard(){
	clipboard_visible = false;
	toggleClipboard();
}

function hideClipboard(){
	clipboard_visible = true;
	toggleClipboard();
}

function addEmptySlot() {
	var empty_slot = '<div class="empty-slot drop-location"></div>'
	$("#clipboard").append(empty_slot);
}

function addFolderEmptySlot() {
	var folderEmptySlot = '<div class="location-holder-folder folder-empty-slot"></div>'
	$(".draggable-area-folder").append(folderEmptySlot);
}

$(document).on('dragstart', ".drop-item", function(evt) {
	if(!$(this).hasClass('in-clipboard')) {
		popUpClipboard();
	}
	evt.originalEvent.dataTransfer.setData("text", evt.target.id);
});

$(document).on('dragstart', ".window-top", function(evt) {
	evt.originalEvent.dataTransfer.setData("text", evt.target.id);
	dragging_folder = true;
	start_drag_x = currentMousePos.x - 270;
});

$(document).on('dragend', ".window-top", function(evt) {
	evt.originalEvent.dataTransfer.setData("text", evt.target.id);
	dragging_folder = false;
});


$(document).on('dragover', "#clipboard", function(evt) {
   evt.preventDefault();
});

$(document).on('dragover', ".popUpClipboard", function(evt) {
   evt.preventDefault();
});

$(document).on('dragend', "body", function(evt) {
	if(small_clipboard_open && !in_popup) {
  		resetPopUp();
  	}
});


$(document).on('dragover', ".desktop-drop-area", function(evt) {
   evt.preventDefault();
});

$(".desktop-drop-area").on('mousedown', function(e) { 
   if( (e.which == 1) ) {
     // left button
     $(".context-menu").hide();
   }if( (e.which == 3) ) {
     // right button
     displayContextMenuAt(currentMousePos.x, currentMousePos.y);
   }else if( (e.which == 2) ) {
      // middle button
   }
   e.preventDefault();
}).on('contextmenu', function(e){
 e.preventDefault();
});

$(document).on('drop', ".desktop-drop-area", function(evt){
	evt.preventDefault();
	var data = evt.originalEvent.dataTransfer.getData("text");
	$("#" + data).parent().css('position', 'absolute');
	$("#" + data).parent().css('top', currentMousePos.y - 30 + "px");
	$("#" + data).parent().css('left', currentMousePos.x - 50 + "px");
});

$(document).on('drop', ".popUpClipboard", function(evt) {
	in_popup = true;
	evt.preventDefault();
	var data = evt.originalEvent.dataTransfer.getData("text");
	var clone = $("#" + data).clone();
	var clones_clone = clone.clone();
	clone_count++;
	clones_clone.attr('id', 'cloned_clone-' + clone_count);
	$(".popUpClipboard").append(clones_clone);
	exitRight();
	clone.attr('id', 'clone-' + clone_count);
	setTimeout(function(){
		if($("#" + data).parent().hasClass('location-holder')) {
			$("#" + data).parent().addClass('empty-location');
		}
		$(".empty-slot").text('');
		$(".empty-slot")[0].appendChild(document.getElementById(data));
		$(".empty-location").append(clone);
		$(".empty-location").removeClass('empty-location');
		$(".empty-slot").addClass('occupied-slot');
		$(".empty-slot").removeClass('empty-slot');
		$("#" + data).addClass("in-clipboard");
		addEmptySlot();
	}, 1000);
});

$(document).on('drop', "#clipboard", function(evt) {
	evt.preventDefault();
	var data = evt.originalEvent.dataTransfer.getData("text");
	copyToClipboard(data);
});

function copyToClipboard(id) {
	var clone = $("#" + id).clone();
	clone_count++;
	clone.attr('id', 'clone-' + clone_count);
	if($("#" + id).parent().hasClass('location-holder')) {
		$("#" + id).parent().addClass('empty-location');
	}
	$(".empty-slot").text('');
	$(".empty-slot")[0].appendChild(document.getElementById(id));
	$(".empty-location").append(clone);
	$(".empty-location").removeClass('empty-location');
	$(".empty-slot").addClass('occupied-slot');
	$(".empty-slot").removeClass('empty-slot');
	$("#" + id).addClass("in-clipboard");
	addEmptySlot();
}

$(document).on('dragover', ".draggable-area-folder", function(evt) {
   evt.preventDefault();
});

$(document).on('drop', ".draggable-area-folder", function(evt) {
	evt.preventDefault();
	var data = evt.originalEvent.dataTransfer.getData("text");
	$(".folder-empty-slot")[0].appendChild(document.getElementById(data));
	$(".folder-empty-slot").removeClass('folder-empty-slot');
	addFolderEmptySlot();
	$("#" + data).removeClass("in-clipboard");
});


$(document).on('click', '.folder', function(){
	if(!first_click) {
		first_click = true;
		$(".open-folder").show();
	}
	first_click = false;
	setTimeout(function () {
		first_click = true;
	}, 500);
});


$(document).on('click', '.close-window', function(){
	$(".open-folder").hide();
});

function popUpClipboard() {
	small_clipboard_open = true;
	$(".popUpClipboard").css('top', currentMousePos.y - 35 + "px");
	$(".popUpClipboard").css('left', currentMousePos.x  + 35 +  "px");
	$(".popUpClipboard").show();
}

function exitRight() {
	showClipboard();
	$(".popUpClipboard").addClass('transition-1s');
	setTimeout(function(){
		var moveToTop = $("#clipboard .empty-slot").offset().top;
		var moveToLeft = $("#clipboard .empty-slot").offset().left;
		if(clipboard_fully_visible) {
			$(".popUpClipboard").css("left", moveToLeft + 6 + "px");
		}
		else {
			$(".popUpClipboard").css("left", moveToLeft  - 175 + "px");
		}
		$(".popUpClipboard").css("top", moveToTop - 15 + "px");
		$(".popUpClipboard").css("background", "transparent");
		$(".popUpClipboard").css("box-shadow", "none");
		$(".popUpClipboard").css("z-index", "999");
		$(".popUpClipboard").css("opacity", "0");
		setTimeout(function(){
			resetPopUp();
			if(!sticky_clipboard) {
				hideClipboard();
			}
		}, 1000);
	}, 100);
}

$(document).on("mousedown", ".draggable-area-folder", function(){
	point_queue = [];
});

$(document).on("mouseup", ".draggable-area-folder", function(e){
	//drawGesture();
	if (detectGesture()) {
		console.log("gesture detected at " + e.pageX + ", " + e.pageY);
		createPasteCircle(e.pageX - 30, e.pageY - 25);
	}
});
$(document).on("mousemove", ".draggable-area-folder", function(e){
	if(mouse_down && clear_to_catch) {
		clear_to_catch = false;
		//console.log(currentMousePos.x + ", " + currentMousePos.y);
		point_queue.push({x: currentMousePos.x, y: currentMousePos.y});
		setTimeout(function(){
			clear_to_catch = true;
		}, guesture_track_time);
	}
});
function resetPopUp() {
	small_clipboard_open = false;
	var newPopUp = "<div class='popUpClipboard'></div>"
	$(".popUpClipboard").remove();
	$("body").append(newPopUp);
	in_popup = false;
}

function drawGesture() {
	$(".drawing-marker").remove();
	for(var i = 0; i < point_queue.length; i++) {
		var to_be_drawn = "<div class='drawing-marker' style='top: " + point_queue[i].y + "px; left: " + point_queue[i].x + "px;'>"+  i + "</div>"
		$("body").prepend(to_be_drawn);
	}
}

function detectGesture() {
	vectors = makeVectors();
	for (var i = 0; i < vectors.length; i++) {
		if (angle(vectors[i], x_axis) != NaN && angle(vectors[i], x_axis) >= 160) {
			for (var j = i; j < vectors.length; j++) {
				if (angle(vectors[i], vectors[j]) != NaN && angle(vectors[i], vectors[j]) >= 70 && angle(vectors[i], vectors[j]) <= 110) {
					return true;
				}
			};
		}
	};
	return false;
}

function makeVectors() {
	vectors = [];
	for (var i = 1; i < point_queue.length; i++) {
		var ii = point_queue[i].x - point_queue[i-1].x;
		var jj = point_queue[i].y - point_queue[i-1].y;
		vectors.push({i: ii, j: jj});
	};
	return vectors;
}

function angle(vector1, vector2) {
	var dotProduct = (vector1.i * vector2.i) + (vector1.j * vector2.j);
	var magnitude1 = Math.sqrt((vector1.i*vector1.i)+(vector1.j*vector1.j));
	var magnitude2 = Math.sqrt((vector2.i*vector2.i)+(vector2.j*vector2.j));
	if (magnitude1 == 0 && magnitude2 == 0) {
		return 0;
	}
	return Math.acos(dotProduct/(magnitude1*magnitude2)) * (180/Math.PI);
}

function createPasteCircle(x,y) {
	dimPage();
	console.log("creating paste circle");
	$(".in-circle").remove();
	var elements = $(".in-clipboard").toArray();
	var angle = 0;
	var angleOffset = 360/elements.length;
	var circle_radius = circle_radius_base + elements.length*5;
	for (var i = elements.length - 1; i >= 0; i--) {
		var id = elements[i].id + "-circle";
		var newElement = "<div id="+id+"></div>";
		$("body").prepend(newElement);
		$("#" + id).addClass(elements[i].classList[0]);
		$("#" + id).addClass(elements[i].classList[1]);
		$("#" + id).addClass('in-circle');
		$("#" + id).removeClass('drop-item');
		var thisY = y - circle_radius*Math.cos(angle*(Math.PI/180));
		var thisX = x + circle_radius*Math.sin(angle*(Math.PI/180));
		$("#" + id).css({'top':y+'px', 'left':x+'px'});
		$("#" + id).animate({top:thisY, left: thisX}, 300);
		angle += angleOffset;
	};
	circle = true;
	skip_first_element = true;
	setTimeout(function() {
		$(".in-circle").mouseleave(function(evt) {
			var id = evt.target.id;
			skip_first_element = false;
			if (circle) {
				pasteCircleItem(id);
				$(".in-circle").remove();
			}
			circle = false;
		});
	}, 300);
		
}

function pasteCircleItem(itemId) {
	$(".folder-empty-slot")[0].appendChild(document.getElementById(itemId));
	$(".folder-empty-slot").removeClass('folder-empty-slot');
	addFolderEmptySlot();
	$(".draggable-area-folder .in-circle").removeClass("in-circle");
	$(".in-circle").remove();
	undimPage();
}

function dimPage() {
	$("body").append("<div class='page-dimmer transition-05s'></div>");
	setTimeout(function(){$(".page-dimmer").css("opacity", 1);}, 10);
}

function undimPage() {
	$(".page-dimmer").remove();
}

function closeCircle() {
	undimPage();
	$(".in-circle").remove();
}

function arrangeDesktop() {
	var onTop = 20;
	var elements = $(".location-holder");
	$(elements).css('top', 0);
	$(elements).css('left', 0);
	offsetX = 0;
	offsetY = 0;
	elements.each(function( i ) {
	$(elements[i]).css('top', offsetY * 90 + onTop + "px");
	$(elements[i]).css('left', offsetX * 90 + "px");
	onTop = 0;
	if( i % 3 == 0 && i!= 0) {
		offsetX++;
	 	offsetY = -1;
	 	onTop = 20;
	}
	offsetY++;
	});
}

function displayContextMenuAt(x, y) {
	$(".context-menu").show();
	$(".context-menu").css('left', x + 5+ 'px');
	$(".context-menu").css('top', y + 5 + 'px');
}