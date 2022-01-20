const db = require("../brokers/mongo");

const getBalance = (walletId) => {
    return new Promise(function (resolve, reject) {
        db.connect((client, ObjectID) => {
            client.db('banque').collection('user')
                .findOne({_id: ObjectID(walletId)}).then(r => {
                    resolve(r.balance)
            });
        })
    })
}

const getTransactions = (username) => {
    return new Promise(function (resolve, reject) {
        db.connect((client) => {
            client.db('banque').collection('transaction')
                .find({$or: [{receiver: username}, {sender: username}]}).toArray().then(r => {
                    resolve(r)
            });
        })
    })
}

const addMoney = (amount, user) => {
    return new Promise(function (resolve, reject) {
        db.connect((client, ObjectID) => {
                client.db('banque').collection('user').updateOne({username: user}, {$inc: {balance: parseFloat(amount)}}).then(r => {
                    resolve(r);
                })
        });
    })
}

const transferMoney = (amount, sender, receiver) => {
    return new Promise(function (resolve, reject) {
        db.connect((client) => {
            client.db('banque').collection('transaction')
                .insertOne({amount: amount, sender: sender, receiver: receiver}).then(r => {
                resolve(r)
            });
        })
    })
}

exports.getBalance = getBalance;
exports.getTransactions = getTransactions;
exports.addMoney = addMoney;
exports.transferMoney = transferMoney