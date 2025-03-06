let savedUsername = localStorage.getItem('username') || null;
let savedPassword = localStorage.getItem('password') || null;

async function fetchLogo() {
    const logoUrl = 'https://cws.auckland.ac.nz/nzsl/api/Logo';
    try {
        const response = await fetch(logoUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const logoImageUrl = logoUrl;
        document.getElementById('logo').src = logoImageUrl;
    } catch (error) {
        console.error('Error fetching logo:', error);
    }
}

function switchContent(show) {
    document.getElementById("home").style.display = "none";
    document.getElementById("nzsl").style.display = "none";
    document.getElementById("events").style.display = "none";
    document.getElementById("userRegistration").style.display = "none";
    document.getElementById("guestBook").style.display = "none";

    document.getElementById(show).style.display = "block";
    if (show === "nzsl") {
        fetchAndDisplayNzsl();
    }
    if (show === "events") {
        fetchAndDisplayEvents();
    }
    if (show === "guestBook") {
        fetchComments();
    }
}

function testAuth() {
    const loginForm = document.getElementById("loginForm");
    username = loginForm.username.value;
    password = loginForm.password.value;
    fetch('https://cws.auckland.ac.nz/nzsl/api/TestAuth', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Authentication failed.');
        }
    })
    .then(data => {
        console.log('Authentication successful:', data);
    })
    .catch(error => {
        console.error('Error during authentication test:', error);
        alert('You need to log in first!');
    });
}

async function register(event) {
    event.preventDefault();
    var registrationResult = document.getElementById("registrationResult");
    if (registrationResult) {
        registrationResult.remove();
    }
    const form = document.getElementById('registerForm');
    const formData = new FormData(form);
    const data = {
        username: formData.get('username'),
        password: formData.get('password'),
        address: formData.get('address')
    };

    try {
        const response = await fetch('https://cws.auckland.ac.nz/nzsl/api/Register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
        }

        const result = await response.text();
        const mainContainer = document.getElementById("userRegistration");
        const div = document.createElement("div");
        div.setAttribute("id", "registrationResult");
        div.innerHTML = `<p>${result}</p>`;
        mainContainer.appendChild(div);
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}

function fetchAndDisplayNzsl() {
    fetch('https://cws.auckland.ac.nz/nzsl/api/AllSigns')
        .then(response => response.json())
        .then(data => fetchAndDisplayNZSLSigns(data))
        .catch(err => console.log('error: ' + err));
}

function fetchAndDisplayNZSLSigns(data) {
    const mainContainer = document.getElementById("signList");
    mainContainer.innerHTML = '';
    data.forEach(sign => {
        const div = document.createElement("div");
        div.setAttribute('data-sign-id', sign.id);
        div.setAttribute('class', "imageWrapper");
        const imgUrl = `https://cws.auckland.ac.nz/nzsl/api/SignImage/${sign.id}`;
        const imgHtml = `<img class="itemImage" src="${imgUrl}" alt="Sign for ID: ${sign.id}">`;
        const infoHtml = `<h3>${sign.id}</h3>${sign.description}`;
        div.innerHTML = imgHtml + infoHtml;
        mainContainer.appendChild(div);
    });
}

function filterSigns() {
    const searchInput = document.getElementById('search').value.toLowerCase();
    const signs = document.getElementById('signList').getElementsByTagName('div');
    for (let i = 0; i < signs.length; i++) {
        let signId = signs[i].getAttribute('data-sign-id').toLowerCase();
        if (signId.includes(searchInput)) {
            signs[i].style.display = "block";
        } else {
            signs[i].style.display = "none";
        }
    }
}

function fetchAndDisplayEvents() {
    var mainContainer = document.getElementById("eventsContainer");
    mainContainer.innerHTML = '';
    fetch('https://cws.auckland.ac.nz/nzsl/api/EventCount')
        .then(response => response.json())
        .then(eventCount => {
            for (let i = 0; i < eventCount; i++) {
                fetchEvent(i);
            }
        })
        .catch(error => console.error('Error fetching event count:', error));
}

function fetchEvent(eventNumber) {
    fetch(`https://cws.auckland.ac.nz/nzsl/api/Event/${eventNumber}`)
        .then(response => response.text())
        .then(data => {
            const eventDetails = parseEventString(data);
            displayEvent(eventDetails, eventNumber);
        })
        .catch(error => console.error(`Error fetching event ${eventNumber}:`, error));
}

function setupDownloadButton(eventNumber) {
    const downloadButton = document.getElementById("downloadButton");
    event.preventDefault();
    const url = `https://cws.auckland.ac.nz/nzsl/api/Event/${eventNumber}`;
    fetch(url)
        .then(response => response.text())
        .then(data => {
            const blob = new Blob([data], { type: 'text/calendar' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = `event_${eventNumber}.ics`;
            link.click();
            window.URL.revokeObjectURL(link.href);
        })
        .catch(error => console.error('Error downloading iCalendar:', error));
    downloadButton.style.display = 'block';
}

function parseEventString(eventString) {
    const eventDetails = {};
    const lines = eventString.split('\n');
    lines.forEach(line => {
        line = line.trim();
        if (line.startsWith('DTSTART:')) {
            eventDetails.start = line.replace('DTSTART:', '').trim();
        } else if (line.startsWith('DTEND:')) {
            eventDetails.end = line.replace('DTEND:', '').trim();
        } else if (line.startsWith('SUMMARY:')) {
            eventDetails.summary = line.replace('SUMMARY:', '').trim();
        } else if (line.startsWith('DESCRIPTION:')) {
            eventDetails.description = line.replace('DESCRIPTION:', '').trim();
        } else if (line.startsWith('LOCATION:')) {
            eventDetails.location = line.replace('LOCATION:', '').trim();
        }
    });
    return eventDetails;
}

function formatDateTime(icalDateTime) {
    const year = parseInt(icalDateTime.substring(0, 4), 10);
    const month = parseInt(icalDateTime.substring(4, 6), 10) - 1;
    const day = parseInt(icalDateTime.substring(6, 8), 10);
    const hour = parseInt(icalDateTime.substring(9, 11), 10);
    const minute = parseInt(icalDateTime.substring(11, 13), 10);
    
    const date = new Date(Date.UTC(year, month, day, hour, minute));
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        timeZone: 'Pacific/Auckland',
    };
    const formattedDateTime = date.toLocaleString('en-NZ', options);
    const [datePart, timePart] = formattedDateTime.split(', ');
    const [dayPart, monthPart, yearPart] = datePart.split('/');
    return `${dayPart}/${monthPart}/${yearPart} ${timePart}`;
}

function displayEvent(eventDetails, eventNumber) {
    var mainContainer = document.getElementById("eventsContainer");
    var div = document.createElement("div");
    const eventSummary = `<p>Event Summary: ${eventDetails.summary}<p>`;
    const eventDescription = `<p>Event Description: ${eventDetails.description}<p>`;
    const eventLocation = `<p>Event Location: ${eventDetails.location}<p>`;
    const eventStart = `<p>Event Start: ${formatDateTime(eventDetails.start)}<p>`;
    const eventEnd = `<p>Event End: ${formatDateTime(eventDetails.end)}<p>`;
    const downloadButton = document.createElement("button");
    downloadButton.textContent = "Download iCalendar";
    downloadButton.onclick = () => setupDownloadButton(eventNumber);
    div.innerHTML = eventSummary + eventDescription + eventLocation + eventStart + eventEnd;
    div.appendChild(downloadButton);
    mainContainer.appendChild(div);
}

async function fetchComments() {
    var mainContainer = document.getElementById("eventsContainer");
    const url = 'https://cws.auckland.ac.nz/nzsl/api/Comments';
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const html = await response.text();
        const commentsList = document.getElementById('commentsList');
        commentsList.innerHTML = html;
        document.getElementById('guestBook').style.display = 'block';
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error);
    }
}

async function checkAuth() {
    try {
        const response = await fetch('https://cws.auckland.ac.nz/nzsl/api/TestAuth');
        return response.status === 200;
    } catch (error) {
        console.error("Error checking authentication:", error);
        return false;
    }
}

function toggleLogoutButton() {
    const logoutButton = document.getElementById("logoutButton");
    if (savedUsername && savedPassword) {
        logoutButton.style.display = "inline-block";
    } else {
        logoutButton.style.display = "none";
    }
}

function openLoginModal() {
    document.getElementById("loginModal").style.display = "block";
}

function closeLoginModal() {
    document.getElementById("loginModal").style.display = "none";
}

document.getElementById("loginForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const url = `https://cws.auckland.ac.nz/nzsl/api/TestAuth?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + btoa(`${username}:${password}`),
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            localStorage.setItem('username', username);
            localStorage.setItem('password', password);
            savedUsername = username;
            savedPassword = password;
            alert("Login successful!");
            toggleLogoutButton();
            closeLoginModal();
        } else {
            const errorText = await response.text();
            console.error("Error response:", errorText);
            alert(`Login failed: ${errorText}`);
        }
    } catch (error) {
        console.error("Error during login:", error);
        alert("An error occurred during login. Please try again.");
    }
});

function displayComment(comment) {
    const commentListItem = document.createElement('li');
    commentListItem.textContent = comment;
    const commentsList = document.getElementById('commentsList');
    commentsList.appendChild(commentListItem);
}

async function postComment() {
    const commentMessage = document.getElementById('commentMessage').value;
    if (!savedUsername || !savedPassword) {
        openLoginModal();
        return;
    }

    const url = `https://cws.auckland.ac.nz/nzsl/api/Comment?comment=${encodeURIComponent(commentMessage)}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + btoa(`${savedUsername}:${savedPassword}`),
            },
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.text();
        fetchComments();
        console.log('Comment posted successfully:', result);
        document.getElementById('commentForm').reset();
    } catch (error) {
        console.error('There was a problem with your fetch operation:', error);
    }
}

document.getElementById('commentForm').addEventListener('submit', (e) => {
    e.preventDefault();
    postComment();
});

document.getElementById("logoutButton").addEventListener("click", function () {
    localStorage.removeItem('username');
    localStorage.removeItem('password');
    savedUsername = null;
    savedPassword = null;
    alert("You have logged out.");
    toggleLogoutButton();
});

function fetchVersion() {
    fetch('https://cws.auckland.ac.nz/nzsl/api/Version')
        .then(response => response.text())
        .then(version => {
            document.getElementById('versionNumber').innerText = version;
        })
        .catch(error => {
            console.error('Error fetching version:', error);
            document.getElementById('versionNumber').innerText = 'Error';
        });
}

document.getElementById("home").style.display = "block";
window.onload = () => {
    fetchVersion();
    fetchLogo();
};
