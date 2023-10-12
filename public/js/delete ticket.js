 $(document).ready(function() {
        $('.delete-item').click(function(e) {
            e.preventDefault(); // Prevent the default behavior of the anchor tag

            // Here, you can implement the logic to delete the item.
            // For demonstration purposes, we'll just show an alert.
            alert("Item deleted!");
        });
    });
