const animals = [
    "lion",
    "tiger",
    "bear",
    "elephant",
    "giraffe",
    "monkey",
    "zebra",
    "penguin",
    "kangaroo",
    "koala",
    "panda",
    "dolphin",
    "whale",
    "shark",
    "octopus",
    "eagle",
    "owl",
    "parrot",
    "snake",
    "turtle",
    "frog",
    "cheetah",
    "rhino",
    "hippo",
    "crocodile",
    "alligator",
    "gorilla",
    "chimpanzee",
    "sloth",
    "camel",
    "llama",
    "alpaca",
    "ostrich",
    "emu",
    "wolf",
    "fox",
    "deer",
    "moose",
    "buffalo",
    "bison",
    "antelope",
    "gazelle",
    "leopard",
    "jaguar",
    "lynx",
    "panther",
    "hyena",
    "meerkat",
    "raccoon",
    "skunk",
    "badger",
    "otter",
    "beaver",
    "hedgehog",
    "porcupine",
    "bat",
    "mole",
    "rabbit",
    "hare",
    "squirrel",
    "hamster",
    "guinea pig",
    "rat",
    "mouse",
    "ferret",
    "weasel",
    "yak",
    "goat",
    "sheep",
    "cow",
    "bull",
    "pig",
    "boar",
    "donkey",
    "horse",
    "pony",
    "reindeer",
    "seal",
    "walrus",
    "manatee",
    "narwhal",
    "stingray",
    "jellyfish",
    "starfish",
    "crab",
    "lobster",
    "shrimp",
    "clam",
    "oyster",
    "squid",
    "seahorse",
    "pufferfish",
    "salmon",
    "trout",
    "goldfish",
    "catfish",
    "toucan",
    "flamingo",
    "peacock",
    "swan",
    "duck",
    "goose",
    "falcon",
    "hawk",
    "vulture",
    "woodpecker",
    "sparrow",
    "crow",
    "raven",
    "robin",
    "pelican",
    "heron",
    "stork",
    "cobra",
    "python",
    "viper",
    "iguana",
    "chameleon",
    "gecko",
    "axolotl",
    "salamander",
    "newt",
    "toad",
    "tarantula",
    "scorpion",
    "centipede",
    "millipede",
    "butterfly",
    "moth",
    "dragonfly",
    "beetle",
    "grasshopper",
    "mantis",
    "ladybug",
    "ant",
    "bee",
    "wasp",
    "termite",
];

// State
let state = {
    token: localStorage.getItem("session_token") || null,
    username: localStorage.getItem("username") || null,
    score: 0,
    timeLeft: 60,
    timer: null,
    currentWord: "",
    isLoginTab: true,
};

// Elements
const els = {
    screens: document.querySelectorAll(".screen"),
    authScreen: document.getElementById("auth-screen"),
    homeScreen: document.getElementById("home-screen"),
    gameScreen: document.getElementById("game-screen"),
    resultScreen: document.getElementById("result-screen"),
    rankingScreen: document.getElementById("ranking-screen"),

    // Auth
    tabLogin: document.getElementById("tab-login"),
    tabRegister: document.getElementById("tab-register"),
    authForm: document.getElementById("auth-form"),
    usernameInput: document.getElementById("username"),
    passwordInput: document.getElementById("password"),
    authSubmit: document.getElementById("auth-submit"),
    authError: document.getElementById("auth-error"),

    // Home
    welcomeMsg: document.getElementById("welcome-msg"),
    btnStart: document.getElementById("btn-start"),
    btnRankingHome: document.getElementById("btn-ranking-home"),
    btnLogout: document.getElementById("btn-logout"),

    // Game
    countdown: document.getElementById("countdown"),
    gameUi: document.getElementById("game-ui"),
    timeLeft: document.getElementById("time-left"),
    currentScore: document.getElementById("current-score"),
    targetWord: document.getElementById("target-word"),
    typeInput: document.getElementById("type-input"),

    // Result
    finalScore: document.getElementById("final-score"),
    btnPlayAgain: document.getElementById("btn-play-again"),
    btnRankingResult: document.getElementById("btn-ranking-result"),
    btnHomeResult: document.getElementById("btn-home-result"),

    // Ranking
    rankingBody: document.getElementById("ranking-body"),
    btnHomeRanking: document.getElementById("btn-home-ranking"),
};

// Router
function showScreen(screenId) {
    els.screens.forEach((s) => s.classList.remove("active"));
    els.screens.forEach((s) => s.classList.remove("hidden"));
    document.getElementById(screenId).classList.add("active");
}

function checkAuth() {
    if (state.token) {
        console.log(state);
        els.welcomeMsg.textContent = `ようこそ、${state.username || "プレイヤー"}さん！`;
        showScreen("home-screen");
    } else {
        showScreen("auth-screen");
    }
}

// API Calls
async function apiCall(endpoint, method = "GET", body = null) {
    const headers = { "Content-Type": "application/json" };
    if (state.token) headers["Authorization"] = `Bearer ${state.token}`;

    const res = await fetch(endpoint, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "API Error");
    return data;
}

// Event Listeners - Auth
els.tabLogin.addEventListener("click", () => {
    state.isLoginTab = true;
    els.tabLogin.classList.add("active");
    els.tabRegister.classList.remove("active");
    els.authSubmit.textContent = "ログイン";
    els.authError.textContent = "";
});

els.tabRegister.addEventListener("click", () => {
    state.isLoginTab = false;
    els.tabRegister.classList.add("active");
    els.tabLogin.classList.remove("active");
    els.authSubmit.textContent = "登録";
    els.authError.textContent = "";
});

els.authForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = els.usernameInput.value.trim();
    const password = els.passwordInput.value;

    if (!username || !password) return;

    try {
        els.authSubmit.disabled = true;
        const endpoint = state.isLoginTab ? "/login" : "/register";
        const data = await apiCall(endpoint, "POST", { username, password });

        state.token = data.session_token;
        state.username = username;
        localStorage.setItem("session_token", data.session_token);
        localStorage.setItem("username", username);

        els.usernameInput.value = "";
        els.passwordInput.value = "";
        els.authError.textContent = "";
        checkAuth();
    } catch (err) {
        els.authError.textContent = err.message;
    } finally {
        els.authSubmit.disabled = false;
    }
});

els.btnLogout.addEventListener("click", () => {
    state.token = null;
    state.username = null;
    localStorage.removeItem("session_token");
    localStorage.removeItem("username");
    checkAuth();
});

// Navigation
els.btnRankingHome.addEventListener("click", showRankings);
els.btnRankingResult.addEventListener("click", showRankings);
els.btnHomeResult.addEventListener("click", checkAuth);
els.btnHomeRanking.addEventListener("click", checkAuth);
els.btnStart.addEventListener("click", startCountdown);
els.btnPlayAgain.addEventListener("click", startCountdown);

// Game Logic
function startCountdown() {
    showScreen("game-screen");
    els.countdown.classList.remove("hidden");
    els.gameUi.classList.add("hidden");

    let count = 3;
    els.countdown.textContent = count;

    const interval = setInterval(() => {
        count--;
        if (count > 0) {
            els.countdown.textContent = count;
            // Retrigger animation
            els.countdown.style.animation = "none";
            els.countdown.offsetHeight; // trigger reflow
            els.countdown.style.animation = null;
        } else {
            clearInterval(interval);
            startGame();
        }
    }, 1000);
}

function startGame() {
    els.countdown.classList.add("hidden");
    els.gameUi.classList.remove("hidden");

    state.score = 0;
    state.timeLeft = 60;
    updateGameUi();
    nextWord();

    els.typeInput.value = "";
    els.typeInput.focus();

    state.timer = setInterval(() => {
        state.timeLeft--;
        els.timeLeft.textContent = state.timeLeft;

        if (state.timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function nextWord() {
    const r = Math.floor(Math.random() * animals.length);
    state.currentWord = animals[r];
    els.targetWord.textContent = state.currentWord;
    els.typeInput.value = "";
}

function updateGameUi() {
    els.currentScore.textContent = state.score;
    els.timeLeft.textContent = state.timeLeft;
}

els.typeInput.addEventListener("input", (e) => {
    const originalVal = e.target.value;
    const val = originalVal.toLowerCase().trim();

    if (val === state.currentWord) {
        state.score++;
        updateGameUi();
        nextWord();
    } else if (state.currentWord.indexOf(val) !== 0 && val.length > 0) {
        // user typed something wrong
        els.typeInput.value = originalVal.slice(0, -1);
        els.typeInput.classList.add("wrong-input");
        setTimeout(() => els.typeInput.classList.remove("wrong-input"), 400);
    }
});

async function endGame() {
    clearInterval(state.timer);
    els.finalScore.textContent = state.score;
    showScreen("result-screen");

    // Submit score
    if (state.score > 0) {
        try {
            await apiCall("/add_score", "POST", { score: state.score });
        } catch (err) {
            console.error("Failed to submit score", err);
        }
    }
}

async function showRankings() {
    showScreen("ranking-screen");
    els.rankingBody.innerHTML =
        '<tr><td colspan="3" style="text-align:center">読み込み中...</td></tr>';

    try {
        const rankings = await apiCall("/api/ranking");
        els.rankingBody.innerHTML = "";

        if (rankings.length === 0) {
            els.rankingBody.innerHTML =
                '<tr><td colspan="3" style="text-align:center">まだスコアがありません！</td></tr>';
            return;
        }

        rankings.forEach((r, i) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>#${i + 1}</td>
                <td>${r.username}</td>
                <td>${r.highest_score}</td>
            `;
            els.rankingBody.appendChild(tr);
        });
    } catch (err) {
        els.rankingBody.innerHTML =
            '<tr><td colspan="3" style="text-align:center; color: var(--error)">ランキングの読み込みに失敗しました</td></tr>';
    }
}

// Init
checkAuth();
