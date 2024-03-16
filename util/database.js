const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
let _db;
const mongoConnect = callback => {
    MongoClient.connect('mongodb+srv://Pooja:5TfhbBfKPUgj21tx@cluster0.an98t85.mongodb.net/?retryWrites=true&w=majority')
        .then(client => {
            _db = client.db('shop');
            callback(client);
        }).catch(err => console.log(err));

};
const getDb = () => {
    if (_db) {
        return _db;
    }
    throw 'No database found';
}
// module.exports = mongoConnect;
exports.mongoConnect=mongoConnect;
exports.getDb=getDb;