<div align="center">
  <img src="https://raw.githubusercontent.com/tabler/tabler-icons/master/icons/outline/salad.svg" width="80" alt="Logo">
  
  # Marcador de Consumo Alimentar 🥗

  **Sistema digital, responsivo e seguro para registro de Consumo Alimentar baseado nos formulários do SISVAN (SUS).**

  [![Licença](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
  [![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-yellow.svg)]()
  [![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E.svg)]()
</div>

<br/>

## 📖 Sobre o Projeto

O **Marcador de Consumo Alimentar** é uma ferramenta web focada em modernizar o trabalho de Agentes Comunitários de Saúde (ACS), Nutricionistas e profissionais do SUS. Ele digitaliza o formulário oficial do SISVAN (Sistema de Vigilância Alimentar e Nutricional).

Diferente de planilhas e papéis, este sistema funciona como um aplicativo em qualquer celular ou computador, salva os dados na nuvem instantaneamente, e separa as fichas por família e faixa etária de forma inteligente.

### 🌟 Principais Vantagens
- **Múltiplos Usuários:** Sistema de login seguro. O usuário A nunca tem acesso aos dados do usuário B.
- **Formulários Dinâmicos:** As perguntas mudam automaticamente se a pessoa tem *menos de 6 meses*, *6 a 23 meses* ou *mais de 2 anos*.
- **Controle de Produtividade:** Acompanhe quantas fichas você lançou este mês no sistema oficial.
- **Exportação Fácil:** Exporte todos os dados consolidados para Excel (CSV) com 1 clique.

---

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído focado em leveza, performance e facilidade de hospedagem, dispensando servidores robustos (backend *Serverless*).

* **Frontend:** HTML5, CSS3, JavaScript (Vanilla / Sem frameworks)
* **Backend & Banco de Dados:** [Supabase](https://supabase.com) (PostgreSQL)
* **Autenticação:** Supabase Auth (Com encriptação segura e Row Level Security)
* **Ícones:** [Tabler Icons](https://tabler.io/)
* **Tipografia:** [Google Fonts - Inter](https://fonts.google.com/specimen/Inter)

---

## 🚀 Como fazer o Deploy (Colocar no Ar)

Você pode hospedar este aplicativo de graça usando o **GitHub Pages**, **Vercel** ou **Netlify**. Siga o passo a passo abaixo:

### Passo 1: O Banco de Dados (Supabase)
O coração do aplicativo. Você precisa de um banco para salvar as avaliações e gerenciar os usuários.

1. Crie uma conta gratuita em [Supabase.com](https://supabase.com).
2. Clique em **New Project**, dê um nome e crie uma senha forte para o banco de dados.
3. No menu lateral esquerdo, vá em **SQL Editor**.
4. Copie o conteúdo do arquivo [`database.sql`](database.sql) (que está aqui no repositório) e cole no editor do Supabase. 
5. Clique no botão verde **Run**. Isso vai criar as tabelas e as regras de segurança (RLS).
6. Agora vá em **Project Settings (Engrenagem)** → **API**.
7. Copie a `Project URL` e a `anon public key`.

### Passo 2: Configurar o Código
1. Faça um Fork/Clone deste repositório para o seu GitHub.
2. Abra o arquivo `js/supabase-config.js`.
3. Substitua os valores provisórios pelas chaves que você copiou no Passo 1:
   ```javascript
   const SUPABASE_URL      = 'https://SEU-PROJETO.supabase.co';
   const SUPABASE_ANON_KEY = 'sua-chave-anon-aqui';
   ```
4. Salve e faça um Commit/Push das alterações para o seu GitHub.

### Passo 3: Hospedagem Gratuita
Você tem duas ótimas opções gratuitas:

**Opção A: GitHub Pages (Público)**
1. No seu repositório do GitHub, vá na aba **Settings** → **Pages**.
2. Em *Build and deployment*, selecione a branch `main` e a pasta `/(root)`.
3. Salve. Em alguns minutos, seu site estará online!

**Opção B: Vercel (Pode ser repositório Privado)**
1. Crie uma conta na [Vercel](https://vercel.com) fazendo login com seu GitHub.
2. Clique em **Add New Project**.
3. Selecione o repositório do `marcador-consumo`.
4. Clique em **Deploy**. Pronto! O site está no ar com HTTPS.

### Passo 4: Autorizar a URL no Supabase (MUITO IMPORTANTE)
Para que o login funcione, o Supabase precisa saber que o seu site é seguro.
1. No painel do Supabase, vá em **Authentication** → **URL Configuration**.
2. Em **Site URL**, cole o link do seu site que acabou de ser publicado (Ex: `https://meu-marcador.vercel.app`).
3. (Opcional, mas recomendado) Vá em **Authentication** → **Providers** → **Email** e desmarque "Confirm email" se quiser que os usuários consigam acessar logo após o cadastro sem precisar confirmar o email.

---

## 📁 Estrutura de Pastas

```text
📦 marcador-consumo
 ┣ 📂 css
 ┃ ┗ 📜 styles.css           # Todo o visual incrível da plataforma
 ┣ 📂 js
 ┃ ┣ 📜 app.js               # A lógica pesada: Salvar, Ler, Excluir fichas
 ┃ ┣ 📜 auth.js              # Cuidando da segurança e login do usuário
 ┃ ┣ 📜 export.js            # Lógica para converter dados em CSV e JSON
 ┃ ┣ 📜 questions.js         # Banco de perguntas do SISVAN
 ┃ ┗ 📜 supabase-config.js   # Arquivo de conexão com a nuvem
 ┣ 📜 app.html               # Tela principal (Protegida por senha)
 ┣ 📜 database.sql           # Script que monta o banco de dados
 ┣ 📜 index.html             # Tela inicial de Login / Cadastro
 ┗ 📜 README.md              # Este manual maravilhoso!
```

---

## 🤝 Como Contribuir

Seja muito bem-vindo! Quer ajudar a melhorar essa ferramenta para a saúde pública?
1. Faça um Fork do projeto
2. Crie uma Branch para sua Funcionalidade (`git checkout -b feature/NovaFuncionalidade`)
3. Faça o Commit das suas alterações (`git commit -m 'Adiciona Nova Funcionalidade'`)
4. Faça o Push para a Branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

---

<div align="center">
  <br/>
  Desenvolvido com 💚 para facilitar a coleta de dados nutricionais no Brasil.
</div>
