# Gerador de Avatar com Letras

Aplicação React (Vite 8 + React 19) que gera avatares com letras. Permite escolher formato (redondo/quadrado/squircle), tamanho, fonte, cor de fundo (sólida ou gradiente), e baixar como PNG ou SVG.

## Funcionalidades

- **Até 7 letras** no avatar.
- **Formatos**: **Squircle** (padrão — superelipse estilo iOS, com curvatura ajustável de `n = 2` (círculo) a `n = 8` (quase quadrado)), Redondo ou Quadrado. Os botões de seleção são exibidos em um grid de 2 colunas, todos com o mesmo tamanho.
- **Tamanhos**: 64 a 1024 px, com presets rápidos (64, 128, 256, 512, 1024).
- **Cores**: Seletor de cores com paletas pré-definidas (Verde-azulado, Roxo, Âmbar, Ardósia, Rosa) e **paletas personalizadas** salvas no localStorage.
- **Gradiente**: Opção de fundo gradiente com escolha da cor secundária e ajuste de ângulo (0-360°).
- **Fonte**: Seleção de família (Inter, Roboto, Montserrat, Nunito, Poppins, **Lato** como padrão) com carregamento automático via Google Fonts.
- **Exportação**: Baixar como PNG (alta resolução via canvas) ou SVG vetorial. Copiar PNG/SVG para área de transferência (se suportado).
- **Tema escuro**: Alternância entre claro/escuro com botão circular no cabeçalho; preferência salva em localStorage.
- **Interface em Português Brasileiro**.

## Como rodar (desenvolvimento)

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Rode em modo dev:
   ```bash
   npm run dev
   ```
   Acesse [http://localhost:5173](http://localhost:5173).

## Build e deploy

1. Crie um build de produção:
   ```bash
   npm run build
   ```
2. A pasta `dist` estará pronta para deploy em host estático (Netlify, Vercel, GitHub Pages, S3, etc).
   Exemplo simples com `serve`:
   ```bash
   npm install -g serve
   serve -s dist
   ```

## Notas técnicas

- **Vite 8** com @vitejs/plugin-react para build e dev server ultra-rápido.
- **React 19** com as últimas funcionalidades.
- **TailwindCSS 4** com Vite plugin (`@tailwindcss/vite`) para estilos modernos.
- **lucide-react 1.14** para ícones.
- O canvas respeita `devicePixelRatio` para exportar imagens PNG nítidas.
- Quando escolher fontes diferentes de 'Lato', o app injeta a referência do Google Fonts e aguarda o carregamento antes de redesenhar.
- O SVG gerado inclui o texto com a família de fonte solicitada; se a fonte não estiver disponível no visualizador, usará fallback.
  - Para garantir renderização idêntica em qualquer lugar, incorpore a fonte no SVG (base64) ou converta o texto para paths (não implementado por padrão).
- **Tema escuro**: usa classe `dark` com `@custom-variant` do TailwindCSS 4.
- **Paletas personalizadas**: salvas no `localStorage` (chave `avatar:palettes`).
- **Limite de letras**: até 7 caracteres; fonte ajusta automaticamente ao tamanho do avatar.

## Estrutura de arquivos principais

- `src/App.jsx` — lógica da UI, canvas, geração SVG, paletas, tema, presets.
- `src/main.jsx`, `src/index.css` — bootstrap da aplicação e ajustes globais (transições, reset de formulários, tema escuro).
- `vite.config.js` — configuração do Vite com plugins React e TailwindCSS 4.
- `README.md` — este arquivo.
