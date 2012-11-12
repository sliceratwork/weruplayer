(function($) {
	//prevent default action on links
	$('#wp-controls a').click(function() {
		$(this).blur();
		return false;
	});

	//bind actions for each link
	//play
	$('#play').click(function() {
		top.frames['player-frame'].WeruPlayer.play();
	});

	//pause
	$('#pause').click(function() {
		top.frames['player-frame'].WeruPlayer.pause();
	});

	//play previous
	$('#prev').click(function() {
		top.frames['player-frame'].WeruPlayer.prev();
	});

	//play next
	$('#next').click(function() {
		top.frames['player-frame'].WeruPlayer.next();
	});

	//mute
	$('#mute').click(function() {
		top.frames['player-frame'].WeruPlayer.mute();
	});

	//unmute
	$('#unmute').click(function() {
		top.frames['player-frame'].WeruPlayer.unmute();
	});

	//toggle playlist
	$('#toggle-playlist').click(function() {
		if($('#player-frame', top.document).height() > 0){
			$(this).removeClass('on');
			$('#player-frame', top.document).stop().animate({
				'height': 0
			});
		} else {
			$(this).addClass('on');
			$('#player-frame', top.document).stop().animate({
				'height': '325px'
			});
		}
	});
})(jQuery); 