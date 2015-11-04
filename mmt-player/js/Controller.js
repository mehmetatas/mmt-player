angular.module('app', ['rzModule']).controller('player', ['$scope', function ($scope) {
    var __paused = 0;
    var __playing = 1;

    var _index = 0;
    var _order = [];

    var _fileHelper = new FileHelper($scope);
    var _player = new Player(_fileHelper);
    var _metaHelper = new MetadataHelper();

    var updateOrder = function () {
        _order = [];
        _index = 0;

        for (var i = 0; i < $scope.files.length; i++) {
            _order[i] = i;
        }

        if ($scope.shuffle) {
            var x = 5 * _order.length;
            while (x-- > 0) {
                var i1 = Math.floor(Math.random() * _order.length);
                var i2 = Math.floor(Math.random() * _order.length);
                var tmp = _order[i1];
                _order[i1] = _order[i2];
                _order[i2] = tmp;
            }
        }
    };

    var move = function (next) {
        var end = $scope.files.length - 1;
        var start = 0;
        var step = 1;

        if (!next) {
            end = 0;
            start = $scope.files.length - 1;
            step = -1;
        }

        if ($scope.files.length === 0) {
            return;
        }

        if (_index === end) {
            if ($scope.repeat) {
                if ($scope.shuffle) {
                    updateOrder();
                }
                else {
                    _index = start;
                }
            } else {
                return;
            }
        } else {
            _index += step;
        }

        var i = _order[_index];

        $scope.play($scope.files[i]);

        utils.scrollDiv('list', i * 30, 150);
    };

    $scope.defaultImg = 'img/default.png';

    $scope.state = -1;
    $scope.current = null;
    $scope.shuffle = true;
    $scope.repeat = true;
    $scope.muted = false;

    $scope.volume = 50;

    $scope.timeSlider = {
        current: 0,
        duration: 0,
        durationText: "??:??",
        currentText: "00:00"
    };

    $scope.files = [];

    $scope.playPause = function () {
        if (!$scope.current) {
            if ($scope.files.length === 0) {
                return;
            }
            updateOrder();
            $scope.play($scope.files[_order[_index]]);
        }
        else if ($scope.state === __playing) {
            $scope.pause();
        } else {
            $scope.play($scope.current);
        }
    };

    $scope.updateTime = function () {
        $scope.timeSlider.current = _player.getCurrentTime();
        $scope.timeSlider.currentText = utils.formatTime($scope.timeSlider.current);
        $scope.$apply();
    };

    $scope.setCurrentTime = function () {
        _player.setCurrentTime($scope.timeSlider.current);
        $scope.timeSlider.currentText = utils.formatTime($scope.timeSlider.current);
    };

    $scope.$watch('volume', function () {
        _player.setVolume($scope.volume);
    });

    $scope.toggleMute = function () {
        $scope.muted = _player.toggleMute();
    };

    $scope.play = function (file, fromUI) {
        if ($scope.current === file) {
            _player.play();
            $scope.current.active = true;
            $scope.state = __playing;
            return;
        }

        if ($scope.current) {
            $scope.current.active = false;
        }

        _player.play(file, function () {
            if (!file.duration) {
                file.setDuration(_player.getDuration());
            }

            $scope.timeSlider.current = 0;
            $scope.timeSlider.currentText = "00:00";
            $scope.timeSlider.duration = file.duration;
            $scope.timeSlider.durationText = file.durationText;

            $scope.$apply();
        });

        $scope.current = file;
        $scope.current.active = true;

        if (!$scope.shuffle) {
            _index = _order.indexOf($scope.files.indexOf($scope.current));
        }

        $scope.state = __playing;
    };

    $scope.pause = function () {
        _player.pause();
        $scope.state = __paused;
    };

    $scope.next = function (fromUI) {
        move(true);

        if (!fromUI) {
            $scope.$apply();
        }
    };

    $scope.prev = function () {
        move(false);
    };

    $scope.toggleShuffle = function () {
        $scope.shuffle = !$scope.shuffle;

        updateOrder();

        var index = $scope.files.indexOf($scope.current);

        if (index > 0) {
            _order.splice(_order.indexOf(index), 1);
            _order.splice(0, 0, index);
        }
    };

    $scope.toggleRepeat = function () {
        $scope.repeat = !$scope.repeat;
    };

    $scope.addFile = function (file) {
        if (file.name.indexOf(".mp3") > 0) {
            $scope.files.push(file);
            _metaHelper.pushFile(file, function () {
                $scope.$apply();
            });
            updateOrder();
            $scope.$apply();
        }
    };

    $scope.removeFile = function (file) {
        $scope.files.remove(file);
        updateOrder();
    };

    $scope.openAddFiles = function () {
        document.getElementById('addFiles').click();
    };

    $scope.openAddFolders = function () {
        document.getElementById('addFolders').click();
    };

    // Init
    _player.onEnd($scope.next);
    _player.onTick($scope.updateTime);
    _fileHelper.init();
}]);