# Ponto da Costela - Recife 🔥

SPA em React + Tailwind CSS + Lucide Icons para o restaurante **Ponto da Costela** (Arruda, Recife - PE).

Todo o app fica em um único arquivo: [`src/App.jsx`](src/App.jsx). Ele também funciona colado direto no Claude Artifacts / Preview.

## Rodar localmente

```bash
npm install
npm run dev      # desenvolvimento
npm run build    # build de produção em dist/
```

## Vídeo e fotos da casa

O fundo é o vídeo de drone da fachada e do salão, comprimido em `public/videos/`:

| Arquivo | Uso |
| --- | --- |
| `ponto-da-costela-1080.mp4` (5 MB) | telas grandes |
| `ponto-da-costela-720.mp4` (2,2 MB) | celular |
| `ponto-da-costela-720.webm` (2,9 MB) | navegadores sem H.264 |

`public/images/` tem o poster (fachada) e duas fotos do salão tiradas do mesmo vídeo. Se nada disso carregar (por exemplo, com só o `App.jsx` colado no Claude Artifacts), o fundo cai em vídeos de mockup, depois no poster e por fim em fagulhas animadas.

## Visual

Inspirado em sites de restaurante elegantes: títulos em Playfair Display, detalhes em letra cursiva (Great Vibes), texto em Raleway, dourado sobre carvão, botões com contorno e uma seção clara em creme.

## O que conferir antes de publicar

Estes dados são exemplos e ficam no topo do `App.jsx`:

- `MENU`: pratos, descrições e **preços**
- `HOURS`: horários de funcionamento por dia (a barra de aviso e o selo "Aberto agora" usam esses valores no fuso de Recife)
- Fotos: vêm do Unsplash. Se alguma não carregar, o card mostra um emoji.

## Publicação (GitHub Pages)

O workflow `.github/workflows/deploy.yml` gera o site e publica no GitHub Pages a cada push na branch principal.

Na primeira vez, ative em **Settings → Pages → Build and deployment → Source: GitHub Actions**. Depois, rode de novo o workflow em **Actions → Publicar no GitHub Pages → Run workflow**.

Endereço: `https://lucasmendonca-dev05.github.io/ponto-da-costela/`
