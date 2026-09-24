# Ponto da Costela - Recife 🔥

SPA em React + Tailwind CSS + Lucide Icons para o restaurante **Ponto da Costela** (Arruda, Recife - PE).

Todo o app fica em um único arquivo: [`src/App.jsx`](src/App.jsx). Ele também funciona colado direto no Claude Artifacts / Preview.

## Rodar localmente

```bash
npm install
npm run dev      # desenvolvimento
npm run build    # build de produção em dist/
```

## Vídeo 3D de fundo (Google Flow)

Exporte o vídeo do Google Flow e salve como:

- `public/videos/brasa-google-flow.webm` e/ou
- `public/videos/brasa-google-flow.mp4`

Sem esses arquivos, o site tenta os vídeos de mockup (Pexels/Mixkit). Se nenhum carregar, aparecem a imagem de poster e as fagulhas animadas em canvas. As fontes ficam em `VIDEO_SOURCES` no topo do `App.jsx`.

## O que conferir antes de publicar

Estes dados são exemplos e ficam no topo do `App.jsx`:

- `MENU`: pratos, descrições e **preços**
- `HOURS`: horários de funcionamento por dia (a barra de aviso e o selo "Aberto agora" usam esses valores no fuso de Recife)
- Fotos: vêm do Unsplash. Se alguma não carregar, o card mostra um emoji.
