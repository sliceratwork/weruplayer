// This code loads the YouTube IFrame Player API code asynchronously.
var tag = document.createElement('script');
tag.src = "http://www.youtube.com/player_api";
var YTScriptTag = document.getElementsByTagName('script')[0];
YTScriptTag.parentNode.insertBefore(tag, YTScriptTag);

//make the player a global variable
var WeruPlayer, carousel, feedContent;

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
			
			switch(player) {
				//soundcloud
				case 'soundcloud':
					setTimeout(function() {
						playerSoundCloud.play();
					}, 1000);
					break;

				//vimeo
				case 'vimeo':
					setTimeout(function() {
						playerVimeo.api('play');
					}, 700);
					break;

				//youtube
				case 'youtube':
					playerYouTube.playVideo();
					break;

				//audio
				case 'audio':
					playerAudio.jPlayer('play');
					break;
			}

			settings.onPlay();
		},

		//pause
		self.pause = function() {
			showPlayButton();

			switch(player) {
				//soundcloud
				case 'soundcloud':
					playerSoundCloud.pause();
					break;

				//vimeo
				case 'vimeo':
					playerVimeo.api('pause');
					break;

				//youtube
				case 'youtube':
					playerYouTube.pauseVideo();
					break;

				//audio
				case 'audio':
					playerAudio.jPlayer('pause');
					break;
			}

			//callback function
			settings.onPause();
		},

		//stop
		self.stop = function() {
			//soundcloud
			playerSoundCloud.pause();
			
			//vimeo
			playerVimeo.api('unload');
				
			//youtube
			playerYouTube.stopVideo();
			
			//audio
			playerAudio.jPlayer('stop');
		},

		//play previous
		self.prev = function() {
			//decrement the current play index
			if(currentItem > 0){
				currentItem--;
				
				//set new media
				self.setMedia(currentItem, function(){
					self.play();
				});
			} else {
				currentChannel--;
				if(currentChannel < 0){
					currentChannel = $('#channel-select option').length - 1;
				}
				
				currentItem = playlist[playlist.length - 1];
				
				$('#channel-select')[0].selectedIndex = currentChannel;
				$('#channel-select').trigger('change');
				$('#channel-select').trigger('liszt:updated');
			}
		},

		//play next
		self.next = function() {
			//increment the current play index
			if(currentItem < (playlist.length - 1)){
				currentItem++;
				
				//set new media
				self.setMedia(currentItem, function(){
					self.play();
				});
			} else {
				currentChannel++;
				if(currentChannel >= $('#channel-select option').length){
					currentChannel = 0;
				}
				
				$('#channel-select')[0].selectedIndex = currentChannel;
				$('#channel-select').trigger('change');
				$('#channel-select').trigger('liszt:updated');
			}
		},

		//mute
		self.mute = function() {
			//mute jplayer
			playerAudio.jPlayer('mute');
	
			//mute youtube player
			playerYouTube.mute();
	
			//mute vimeo player
			playerVimeo.api('setVolume', 0);
	
			//mute soundcloud player
			playerSoundCloud.setVolume(0);
	
			self.muted = true;
			
			//hide the mute button
				$('#mute', top.frames['controls-frame'].document).hide();
	
				//show the unmute button
				$('#unmute', top.frames['controls-frame'].document).show();
		},

		//unmute
		self.unmute = function() {
			//unmute jplayer
			playerAudio.jPlayer('unmute');
	
			//unmute youtube player
			playerYouTube.unMute();
	
			//unmute vimeo player
			playerVimeo.api('setVolume', settings.volume);
	
			//unmute soundcloud player
			playerSoundCloud.setVolume(settings.volume);
	
			self.muted = false;
			
			try{
				//show the mute button
				$('#mute', top.frames['controls-frame'].document).show();
	
				//hide the unmute button
				$('#unmute', top.frames['controls-frame'].document).hide();
			} catch(e){}
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
		self.getMedia = function(url, callback) {
			//make an AJAX request to get the playlist
			$.ajax({
				'type' : 'get',
				'url' : url,
				'localCache' : true,
				'dataType' : 'json',
				'beforeSend' : function() {
					//hide the controls overlay
					try{
						$('#controls-overlay', top.frames['controls-frame'].document).show();
						$('#playlist-overlay', top.frames['player-frame'].document).show();
					} catch(e){}
					
					resetDisplay();
				},
				'success' : function(response) {
					//cache the response
					feedContent = response;
					
					var len = feedContent.items.length,
						options = '';
					
					//check if we have content
					if (len) {
						//create the options for the channel switcher
						for (var i = 0; i < len; i++) {
							options += '<option id="playlist-' + i + '" value="' + i + '">' + feedContent.items[i].title + '</option>';
						}
						
						//populate the channel switcher
						$('#channel-select').html(options);
						$('#channel-select').trigger('liszt:updated');
						
						//populate the playlist carousel
						$('#playlist').html(feedContent.items[0].tiles);
						
						//create new playlist
						playlist = feedContent.items[0].playlist;
						
						//set current track
						currentItem = 0;
						
						//set channel index
						currentChannel = 0;
						
						//create new carousel
						createCarousel();
						
						//hide the controls overlay
						try{
							$('#controls-overlay', top.frames['controls-frame'].document).hide();
							$('#playlist-overlay', top.frames['player-frame'].document).hide();
						} catch(e){}
						
						if(typeof callback == 'function'){
							callback();
						}
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
		self.setMedia = function(playIndex, callback) {
			//clear youtube interval
			stopWatchYT();
			
			//stop the player
			self.stop();
			
			var media = playlist[playIndex];
			player = media.type;
			
			//clear the display
			resetDisplay();
			
			//highlight currently playing track
			highlight(playIndex);
			
			//toggle players
			$('.player').addClass('player-hidden');
			$('#' + player + '-wrap').removeClass('player-hidden');

			//open the player
			if (!hidden) {
				openPlayer();
			}
			
			//have fun with the page title
			try{
				top.document.title = 'Weru Channels - Now playing "' + media.title + '" by ' + media.artist + ' on "' + feedContent.items[currentChannel].title +'" from "' + feedContent.title + '"';
			} catch(e){}

			switch(player) {
				//youtube
				case 'youtube':
					//check to see if we have already loaded the media
					if (currentYouTube != media.id) {
						playerYouTube.cueVideoById(media.id, 0, 'large');
						currentYouTube = media.id;
					}

					try{
						$('#track-title-inner', top.frames['controls-frame'].document).text(media.title);
					} catch(e){}

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
								try{
									$('#track-title-inner', top.frames['controls-frame'].document).text(media.title);
								} catch(e){}

								//update the soundcloud duration
								playerSoundCloud['getDuration'](function(value) {
									try{
										$('#duration', top.frames['controls-frame'].document).text(jQuery.jPlayer.convertTime(value / 1000));
									} catch(e){}
								});

								if ( typeof callback == 'function') {
									callback();
								}
							}
						});

						currentSC = media.id;
					} else {
						try{
							$('#track-title-inner', top.frames['controls-frame'].document).text(media.title);
						} catch(e){}

						//update the soundcloud duration
						playerSoundCloud['getDuration'](function(value) {
							try{
								$('#duration', top.frames['controls-frame'].document).text(jQuery.jPlayer.convertTime(value / 1000));
							} catch(e){}
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
							try{
								//update the player title
								$('#track-title-inner', top.frames['controls-frame'].document).text(media.title);
							} catch(e){}

							//callback
							if ( typeof callback == 'function') {
								callback();
							}
						});

						currentVimeo = media.id;
					} else {
						try{
							//update the player title
							$('#track-title-inner', top.frames['controls-frame'].document).text(media.title);
						} catch(e){}

						//callback
						if ( typeof callback == 'function') {
							callback();
						}
					}
					
					break;
			}
			
			//make the active tile the second one
			if(playIndex > 1){
				carousel.goToSlide(playIndex - 1);
			}
			
			if(typeof callback == 'function'){
				callback();
			}
		},
		
		//seek to time
		self.seekTo = function(time){
			time = time || 0;
			
			switch(player) {
				//soundcloud
				case 'soundcloud':
					playerSoundCloud.seekTo(time);
					break;

				//vimeo
				case 'vimeo':
					playerVimeo.api('seekTo', time * 1000);
					break;

				//youtube
				case 'youtube':
					playerYouTube.seekTo(time * 1000);
					break;

				//audio
				case 'audio':
					playerAudio.jPlayer( "playHead", time );
					break;
			}
		}
		
		
		//private variables
		var playlist = [], players = $('#weru-players'), reposInt = null, ready = 0, hidden = true, currentChannel = -1,

		//players
		player, playerAudio, frameVimeo, playerVimeo, frameSoundCloud, playerSoundCloud, playerYouTube, currentYouTube, currentVimeo, currentSC, currentAudio, widgetURL = 'http://api.soundcloud.com/users/1539950/favorites', currentItem = -1, watchYT = null, watchYTBuffer = null;

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
			checkReady(++ready);
		}

		function onPlayerStateChange(event) {
			//when it starts playing
			if (event.data == 1) {
				startWatchYT();
				
				startWatchYTBuffer();
				
				//stop other players
				//soundcloud
				playerSoundCloud.pause();
				
				//vimeo
				playerVimeo.api('unload');
				
				//audio
				playerAudio.jPlayer('stop');

				try{
					//update the total time
					$('#duration', top.frames['controls-frame'].document).text(jQuery.jPlayer.convertTime(playerYouTube.getDuration()));
				}catch(e){}
			}

			//when it's paused
			if (event.data == 2) {
				stopWatchYT();
				showPlayButton();
			}

			//when it ends
			if (event.data == 0) {
				stopWatchYT();
				stopWatchYTBuffer();
				showPlayButton();
				
				self.next();
			}
		}

		//watchers for youtube
		function startWatchYT() {
			stopWatchYT();

			watchYT = setInterval(function() {
				try{
					//update the current time
					$('#current-time', top.frames['controls-frame'].document).text(jQuery.jPlayer.convertTime(playerYouTube.getCurrentTime()));
	
					//update play bar
					$('#play-bar', top.frames['controls-frame'].document).css({
						'width' : ((playerYouTube.getCurrentTime() / playerYouTube.getDuration()) * 100) + '%'
					});
				}catch(e){}
			}, 1000);
		}

		function stopWatchYT() {
			clearInterval(watchYT);
		}

		function startWatchYTBuffer() {
			stopWatchYTBuffer();

			watchYTBuffer = setInterval(function() {
				try{
					//check to see if we are on the right player
					if(player == 'youtube'){
						//update load bar
						$('#load-bar', top.frames['controls-frame'].document).css({
							'width' : (playerYouTube.getVideoLoadedFraction() * 100) + '%'
						});
					}
					
					if(playerYouTube.getVideoLoadedFraction() == 1){
						stopWatchYTBuffer();
					}
				}catch(e){}
			}, 1000);
		}
		
		function stopWatchYTBuffer() {
			clearInterval(watchYTBuffer);
		}

		//#########################################
		//audio
		playerAudio = $('#audio-player').jPlayer({
			'cssSelectorAncestor' : '#ap-content',
			'swfPath' : "/swf",
			'supplied' : "mp3",
			'wmode' : "transparent",
			'preload' : "auto",
			'ready' : function(event) {
				checkReady(++ready);
			},
			'play' : function() {
				//stop other players
				//soundcloud
				playerSoundCloud.pause();
				
				//vimeo
				playerVimeo.api('unload');
					
				//youtube
				playerYouTube.stopVideo();
				
				settings.onPlay();
			},
			'pause' : function() {
				settings.onPause();
			},
			'ended' : function() {
				self.next();
				
				settings.onStop();
			},
			'timeupdate' : function(event) {
				try{
					//update the current time
					$('#current-time', top.frames['controls-frame'].document).text($.jPlayer.convertTime(event.jPlayer.status.currentTime));
	
					//update the width of the playbar
					$('#playbar', top.frames['controls-frame'].document).css({
						'width' : event.jPlayer.status.currentPercentRelative + '%'
					});
				} catch(e){}
			},
			'progress' : function(event) {
				try{
					//update the duration
					$('#duration', top.frames['controls-frame'].document).text($.jPlayer.convertTime(event.jPlayer.status.duration));
				} catch(e){}
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
			checkReady(++ready);
		});
		
		//while the sound is loading
		playerSoundCloud.bind(SC.Widget.Events.LOAD_PROGRESS, function(data){
			try{
				//check to see if we are on the right player
				if(player == 'soundcloud'){
					//update load bar
					$('#load-bar', top.frames['controls-frame'].document).css({
						'width' : (data[0].loadedProgress * 100) + '%'
					});
				}
			}catch(e){}
		});

		//when the player starts playing
		playerSoundCloud.bind(SC.Widget.Events.PLAY, function() {
			//mute the player
			if(self.muted){
				playerSoundCloud.setVolume(0);
			}
			
			//stop other players
			//vimeo
			playerVimeo.api('unload');
				
			//youtube
			playerYouTube.stopVideo();
			
			//audio
			playerAudio.jPlayer('stop');
			
			hidePlayButton();
		});

		//when the player is paused
		playerSoundCloud.bind(SC.Widget.Events.PAUSE, function() {
			showPlayButton();
		});

		//when the player has finished playing
		playerSoundCloud.bind(SC.Widget.Events.FINISH, function() {
			showPlayButton();
			
			self.next();
		});

		//while playing
		playerSoundCloud.bind(SC.Widget.Events.PLAY_PROGRESS, function(data) {
			try{
				playerSoundCloud['getPosition'](function(value) {
					//update the current time
					$('#current-time', top.frames['controls-frame'].document).text(jQuery.jPlayer.convertTime(value / 1000));
				});
				
				//update the width of the playbar
				$('#play-bar', top.frames['controls-frame'].document).css({
					'width' : (data[0].relativePosition * 100) + '%'
				});
			} catch(e){}
		});

		//#########################################
		//vimeo
		frameVimeo = $('#vimeo-player');
		playerVimeo = $f(frameVimeo[0]);

		//add event listeners
		//ready
		playerVimeo.addEvent('ready', function(data) {
			checkReady(++ready);
			
			 playerVimeo.addEvent('loadProgress', function(data) {
			 	try{
			 		//check to see if we are on the right player
			 		if(player == 'vimeo') {
			 			//update the load bar width
		                $('#load-bar', top.frames['controls-frame'].document).css({
							'width' : (data.percent * 100) + '%'
						});
						
						//update the total video duration
						$('#duration', top.frames['controls-frame'].document).text(jQuery.jPlayer.convertTime(parseInt(data.duration)));
			 		}
			 	} catch(e){}
            });
			
			//update the current time
			playerVimeo.addEvent('playProgress', function (data) {
                try{
                	//update the current time
	                $('#current-time', top.frames['controls-frame'].document).text(jQuery.jPlayer.convertTime(parseInt(data.seconds)));
	                
	                //update the play bar width
	                $('#play-bar', top.frames['controls-frame'].document).css({
						'width' : (data.percent * 100) + '%'
					});
                } catch(e){}
            });
            
            //when the player plays
            playerVimeo.addEvent('play', function (data) {
        		//mute the player
				if(self.muted){
					playerVimeo.api('setVolume', 0);
				}
				
				//stop other players
				//soundcloud
				playerSoundCloud.pause();
					
				//youtube
				playerYouTube.stopVideo();
				
				//audio
				playerAudio.jPlayer('stop');
            	
            	hidePlayButton();
            });
            
            //when the player ends
            playerVimeo.addEvent('finish', function() {
            	showPlayButton();
            	
            	self.next();
			});
		});

		//toggle play/pause buttons
		function hidePlayButton() {
			try{
				//hide the play button
				$('#play', top.frames['controls-frame'].document).hide();
				//show the pause button
				$('#pause', top.frames['controls-frame'].document).show();
			} catch(e){}
		}

		function showPlayButton() {
			try{
				//show the play button
				$('#play', top.frames['controls-frame'].document).show();
				//hide the pause button
				$('#pause', top.frames['controls-frame'].document).hide();
			} catch(e){}
		}

		//reset display
		function resetDisplay(message) {
			message = message || 'Loading media ...';

			try{
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
			} catch(e){}
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
		}

		//open the player
		function openPlayer(slide) {
			if (slide) {
				$('#playlist li').css('padding-right', 20).filter('.on').stop().animate({
					'padding-right' : 485
				});
				players.css('height', 275).stop().animate({
					'width' : 445
				});
			} else {
				$('#playlist li').css('padding-right', 20).filter('.on').css({
					'padding-right' : 485
				});
				players.css({
					'height' : 275,
					'width' : 445
				});
			}

			hidden = false;

			repositionPlayer();
		}

		//close player
		function closePlayer(slide) {
			if (slide) {
				$('#playlist li').stop().animate({
					'padding-right' : 20
				});
				players.stop().animate({
					'width' : 0
				}, function() {
					players.css('height', 275);
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

			hidden = true;

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
			$('#playlist > li').removeClass('on').eq(index).addClass('on');
			if (!hidden) {
				$('#playlist > li.on b').addClass('on');
			}
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

		//channel/playlist
		$('#channel-select').chosen();
		$('#channel-select').bind('change propertychange', function() {
			try{
				carousel.destroyShow();
			}catch(err){}
			
			//clear the display
			resetDisplay();
			
			//update the playlist
			playlist = feedContent.items[$(this).val()].playlist;
			
			//update the playlist carousel
			$('#playlist').html(feedContent.items[$(this).val()].tiles);
			
			//set new channel index
			currentChannel = $('#channel-select')[0].selectedIndex;
			
			//update current track
			currentItem = 0;
			
			//update the carousel
			createCarousel();
			
			//set new media
			self.setMedia(currentItem, function(){
				//play new playlist
				self.play();
			});
		});

		//when the player is ready
		function checkReady(ready){
			if(ready == 4){
				//we first load the playlist
				self.getMedia(feed, function(){
					self.setMedia(0);
				});

				settings.onReady();
			}
		}

		return this;
	};

	WeruPlayer = jQuery('#weru-players').WeruPlayer({
		'onReady' : function() {
		}
	});
})(jQuery);
