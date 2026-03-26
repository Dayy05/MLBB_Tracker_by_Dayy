let heroes = [];
let chart;

// HERO LIST
const heroList = [
    "Aamon", "Akai", "Aldous", "Alice", "Alpha", "Alucard", "Angela", 
    "Argus", "Arlott", "Atlas", "Aulus", "Aurora", "Badang", "Balmond",
    "Bane", "Barats", "Baxia", "Beatrix", "Belerick", "Benedetta", 
    "Brody", "Carmilla", "Cecilion", "Chang’e", "Chip", "Chou", "Cici", 
    "Clint", "Claude", "Cyclops", "Diggie", "Dyrroth", "Edith", 
    "Esmeralda", "Estes", "Eudora", "Fanny", "Faramis", "Floryn", 
    "Franco", "Fredrinn", "Freya", "Gatotkaca", "Gloo", "Gord", "Grock", 
    "Granger", "Gusion", "Guinevere", "Hanabi", "Hanzo", "Harley", 
    "Harith", "Hayabusa", "Helcurt", "Hilda", "Hylos", "Irithel", "Ixia", 
    "Jawhead", "Johnson", "Joy", "Julian", "Kadita", "Kagura", "Kaja", 
    "Kalea", "Karina", "Karrie", "Khaleed", "Khufra", "Kimmy", "Lancelot", 
    "Lapu-Lapu", "Lesley", "Leomord", "Ling", "Lolita", "Luo Yi", "Lukas", 
    "Lunox", "Lylia", "Marcel", "Martis", "Masha", "Mathilda", "Melissa", 
    "Minotaur", "Miya", "Moskov", "Nana", "Natan", "Natalia", "Nolan", 
    "Novaria", "Obsidia", "Odette", "Paquito", "Pharsa", "Phoveus", 
    "Popol and Kupa", "Rafaela", "Roger", "Ruby", "Saber", "Selena", 
    "Silvanna", "Sora", "Sun", "Suyou", "Terizla", "Thamuz", "Tigreal", 
    "Uranus", "Valentina", "Vale", "Valir", "Vexana", "Wanwan", "Xavier", 
    "X.Borg", "Yi Sun-shin", "Yin", "Yve", "Yu Zhong", "Zhask", "Zhuxin", 
    "Zilong", "Zetian"

];

// LOAD AUTOCOMPLETE
const list = document.getElementById("heroList");
heroList.forEach(h=>{
  let option=document.createElement("option");
  option.value=h;
  list.appendChild(option);
});

// TAMBAH / UPDATE
function tambahHero(){
  let hero=document.getElementById("hero").value.trim();
  let matchAwal=parseFloat(document.getElementById("matchAwal").value);
  let wrAwal=parseFloat(document.getElementById("wrAwal").value)/100;
  let wrTarget=parseFloat(document.getElementById("wrTarget").value)/100;

  if(!hero||!matchAwal||!wrAwal||!wrTarget) return;

  let existing=heroes.find(h=>h.hero.toLowerCase()===hero.toLowerCase());

  if(existing){
    existing.matchAwal=matchAwal;
    existing.wrAwal=wrAwal;
    existing.wrTarget=wrTarget;
    existing.history=[];
  } else {
    heroes.push({
      hero,matchAwal,wrAwal,wrTarget,
      win:0,lose:0,history:[]
    });
  }

  render();
}

// HITUNG
function hitung(h){
  let match=h.matchAwal+h.win+h.lose;
  let winTotal=(h.matchAwal*h.wrAwal)+h.win;
  let wr=winTotal/match;

  let sisa=Math.max(0,Math.ceil(
    (h.wrTarget*match-winTotal)/(1-h.wrTarget)
  ));

  return {match,wr,sisa};
}

// HISTORY
function generateHistory(h){
  let history=[];
  let winBase=h.matchAwal*h.wrAwal;
  let matchBase=h.matchAwal;

  for(let i=1;i<=h.win+h.lose;i++){
    if(i<=h.win) winBase++;
    matchBase++;
    history.push((winBase/matchBase*100).toFixed(1));
  }
  return history;
}

// ANIMASI
function animateClick(el){
  el.style.transform="scale(0.9)";
  setTimeout(()=>{el.style.transform="scale(1)"},150);
}

// RENDER
function render(){
  let tbody=document.getElementById("tableBody");
  tbody.innerHTML="";

  heroes.forEach((h,i)=>{
    let r=hitung(h);

    tbody.innerHTML+=`
    <tr>
      <td onclick="animateClick(this);showDetail(${i})">${h.hero}</td>
      <td>${r.match}</td>
      <td>${(r.wr*100).toFixed(1)}%</td>
      <td>${(h.wrTarget*100)}%</td>
      <td><input class="table-input" type="number" value="${h.win}" onchange="updateWin(${i},this.value)"></td>
      <td><input class="table-input" type="number" value="${h.lose}" onchange="updateLose(${i},this.value)"></td>
      <td>${r.sisa}</td>
      <td><button class="delete" onclick="hapus(${i})">X</button></td>
    </tr>`;
  });
}

// UPDATE
function updateWin(i,val){heroes[i].win=parseInt(val)||0;render();}
function updateLose(i,val){heroes[i].lose=parseInt(val)||0;render();}
function hapus(i){heroes.splice(i,1);render();}

// GRAFIK DETAIL
function showDetail(i){
  let h=heroes[i];
  let history=generateHistory(h);

  if(chart) chart.destroy();

  chart=new Chart(document.getElementById("chart"),{
    type:"line",
    data:{
      labels:history.map((_,i)=>"Match "+(i+1)),
      datasets:[{
        label:h.hero+" WR History",
        data:history,
        tension:0.3
      }]
    },
    options:{
      responsive:true,
      plugins:{legend:{labels:{color:"white"}}},
      scales:{
        x:{ticks:{color:"white"}},
        y:{ticks:{color:"white"}}
      }
    }
  });
}