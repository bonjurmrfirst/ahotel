var fs = require('fs');

var logs = {
    warnings: [],
    errors: []
};

function addLog(log) {
    'use strict';

    if (log.err.length) {
        logs.errors.push(log.err)
    }

    if (log.warn.length) {
        logs.warnings.push(log.warn)
    }

    fs.writeFile('./backend/log/log.json', JSON.stringify(logs));
}

module.exports = addLog;