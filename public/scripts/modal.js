const menu = document.getElementById('links');
const menuIcon = document.getElementById('menu-icon');

let resizeTimeout;

const updateMenuDisplay = () => {
  if (window.innerWidth > 768) {
    menuIcon.style.display = 'none'
    menu.style.display = 'flex'; // Mostra o menu em telas maiores

 
  } else {
    
    menuIcon.style.display = 'block'
    menu.style.display = 'none'; // Oculta o menu em telas menores
  
  }
};


// Chama a função para ajustar o menu ao carregar a página
updateMenuDisplay();
// updateMenuDisplay1();

window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(updateMenuDisplay);
});
document.getElementById('ModalOpen').addEventListener('click', modal);// chama a funcao do modal


function modal() {
  document.body.classList.add("no-scroll");//adiciona a classe para bloquear a rolagem da pagina quando modal esta ativo
  document.getElementById('modal_login').classList.add('active')  
}

document.getElementById('modalClose').addEventListener('click', modalClose);

function modalClose() {
  document.getElementById('modal_login').classList.remove('active')
  document.body.classList.remove("no-scroll");//remove a class para voltar a rolagem
}

//limpar os inputs
function clear() {
  document.getElementById('usuario').value = '';
  document.getElementById('cemail').value = '';
  document.getElementById('csenha').value = '';
  document.getElementById('email').value = '';
  document.getElementById('senha').value = '';
}

// Carrega a lista de usuários do localStorage quando a página é carregada
window.onload = () => {
  const storedUsers = localStorage.getItem('users');
  if (storedUsers) {
    listUser  = JSON.parse(storedUsers);
  }
};

// abre a confirmacao de login
document.getElementById('conflogin').addEventListener('click', () => {
  const lemail = document.getElementById("email").value;
  const lsenha = document.getElementById("senha").value; 
  
  const user = listUser.find(user => user.email === lemail && user.senha === lsenha);
  
  if (!user) { 
    alert("Login ERRO");
    clear();
    return;
  }
  
  // alert("Login realizado com sucesso");
  document.getElementById('contex').innerHTML = `<h2>Seu login foi efetuado com sucesso!</h2>`;
  login();
  clear();     
});

function login() {
  const intervalo = setInterval(() => {
    document.getElementById('confirmacao').classList.add('active')
}, 1000); 

// Após 3 segundos, para a execução.
setTimeout(() => {
  document.getElementById('confirmacao').classList.remove('active')
  clearInterval(intervalo); 
}, 3000);fechaModal(); // 3 segundos
}


//fecha o modal automaticamente
function fechaModal(){
  const intervalo = setInterval(() => {
}, 1000); 
// Após 3 segundos, para a execução.
setTimeout(() => {
  clearInterval(intervalo);
  modalClose(); 
}, 4000); // 3 segundos
}

let listUser = []
function cadUser(){
  // event.preventDefault();
  
  const userData = {
      id:(Math.random()*100).toFixed(),
      usuario:document.getElementById('usuario').value,
      email:document.getElementById('cemail').value,
      senha:document.getElementById('csenha').value
  }

  listUser.push(userData)
  localStorage.setItem('users', JSON.stringify(listUser))

}


// abre a confirmacao de cadastro
document.getElementById('confcad').addEventListener('click', () => {
  cadUser();
  document.getElementById('contex').innerHTML = `<h2>Seu cadastro foi efetuado com sucesso!</h2>`
  login();
  clear();
});


// mostra e oculta os menus
document.getElementById('menu-icon').addEventListener('click', () => { 
 // Alterna a visibilidade do menu
  if (menu.style.display === 'none') {
    menu.style.display = 'flex'; // Mostra o menu
  } else {
    menu.style.display = 'none'; // Oculta o menu
  }
});
