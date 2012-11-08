<!DOCTYPE html>
	<!-- saved from url=(0014)about:internet -->
	<!--[if lt IE 7]> <html itemscope itemtype="http://schema.org/Blog" xmlns="http://www.w3.org/1999/xhtml" xmlns:fb="http://www.facebook.com/2008/fbml" xml:lang="en-US" lang="en-US" class="no-js lt-ie9 lt-ie8 lt-ie7"> <![endif]-->
	<!--[if IE 7 ]>    <html itemscope itemtype="http://schema.org/Blog" xmlns="http://www.w3.org/1999/xhtml" xmlns:fb="http://www.facebook.com/2008/fbml" xml:lang="en-US" lang="en-US" class="no-js lt-ie9 lt-ie8"> <![endif]-->
	<!--[if IE 8 ]>    <html itemscope itemtype="http://schema.org/Blog" xmlns="http://www.w3.org/1999/xhtml" xmlns:fb="http://www.facebook.com/2008/fbml" xml:lang="en-US" lang="en-US" class="no-js lt-ie9"> <![endif]-->
	<!--[if gt IE 8]><!--> <html itemscope itemtype="http://schema.org/Blog" xmlns="http://www.w3.org/1999/xhtml" xmlns:fb="http://www.facebook.com/2008/fbml" xml:lang="en-US" lang="en-US" >	<!--<![endif]-->
	
	<head>
		<!--Meta Tags-->
		<meta charset="utf-8" />
		<meta name="language" content="en-US" />
		
		<!--IE-->
		<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
		<meta http-equiv="imagetoolbar" content="no" />
		<meta name="application-name" content="Weru Channels Player" />
		<meta name="msapplication-tooltip" content="Create amazing music channels for you and your friends." />
		<meta http-equiv="Page-Enter" content="blendTrans(duration=0)" />
		<meta http-equiv="Page-Exit" content="blendTrans(duration=0)" />
		<meta name="SKYPE_TOOLBAR" content="SKYPE_TOOLBAR_PARSER_COMPATIBLE" />
		
		<!--Mobile-->
		<meta name="viewport" content="width=device-width" />
		
		<!--Schema.org microdata-->
		<meta itemprop="name" content="Weru Channels Player">
		<meta itemprop="image" content="" />
		
		<!--Styles-->
		<link rel="stylesheet" type="text/css" href="styles/player.css" />
		<link rel="stylesheet" type="text/css" href="styles/jquery.qtip.min.css" />
		
		<!--Scripts-->
		<script type="text/javascript" src="scripts/modernizr.js" charset="utf-8"></script>
		
		<!--Favicons-->
		<link rel="icon" type="image/vnd.microsoft.icon" href="favicon.ico" />
		<link rel="shortcut icon" type="image/x-icon" href="favicon.ico" />
		<link rel="apple-touch-icon" href="apple-touch-icon.png" />
		
		<!--Title-->
		<title>Weru Channels Player - Create amazing music channels for you and your friends.</title>
	</head>
	<body>
		<?php
			$playlist = $defaultPlaylist = 'test-resources/playlist-1.json';
			if (!empty($_GET['playlist'])) {
				$playlist = $_GET['playlist'];
			}
	
			try {
				$json = file_get_contents($playlist);
				$data = json_decode($json, TRUE);
			} catch(Exception $e) {
				$json = file_get_contents($defaultPlaylist);
				$data = json_decode($json, TRUE);
			}
		?>
		<!--channel switcher-->
		<div id="channel-switcher">
			<label for="channel-select">Now playing</label>
			<select id="channel-select" name="channel-select">
				<option value="<?php echo $playlist; ?>"><?php echo $data['title']; ?></option>
			</select>
		</div>
		<!--/channel switcher-->
		
		<!--playlist wrap-->
		<div id="playlist-wrap">
			<!--playlist-->
			<ul id="playlist"></ul>
			<!--/playlist-->
				
			<!--players-->
			<div id="weru-players">
				<!--jplayer-->
				<div id="audio-player" class="jp-jplayer"></div>
				<div id="ap-content" class="jp-audio player">
					<div class="jp-no-solution">
						<span>Update Required</span>
						To play the media you will need to either update your browser to a recent version or update your <a href="http://get.adobe.com/flashplayer/" target="_blank">Flash plugin</a>.
					</div>
				</div>
				<!--/jplayer-->
				
				<!--youtube player-->
				<iframe id="youtube-player" type="text/html" src="http://www.youtube.com/embed/?enablejsapi=1&origin=http://weruplayer.com" class="player" width="445" height="274" frameborder="0" allowtransparency="yes" scrolling="no" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>
				<!--youtube player-->
				
				<!--vimeo player-->
				<iframe id="vimeo-player" src="http://player.vimeo.com/video/29037955?api=1&color=ffffff&player_id=vimeo-player" class="player" width="445" height="274" frameborder="0" allowtransparency="yes" scrolling="no" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>
				<!--/vimeo player-->
				
				<!--soundcloud player-->
				<iframe id="soundcloud-player" src="http://w.soundcloud.com/player/?url=http%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F36004412&show_artwork=true&show_comments=false&sharing=false&download=false&liking=false&buying=false&enable_api=true" class="player" width="445" height="274" frameborder="0" allowtransparency="yes" scrolling="no" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>
				<!--/soundcloud player-->
			</div>
			<!--/players-->
		</div>
		<!--/playlist wrap-->
		
		<!--Scripts-->
		<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js" charset="utf-8"></script>
		<script type="text/javascript" src="scripts/json2.js" charset="utf-8"></script>
		<script type="text/javascript" src="//www.youtube.com/iframe_api" charset="utf-8"></script>
		<script type="text/javascript" src="http://a.vimeocdn.com/js/froogaloop2.min.js" charset="utf-8"></script>
		<script type="text/javascript" src="http://w.soundcloud.com/player/api.js" charset="utf-8"></script>
		<script type="text/javascript" src="scripts/jplayer.js" charset="utf-8"></script>
		<script type="text/javascript" src="scripts/jquery.bxSlider.min.js" charset="utf-8"></script>
		<script type="text/javascript" src="scripts/jquery-ajax-localstorage-cache.js" charset="utf-8"></script>
		<script type="text/javascript" src="scripts/jquery.chosen.min.js" charset="utf-8"></script>
		<script type="text/javascript" src="scripts/jquery.qtip.min.js" charset="utf-8"></script>
		<script type="text/javascript" src="scripts/player.js" charset="utf-8"></script>
		<script type="text/javascript">
			
			
			(function($){
				$('#weru-players').WeruPlayer({
					'onReady': function(){
						window.console.log(this);
					},'hello': function(){
						
					}
				});
			})(jQuery);
		</script>
	</body>
</html>