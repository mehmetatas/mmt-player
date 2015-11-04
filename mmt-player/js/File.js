function File(fileHandle, fileHelper) {
    this.localEntry = null;

    this.meta = {
        artist: null,
        title: fileHandle.name,
        album: null,
        picture: "img/default.png"
    };

    this.duration = 0;
    this.durationText = "??:??";
    this.fileHelper = fileHelper;
    this.name = fileHandle.name;
}

File.prototype.setDuration = function (seconds) {
    this.duration = seconds;
    this.durationText = utils.formatTime(seconds);
};

File.prototype.getTempUrl = function () {
    return this.localEntry.toURL();
};

File.prototype.removeFromTemp = function () {
    this.localEntry.remove(
        function () {

        },
        function (e) {
            console.log("ERROR:" + e.code + ", " + e.name + ", " + e.message);
        });
};

File.prototype.copyToTemp = function (callback) {
    console.log("ERROR: Not implemented!");
};

File.prototype.getFileData = function (callback) {
    console.log("ERROR: Not implemented!");
};

function DraggedFile(fileEntry, fileHelper) {
    File.call(this, fileEntry, fileHelper);

    this.fileEntry = fileEntry;
}

DraggedFile.prototype = Object.create(File.prototype);

DraggedFile.prototype.copyToTemp = function (callback) {
    this.fileHelper.copyToTemp(this.fileEntry, function (entry) {
        this.localEntry = entry;
        callback();
    }.bind(this));
};

DraggedFile.prototype.getFileData = function (callback) {
    this.fileEntry.file(callback);
};

function SelectedFile(fileHandle, fileHelper) {
    File.call(this, fileHandle, fileHelper);

    this.fileHandle = fileHandle;
}

SelectedFile.prototype = Object.create(File.prototype);

SelectedFile.prototype.copyToTemp = function (callback) {
    this.fileHelper.writeFile(this.fileHandle, function (entry) {
        this.localEntry = entry;
        callback();
    }.bind(this));
};

SelectedFile.prototype.getFileData = function (callback) {
    callback(this.fileHandle);
};