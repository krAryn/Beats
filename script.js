// [
//   {songName: "", artistName: "", songUrl: ""}
// ]


(async function () {
  let availablePlayerModes = [
    "repeat-none",
    "repeat-one",
    "repeat-all",
    "shuffle",
  ];
  
  let playerMode = availablePlayerModes[0]; // repeat-none, repeat-one, repeat-all, shuffle
  let HOSTNAME = "127.0.0.1"
  let PORT = 3000

  document
    .querySelector(".extra-btns")
    .querySelector(
      ".play-mode"
    ).style.backgroundImage = `url("./assets/images/repeat.svg")`;

  document
    .querySelector(".extra-btns")
    .querySelector(".play-mode").style.opacity = 0.5;
  document.querySelector(".prev.button").style.opacity = 0.5; // currentAudio is first in list

  let autoPlay = false;

  function isFirst() {
    if (getTrackFromLibrary(currentAudio.src, -1) === "overflow") {
      return true;
    }
  }

  function isLast() {
    if (getTrackFromLibrary(currentAudio.src, 1) === "overflow") {
      return true;
    }
  }

  let currentAudio = new Audio(
    `http://${HOSTNAME}:3000/Songs/Album 1/Alone@BoDleasons.mp3`
  );

  // Load all albums
  let res = await fetch(`http://${HOSTNAME}:3000/Songs`);
  let data = await res.text();

  let albumUrl = `http://${HOSTNAME}:3000/Songs/Album%201/`;

  let doc = document.createElement("div");
  doc.innerHTML = data;

  Array.from(doc.querySelectorAll("a"))
    .slice(1)
    .forEach(async (ele) => {
      let albumInfoRes = await fetch(`${ele.href}info.json`);
      let albumInfo = await albumInfoRes.json();
      let div = document.createElement("div");
      div.classList.add("playlist", "flex");
      div.innerHTML = `
      <div class="load-playlist flex center"></div>
      <img src=http://${HOSTNAME}:${PORT}/${albumInfo["cover"]} alt="">
      <h2>${albumInfo["name"]}</h2>
      <p>${albumInfo["desc"]}</p>
      <div class="url" style="display: none">${ele.href}</div>
    `;
      document.querySelector(".playlists").append(div);
    });

  async function getSongs(albumUrl) {
    // document.querySelector(".progress-bar").value = 0;

    let obj = document.querySelector(".play-pause.button");
    obj.style.backgroundImage = `url("./assets/images/play-track.png")`;

    obj.animate(
      [
        { opacity: 0, height: 0 },
        { opacity: 1, height: "20px" },
      ],
      100
    );

    currentAudio.pause();

    let res = await fetch(`${albumUrl}`);
    let data = await res.text();

    let albumInfoRes = await fetch(`${albumUrl}/info.json`);
    let albumInfoObj = await albumInfoRes.json();

    let doc = document.createElement("div");
    let songsData = [];

    doc.innerHTML = data;

    // currentAudio.src = doc.querySelectorAll("a")[1].href;
    // console.log(data)

    // Array.from(doc.querySelectorAll("a"))
    let firstSongLoaded = 0

    Array.from(doc.getElementsByTagName("a")).forEach((e) => {
      if (e.innerHTML.endsWith(".mp3")) {
        if (!firstSongLoaded) {
          console.log(e.href)
          currentAudio.src = e.href;
          firstSongLoaded = 1;
          currentAudio.addEventListener("loadeddata", () => updateTrackDetails())
        }
        let tmpData = e.innerHTML.split(".")[0].split("@");
        let songData = {
          songName: tmpData[0],
          artistName: tmpData[1],
          songUrl: e.href,
        };
        songsData.push(songData);
      }
    });



    // Populate Data in library Section
    let ele = document.querySelector(".library-list");

    songsData.forEach((data) => {
      li = document.createElement("li");
      li.innerHTML = `
          <div class="markPlay"></div>
          <div class="play-now facade"></div>
          <div class="play-now before"></div>
            <div class="track-container">
            <div class="track flex center">
              <div class="track-cover"></div>
              <div class="track-data">
                <div class="track-name">${data.songName} </div>
                <div class="artist">${data.artistName} | ${albumInfoObj["name"]}</div>
                <div class="url" style="display: none">${data.songUrl}</div>
              </div>
            </div>
          </div>
          <div class="play-now after"></div>
          `;
      li.querySelector(".track-cover").style.backgroundImage = `url(http://${HOSTNAME}:${PORT}/${albumInfoObj["cover"]})`
      ele.append(li);
    });

    // Hover effect in library cards
    Array.from(document.querySelector(".library-list").children).forEach(
      (e) => {
        e.addEventListener("mouseover", () => {
          e.querySelectorAll(".play-now").forEach((ele) => {
            ele.style.opacity = 1;
            ele.style.transition = "opacity 200ms";
          });
        });

        e.addEventListener("mouseout", () => {
          e.querySelectorAll(".play-now").forEach((ele) => {
            ele.style.opacity = 0;
          });
        });

        e.querySelector(
          ".play-now.after"
        ).style.backgroundImage = `url("./assets/images/play-track.png")`;

        e.addEventListener("click", (event) => {
          event.stopPropagation();
          let newAudio = e.querySelector(".url").innerHTML;
          if (newAudio !== currentAudio.src) {
            if (!currentAudio.paused) {
              toggleAllPlayFeatures();
            }

            currentAudio.src = newAudio;
            currentAudio.play().then(() => {
              fetchVolLevelimg();
              toggleAllPlayFeatures();
              updateTrackDetails();
              if (isFirst()) {
                // grey out prev button
                document.querySelector(".prev.button").style.opacity = 0.5;
              } else {
                // ungrey
                document.querySelector(".prev.button").style.opacity = 1;
              }
              if (isLast()) {
                // grey out next button
                document.querySelector(".next.button").style.opacity = 0.5;
              } else {
                // ungrey
                document.querySelector(".next.button").style.opacity = 1;
              }
            });
          } else {
            if (currentAudio.paused) {
              currentAudio.play().then(() => {
                fetchVolLevelimg();
                toggleAllPlayFeatures();
                updateTrackDetails();
                if (isFirst()) {
                  // grey out prev button
                  document.querySelector(".prev.button").style.opacity = 0.5;
                } else {
                  // ungrey
                  document.querySelector(".prev.button").style.opacity = 1;
                }
                if (isLast()) {
                  // grey out next button
                  document.querySelector(".next.button").style.opacity = 0.5;
                } else {
                  // ungrey
                  document.querySelector(".next.button").style.opacity = 1;
                }
              });
            } else {
              currentAudio.pause();
              toggleAllPlayFeatures();
            }
          }
        });
      }
    );

    // Toggles Music play or pause button; ele is the play-pause image block

    // Play/Pause Audio feature in library list
  }

  await getSongs(albumUrl);

  function fetchVolLevelimg() {
    let percent = Number(document.querySelector(".vol-bar").value);
    currentAudio.volume = (1 * percent) / 100;
    if (currentAudio.volume <= 1 && currentAudio.volume > 0.5) {
      document.querySelector(
        ".volume"
      ).style.backgroundImage = `url(./assets/images/volume-l1.svg)`;
    } else if (currentAudio.volume === 0) {
      document.querySelector(
        ".volume"
      ).style.backgroundImage = `url(./assets/images/volume-l3.svg)`;
    } else {
      document.querySelector(
        ".volume"
      ).style.backgroundImage = `url(./assets/images/volume-l2.svg)`;
    }
  }

  fetchVolLevelimg();

  // src is audio url, index: -1, 0, 1 => -1 returns previous track li; 0 returns current track li; 1 returns next track li
  function getTrackFromLibrary(src, index) {
    let items = Array.from(document.querySelector(".library-list").children);

    let seekingIndex = -1; // 0 <= seekingIndex < items.length

    for (let i = 0; i < items.length; i++) {
      if (items[i].querySelector(".url").innerHTML === src) {
        if (playerMode === "repeat-one") {
          return items[i];
        }

        if (index === -1) {
          seekingIndex = i - 1;
        } else if (index === 0) {
          seekingIndex = i;
        } else if (index === 1) {
          seekingIndex = i + 1;
        }
      }
    }

    if (
      playerMode === "repeat-none" &&
      (seekingIndex < 0 || seekingIndex === items.length)
    ) {
      return "overflow"; // returns overflow when repeat none;
    } else if (playerMode === "repeat-all") {
      if (seekingIndex < 0) {
        seekingIndex = items.length - 1;
      } else if (seekingIndex === items.length) {
        seekingIndex = 0;
      }
    }

    return items[seekingIndex];
  }

  let vol = document.querySelector(".volume");
  vol.addEventListener("click", (e) => {
    e.stopPropagation();
    vol.children[0].style.opacity = 1;
    vol.children[0].style.transition = "opacity 200ms";
  });

  document.addEventListener("click", () => {
    vol.children[0].style.opacity = 0;
    vol.children[0].style.transition = "opacity 200ms";
  });

  document.querySelector(
    ".play-pause.button"
  ).style.backgroundImage = `url("./assets/images/play-track.png")`;

  // takes in element and if bg is play or no music is playing then bg gets pause; else bg gets pause
  function toggleMusicButton(ele) {
    if (ele.style.backgroundImage === `url("./assets/images/play-track.png")`) {
      ele.style.backgroundImage = `url("./assets/images/pause-track.png")`;
      ele.animate(
        [
          { opacity: 0, height: 0 },
          { opacity: 1, height: "20px" },
        ],
        100
      );
    } else {
      ele.style.backgroundImage = `url("./assets/images/play-track.png")`;

      ele.animate(
        [
          { opacity: 0, height: 0 },
          { opacity: 1, height: "20px" },
        ],
        100
      );
    }
  }

  // Toggles the blur on the image of ele li in the library section
  function toggleTrackMark(ele) {
    if (ele.querySelector(".markPlay").style.opacity === "1") {
      ele.querySelector(".markPlay").style.opacity = "0"; //pause
      ele.querySelector(".markPlay").style.transition = "opacity 500ms";
      ele.querySelector(".track-container").style.backgroundColor = "#222";
    } else {
      ele.querySelector(".markPlay").style.opacity = "1";
      ele.querySelector(".markPlay").style.transition = "opacity 500ms";
      ele.querySelector(".track-container").style.backgroundColor = "#181e1b";
    }
  }

  function toggleAllPlayFeatures() {
    toggleMusicButton(
      getTrackFromLibrary(currentAudio.src, 0).querySelector(".after")
    );
    toggleMusicButton(document.querySelector(".play-pause.button"));
    toggleTrackMark(getTrackFromLibrary(currentAudio.src, 0));
  }

  function parseTime(rawSec) {
    let min = Math.floor(rawSec / 60);
    let sec = Math.floor(rawSec % 60);

    if (min < 10) {
      min = String(min);
      min = "0" + min;
    }

    if (sec < 10) {
      sec = String(sec);
      sec = "0" + sec;
    }

    return min + ":" + sec;
  }

  function updateTrackDetails() {
    document.querySelector(".progress-bar").value = 0;
    // console.log(currentAudio.duration)

    if (currentAudio.duration) {
      document.querySelector(".duration").innerHTML = parseTime(
        currentAudio.duration
      );
    }

    let trackName = getTrackFromLibrary(currentAudio.src, 0).querySelector(
      ".track-name"
    ).innerHTML;
    let artistName = getTrackFromLibrary(currentAudio.src, 0).querySelector(
      ".artist"
    ).innerHTML;

    let a = document.querySelector(".track-details").animate(
      [
        {
          transform: "translate(-105%)",
        },
        {
          transform: "translate(150%)",
        },
      ],
      {
        duration: 10000,
        iterations: Infinity,
        easing: "linear",
      }
    );
    document.querySelector(".track-details").innerHTML = `
    ${trackName} | by ${artistName}
    `;
  }

  updateTrackDetails();

  // Play-pause audio feature in player controller
  document.querySelector(".play-pause").addEventListener("click", () => {
    if (currentAudio.paused) {
      currentAudio.play().then(() => {
        fetchVolLevelimg();
        toggleAllPlayFeatures();
        if (isFirst()) {
          // grey out prev button
          document.querySelector(".prev.button").style.opacity = 0.5;
        } else {
          // ungrey
          document.querySelector(".prev.button").style.opacity = 1;
        }
        if (isLast()) {
          // grey out next button
          document.querySelector(".next.button").style.opacity = 0.5;
        } else {
          // ungrey
          document.querySelector(".next.button").style.opacity = 1;
        }
      });
    } else {
      currentAudio.pause();
      toggleAllPlayFeatures();
    }
  });

  // Previous button in controller
  document.querySelector(".prev.button").addEventListener("click", () => {
    let trackObject;
    if (playerMode === "shuffle") {
      items = Array.from(document.querySelector(".library-list").children);
      trackObject = items[Math.floor(Math.random() * items.length)];
    } else {
      trackObject = getTrackFromLibrary(currentAudio.src, -1);
    }

    if (trackObject !== "overflow") {
      !currentAudio.paused ? toggleAllPlayFeatures() : {};

      currentAudio.src = trackObject.querySelector(".url").innerHTML;
      currentAudio.play().then(() => {
        fetchVolLevelimg();
        updateTrackDetails();
        if (isFirst()) {
          // grey out prev button
          document.querySelector(".prev.button").style.opacity = 0.5;
        } else {
          // ungrey
          document.querySelector(".prev.button").style.opacity = 1;
        }
        if (isLast()) {
          // grey out next button
          document.querySelector(".next.button").style.opacity = 0.5;
        } else {
          // ungrey
          document.querySelector(".next.button").style.opacity = 1;
        }
      });
      toggleAllPlayFeatures();
      document.querySelector(
        ".play-pause.button"
      ).style.backgroundImage = `url("./assets/images/pause-track.png")`;
    }
  });

  // Next Button in player controller
  function next() {
    let trackObject;
    if (playerMode === "shuffle") {
      items = Array.from(document.querySelector(".library-list").children);
      trackObject = items[Math.floor(Math.random() * items.length)];
    } else {
      trackObject = getTrackFromLibrary(currentAudio.src, 1);
    }

    if (trackObject !== "overflow") {
      !currentAudio.paused ? toggleAllPlayFeatures() : {};
      currentAudio.src = trackObject.querySelector(".url").innerHTML;
      currentAudio.play().then(() => {
        fetchVolLevelimg();
        updateTrackDetails();
        if (isFirst()) {
          // grey out prev button
          document.querySelector(".prev.button").style.opacity = 0.5;
        } else {
          // ungrey
          document.querySelector(".prev.button").style.opacity = 1;
        }
        if (isLast()) {
          // grey out next button
          document.querySelector(".next.button").style.opacity = 0.5;
        } else {
          // ungrey
          document.querySelector(".next.button").style.opacity = 1;
        }
      });
      toggleAllPlayFeatures();
      document.querySelector(
        ".play-pause.button"
      ).style.backgroundImage = `url("./assets/images/pause-track.png")`;
    }
  }

  document.querySelector(".next.button").addEventListener("click", () => {
    next();
  });

  // Volume controls
  document.querySelector(".vol-bar").addEventListener("input", () => {
    fetchVolLevelimg();
  });

  // Progressbar controls
  document.querySelector(".progress-bar").addEventListener("input", () => {
    let percent = Number(document.querySelector(".progress-bar").value);

    currentAudio.currentTime = (currentAudio.duration * percent) / 100;
  });

  // Sets UI to play state
  function togglePlayState() {
    // play-pause button to pause-track
    // library play button to pause-track
    // .markPlay opacity to 1
    // .track-container bg color to #181e1b
  }

  // Sets UI to pause state
  function togglePauseState() {
    // play-pause button to play-track
    let ele = document.querySelector(".play-pause.button");
    ele.style.backgroundImage = `url("./assets/images/play-track.png")`;

    ele.animate(
      [
        { opacity: 0, height: 0 },
        { opacity: 1, height: "20px" },
      ],
      100
    );

    // library play button to play-track
    ele = getTrackFromLibrary(currentAudio.src, 0);
    ele.querySelector(
      ".play-now.after"
    ).style.backgroundImage = `url("./assets/images/play-track.png")`;

    // .markPlay opacity to 0
    ele.querySelector(".markPlay").style.opacity = "0"; //pause
    ele.querySelector(".markPlay").style.transition = "opacity 500ms";

    // .track-container bg color to #222
    ele.querySelector(".track-container").style.backgroundColor = "#222";
  }

  // Timeupdate (event occurs when currentTime changes)
  currentAudio.addEventListener("timeupdate", () => {
    // update current time in UI
    fetchVolLevelimg();

    document.querySelector(".currentTime").innerHTML = parseTime(
      currentAudio.currentTime
    );

    // update progress bar
    document.querySelector(".progress-bar").value = Math.floor(
      (currentAudio.currentTime / currentAudio.duration) * 100
    );

    if (currentAudio.currentTime === currentAudio.duration) {
      if (autoPlay === true) {
        if (playerMode === "repeat-one") {
          currentAudio.currentTime = 0;
          currentAudio.play().then(() => fetchVolLevelimg());
        } else {
          togglePauseState();
          next();
        }
      } else {
        togglePauseState();
      }
    }
  });

  // AutoPlay button
  function toggleAutoPlayButton() {
    if (autoPlay) {
      document
        .querySelector(".autoplay")
        .querySelector(".thumb")
        .animate([{ width: "40px" }, { width: "20px" }], {
          duration: 200,
          easing: "linear",
        })
        .finished.then(() => {
          autoPlay = false;
          document
            .querySelector(".autoplay")
            .querySelector(".thumb").style.width = "20px";
          document
            .querySelector(".autoplay")
            .querySelector(".thumb")
            .querySelector(".before").style.backgroundColor = "grey";
        });
    } else {
      document
        .querySelector(".autoplay")
        .querySelector(".thumb")
        .animate([{ width: "20px" }, { width: "40px" }], {
          duration: 200,
          easing: "linear",
        })
        .finished.then(() => {
          autoPlay = true;
          document
            .querySelector(".autoplay")
            .querySelector(".thumb").style.width = "40px";
          document
            .querySelector(".autoplay")
            .querySelector(".thumb")
            .querySelector(".before").style.backgroundColor = "white";
        });
    }
  }

  toggleAutoPlayButton();

  document.querySelector(".autoplay").addEventListener("click", (e) => {
    e.stopPropagation();
    toggleAutoPlayButton();
  });

  // hamburger feature
  let sideBar = false;
  document.querySelector(".hamburger").addEventListener("click", (e) => {
    e.stopPropagation();

    document.querySelector(".cross").style.opacity = 1;
    document.querySelector(".cross").style.transform = "unset";
    document.querySelector(".hamburger").style.opacity = 0;
    document.querySelector(".hamburger").style.transform = "scale(1.5)";

    if (!sideBar) {
      document.querySelector(".nav-library").style.transform = "unset";
      sideBar = true;
    }
  });

  // cross feature
  document.querySelector(".cross").addEventListener("click", (e) => {
    e.stopPropagation();

    document.querySelector(".cross").style.opacity = 0;
    document.querySelector(".cross").style.transform = "scale(1.5)";
    document.querySelector(".hamburger").style.opacity = 1;
    document.querySelector(".hamburger").style.transform = "unset";

    if (sideBar) {
      document.querySelector(".nav-library").style.transform =
        "translate(-110%)";
      sideBar = false;
    }
  });

  // window click to hide sidebar
  document.querySelector(".main-area").addEventListener("click", (e) => {
    document.querySelector(".cross").style.opacity = 0;
    document.querySelector(".cross").style.transform = "scale(1.5)";
    document.querySelector(".hamburger").style.opacity = 1;
    document.querySelector(".hamburger").style.transform = "unset";
    if (sideBar && screen.width <= 1150) {
      document.querySelector(".nav-library").style.transform =
        "translate(-110%)";
      sideBar = false;
    }
  });

  window.addEventListener("resize", () => {
    document.querySelector(".nav-library").style.transform = "unset";

    document.querySelector(".cross").style.opacity = 1;
    document.querySelector(".cross").style.transform = "unset";
    document.querySelector(".hamburger").style.opacity = 0;
    document.querySelector(".hamburger").style.transform = "scale(1.5)";

    sideBar = true;
  });

  // Player Mode toggle
  // availablePlayerModes = ["repeat-none", "repeat-one", "repeat-all", "shuffle"]
  document
    .querySelector(".extra-btns")
    .querySelector(".play-mode")
    .addEventListener("click", (event) => {
      let i = availablePlayerModes.indexOf(playerMode);
      i = i + 1 === availablePlayerModes.length ? 0 : i + 1;
      playerMode = availablePlayerModes[i];
      if (playerMode === "repeat-none") {
        // grey out the icon
        event.target.style.backgroundImage = `url("./assets/images/repeat.svg")`;
        event.target.style.opacity = 0.5;
      } else if (playerMode === "repeat-one") {
        // set img to repeat-one
        event.target.style.backgroundImage = `url("./assets/images/repeat-one.svg")`;
        event.target.style.opacity = 1;
      } else if (playerMode === "repeat-all") {
        // set img to repeat
        event.target.style.backgroundImage = `url("./assets/images/repeat.svg")`;
      } else {
        // set img to shuffle
        event.target.style.backgroundImage = `url("./assets/images/shuffle.svg")`;
      }
    });

  // Playlist Selection (Album)
  let currListObj = null; // first album
  document.querySelectorAll(".playlist").forEach((ele) => {
    ele.addEventListener("mouseenter", (e) => {
      e.stopPropagation();
      if (e.currentTarget !== currListObj) {
        e.currentTarget.querySelector(".load-playlist").style.opacity = 1;
        e.currentTarget.querySelector(".load-playlist").style.transform =
          "translateY(-100%)";
        e.currentTarget.style.transform = "scale(1.1)";
        e.currentTarget.style.boxShadow = "0 0 20px 0 #000000";
      }
    });

    ele.addEventListener("click", (e) => {
      document.querySelector(".progress-bar").value = 0;
      if (e.currentTarget !== currListObj) {
        document.querySelector(".library-list").innerHTML = "";
        getSongs(e.currentTarget.querySelector(".url").innerHTML);
        e.currentTarget.style.opacity = 0.5;
        e.currentTarget.querySelector(".load-playlist").style.opacity = 0;
        e.currentTarget.querySelector(".load-playlist").style.transform =
          "unset";
        e.currentTarget.style.transform = "unset";
        e.currentTarget.style.boxShadow = "unset";
        if (currListObj) {
          currListObj.style.opacity = 1;
        }
        currListObj = e.currentTarget;
      }
    });

    ele.addEventListener("mouseleave", (e) => {
      e.stopPropagation();
      e.currentTarget.querySelector(".load-playlist").style.opacity = 0;
      e.currentTarget.querySelector(".load-playlist").style.transform = "unset";
      e.currentTarget.style.transform = "unset";
      e.currentTarget.style.boxShadow = "unset";
    });
  });

  // show-hide-player
  let isVisible = true;

  document.querySelector(".show-hide-player-container").addEventListener("click", (event) => {
    if (isVisible) {
      event.currentTarget.style.transform = `rotateZ(-180deg)`
      document.querySelector(".player-controller").style.transform = "translateY(120%)";
      isVisible = false
    } else {
      event.currentTarget.style.transform = `unset`
      document.querySelector(".player-controller").style.transform = "unset";
      isVisible = true;
    }

  })

  // -----------------------------------------------------------------------------------------------------------------------------
})();
