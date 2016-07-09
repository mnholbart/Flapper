'use strict';

exports.findIndex = function(arr, id) {
    var len = arr.length;

    while (len--) {
        if (arr[len].id === id) {
            return len;
        }
    }

    return -1;
};

exports.validNickname = function(nickname) {
    var regex = /^\w*$/;
    return regex.exec(nickname) !== null;
};