const { MongoClient, ObjectID } = require('mongodb');

const connect = (query) => {
    const url = 'mongodb://localhost:27017';
    const client = new MongoClient(url);
    try {
        client.connect().then(() => {
            return query(client, ObjectID);
        });
    } catch (e) {
        console.error(e);
    } finally {
        client.close();
    }

}

exports.connect = connect;
