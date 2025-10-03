let currentSong = new Audio();
        let songs;
        let currFolder;

        function secondsToMinutesSeconds(seconds) {
            if (isNaN(seconds) || seconds < 0) {
                return "00/00";
            }

            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = Math.floor(seconds % 60);

            const formattedMinutes = String(minutes).padStart(2, '0');
            const formattedSeconds = String(remainingSeconds).padStart(2, '0');

            return `${formattedMinutes}:${formattedSeconds}`;
        }

        async function getSongs(folder) {
            currFolder = folder;
            try {
            let a = await fetch(`/${folder}/`);
            let response = await a.text();
            let div = document.createElement("div");
            div.innerHTML = response;
            let as = div.getElementsByTagName("a");
            songs = [];
                
                console.log(`Fetching songs from folder: ${folder}`);
                console.log("Raw HTML response:", response.substring(0, 500));
                
                for (let index = 0; index < as.length; index++) {
                    const element = as[index];
                    console.log(`Link ${index}:`, element.href, element.textContent);
                    if (element.href.endsWith(".mp3")) {
                        let songName;
                        if (element.href.includes("%5C")) {
                            // Handle Windows-style paths: %5Csongs%5Cncs%5Csong.mp3 -> song.mp3
                            const parts = element.href.split("%5C");
                            console.log("Windows song path parts:", parts);
                            songName = parts[parts.length - 1];
                        } else {
                            // Handle Unix-style paths: /songs/ncs/song.mp3 -> song.mp3
                            const parts = element.href.split(`/${folder}/`);
                            console.log("Unix song path parts:", parts);
                            songName = parts[1];
                        }
                        console.log("Extracted song name:", songName);
                        // Validate that songName exists and is not undefined
                        if (songName && typeof songName === 'string') {
                            songs.push(songName);
                            console.log("Added song to array:", songName);
                        } else {
                            console.log("Invalid song name, skipping:", songName);
                        }
                    }
                }

            let UL = document.querySelector(".playList").getElementsByTagName("ul")[0];
            UL.innerHTML = "";
                console.log("Songs found:", songs.length, songs);
                
                if (songs.length === 0) {
                    UL.innerHTML = "<li>No songs found in this folder</li>";
                    return songs;
                }
                
            for (const song of songs) {
                    // Additional validation before using replaceAll
                    if (song && typeof song === 'string') {
                UL.innerHTML = UL.innerHTML + `<li> 
                    <img class="invert" width="20px" src="img/music.svg" alt="" srcset="">
                    <div class="info">
                        <div>${song.replaceAll("%20", " ")}</div>
                        <div>Anirudh</div>
                    </div>
                    <div class="play">
                        <span>Play Now</span>
                        <img class="invert" width="18px" src="img/play.svg" alt="" srcset="">
                    </div>
                </li>`;
                    }
            }

                Array.from(document.querySelector(".playList").getElementsByTagName("li")).forEach((element, index) => {
                element.addEventListener("click", e => {
                        currentIndex = index; // Update currentIndex when song is clicked
                    playMusic(element.querySelector(".info").firstElementChild.innerHTML.trim());
                });
            });

            return songs;
            } catch (error) {
                console.error(`Error fetching songs from ${folder}:`, error);
                songs = [];
                let UL = document.querySelector(".playList").getElementsByTagName("ul")[0];
                UL.innerHTML = "<li>Error loading songs. Please check if server is running.</li>";
                return songs;
            }
        }

const playMusic = (track, pause = false) => {
    // Validate track before processing
    if (!track || typeof track !== 'string') {
        console.error('Invalid track:', track);
        return;
    }
    
     track = track.replaceAll("%20"," ");
    
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = track
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

}
async function displayAlbums() {
    console.log("displaying albums")
    try {
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
        
        console.log("Found anchors:", array.length);
        
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
            console.log(`Album link ${index}:`, e.href, e.textContent);
            // Handle both forward slashes and Windows backslashes (URL encoded as %5C)
            if ((e.href.includes("/songs/") || e.href.includes("%5Csongs%5C")) && !e.href.includes(".htaccess")) {
                let folder;
                if (e.href.includes("%5C")) {
                    // Handle Windows-style paths: %5Csongs%5Ccs%5C -> cs
                    const parts = e.href.split("%5C");
                    console.log("Windows path parts:", parts);
                    folder = parts.slice(-2)[0];
                } else {
                    // Handle Unix-style paths: /songs/cs/ -> cs
                    const parts = e.href.split("/");
                    console.log("Unix path parts:", parts);
                    folder = parts.slice(-2)[0];
                }
                console.log("Processing folder:", folder);
                console.log("Image URL will be:", `/songs/${encodeURIComponent(folder)}/cover.jpg`);
                
                try {
                    // Get the metadata of the folder
                    let infoResponse = await fetch(`/songs/${folder}/info.json`)
                    let infoData = await infoResponse.json();
                    
                    console.log("Creating card with data-folder:", folder);
                    cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
                    <div class="playbutton">
                    <button>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
                                        fill="#0000" style="stroke: black; stroke-width: 1.5;">
                                        <path
                                            d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z" />
                                    </svg>
                            </button>
                            </div>
                            <img src="/songs/${encodeURIComponent(folder)}/cover.jpg" alt="" onerror="console.error('Failed to load image: /songs/${encodeURIComponent(folder)}/cover.jpg')" onload="console.log('Successfully loaded image: /songs/${encodeURIComponent(folder)}/cover.jpg')">
                            <h3 class="font-s">${infoData.title}</h3>
                            <p class="">${infoData.description}</p>
                        </div>`
                } catch (error) {
                    console.error(`Error loading info for folder ${folder}:`, error);
                    // Add card without info.json data
                    cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
                    <div class="playbutton">
                    <button>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
                                        fill="#0000" style="stroke: black; stroke-width: 1.5;">
                                        <path
                                            d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z" />
                                    </svg>
                            </button>
                            </div>
                            <img src="/songs/${encodeURIComponent(folder)}/cover.jpg" alt="" onerror="console.error('Failed to load image: /songs/${encodeURIComponent(folder)}/cover.jpg')" onload="console.log('Successfully loaded image: /songs/${encodeURIComponent(folder)}/cover.jpg')">
                            <h3 class="font-s">${folder}</h3>
                            <p class="">Music Collection</p>
                        </div>`
                }
            }
        }
        
        // Load the playlist whenever card is clicked
        Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click", async item => {
                console.log("Card clicked!")
                console.log("Dataset folder:", item.currentTarget.dataset.folder)
                console.log("Fetching Songs from:", `songs/${item.currentTarget.dataset.folder}`)
                songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
                console.log("Songs after getSongs:", songs)
                // Only play the first song if songs array exists and has at least one valid song
                if (songs && songs.length > 0 && songs[0]) {
                    console.log("Playing first song:", songs[0])
                    playMusic(songs[0])
                } else {
                    console.log("No songs found or songs array is empty")
                }
            })
        })
        
        console.log("Albums loaded successfully");
    } catch (error) {
        console.error("Error loading albums:", error);
        // Fallback: create cards manually if fetch fails
        const folders = ['cs', 'Gym', 'Hindi', 'ncs', 'Tamil', 'zim hammer'];
        let cardContainer = document.querySelector(".cardContainer");
        
        folders.forEach(folder => {
            console.log("Creating fallback card with data-folder:", folder);
            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
            <div class="playbutton">
            <button>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
                                    fill="#0000" style="stroke: black; stroke-width: 1.5;">
                                    <path
                                        d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z" />
                                </svg>
                        </button>
                        </div>
                    <img src="/songs/${encodeURIComponent(folder)}/cover.jpg" alt="" onerror="console.error('Failed to load image: /songs/${encodeURIComponent(folder)}/cover.jpg')" onload="console.log('Successfully loaded image: /songs/${encodeURIComponent(folder)}/cover.jpg')">
                    <h3 class="font-s">${folder}</h3>
                    <p class="">Music Collection</p>
                    </div>`
        });
        
        // Add event listeners to fallback cards
        Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click", async item => {
                console.log("Fallback card clicked!")
                console.log("Dataset folder:", item.currentTarget.dataset.folder)
                console.log("Fetching Songs from:", `songs/${item.currentTarget.dataset.folder}`)
                songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
                console.log("Songs after getSongs:", songs)
                if (songs && songs.length > 0 && songs[0]) {
                    console.log("Playing first song:", songs[0])
                    playMusic(songs[0])
                } else {
                    console.log("No songs found or songs array is empty")
                }
            })
        })
    }
}
async function main() {
    // Get the list of all the songs
    await getSongs("songs/ncs")
    // Only play the first song if songs array exists and has at least one valid song
    if (songs && songs.length > 0 && songs[0]) {
    playMusic(songs[0], true)
    }

    // Display all the albums on the page
    await displayAlbums()
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })
    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime,currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })
    //add event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })
    //add event listener to hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })
    //add event listener to close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-130%"
    })

    let currentIndex = 0;

    // Add an event listener to previous
    previous.addEventListener("click", () => {
        currentSong.pause()
        console.log("Previous clicked")
        if (songs && songs.length > 0 && (currentIndex - 1) >= 0) {
            currentIndex--;
            playMusic(songs[currentIndex], false)
        }
    })

    // Add an event listener to next
    next.addEventListener("click", () => {
        currentSong.pause()
        console.log("Next clicked")
        if (songs && songs.length > 0 && (currentIndex + 1) < songs.length) {
            currentIndex++;
            playMusic(songs[currentIndex], false)
        }
    })
    // add event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("setting volume to", e.target.value, "/100");
        currentSong.volume = parseInt(e.target.value) / 100
    })
    document.querySelector(".range").getElementsByTagName("input")[0].style.cursor = "pointer"
    // Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }

    })
    document.getElementById("searchInput").addEventListener("input", (e) => {
        const searchQuery = e.target.value.trim().toLowerCase();
        const UL = document.querySelector(".playList").getElementsByTagName("ul")[0];
        UL.innerHTML = ""; // Clear the current list
    
        const matchingSongs = songs.filter(song => 
            song.toLowerCase().includes(searchQuery)
        );
    
        if (matchingSongs.length > 0) {
            matchingSongs.forEach(song => {
                UL.innerHTML += `<li> 
                    <img class="invert" width="20px" src="img/music.svg" alt="" srcset="">
                    <div class="info">
                        <div>${song.replaceAll("%20", " ")}</div>
                        <div>Anirudh</div>
                    </div>
                    <div class="play">
                        <span>Play Now</span>
                        <img class="invert" width="18px" src="img/play.svg" alt="" srcset="">
                    </div>
                </li>`;
            });
    
            // Attach event listeners to the filtered songs
            Array.from(UL.getElementsByTagName("li")).forEach((element, index) => {
                element.addEventListener("click", () => {
                    // Find the original index in the songs array
                    const songName = element.querySelector(".info").firstElementChild.innerHTML.trim();
                    const originalIndex = songs.findIndex(song => song.replaceAll("%20", " ") === songName);
                    if (originalIndex !== -1) {
                        currentIndex = originalIndex;
                    }
                    playMusic(songName);
                });
            });
        } else {
            UL.innerHTML = "<li>No matching songs found.</li>";
        }
    });

    //adding event to keyboard
    document.addEventListener("keydown", (e) => {
    switch (e.key) {
        case " ": // Spacebar for play/pause
            e.preventDefault(); // Prevent page scrolling
            if (currentSong.paused) {
                currentSong.play();
                play.src = "img/pause.svg";
            } else {
                currentSong.pause();
                play.src = "img/play.svg";
            }
            break;
        case "ArrowRight": // Right arrow for next song
            e.preventDefault();
            if (songs && songs.length > 0 && (currentIndex + 1) < songs.length) {
                currentIndex++;
                playMusic(songs[currentIndex], false);
            }
            break;
        case "ArrowLeft": // Left arrow for previous song
            e.preventDefault();
            if (songs && songs.length > 0 && (currentIndex - 1) >= 0) {
                currentIndex--;
                playMusic(songs[currentIndex], false);
            }
            break;
        case "ArrowUp": // Up arrow for volume up
            e.preventDefault();
            currentSong.volume = Math.min(1, currentSong.volume + 0.1);
            document.querySelector(".range").getElementsByTagName("input")[0].value = Math.round(currentSong.volume * 100);
            break;
        case "ArrowDown": // Down arrow for volume down
            e.preventDefault();
            currentSong.volume = Math.max(0, currentSong.volume - 0.1);
            document.querySelector(".range").getElementsByTagName("input")[0].value = Math.round(currentSong.volume * 100);
            break;
    }
});


document.getElementById("themeToggle").addEventListener("click", () => {
    document.body.classList.toggle("light-mode");

    // Get the mode icon element
    let modeIcon = document.getElementById("themeIcon");

    // Change icon based on mode
    if (document.body.classList.contains("light-mode")) {
        localStorage.setItem("theme", "light");
        modeIcon.src = "img/dark-mode.svg"; // Change to dark mode icon
    } else {
        localStorage.setItem("theme", "dark");
        modeIcon.src = "img/mode.svg"; // Change to light mode icon
    }
});

// Load the saved theme preference & update icon
window.addEventListener("DOMContentLoaded", () => {
    let modeIcon = document.getElementById("themeIcon");

    if (localStorage.getItem("theme") === "light") {
        document.body.classList.add("light-mode");
        modeIcon.src = "img/dark-mode.svg"; // Set correct icon
    } else {
        modeIcon.src = "img/light-mode.svg"; // Default dark mode icon
    }
});



}
main()

