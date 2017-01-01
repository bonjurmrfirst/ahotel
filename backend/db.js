function DB(initList) {
    'use strict';

    this._users = new Array(initList);
}

DB.prototype.addUser = function (credentials) {
    var userAlreadyExists = false;
    console.log(this._users);
    for (var i = 0; i < this._users.length; i++) {
        if (this._users[i].name === credentials.name ||
            this._users[i].email === credentials.email) {
            userAlreadyExists = true;
            break;
        }
    }

    if (userAlreadyExists) {
        return 'User already exists'
    } else {
        this._users.push(credentials);
        console.info(this);
        return 'SUCCESS'
    }
};

DB.prototype.isUser = function(credentials) {
    for (var i = 0; i < this._users.length - 1; i++) {
        if (this._users[i].name === credentials.name &&
            this._users[i].password === credentials.password) {
            return true
        }
    }

    return false
};

var db = new DB({
    name: 'admin',
    password: 'admin',
    email: 'admin@admin'
});

module.exports = db;