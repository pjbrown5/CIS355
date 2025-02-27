//Client side js. Handles client side interactions with api.


document.getElementById("addMovieForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    console.log("Form submitted");

    const title = document.getElementById("title").value;
    const year = document.getElementById("year").value

    const submitButton = document.querySelector("button[type='submit']");
    submitButton.disabled = true;

    try {
        const response = await fetch("/movies", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ title, year }),
        });

        if (response.ok) {
            window.location.reload();
        } else {
            alert("Failed to add movie");
        }
    } catch (error) {
        console.error("Error adding movie:", error);
        alert("Error adding movie. Please try again.");
    } finally {
        submitButton.disabled = false;
    }
});

async function markWatched(id) {
    const response = await fetch(`/movies/${id}/watched`, { 
        method: "PUT",
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ watched: true })
    });

    if (response.ok) {
        location.reload();
    } else {
        console.error("Failed to mark movie as watched");
    }
}

async function deleteMovie(id) {
    console.log("Attempting to delete movie with ID:", id);

    const response = await fetch(`/movies/${id}`, { method: "DELETE" });

    if (response.ok) {
        console.log("Movie deleted successfully");
        window.location.reload();
    } else {
        console.error("Failed to delete movie");
    }
}

async function submitRating(id) {
    const rating = document.getElementById(`rating-${id}`).value;
    const review = document.getElementById(`review-${id}`).value;

    if (!rating || rating < 1 || rating > 5) {
        return alert("Please enter a rating between 1 and 5");
    }

    const response = await fetch(`/movies/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, review })
    });

    if (response.ok) {
        window.location.reload();
    } else {
        alert("Failed to submit rating/review");
    }
}
