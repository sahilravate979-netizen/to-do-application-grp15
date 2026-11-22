
const db = require('./config/db');

const testConnection = async () => {
    try {
        const connection = await db.getConnection();

        console.log('MySQL Database Connected Successfully!');

        connection.release();
        await db.end();

    } catch (error) {
        console.error('Database Connection Failed:', error.message);
    }
};

testConnection();
