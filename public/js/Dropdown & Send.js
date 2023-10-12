 // JavaScript to handle role selection and update the hidden input
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', function () {
            const selectedRole = this.getAttribute('data-value');
            document.getElementById('roleDropdownButton').textContent = selectedRole;
            document.getElementById('selectedRole').value = selectedRole;
        });
    });
    
 // JavaScript to handle the form submission and send the invitation
 function sendInvitation() {
    // Get the email address and selected role from the form
    var email = document.querySelector('#inviteTeamMemberModal input[type="text"]').value;
    var role = document.getElementById('selectedRole').value;

    // Validate the email address (you can add more robust validation)
    if (!validateEmail(email)) {
        alert('Please enter a valid email address.');
        return;
    }

    // Perform any additional actions here, such as sending the invitation via AJAX
    // For this example, we'll simply display an alert
    alert('Invitation sent to ' + email + ' with the role ' + role);

    // Close the modal
    var modal = document.getElementById('inviteTeamMemberModal');
    var modalBackdrop = document.querySelector('.modal-backdrop');
    modal.style.display = 'none';
    modalBackdrop.style.display = 'none';
}

// Email validation function (a simple example)
function validateEmail(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}