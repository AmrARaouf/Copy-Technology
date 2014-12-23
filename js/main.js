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
$(document).mousemove(function(event) {
    currentMousePos.x = event.pageX;
    currentMousePos.y = event.pageY;
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
	console.log('toggled')
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

$(document).ready(function(){
	$('.clipboard-hover').hover(function(){
		$(this).hide();
		showClipboard();
	});
	$(".clipboard-hover").on('dragover', function(evt) {
		$(this).hide();
		showClipboard();
	});

	$("#clipboard").hover(function(){
		//Hover In cde
	}, function(){
		//Hover out code
		if(!sticky_clipboard) {
			hideClipboard();
		}
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
	var folderEmptySlot = '<div class="location-holder folder-empty-slot"></div>'
	$(".draggable-area-folder").append(folderEmptySlot);
}

$(document).on('dragstart', ".drop-item", function(evt) {
	if(!$(this).hasClass('in-clipboard')) {
		popUpClipboard();
	}
	evt.originalEvent.dataTransfer.setData("text", evt.target.id);
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
	var clone = $("#" + data).clone();
	clone_count++;
	clone.attr('id', 'clone-' + clone_count);
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
});

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

function resetPopUp() {
	small_clipboard_open = false;
	var newPopUp = "<div class='popUpClipboard'></div>"
	$(".popUpClipboard").remove();
	$("body").append(newPopUp);
	in_popup = false;
}