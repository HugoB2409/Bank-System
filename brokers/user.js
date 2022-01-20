const db = require("../brokers/mongo");

const getUser = (id) => {
    return new Promise(function (resolve, reject) {
        db.connect((client, ObjectID) => {
            client.db('banque').collection('user')
                .findOne({_id: ObjectID(id)}).then(r => {
                resolve(r)
            });
        })
    })
}

exports.getUser = getUser;