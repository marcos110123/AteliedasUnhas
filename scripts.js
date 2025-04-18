// === Firebase Imports ===

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { Timestamp,getFirestore, collection, addDoc, serverTimestamp, query, where, onSnapshot, getDocs } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
// Inicialize o EmailJS com o seu User ID
emailjs.init("xlsoL46EksEyS0eq8"); // Substitua com o seu User ID
// === Firebase Config ===
const firebaseConfig = {
    apiKey: "AIzaSyD2abLi_zEjHPS0D8EvcDPYLIbOhQa68p8",
    authDomain: "projeto3-9bb85.firebaseapp.com",
    projectId: "projeto3-9bb85",
    storageBucket: "projeto3-9bb85.firebasestorage.app",
    messagingSenderId: "403757642546",
    appId: "1:403757642546:web:b2093665bce9099b6fdd2b"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const duracaoServicos = {
    "Manicure - Pé e Mão": 120, // 2 horas = 120 minutos
    "Manicure - Mão Simples": 60, // 1 hora = 60 minutos
    "Pé Simples": 75, // 1 hora e 15 minutos = 75 minutos (corrigi o value do checkbox)
    "ESMALTAÇÃO EM GEL C/ Cutilagem": 75, // 1 hora e 15 minutos = 75 minutos
    "Esmaltação Mão": 75, // 1 hora e 15 minutos = 75 minutos
    "Alongamento Speed Tip Gel": 75, // 1 hora e 15 minutos = 75 minutos
    "PLÁSTICA DOS PÉS": 75, // 1 hora e 15 minutos = 75 minutos (duplicado na sua lista, mantive um)
    "Aplicação Unha Postiça": 75, // 1 hora e 15 minutos = 75 minutos (duplicado na sua lista, mantive um)
    "SPA DOS PÉS": 80, // 1 hora e 20 minutos = 80 minutos
};


// === Elementos do DOM ===
const form = document.getElementById("agendamento-form");
const authButtons = document.getElementById("auth-buttons");
const userInfo = document.getElementById("user-info");
const userName = document.getElementById("user-name");
const meusAgendamentosSection = document.getElementById('meus-agendamentos');
const listaDeAgendamentosDiv = document.getElementById('lista-de-agendamentos');
const secaoAgendamento = document.getElementById('agendamento');
const secaoServicosListados = document.getElementById('servicos-listados');
const divServicosSelecionados = document.getElementById('servicos-selecionados');
const checkboxesServicos = document.querySelectorAll('.selecionar-checkbox');
const botaoContinuarAgendamento = document.getElementById('continuar-agendamento');
const dataAgendamentoInput = document.getElementById('data-agendamento');
const horariosDisponiveisDiv = document.getElementById('horarios-disponiveis');
const adminLinkContainer = document.getElementById('admin-link-container'); // Novo elemento

// === Modal de Registro ===
const registerModal = document.getElementById("register-modal");
const registerBtn = document.getElementById("register-btn");
const closeModalBtn = document.querySelector("#register-modal .close-button");
const modalRegisterBtn = document.getElementById("modal-register-btn");
const modalEmailInput = document.getElementById("modal-email");
const modalPasswordInput = document.getElementById("modal-password");
const registerErrorMessage = document.getElementById("register-error-message");
const modalNameInput = document.getElementById("modal-name"); // Novo
const modalPhoneInput = document.getElementById("modal-phone"); // Novo

// === Modal de Login ===
const loginModal = document.getElementById("login-modal");
const loginBtn = document.getElementById("login-btn");
const closeLoginModalBtn = document.getElementById("close-login-modal");
const modalLoginBtn = document.getElementById("modal-login-btn");
const modalLoginEmailInput = document.getElementById("login-modal-email");
const modalLoginPasswordInput = document.getElementById("login-modal-password");
const loginErrorMessage = document.getElementById("login-error-message");

// === Modal Informações ===
document.getElementById("abrir-informacoes").addEventListener("click", (e) => {
    e.preventDefault();
    abrirModalInfo();
});

function abrirModalInfo() {
    document.querySelector('.modal-overlay-info').style.display = 'block';
    document.querySelector('.modal-info').style.display = 'block';
}

function fecharModalInfo() {
    document.querySelector('.modal-overlay-info').style.display = 'none';
    document.querySelector('.modal-info').style.display = 'none';
}

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") fecharModalInfo();
});

document.querySelector('.modal-overlay-info').addEventListener("click", fecharModalInfo);

// === Modal Galeria ===
const modalSection = document.getElementById("galeria-fotos-modal");
const overlayGaleria = modalSection.querySelector(".modal-overlay-galeria");

document.getElementById("abrir-galeria").addEventListener("click", (e) => {
    e.preventDefault;
    modalSection.style.display = "block";
});

function fecharModalGaleria() {
    modalSection.style.display = "none";
}

overlayGaleria.addEventListener("click", fecharModalGaleria);

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") fecharModalGaleria();
});

// === Seleção de Serviços ===
let servicosSelecionadosArray = [];
let duracaoTotalSelecionada = 0; // Variável para armazenar a duração total

checkboxesServicos.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        const nomeServico = checkbox.value;
        const duracao = duracaoServicos[nomeServico] || 60; // Duração padrão de 60 min se não encontrada
        if (checkbox.checked) {
            servicosSelecionadosArray.push(nomeServico);
            duracaoTotalSelecionada += duracao;
        } else {
            servicosSelecionadosArray = servicosSelecionadosArray.filter(servico => servico !== nomeServico);
            duracaoTotalSelecionada -= duracaoServicos[nomeServico] || 60;
        }
        botaoContinuarAgendamento.style.display = servicosSelecionadosArray.length > 0 ? 'block' : 'none';
        console.log("Serviços selecionados:", servicosSelecionadosArray);
        console.log("Duração total selecionada:", duracaoTotalSelecionada);
    });
});

botaoContinuarAgendamento.addEventListener('click', () => {
    if (auth.currentUser && (servicosSelecionadosArray.length > 0 )) {
        secaoServicosListados.style.display = 'none';
        secaoAgendamento.style.display = 'block';

        

        const servicosHTML = servicosSelecionadosArray.length > 0
            ? `<h4>Serviços Selecionados:</h4><ul>${servicosSelecionadosArray.map(s => `<li>${s}</li>`).join("")}</ul>`
            : '';

        divServicosSelecionados.innerHTML = `
            <h3>Resumo da Seleção:</h3>

            ${servicosHTML}
        `;

        secaoAgendamento.scrollIntoView({ behavior: 'smooth' });
    } else {
        alert(auth.currentUser ? 'Selecione ao menos um serviço ou pacote.' : 'Você precisa estar logado para agendar.');
    }
});


// === Função para Buscar Horários Agendados para uma Data ===
async function buscarHorariosAgendadosParaData(data) {
    try {
        const inicioDia = `${data}T00:00`;
        const fimDia = `${data}T23:59`;

        const q = query(
            collection(db, "agendamentos"),
            where("data", ">=", inicioDia),
            where("data", "<=", fimDia),
            where("status", "==", "pendente")
        );

        const querySnapshot = await getDocs(q);
        const horariosOcupados = new Set();

        for (const doc of querySnapshot.docs) {
            const agendamento = doc.data();
            const dataInicioAgendamento = new Date(agendamento.data);
            const servicosAgendados = agendamento.servicos;
            let duracaoAgendamento = 0;

            servicosAgendados.forEach(servico => {
                duracaoAgendamento += duracaoServicos[servico] || 60; // Obtém a duração do serviço
            });

            const inicio = new Date(dataInicioAgendamento);
            const fim = new Date(inicio.getTime() + duracaoAgendamento * 60 * 1000); // Adiciona a duração em milissegundos

            let currentTime = new Date(inicio);
            while (currentTime < fim) {
                const horaFormatada = String(currentTime.getHours()).padStart(2, '0');
                const minutoFormatada = String(currentTime.getMinutes()).padStart(2, '0');
                horariosOcupados.add(`${horaFormatada}:${minutoFormatada}`);
                currentTime.setMinutes(currentTime.getMinutes() + 1); // Avança 1 minuto
            }
        }

        console.log("Horários ocupados para a data (detalhado):", horariosOcupados);
        return horariosOcupados;
    } catch (error) {
        console.error("Erro ao buscar horários agendados:", error);
        return new Set();
    }
}

// === Função para Exibir Horários Disponíveis ===
async function exibirHorariosDisponiveis(horariosAgendados) {
    horariosDisponiveisDiv.innerHTML = '';

    const horariosPossiveis = [];
    const horaInicio = 8;
    const horaFim = 17;
    const intervaloMinutos = 15; // Ajuste a granularidade conforme necessário

    for (let hora = horaInicio; hora < horaFim; hora++) {
        for (let minuto = 0; minuto < 60; minuto += intervaloMinutos) {
            const horaFormatada = String(hora).padStart(2, '0');
            const minutoFormatada = String(minuto).padStart(2, '0');
            horariosPossiveis.push(`${horaFormatada}:${minutoFormatada}`);
        }
    }

    if (horariosPossiveis.length > 0 && duracaoTotalSelecionada > 0) {
        const selectHorario = document.createElement('select');
        selectHorario.id = 'hora-agendamento';
        selectHorario.required = true;

        const optionPadrao = document.createElement('option');
        optionPadrao.value = '';
        optionPadrao.textContent = '-- Selecione um horário --';
        selectHorario.appendChild(optionPadrao);

        horariosPossiveis.forEach(horaInicioStr => {
            const [h, m] = horaInicioStr.split(':').map(Number);
            const inicioAgendamento = new Date(dataAgendamentoInput.value);
            inicioAgendamento.setHours(h);
            inicioAgendamento.setMinutes(m);
            inicioAgendamento.setSeconds(0);
            inicioAgendamento.setMilliseconds(0);

            const fimAgendamento = new Date(inicioAgendamento.getTime() + duracaoTotalSelecionada * 60 * 1000);

            let horarioLivre = true;
            let currentTime = new Date(inicioAgendamento);

            while (currentTime < fimAgendamento) {
                const horaAtualFormatada = String(currentTime.getHours()).padStart(2, '0');
                const minutoAtualFormatada = String(currentTime.getMinutes()).padStart(2, '0');
                if (horariosAgendados.has(`${horaAtualFormatada}:${minutoAtualFormatada}`)) {
                    horarioLivre = false;
                    break;
                }
                currentTime.setMinutes(currentTime.getMinutes() + 1);
            }

            if (horarioLivre) {
                const dataHora = `${dataAgendamentoInput.value}T${horaInicioStr}:00`;
                const option = document.createElement('option');
                option.value = dataHora;
                option.textContent = horaInicioStr;
                selectHorario.appendChild(option);
            }
        });

        if (selectHorario.options.length > 1) {
            const labelHorario = document.createElement('label');
            labelHorario.setAttribute('for', 'hora-agendamento');
            labelHorario.textContent = 'Selecione o Horário:';
            horariosDisponiveisDiv.appendChild(labelHorario);
            horariosDisponiveisDiv.appendChild(selectHorario);
        } else {
            horariosDisponiveisDiv.innerHTML = '<p>Não há horários disponíveis para a duração dos serviços selecionados nesta data.</p>';
        }
    } else if (servicosSelecionadosArray.length === 0) {
        horariosDisponiveisDiv.innerHTML = '<p>Selecione os serviços para ver os horários disponíveis.</p>';
    } else {
        horariosDisponiveisDiv.innerHTML = '<p>Não há horários disponíveis.</p>';
    }
}

// === Evento de Mudança de Data (Quando o usuário seleciona uma data) ===
dataAgendamentoInput.addEventListener('change', async (event) => {
    const dataSelecionada = event.target.value;
    if (dataSelecionada) {
        // Busca os horários ocupados para a data selecionada
        const horariosAgendados = await buscarHorariosAgendadosParaData(dataSelecionada);
        // Exibe os horários disponíveis e ocupados
        exibirHorariosDisponiveis(horariosAgendados);
    } else {
        horariosDisponiveisDiv.innerHTML = '';   // Limpa os horários quando não houver data selecionada
    }
    
});

// === Agendamento - Submit do Formulário ===
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const dataHoraCompleta = document.getElementById("hora-agendamento")?.value;
    const user = auth.currentUser;

    const duracaoTotalAgendada = duracaoTotalSelecionada;
if (user && (servicosSelecionadosArray.length > 0 ) && dataHoraCompleta) {

        const dataAgendamento = dataHoraCompleta.split('T')[0];
        const horaAgendamento = dataHoraCompleta.split('T')[1]?.slice(0, 5);
        const hoje = new Date();
        const dataSelecionada = new Date(dataAgendamentoInput.value);

        if (dataSelecionada < hoje.setHours(0, 0, 0, 0)) {
            alert("Você não pode agendar para uma data passada.");
            return;
        }

        try {
            const q = query(
                collection(db, "agendamentos"),
                where("data", "==", dataAgendamento + "T" + horaAgendamento + ":00"),
                where("status", "==", "pendente")
            );
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                await addDoc(collection(db, "agendamentos"), {
                    uid: user.uid,
                    servicos: servicosSelecionadosArray,
                    data: dataHoraCompleta,
                    status: "pendente",
                    createdAt: serverTimestamp(),
                });
                

                // ✅ Envia o e-mail de confirmação aqui
                enviarEmailConfirmacao(user, servicosSelecionadosArray, dataAgendamento, horaAgendamento);

                alert("Seu agendamento foi realizado com sucesso para os serviços selecionados!");

                // Limpa os dados e reseta interface
               // Limpa os dados e reseta interface
                servicosSelecionadosArray = [];
                secaoAgendamento.style.display = 'none';
                secaoServicosListados.style.display = 'block';
                checkboxesServicos.forEach(cb => cb.checked = false);
                botaoContinuarAgendamento.style.display = 'none';
                horariosDisponiveisDiv.innerHTML = ''
            ;

            } else {
                alert("O horário selecionado já está ocupado. Por favor, escolha outro horário.");
            }
        } catch (error) {
            console.error("Erro ao agendar: ", error);
            alert("Houve um erro ao tentar realizar o agendamento. Por favor, tente novamente mais tarde.");
        }
    } else {
        alert(auth.currentUser ? 'Selecione uma data e horário e pelo menos um serviço para agendar.' : 'Para agendar, você precisa estar logado.');
    }
});


// === Registro ===
registerBtn.addEventListener("click", () => {
    registerModal.style.display = "block";
    registerErrorMessage.style.display = "none";
    modalEmailInput.value = "";
    modalPasswordInput.value = "";
    modalNameInput.value = ""; // Limpa o nome
    modalPhoneInput.value = ""; // Limpa o telefone
});

closeModalBtn.addEventListener("click", () => registerModal.style.display = "none");

window.addEventListener("click", (event) => {
    if (event.target === registerModal) registerModal.style.display = "none";
});

modalRegisterBtn.addEventListener("click", () => {
    const name = modalNameInput.value;
    const phone = modalPhoneInput.value;
    const email = modalEmailInput.value;
    const password = modalPasswordInput.value;

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => updateProfile(userCredential.user, { displayName: name }))
        .then(() => addDoc(collection(db, "users"), {
            uid: auth.currentUser.uid,
            displayName: name,
            phone,
            email,
            role: "user" // Adiciona a role padrão "user"
        }))
        .then(() => {
            alert("Cadastro bem-sucedido!");
            registerModal.style.display = "none";
        })
        .catch((error) => {
            registerErrorMessage.textContent = "Erro ao cadastrar: " + error.message;
            registerErrorMessage.style.display = "block";
        });
});

// === Login ===
loginBtn.addEventListener("click", () => {
    loginModal.style.display = "block";
    loginErrorMessage.style.display = "none";
    modalLoginEmailInput.value = "";
    modalLoginPasswordInput.value = "";
});

closeLoginModalBtn.addEventListener("click", () => loginModal.style.display = "none");

window.addEventListener("click", (event) => {
    if (event.target === loginModal) loginModal.style.display = "none";
});

modalLoginBtn.addEventListener("click", () => {
    const email = modalLoginEmailInput.value;
    const password = modalLoginPasswordInput.value;

    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            alert("Login bem-sucedido!");
            loginModal.style.display = "none";
        })
        .catch((error) => {
            loginErrorMessage.textContent = "Erro no login: " + error.message;
            loginErrorMessage.style.display = "block";
        });
});

document.getElementById("logout-btn").addEventListener("click", () => {
    signOut(auth)
        .then(() => {
            alert("Você saiu!");
            // Redireciona para a página inicial do GitHub Pages
            window.location.href = "/AteliedasUnhas/"; // ou index.html se estiver testando local
        })
        .catch((error) => alert("Erro ao sair: " + error.message));
});


// === Estado de Autenticação ===
onAuthStateChanged(auth, async (user) => {
    if (user) {
        userName.textContent = `Olá, ${user.displayName || 'usuário'}`;
        authButtons.style.display = "none";
        userInfo.style.display = "block";
        form.style.display = "block";
        meusAgendamentosSection.style.display = 'block';

        // Consulta o documento do usuário no Firestore para obter a role (agora isAdmin)
        const userDocSnapshot = await getDocs(query(collection(db, "users"), where("uid", "==", user.uid)));

        if (!userDocSnapshot.empty) {
            const userData = userDocSnapshot.docs[0].data();
            console.log("Dados do usuário:", userData);
            console.log("isAdmin:", userData.isAdmin); // Verifique o valor de isAdmin

            if (userData.isAdmin === true) { // Ajuste a condição para verificar o booleano true
                adminLinkContainer.style.display = 'block'; // Exibe o link de administrador
            } else {
                adminLinkContainer.style.display = 'none'; // Oculta o link para usuários normais
            }
        } else {
            adminLinkContainer.style.display = 'none'; // Oculta se não encontrar os dados do usuário
        }

        const q = query(collection(db, "agendamentos"), where("uid", "==", user.uid));
        onSnapshot(q, (querySnapshot) => {
            const agendamentos = [];
            querySnapshot.forEach((doc) => agendamentos.push({ id: doc.id, ...doc.data() }));
            exibirAgendamentos(agendamentos);
        });
    } else {
        authButtons.style.display = "block";
        userInfo.style.display = "none";
        form.style.display = "none";
        meusAgendamentosSection.style.display = 'none';
        adminLinkContainer.style.display = 'none'; // Garante que o link esteja oculto ao deslogar
    }
});
// === Exibição de Agendamentos ===
function exibirAgendamentos(agendamentos) {
    listaDeAgendamentosDiv.innerHTML = '';
    if (agendamentos.length > 0) {
        agendamentos.forEach(agendamento => {
            const dataAgendada = new Date(agendamento.data);
            const dataFormatada = dataAgendada.toLocaleDateString('pt-BR', {
                day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            const servicos = Array.isArray(agendamento.servicos) ? agendamento.servicos.join(', ') : 'Nenhum serviço selecionado';

            const agendamentoDiv = document.createElement('div');
            agendamentoDiv.classList.add('agendamento-item');
            agendamentoDiv.innerHTML = `
                <p><strong>Serviço:</strong> ${servicos}</p>
                <p><strong>Data e Hora:</strong> ${dataFormatada}</p>
                <p><strong>Status:</strong> ${agendamento.status}</p>
                <hr>
            `;
            listaDeAgendamentosDiv.appendChild(agendamentoDiv);
        });
    } else {
        listaDeAgendamentosDiv.innerHTML = '<p>Nenhum agendamento encontrado.</p>';
    }
}

// === Botão de Voltar ao Topo ===
document.getElementById("back-to-top").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});


// === EmailJS Setup ===


// === Função para Enviar E-mail ===
function enviarEmailConfirmacao(usuario, servicosSelecionados, data, horario = []) {
    const emailParams = {
        to_email: usuario.email,
        user_name: usuario.displayName,
        servicos: servicosSelecionados.join(", "),
        data_agendamento: data,
        horario_agendamento: horario,
    };

    emailjs.send('service_e1vy49h', 'template_em25s54', emailParams)
    .then((response) => {
        console.log('E-mail enviado com sucesso:', response);
        alert('E-mail enviado com sucesso!');
    })
    .catch((error) => {
        console.error('Erro ao enviar e-mail:', error);
        alert('Erro ao enviar e-mail. Veja o console para detalhes.');
    });
}


    