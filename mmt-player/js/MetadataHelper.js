function MetadataHelper() {
    var _files = [];
    var _loading = false;

    var _metaAudio = document.getElementById("meta-audio");
    var _metaSource = document.getElementById("meta-source");

    _metaAudio.onerror = function () {
        _loading = false;
    };

    var loadID3Tags = function (file, callback) {
        file.getFileData(function (fileData) {
            ID3.loadTags(fileData.name, function () {

                var tags = ID3.getAllTags(fileData.name);

                file.meta.title = tags.title || fileData.name;
                file.meta.artist = tags.artist;
                file.meta.album = tags.album;

                if (tags.picture && tags.picture.data && tags.picture.data.length) {
                    var image = tags.picture;

                    var base64String = "";

                    for (var j = 0; j < image.data.length; j++) {
                        base64String += String.fromCharCode(image.data[j]);
                    }

                    file.meta.picture = "data:" + image.format + ";base64," + window.btoa(base64String);
                }

                callback();
            }, {
                tags: ["artist", "title", "album", "picture"],
                dataReader: FileAPIReader(fileData)
            });
        });
    };

    var loadDuration = function (file, callback) {
        file.copyToTemp(function () {
            _metaSource.src = file.getTempUrl();
            _metaAudio.load();

            _metaAudio.onloadedmetadata = function () {
                file.setDuration(Math.round(_metaAudio.duration));
                file.removeFromTemp();

                callback();
            };
        });
    };

    this.pushFile = function (file, callback) {
        _files.push({
            file: file,
            callback: callback
        });
    };

    setInterval(function () {
        if (_files.length === 0 || _loading) {
            return;
        }

        var item = _files.splice(0, 1)[0];

        if (item.file.duration) {
            return;
        }

        _loading = true;

        loadID3Tags(item.file, function () {
            loadDuration(item.file, function () {
                _loading = false;
                item.callback();
            });
        });

    }, 100);
}
