/* Media types */
/*
1 - soundcloud
2 - vimeo
3 - youtube
5 - audio files (mp3, ogg, wma)
*/

//youtupe iframe API
var tag = document.createElement('script');
tag.src = "//www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var WP;

//WERU player
jQuery.fn.WeruPlayer = function(options) {
	//default methods and properties for the player
	defaults = {
		'onReady' : function() {
		},
		'onPlay' : function() {
		},
		'onPause' : function() {
		},
		'onStop' : function() {
		},
		'onPlayPrev' : function() {
		},
		'onPlayNext' : function() {
		},
		'onEnded' : function() {
		},
		'onMute' : function() {
		},
		'onUnMute' : function() {
		},
		'volume' : 100,
		'autoplay' : false,
		'reapeat' : false,
		'muted' : false
	},

	//extend defaults with user options
	settings = jQuery.extend(defaults, options);

	//set up internal variables
	var self = this, ytCurrentTime, vimeoplayerDuration = 0, jplayer, vimeoIframe, vimeoplayer, soundcloudIframe, scplayer, ytplayer, playerReady = 0, reposInt = null, wpPlayers = jQuery('#weru-players'), wpControls = jQuery('#wp-controls a'), wpPlay = jQuery('#wp-play'), wpPause = jQuery('#wp-pause'), wpStop = jQuery('#wp-stop'), wpPrev = jQuery('#wp-prev'), wpNext = jQuery('#wp-next'), wpMute = jQuery('#wp-mute'), wpUnmute = jQuery('#wp-unmute'), wpTrackTitle = jQuery('#track-title-inner'), wpProgressBar = jQuery('#wp-progress-bar'), wpPlaybar = jQuery('#wp-play-bar'), wpLoadbar = jQuery('#wp-load-bar'), wpPlaylist = jQuery('#playlist'), wpPlaylistWrap = jQuery('#playlist-wrap'), wpCurrentTime = jQuery('#wp-current-time'), wpDuration = jQuery('#wp-duration'), wpTogglePlaylist = jQuery('#wp-toggle-playlist'), wpTogglePlayer = wpPlaylist.find('.toggle-player'), wpPlayItems = wpPlaylist.find('a[data-item]'), wpChannel = jQuery('#playlist-channel'), wpTitle = jQuery('#playlist-title'), wpCarousel, playlist = [], currentItem = -1, currentChannel = 0;

	var ploffset;

	$(window).bind('resize', function() {
		ploffset = $('#playlist-outer').offset()
	});

	//need to set up YT functions as global variables
	onYouTubeIframeAPIReady = function(playerId) {
		ytplayer = new YT.Player('player3', {
			events : {
				'onReady' : onPlayerReady,
				'onStateChange' : onPlayerStateChange
			}
		});
	};

	//listen when YT player is ready
	onPlayerReady = function() {
		self.data('ready', playerReady++);
	}
	//listen for YT player changes
	onPlayerStateChange = function(event) {
		//when it starts playing
		if (event.data == 1) {
			//toggle play/pause controls
			wpPlay.hide();
			wpPause.show();

			//every 1 second
			if (!ytCurrentTime) {
				ytCurrentTime = window.setInterval(function() {
					//update the current time
					wpCurrentTime.text(jQuery.jPlayer.convertTime(ytplayer.getCurrentTime()));

					//update the loadbar
					// if(ytplayer.getVideoLoadedFraction() < 1){
					// 	wpLoadbar.css({
					// 		'width': (ytplayer.getVideoLoadedFraction().toFixed(2) * 100) + '%'
					// 	});
					// }

					//update the playbar
					wpPlaybar.css({
						'width' : ((ytplayer.getCurrentTime() / ytplayer.getDuration()) * 100) + '%'
					});
				}, 1000);
			}

			// //update the video duration
			setTimeout(function() {
				wpDuration.text(jQuery.jPlayer.convertTime(ytplayer.getDuration()));
			}, 500);
		}

		//when it's paused
		if (event.data == 2) {
			//toggle play/pause controls
			wpPlay.show();
			wpPause.hide();
		}

		//when it ends
		if (event.data == 0) {
			//toggle play/pause controls
			wpPlay.show();
			wpPause.hide();

			//clear youtube interval
			if (ytCurrentTime) {
				window.clearInterval(ytCurrentTime);
				ytCurrentTime = null;
			}

			//if we play the last item
			onPlayLast();
		}
	};

	//jplayer
	jplayer = jQuery('#jplayer').jPlayer({
		'cssSelectorAncestor' : '#player5',
		'swfPath' : "/components/swf",
		'supplied' : "mp3",
		'wmode' : "opaque",
		'preload' : "auto",
		'ready' : function(event) {
			//update ready status
			self.data('ready', playerReady++);
		},
		'play' : function() {
			//toggle play/pause controls
			wpPlay.hide();
			wpPause.show();

			settings.onPlay();
		},
		'pause' : function() {
			//toggle play/pause controls
			wpPlay.show();
			wpPause.hide();

			settings.onPause();
		},
		'ended' : function() {
			//toggle play/pause controls
			wpPlay.show();
			wpPause.hide();

			onPlayLast();
		},
		'timeupdate' : function(event) {
			//update the current time
			wpCurrentTime.text(jQuery.jPlayer.convertTime(event.jPlayer.status.currentTime));

			//update the width of the playbar
			wpPlaybar.css({
				'width' : event.jPlayer.status.currentPercentRelative + '%'
			});
		},
		'progress' : function(event) {
			//update the duration
			wpDuration.text(jQuery.jPlayer.convertTime(event.jPlayer.status.duration));
		}
	});

	//vimeo player
	vimeoIframe = jQuery('#player2');
	vimeoplayer = $f(vimeoIframe[0]);

	vimeoplayer.addEvent('ready', function() {
		vimeoplayer.api('getDuration', function(value, player) {
			vimeoplayerDuration = value;
		});

		//update ready status
		self.data('ready', playerReady++);

		//when it's playing
		vimeoplayer.addEvent('onPlay', function() {
			//toggle play/pause controls
			wpPlay.hide();
			wpPause.show();

			settings.onPlay();
		});

		//when it's paused
		vimeoplayer.addEvent('onPause', function() {
			//toggle play/pause controls
			wpPlay.show();
			wpPause.hide();

			settings.onPause();
		});

		//when it's finished
		vimeoplayer.addEvent('onFinish', function() {
			//toggle play/pause controls
			wpPlay.show();
			wpPause.hide();

			//if we play the last item
			onPlayLast();
		});

		wpDuration.text(jQuery.jPlayer.convertTime(vimeoplayerDuration));
	});

	//soundcloud
	soundcloudIframe = jQuery('#player1');
	scplayer = SC.Widget(soundcloudIframe[0]);

	//when the player is ready
	scplayer.bind(SC.Widget.Events.READY, function(event) {
		//update ready status
		self.data('ready', playerReady++);

		//when the player starts playing
		scplayer.bind(SC.Widget.Events.PLAY, function() {
			//when we play the soundcloud player
			wpPlay.hide();
			wpPause.show();

			//fire the onPlay function
			settings.onPlay();
		});

		//when the player is paused
		scplayer.bind(SC.Widget.Events.PAUSE, function() {
			//when we pause the soundcloud player
			wpPlay.show();
			wpPause.hide();

			//fire the onPause function
			settings.onPause();
		});

		//when the player has finished playing
		scplayer.bind(SC.Widget.Events.FINISH, function() {
			//if we play the last item
			onPlayLast();
		});

		//while playing
		scplayer.bind(SC.Widget.Events.PLAY_PROGRESS, function() {
			//update the current time
			scplayer['getPosition'](function(value) {
				wpCurrentTime.text(jQuery.jPlayer.convertTime(value / 1000));
			});

			//update the width of the playbar
			scplayer['getPosition'](function(value) {
				wpPlaybar.css({
					'width' : ((value / scplayerDuration) * 100) + '%'
				});
			});

		});

		//set new volume level
		scplayer.setVolume(settings.volume);
	});

	//create playlsit carousel
	function createCarousel() {
		wpCarousel = wpPlaylist.bxSlider({
			displaySlideQty : 5,
			autoHover : true,
			prevImage : '/components/images/icons/carousel-prev.png',
			nextImage : '/components/images/icons/carousel-next.png',
			infiniteLoop : false,
			onAfterSlide : function(currentSlideNumber, totalSlideQty, currentSlideHtmlObject) {
				if (reposInt) {
					repositionPlayer();
					window.clearInterval(reposInt);
					reposInt = null;
				}
			},
			onBeforeSlide : function(currentSlideNumber, totalSlideQty, currentSlideHtmlObject) {
				if (!reposInt) {
					reposInt = window.setInterval(function() {
						repositionPlayer();
					}, 30);
				}
			},
			onPrevSlide : function(currentSlideNumber, totalSlideQty, currentSlideHtmlObject) {

			},
			onNextSlide : function(currentSlideNumber, totalSlideQty, currentSlideHtmlObject) {

			}
		});
	}

	//reposition player
	function repositionPlayer() {
		wpPlayers.css({
			'left' : (wpPlaylist.children('li.on').offset().left + 200 - ploffset.left)
		});
	}

	//toggle players
	function togglePlayer(id) {
		//hide all players
		jQuery('.player-wrap').addClass('player-hidden');

		if (id != 5) {
			jQuery('#player-wrap' + id).removeClass('player-hidden');
		}
	}

	/***********************************/
	//Get media
	/***********************************/
	self.getMedia = function(url, data, callback) {
		data = ( typeof data === 'undefined') ? {} : data;

		//if we provide a URL
		if (url) {
			//make an AJAX request
			jQuery.ajax({
				'type' : 'get',
				'url' : url,
				'data' : data,
				'dataType' : 'json',
				'beforeSend' : function() {
					//reset the display
					self.clear();
				},
				'success' : function(response) {
					//if we have items in the channel/genre
					if (response.version == '1' && response.tiles.length) {
						//destroy the previous playlist
						self.destroy();

						//new tiles for the carousel
						var tiles = '';

						//loop over them
						for (var x = 0, len = response.tiles.length; x < len; x++) {
							//look for data links
							var tile = jQuery(response.tiles[x]).find('a[data-item]');

							if (tile.length) {
								//parse the JSON encoded information
								var json = jQuery.parseJSON(Base64.decode(tile.data('item')));

								//if it's a valid type
								if ((json != null) && ((json.type == 1) || (json.type == 2) || (json.type == 3))) {
									//add it to the playlist
									playlist.push(json);

									//add it to the tiles for the carousel
									tiles += '<li>' + response.tiles[x] + '<span class="wp-toggle-players"><i></i></span><a href="#" class="toggle-player" title="Toggle the player"></a></li>';
								}
							}
						}

						//add the tiles to the playlist
						wpPlaylist.html(tiles);

						//find all playable links
						wpPlayItems = wpPlaylist.find('a[data-item]');

						//reset the current index
						currentItem = 0;

						//playlist carousel
						createCarousel();
					}

					//if we provide a callback function
					if ( typeof callback == 'function') {
						//run it
						setTimeout(function(){
							callback(response);
						}, 500);
					}
				},
				'error' : function(err) {
					//console.log('Get-Channel Error', err);
				}
			});
		}
	};

	/***********************************/
	//Set media
	/***********************************/
	self.setMedia = function(media, callback) {
		//check to see if we have media
		if (media) {
			//store the current player
			self.player = media.type;

			//stop all other players
			self.stopOthers();

			//close the current player
			self.closePlayer();

			//show the track title
			wpTrackTitle.text(media.title);

			//highlight current item
			wpPlaylist.children('li.pager').removeClass('on').eq(currentItem).addClass('on');

			//toggle players
			togglePlayer(media.type);

			//reposition player
			repositionPlayer();

			switch(self.player) {
				//soundcloud
				case 1:
					scplayer.load('http://api.soundcloud.com/tracks/' + media.file.id, {
						'show_artwork' : true,
						'show_comments' : false,
						'buying' : false,
						'sharing' : false,
						'linkg' : false,
						'download' : false,
						'auto_play' : false,
						'callback' : function() {
							//update the duration
							scplayer['getDuration'](function(value) {
								scplayerDuration = value;
								wpDuration.text(jQuery.jPlayer.convertTime(scplayerDuration / 1000));
							});

							//if the player is muted, mute the soundcloud player
							if (self.muted) {
								self.mute();
							}

							//if we provide a callback function
							if ( typeof callback == 'function') {
								//run it
								setTimeout(function() {
									callback();
								}, 400);
							}
						}
					});
					break;

				//vimeo
				case 2:
					vimeoIframe.attr({
						'src' : 'http://player.vimeo.com/video/' + media.file.id + '?api=1'
					}).load(function() {
						vimeoplayer.api('getDuration', function(value, player) {
							vimeoplayerDuration = value;

							//update the player time
							wpDuration.text(jQuery.jPlayer.convertTime(vimeoplayerDuration));
						});

						//if we provide a callback function
						if ( typeof callback == 'function') {
							//run it
							setTimeout(function() {
								callback();
							}, 400);
						}
					});
					break;

				//youtube
				case 3:
					ytplayer.cueVideoById(media.file.id);

					//if we provide a callback function
					if ( typeof callback == 'function') {
						//run it
						callback();
					}
					break;

				//audio
				case 5:
					jplayer.jPlayer('setMedia', {
						'mp3' : media.file.mp3
					});

					//if we provide a callback function
					if ( typeof callback == 'function') {
						//run it
						callback();
					}
					break;
			}
		} else {
			//console.error('You need to pass an object as an argument.', media);
		}
	};

	/***********************************/
	//Ready
	/***********************************/
	self.bind('changeData', function() {
		//check to see if all the players are loaded
		if (playerReady == 3) {
			setTimeout(function() {
				/***********************************/
				// Channel/Playlist Loading
				/***********************************/
				wpChannel.chosen().on('change propertychange', function() {
					//store the new channel
					currentChannel = wpChannel.attr("selectedIndex");

					//get the new media
					self.getMedia(wpChannel.val(), {}, function(response) {
						//cue the first item
						self.setMedia(playlist[currentItem], function() {
							//play it
							self.play();
						});
					});
				});

				//we first load the playlist
				self.getMedia(wpChannel.val(), {}, function(response) {
					//then we cue the first item
					self.setMedia(playlist[currentItem], function() {
					});
				});

				//play
				wpPlay.unbind().click(function() {
					self.play();
				});

				//pause
				wpPause.unbind().click(function() {
					self.pause();
				});

				//stop track
				wpStop.unbind().click(function() {
					self.stop();
				});

				//previous track
				wpPrev.unbind().click(function() {
					self.playPrev();
				});

				//next track
				wpNext.unbind().click(function() {
					self.playNext();
				});

				//mute
				wpMute.unbind().click(function() {
					self.mute();
				});

				//unmute
				wpUnmute.click(function() {
					self.unmute();
				});

				//when we click the progressbar
				wpProgressBar.click(function(e) {
					//get the progressbar offset
					var offset = wpProgressBar.offset(),
					//get the "width" of the click
					progressBarWidth = e.pageX - offset.left, playBarWidth = (progressBarWidth / 270) * 100;

					//set the playbar width
					wpPlaybar.css({
						'width' : progressBarWidth
					});

					//if the current player is soundcloud
					if (self.player == 1) {
						//skip to the point we clicked on
						scplayer.seekTo((progressBarWidth / 270) * scplayerDuration);
					}

					//if the current player is vimeo
					if (self.player == 2) {
						//skip to the point we clicked on
						vimeoplayer.api('seekTo', (progressBarWidth / 270) * vimeoplayerDuration);
					}

					//if the current player is youtube
					if (self.player == 3) {
						//skip to the point we clicked on
						ytplayer.seekTo((progressBarWidth / 270) * ytplayer.getDuration());
					}

					//if the current player is jplayer (audio)
					if (self.player == 5) {
						//skip to the point we clicked on
						jplayer.jPlayer('playHead', playBarWidth);
					}
				});

				//if we click a data item in the playlist
				wpPlaylist.on('click', 'a[data-item]', function(event) {
					//clear the display
					self.clear();

					//set the current index
					currentItem = wpPlayItems.index(this);

					//set the media
					self.setMedia(playlist[currentItem], function() {
						//and play it
						self.play();
					});

					if (currentItem > 1) {
						wpCarousel.goToSlide(currentItem - 1);
					}

					if (currentItem == 1) {
						wpCarousel.goToSlide(0);
					}

					return false;
				});

				//if we click the toggle player button
				wpPlaylist.on('click', 'a.toggle-player', function(event) {
					//check the button state
					if ($(this).hasClass('on')) {
						$(this).removeClass('on');

						//close the player
						self.closePlayer();
					} else {
						$(this).addClass('on');

						//open the player
						self.openPlayer();
					}

					return false;
				});

				//toggle the playlist
				wpTogglePlaylist.click(function() {
					$(this).toggleClass('on');
					$(this).blur();
					wpPlaylistWrap.slideToggle();

					repositionPlayer();

					return false;
				});

				setTimeout(function() {
					wpPlaylistWrap.hide();
				}, 600);

				ploffset = $('#playlist-outer').offset();

				//fire on ready function
				settings.onReady();
			}, 500);
		}
	});

	/***********************************/
	//Play
	/***********************************/
	self.play = function() {
		switch(self.player) {
			//soundcloud
			case 1:
				setTimeout(function() {
					scplayer.play();
				}, 500);
				break;

			//vimeo
			case 2:
				setTimeout(function() {
					vimeoplayer.api('play');
				}, 500);
				break;

			//youtube
			case 3:
				ytplayer.playVideo();
				break;

			//audio
			case 5:
				jplayer.jPlayer('play');
				break;

			//everything else
			default:
				currentItem++;
				self.playNext();
				break;
		}

		//clear youtube interval
		if (ytCurrentTime) {
			window.clearInterval(ytCurrentTime);
			ytCurrentTime = null;
		}

		//mute players
		if (self.muted) {
			self.mute();
		}

		//toggle controls
		wpPlay.hide();
		wpPause.show();

		//callbacks
		settings.onPlay();

		//if the current item is not visible, slide to it
		if (currentItem > 4) {
			//wpCarousel.goToNextSlide();
		}
	};

	/***********************************/
	//Pause
	/***********************************/
	self.pause = function() {
		switch(self.player) {
			//soundcloud
			case 1:
				scplayer.pause();
				break;

			//vimeo
			case 2:
				vimeoplayer.api('pause');
				break;

			//youtube
			case 3:
				ytplayer.pauseVideo();
				break;

			//audio
			case 5:
				jplayer.jPlayer('pause');
				break;
		}

		//toggle controls
		wpPlay.show();
		wpPause.hide();

		//callbacks
		settings.onPause();
	};

	/***********************************/
	//Stop
	/***********************************/
	self.stop = function() {
		switch(self.player) {
			//soundcloud
			case 1:
				scplayer.pause();
				break;

			//vimeo
			case 2:
				vimeoplayer.api('unload');
				break;

			//youtube
			case 3:
				ytplayer.stopVideo();
				break;

			//audio
			case 5:
				jplayer.jPlayer('stop');
				break;
		}

		//toggle controls
		wpPlay.show();
		wpPause.hide();

		//callbacks
		settings.onStop();
	};

	/***********************************/
	//Stop
	/***********************************/
	self.stopOthers = function() {
		switch(self.player) {
			//soundcloud
			case 1:
				vimeoplayer.api('unload');
				ytplayer.stopVideo();
				jplayer.jPlayer('stop');
				break;

			//vimeo
			case 2:
				scplayer.pause();
				ytplayer.stopVideo();
				jplayer.jPlayer('stop');
				break;

			//youtube
			case 3:
				scplayer.pause();
				vimeoplayer.api('unload');
				jplayer.jPlayer('stop');
				break;

			//audio
			case 5:
				scplayer.pause();
				vimeoplayer.api('unload');
				ytplayer.stopVideo();
				break;
		}

		//toggle controls
		wpPlay.show();
		wpPause.hide();

		//callbacks
		settings.onStop();
	};

	/***********************************/
	//Play previous
	/***********************************/
	self.playPrev = function() {
		//clear the display
		self.clear();

		if (currentItem > 0) {
			//skip to next index in playlist
			currentItem--;
		}

		//set new media
		self.setMedia(playlist[currentItem], function() {
			//play it
			self.play();
		});

		//go to next slide
		wpCarousel.goToPreviousSlide();
	};

	/***********************************/
	//Play next
	/***********************************/
	self.playNext = function() {
		//clear the display
		self.clear();

		if (currentItem < playlist.length - 1) {
			//skip to next index in playlist
			currentItem++;
		} else {
			currentItem = 0;
		}

		//set new media
		self.setMedia(playlist[currentItem], function() {
			//play it
			self.play();
		});

		//go to next slide
		wpCarousel.goToNextSlide();
	};

	/***********************************/
	//Mute
	/***********************************/
	self.mute = function() {
		//mute jplayer
		jplayer.jPlayer('mute');

		//mute youtube player
		ytplayer.mute();

		//mute vimeo player
		vimeoplayer.api('setVolume', 0);

		//mute soundcloud player
		scplayer.setVolume(0);

		self.muted = true;

		//toggle controls
		wpMute.hide();
		wpUnmute.show();
	};

	/***********************************/
	//Unmute
	/***********************************/
	self.unmute = function() {
		//unmute jplayer
		jplayer.jPlayer('unmute');

		//unmute youtube player
		ytplayer.unMute();

		//unmute vimeo player
		vimeoplayer.api('setVolume', settings.volume);

		//unmute soundcloud player
		scplayer.setVolume(settings.volume);

		self.muted = false;

		//toggle controls
		wpMute.show();
		wpUnmute.hide();
	};

	/***********************************/
	//Set volume
	/***********************************/
	self.setVolume = function(volume) {
		//if volume is not a number, default to settings volume
		if (!isNaN(volume)) {
			settings.volume = volume;
			self.unmute();
		}

		//set soundcloud volume
		scplayer.setVolume(settings.volume);

		//set jplayer volume
		jplayer.jPlayer('volume', settings.volume / 100);

		//set youtube player volume
		ytplayer.setVolume(settings.volume);

		//set vimeo player volume
		vimeoplayer.api('setVolume', settings.volume);

	};

	/***********************************/
	//Get volume
	/***********************************/
	self.getVolume = function(volume) {
		return settings.volume;
	};

	/***********************************/
	//Clear player durations and set a loading message
	/***********************************/
	self.clear = function(message) {
		message = message || 'Loading media ...';

		wpTrackTitle.text(message);
		wpDuration.text('00:00');
		wpCurrentTime.text('00:00');
		wpPlaybar.css({
			'width' : 0
		});
	}
	/***********************************/
	//When the last item in the playlist is done playing
	/***********************************/
	function onPlayLast() {
		//if the current item is the last in the playlist
		if (((currentItem + 1) == playlist.length) && (wpChannel.find('option').length > 1)) {
			//set the player to autoplay
			self.autoplay = true;

			//skip to the next channel
			loadChannel();

			//on player ended
			settings.onEnded();
		} else {
			//play the next track
			self.playNext();
			settings.onPlayNext();
		}
	}

	/***********************************/
	// Load a new channel
	/***********************************/
	loadChannel = function() {
		if (currentChannel < wpChannel.find('option').length) {
			currentChannel++;
		} else {
			currentChannel = 0;
		}
		wpChannel.val(wpChannel.find('option').eq(currentChannel).val());
		wpChannel.change().trigger("liszt:updated");
	}
	/***********************************/
	// Open the player
	/***********************************/
	self.openPlayer = function() {
		//expand the current tile
		wpPlaylist.find('li.on').animate({
			'padding-right' : 465
		});

		//expand the player
		wpPlayers.height(270);

		wpPlayers.animate({
			'width' : 465
		});

		//set a cookie for the player state
		$.cookie('player-opened', true);
	}
	/***********************************/
	// Close the player
	/***********************************/
	self.closePlayer = function() {
		//contract the current tile
		wpPlaylist.children('li.on').animate({
			'padding-right' : 20
		}, function() {
			//reposition the player
			repositionPlayer();
		});

		//contract the player
		wpPlayers.animate({
			'width' : 1
		}, function() {
			wpPlayers.height(1);
		});

		//remove active state from togglers
		jQuery('a.toggle-player').removeClass('on');

		//set a cookie for the player state
		$.cookie('player-open', false);
	}
	/***********************************/
	// Destroy the player
	/***********************************/
	self.destroy = function() {
		//stop the player
		self.stop();

		//reset the playlist to an empty array
		playlist = [];

		//clear the display
		self.clear();

		//destroy the carousel
		if ( typeof wpCarousel != 'undefined') {
			//wpCarousel.destroyShow();
		}

		//remove items from playlist
		wpPlaylist.children().remove();
	}
}
//on document ready
jQuery(document).ready(function() {
	//if we have the correct DOM
	if (jQuery('#weru-player').length) {
		//create an instance of the Weru Player
		WP = jQuery('#weru-player').WeruPlayer({
			'autoplay' : false,
			'volume' : 30,
			'onReady' : function() {
				$('#player-notice').fadeIn();
			},
			'onPlay' : function() {
				//window.console.log('Started playing');
			},
			'onPause' : function() {
				//window.console.log('Player paused');
			},
			'onStop' : function() {
				//window.console.log('Player stopped');
			},
			'onEnded' : function() {
				//window.console.log('Playing ended');
			}
		});
	}
});
