
const db = require('./config/db');
const { hashPassword } = require('./utils/passwordUtils');

const createAdmin = async () => {
    try {
        const name = 'Admin';
        const email = 'admin@example.com';
        const password = 'Admin12345';

        const hashedPassword = await hashPassword(password);

        await db.execute(
            'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, 'Admin']
        );

        console.log('Admin account created successfully!');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await db.end();
    }
};

createAdmin();
