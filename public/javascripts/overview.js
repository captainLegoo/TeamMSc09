let lat = 0;
let lon = 0;

document.addEventListener("DOMContentLoaded", () => {
    const sortDropdown = document.getElementById('sortDropdown');
    const urlParams = new URLSearchParams(window.location.search);
    const sortParam = urlParams.get('sort');
    if (sortParam) {
        sortDropdown.value = sortParam;
    }

    sortDropdown.addEventListener('change', (event) => {
        const selectedSort = event.target.value;
        if (selectedSort === 'distance') {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(showPosition, showError);
            } else {
                alert("Geolocation is not supported by this browser.");
            }
        } else {
            const url = new URL(window.location);
            url.searchParams.set('sort', selectedSort);
            window.location.href = url;
        }
    });

    function showPosition(position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        lat = latitude;
        lon = longitude;
        const selectedSort = sortDropdown.value;
        const url = new URL(window.location);
        url.searchParams.set('sort', selectedSort);
        url.searchParams.set('lat', lat);
        url.searchParams.set('lng', lon);
        window.location.href = url;
    }

    function showError(error) {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                console.log("User denied the request for Geolocation.");
                break;
            case error.POSITION_UNAVAILABLE:
                console.log("Location information is unavailable.");
                break;
            case error.TIMEOUT:
                console.log("The request to get user location timed out.");
                break;
            case error.UNKNOWN_ERROR:
                console.log("An unknown error occurred.");
                break;
        }
    }
});
