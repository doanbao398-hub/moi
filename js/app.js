// js/app.js
import {
  db,
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
} from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
  const bgMusic = new Audio("../hinh/nhac.mp3");
  bgMusic.loop = true;
  const clickSound = new Audio("../hinh/cute.mp3");

  document.addEventListener("click", () => {
    clickSound.currentTime = 0;
    clickSound.play().catch((e) => console.log("Trình duyệt chặn click sound"));
  });

  let currentUser = JSON.parse(localStorage.getItem("birthday_user")) || null;

  const deviceSelectionOverlay = document.getElementById(
    "deviceSelectionOverlay",
  );
  const btnPC = document.getElementById("btnPC");
  const btnMobile = document.getElementById("btnMobile");
  const loginOverlay = document.getElementById("loginOverlay");

  const mainNav = document.getElementById("mainNav");
  const inputWrapper = document.getElementById("inputWrapper");
  const treeZone = document.getElementById("treeZone");

  const usernameInput = document.getElementById("usernameInput");
  const displayUserName = document.getElementById("displayUserName");
  const userAvatar = document.getElementById("userAvatar");
  const logoutBtn = document.getElementById("logoutBtn");

  const hostLetterOverlay = document.getElementById("hostLetterOverlay");
  const envClosed = document.getElementById("envClosed");
  const envOpened = document.getElementById("envOpened");
  const letterFull = document.getElementById("letterFull");
  const closeHostLetter = document.getElementById("closeHostLetter");

  if (!currentUser) {
    deviceSelectionOverlay.classList.add("active");
    loginOverlay.classList.remove("active");
  } else {
    const savedMode = localStorage.getItem("ui_mode");
    if (savedMode === "mobile") document.body.classList.add("mobile-mode");
    initApp();
  }

  btnPC.addEventListener("click", () => {
    document.body.classList.remove("mobile-mode");
    localStorage.setItem("ui_mode", "pc");
    deviceSelectionOverlay.classList.remove("active");
    loginOverlay.classList.add("active");
  });

  btnMobile.addEventListener("click", () => {
    document.body.classList.add("mobile-mode");
    localStorage.setItem("ui_mode", "mobile");
    deviceSelectionOverlay.classList.remove("active");
    loginOverlay.classList.add("active");
  });

  document.getElementById("joinBtn").addEventListener("click", () => {
    const name = usernameInput.value.trim();
    if (!name) return alert("Nhập tên để quẩy nào!");
    handleLogin(name, "guest");
  });

  document.getElementById("hostBtn").addEventListener("click", () => {
    handleLogin("Chị Ngọc Anh", "host");
  });

  async function handleLogin(name, role) {
    const uid = "user_" + Date.now().toString(36);
    currentUser = { uid, username: name, role: role };
    localStorage.setItem("birthday_user", JSON.stringify(currentUser));

    await setDoc(doc(db, "users", uid), {
      uid,
      username: name,
      role: role,
      spinsLeft: 2,
      createdAt: serverTimestamp(),
    });

    bgMusic.volume = 0;
    bgMusic
      .play()
      .then(() => {
        let currentVolume = 0;
        const fadeInterval = setInterval(() => {
          if (currentVolume < 1) {
            currentVolume += 0.05;
            bgMusic.volume = Math.min(currentVolume, 1);
          } else {
            clearInterval(fadeInterval);
          }
        }, 200);
      })
      .catch((e) => console.log("Cần tương tác để phát nhạc"));

    startFireworks();
    loginOverlay.classList.remove("active");

    if (role === "host") {
      showHostSequence();
    } else {
      initApp();
    }
  }

  function showHostSequence() {
    hostLetterOverlay.classList.add("active");

    envClosed.addEventListener(
      "click",
      () => {
        envClosed.style.display = "none";
        envOpened.style.display = "block";

        setTimeout(() => {
          envOpened.style.display = "none";
          letterFull.style.display = "block";
          letterFull.classList.add("fly-out-anim");
          closeHostLetter.style.display = "block";
        }, 1500);
      },
      { once: true },
    );

    closeHostLetter.addEventListener("click", () => {
      hostLetterOverlay.classList.remove("active");
      initApp();
    });
  }

  function initApp() {
    mainNav.style.display = "flex";
    inputWrapper.style.display = "flex";
    displayUserName.innerText = currentUser.username;

    if (currentUser.role === "host") {
      userAvatar.src = "../hinh/ca.jpg";
    } else {
      userAvatar.src = "../hinh/thư.png";
    }
    loadUserData();
    loadInventory();
  }

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("birthday_user");
    localStorage.removeItem("ui_mode");
    location.reload();
  });

  const wishInput = document.getElementById("wishInput");
  let particleInterval;

  wishInput.addEventListener("focus", () => {
    particleInterval = setInterval(createParticle, 300);
  });
  wishInput.addEventListener("blur", () => clearInterval(particleInterval));

  function createParticle() {
    const shapes = ["🍀", "⭐", "💖"];
    const p = document.createElement("div");
    p.innerText = shapes[Math.floor(Math.random() * shapes.length)];
    p.className = "particle-falling";
    p.style.left = Math.random() * 95 + "vw";
    p.style.fontSize = Math.random() * 15 + 15 + "px";
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 3000);
  }

  function startFireworks() {
    const canvas = document.getElementById("fireworksCanvas");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];
    let colors = ["#ff6b81", "#ff4757", "#ffa502", "#2ed573", "#1e90ff"];

    for (let i = 0; i < 100; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.5) * 20,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
        size: Math.random() * 4 + 2,
      });
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2;
        p.life -= 0.02;
        if (p.life <= 0) particles.splice(index, 1);
        else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.life;
          ctx.fill();
        }
      });
      if (particles.length > 0) requestAnimationFrame(animate);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    animate();
  }

  const navHome = document.getElementById("navHome");
  const navGacha = document.getElementById("navGacha");
  const gachaOverlay = document.getElementById("gachaOverlay");
  const closeGachaBtn = document.getElementById("closeGachaBtn");
  const spinBtn = document.getElementById("spinBtn");
  const wheel = document.getElementById("gachaWheel");
  const spinCountSpan = document.getElementById("spinCount");

  navHome.addEventListener("click", () => {
    gachaOverlay.classList.remove("active");
    navHome.classList.add("active");
    navGacha.classList.remove("active");
  });

  navGacha.addEventListener("click", () => {
    loadUserData();
    gachaOverlay.classList.add("active");
    navGacha.classList.add("active");
    navHome.classList.remove("active");
  });
  closeGachaBtn.addEventListener("click", () => navHome.click());

  let isSpinning = false,
    currentRotation = 0;
  async function loadUserData() {
    if (!currentUser) return;
    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
    if (userDoc.exists())
      spinCountSpan.innerText = userDoc.data().spinsLeft || 0;
  }

  spinBtn.addEventListener("click", async () => {
    if (isSpinning) return;
    const userRef = doc(db, "users", currentUser.uid);
    const userDoc = await getDoc(userRef);
    let spins = userDoc.data().spinsLeft || 0;
    if (spins <= 0) return alert("Bạn đã hết lượt quay rồi nha! 🥲");

    isSpinning = true;
    await updateDoc(userRef, { spinsLeft: spins - 1 });
    spinCountSpan.innerText = spins - 1;

    const wonPetId = Math.floor(Math.random() * 4) + 1;
    const baseAngles = { 1: 315, 2: 225, 3: 135, 4: 45 };
    currentRotation += 5 * 360 + baseAngles[wonPetId];
    wheel.style.transform = `rotate(${currentRotation}deg)`;

    setTimeout(async () => {
      const q = query(
        collection(db, "user_inventories"),
        where("userId", "==", currentUser.uid),
        where("itemId", "==", wonPetId.toString()),
      );
      const snap = await getDocs(q);
      if (snap.empty) {
        await addDoc(collection(db, "user_inventories"), {
          userId: currentUser.uid,
          itemId: wonPetId.toString(),
          unlockedAt: serverTimestamp(),
        });
      }
      document.getElementById("wonPetImg").src = `../hinh/${wonPetId}.png`;
      document.getElementById("congratsOverlay").classList.add("active");
      loadInventory();
      isSpinning = false;
    }, 4000);
  });

  document
    .getElementById("claimPetBtn")
    .addEventListener("click", () =>
      document.getElementById("congratsOverlay").classList.remove("active"),
    );

  async function loadInventory() {
    if (!currentUser) return;
    const q = query(
      collection(db, "user_inventories"),
      where("userId", "==", currentUser.uid),
    );
    const querySnapshot = await getDocs(q);
    const petSelect = document.getElementById("petSelect");
    petSelect.innerHTML =
      '<option value="">-- Không mang Pet hãy gacha để có --</option>';
    querySnapshot.forEach((docSnap) => {
      const item = docSnap.data();
      const option = document.createElement("option");
      option.value = item.itemId;
      option.text = `Pet Số ${item.itemId}`;
      petSelect.appendChild(option);
    });
  }

  const wishesCol = collection(db, "wishes");
  onSnapshot(wishesCol, (snapshot) => {
    treeZone.innerHTML = "";
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const letterDiv = document.createElement("div");
      letterDiv.className = "hanging-letter";

      let posX = data.position.x;
      let posY = data.position.y;

      // KHỐNG CHẾ TỌA ĐỘ KHI DÙNG MOBILE
      // Giúp thư không lọt ra ngoài vùng mép màn hình
      if (document.body.classList.contains("mobile-mode")) {
        posX = Math.max(10, Math.min(posX, 75)); // Chỉ cho phép chiều ngang từ 10% đến 75%
        posY = Math.max(10, Math.min(posY, 75)); // Chỉ cho phép chiều dọc từ 10% đến 75%
      }

      letterDiv.style.left = posX + "%";
      letterDiv.style.top = posY + "%";

      let innerHTML = `<div class="tag">${data.senderName}</div><img src="../hinh/thư.png" class="letter-img" />`;
      if (data.petId) {
        innerHTML += `<img src="../hinh/${data.petId}.png" class="anchored-pet" />`;
        if (data.petName)
          innerHTML += `<div class="pet-name-label">${data.petName}</div>`;
      }
      letterDiv.innerHTML = innerHTML;
      letterDiv.addEventListener("click", () =>
        openDiaryModal(docSnap.id, data),
      );
      treeZone.appendChild(letterDiv);
    });
  });

  document.getElementById("sendBtn").addEventListener("click", async () => {
    const text = wishInput.value.trim();
    if (!text) return alert("Ghi lời chúc đi nè! 💕");

    // Tự tính khoảng giới hạn sinh thư ngẫu nhiên an toàn hơn cho Mobile
    const isMobile = document.body.classList.contains("mobile-mode");
    const safeX = isMobile
      ? Math.floor(Math.random() * 60) + 15
      : Math.floor(Math.random() * 70) + 10;
    const safeY = isMobile
      ? Math.floor(Math.random() * 50) + 15
      : Math.floor(Math.random() * 45) + 10;

    const newWish = {
      senderId: currentUser.uid,
      senderName: currentUser.username,
      content: text,
      position: { x: safeX, y: safeY },
      petId: document.getElementById("petSelect").value || null,
      petName: document.getElementById("petNameInput").value.trim() || null,
      createdAt: serverTimestamp(),
    };
    await addDoc(wishesCol, newWish);
    wishInput.value = "";
    document.getElementById("petNameInput").value = "";
    document.getElementById("petSelect").value = "";
  });

  const letterModal = document.getElementById("letterModal");
  let currentWishId = null;
  function openDiaryModal(wishId, data) {
    currentWishId = wishId;
    document.getElementById("modalSenderName").innerText =
      `💌 ${data.senderName}`;
    document.getElementById("modalContentText").innerText = data.content;
    document.getElementById("editWishInput").value = data.content;

    const petIcon = document.getElementById("modalPetIcon");
    if (data.petId) {
      petIcon.src = `../hinh/${data.petId}.png`;
      petIcon.style.display = "block";
    } else petIcon.style.display = "none";

    document.getElementById("modalContentText").style.display = "block";
    document.getElementById("editWishInput").style.display = "none";
    document.getElementById("saveBtn").style.display = "none";

    if (currentUser && currentUser.uid === data.senderId) {
      document.getElementById("modalActions").style.display = "flex";
      document.getElementById("editBtn").style.display = "inline-block";
    } else document.getElementById("modalActions").style.display = "none";
    letterModal.classList.add("active");
  }

  document
    .getElementById("closeModal")
    .addEventListener("click", () => letterModal.classList.remove("active"));
  document.getElementById("editBtn").addEventListener("click", () => {
    document.getElementById("modalContentText").style.display = "none";
    document.getElementById("editWishInput").style.display = "block";
    document.getElementById("editBtn").style.display = "none";
    document.getElementById("saveBtn").style.display = "inline-block";
  });
  document.getElementById("saveBtn").addEventListener("click", async () => {
    const newContent = document.getElementById("editWishInput").value.trim();
    if (newContent)
      await updateDoc(doc(db, "wishes", currentWishId), {
        content: newContent,
      });
    letterModal.classList.remove("active");
  });
  document.getElementById("deleteBtn").addEventListener("click", async () => {
    if (confirm("Thu hồi trang nhật ký này chứ? 🥺")) {
      await deleteDoc(doc(db, "wishes", currentWishId));
      letterModal.classList.remove("active");
    }
  });
});
