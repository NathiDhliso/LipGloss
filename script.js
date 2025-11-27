/**
 * LipGloss Auto Spa - Interactive Functionality
 * Handles modal display, form validation, and user interactions
 */
// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});
/**
 * Initialize all application functionality
 */
function initializeApp() {
    setupModalHandlers();
    setupFormValidation();
}
/**
 * Setup modal open/close handlers
 */
function setupModalHandlers() {
    const modalOverlay = document.getElementById('modalOverlay');
    const modalClose = document.getElementById('modalClose');
    const ctaTriggers = document.querySelectorAll('.cta-trigger');
    // Open modal when any CTA button is clicked
    ctaTriggers.forEach((trigger) => {
        trigger.addEventListener('click', () => {
            openModal();
        });
    });
    // Close modal when close button is clicked
    modalClose.addEventListener('click', () => {
        closeModal();
    });
    // Close modal when clicking outside the modal content
    modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) {
            closeModal();
        }
    });
    // Close modal on Escape key press
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modalOverlay.classList.contains('active')) {
            closeModal();
        }
    });
}
/**
 * Open the modal
 */
function openModal() {
    const modalOverlay = document.getElementById('modalOverlay');
    const callbackForm = document.getElementById('callbackForm');
    const successMessage = document.getElementById('successMessage');
    modalOverlay.classList.add('active');
    modalOverlay.setAttribute('aria-hidden', 'false');
    // Reset form and hide success message when opening modal
    callbackForm.reset();
    callbackForm.style.display = 'flex';
    successMessage.style.display = 'none';
    // Clear any error messages
    const phoneError = document.getElementById('phoneError');
    phoneError.classList.remove('visible');
    phoneError.textContent = '';
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
}
/**
 * Close the modal
 */
function closeModal() {
    const modalOverlay = document.getElementById('modalOverlay');
    modalOverlay.classList.remove('active');
    modalOverlay.setAttribute('aria-hidden', 'true');
    // Restore body scroll
    document.body.style.overflow = '';
}
/**
 * Setup form validation and submission
 */
function setupFormValidation() {
    const callbackForm = document.getElementById('callbackForm');
    const phoneInput = document.getElementById('customerPhone');
    const phoneError = document.getElementById('phoneError');
    // Real-time phone number validation (allow only numeric input)
    phoneInput.addEventListener('input', (event) => {
        const input = event.target;
        const value = input.value;
        // Remove any non-numeric characters
        const numericValue = value.replace(/\D/g, '');
        // Update input value with cleaned numeric value
        input.value = numericValue;
        // Clear error message if input is valid
        if (numericValue.length > 0) {
            phoneError.classList.remove('visible');
            phoneError.textContent = '';
        }
    });
    // Form submission handler
    callbackForm.addEventListener('submit', (event) => {
        event.preventDefault();
        // Validate form
        if (validateForm()) {
            submitForm();
        }
    });
}
/**
 * Validate the callback form
 */
function validateForm() {
    const nameInput = document.getElementById('customerName');
    const phoneInput = document.getElementById('customerPhone');
    const phoneError = document.getElementById('phoneError');
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    // Validate name is not empty
    if (!name) {
        nameInput.focus();
        return false;
    }
    // Validate phone number is numeric and not empty
    if (!phone) {
        phoneError.textContent = 'Mobile number is required.';
        phoneError.classList.add('visible');
        phoneInput.focus();
        return false;
    }
    // Validate phone number is numeric
    const numericRegex = /^\d+$/;
    if (!numericRegex.test(phone)) {
        phoneError.textContent = 'Mobile number must contain only numbers.';
        phoneError.classList.add('visible');
        phoneInput.focus();
        return false;
    }
    // Validate phone number length (reasonable range: 10-15 digits)
    if (phone.length < 10 || phone.length > 15) {
        phoneError.textContent = 'Please enter a valid mobile number (10-15 digits).';
        phoneError.classList.add('visible');
        phoneInput.focus();
        return false;
    }
    // Clear error if validation passes
    phoneError.classList.remove('visible');
    phoneError.textContent = '';
    return true;
}
/**
 * Submit the form data
 */
async function submitForm() {
    const nameInput = document.getElementById('customerName');
    const phoneInput = document.getElementById('customerPhone');
    const callbackForm = document.getElementById('callbackForm');
    const successMessage = document.getElementById('successMessage');
    const submitButton = callbackForm.querySelector('button[type="submit"]');

    // Gather form data
    const formData = {
        name: nameInput.value.trim(),
        phone: phoneInput.value.trim()
    };

    // Show loading state
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Submitting...';
    submitButton.disabled = true;

    try {
        // API Gateway endpoint from Terraform deployment
        const API_ENDPOINT = 'https://x2yklfyv11.execute-api.us-east-1.amazonaws.com/create-contact';

        // Make API call to Lambda function
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok && result.success) {
            // Log to console for debugging
            console.log('=== Callback Request Submitted ===');
            console.log('Name:', formData.name);
            console.log('Phone:', formData.phone);
            console.log('Contact ID:', result.contactId);
            console.log('Timestamp:', new Date().toISOString());
            console.log('==================================');

            // Hide form and show success message
            callbackForm.style.display = 'none';
            successMessage.style.display = 'block';
        } else {
            // Show error message
            alert(result.message || 'An error occurred. Please try again.');
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        alert('Network error. Please check your connection and try again.');
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
    }
}
