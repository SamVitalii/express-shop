import mongodb from 'mongodb';

const MongoClient = mongodb.MongoClient;
const url = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.roxg3b6.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`;

let _db;

export const mongoConnect = async () => {
    try {
        const client = await MongoClient.connect(url);
        _db = client.db()
        console.log('Successfully connected!');
    } catch (e) {
        console.log(e);
    }
}

export const getDb = () => {
    if (_db) return _db;

    throw 'No database found';
}