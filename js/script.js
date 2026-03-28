let editingRobotIndex = null;

function navigate(sectionId, menuId = null) {
    document.querySelectorAll('.section').forEach(sec => {
        sec.classList.remove('active');
    });

    document.getElementById(sectionId).classList.add('active');

    if (menuId) {
        setActiveMenu(menuId);
    }

    // Breadcrumb principal
    switch(sectionId) {
        case 'dashboard':
            setBreadcrumb([
                { label: "Dashboard", section: "dashboard", icon: "🏠" }
            ]);
            break;

        case 'robots':
            setBreadcrumb([
                { label: "Robôs", section: "robots", icon: "🤖" }
            ]);
            break;
        
        case 'agents':
            setBreadcrumb([
                { label: "Agents", section: "agents", icon: "🧩" }
            ]);
            break;
        
        case 'executions':
            setBreadcrumb([
                { label: "Execuções", section: "executions", icon: "📅" }
            ]);
            break;

        case 'logsGlobal':
            setBreadcrumb([
                { label: "Logs", section: "logsGlobal", icon: "📜" }
            ]);
            break;

        case 'admin':
            setBreadcrumb([
                { label: "Administração", section: "admin", icon: "⚙️" }
            ]);
            break;
        default:
            // não altera breadcrumb (mantém o atual)
        break;
    }
}

function openRobot(name) {
    document.getElementById("robotTitle").innerText = name;

    navigate('robotDetail');

    setBreadcrumb([
        { label: "Robôs", section: "robots", icon: "🤖" },
        { label: name }
    ]);
}

function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = "none";
    });

    document.querySelectorAll('.tab').forEach(t => {
        t.classList.remove("active");
    });

    document.getElementById(tabId).style.display = "block";
    event.target.classList.add("active");
}

function addLog(message) {
    const log = document.getElementById("logArea");
    const time = new Date().toLocaleTimeString();
    log.innerHTML += `<br>[${time}] ${message}`;
    log.scrollTop = log.scrollHeight;
}

function openExecution(id) {

    const robotName = document.getElementById("robotTitle").innerText;

    document.getElementById("robotTitleExec").innerText = robotName;
    document.getElementById("executionTitle").innerText = "Execução #" + id;

    navigate('executionDetail');

    setBreadcrumb([
        { label: "Robôs", section: "robots", icon: "🤖" },
        { label: robotName, action: "goToRobotFromBreadcrumb()" }, // 🔥 AQUI
        { label: "Execução #" + id }
    ]);

    const logs = document.getElementById("executionLogs");

    logs.innerHTML = `
    [10:00:01] Iniciado<br>
    [10:00:05] Conectando via RDP...<br>
    [10:00:10] Login realizado<br>
    [10:00:20] Processando dados...<br>
    [10:01:30] Finalizado com sucesso
    `;
}

function filterExecutions(date) {
    console.log("Filtrando por data:", date);
    alert("Filtro aplicado (simulação)");
}

function backToRobot() {
    const robotName = document.getElementById("robotTitle").innerText;

    navigate('robotDetail');

    setBreadcrumb([
        { label: "Robôs", section: "robots", icon: "🤖" },
        { label: robotName }
    ]);
}

/*Menu lateral esquerdo - permanecer em evidência após clique*/
function setActiveMenu(menuId) {
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active-menu');
    });

    document.getElementById(menuId).classList.add('active-menu');
}

function setBreadcrumb(items) {
    const container = document.getElementById("breadcrumb");

    container.innerHTML = items.map((item, index) => {

        const isLast = index === items.length - 1;
        const icon = item.icon ? item.icon + " " : "";

        // ITEM COM AÇÃO CUSTOM
        if (!isLast && item.action) {
            return `
                <span style="cursor:pointer; color:#3498db;"
                      onclick="${item.action}">
                    ${icon}${item.label}
                </span>
                <span> > </span>
            `;
        }

        // ITEM COM SECTION
        if (!isLast && item.section) {
            return `
                <span style="cursor:pointer; color:#3498db;"
                      onclick="navigate('${item.section}')">
                    ${icon}${item.label}
                </span>
                <span> > </span>
            `;
        }

        // ÚLTIMO ITEM
        return `
            <span style="font-weight:bold;">
                ${icon}${item.label}
            </span>
        `;

    }).join("");
}

function goToRobotFromBreadcrumb() {
    const robotName = document.getElementById("robotTitleExec").innerText;

    document.getElementById("robotTitle").innerText = robotName;

    navigate('robotDetail');

    setBreadcrumb([
        { label: "Robôs", section: "robots", icon: "🤖" },
        { label: robotName }
    ]);
}


let robotsData = [
  {
    name: "Bot Financeiro",
    status: "Online",
    running: true,
    startedAt: Date.now() - 120000 // 2 minutos atrás
  }
];

let renderInterval = null;
/*function loadRobots() {
    fetch('robots.json')
        .then(res => res.json())
        .then(data => {
            robotsData = data;

            renderRobots();

            // Evita múltiplos intervals
            if (!renderInterval) {
                renderInterval = setInterval(() => {
                    renderRobots();
                }, 1000);
            }
        });
}*/


function loadRobots() {
    fetch('robots.json')
        .then(res => res.json())
        .then(data => {
            // 🔥 Ajuste automático ao carregar
            robotsData = data.map(robot => {
                if (robot.running && !robot.startedAt) {
                    robot.startedAt = Date.now();
                }
                return robot;
            });
            renderRobots();
            if (!renderInterval) {
                renderInterval = setInterval(() => {
                    renderRobots();
                }, 1000);
            }
        });
}










function renderRobots() {
   
    const container = document.getElementById("robotList");
    container.innerHTML = "";

    robotsData.forEach((robot, index) => {

        const div = document.createElement("div");
        div.className = "robot-card";

        // STATUS EXECUÇÃO
        let executionInfo = "";
        let runButton = "";

        if (robot.running) {
            executionInfo = `
                <span class="execution-status running">
                    ⚡ Executando há ${getRunningTime(robot.startedAt)}
                </span>
            `;

            runButton = `
                <button class="btn-stop"
                    onclick="event.stopPropagation(); stopRobot(${index})">
                    ⏹ Stop
                </button>
            `;

            div.classList.add("robot-running");

        } else {
            executionInfo = `
                <span class="execution-status stopped">
                    ⏸ Parado
                </span>
            `;

            runButton = `
                <button class="btn-run"
                    onclick="event.stopPropagation(); startRobot(${index})">
                    ▶️ Start
                </button>
            `;
        }

        div.innerHTML = `
<div style="display:flex; align-items:center; width:100%;">

    <!-- ESQUERDA -->
    <div style="width:40%;">
        🤖 ${robot.name} 
        <br>
        <span style="font-size:12px; color:#888;">
            🧩 ${robot.agent || "Sem Agent"}
        </span>
        <br>
        <span style="color:${robot.status === 'Online' ? 'limegreen' : 'red'};">
            ● ${robot.status}
        </span>
    </div>

    <!-- CENTRO -->
    <div style="width:30%; text-align:center; font-weight:bold;">
        ${executionInfo}
    </div>

    <!-- DIREITA -->
    <div style="width:30%; text-align:right;">
    ${runButton}
    <button class="btn-edit" onclick="event.stopPropagation(); editRobot(${index})">✏️</button>
    <button class="btn-delete" onclick="event.stopPropagation(); deleteRobot(${index})">🗑</button>
</div>

</div>
`;

        // cor lateral
        if (robot.running) {
            div.style.borderLeftColor = "#f1c40f";
        } else if (robot.status === "Online") {
            div.style.borderLeftColor = "#2ecc71";
        } else {
            div.style.borderLeftColor = "#e74c3c";
        }

        div.onclick = () => openRobot(robot.name);

        container.appendChild(div);
    });
}
/*
function addRobot() {
    const name = prompt("Nome do robô:");
    if (!name) return;
    robotsData.push({
        name: name,
        status: "Offline"
    });
    renderRobots();
}
*/
/*
function addRobot() {
    const name = prompt("Nome do robô:");
    if (!name) return;
    const agent = prompt("Qual Agent irá executar?");
    robotsData.push({
        name: name,
        status: "Offline",
        running: false,
        agent: agent || "Não definido"
    });
    renderRobots();
}
*//*
function addRobot() {
    const name = prompt("Nome do robô:");
    if (!name) return;
    const agentNames = agentsData.map(a => a.name).join(", ");
    const agent = prompt(`Qual Agent?\nDisponíveis: ${agentNames}`);
    robotsData.push({
        name: name,
        status: "Offline",
        running: false,
        agent: agent || "Não definido"
    });
    renderRobots();
}
*/
function addRobot() {
    /*document.getElementById("robotModalTitle").innerText = "🤖 Novo Robô";*/
    const modal = document.getElementById("robotModal");
    const select = document.getElementById("robotAgentSelect");

    // limpa campos
    document.getElementById("robotNameInput").value = "";
    select.innerHTML = "";

    // popula dropdown
    agentsData.forEach(agent => {
        const option = document.createElement("option");
        option.value = agent.name;
        option.textContent = agent.name;
        select.appendChild(option);
    });

    modal.style.display = "flex";
}
function closeRobotModal() {
    document.getElementById("robotModal").style.display = "none";
    editingRobotIndex = null;
}/*
function saveRobot() {
    const name = document.getElementById("robotNameInput").value;
    const agent = document.getElementById("robotAgentSelect").value;
    if (!name) {
        alert("Informe o nome do robô");
        return;
    }
    robotsData.push({
        name: name,
        status: "Offline",
        running: false,
        agent: agent
    });
    closeRobotModal();
    renderRobots();
}*/
function saveRobot() {
    const name = document.getElementById("robotNameInput").value;
    const agent = document.getElementById("robotAgentSelect").value;
    if (!name) {
        alert("Informe o nome do robô");
        return;
    }
    // 🔥 MODO EDIÇÃO
    if (editingRobotIndex !== null) {
        robotsData[editingRobotIndex].name = name;
        robotsData[editingRobotIndex].agent = agent;
        editingRobotIndex = null;
    } else {
        // 🆕 NOVO ROBÔ
        robotsData.push({
            name: name,
            status: "Offline",
            running: false,
            agent: agent
        });
    }
    closeRobotModal();
    renderRobots();
}

function deleteRobot(index) {

    const confirmDelete = confirm("Tem certeza que deseja excluir este robô?");
    if (!confirmDelete) return;

    robotsData.splice(index, 1);
    renderRobots();
}
/*
function editRobot(index) {
    const robot = robotsData[index];
    const newName = prompt("Novo nome:", robot.name);
    if (!newName) return;
    const newStatus = prompt("Novo status (Online/Offline):", robot.status);
    if (!newStatus) return;
    robot.name = newName;
    robot.status = newStatus;
    renderRobots();
}*/
function editRobot(index) {
    const robot = robotsData[index];
    editingRobotIndex = index;

    const modal = document.getElementById("robotModal");
    const nameInput = document.getElementById("robotNameInput");
    const select = document.getElementById("robotAgentSelect");

    // 🔥 AQUI (adicione isso)
    document.getElementById("robotModalTitle").innerText =
        `✏️ Editando: ${robot.name}`;

    // preenche nome
    nameInput.value = robot.name;

    // limpa e popula dropdown
    select.innerHTML = "";

    agentsData.forEach(agent => {
        const option = document.createElement("option");
        option.value = agent.name;
        option.textContent = agent.name;

        if (agent.name === robot.agent) {
            option.selected = true;
        }

        select.appendChild(option);
    });

    modal.style.display = "flex";
}




function getRunningTime(startedAt) {
    const diff = Date.now() - startedAt;

    const seconds = Math.floor(diff / 1000) % 60;
    const minutes = Math.floor(diff / 60000) % 60;
    const hours = Math.floor(diff / 3600000);

    return `${hours > 0 ? hours + "h " : ""}${minutes}m ${seconds}s`;
}

/*
function startRobot(index) {
    robotsData[index].running = true;
    robotsData[index].startedAt = Date.now();
    renderRobots();
}
*/
function startRobot(index) {
    const robot = robotsData[index];
    if (!robot.agent || robot.agent === "Não definido") {
        alert("Este robô não possui um Agent vinculado!");
        return;
    }
    robot.running = true;
    robot.startedAt = Date.now();
    renderRobots();
}

function stopRobot(index) {
    robotsData[index].running = false;
    renderRobots();
}

/* Agentes */
let agentsData = [];
function loadAgents() {
    fetch('agents.json')
        .then(res => res.json())
        .then(data => {
            agentsData = data;
            renderAgents();
        });
}

/*function renderAgents() {
    const container = document.getElementById("agentList");
    container.innerHTML = "";
    agentsData.forEach((agent, index) => {
        const div = document.createElement("div");
        div.className = "robot-card";
        div.innerHTML = `
        <div style="display:flex; align-items:center; width:100%;">
            <!-- ESQUERDA -->
            <div style="width:50%;">
                🧩 ${agent.name}
            </div>
            <!-- CENTRO -->
            <div style="width:25%; text-align:center;">
                <span style="color:${agent.status === 'Online' ? 'limegreen' : 'red'};">
                    ● ${agent.status}
                </span>
            </div>
            <!-- DIREITA -->
            <div style="width:25%; text-align:right;">
                <span style="font-size:12px; color:#888;">
                    ${agent.lastSeen}
                </span>
                <button class="btn-delete"
                    onclick="event.stopPropagation(); deleteAgent(${index})">
                    🗑
                </button>
            </div>
        </div>
        `;
        container.appendChild(div);
    });
}*/

function renderAgents() {
    const container = document.getElementById("agentList");
    container.innerHTML = "";

    agentsData.forEach((agent, index) => {

        const robotsFromAgent = robotsData.filter(r => r.agent === agent.name);

        const div = document.createElement("div");
        div.className = "robot-card";

        div.innerHTML = `
        <div style="width:100%;">

            <div style="display:flex; justify-content:space-between;">
                <div>
                    🧩 ${agent.name}
                    <br>
                    <span style="color:${agent.status === 'Online' ? 'limegreen' : 'red'};">
                        ● ${agent.status}
                    </span>
                </div>

                <div style="text-align:right;">
                    <span style="font-size:12px; color:#888;">
                        ${agent.lastSeen}
                    </span>
                </div>
            </div>

            <hr>

            <div style="font-size:13px;">
                <strong>Robôs:</strong><br>
                ${
                    robotsFromAgent.length > 0
                    ? robotsFromAgent.map(r => `• ${r.name}`).join("<br>")
                    : "Nenhum robô vinculado"
                }
            </div>

        </div>
        `;

        container.appendChild(div);
    });
}

function addAgent() {
    const name = prompt("Nome do Agent:");
    if (!name) return;

    agentsData.push({
        name: name,
        status: "Offline",
        lastSeen: "nunca"
    });

    renderAgents();
}
function deleteAgent(index) {
    if (!confirm("Deseja remover este Agent?")) return;

    agentsData.splice(index, 1);
    renderAgents();
}
/* ----------------- */


window.onload = () => {
    loadRobots();
    loadAgents();
};