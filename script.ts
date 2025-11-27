/**
 * LipGloss Auto Spa - Interactive Functionality
 * Handles modal display, form validation, and user interactions
 */

// Type definitions for form data
interface CallbackFormData {
    name: string;
    phone: string;
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

/**
 * Initialize all application functionality
 */
function initializeApp(): void {
    setupModalHandlers();
    setupFormValidation();
}

/**
 * Setup modal open/close handlers
 */
function setupModalHandlers(): void {
    const modalOverlay = document.getElementById('modalOverlay') as HTMLElement;
    const modalClose = document.getElementById('modalClose') as HTMLButtonElement;
    const ctaTriggers = document.querySelectorAll('.cta-trigger') as NodeListOf<HTMLButtonElement>;

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
function openModal(): void {
    const modalOverlay = document.getElementById('modalOverlay') as HTMLElement;
    const callbackForm = document.getElementById('callbackForm') as HTMLFormElement;
    const successMessage = document.getElementById('successMessage') as HTMLElement;

    modalOverlay.classList.add('active');
    modalOverlay.setAttribute('aria-hidden', 'false');

    // Reset form and hide success message when opening modal
    callbackForm.reset();
    callbackForm.style.display = 'flex';
    successMessage.style.display = 'none';

    // Clear any error messages
    const phoneError = document.getElementById('phoneError') as HTMLElement;
    phoneError.classList.remove('visible');
    phoneError.textContent = '';

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
}

/**
 * Close the modal
 */
function closeModal(): void {
    const modalOverlay = document.getElementById('modalOverlay') as HTMLElement;

    modalOverlay.classList.remove('active');
    modalOverlay.setAttribute('aria-hidden', 'true');

    // Restore body scroll
    document.body.style.overflow = '';
}

/**
 * Setup form validation and submission
 */
function setupFormValidation(): void {
    const callbackForm = document.getElementById('callbackForm') as HTMLFormElement;
    const phoneInput = document.getElementById('customerPhone') as HTMLInputElement;
    const phoneError = document.getElementById('phoneError') as HTMLElement;

    // Real-time phone number validation (allow only numeric input)
    phoneInput.addEventListener('input', (event) => {
        const input = event.target as HTMLInputElement;
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
function validateForm(): boolean {
    const nameInput = document.getElementById('customerName') as HTMLInputElement;
    const phoneInput = document.getElementById('customerPhone') as HTMLInputElement;
    const phoneError = document.getElementById('phoneError') as HTMLElement;

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
function submitForm(): void {
    const nameInput = document.getElementById('customerName') as HTMLInputElement;
    const phoneInput = document.getElementById('customerPhone') as HTMLInputElement;
    const callbackForm = document.getElementById('callbackForm') as HTMLFormElement;
    const successMessage = document.getElementById('successMessage') as HTMLElement;

    // Gather form data
    const formData: CallbackFormData = {
        name: nameInput.value.trim(),
        phone: phoneInput.value.trim()
    };

    // Log to console (simulating backend submission)
    console.log('=== Callback Request Submitted ===');
    console.log('Name:', formData.name);
    console.log('Phone:', formData.phone);
    console.log('Timestamp:', new Date().toISOString());
    console.log('==================================');

    // Hide form and show success message
    callbackForm.style.display = 'none';
    successMessage.style.display = 'block';

    // Optional: Auto-close modal after a delay
    // setTimeout(() => {
    //     closeModal();
    // }, 3000);
}
