🚀 Frontend - Sistema de Gestão de Condomínios
Este repositório contém o código-fonte da interface de usuário (UI) para o Sistema de Gestão de Condomínios. A aplicação foi desenvolvida com React e Vite, e consome a API RESTful do backend para fornecer uma experiência rica e interativa aos usuários.

📖 Sobre o Projeto
Esta é uma Single-Page Application (SPA) projetada para ser o portal de interação para todos os perfis de usuário do sistema, desde moradores até administradores globais. A interface se adapta, mostrando funcionalidades e informações pertinentes a cada nível de acesso, garantindo uma experiência segura e focada.

✨ Funcionalidades Implementadas
Autenticação Segura: Fluxo de login com armazenamento de token JWT para comunicação segura com a API.

Dashboards Dinâmicos: A tela inicial se adapta ao perfil do usuário:

Visão do Gestor: Apresenta cards com estatísticas (total de usuários, condomínios, unidades) e gráficos financeiros.

Visão do Morador: Mostra um resumo focado nas suas finanças, comunicados e reservas.

Módulos de Gestão (CRUD):

Interfaces completas para gerenciar Pessoas, Condomínios, Unidades e Administradoras.

Uso de modais para criação e edição, proporcionando um fluxo de trabalho contínuo.

Controles de acesso que ocultam ações (como "Adicionar" ou "Inativar") com base no papel do usuário.

Controle de Acesso Visual: Menus e botões são renderizados condicionalmente, garantindo que os usuários vejam apenas as opções às quais têm permissão.

Usabilidade Aprimorada:

Uso de "Badges" para identificação visual rápida de papéis.

Máscaras para dados sensíveis como CPF/CNPJ.

Dropdowns inteligentes e dependentes para evitar a necessidade de decorar IDs.

🚀 Tecnologias Utilizadas
React 18: Biblioteca principal para a construção da interface.

Vite: Ferramenta de build e servidor de desenvolvimento extremamente rápido.

React Router: Para o gerenciamento de rotas e navegação na SPA.

Axios: Para realizar as chamadas à API RESTful do backend.

Recharts: Para a criação de gráficos dinâmicos no dashboard.

CSS Moderno: Estilização com Flexbox, Grid e design responsivo, sem a necessidade de frameworks externos.

⚙️ Pré-requisitos
Node.js (versão 18 ou superior)

npm (geralmente instalado junto com o Node.js)

O servidor do backend deve estar em execução para que a aplicação seja totalmente funcional.

▶️ Como Executar Localmente
Clone o repositório:

Bash

git clone https://github.com/Andersonspita/gestao-condominio-frontend.git
Navegue até a pasta do projeto:

Bash

cd gestao-condominio-frontend
Instale as dependências:

Bash

npm install
Configure a URL da API Backend:

Crie um arquivo chamado .env na raiz do projeto frontend.

Dentro deste arquivo, adicione a seguinte linha, apontando para a sua API local:

VITE_API_URL=http://localhost:8080/api
Este passo é crucial para que o frontend saiba onde encontrar o backend.

Inicie o servidor de desenvolvimento:

Bash

npm run dev
Acesse a aplicação:

Abra seu navegador e acesse http://localhost:5173.

🚢 Deploy
Para fazer o deploy da aplicação (por exemplo, no Render):

Execute o comando npm run build. Isso irá gerar uma pasta dist otimizada para produção.

Nas configurações do seu serviço de hospedagem (como o Render), configure o Comando de Build para npm install && npm run build e o Diretório de Publicação para dist.

Crie uma Variável de Ambiente chamada VITE_API_URL e aponte-a para a URL pública da sua API de backend.
