// ---------- HABIT GRID ----------
function createHabit(name="New Habit"){
    const habitDiv = document.createElement("div");
    habitDiv.className = "card habit";

    habitDiv.innerHTML = `
        <h2>${name}</h2>
        <div class="grid"></div>
    `;

    const grid = habitDiv.querySelector(".grid");

    for(let i=0;i<28;i++){
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.onclick = () => {
            cell.classList.toggle("active");

            if (cell.classList.contains("active")) {
                cell.textContent = "✓";
            } else {
                cell.textContent = "";
            }
        };
        grid.appendChild(cell);
    }

    document.getElementById("habitContainer")?.appendChild(habitDiv);
}

function addHabit(){
    const name = prompt("Habit name?");
    if(name) createHabit(name);
}

// ---------- QUICK CHECK ----------
function createItem(name){
    const div = document.createElement("div");
    div.className = "item";

    div.onclick = () => div.classList.toggle("done");

    div.innerHTML = `
        <div class="name">${name}</div>
        <div class="checkbox"></div>
    `;

    document.getElementById("list")?.appendChild(div);
}

function addItem(){
    const name = prompt("New habit?");
    if(name) createItem(name);
}

// ---------- DEFAULT LOAD ----------
window.onload = () => {
    if(document.getElementById("habitContainer")){
        createHabit("Drink water");
        createHabit("Exercise");
    }

    if(document.getElementById("list")){
        createItem("Drink water");
        createItem("Stretch");
        createItem("Read 10 pages");
    }
};

function goProfile() {
    window.location.href = "profile.html";
}