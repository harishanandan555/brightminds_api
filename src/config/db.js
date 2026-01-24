const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const connectDB = async () => {
    try {
        const dbName = 'brightminds';
        let mongoUri = process.env.MONGO_URI;

        if (!mongoUri) {
            // Try connecting to default local instance first
            try {
                await mongoose.connect(`mongodb://127.0.0.1:27017/${dbName}`, { serverSelectionTimeoutMS: 2000 });
                console.log(`MongoDB Connected: mongodb://127.0.0.1:27017/${dbName}`);
                return;
            } catch (err) {
                console.log('Local MongoDB not found, falling back to in-memory database...');
                const mongod = await MongoMemoryServer.create();
                mongoUri = mongod.getUri();
            }
        }

        const conn = await mongoose.connect(mongoUri, { dbName: "brightminds" });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
