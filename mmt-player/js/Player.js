function Player() {
    var _current;

    var _audio = document.getElementById("audio");
    var _source = document.getElementById("source");

    var _metadataListener;

    _audio.addEventListener('loadedmetadata', function () {
        if (_metadataListener) {
            _metadataListener();
        }
    });

    this.play = function (file, callback) {
        _metadataListener = callback;

        if (file) {
            if (_current) {
                var prev = _current;
                setTimeout(function () {
                    prev.removeFromTemp();
                }, 1000);
            }

            file.copyToTemp(function () {
                _source.src = file.getTempUrl();
                _audio.load();
                _audio.play();

                _current = file;
            });
        } else {
            _audio.play();
        }
    };

    this.pause = function () {
        _audio.pause();
    };

    this.toggleMute = function () {
        return _audio.muted = !_audio.muted;
    };

    this.setVolume = function (volume) {
        _audio.volume = volume / 100.0;
    };

    this.getCurrentTime = function () {
        return Math.round(_audio.currentTime);
    };

    this.setCurrentTime = function (time) {
        _audio.currentTime = time;
    };

    this.getDuration = function () {
        return Math.round(_audio.duration);
    };

    this.onEnd = function (endListener) {
        _audio.addEventListener("ended", endListener);
    };

    this.onTick = function (tickListener) {
        _audio.addEventListener("timeupdate", tickListener);
    };
}