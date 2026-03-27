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

// 🔥 WAIT PERSISTENCE DULU BARU LANJUT
auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
.then(() => {

    console.log("Persistence ready");

  // 🔥 BARU PASANG LISTENER AUTH
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

// 🔥 HANDLE REDIRECT RESULT (FIX LOGIN HP)
auth.getRedirectResult()
    .then((result) => {
    if (result.user) {
        console.log("Redirect login:", result.user.email);

        userId = result.user.uid;
        document.getElementById("userInfo").innerText = result.user.email;

        loadData();
    }
    })
    .catch((error) => {
    console.error("Redirect error:", error);
    });

// 🔥 AUTO DETECT DEVICE LOGIN
function login(){
    const provider = new firebase.auth.GoogleAuthProvider();

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if(isMobile){
    auth.signInWithRedirect(provider);
    } else {
    auth.signInWithPopup(provider);
    } 
}

// LOGOUT
function logout(){
    auth.signOut();
}

// 🔥 FIX DETECT USER (LEBIH STABIL)
auth.onAuthStateChanged(user=>{
    if(user){
    console.log("User detected:", user.email);

    userId = user.uid;
    document.getElementById("userInfo").innerText = user.email;

    // Delay kecil biar Firestore siap
    setTimeout(()=>{
        loadData();
    }, 300);

    } else {
    console.log("User belum login");

    userId = null;
    heroes = [];
    render();
    document.getElementById("userInfo").innerText = "";
    }
});

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
    if(!userId) return alert("Login dulu!");

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

// ===== REALTIME LOAD =====
function loadData(){
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

// ===== HAPUS =====
function hapus(i){
    heroes.splice(i,1);
    saveData();
    }