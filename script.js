const SENHA_ADMIN = "ocaraeprofissionalelegostadepegarnopal";

let modoAdmin = false;

const supabaseUrl = "https://fgfmekgxnqgppsahxozw.supabase.co";

const supabaseKey = "sb_publishable_GEy2DXB14Rif19wOSLNh2w_kMyIHhSG";

const clienteSupabase = window.supabase.createClient(
    supabaseUrl,
    supabaseKey
);

function gerarCor(nome){

    const cores = [
        "#c084fc",
        "#22c55e",
        "#facc15",
        "#38bdf8",
        "#ef4444",
        "#f97316",
        "#ec4899",
        "#14b8a6"
    ];

    let soma = 0;

    for(let i = 0; i < nome.length; i++){

        soma += nome.charCodeAt(i);
    }

    return cores[soma % cores.length];
}

async function carregarHistoria() {

    const { data, error } = await clienteSupabase
        .from("historia")
        .select("*")
        .order("id");

    if (error) {

        console.error(error);

        return;
    }

    let html = "";

    data.forEach(item => {

        console.log(item);

    const cor = gerarCor(item.nome);

    let conteudo = item.frase;

    console.log(typeof item.midia);
console.log(item.midia);

const imagem = item.midia;

html += `
<div class="mensagem">

    <div
        class="autor"
        style="color:${cor}">
        ${item.nome}
    </div>

    <div class="texto">
        ${item.frase}
    </div>

    ${
    imagem
    ? `
        <img
           `
    : ""
}

</div>
`;
``

});
    document.getElementById("historia").innerHTML = html;

    const historia = document.getElementById("historia");

    historia.scrollTop = historia.scrollHeight;
}

async function enviarFrase() {

    const nome =
        document.getElementById("nome").value.trim();

    const frase =
        document.getElementById("frase").value.trim();

        const ehImagem = frase.match(
    /(https?:\/\/\S+\.(png|jpg|jpeg|gif|webp))/i
);

if(
    frase.toLowerCase().includes("<script") ||
    frase.toLowerCase().includes("</script>") ||
    frase.toLowerCase().includes("onerror=") ||
    frase.toLowerCase().includes("onclick=") ||
    frase.toLowerCase().includes("onload=") ||
    frase.toLowerCase().includes("<iframe")
){
    alert("Conteúdo inválido.");
    return;
}

if(ehImagem && !modoAdmin){

    alert(
        "Somente administradores podem enviar imagens."
    );

    return;
}


``

    if(!nome || !frase){

        alert("Preencha todos os campos.");

        return;
    }

    if(!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(nome)){

        alert("O nome deve conter apenas letras.");

        return;
    }

    if(!/[A-Za-zÀ-ÖØ-öø-ÿ]/.test(frase)){

        alert("A frase precisa conter letras.");

        return;
    }

const { data: ultimaFrase } = await clienteSupabase
    .from("historia")
    .select("*")
    .order("id", { ascending: false })
    .limit(1);

if(
    !modoAdmin &&
    ultimaFrase.length > 0 &&
    ultimaFrase[0].nome.toLowerCase() ===
    nome.toLowerCase()
){

    alert(
        "Aguarde outra pessoa escrever antes de enviar novamente."
    );

    return;
}
  
let urlImagem = "";

if(imagemSelecionada){

    const nomeArquivo =
        Date.now() +
        "_" +
        imagemSelecionada.name;

    const { error: erroUpload } =
        await clienteSupabase.storage
            .from("imagens")
            .upload(
                nomeArquivo,
                imagemSelecionada
            );

    if(erroUpload){

        alert(
            erroUpload.message
        );

        return;
    }

    const { data } =
    clienteSupabase.storage
        .from("imagens")
        .getPublicUrl(
            nomeArquivo
        );

urlImagem =
    data.publicUrl;

}
                

const { error } = await clienteSupabase
    .from("historia")
    .insert([
        {
            nome,
            frase,
            midia: urlImagem
        }
    ]);

if(error){

    console.error(error);

    alert(error.message);

    return;
}

document.getElementById("frase").value = "";

imagemSelecionada = null;

document.getElementById("frase").focus();

carregarHistoria();
}

carregarHistoria();

setInterval(() => {

    carregarHistoria();

}, 5000);

window.enviarFrase = enviarFrase;

document.addEventListener("keydown", function(event){

    if(
        event.ctrlKey &&
        event.shiftKey &&
        event.key.toLowerCase() === "k"
    ){

        ativarAdmin();
    }

});

document
    .getElementById("frase")
    .addEventListener("keydown", function(event){

        if(
            event.key === "Enter" &&
            !event.shiftKey
        ){

            event.preventDefault();

            enviarFrase();
        }
    });

let cliquesTitulo = 0;

document
    .querySelector("h1")
    .addEventListener("click", () => {

        cliquesTitulo++;

        if(cliquesTitulo >= 5){

            ativarAdmin();

            cliquesTitulo = 0;
        }

    });

    async function ativarAdmin(){

    const senha = prompt(
        "Digite a senha:"
    );

    if(senha !== SENHA_ADMIN){

        alert("Senha incorreta.");

        return;
    }

    modoAdmin = true;

    document.querySelector("h1").textContent =
        "História Infinita • ADMIN";

    document.getElementById("btnAdmin")
        .style.display = "block";

    alert("Modo Admin ativado!");
}


async function limparChat(){

    const { error } = await clienteSupabase
        .from("historia")
        .delete()
        .gt("id", 0);

    if(error){

        console.error(error);

        alert("Erro ao limpar.");

        return;
    }

    alert("Chat limpo!");

    carregarHistoria();
}

let imagemSelecionada = null;

const campoFrase =
    document.getElementById("frase");

campoFrase.addEventListener("dragover", e => {

    e.preventDefault();

});

campoFrase.addEventListener("drop", e => {

    e.preventDefault();

    if(!modoAdmin){

        alert(
            "Somente administradores podem enviar imagens."
        );

        return;
    }

    imagemSelecionada =
        e.dataTransfer.files[0];

    alert(
        `Imagem selecionada: ${imagemSelecionada.name}`
    );

});

function escaparHtml(texto){

    return texto
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
