let heroes = JSON.parse(localStorage.getItem("heroes")) || [];
let chart;
let selectedHeroIndex = null;

// HERO LIST
const heroListData = ["Aamon","Akai","Aldous","Alice","Alpha","Alucard","Angela","Argus","Arlott","Atlas","Aulus","Aurora","Badang","Balmond","Bane","Barats","Baxia","Beatrix","Belerick","Benedetta","Brody","Carmilla","Cecilion","Chang’e","Chip","Chou","Cici","Clint","Claude","Cyclops","Diggie","Dyrroth","Edith","Esmeralda","Estes","Eudora","Fanny","Faramis","Floryn","Franco","Fredrinn","Freya","Gatotkaca","Gloo","Gord","Grock","Granger","Gusion","Guinevere","Hanabi","Hanzo","Harley","Harith","Hayabusa","Helcurt","Hilda","Hylos","Irithel","Ixia","Jawhead","Johnson","Joy","Julian","Kadita","Kagura","Kaja","Kalea","Karina","Karrie","Khaleed","Khufra","Kimmy","Lancelot","Lapu-Lapu","Lesley","Leomord","Ling","Lolita","Luo Yi","Lukas","Lunox","Lylia","Marcel","Martis","Masha","Mathilda","Melissa","Minotaur","Miya","Moskov","Nana","Natan","Natalia","Nolan","Novaria","Obsidia","Odette","Paquito","Pharsa","Phoveus","Popol and Kupa","Rafaela","Roger","Ruby","Saber","Selena","Silvanna","Sora","Sun","Suyou","Terizla","Thamuz","Tigreal","Uranus","Valentina","Vale","Valir","Vexana","Wanwan","Xavier","X.Borg","Yi Sun-shin","Yin","Yve","Yu Zhong","Zhask","Zhuxin","Zilong","Zetian"];

window.onload = () => {
    const list = document.getElementById("heroList");
    heroListData.forEach(h=>{
        let opt = document.createElement("option");
        opt.value = h;
        list.appendChild(opt);
    });

    render();
    setDeviceClass();
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
    let h = {
        hero: hero.value,
        matchAwal: +matchAwal.value,
        wrAwal: +wrAwal.value / 100,
        wrTarget: +wrTarget.value / 100,
        win: 0,
        lose: 0,
        history: []
    };

    heroes.push(h);
    saveData();
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

    if(selectedHeroIndex !== null){
        renderChart(selectedHeroIndex);
    }
}

// UPDATE LOSE
function updateLose(i,val){
    heroes[i].lose = parseInt(val) || 0;
    rebuildHistory(i);
    saveData();

    if(selectedHeroIndex !== null){
        renderChart(selectedHeroIndex);
    }
}

// SAVE
function saveData(){
    localStorage.setItem("heroes", JSON.stringify(heroes));
    render();
}

// GENERATE DATA
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

// RENDER CHART
function renderChart(index){
    if(!heroes[index]) return;

    selectedHeroIndex = index;

    let data = generateWRHistory(heroes[index]);

    if(chart) chart.destroy();

    chart = new Chart(document.getElementById("chartWR"), {
        type: "line",
        data: {
            labels: data.map((_,i)=>i),
            datasets: [{
                label: "WR (%)",
                data: data,
                borderWidth: 3,
                tension: 0.3,
                segment: {
                    borderColor: ctx => {
                        let i = ctx.p0DataIndex;
                        let current = data[i];
                        let next = data[i+1];

                        if(next === undefined) return "#22c55e";
                        return next >= current ? "#22c55e" : "#ef4444";
                    }
                }
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 300 },
            plugins: {
                legend: { labels: { color: "white" } }
            },
            scales: {
                x: { ticks: { color: "white" } },
                y: { ticks: { color: "white" } }
            }
        }
    });
}

// RENDER TABLE
function render(){
    let tbody = document.getElementById("tableBody");
    tbody.innerHTML = "";

    heroes.forEach((h,i)=>{
        let r = hitung(h);

        tbody.innerHTML += `
        <tr>
        <td class="hero-name" onclick="renderChart(${i})">${h.hero}</td>
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

// DELETE
function hapus(i){
    heroes.splice(i,1);
    saveData();
}

// 🔥 AUTO DEVICE DETECT
function setDeviceClass(){
    const width = window.innerWidth;
    const app = document.getElementById("app");

    app.classList.remove("mobile","tablet","desktop");

    if(width <= 600){
        app.classList.add("mobile");
    } else if(width <= 1023){
        app.classList.add("tablet");
    } else {
        app.classList.add("desktop");
    }
}

window.addEventListener("resize", setDeviceClass);
