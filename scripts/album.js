

var createSongRow = function(songNumber, songName, songLength){
  var template =
    '<tr class = "album-view-song-item">'
    + ' <td class = "song-item-number" data-song-number = "' + songNumber + '">'+ songNumber + '</td>'
    + ' <td class = "song-item-title">' + songName + '</td>'
    + ' <td class = "song-item-duration">' + songLength + '</td>'
    + ' </tr>'
  ;
  var $row = $(template);
  var clickHandler = function() {
    var $songNumber = parseInt($(this).attr('data-song-number'));

  	if (currentlyPlayingSongNumber !== null) {
  		var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
  		currentlyPlayingCell.html(currentlyPlayingSongNumber);
  	}
  	if (currentlyPlayingSongNumber !== $songNumber) {
      $(this).html(pauseButtonTemplate);
  		setSong($songNumber);
      currentSoundFile.play();
      updateSeekBarWhileSongPlays();

      var $volumeFill = $('.volume .fill'),
          $volumeThumb = $('.volume .thumb');
      $volumeFill.width(currentVolume + '%');
      $volumeThumb.css({left: currentVolume + '%'});

      updatePlayerBarSong();
  	}
    else if (currentlyPlayingSongNumber === $songNumber) {
      if(currentSoundFile.isPaused()){
        currentSoundFile.play();
        updateSeekBarWhileSongPlays();
        $(this).html(pauseButtonTemplate);
        $('.main-controls .play-pause').html(playerBarPauseButton);
      } else {
        currentSoundFile.pause();
  		  $(this).html(playButtonTemplate);
        $('.main-controls .play-pause').html(playerBarPlayButton);
      }
  	}
  };

  var onHover = function(e) {
    var $songItem = $(this).find('.song-item-number'),
        $songItemNumber = parseInt($songItem.attr('data-song-number'));

    if($songItemNumber !== currentlyPlayingSongNumber){
        $songItem.html(playButtonTemplate);
    }
  };
  var offHover = function(event) {
    var $songItem = $(this).find('.song-item-number'),
        $songItemNumber = parseInt($songItem.attr('data-song-number'));

    if($songItemNumber !== currentlyPlayingSongNumber){
      $songItem.html($songItemNumber);
    }
  };

  $row.find('.song-item-number').on('click', clickHandler);
  $row.hover(onHover, offHover);
  return $row;
};

var setSong = function(songNumber) {
  if(currentSoundFile){
    currentSoundFile.stop();
  }
  currentlyPlayingSongNumber = parseInt(songNumber);
  currentSongFromAlbum = currentAlbum.songs[songNumber-1];

  currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
    formats: ['mp3'],
    preload: true
  });

  setVolume(currentVolume);
};

var setVolume = function(volume) {
  if(currentSoundFile){
    currentSoundFile.setVolume(volume);
  }
};

var getSongNumberCell = function(number){
  return $('.song-item-number[data-song-number="' + number + '"]');
};

var setCurrentAlbum = function(album){
  currentAlbum = album;
  var $albumTitle = $('.album-view-title');
  var $albumArtist = $('.album-view-artist');
  var $albumReleaseInfo = $('.album-view-release-info');
  var $albumImage = $('.album-cover-art');
  var $albumSongList = $('.album-view-song-list');

  $albumTitle.text(album.title);
  $albumArtist.text(album.artist);
  $albumReleaseInfo.text(album.year + ' ' + album.label);
  $albumImage.attr('src', album.albumArtUrl);

  $albumSongList.empty();
    for(var i=0; i<album.songs.length; i++){
      var $newRow = createSongRow(i+1, album.songs[i].title, album.songs[i].duration);
      $albumSongList.append($newRow);
    }
};

var trackIndex = function(album, song) {
  return album.songs.indexOf(song);
};

var updateSeekBarWhileSongPlays = function() {
  if(currentSoundFile) {
    currentSoundFile.bind('timeupdate', function(e){
      var seekBarFillRatio = this.getTime() / this.getDuration(),
          $seekBar = $('.seek-control .seek-bar');
      updateSeekPercentage($seekBar, seekBarFillRatio);
    });
  }
};
var updateSeekPercentage = function($seekBar, seekBarFillRatio) {
  var offsetXPercent = seekBarFillRatio * 100,

  offsetXPercent = Math.max(0, offsetXPercent);
  offsetXPercent = Math.min(100, offsetXPercent);

  var percentageString = offsetXPercent + '%';
  $seekBar.find('.fill').width(percentageString);
  $seekBar.find('.thumb').css({left: percentageString});
};

var setupSeekBars = function() {
  var $seekBars = $('.player-bar .seek-bar');

  $seekBars.on('click', function(e){
    var offsetX = e.pageX - $(this).offset().left,
        barWidth = $(this).width(),
        seekBarFillRatio = offsetX / barWidth;

    if($(this).parent().attr('class') == 'seek-control' ){
      seek(seekBarFillRatio * currentSoundFile.getDuration());
    } else {
      setVolume(seekBarFillRatio * 100);
    }

    updateSeekPercentage($(this), seekBarFillRatio);
  });

  $seekBars.find('.thumb').mousedown(function(e){
    var $seekBar = $(this).parent();

    $(document).bind('mousemove.thumb', function(e){
      var offsetX = e.pageX - $seekBar.offset().left,
          barWidth = $seekBar.width(),
          seekBarFillRatio = offsetX / barWidth;

      if($seekBar.parent().attr('class') == 'seek-control'){
        seek(seekBarFillRatio * currentSoundFile.getDuration());
      } else {
        setVolume(seekBarFillRatio * 100);
      }
      updateSeekPercentage($seekBar, seekBarFillRatio);
    });

    $(document).bind('mouseup.thumb', function() {
      $(document).unbind('mousemove.thumb');
      $(document).unbind('mouseup.thumb');
    });
  });
};
var nextSong = function() {
  var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum),
      nextSongIndex = currentSongIndex + 1;
      lastSongNumber = currentlyPlayingSongNumber;

  nextSongIndex >= currentAlbum.songs.length ? nextSongIndex = 0 : nextSongIndex;

  setSong(nextSongIndex + 1);
  currentSoundFile.play();
  updateSeekBarWhileSongPlays();
  updatePlayerBarSong();

  var nextSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber),
      lastSongNumberCell = getSongNumberCell(lastSongNumber);

  nextSongNumberCell.html(pauseButtonTemplate);
  lastSongNumberCell.html(lastSongNumber);
};

var prevSong = function() {
  var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum),
      prevSongIndex = currentSongIndex - 1;
      lastSongNumber = currentlyPlayingSongNumber;

  prevSongIndex < 0 ? prevSongIndex = currentAlbum.songs.length -1 : prevSongIndex;

  setSong(prevSongIndex + 1);
  currentSoundFile.play();
  updateSeekBarWhileSongPlays();
  updatePlayerBarSong();

$('.main-controls .play-pause').html(playerBarPauseButton);

  var prevSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber),
      lastSongNumberCell = getSongNumberCell(lastSongNumber);

  prevSongNumberCell.html(pauseButtonTemplate);
  lastSongNumberCell.html(lastSongNumber);
};

var seek = function(time) {
  if(currentSoundFile){
    currentSoundFile.setTime(time);
  }
}

var updatePlayerBarSong = function() {
  var $songName = $('.currently-playing .song-name'),
      $artistName = $('.currently-playing .artist-name'),
      $artistSong = $('.currently-playing .artist-song-mobile');

  $songName.text(currentSongFromAlbum.title);
  $artistName.text(currentAlbum.artist);
  $artistSong.text(currentSongFromAlbum.title + "-" + currentAlbum.artist);

  $('.main-controls .play-pause').html(playerBarPauseButton);
};

var playButtonTemplate = '<a class = "album-song-button"><span class = "ion-play"></span></a>',
    pauseButtonTemplate = '<a class = "album-song-button"><span class = "ion-pause"></span></a>',
    playerBarPlayButton = '<span class="ion-play"></span>',
    playerBarPauseButton = '<span class="ion-pause"></span>',
    currentlyPlayingSongNumber = null,
    currentAlbum = null,
    currentSongFromAlbum = null,
    currentSoundFile = null,
    currentVolume = 80;
    $nextButton = $('.main-controls .next'),
    $prevButton = $('.main-controls .previous');


$(document).ready(function(){
  setCurrentAlbum(albumPicasso);
  setupSeekBars();
  $prevButton.on('click', prevSong);
  $nextButton.on('click', nextSong);
});
