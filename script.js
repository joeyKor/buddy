// ==========================================================
// BUDDYBUDDY VERSION 7.0 - FIREBASE REAL-TIME NOTE MESSENGER
// ==========================================================

// Helper to sanitize ID for Firebase Realtime Database path keys
function toSafeKey(id) {
  return String(id || "").trim().replace(/[.#$\[\]\/]/g, "_");
}

function formatTime(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${mm}/${dd} ${hh}:${min}`;
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements - Window & Login
  const buddyWindow = document.getElementById("buddyWindow");
  const titleBar = document.getElementById("titleBar");
  const minBtn = document.getElementById("minBtn");
  const closeBtn = document.getElementById("closeBtn");
  const openFirebaseCfgBtn = document.getElementById("openFirebaseCfgBtn");

  const userIdInput = document.getElementById("userId");
  const userPwInput = document.getElementById("userPw");
  const comboToggle = document.getElementById("comboToggle");
  const idDropdown = document.getElementById("idDropdown");
  const loginForm = document.getElementById("loginForm");
  const loginBtn = document.getElementById("loginBtn");

  const chkStealth = document.getElementById("chkStealth");
  const chkAutoLogin = document.getElementById("chkAutoLogin");
  const chkSavePw = document.getElementById("chkSavePw");

  const findAccountLink = document.getElementById("findAccountLink");
  const freeSignupLink = document.getElementById("freeSignupLink");
  const buddyEmblem = document.getElementById("buddyEmblem");

  // DOM Elements - Messenger View
  const loginView = document.getElementById("loginView");
  const messengerView = document.getElementById("messengerView");
  const displayMyId = document.getElementById("displayMyId");
  const displayStatusMode = document.getElementById("displayStatusMode");
  const myStatusDot = document.getElementById("myStatusDot");
  const fbConnBadge = document.getElementById("fbConnBadge");
  const logoutBtn = document.getElementById("logoutBtn");
  const footerStatusText = document.getElementById("footerStatusText");

  const openComposeBtn = document.getElementById("openComposeBtn");
  const refreshBuddiesBtn = document.getElementById("refreshBuddiesBtn");

  const tabNotesBtn = document.getElementById("tabNotesBtn");
  const tabSentBtn = document.getElementById("tabSentBtn");
  const tabBuddiesBtn = document.getElementById("tabBuddiesBtn");

  const paneNotes = document.getElementById("paneNotes");
  const paneSent = document.getElementById("paneSent");
  const paneBuddies = document.getElementById("paneBuddies");

  const unreadBadge = document.getElementById("unreadBadge");
  const buddyCountSpan = document.getElementById("buddyCountSpan");
  const receivedNotesList = document.getElementById("receivedNotesList");
  const sentNotesList = document.getElementById("sentNotesList");
  const buddyListContainer = document.getElementById("buddyListContainer");

  // DOM Elements - Modals
  const modalBackdrop = document.getElementById("modalBackdrop");
  const modalTitle = document.getElementById("modalTitle");
  const modalMessage = document.getElementById("modalMessage");
  const modalOkBtn = document.getElementById("modalOkBtn");
  const modalCloseX = document.getElementById("modalCloseX");

  const composeModalBackdrop = document.getElementById("composeModalBackdrop");
  const noteRecipientId = document.getElementById("noteRecipientId");
  const noteContentInput = document.getElementById("noteContentInput");
  const sendNoteSubmitBtn = document.getElementById("sendNoteSubmitBtn");
  const composeCancelBtn = document.getElementById("composeCancelBtn");
  const composeCloseX = document.getElementById("composeCloseX");

  const readNoteModalBackdrop = document.getElementById("readNoteModalBackdrop");
  const readSenderSpan = document.getElementById("readSenderSpan");
  const readTimeSpan = document.getElementById("readTimeSpan");
  const readContentBox = document.getElementById("readContentBox");
  const replyNoteBtn = document.getElementById("replyNoteBtn");
  const deleteNoteBtn = document.getElementById("deleteNoteBtn");
  const readCloseBtn = document.getElementById("readCloseBtn");
  const readCloseX = document.getElementById("readCloseX");

  const fbConfigModalBackdrop = document.getElementById("fbConfigModalBackdrop");
  const fbDbUrlInput = document.getElementById("fbDbUrlInput");
  const fbJsonInput = document.getElementById("fbJsonInput");
  const saveFbConfigBtn = document.getElementById("saveFbConfigBtn");
  const fbConfigCancelBtn = document.getElementById("fbConfigCancelBtn");
  const fbConfigCloseX = document.getElementById("fbConfigCloseX");

  // State
  let currentUserId = null;
  let db = null;
  let isFirebaseConnected = false;
  let activeListeners = [];
  let currentReadingNote = null;
  let lastKnownNoteCount = null;
  let lastOnlineCount = null;

  // Local sync channel across tabs
  let localBus = null;
  try {
    localBus = new BroadcastChannel("buddybuddy_v7_realtime_bus");
  } catch (e) {}

  // ----------------------------------------------------------
  // 1. Retro Web Audio Sound Effects
  // ----------------------------------------------------------
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  let audioCtx = null;

  function playRetroSound(type) {
    try {
      if (!audioCtx) audioCtx = new AudioCtx();
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }
      const now = audioCtx.currentTime;

      if (type === "click") {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(950, now);
        osc.frequency.exponentialRampToValueAtTime(520, now + 0.045);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.045);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === "login") {
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.085);
          gain.gain.setValueAtTime(0.11, now + idx * 0.085);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.085 + 0.28);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now + idx * 0.085);
          osc.stop(now + idx * 0.085 + 0.3);
        });
      } else if (type === "buddy_online") {
        // Classic pleasant ding when a friend signs in
        const notes = [784, 1046.5];
        notes.forEach((freq, idx) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.1, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.002, now + idx * 0.08 + 0.22);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.24);
        });
      } else if (type === "note") {
        const notes = [880, 1174.66, 880, 1174.66];
        notes.forEach((freq, idx) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.09);
          gain.gain.setValueAtTime(0.12, now + idx * 0.09);
          gain.gain.exponentialRampToValueAtTime(0.002, now + idx * 0.09 + 0.18);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now + idx * 0.09);
          osc.stop(now + idx * 0.09 + 0.2);
        });
      } else if (type === "alert") {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(660, now);
        osc.frequency.setValueAtTime(880, now + 0.07);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.22);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.23);
      }
    } catch (e) {}
  }

  // ----------------------------------------------------------
  // 2. Custom Retro Modal Dialog
  // ----------------------------------------------------------
  function showModal(title, message) {
    playRetroSound("alert");
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modalBackdrop.classList.add("show");
    modalOkBtn.focus();
  }

  function closeModal() {
    playRetroSound("click");
    modalBackdrop.classList.remove("show");
  }

  modalOkBtn.addEventListener("click", closeModal);
  modalCloseX.addEventListener("click", closeModal);

  // ----------------------------------------------------------
  // 3. Firebase Initialization & Config Management
  // ----------------------------------------------------------
  function getEffectiveFirebaseConfig() {
    const savedRaw = localStorage.getItem("buddy7_firebase_config");
    if (savedRaw) {
      try {
        const parsed = JSON.parse(savedRaw);
        if (parsed && parsed.databaseURL) {
          parsed.databaseURL = parsed.databaseURL.trim().replace(/\/+$/, "");
          return parsed;
        }
      } catch (e) {}
    }

    const defaultConfig = window.DEFAULT_FIREBASE_CONFIG;
    if (defaultConfig && defaultConfig.databaseURL) {
      const cfg = { ...defaultConfig };
      cfg.databaseURL = cfg.databaseURL.trim().replace(/\/+$/, "");
      return cfg;
    }
    return null;
  }

  function initFirebaseConnection() {
    const cfg = getEffectiveFirebaseConfig();
    if (!cfg || !cfg.databaseURL) {
      isFirebaseConnected = false;
      db = null;
      if (fbConnBadge) {
        fbConnBadge.textContent = "⚡ 로컬실시간 (FB설정클릭)";
        fbConnBadge.classList.remove("online");
      }
      return false;
    }

    if (typeof firebase === "undefined") {
      console.warn("Firebase SDK not loaded yet. Running in offline/local mode.");
      isFirebaseConnected = false;
      db = null;
      if (fbConnBadge) {
        fbConnBadge.textContent = "⚡ 오프라인실시간";
        fbConnBadge.classList.remove("online");
      }
      return false;
    }

    try {
      if (firebase.apps && firebase.apps.length > 0) {
        const existingApp = firebase.app();
        if (existingApp.options.databaseURL !== cfg.databaseURL) {
          existingApp.delete();
          firebase.initializeApp(cfg);
        }
      } else {
        firebase.initializeApp(cfg);
      }

      db = firebase.database();
      isFirebaseConnected = true;
      if (fbConnBadge) {
        fbConnBadge.textContent = "🔥 Firebase 연동됨";
        fbConnBadge.classList.add("online");
      }
      footerStatusText.textContent = "Firebase 실시간 서버 연결됨";
      return true;
    } catch (err) {
      console.error("Firebase init error:", err);
      isFirebaseConnected = false;
      db = null;
      if (fbConnBadge) {
        fbConnBadge.textContent = "⚠ FB설정확인";
        fbConnBadge.classList.remove("online");
      }
      return false;
    }
  }

  function openFirebaseModal() {
    playRetroSound("click");
    const cfg = getEffectiveFirebaseConfig();
    fbDbUrlInput.value = cfg?.databaseURL || "";
    fbJsonInput.value = cfg ? JSON.stringify(cfg, null, 2) : "";
    fbConfigModalBackdrop.classList.add("show");
  }

  openFirebaseCfgBtn.addEventListener("click", openFirebaseModal);
  if (fbConnBadge) fbConnBadge.addEventListener("click", openFirebaseModal);
  fbConfigCloseX.addEventListener("click", () => fbConfigModalBackdrop.classList.remove("show"));
  fbConfigCancelBtn.addEventListener("click", () => fbConfigModalBackdrop.classList.remove("show"));

  saveFbConfigBtn.addEventListener("click", () => {
    playRetroSound("click");
    let newConfig = {};
    const jsonRaw = fbJsonInput.value.trim();
    const urlRaw = fbDbUrlInput.value.trim();

    if (jsonRaw) {
      try {
        const normalized = jsonRaw
          .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '"$2":')
          .replace(/'/g, '"');
        newConfig = JSON.parse(normalized);
      } catch (e) {
        if (!urlRaw) {
          showModal("설정 오류", "올바른 JSON 형식이 아니거나 DB URL이 비어 있습니다.");
          return;
        }
      }
    }

    if (urlRaw) {
      newConfig.databaseURL = urlRaw.trim().replace(/\/+$/, "");
    }

    if (!newConfig.databaseURL) {
      localStorage.removeItem("buddy7_firebase_config");
      initFirebaseConnection();
      fbConfigModalBackdrop.classList.remove("show");
      showModal("알림", "Firebase 설정이 초기화되었습니다.");
      return;
    }

    if (!newConfig.projectId) {
      const match = newConfig.databaseURL.match(/https:\/\/([^.]+)/);
      newConfig.projectId = match ? match[1] : "buddybuddy";
    }

    localStorage.setItem("buddy7_firebase_config", JSON.stringify(newConfig));
    const ok = initFirebaseConnection();
    fbConfigModalBackdrop.classList.remove("show");

    if (ok) {
      if (currentUserId) subscribeUserStreams(currentUserId);
      showModal("Firebase 연결 완료", `Realtime Database와 연결되었습니다!\n(${newConfig.databaseURL})`);
    } else {
      showModal("연결 실패", "입력하신 Firebase 설정으로 초기화하지 못했습니다.");
    }
  });

  initFirebaseConnection();

  // ----------------------------------------------------------
  // 4. Login History & Uniform Password ("1234")
  // ----------------------------------------------------------
  userPwInput.value = "1234";

  function getLoginHistory() {
    try {
      return JSON.parse(localStorage.getItem("buddy7_id_history") || "[]");
    } catch {
      return [];
    }
  }

  function saveIdToHistory(userId) {
    const list = getLoginHistory().filter((id) => id !== userId);
    list.unshift(userId);
    localStorage.setItem("buddy7_id_history", JSON.stringify(list.slice(0, 6)));
    renderIdDropdown();
  }

  function renderIdDropdown() {
    const list = getLoginHistory();
    idDropdown.innerHTML = "";
    if (list.length === 0) {
      const li = document.createElement("li");
      li.className = "empty-item";
      li.textContent = "최근 접속한 ID 없음";
      idDropdown.appendChild(li);
      return;
    }
    list.forEach((id) => {
      const li = document.createElement("li");
      li.textContent = id;
      li.addEventListener("click", () => {
        playRetroSound("click");
        userIdInput.value = id;
        userPwInput.value = "1234";
        idDropdown.classList.remove("open");
      });
      idDropdown.appendChild(li);
    });
  }

  renderIdDropdown();

  const savedPrefs = JSON.parse(localStorage.getItem("buddy7_prefs_v2") || "{}");
  if (savedPrefs.lastUserId) {
    userIdInput.value = savedPrefs.lastUserId;
  }

  comboToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    playRetroSound("click");
    renderIdDropdown();
    idDropdown.classList.toggle("open");
  });

  document.addEventListener("click", () => {
    idDropdown.classList.remove("open");
  });

  // ----------------------------------------------------------
  // 5. Login / Logout Handlers with Presence Setup
  // ----------------------------------------------------------
  function handleLogin() {
    const idVal = userIdInput.value.trim();
    const pwVal = userPwInput.value.trim();

    if (!idVal) {
      showModal("버디버디 알림", "이용자 ID를 입력해 주세요.");
      userIdInput.focus();
      return;
    }

    if (pwVal !== "1234") {
      showModal("비밀번호 확인", '비밀번호는 일괄적으로 "1234" 입니다.');
      userPwInput.value = "1234";
      userPwInput.focus();
      return;
    }

    currentUserId = idVal;
    saveIdToHistory(idVal);
    localStorage.setItem(
      "buddy7_prefs_v2",
      JSON.stringify({
        lastUserId: idVal,
        stealth: chkStealth.checked
      })
    );

    playRetroSound("login");

    displayMyId.textContent = currentUserId;
    if (chkStealth.checked) {
      displayStatusMode.textContent = "(친구 몰래 입장)";
      myStatusDot.classList.add("stealth");
    } else {
      displayStatusMode.textContent = "(온라인)";
      myStatusDot.classList.remove("stealth");
    }

    loginView.classList.remove("active");
    messengerView.classList.add("active");

    switchTab("buddies");

    lastKnownNoteCount = null;
    lastOnlineCount = null;
    subscribeUserStreams(currentUserId);
  }

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleLogin();
  });

  loginBtn.addEventListener("click", (e) => {
    e.preventDefault();
    handleLogin();
  });

  function performLogout() {
    playRetroSound("click");

    // Mark offline in Firebase Presence
    if (isFirebaseConnected && db && currentUserId) {
      const safeUserKey = toSafeKey(currentUserId);
      db.ref(`buddy_v7/presence/${safeUserKey}`).set({
        userId: currentUserId,
        online: false,
        stealth: false,
        lastSeen: firebase.database.ServerValue.TIMESTAMP
      });
    }

    // Mark offline in local presence
    updateLocalPresence(currentUserId, false);

    unsubscribeAllStreams();
    currentUserId = null;
    userPwInput.value = "1234";
    messengerView.classList.remove("active");
    loginView.classList.add("active");
  }

  logoutBtn.addEventListener("click", performLogout);

  // Set offline on page unload/close
  window.addEventListener("beforeunload", () => {
    if (currentUserId) {
      if (isFirebaseConnected && db) {
        const safeUserKey = toSafeKey(currentUserId);
        db.ref(`buddy_v7/presence/${safeUserKey}`).set({
          userId: currentUserId,
          online: false,
          stealth: false,
          lastSeen: Date.now()
        });
      }
      updateLocalPresence(currentUserId, false);
    }
  });

  // ----------------------------------------------------------
  // 6. Real-Time Presence & Note Streams
  // ----------------------------------------------------------
  function unsubscribeAllStreams() {
    activeListeners.forEach((item) => {
      try {
        if (typeof item === "function") {
          item();
        } else if (item && item.ref && item.callback) {
          item.ref.off("value", item.callback);
        }
      } catch (e) {}
    });
    activeListeners = [];
  }

  function subscribeUserStreams(userId) {
    unsubscribeAllStreams();
    const safeUserKey = toSafeKey(userId);

    if (!isFirebaseConnected) {
      initFirebaseConnection();
    }

    if (isFirebaseConnected && db) {
      try {
        // --- 1. Realtime Presence Setup with onDisconnect ---
        const userPresenceRef = db.ref(`buddy_v7/presence/${safeUserKey}`);
        const connectedRef = db.ref(".info/connected");

        const myPresenceData = {
          userId: userId,
          online: !chkStealth.checked,
          stealth: chkStealth.checked,
          lastSeen: firebase.database.ServerValue.TIMESTAMP
        };

        // Write presence immediately on login
        userPresenceRef.set(myPresenceData);

        const presenceConnCallback = (snap) => {
          if (snap.val() === true) {
            // When client disconnects unexpectedly (close window / disconnect):
            userPresenceRef.onDisconnect().set({
              userId: userId,
              online: false,
              stealth: false,
              lastSeen: firebase.database.ServerValue.TIMESTAMP
            });

            // Re-confirm online
            userPresenceRef.set(myPresenceData);
          }
        };
        connectedRef.on("value", presenceConnCallback);
        activeListeners.push({ ref: connectedRef, callback: presenceConnCallback });

        // --- 2. Listen to All Users' Presence for Buddy List ---
        const allPresenceRef = db.ref("buddy_v7/presence");
        const allPresenceCallback = (snapshot) => {
          const data = snapshot.val() || {};
          renderPresenceBuddies(data);
        };
        allPresenceRef.on("value", allPresenceCallback);
        activeListeners.push({ ref: allPresenceRef, callback: allPresenceCallback });

        // --- 3. Listen to Received Notes ---
        const inboxRef = db.ref(`buddy_v7/inbox/${safeUserKey}`);
        const inboxCallback = (snapshot) => {
          const data = snapshot.val() || {};
          const notes = Object.entries(data)
            .map(([key, val]) => ({ id: key, ...val }))
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

          if (lastKnownNoteCount !== null && notes.length > lastKnownNoteCount) {
            playRetroSound("note");
          }
          lastKnownNoteCount = notes.length;

          renderReceivedNotes(notes);
        };
        inboxRef.on("value", inboxCallback);
        activeListeners.push({ ref: inboxRef, callback: inboxCallback });

        // --- 4. Listen to Sent Notes ---
        const sentRef = db.ref(`buddy_v7/sent/${safeUserKey}`);
        const sentCallback = (snapshot) => {
          const data = snapshot.val() || {};
          const notes = Object.entries(data)
            .map(([key, val]) => ({ id: key, ...val }))
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          renderSentNotes(notes);
        };
        sentRef.on("value", sentCallback);
        activeListeners.push({ ref: sentRef, callback: sentCallback });

        return;
      } catch (err) {
        console.error("Firebase subscription error:", err);
      }
    }

    // Local Presence & Storage Fallback
    updateLocalPresence(userId, !chkStealth.checked);
    refreshLocalViews();
  }

  // ----------------------------------------------------------
  // 7. Local Real-Time Storage & Presence Fallback (Multi-Tab)
  // ----------------------------------------------------------
  function getLocalStore() {
    try {
      return JSON.parse(
        localStorage.getItem("buddy7_realtime_db") ||
          '{"inbox":{},"sent":{},"presence":{}}'
      );
    } catch {
      return { inbox: {}, sent: {}, presence: {} };
    }
  }

  function saveLocalStore(store) {
    localStorage.setItem("buddy7_realtime_db", JSON.stringify(store));
  }

  function updateLocalPresence(userId, online) {
    if (!userId) return;
    const store = getLocalStore();
    if (!store.presence) store.presence = {};
    store.presence[toSafeKey(userId)] = {
      userId: userId,
      online: online,
      stealth: chkStealth.checked,
      lastSeen: Date.now()
    };
    saveLocalStore(store);

    if (localBus) {
      localBus.postMessage({
        type: online ? "PRESENCE_ONLINE" : "PRESENCE_OFFLINE",
        userId: userId
      });
    }
  }

  function refreshLocalViews() {
    if (!currentUserId || isFirebaseConnected) return;
    const key = toSafeKey(currentUserId);
    const store = getLocalStore();

    const inboxMap = store.inbox[key] || {};
    const received = Object.entries(inboxMap)
      .map(([id, val]) => ({ id, ...val }))
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    const sentMap = store.sent[key] || {};
    const sent = Object.entries(sentMap)
      .map(([id, val]) => ({ id, ...val }))
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    renderReceivedNotes(received);
    renderSentNotes(sent);
    renderPresenceBuddies(store.presence || {});
  }

  if (localBus) {
    localBus.addEventListener("message", (event) => {
      const msg = event.data;
      if (!msg) return;

      if (msg.type === "NEW_NOTE" && currentUserId && toSafeKey(msg.to) === toSafeKey(currentUserId)) {
        playRetroSound("note");
      }

      if (!isFirebaseConnected) {
        refreshLocalViews();
      }
    });
  }

  window.addEventListener("storage", (e) => {
    if (e.key === "buddy7_realtime_db" && currentUserId && !isFirebaseConnected) {
      refreshLocalViews();
    }
  });

  // ----------------------------------------------------------
  // 8. Dynamic Buddy List: Showing Online & Offline Users
  // ----------------------------------------------------------
  function renderPresenceBuddies(presenceData) {
    const allUsers = Object.values(presenceData || {}).filter(
      (item) => item && item.userId
    );

    // Group 1: Currently Online users
    const onlineUsers = allUsers.filter((u) => u.online === true);
    onlineUsers.sort((a, b) => {
      if (a.userId === currentUserId) return -1;
      if (b.userId === currentUserId) return 1;
      return a.userId.localeCompare(b.userId);
    });

    // Group 2: Offline users
    const offlineUsers = allUsers.filter((u) => !u.online && !u.stealth);
    offlineUsers.sort((a, b) => (b.lastSeen || 0) - (a.lastSeen || 0));

    // Sound chime if new user signed in
    if (lastOnlineCount !== null && onlineUsers.length > lastOnlineCount) {
      playRetroSound("buddy_online");
    }
    lastOnlineCount = onlineUsers.length;

    // Update Counter in Tab
    buddyCountSpan.textContent = `${onlineUsers.length}명 접속`;

    buddyListContainer.innerHTML = "";

    // 1) Online Group
    const onlineHeader = document.createElement("div");
    onlineHeader.className = "buddy-group-header";
    onlineHeader.innerHTML = `<span>▼ 접속중인 버디 (${onlineUsers.length}명)</span>`;
    buddyListContainer.appendChild(onlineHeader);

    const onlineItemsContainer = document.createElement("div");

    if (onlineUsers.length === 0) {
      const emptyItem = document.createElement("div");
      emptyItem.className = "buddy-item offline";
      emptyItem.innerHTML = `<span style="color:#888; font-size:11px; padding:4px 0;">현재 접속중인 버디가 없습니다.</span>`;
      onlineItemsContainer.appendChild(emptyItem);
    } else {
      onlineUsers.forEach((user) => {
        const isMe = user.userId === currentUserId;
        const item = document.createElement("div");
        item.className = `buddy-item online ${isMe ? "me" : ""}`;
        item.innerHTML = `
          <span class="shoe-bullet">👟</span>
          <span class="buddy-name">${escapeHtml(user.userId)}</span>
          ${isMe ? '<span class="badge-me">나</span>' : ""}
          <span class="buddy-state">[접속중]</span>
          <div class="buddy-actions">
            ${
              isMe
                ? ""
                : '<button type="button" class="tiny-btn send-btn">쪽지</button>'
            }
          </div>
        `;

        if (!isMe) {
          item.querySelector(".send-btn")?.addEventListener("click", (e) => {
            e.stopPropagation();
            openComposeModal(user.userId);
          });
          item.addEventListener("dblclick", () => openComposeModal(user.userId));
        }

        onlineItemsContainer.appendChild(item);
      });
    }

    buddyListContainer.appendChild(onlineItemsContainer);

    // Toggle Fold
    onlineHeader.addEventListener("click", () => {
      onlineItemsContainer.style.display =
        onlineItemsContainer.style.display === "none" ? "block" : "none";
    });

    // 2) Offline Group
    if (offlineUsers.length > 0) {
      const offlineHeader = document.createElement("div");
      offlineHeader.className = "buddy-group-header";
      offlineHeader.innerHTML = `<span>▼ 오프라인 버디 (${offlineUsers.length}명)</span>`;
      buddyListContainer.appendChild(offlineHeader);

      const offlineItemsContainer = document.createElement("div");

      offlineUsers.forEach((user) => {
        const item = document.createElement("div");
        item.className = "buddy-item offline";
        const timeText = user.lastSeen ? formatTime(user.lastSeen) : "";
        item.innerHTML = `
          <span class="shoe-bullet offline">👟</span>
          <span class="buddy-name">${escapeHtml(user.userId)}</span>
          <span class="buddy-state">[오프라인] ${timeText}</span>
          <div class="buddy-actions">
            <button type="button" class="tiny-btn send-btn">쪽지</button>
          </div>
        `;
        item.querySelector(".send-btn")?.addEventListener("click", (e) => {
          e.stopPropagation();
          openComposeModal(user.userId);
        });
        item.addEventListener("dblclick", () => openComposeModal(user.userId));
        offlineItemsContainer.appendChild(item);
      });

      buddyListContainer.appendChild(offlineItemsContainer);

      offlineHeader.addEventListener("click", () => {
        offlineItemsContainer.style.display =
          offlineItemsContainer.style.display === "none" ? "block" : "none";
      });
    }
  }

  // Refresh Buddies Button
  refreshBuddiesBtn.addEventListener("click", () => {
    playRetroSound("click");
    footerStatusText.textContent = "접속자 목록을 갱신했습니다.";
    if (isFirebaseConnected && db) {
      db.ref("buddy_v7/presence").once("value", (snapshot) => {
        renderPresenceBuddies(snapshot.val() || {});
      });
    } else {
      refreshLocalViews();
    }
  });

  // ----------------------------------------------------------
  // 9. Rendering Received & Sent Notes
  // ----------------------------------------------------------
  function renderReceivedNotes(notes) {
    const unreadCount = notes.filter((n) => !n.read).length;
    unreadBadge.textContent = unreadCount;

    if (notes.length === 0) {
      receivedNotesList.innerHTML = `<div class="empty-state">도착한 쪽지가 없습니다.<br/>버디목록에서 접속중인 친구를 눌러<br/><b>[쪽지]</b>를 보내보세요!</div>`;
      return;
    }

    receivedNotesList.innerHTML = "";
    notes.forEach((note) => {
      const card = document.createElement("div");
      card.className = `note-card ${note.read ? "" : "unread"}`;
      card.innerHTML = `
        <div class="note-card-header">
          <span>${note.read ? "📩" : "📨 [새쪽지]"} 보낸이: <strong>${escapeHtml(note.from)}</strong></span>
          <span class="note-card-time">${formatTime(note.timestamp)}</span>
        </div>
        <div class="note-card-preview">${escapeHtml(note.content)}</div>
      `;
      card.addEventListener("click", () => openReadNoteModal(note, "inbox"));
      receivedNotesList.appendChild(card);
    });
  }

  function renderSentNotes(notes) {
    if (notes.length === 0) {
      sentNotesList.innerHTML = `<div class="empty-state">보낸 쪽지가 없습니다.</div>`;
      return;
    }

    sentNotesList.innerHTML = "";
    notes.forEach((note) => {
      const card = document.createElement("div");
      card.className = "note-card";
      card.innerHTML = `
        <div class="note-card-header">
          <span>📤 받는이: <strong>${escapeHtml(note.to)}</strong></span>
          <span class="note-card-time">${formatTime(note.timestamp)}</span>
        </div>
        <div class="note-card-preview">${escapeHtml(note.content)}</div>
      `;
      card.addEventListener("click", () => openReadNoteModal(note, "sent"));
      sentNotesList.appendChild(card);
    });
  }

  // ----------------------------------------------------------
  // 10. Sending, Reading, Replying & Deleting Notes
  // ----------------------------------------------------------
  function openComposeModal(prefillRecipient = "") {
    playRetroSound("click");
    noteRecipientId.value = prefillRecipient;
    noteContentInput.value = "";
    composeModalBackdrop.classList.add("show");
    if (prefillRecipient) {
      noteContentInput.focus();
    } else {
      noteRecipientId.focus();
    }
  }

  function closeComposeModal() {
    playRetroSound("click");
    composeModalBackdrop.classList.remove("show");
  }

  openComposeBtn.addEventListener("click", () => openComposeModal(""));
  composeCancelBtn.addEventListener("click", closeComposeModal);
  composeCloseX.addEventListener("click", closeComposeModal);

  sendNoteSubmitBtn.addEventListener("click", async () => {
    const toId = noteRecipientId.value.trim();
    const content = noteContentInput.value.trim();

    if (!toId) {
      showModal("버디버디 알림", "받는사람 이용자 ID를 입력해 주세요.");
      return;
    }
    if (!content) {
      showModal("버디버디 알림", "쪽지 내용을 입력해 주세요.");
      return;
    }

    const notePayload = {
      from: currentUserId,
      to: toId,
      content: content,
      timestamp: Date.now(),
      read: false
    };

    const senderKey = toSafeKey(currentUserId);
    const recipientKey = toSafeKey(toId);

    try {
      if (isFirebaseConnected && db) {
        await db.ref(`buddy_v7/inbox/${recipientKey}`).push(notePayload);
        await db.ref(`buddy_v7/sent/${senderKey}`).push(notePayload);
      } else {
        const store = getLocalStore();
        const noteId = "note_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);

        if (!store.inbox[recipientKey]) store.inbox[recipientKey] = {};
        store.inbox[recipientKey][noteId] = notePayload;

        if (!store.sent[senderKey]) store.sent[senderKey] = {};
        store.sent[senderKey][noteId] = notePayload;

        saveLocalStore(store);
        if (localBus) {
          localBus.postMessage({ type: "NEW_NOTE", to: toId, from: currentUserId });
        }
        refreshLocalViews();
      }

      closeComposeModal();
      showModal("전송 완료", `[${toId}] 님에게 쪽지를 보냈습니다! 💌`);
    } catch (err) {
      console.error("Failed to send note:", err);
      showModal("전송 실패", "쪽지 전송 중 오류가 발생했습니다.\nFirebase 데이터베이스 규칙을 확인해 주세요.");
    }
  });

  function openReadNoteModal(note, boxType) {
    playRetroSound("click");
    currentReadingNote = { ...note, boxType };

    readSenderSpan.textContent = boxType === "inbox" ? note.from : `나 → ${note.to}`;
    readTimeSpan.textContent = formatTime(note.timestamp);
    readContentBox.textContent = note.content;
    replyNoteBtn.style.display = boxType === "inbox" ? "inline-block" : "none";

    readNoteModalBackdrop.classList.add("show");

    // Mark as read
    if (boxType === "inbox" && !note.read && currentUserId) {
      const myKey = toSafeKey(currentUserId);
      if (isFirebaseConnected && db) {
        db.ref(`buddy_v7/inbox/${myKey}/${note.id}`).update({ read: true });
      } else {
        const store = getLocalStore();
        if (store.inbox[myKey] && store.inbox[myKey][note.id]) {
          store.inbox[myKey][note.id].read = true;
          saveLocalStore(store);
          refreshLocalViews();
        }
      }
    }
  }

  readCloseBtn.addEventListener("click", () => readNoteModalBackdrop.classList.remove("show"));
  readCloseX.addEventListener("click", () => readNoteModalBackdrop.classList.remove("show"));

  replyNoteBtn.addEventListener("click", () => {
    if (!currentReadingNote) return;
    const replyTo = currentReadingNote.from;
    readNoteModalBackdrop.classList.remove("show");
    openComposeModal(replyTo);
  });

  deleteNoteBtn.addEventListener("click", () => {
    if (!currentReadingNote || !currentUserId) return;
    const myKey = toSafeKey(currentUserId);
    const { id, boxType } = currentReadingNote;

    if (isFirebaseConnected && db) {
      db.ref(`buddy_v7/${boxType}/${myKey}/${id}`).remove();
    } else {
      const store = getLocalStore();
      if (store[boxType] && store[boxType][myKey]) {
        delete store[boxType][myKey][id];
        saveLocalStore(store);
        refreshLocalViews();
      }
    }

    readNoteModalBackdrop.classList.remove("show");
  });

  // ----------------------------------------------------------
  // 11. Tabs & Window Dragging
  // ----------------------------------------------------------
  function switchTab(tabName) {
    playRetroSound("click");
    tabBuddiesBtn.classList.toggle("active", tabName === "buddies");
    tabNotesBtn.classList.toggle("active", tabName === "notes");
    tabSentBtn.classList.toggle("active", tabName === "sent");

    paneBuddies.classList.toggle("active", tabName === "buddies");
    paneNotes.classList.toggle("active", tabName === "notes");
    paneSent.classList.toggle("active", tabName === "sent");
  }

  tabBuddiesBtn.addEventListener("click", () => switchTab("buddies"));
  tabNotesBtn.addEventListener("click", () => switchTab("notes"));
  tabSentBtn.addEventListener("click", () => switchTab("sent"));

  // Draggable Window
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let offsetX = 0;
  let offsetY = 0;

  titleBar.addEventListener("mousedown", (e) => {
    if (e.target.closest(".win-btn")) return;
    isDragging = true;
    startX = e.clientX - offsetX;
    startY = e.clientY - offsetY;
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    offsetX = e.clientX - startX;
    offsetY = e.clientY - startY;
    buddyWindow.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

  minBtn.addEventListener("click", () => {
    playRetroSound("click");
    buddyWindow.classList.add("minimized");
    setTimeout(() => {
      buddyWindow.classList.remove("minimized");
      buddyWindow.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    }, 900);
  });

  closeBtn.addEventListener("click", () => {
    showModal("버디버디 종료", "버디버디 메신저 7.0을\n종료하시겠습니까?");
  });

  buddyEmblem.addEventListener("click", () => {
    showModal(
      "BUDDYBUDDY VERSION 7.0",
      '원하는 이용자 ID를 입력하고\n비밀번호 "1234"로 바로 접속하여\n실시간 쪽지를 주고받아 보세요!'
    );
  });

  findAccountLink.addEventListener("click", (e) => {
    e.preventDefault();
    showModal(
      "아이디 / 비밀번호 안내",
      '별도 가입 없이 원하시는 이용자 ID로 접속 가능하며,\n비밀번호는 일괄적으로 "1234" 입니다.'
    );
  });

  freeSignupLink.addEventListener("click", (e) => {
    e.preventDefault();
    showModal(
      "버디버디 접속 안내",
      '검증 없이 원하는 이용자 ID를 입력하고\n비밀번호 "1234"로 즉시 로그인하실 수 있습니다!'
    );
  });
});
