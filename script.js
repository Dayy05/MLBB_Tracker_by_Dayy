let heroes = JSON.parse(localStorage.getItem("heroes")) || [];
let chart;
let selectedHeroIndex = null;

// 🔥 TOUCH DRAG
let touchDragIndex = null;

// 🔥 NOTIF
function showNotif(text, type="success"){
    const notif = document.getElementById("notif");
    notif.innerText = text;
    notif.className = "notif show " + type;

    setTimeout(()=>{
        notif.classList.remove("show");
    }, 2000);
}

// HERO LIST (AMAN)
const heroListData = [("Aamon"), ("Akai"), ("Aldous"), ("Alice"), ("Alpha"), ("Alucard"), ("Angela"), ("Argus"), ("Arlott"), ("Atlas"), ("Aulus"), ("Aurora"),
("Badang"), ("Balmond"), ("Bane"), ("Barats"), ("Baxia"), ("Beatrix"), ("Belerick"), ("Benedetta"), ("Brody"), ("Bruno"),
("Carmilla"), ("Cecilion"), ("Chang'e"), ("Chip"), ("Chou"), ("Cici"), ("Clint"), ("Claude"), ("Cyclops"),
("Diggie"), ("Dyrroth"),
("Edith"), ("Esmeralda"), ("Estes"), ("Eudora"),
("Fanny"), ("Faramis"), ("Floryn"), ("Franco"), ("Fredrinn"), ("Freya"),
("Gatotkaca"), ("Gloo"), ("Gord"), ("Grock"), ("Granger"), ("Gusion"), ("Guinevere"),
("Hanabi"), ("Hanzo"), ("Harley"), ("Harith"), ("Hayabusa"), ("Helcurt"), ("Hilda"), ("Hylos"),
("Irithel"), ("Ixia"),
("Jawhead"), ("Johnson"), ("Joy"), ("Julian"),
("Kadita"), ("Kagura"), ("Kaja"), ("Kalea"), ("Karina"), ("Karrie"), ("Khaleed"), ("Khufra"), ("Kimmy"),
("Lancelot"), ("Lapu-Lapu"), ("Layla"), ("Lesley"), ("Leomord"), ("Ling"), ("Lolita"), ("Luo Yi"), ("Lukas"), ("Lunox"), ("Lylia"),
("Marcel"), ("Martis"), ("Masha"), ("Mathilda"), ("Melissa"), ("Minotaur"), ("Miya"), ("Moskov"),
("Nana"), ("Natan"), ("Natalia"), ("Nolan"), ("Novaria"),
("Obsidia"), ("Odette"),
("Paquito"), ("Pharsa"), ("Phoveus"), ("Popol & Kupa"),
("Rafaela"), ("Roger"), ("Ruby"),
("Saber"), ("Selena"), ("Silvanna"), ("Sora"), ("Sun"), ("Suyou"),
("Terizla"), ("Thamuz"), ("Tigreal"),
("Uranus"),
("Valentina"), ("Vale"), ("Valir"), ("Vexana"),
("Wanwan"),
("Xavier"), ("X.Borg"),
("Yi Sun-shin"), ("Yin"), ("Yve"), ("Yu Zhong"),
("Zetian"), ("Zhask"), ("Zhuxin"), ("Zilong")];

window.onload = () => {
    const list = document.getElementById("heroList");
    heroListData.forEach(h=>{
        let opt = document.createElement("option");
        opt.value = h;
        list.appendChild(opt);
    });

    render();
};

// HITUNG
function hitung(h){
    let match = h.matchAwal + h.win + h.lose;
    let winTotal = (h.matchAwal * h.wrAwal) + h.win;
    let wr = match === 0 ? 0 : winTotal / match;

    let sisa = 0;
    if(h.wrTarget > wr){
        sisa = Math.ceil((h.wrTarget * match - winTotal) / (1 - h.wrTarget));
    }

    return {match, wr, sisa};
}

// TAMBAH HERO
function tambahHero(){
    let heroName = hero.value.trim();
    if(!heroName) return;

    let newData = {
        hero: heroName,
        matchAwal: +matchAwal.value,
        wrAwal: +wrAwal.value / 100,
        wrTarget: +wrTarget.value / 100,
        win: 0,
        lose: 0,
        history: []
    };

    let index = heroes.findIndex(h => h.hero.toLowerCase() === heroName.toLowerCase());

    if(index !== -1){
        heroes[index] = newData;
        showNotif("Data berhasil di update!", "update");
    } else {
        heroes.push(newData);
        showNotif("Hero berhasil ditambahkan!");
    }

    saveData();

    hero.value = "";
    matchAwal.value = "";
    wrAwal.value = "";
    wrTarget.value = "";
}

// REBUILD HISTORY
function rebuildHistory(i){
    let h = heroes[i];
    h.history = [];

    for(let x=0; x<h.win; x++) h.history.push("W");
    for(let x=0; x<h.lose; x++) h.history.push("L");
}

// UPDATE WIN
function updateWin(i,val){
    heroes[i].win = parseInt(val) || 0;
    rebuildHistory(i);
    saveData();

    if(selectedHeroIndex === i){
        renderChart(i); // 🔥 realtime langsung
    }
}

// UPDATE LOSE
function updateLose(i,val){
    heroes[i].lose = parseInt(val) || 0;
    rebuildHistory(i);
    saveData();

    if(selectedHeroIndex === i){
        renderChart(i); // 🔥 realtime langsung
    }
}

// SAVE
function saveData(){
    localStorage.setItem("heroes", JSON.stringify(heroes));

    let prevHero = selectedHeroIndex !== null ? heroes[selectedHeroIndex]?.hero : null;

    render();

    // 🔥 BALIKIN INDEX SETELAH REORDER
    if(prevHero){
        let newIndex = heroes.findIndex(h => h.hero === prevHero);
        selectedHeroIndex = newIndex;
    }
}

// GRAPH
function generateWRHistory(h){
    let data = [];
    let win = h.matchAwal * h.wrAwal;
    let match = h.matchAwal;

    if(match > 0) data.push((win/match)*100);

    h.history.forEach(r=>{
        match++;
        if(r === "W") win++;
        data.push((win/match)*100);
    });

    return data;
}

function renderChart(index){
    if(!heroes[index]) return;

    selectedHeroIndex = index;

    let data = generateWRHistory(heroes[index]);

    if(!chart){
        chart = new Chart(document.getElementById("chartWR"), {
            type: "line",
            data: {
                labels: data.map((_,i)=>i),
                datasets: [{
                    label: "WR (%)",
                    data: data,
                    borderWidth: 3,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    } else {
        chart.data.labels = data.map((_,i)=>i);
        chart.data.datasets[0].data = data;
        chart.update();
    }
}

// DRAG PC
let dragIndex = null;

function handleDragStart(){
    dragIndex = +this.dataset.index;
}

function handleDragOver(e){
    e.preventDefault();
}

function handleDrop(){
    let dropIndex = +this.dataset.index;

    if(dragIndex === dropIndex) return;

    let moved = heroes.splice(dragIndex,1)[0];
    heroes.splice(dropIndex,0,moved);

    saveData();
}

// TOUCH
function handleTouchStart(){
    touchDragIndex = +this.dataset.index;
}

function handleTouchMove(e){
    e.preventDefault();

    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    if(!el) return;

    const row = el.closest("tr");
    if(!row) return;

    let targetIndex = +row.dataset.index;

    if(targetIndex !== touchDragIndex){
        let moved = heroes.splice(touchDragIndex,1)[0];
        heroes.splice(targetIndex,0,moved);

        touchDragIndex = targetIndex;
        render();
    }
}

function handleTouchEnd(){
    saveData();
}

// RENDER
function render(){
    let tbody = document.getElementById("tableBody");
    tbody.innerHTML = "";

    heroes.forEach((h,i)=>{
        let r = hitung(h);

        let row = document.createElement("tr");
        row.setAttribute("draggable", true);
        row.dataset.index = i;

        row.innerHTML = `
        <td class="hero-name" onclick="renderChart(${i})">${h.hero}</td>
        <td>${r.match}</td>
        <td>${(r.wr*100).toFixed(1)}%</td>
        <td>${(h.wrTarget*100)}%</td>
        <td><input type="number" value="${h.win}" onchange="updateWin(${i},this.value)"></td>
        <td><input type="number" value="${h.lose}" onchange="updateLose(${i},this.value)"></td>
        <td>${r.sisa}</td>
        <td><button onclick="hapus(${i})">X</button></td>
        `;

        // PC
        row.addEventListener("dragstart", handleDragStart);
        row.addEventListener("dragover", handleDragOver);
        row.addEventListener("drop", handleDrop);

        // HP
        row.addEventListener("touchstart", handleTouchStart);
        row.addEventListener("touchmove", handleTouchMove);
        row.addEventListener("touchend", handleTouchEnd);

        tbody.appendChild(row);
    });
}

// DELETE
function hapus(i){
    heroes.splice(i,1);
    saveData();

    if(selectedHeroIndex === i){
        chart?.destroy();
        chart = null;
        selectedHeroIndex = null;
    }
}