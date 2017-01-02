var sessions = [{user: 'admin', token: 'XXXXXXXXXX'}];

function generateToken(password) {
    'use strict';

    var token = password + '!' + 'XXXXXXXXXX';

    sessions.push({
        user: password,
        token: token
    });

    return {'token': token}
}

module.exports = generateToken;