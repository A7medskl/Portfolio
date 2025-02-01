// Fetch and update user data from Lanyard API
function update() {
    fetch('https://api.lanyard.rest/v1/users/789938424282742815', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        updateProfile(data.data);
        updateSpotify(data.data);
        updateActivities(data.data);
    })
    .catch(error => console.error('Error fetching data:', error));
}

// Update profile information
function updateProfile(data) {
    document.querySelector(".avatar").src = `https://cdn.discordapp.com/avatars/${data.discord_user.id}/${data.discord_user.avatar}.png`;
    const statusIndicator = document.querySelector(".status-indicator");

    const statusColors = {
        'dnd': '#fc0303',
        'online': '#0bfc03',
        'idle': '#fcec03',
        'offline': '#616161'
    };

    statusIndicator.style.backgroundColor = statusColors[data.discord_status] || statusColors['offline'];
}

// Update Spotify information
function updateSpotify(data) {
    if (data.listening_to_spotify) {
        document.getElementById("spotify-activite").style.display = "none";
        document.querySelector(".spotify-card").style.display = "flex";

        const spotifyData = data.spotify;
        document.querySelector(".album-art").src = spotifyData.album_art_url;
        document.querySelector(".track-title").textContent = spotifyData.song;
        document.querySelector(".track-artist").textContent = spotifyData.artist;

        const startTime = spotifyData.timestamps.start;
        const endTime = spotifyData.timestamps.end;
        const currentTime = Date.now();
        const progress = ((currentTime - startTime) / (endTime - startTime)) * 100;

        document.querySelector(".progress-bar").style.width = `${progress}%`;

        const currentTimeFormatted = formatTime((currentTime - startTime) / 1000);
        const totalTimeFormatted = formatTime((endTime - startTime) / 1000);
        document.querySelector(".time-info").innerHTML = `<span class="current-time">${currentTimeFormatted}</span> / <span class="total-time">${totalTimeFormatted}</span>`;
    } else {
        document.getElementById("spotify-activite").style.display = "block";
        document.querySelector(".spotify-card").style.display = "none";
    }
}

// Update activities information
function updateActivities(data) {
    const activitiesList = document.querySelector(".activities-list");
    const activitiesHeading = document.querySelector(".Activites h2");
    activitiesList.innerHTML = ""; 

    const filteredActivities = data.activities?.filter(activity => activity.name !== "Spotify" && activity.name !== "Custom Status") || [];

    if (filteredActivities.length > 0) {
        activitiesHeading.style.display = "block"; 
        filteredActivities.forEach(activity => {
            const activityCard = document.createElement("div");
            activityCard.className = "activity-card";

            const startTime = activity.timestamps?.start ? new Date(activity.timestamps.start) : null;
            const timeSpent = startTime ? formatTime((Date.now() - startTime) / 1000) : null;

            activityCard.innerHTML = `
                <img src="${activity.assets?.large_image ? `https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.large_image}.png` : 'https://via.placeholder.com/30'}" alt="${activity.name}" class="activity-icon">
                <div class="activity-details">
                    <div class="activity-name">${activity.name}</div>
                    ${activity.state ? `<div class="activity-state">${activity.state}</div>` : ''}
                    ${activity.details ? `<div class="activity-details-text">${activity.details}</div>` : ''}
                </div>
                ${timeSpent ? `<div class="activity-time">${timeSpent}</div>` : ''}
            `;

            activitiesList.appendChild(activityCard);
        });
    } else {
        activitiesHeading.style.display = "none";
    }
}

// Format time in mm:ss
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Fetch GitHub repositories
function fetchGitHubRepos() {
    fetch('https://api.github.com/users/A7medskl/repos')
    .then(response => response.json())
    .then(repos => {
        const githubList = document.querySelector(".github-list");
        githubList.innerHTML = ""; // Clear existing content

        repos.forEach(repo => {
            const githubCard = document.createElement("a");
            githubCard.className = "github-card";
            githubCard.href = repo.html_url;
            githubCard.target = "_blank";
            githubCard.innerHTML = `
                <i class="bx bxl-github github-logo"></i>
                <div class="github-info">
                    <h3 class="github-title">${repo.name}</h3>
                    <p class="github-description">${repo.description || 'No description available.'}</p>
                    <span class="github-language">${repo.language || 'Unknown'}</span>
                </div>
            `;
            githubList.appendChild(githubCard);
        });
    })
    .catch(error => console.error('Error fetching GitHub repos:', error));
}

// Fetch Wakatime data
function fetchWakatimeData() {
    fetch('http://localhost:3000/wakatime')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        const wakatimeList = document.querySelector(".wakatime-list");
        wakatimeList.innerHTML = ""; // Clear existing content

        // Display time spent on languages
        data.data.languages.forEach(language => {
            const wakatimeCard = document.createElement("div");
            wakatimeCard.className = "wakatime-card";
            wakatimeCard.innerHTML = `
                <div class="wakatime-info">
                    <h3 class="wakatime-title">${language.name}</h3>
                    <p class="wakatime-description">Time spent: ${(language.total_seconds / 3600).toFixed(2)} hours</p>
                </div>
            `;
            wakatimeList.appendChild(wakatimeCard);
        });

        // Display total time
        const totalTimeCard = document.createElement("div");
        totalTimeCard.className = "wakatime-card";
        totalTimeCard.innerHTML = `
            <div class="wakatime-info">
                <h3 class="wakatime-title">Total Time</h3>
                <p class="wakatime-description">Time spent: ${(data.data.total_seconds / 3600).toFixed(2)} hours</p>
            </div>
        `;
        wakatimeList.appendChild(totalTimeCard);
    })
    .catch(error => console.error('Error fetching Wakatime data:', error));
}


// Initial data fetch
update();
fetchGitHubRepos();
fetchWakatimeData();

// Periodic updates
setInterval(update, 1000);
setInterval(fetchWakatimeData, 3600000);