var clipboard_timer;
var counting = false;
var clipboard_visible = false;
var sticky_clipboard = false;
var data;
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
	var empty_slot = '<div class="empty-slot drop-location"><i class="fa fa-plus-circle"></i>Copy</div>'
	$("#clipboard").append(empty_slot);
}

$(document).on('dragstart', ".drop-item", function(evt) {
   evt.originalEvent.dataTransfer.setData("text", evt.target.id);
});

$(document).on('dragover', ".drop-location", function(evt) {
   evt.preventDefault();
});

$(document).on('drop', ".drop-location", function(evt) {
	evt.preventDefault();
	var data = evt.originalEvent.dataTransfer.getData("text");
	$(this).text('');
	$(this).removeClass('empty-slot');
	$(this).removeClass('drop-location');
	$(this).addClass('occupied-slot');
	evt.target.appendChild(document.getElementById(data));
	addEmptySlot();
});