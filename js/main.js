var clipboard_timer;
var counting = false;
var clipboard_visible = false;
var sticky_clipboard = false;
var data;
var first_click = true;
var clone_count = 0;
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
		$(".clipboard-hover").show();
	}
	else {
		$("#clipboard").css('right', 0);
		clipboard_visible = true;
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
		if (hcount == 3) {
			copyToClipboard(id);
			// should show clipboard here but doesn't
			showClipboard();
			//setTimeout(hideClipboard(), 500);
			console.log("showClipboard");
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
	var folderEmptySlot = '<div class="location-holder folder-empty-slot"></div>'
	$(".draggable-area-folder").append(folderEmptySlot);
}

$(document).on('dragstart', ".drop-item", function(evt) {
   evt.originalEvent.dataTransfer.setData("text", evt.target.id);
});

$(document).on('dragover', "#clipboard", function(evt) {
   evt.preventDefault();
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