
// Function to handle form submission and account creation
function createAccount(event) {
    // Get form and input field values
    event.preventDefault();
    const registrationForm = document.getElementById('registrationForm');
    const fullname = document.getElementById('fullname').value;
    const address = document.getElementById('address').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const accountType = document.getElementById('accountType').value;
    const deposit = document.getElementById('deposit').value;
    const successMessageContainer = document.getElementById('successMessage');

    // Perform basic validation
    if (fullname && address && phone && email && accountType && deposit) {
        // Call the JavaScript function to generate account number
        const accountNumber = generateAccountNumber(phone, fullname);
        
        // Display success message along with account number
        const successMessage = `Account created successfully! Your account number is ${accountNumber}.`;
        successMessageContainer.textContent = successMessage; // Update success message container
        
        registrationForm.reset();
    } else {
        alert('Please fill in all required fields.');
    }
}

// Function to generate account number based on phone number and full name
function generateAccountNumber(phone, fullname) {
    const mobileDigits = phone.slice(-4);
    let namePart = fullname.slice(0, 2);
    
    if (fullname.length < 4) {
        namePart += 'XX';
    } else {
        namePart += fullname.slice(-2);
    }
    
    namePart = shuffleLetters(namePart);
    
    return mobileDigits + namePart;
}

// Function to shuffle the letters of a string
function shuffleLetters(str) {
    return str.split('').sort(() => Math.random() - 0.5).join('');
}

