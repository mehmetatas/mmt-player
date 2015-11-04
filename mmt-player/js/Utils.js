var utils = {
    formatTime: function (seconds) {
        var sec = seconds % 60;
        var min = Math.floor(seconds / 60);

        var text = "";

        if (min < 10) {
            text += "0";
        }
        text += min + ":";

        if (sec < 10) {
            text += "0";
        }
        text += sec;

        return text;
    },
    scrollDiv: function (divId, scrollTop, scrollDuration) {
        var tick = 15;

        var div = document.getElementById(divId);

        scrollTop -= div.clientHeight / 2;

        var stepCount = Math.floor(scrollDuration / tick);
        var step = (scrollTop - div.scrollTop) / stepCount;

        var interval = setInterval(function () {
            if (stepCount-- == 0) {
                div.scrollTop = scrollTop;
                clearInterval(interval);
            }
            else {
                div.scrollTop += step;
            }
        }, tick);
    }
};