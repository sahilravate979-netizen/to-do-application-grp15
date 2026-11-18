
// Check whether email format is valid
const isValidEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
};

// Check password strength
const isValidPassword = (password) => {
    return password.length >= 8 &&
           /[A-Za-z]/.test(password) &&
           /[0-9]/.test(password);
};

// Check name
const isValidName = (name) => {
    return /^[a-zA-Z\s]+$/.test(name.trim());
};

module.exports = {
    isValidEmail,
    isValidPassword,
    isValidName
};
