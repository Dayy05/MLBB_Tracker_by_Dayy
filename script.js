// FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyCB4_G4di66IvL_2wcR6krQbP9vseutXuo",
  authDomain: "mlbb-wr-tracker-by-dayy.firebaseapp.com",
  projectId: "mlbb-wr-tracker-by-dayy",
  storageBucket: "mlbb-wr-tracker-by-dayy.firebasestorage.app",
  messagingSenderId: "570200071305",
  appId: "1:570200071305:web:47b0c9fd12780cfff33a58"
};

// INIT
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

console.log("App started");

// ===== DATA =====
let heroes = [];
let userId = null;

// ===== LIST HERO MLBB =====
const heroListData = [
"Aamon", "Akai", "Aldous", "Alice", "Alpha", "Alucard", "Angela", "Argus", "Arlott", "Atlas", "Aulus", "Aurora", "Badang", "Balmond", "Bane", "Barats", "Baxia", "Beatrix", "Belerick", "Benedetta", "Brody", "Carmilla", "Cecilion", "Chang’e", "Chip", "Chou", "Cici", "Clint", "Claude", "Cyclops", "Diggie", "Dyrroth", "Edith", "Esmeralda", "Estes", "Eudora", "Fanny", "Faramis", "Floryn", "Franco", "Fredrinn", "Freya", "Gatotkaca", "Gloo", "Gord", "Grock", "Granger", "Gusion", "Guinevere", "Hanabi", "Hanzo", "Harley", "Harith", "Hayabusa", "Helcurt", "Hilda", "Hylos", "Irithel", "Ixia", "Jawhead", "Johnson", "Joy", "Julian", "Kadita", "Kagura", "Kaja", "Kalea", "Karina", "Karrie", "Khaleed", "Khufra", "Kimmy", "Lancelot", "Lapu-Lapu", "Lesley", "Leomord", "Ling", "Lolita", "Luo Yi", "Lukas", "Lunox", "Lylia", "Marcel", "Martis", "Masha", "Mathilda", "Melissa", "Minotaur", "Miya", "Moskov", "Nana", "Natan", "Natalia", "Nolan", "Novaria", "Obsidia", "Odette", "Paquito", "Pharsa", "Phoveus", "Popol and Kupa", "Rafaela", "Roger", "Ruby", "Saber", "Selena", "Silvanna", "Sora", "Sun", "Suyou", "Terizla", "Thamuz", "Tigreal", "Uranus", "Valentina", "Vale", "Valir", "Vexana", "Wanwan", "Xavier", "X.Borg", "Yi Sun-shin", "Yin", "Yve", "Yu Zhong", "Zhask", "Zhuxin", "Zilong", "Zetian"

];

// 🔥 LOAD HERO KE DATALIST
window.addEventListener("DOMContentLoaded", () => {
  const heroList = document.getElementById("heroList");

  if(heroList){
    heroList.innerHTML = "";
    heroListData.forEach(hero=>{
      const option = document.createElement("option");
      option.value = hero;
      heroList.appendChild(option);
    });
  }
});

// ===== AUTH FIX =====
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
.then(() => {

  console.log("Persistence ready");

  // HANDLE REDIRECT
  auth.getRedirectResult()
    .then((result) => {
      if (result.user) {
        console.log("Redirect login:", result.user.email);
      }
    })
    .catch((error) => {
      console.error("Redirect error:", error);
    });

  // AUTH STATE
  auth.onAuthStateChanged(user=>{
    if(user){
      console.log("User detected:", user.email);

      userId = user.uid;
      document.getElementById("userInfo").innerText = user.email;

      loadData();

    } else {
      console.log("Belum login");

      userId = null;
      heroes = [];
      render();
      document.getElementById("userInfo").innerText = "";
    }
  });

});

// ===== LOGIN =====
function login(){
  const provider = new firebase.auth.GoogleAuthProvider();
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  if(isMobile){
    auth.signInWithRedirect(provider);
  } else {
    auth.signInWithPopup(provider);
  }
}

// ===== LOGOUT =====
function logout(){
  auth.signOut();
}

// ===== HITUNG =====
function hitung(h){
  let match = h.matchAwal + h.win + h.lose;
  let winTotal = (h.matchAwal * h.wrAwal) + h.win;
  let wr = winTotal / match;

  let sisa = Math.max(0, Math.ceil(
    (h.wrTarget * match - winTotal) / (1 - h.wrTarget)
  ));

  return {match, wr, sisa};
}

// ===== TAMBAH HERO =====
function tambahHero(){

  if(!auth.currentUser){
    alert("Tunggu login selesai...");
    return;
  }

  userId = auth.currentUser.uid;

  let h = {
    hero: hero.value,
    matchAwal: +matchAwal.value,
    wrAwal: +wrAwal.value / 100,
    wrTarget: +wrTarget.value / 100,
    win: 0,
    lose: 0
  };

  heroes.push(h);
  saveData();
}

// ===== SAVE =====
function saveData(){
  if(!userId) return;

  db.collection("users").doc(userId).set({
    heroes: heroes
  });
}

// ===== LOAD =====
function loadData(){
  if(!userId) return;

  db.collection("users")
    .doc(userId)
    .onSnapshot(doc=>{
      if(doc.exists){
        heroes = doc.data().heroes;
        render();
      }
    });
}

// ===== RENDER =====
function render(){
  let tbody = document.getElementById("tableBody");
  tbody.innerHTML = "";

  heroes.forEach((h,i)=>{
    let r = hitung(h);

    tbody.innerHTML += `
    <tr>
      <td>${h.hero}</td>
      <td>${r.match}</td>
      <td>${(r.wr*100).toFixed(1)}%</td>
      <td>${(h.wrTarget*100)}%</td>
      <td><input type="number" value="${h.win}" onchange="updateWin(${i},this.value)"></td>
      <td><input type="number" value="${h.lose}" onchange="updateLose(${i},this.value)"></td>
      <td>${r.sisa}</td>
      <td><button onclick="hapus(${i})">X</button></td>
    </tr>`;
  });
}

// ===== UPDATE =====
function updateWin(i,val){
  heroes[i].win = parseInt(val) || 0;
  saveData();
}

function updateLose(i,val){
  heroes[i].lose = parseInt(val) || 0;
  saveData();
}

// ===== DELETE =====
function hapus(i){
  heroes.splice(i,1);
  saveData();
}