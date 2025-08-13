let currSong = new Audio();
let songs;
let play = document.getElementById("play");
let currfolder;

function convertSecondsToTime(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currfolder = folder;
  console.log(currfolder);
  let a = await fetch(`${document.URL}//${currfolder}/`);

  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;

  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const el = as[index];
    if (el.href.endsWith(".mp3")) {
      songs.push(el.href.split(`/${folder}/`)[1].split(".mp")[0]);
    }
  }

  let songUl = document
    .querySelector(".songlist")
    .getElementsByTagName("ul")[0];

  songUl.innerHTML = " ";

  for (const song of songs) {
    songUl.innerHTML =
      songUl.innerHTML +
      `
      <li>
              <img class="invert" src="img/music.svg" alt="">
              <div class="info">
                <div>${song.replaceAll("%20", " ")}</div>
                <div>Song Artist</div>
            </div>
              <div class="playNow">
                <span>Play Now</span>
                <img class="invert" src="img/pause.svg" alt="">

              </div>
            </li>`;
  }

  Array.from(
    document.querySelector(".songlist").getElementsByTagName("li")
  ).forEach((el) => {
    el.addEventListener("click", () => {
      playMusic(el.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
  return songs

}

const playMusic = (track, pause = false) => {
  currSong.src = `/${currfolder}/` + track + ".mp3";
  if (!pause) {
    currSong.play();
    play.src = "img/play.svg";
  }
  document.querySelector(".songInfo").innerHTML = decodeURI(track);
  document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
};

async function DisplayALbum(params) {
  let a = await fetch(`${document.URL}//songs/`);

  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  console.log(anchors);
  let cardContainer = document.querySelector(".CardContainer");
  Array.from(anchors).forEach(async (e) => {
    if (e.href.includes("songs/")) {
      let folder = e.href.split("/").slice(-1)[0];
      let a = await fetch(`${document.URL}/songs/${folder}/info.json`);

      let response = await a.json();
      console.log(response);
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `
            <div data-fold="${folder}" class="card">
              <div class="play">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 20V4L19 12L5 20Z"
                    stroke="#141B34"
                    fill="#000"
                    stroke-width="1.5"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>

              <img src="${document.URL}/songs/${folder}/cover.jpg" alt="" />
              <h2>${response.title}</h2>
              <p>${response.description}</p>
            </div>     
      `;
    }
    Array.from(document.getElementsByClassName("card")).forEach((e) => {
      // let fold=document.getElementsByClassName("play")
      e.addEventListener("click", async (item) => {
        console.log("Fetching Songs");
        console.log(item.currentTarget.dataset.fold);
        songs = await getSongs(`songs/${item.currentTarget.dataset.fold}`);
        playMusic(songs[0]);
      });
    });
  });
}

async function main() {
  await getSongs("songs/playlist");
  playMusic(songs[0], true);

  DisplayALbum();

  play.addEventListener("click", () => {
    if (currSong.paused) {
      currSong.play();
      play.src = "img/play.svg";
    } else {
      currSong.pause();
      play.src = "img/pause.svg";
    }
  });

  currSong.addEventListener("timeupdate", () => {
    document.querySelector(".songTime").innerHTML = `${convertSecondsToTime(
      currSong.currentTime
    )} / ${convertSecondsToTime(currSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currSong.currentTime / currSong.duration) * 100 + "%";
  });

  document.querySelector(".seekbar").addEventListener("click", (el) => {
    let percent = (el.offsetX / el.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currSong.currentTime = (currSong.duration * percent) / 100;
  });

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  previous.addEventListener("click", () => {
    // currSong.pause()
    console.log("Previous clicked");
    let index = songs.indexOf(
      currSong.src.split(`/${currfolder}/`)[1].split(".mp3")[0]
    );
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  next.addEventListener("click", () => {
    // currSong.pause()
    console.log("Next clicked");

    let index = songs.indexOf(
      currSong.src.split(`/${currfolder}/`)[1].split(".mp3")[0]
    );
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (el) => {
      currSong.volume = el.target.value / 100;
      if(currSong.volume>0){
        document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
      }
    });

  

  document.querySelector(".volume>img").addEventListener("click", (e) => {
    console.log(Array.from(e.target.src).slice(" "));

    if (e.target.src.includes("volume.svg")) {
      console.log("volume");
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currSong.volume = 0;
      document.querySelector(".range").getElementsByTagName("input")[0].value=0
    } else {
      console.log("mute");
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currSong.volume = 0.1;
      document.querySelector(".range").getElementsByTagName("input")[0].value=10
    }
  });
}

main();
