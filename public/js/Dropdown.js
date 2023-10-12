 // JavaScript to handle role selection and update the hidden input
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', function () {
            const selectedRole = this.getAttribute('data-value');
            document.getElementById('roleDropdownButton').textContent = selectedRole;
            document.getElementById('selectedRole').value = selectedRole;
        });
    });
