//make the player a global variable
var carousel;

(function($) {
	jQuery.fn.WeruPlayer = function(options) {
		var self = this;

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

		//play
		self.play = function() {
			hidePlayButton();
		},

		//pause
		self.pause = function() {
			showPlayButton();
		},

		//stop
		self.stop = function() {
		},

		//play previous
		self.prev = function() {
		},

		//play next
		self.next = function() {
		},

		//mute
		self.mute = function() {
		},

		//unmute
		self.unmute = function() {
		},

		//set volume
		self.setVolume = function(newVolume) {
			if (!isNaN(newVolume)) {
				if (newVolume > 100) {
					newVolume = 100;
				}
				self.volume = Math.abs(newVolume);
			}
		},

		//get volume
		self.getVolume = function() {
			return self.volume;
		},

		//get media
		self.getMedia = function(url) {
			//make an AJAX request to get the playlist
			$.ajax({
				'type' : 'get',
				'url' : url,
				'localCache' : true,
				'dataType' : 'json',
				'beforeSend' : function() {
					resetDisplay();
				},
				'success' : function(response) {
					if (response.playlist.length) {
						//create new playlist
						playlist = response.playlist;

						//create carousel
						$('#playlist').html(response.html);
						createCarousel();

						//set the first item in the playlist
						self.setMedia(0);
					}
				},
				'error' : function() {
					alert('There was an error loading your playlist.\nPlease try again and make sure you entered the corect URL.');
				},
				'complete' : function() {
				}
			});
		},
		//set media
		self.setMedia = function(playIndex) {
			var media = playlist[playIndex];

			highlight(playIndex);

			switch(media.type) {
				//youtube
				case 'youtube':
					//check to see if we have already loaded the media
					if (currentYouTube != media.id) {
						playerYouTube.cueVideoById(media.id, 0, 'large');
						currentYouTube = media.id;
					}

					$('#track-title-inner', top.frames['controls-frame'].document).text(media.title);

					if ( typeof callback == 'function') {
						setTimeout(function() {
							callback();
						}, 500);
					}

					break;

				//soundcloud
				case 'soundcloud':
					//check to see if we have already loaded the media
					if (currentSC != media.id) {
						playerSoundCloud.load('http://api.soundcloud.com/tracks/' + media.id, {
							'show_artwork' : true,
							'show_comments' : false,
							'buying' : false,
							'sharing' : false,
							'liking' : false,
							'download' : false,
							'auto_play' : false,
							'callback' : function(response) {
								$('#track-title-inner', top.frames['controls-frame'].document).text(media.title);

								//update the soundcloud duration
								playerSoundCloud['getDuration'](function(value) {
									durationSoundCloud = value;
									$('#duration', top.frames['controls-frame'].document).text(jQuery.jPlayer.convertTime(durationSoundCloud / 1000));
								});

								if ( typeof callback == 'function') {
									callback();
								}
							}
						});

						currentSC = media.id;
					} else {
						$('#track-title-inner', top.frames['controls-frame'].document).text(media.title);

						//update the soundcloud duration
						playerSoundCloud['getDuration'](function(value) {
							durationSoundCloud = value;
							$('#duration', top.frames['controls-frame'].document).text(jQuery.jPlayer.convertTime(durationSoundCloud / 1000));
						});

						if ( typeof callback == 'function') {
							callback();
						}
					}

					break;

				//vimeo
				case 'vimeo':
					if (currentVimeo != media.id) {
						//change the source of the iframe to the new clip
						frameVimeo.attr('src', 'http://player.vimeo.com/video/' + media.id + '?api=1&player_id=vimeo-player&title=0&byline=0&color=ffffff');

						//when the frame has loaded
						frameVimeo.load(function() {
							//update the player title
							$('#track-title-inner', top.frames['controls-frame'].document).text(media.title);

							playerVimeo.api('getDuration', function(value, player_id) {
								durationVimeo = value;

								//update the player time
								$('#duration', top.frames['controls-frame'].document).text(jQuery.jPlayer.convertTime(durationVimeo));
							});

							//callback
							if ( typeof callback == 'function') {
								callback();
							}
						});

						currentVimeo = media.id;
					} else {
						//update the player title
						$('#track-title-inner', top.frames['controls-frame'].document).text(media.title);

						//callback
						if ( typeof callback == 'function') {
							callback();
						}
					}
					break;
			}
		}
		//private variables
		var playlist = [], players = $('#weru-players'), reposInt = null, ready = 0,

		//players
		playerAudio, frameVimeo, playerVimeo, frameSoundCloud, playerSoundCloud, playerYouTube, currentYouTube, currentVimeo, currentSC, currentAudio, widgetURL = 'http://api.soundcloud.com/users/1539950/favorites', currentItem = -1;

		//#########################################
		//youtube
		onYouTubeIframeAPIReady = function(playerId) {
			playerYouTube = new YT.Player('youtube-player', {
				'width' : 445,
				'height' : 274,
				'controls' : 0,
				'events' : {
					'onStateChange' : onPlayerStateChange,
					'onReady' : onPlayerReady
				}
			});
		};

		function onPlayerReady() {
			players.data('ready', ready++);
		}

		function onPlayerStateChange(event) {
			//when it starts playing
			if (event.data == 1) {
				startWatchYT();

				//update the total time
				$('#duration', top.frames['controls-frame'].document).text(jQuery.jPlayer.convertTime(playerYouTube.getDuration()));
			}

			//when it's paused
			if (event.data == 2) {
				showPlayButton();
			}

			//when it ends
			if (event.data == 0) {
				showPlayButton();
			}
		}

		//watchers for youtube
		function startWatchYT() {
			stopWatchYT();

			watchYT = setInterval(function() {
				//update the current time
				$('#current-time', top.frames['controls-frame'].document).text(jQuery.jPlayer.convertTime(playerYouTube.getCurrentTime()));

				//update play bar
				$('#play-bar', top.frames['controls-frame'].document).css({
					'width' : ((playerYouTube.getCurrentTime() / playerYouTube.getDuration()) * 100) + '%'
				});
			}, 1000);
		}

		function stopWatchYT() {
			clearInterval(watchYT);
		}

		//#########################################
		//audio
		playerAudio = $('#audio-player').jPlayer({
			'cssSelectorAncestor' : '#ap-content',
			'swfPath' : "/swf",
			'supplied' : "mp3",
			'wmode' : "opaque",
			'preload' : "auto",
			'ready' : function(event) {
				players.data('ready', ready++);
			},
			'play' : function() {
				settings.onPlay();
			},
			'pause' : function() {
				settings.onPause();
			},
			'ended' : function() {
				settings.onStop();
			},
			'timeupdate' : function(event) {
				//update the current time
				$('#current-time', top.frames['controls-frame'].document).text($.jPlayer.convertTime(event.jPlayer.status.currentTime));

				//update the width of the playbar
				$('#playbar', top.frames['controls-frame'].document).css({
					'width' : event.jPlayer.status.currentPercentRelative + '%'
				});
			},
			'progress' : function(event) {
				//update the duration
				$('#duration', top.frames['controls-frame'].document).text($.jPlayer.convertTime(event.jPlayer.status.duration));
			}
		});

		//#########################################
		//soundcloud
		frameSoundCloud = $('#soundcloud-player');

		//load a URL in the iframe to trigger events
		frameSoundCloud.attr('src', 'http://w.soundcloud.com/player/?url=' + widgetURL + '&auto_play=false&show_artwork=false&buying=false&liking=false&show_comments=false');

		//create the widget
		playerSoundCloud = SC.Widget(frameSoundCloud[0]);

		//add event listeners
		//when the widget is ready to accept external calls
		playerSoundCloud.bind(SC.Widget.Events.READY, function(event) {
			players.data('ready', ready++);
		});

		//when the player starts playing
		playerSoundCloud.bind(SC.Widget.Events.PLAY, function() {
			hidePlayButton();
		});

		//when the player is paused
		playerSoundCloud.bind(SC.Widget.Events.PAUSE, function() {
			showPlayButton();
		});

		//when the player has finished playing
		playerSoundCloud.bind(SC.Widget.Events.FINISH, function() {
		});

		//while playing
		playerSoundCloud.bind(SC.Widget.Events.PLAY_PROGRESS, function() {
			//update the current time
			playerSoundCloud['getPosition'](function(value) {
				$('#current-time', top.frames['controls-frame'].document).text(jQuery.jPlayer.convertTime(value / 1000));
			});

			//update the width of the playbar
			playerSoundCloud['getPosition'](function(value) {
				$('#play-bar', top.frames['controls-frame'].document).css({
					'width' : ((value / durationSoundCloud) * 100) + '%'
				});
			});

		});

		//#########################################
		//vimeo
		frameVimeo = $('#vimeo-player');
		playerVimeo = $f(frameVimeo[0]);

		//add event listeners
		//ready
		playerVimeo.addEvent('ready', function(data) {
		});

		//toggle play/pause buttons
		function hidePlayButton() {
			//hide the play button
			$('#play', top.frames['controls-frame'].document).hide();
			//show the pause button
			$('#pause', top.frames['controls-frame'].document).show();
		}

		function showPlayButton() {
			//show the play button
			$('#play', top.frames['controls-frame'].document).show();

			//hide the pause button
			$('#pause', top.frames['controls-frame'].document).hide();
		}

		//reset display
		function resetDisplay(message) {
			message = message || 'Loading media ...';

			//reset current time
			$('#current-time', top.frames['controls-frame'].document).text('00:00');

			//reset duration
			$('#duration', top.frames['controls-frame'].document).text('00:00');

			//reset title
			$('#track-title-inner', top.frames['controls-frame'].document).text(message);

			//reset the load bar
			$('#load-bar', top.frames['controls-frame'].document).css({
				'width' : 0
			});

			//reset the play bar
			$('#play-bar', top.frames['controls-frame'].document).css({
				'width' : 0
			});
		}

		//create playlist carousel
		function createCarousel() {
			carousel = $('#playlist').bxSlider({
				displaySlideQty : 5,
				autoHover : true,
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
			repositionPlayer();
		}

		//open the player
		function openPlayer(slide) {
			if (slide) {
				$('#playlist li').css('padding-right', 20).filter('.on').animate({
					'padding-right' : 485
				});
				players.css('height', 270).animate({
					'width' : 445
				});
			} else {
				$('#playlist li').css('padding-right', 20).filter('.on').css({
					'padding-right' : 485
				});
				players.css({
					'height' : 270,
					'width' : 445
				});
			}

			repositionPlayer();
		}

		//close player
		function closePlayer(slide) {
			if (slide) {
				$('#playlist li').animate({
					'padding-right' : 20
				});
				players.animate({
					'width' : 0
				}, function() {
					players.css('height', 270);
				});
			} else {
				$('#playlist li').css({
					'padding-right' : 20
				});
				players.css({
					'height' : 0,
					'width' : 0
				});
			}

			repositionPlayer();
		}

		function repositionPlayer() {
			players.css({
				'left' : (carousel.children('li.on').offset().left + 200)
			});
		}

		//when we click on a tile
		$(document).on('click', '#playlist a.tile-image', function() {
			//update the play index
			currentItem = $('#playlist a.tile-image').index(this);

			self.stop();

			//set the new media
			self.setMedia(currentItem, function() {
				self.play();
			});

			return false;
		});

		//when we click on a player toggler
		$(document).on('click', '#playlist b', function() {
			var that = $(this);

			if (that.hasClass('on')) {
				closePlayer(true);
				that.removeClass('on');
			} else {
				openPlayer(true);
				that.addClass('on');
			}

			return false;
		});

		//highlight current item
		function highlight(index) {
			$('#playlist > li b').removeClass('on');
			$('#playlist > li').removeClass('on').eq(index).addClass('on').find('b').addClass('on');
		}

		//pretty tooltips
		$('a[title]').qtip({
			position : {
				my : 'top center',
				at : 'bottom center'
			},
			style : {
				classes : 'ui-tooltip-tipsy'
			}
		});

		//cool dropdown
		$('#channel-select').chosen({});

		//when the player is ready
		self.bind('changeData', function() {
			if (ready == 3) {
				/***********************************/
				// Channel/Playlist Loading
				/***********************************/
				$('#channel-select').on('change propertychange', function() {
					//store the new channel
					currentChannel = $('#channel-select').attr("selectedIndex");

					//get the new media
					self.getMedia($('#channel-select').val(), {}, function(response) {
						//cue the first item
						self.setMedia(playlist[currentItem], function() {
							//play it
							self.play();
						});
					});
				});

				//we first load the playlist
				self.getMedia($('#channel-select').val(), {}, function(response) {
					//then we cue the first item
					self.setMedia(playlist[currentItem], function() {
					});
				});

				settings.onReady();
			}
		});
	};
})(jQuery);
