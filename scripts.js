// === Firebase Imports ===

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { Timestamp,getFirestore, collection, addDoc, serverTimestamp, query, where, onSnapshot, getDocs } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

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

checkboxesServicos.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        const nomeServico = checkbox.value;
        if (checkbox.checked) {
            servicosSelecionadosArray.push(nomeServico);
        } else {
            servicosSelecionadosArray = servicosSelecionadosArray.filter(servico => servico !== nomeServico);
        }
        botaoContinuarAgendamento.style.display = servicosSelecionadosArray.length > 0 ? 'block' : 'none';
    });
});

botaoContinuarAgendamento.addEventListener('click', () => {
    if (auth.currentUser && servicosSelecionadosArray.length > 0) {
        secaoServicosListados.style.display = 'none';
        secaoAgendamento.style.display = 'block';
        divServicosSelecionados.innerHTML = `<h3>Serviços Selecionados:</h3><ul>${servicosSelecionadosArray.map(s => `<li>${s}</li>`).join("")}</ul>`;
        secaoAgendamento.scrollIntoView({ behavior: 'smooth' });
    } else {
        alert(auth.currentUser ? 'Selecione pelo menos um serviço para continuar.' : 'Para agendar, você precisa estar logado.');
    }
});

// === Função para Buscar Horários Agendados para uma Data ===
async function buscarHorariosAgendadosParaData(data) {
    try {
        // Define o intervalo de início e fim do dia
        const inicioDia = `${data}T00:00`;
        const fimDia = `${data}T23:59`;

        // Consulta os agendamentos que estão dentro do intervalo de data do dia selecionado
        const q = query(
            collection(db, "agendamentos"),
            where("data", ">=", inicioDia),   // Maior ou igual ao início do dia
            where("data", "<=", fimDia),     // Menor ou igual ao fim do dia
            where("status", "==", "pendente")   // Apenas pendentes
        );

        // Realiza a consulta no Firestore
        const querySnapshot = await getDocs(q);

        const horariosAgendados = new Set();

        // Itera pelos documentos retornados
        querySnapshot.forEach((doc) => {
            const dataAgendada = doc.data().data;   // Pega a data agendada (ex: "2025-04-09T10:00")
            const horaAgendada = dataAgendada.split("T")[1]?.slice(0, 5);   // Extrai a hora (ex: "10:00")
            if (horaAgendada) {
                horariosAgendados.add(horaAgendada);   // Adiciona a hora ao conjunto de horários agendados
            }
        });

        console.log("Horários ocupados para a data:", horariosAgendados);   // Depuração
        return horariosAgendados;   // Retorna o Set com os horários ocupados
    } catch (error) {
        console.error("Erro ao buscar horários agendados:", error);
        return new Set();   // Retorna um Set vazio em caso de erro
    }
}

// === Função para Exibir Horários Disponíveis ===
async function exibirHorariosDisponiveis(horariosAgendados) {
    horariosDisponiveisDiv.innerHTML = '';   // Limpa o conteúdo da div de horários

    const horariosPossiveis = [];
    const horaInicio = 8;   // Início às 08:00
    const horaFim = 17;     // Fim às 17:00
    const intervaloMinutos = 60;   // Intervalo de 60 minutos

    // Gera todos os horários possíveis entre 08:00 e 17:00
    for (let hora = horaInicio; hora < horaFim; hora++) {
        for (let minuto = 0; minuto < 60; minuto += intervaloMinutos) {
            const horaFormatada = String(hora).padStart(2, '0');
            const minutoFormatada = String(minuto).padStart(2, '0');
            horariosPossiveis.push(`${horaFormatada}:${minutoFormatada}`);
        }
    }

    // Cria o select para mostrar os horários
    if (horariosPossiveis.length > 0) {
        const selectHorario = document.createElement('select');
        selectHorario.id = 'hora-agendamento';
        selectHorario.required = true;

        const optionPadrao = document.createElement('option');
        optionPadrao.value = '';
        optionPadrao.textContent = '-- Selecione um horário --';
        selectHorario.appendChild(optionPadrao);

        // Adiciona os horários possíveis ao select, mas apenas os que não estão agendados
        horariosPossiveis.forEach(horaCompleta => {
            // Verifica se o horário está no Set de horários agendados
            if (!horariosAgendados.has(horaCompleta)) {
                const dataHora = `${dataAgendamentoInput.value}T${horaCompleta.split(':')[0]}:${horaCompleta.split(':')[1]}:00`;
                const option = document.createElement('option');
                option.value = dataHora;
                option.textContent = horaCompleta;
                selectHorario.appendChild(option);
            }
        });

        // Se houver horários disponíveis, adiciona o select ao DOM
        if (selectHorario.options.length > 1) {
            const labelHorario = document.createElement('label');
            labelHorario.setAttribute('for', 'hora-agendamento');
            labelHorario.textContent = 'Selecione o Horário:';
            horariosDisponiveisDiv.appendChild(labelHorario);
            horariosDisponiveisDiv.appendChild(selectHorario);
        } else {
            horariosDisponiveisDiv.innerHTML = '<p>Não há horários disponíveis para esta data.</p>';
        }
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

    // Verifica se o usuário está logado, se há serviços selecionados e se a data/hora foi escolhida
    if (user && servicosSelecionadosArray.length > 0 && dataHoraCompleta) {
        const dataAgendamento = dataHoraCompleta.split('T')[0];   // Data sem hora
        const horaAgendamento = dataHoraCompleta.split('T')[1]?.slice(0, 5);   // Hora no formato HH:MM

        try {
            // Verifica se já existe um agendamento para a data e hora selecionadas
            const q = query(
                collection(db, "agendamentos"),
                where("data", "==", dataAgendamento + "T" + horaAgendamento + ":00"), // Comparação precisa de HH:MM:SS
                where("status", "==", "pendente")
            );
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                // Se não houver conflito, adiciona o novo agendamento
                await addDoc(collection(db, "agendamentos"), {
                    uid: user.uid,
                    servicos: servicosSelecionadosArray,
                    data: dataHoraCompleta,
                    status: "pendente",
                    createdAt: serverTimestamp(),
                });
                alert("Seu agendamento foi realizado com sucesso para os serviços selecionados!");

                // Limpa os dados e redireciona o usuário
                servicosSelecionadosArray = [];
                secaoAgendamento.style.display = 'none';
                secaoServicosListados.style.display = 'block';
                checkboxesServicos.forEach(cb => cb.checked = false);
                botaoContinuarAgendamento.style.display = 'none';
                horariosDisponiveisDiv.innerHTML = '';
            } else {
                // Se o horário já estiver ocupado, informa o usuário
                alert("O horário selecionado já está ocupado. Por favor, escolha outro horário.");
            }
        } catch (error) {
            // Tratamento de erro mais detalhado
            console.error("Erro ao agendar: ", error);
            alert("Houve um erro ao tentar realizar o agendamento. Por favor, tente novamente mais tarde.");
        }
    } else {
        // Se não tiver um usuário logado ou falta alguma informação
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