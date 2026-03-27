    // ================= FIREBASE CONFIG =================
    const firebaseConfig = {
    apiKey: "AIzaSyCB4_G4di66IvL_2wcR6krQbP9vseutXuo",
    authDomain: "mlbb-wr-tracker-by-dayy.firebaseapp.com",
    projectId: "mlbb-wr-tracker-by-dayy",
    storageBucket: "mlbb-wr-tracker-by-dayy.firebasestorage.app",
    messagingSenderId: "570200071305",
    appId: "1:570200071305:web:47b0c9fd12780cfff33a58"
    };

    firebase.initializeApp(firebaseConfig);

    const auth = firebase.auth();
    const db = firebase.firestore();

    // ================= STATE =================
    let heroes = [];
    let userId = null;
    let authReady = false; // 🔥 kunci utama fix delay

    // ================= LIST HERO =================
    const heroListData = [
    "Aamon","Akai","Aldous","Alice","Alpha","Alucard","Angela","Argus","Arlott","Atlas","Aulus","Aurora","Badang","Balmond","Bane","Barats","Baxia","Beatrix","Belerick","Benedetta","Brody","Carmilla","Cecilion","Chang’e","Chip","Chou","Cici","Clint","Claude","Cyclops","Diggie","Dyrroth","Edith","Esmeralda","Estes","Eudora","Fanny","Faramis","Floryn","Franco","Fredrinn","Freya","Gatotkaca","Gloo","Gord","Grock","Granger","Gusion","Guinevere","Hanabi","Hanzo","Harley","Harith","Hayabusa","Helcurt","Hilda","Hylos","Irithel","Ixia","Jawhead","Johnson","Joy","Julian","Kadita","Kagura","Kaja","Kalea","Karina","Karrie","Khaleed","Khufra","Kimmy","Lancelot","Lapu-Lapu","Lesley","Leomord","Ling","Lolita","Luo Yi","Lukas","Lunox","Lylia","Marcel","Martis","Masha","Mathilda","Melissa","Minotaur","Miya","Moskov","Nana","Natan","Natalia","Nolan","Novaria","Obsidia","Odette","Paquito","Pharsa","Phoveus","Popol and Kupa","Rafaela","Roger","Ruby","Saber","Selena","Silvanna","Sora","Sun","Suyou","Terizla","Thamuz","Tigreal","Uranus","Valentina","Vale","Valir","Vexana","Wanwan","Xavier","X.Borg","Yi Sun-shin","Yin","Yve","Yu Zhong","Zhask","Zhuxin","Zilong","Zetian"
    ];

    // ================= INIT HERO LIST =================
    window.addEventListener("DOMContentLoaded", () => {
    const list = document.getElementById("heroList");
    if(list){
        list.innerHTML = "";
        heroListData.forEach(h=>{
        const opt = document.createElement("option");
        opt.value = h;
        list.appendChild(opt);
        });
    }
    });

    // ================= AUTH FIX TOTAL =================
    auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .then(async () => {

    // 🔥 handle redirect (HP)
    try {
        await auth.getRedirectResult();
    } catch (e) {
        console.error(e);
    }

    // 🔥 tunggu auth siap
    auth.onAuthStateChanged(user => {
        authReady = true;

        if(user){
        userId = user.uid;
        document.getElementById("userInfo").innerText = user.email;
        loadData();
        } else {
        userId = null;
        heroes = [];
        render();
        document.getElementById("userInfo").innerText = "";
        }
    });

    });

    // ================= LOGIN =================
    function login(){
    const provider = new firebase.auth.GoogleAuthProvider();
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if(isMobile){
        auth.signInWithRedirect(provider);
    } else {
        auth.signInWithPopup(provider);
    }
    }

    // ================= LOGOUT =================
    function logout(){
    auth.signOut();
    }

    // ================= HITUNG =================
    function hitung(h){
    let match = h.matchAwal + h.win + h.lose;
    let winTotal = (h.matchAwal * h.wrAwal) + h.win;
    let wr = match === 0 ? 0 : winTotal / match;

    let sisa = 0;
    if(h.wrTarget > wr){
        sisa = Math.ceil(
        (h.wrTarget * match - winTotal) / (1 - h.wrTarget)
        );
    }

    return {match, wr, sisa};
    }

    // ================= TAMBAH HERO =================
    function tambahHero(){

    // 🔥 LOCK TOTAL (NO BUG)
    if(!authReady){
        alert("Tunggu sistem siap...");
        return;
    }

    if(!auth.currentUser){
        alert("Silakan login dulu");
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

    // ================= SAVE =================
    function saveData(){
    if(!userId) return;

    db.collection("users").doc(userId).set({
        heroes: heroes
    });
    }

    // ================= LOAD =================
    function loadData(){
    if(!userId) return;

    db.collection("users")
        .doc(userId)
        .onSnapshot(doc=>{
        if(doc.exists){
            heroes = doc.data().heroes || [];
            render();
        }
        });
    }

    // ================= RENDER =================
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

    // ================= UPDATE =================
    function updateWin(i,val){
    heroes[i].win = parseInt(val) || 0;
    saveData();
    }

    function updateLose(i,val){
    heroes[i].lose = parseInt(val) || 0;
    saveData();
    }

    // ================= DELETE =================
    function hapus(i){
    heroes.splice(i,1);
    saveData();
}