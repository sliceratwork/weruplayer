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
		<link rel="stylesheet" type="text/css" href="styles/player-controls.css" />
		
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
		<!--player-->
		<div id="weru-player">
			<!--controls-->
			<div id="controls">
				<a href="#" id="play" title="Play">Play</a>
				<a href="#" id="pause" title="Pause">Pause</a>
				<a href="#" id="prev" title="Previous track">Prev</a>
				<a href="#" id="next" title="Next track">Next</a>
				<a href="#" id="mute" title="Mute">Mute</a>
				<a href="#" id="unmute" title="Unmute">Unmute</a>
				<a href="#" id="toggle-playlist" title="Toggle playlist">Toggle playlist</a>
			</div>
			<!--/controls-->
			
			<!--display-->
			<div id="display">
				<div id="track-title">
					<div id="track-title-inner">Welcome to Weruchannels</div>
				</div>
				<div id="progress-bar">
					<div id="load-bar"></div>
					<div id="play-bar"></div>
				</div>
				<div id="current-time">00:00</div>
				<div id="duration">00:00</div>
			</div>
			<!--/display-->
			<div id="controls-overlay"></div>
		</div>
		<!--/player-->
		
		<!--Scripts-->
		<script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.2/jquery.min.js" charset="utf-8"></script>
		<script type="text/javascript" src="scripts/controls.js" charset="utf-8"></script>
	</body>
</html>