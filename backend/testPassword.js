const { hashPassword, comparePassword } = require('./utils/passwordUtils');

const test = async () => {
    const password = 'password123';

    // Generate password hash
    const hashedPassword = await hashPassword(password);

    console.log('Hashed Password:', hashedPassword);

    // Check correct password
    const isMatch = await comparePassword('password123', hashedPassword);

    console.log('Correct Password:', isMatch);

    // Check incorrect password
    const isWrong = await comparePassword('wrongpassword', hashedPassword);

    console.log('Wrong Password:', isWrong);
};

test();