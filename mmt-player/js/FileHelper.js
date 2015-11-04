function FileHelper(scope) {
    window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
    window.resolveLocalFileSystemURL = window.webkitResolveLocalFileSystemURL || window.webkitResolveLocalFileSystemURL;

    var _self = this;

    var fs = null;
    var cwd = null;

    function onError(e) {
        console.log("ERROR:" + e.code + ", " + e.name + ", " + e.message);
    }

    function getEntry(fullPath, callback) {
        var fsUrl = fs.root.toURL() + encodeURIComponent(fullPath);

        window.resolveLocalFileSystemURL(fsUrl, function (entry) {
            if (entry.isDirectory) {
                cwd = entry;
            }
            callback(entry);
        });
    }

    function onChange(e) {
        e.stopPropagation();
        e.preventDefault();

        var entries = e.target.webkitEntries;

        // Dragging and dropping into the file input works fine but onchange doesn't
        // populate .webkitEntries when selecting from the file dialog
        // (crbug.com/138987). Thus, we need to explicitly write out files.
        if (entries.length) {
            [].forEach.call(entries, function (entry) {
                if (entry.isFile) {
                    scope.addFile(new DraggedFile(entry, _self));
                }
            });
        } else {
            var files = e.target.files;

            [].forEach.call(files, function (file) {
                scope.addFile(new SelectedFile(file, _self));
            });
        }
    }

    function traverseFileTree(item, path) {
        path = path || "";
        if (item.isFile) {
            scope.addFile(new DraggedFile(item, _self));
        } else if (item.isDirectory) {
            var dirReader = item.createReader();
            dirReader.readEntries(function (entries) {
                for (var i = 0; i < entries.length; i++) {
                    traverseFileTree(entries[i], path + item.name + "/");
                }
            });
        }
    }

    this.copyToTemp = function (item, callback) {
        item.copyTo(cwd, null, function (copiedEntry) {
            getEntry(copiedEntry.fullPath, function () {
                callback(copiedEntry);
            });
        }, onError);
    }

    this.removeFromTemp = function (file) {
        getEntry(file.fullPath, function (entry) {
            entry.remove(function () {
            }, onError);
        });
    };

    this.writeFile = function (file, callback) {
        cwd.getFile(file.name, {create: true}, function (fileEntry) {
            fileEntry.createWriter(function (writer) {
                writer.onwriteend = function () {
                    callback(fileEntry);
                };
                writer.onerror = function () {
                };
                writer.write(file);

            }, onError);
        }, onError);
    };

    this.init = function () {
        document.getElementById('addFiles').addEventListener('change', onChange);
        document.getElementById('addFolders').addEventListener('change', onChange);

        window.requestFileSystem(window.TEMPORARY, 1024 * 1204, function (fileSystem) {
            fs = fileSystem;
            cwd = fs.root;
        }, onError);

        var dropzone = document.getElementById('dropzone');

        dropzone.addEventListener('dragover', function (e) {
            e.preventDefault();
        });

        dropzone.addEventListener('drop', function (e) {
            e.preventDefault();

            var items = e.dataTransfer.items;
            for (var i = 0; i < items.length; i++) {
                var item = items[i].webkitGetAsEntry();
                if (item) {
                    traverseFileTree(item);
                }
            }
        });
    };
}
