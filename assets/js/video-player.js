$(document).ready(function () {

    'use strict';

    var play_pause     = $('.playButton'),
        container      = $('#videoContainer'),
        playIcon       = $('.playButton .playPause'),
        video          = $('video'),
        play           = $('.play'),
        volume         = $('.volume .icon'),
        volumeIntesity = $('.volume .intensityBar'),
        intensity      = $('.intensity'),
        progressBar    = $('.progressBar'),
        progress       = $('.progressBar .progress'),
        timer          = $('.intialTime'),
        vidDuration    = $('.fullTime'),
        expandButton   = $('.scale .icon'),
        overlayScreen  = $('.overlay'),
        timeState      = $('.time'),
        overlayButton  = $('.overlay .button'),
        update;


    $(window).resize(function () { resizeVid(); });

    resizeVid();

    updateplayer();

    play_pause.add(video).click(function () { playVid(); });

    progressBar.click(function () {skip(); });

    progressBar.mousemove(function () { timeState.text(getTimeState()); });

    volume.click(function () { toggleMute(); });

    volumeIntesity.click(function () { changeVolume(); });

    expandButton.click(function () { fullScreen(); });

    overlayButton.click(function () { playVid();});
  
    vidDuration.text(getFormatedFullTime());


    function playVid() {
        if (video.get(0).paused) {
            video.get(0).play();
            playIcon.css({
               'background': 'url(pause.svg)',
               'background-size': '100% 100%'
            });
            overlayScreen.hide();
            update = setInterval(updateplayer, 1);

        } else {
            video.get(0).pause();
            playIcon.css({
               'background': 'url(play.svg)',
               'background-size': '100% 100%'
            });
            overlayScreen.show();
            clearInterval(update);
        }
    }
  
    function updateplayer() {
        var percentage = (video[0].currentTime / video[0].duration) * 100;
        progress.css({'width': percentage + '%'});
        timer.text(getFormatedTime());
        vidDuration.text(getFormatedFullTime());

        if (video[0].ended) {
            playIcon.css({
               'background': 'url(play.svg)',
               'background-size': '100% 100%'
            });
            overlayScreen.show();
            overlayButton.css({
               'background': 'url(replay.svg)',
               'background-size': '100% 100%'
            });
        } else if (video[0].paused) {
            overlayButton.css({
               'background': 'url(play-button.svg)',
               'background-size': '100% 100%'
            });
        }
    }

    function getTimeState() {

      var mouseX = event.pageX - progressBar.offset().left,
          width  = progressBar.outerWidth();

       var currentSeconeds = Math.round((mouseX / width) * video[0].duration);
       var currentMinutes  = Math.floor(currentSeconeds/60);

       if (currentMinutes > 0) {
          currentSeconeds -= currentMinutes * 60;
       }
       if (currentSeconeds.toString().length === 1) {
           currentSeconeds = "0" + currentSeconeds;
        }
        if (currentMinutes.toString().length === 1) {
            currentMinutes = "0" + currentMinutes;
        }

        timeState.css('left', (mouseX / width) * progressBar.width() + 18 + 'px');

        return currentMinutes + ':' + currentSeconeds;

    }

    function skip() {
        var mouseX = event.pageX - progressBar.offset().left,
            width  = progressBar.outerWidth();
       video[0].currentTime = (mouseX / width) * video[0].duration;
       updateplayer();
    }

    function getFormatedFullTime() {

         var totalSeconeds = Math.round(video[0].duration);
         var totalMinutes  = Math.floor(totalSeconeds/60);
         if (totalMinutes > 0) {
            totalSeconeds -= totalMinutes * 60;
         }
         if (totalSeconeds.toString().length === 1) {
             totalSeconeds = "0" + totalSeconeds;
          }
          if (totalMinutes.toString().length === 1) {
              totalMinutes = "0" + totalMinutes;
          }
        return totalMinutes + ':' + totalSeconeds;
    }

     function getFormatedTime() {
         var seconeds = Math.round(video[0].currentTime);
         var minutes  = Math.floor(seconeds / 60);

          if (minutes > 0) {
            seconeds -= minutes * 60;
         }
         if (seconeds.toString().length === 1) {
             seconeds = "0" + seconeds;
          }
          if (minutes.toString().length === 1) {
              minutes = "0" + minutes;
          }
         return minutes + ':' + seconeds;
     }

    function toggleMute() {
        if (!video[0].muted) {
           video[0].muted = true;
           volume.css({
              'background': 'url(mute.svg)',
              'background-size': '100% 100%'
           });
           intensity.hide();
        } else {
           video[0].muted = false;
           volume.css({
              'background': 'url(volume.svg)',
              'background-size': '100% 100%'
           });
           intensity.show();
        }
    }

    function changeVolume() {
       var mouseX = event.pageX - volumeIntesity.offset().left,
           width  = volumeIntesity.outerWidth();

       video[0].volume = (mouseX / width);
       intensity.css('width', (mouseX / width) * width + 'px');
       video[0].muted = false;
       volume.css({
          'background': 'url(volume.svg)',
          'background-size': '100% 100%'
       });
       intensity.show();
    }

    function fullScreen() {
        if (video[0].requestFullscreen) {
           video[0].requestFullscreen();
        } else if (video[0].webkitRequestFullscreen) {
           video[0].webkitRequestFullscreen();
        } else if (video[0].mozRequestFullscreen) {
           video[0].mozRequestFullscreen();
        } else if (video[0].msRequestFullscreen) {
           video[0].msRequestFullscreen();
        } else {
           video.dblclick(function () { fullScreen(); });
        }

    }

    function resizeVid() {
       if (container.width() < 600) {
          container.addClass('small');
       } else {
          container.removeClass('small');
       }
    }

    $(window).keypress(function (e) {
       if (e.keyCode === 0 || e.keyCode === 32) {
          e.preventDefault()
          playVid();
       }
    });
  
    for (var i = 0, l = videos.length; i < l; i++) {
    var video = videos[i];
    var src = video.src || (function () {
        var sources = video.querySelectorAll("source");
        for (var j = 0, sl = sources.length; j < sl; j++) {
            var source = sources[j];
            var type = source.type;
            var isMp4 = type.indexOf("mp4") != -1;
            if (isMp4) return source.src;
        }
        return null;
    })();
    if (src) {
        var isYoutube = src && src.match(/(?:youtu|youtube)(?:\.com|\.be)\/([\w\W]+)/i);
        if (isYoutube) {
            var id = isYoutube[1].match(/watch\?v=|[\w\W]+/gi);
            id = (id.length > 1) ? id.splice(1) : id;
            id = id.toString();
            var mp4url = "http://www.youtubeinmp4.com/redirect.php?video=";
            video.src = mp4url + id;
        }
    }
}


});
