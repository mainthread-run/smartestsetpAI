// Function to validate mobile format
function isValidMobileFormat(mobile) {
    return /^\d{10}$/.test(mobile);
}

// Function to validate email format
function isValidEmailFormat(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
// validate examcode
function isValidateExam(exam_code) {

    return /^[a-zA-Z0-9\-_]+$/.test(exam_code);

}

function isValidateNumber(id) {
    return /^\d+$/.test(id);

}

// Function to validate password format
function isValidPassword(password) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,}$/.test(password);
}



module.exports = { isValidMobileFormat, isValidEmailFormat, isValidateExam, isValidateNumber,    isValidPassword };