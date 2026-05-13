const TD = [];

let correctAnswer = "";
let locked = false;
let activePlayer = null;

let score1 = 0;
let score2 = 0;

let playersWhoGuessed = [];

// CURRENT USER
let currentUser = null;

document.addEventListener("DOMContentLoaded", () => {

  // ---------- ELEMENTS ----------

  const addBtn = document.getElementById("add-btn");

  // YOUR HTML USES play-Btn
  const playBtn = document.getElementById("play-Btn");

  const cardRows = document.getElementById("card-rows");

  const listContainer =
    document.getElementById("list-container");

  const game =
    document.getElementById("game");

  const navRow =
    document.querySelector(".nav-row");

  const signupNav =
    document.getElementById("signup-nav");

  const loginNav =
    document.getElementById("login-nav");

  const logoutNav =
    document.getElementById("logout-nav");

  const authModal =
    document.getElementById("auth-modal");

  const authSubmit =
    document.getElementById("auth-submit");

  // ---------- STORAGE ----------

  function saveToStorage() {

    if (!currentUser) return;

    const data = Array.from(
      document.querySelectorAll(".container")
    ).map(row => ({
      term: row.querySelector(".l").value.trim(),
      definition: row.querySelector(".r").value.trim()
    }));

    localStorage.setItem(
      `studyGameData_${currentUser}`,
      JSON.stringify(data)
    );
  }

  function loadFromStorage() {

    cardRows.innerHTML = "";

    if (!currentUser) {
      createRow();
      return;
    }

    const saved = JSON.parse(
      localStorage.getItem(
        `studyGameData_${currentUser}`
      ) || "[]"
    );

    if (saved.length > 0) {

      saved.forEach(item => {
        createRow(item.term, item.definition);
      });

    } else {

      createRow();
    }
  }

  // ---------- CREATE ROW ----------

  function createRow(term = "", def = "") {

    const row = document.createElement("div");

    row.className = "container";

    row.innerHTML = `
      <input
        class="l"
        placeholder="Term"
        value="${term}"
      >

      <button class="remove-btn">
        Remove
      </button>

      <input
        class="r"
        placeholder="Definition"
        value="${def}"
      >
    `;

    cardRows.appendChild(row);

    row.querySelectorAll("input").forEach(input => {
      input.oninput = saveToStorage;
    });
  }

  loadFromStorage();

  // ---------- ADD CARD ----------

  addBtn.onclick = () => {

    createRow();

    saveToStorage();
  };

  // ---------- REMOVE CARD ----------

  cardRows.onclick = (e) => {

    if (
      e.target.classList.contains("remove-btn")
    ) {

      e.target.closest(".container").remove();

      saveToStorage();
    }
  };

  // ---------- AUTH ----------

  let isSignup = false;

  signupNav.onclick = () => {

    isSignup = true;

    document.getElementById("modal-title")
      .textContent = "Sign Up";

    authModal.style.display = "flex";
  };

  loginNav.onclick = () => {

    isSignup = false;

    document.getElementById("modal-title")
      .textContent = "Login";

    authModal.style.display = "flex";
  };

  document.getElementById("auth-close")
    .onclick = () => {

      authModal.style.display = "none";
    };

  // ---------- LOGOUT ----------

  logoutNav.onclick = () => {

    currentUser = null;

    alert("Logged out!");

    logoutNav.style.display = "none";

    signupNav.style.display =
      "inline-block";

    loginNav.style.display =
      "inline-block";

    cardRows.innerHTML = "";

    createRow();
  };

  // ---------- LOGIN / SIGNUP ----------

  authSubmit.onclick = () => {

    const u =
      document.getElementById("username")
      .value
      .trim();

    const p =
      document.getElementById("password")
      .value
      .trim();

    const accs = JSON.parse(
      localStorage.getItem("gameAccounts")
      || "{}"
    );

    if (!u || !p) {

      alert("Fill all fields");

      return;
    }

    // ---------- SIGNUP ----------

    if (isSignup) {

      if (accs[u]) {

        alert("Username taken");

        return;
      }

      accs[u] = p;

      localStorage.setItem(
        "gameAccounts",
        JSON.stringify(accs)
      );

      currentUser = u;

      localStorage.setItem(
        `studyGameData_${currentUser}`,
        JSON.stringify([])
      );

      alert("Account created!");

      signupNav.style.display = "none";
      loginNav.style.display = "none";
      logoutNav.style.display =
        "inline-block";

      loadFromStorage();

    } else {

      // ---------- LOGIN ----------

      if (accs[u] === p) {

        currentUser = u;

        alert("Logged in as " + u);

        signupNav.style.display = "none";

        loginNav.style.display = "none";

        logoutNav.style.display =
          "inline-block";

        loadFromStorage();

      } else {

        alert("Invalid login");
      }
    }

    authModal.style.display = "none";

    document.getElementById("username")
      .value = "";

    document.getElementById("password")
      .value = "";
  };

  // ---------- PLAY ----------

  playBtn.onclick = () => {

    TD.length = 0;

    document.querySelectorAll(".container")
      .forEach(row => {

        const t =
          row.querySelector(".l")
          .value
          .trim();

        const d =
          row.querySelector(".r")
          .value
          .trim();

        if (t && d) {

          TD.push({
            term: t,
            definition: d
          });
        }
      });

    if (TD.length < 4) {

      alert("Need 4 filled cards!");

      return;
    }

    listContainer.style.display = "none";

    navRow.style.display = "none";

    game.style.display = "block";

    score1 = 0;
    score2 = 0;

    startRound();
  };

  // ---------- BACK ----------

  game.onclick = (e) => {

    if (
      e.target.classList.contains("back")
    ) {

      game.style.display = "none";

      listContainer.style.display = "block";

      navRow.style.display = "flex";

      score1 = 0;
      score2 = 0;

      const loggedIn =
        logoutNav.style.display ===
        "inline-block";

      signupNav.style.display =
        loggedIn
        ? "none"
        : "inline-block";

      loginNav.style.display =
        loggedIn
        ? "none"
        : "inline-block";
    }
  };

  // ---------- ROUND ----------

  function startRound() {

    locked = false;

    activePlayer = null;

    playersWhoGuessed = [];

    const item =
      TD[Math.floor(Math.random() * TD.length)];

    correctAnswer = item.definition;

    let opts = [correctAnswer];

    while (opts.length < 4) {

      const r =
        TD[Math.floor(Math.random() * TD.length)]
        .definition;

      if (!opts.includes(r)) {
        opts.push(r);
      }
    }

    opts.sort(() => Math.random() - 0.5);

    game.innerHTML = `
      <h1>${item.term}</h1>

      <div id="options"></div>

      <div class="PS">
        <h2>Player 1: ${score1}</h2>
        <h2>Player 2: ${score2}</h2>
      </div>

      <button class="back">
        Back
      </button>
    `;

    const box =
      document.getElementById("options");

    opts.forEach(o => {

      const b =
        document.createElement("button");

      b.textContent = o;

      b.classList.add("answer");

      box.appendChild(b);
    });
  }

  // ---------- KEYBOARD ----------

  document.addEventListener("keydown", (e) => {

    if (
      game.style.display === "none"
      || locked
    ) return;

    const k = e.key.toLowerCase();

    const map = {
      a: 0,
      s: 1,
      d: 2,
      f: 3,
      j: 0,
      k: 1,
      l: 2,
      ";": 3
    };

    let p =
      ["a", "s", "d", "f"].includes(k)
      ? 1
      : (
        ["j", "k", "l", ";"].includes(k)
      ? 2
      : null
      );

    if (
      !p
      || playersWhoGuessed.includes(p)
    ) return;

    if (!activePlayer) {
      activePlayer = p;
    }

    if (p !== activePlayer) return;

    const btns =
      document.querySelectorAll(".answer");

    const btn = btns[map[k]];

    if (!btn) return;

    // ---------- CORRECT ----------

    if (
      btn.textContent === correctAnswer
    ) {

      locked = true;

      btn.style.backgroundColor =
        "green";

      btn.style.color = "white";

      if (p === 1) {
        score1++;
      } else {
        score2++;
      }

      setTimeout(() => {

        alert(`Player ${p} is Correct!`);

        startRound();

      }, 500);

    } else {

      // ---------- WRONG ----------

      btn.style.backgroundColor =
        "red";

      btn.style.color = "white";

      playersWhoGuessed.push(p);

      alert(`Player ${p} is Wrong!`);

      if (
        playersWhoGuessed.length >= 2
      ) {

        setTimeout(() => {

          alert(
            `The answer is ${correctAnswer}`
          );

          startRound();

        }, 500);

      } else {

        activePlayer =
          (p === 1 ? 2 : 1);
      }
    }
  });
});
