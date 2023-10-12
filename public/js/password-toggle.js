// Function to toggle password visibility
function togglePasswordVisibility(inputId, toggleId) {
    const passwordInput = document.getElementById(inputId);
    const toggleIcon = document.getElementById(toggleId);

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        toggleIcon.innerHTML = '<i class="fas fa-eye"></i>';
    } else {
        passwordInput.type = "password";
        toggleIcon.innerHTML = '<i class="fas fa-eye-slash"></i>';
    }
}

// Add event listeners for each password input field
document.getElementById("toggle-current-password").addEventListener("click", function () {
    togglePasswordVisibility("current_password", "toggle-current-password");
});

document.getElementById("toggle-new-password").addEventListener("click", function () {
    togglePasswordVisibility("new_password", "toggle-new-password");
});

document.getElementById("toggle-confirm-new-password").addEventListener("click", function () {
    togglePasswordVisibility("confirm_new_password", "toggle-confirm-new-password");
});
