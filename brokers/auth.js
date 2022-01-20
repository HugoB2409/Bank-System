const db = require("../brokers/mongo");

const findByEmail = (email) => {
    return new Promise(function (resolve, reject) {
        db.connect((client) => {
            client.db('banque').collection('user')
                .findOne({email: email}).then(r => {
                    resolve(r)
                });
        })
    })
}

const getIdByEmail = (email) => {
    return new Promise(function (resolve, reject) {
        db.connect((client) => {
            client.db('banque').collection('user')
                .findOne({email: email}).then(r => {
                resolve(r)
            });
        })
    })
}

const getByUsername = (username) => {
    return new Promise(function (resolve, reject) {
        db.connect((client) => {
            client.db('banque').collection('user')
                .findOne({username: username}).then(r => {
                resolve(r)
            });
        })
    })
}

const signup = (user) => {
    return new Promise(function (resolve, reject) {
        db.connect((client) => {
            client.db('banque').collection('user')
                .insertOne({
                    firstname: user.firstname,
                    lastname: user.lastname,
                    email: user.email,
                    username: user.username,
                    password: user.password,
                    balance: 0
                }).then(r => {
                    resolve(r.insertedId)
                });
        })
    })
}

exports.getByUsername = getByUsername
exports.findByEmail = findByEmail;
exports.getIdByEmail = getIdByEmail
exports.signup = signup;