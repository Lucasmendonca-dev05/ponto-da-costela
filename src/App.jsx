import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  Armchair,
  Beef,
  Beer,
  Bike,
  Bus,
  Cake,
  Car,
  Check,
  ChefHat,
  ChevronRight,
  CircleParking,
  CupSoda,
  GlassWater,
  Eye,
  EyeOff,
  Flame,
  LayoutGrid,
  MapPin,
  Menu,
  Minus,
  Navigation,
  PartyPopper,
  Pause,
  Phone,
  Play,
  Plus,
  ShoppingBag,
  Soup,
  Sparkles,
  Star,
  Store,
  Trash2,
  Trophy,
  Tv,
  UtensilsCrossed,
  Wine,
  X,
} from "lucide-react";

/* ============================================================
   DADOS DO ESTABELECIMENTO
   ============================================================ */

const BRAND = {
  name: "Ponto da Costela",
  city: "Recife",
  slogan: "Costela na brasa, churrasco raiz e petiscos de respeito",
  address: "R. João Liberato, 201 - Arruda, Recife - PE",
  street: "R. João Liberato, 201",
  district: "Arruda, Recife - PE",
  cep: "52120-070",
  whatsappDisplay: "(81) 99950-2765",
  whatsappNumber: "5581999502765",
  instagram: "pontodacostelarecife",
  followers: "42k+",
  rating: "4.7",
};

const WHATSAPP_DEFAULT_URL =
  "https://wa.me/5581999502765?text=Ol%C3%A1,%20gostaria%20de%20fazer%20um%20pedido/reserva%20no%20Ponto%20da%20Costela!";
const WHATSAPP_RESERVA_URL = `https://wa.me/${BRAND.whatsappNumber}?text=${encodeURIComponent(
  "Olá! Gostaria de reservar uma mesa no Ponto da Costela. 🔥"
)}`;
const INSTAGRAM_URL = `https://www.instagram.com/${BRAND.instagram}/`;
const MAPS_QUERY = encodeURIComponent(`${BRAND.address}, ${BRAND.cep}`);
const GOOGLE_MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${MAPS_QUERY}`;
const WAZE_URL = `https://waze.com/ul?q=${MAPS_QUERY}&navigate=yes`;
const MAPS_EMBED_URL = `https://www.google.com/maps?q=${MAPS_QUERY}&output=embed`;

/*
  Vídeo de fundo: sobrevoo de drone pela fachada e salão do Ponto da Costela.
  Arquivos em public/videos (1080p para telas grandes, 720p para celular).
  Se não carregarem (ex.: código colado no Claude Artifacts sem os arquivos),
  o fundo usa o poster + brasas em canvas.
*/
const LOCAL_VIDEO = {
  large: { src: "videos/ponto-da-costela-1080.mp4", type: "video/mp4" },
  small: { src: "videos/ponto-da-costela-720.mp4", type: "video/mp4" },
  // Para navegadores sem H.264 (ex.: Chromium de código aberto)
  webm: { src: "videos/ponto-da-costela-720.webm", type: "video/webm" },
};
const VIDEO_POSTER = "images/poster-fachada.jpg";

const PHOTOS = {
  fachada: "images/poster-fachada.jpg",
  teloes: "images/salao-teloes.jpg",
  mesas: "images/salao-mesas.jpg",
};

function getVideoSources() {
  const isSmall = typeof window !== "undefined" && window.innerWidth < 768;
  const local = isSmall ? [LOCAL_VIDEO.small, LOCAL_VIDEO.large] : [LOCAL_VIDEO.large, LOCAL_VIDEO.small];
  return [...local, LOCAL_VIDEO.webm];
}

/*
  Fotos reais dos pratos: salve em public/images/pratos/ e mapeie aqui pelo id do item,
  ex.: "pf-picanha": "images/pratos/picanha.jpg". Sem foto, o card usa a arte padrão da casa.
*/
const DISH_PHOTOS = {};

/* ============================================================
   CARDÁPIO OFICIAL (transcrito do cardápio impresso da casa)
   - variants: tamanhos/porções com preço próprio (ex.: 500g / 1kg, dose / litro)
   - options: escolhas sem custo extra (sabor, feijão, arroz, ponto da carne…)
   ============================================================ */

const CATEGORIES = [
  { id: "todos", label: "Todos", icon: LayoutGrid },
  { id: "pratos-feitos", label: "Pratos Feitos", icon: UtensilsCrossed },
  { id: "chapas", label: "Chapas Especiais", icon: Flame },
  { id: "completos", label: "Pratos Completos", icon: ChefHat },
  { id: "sem-alcool", label: "Sem Álcool", icon: CupSoda },
  { id: "cervejas", label: "Cervejas", icon: Beer },
  { id: "destilados", label: "Vinhos & Destilados", icon: Wine },
  { id: "whisky", label: "Whisky", icon: GlassWater },
];

// Categorias exibidas em lista compacta (sem foto)
const COMPACT_CATEGORIES = new Set(["sem-alcool", "cervejas", "destilados", "whisky"]);

/* Grupos de opções reutilizáveis */
const OPT_FEIJAO = { id: "feijao", label: "Feijão", choices: ["Mulato", "Tropeiro", "Macassar"] };
const OPT_ARROZ = { id: "arroz", label: "Arroz", choices: ["Branco", "Carioca"] };
const OPT_PURE_BATATA = { id: "acomp", label: "Acompanhamento", choices: ["Purê", "Batata frita"] };
const OPT_PONTO = { id: "ponto", label: "Ponto da carne", choices: ["Mal passada", "Ao ponto", "Bem passada"] };
const OPT_ARROZ_OPCIONAL = { id: "arroz", label: "Arroz", choices: ["Com arroz", "Sem arroz"] };
const OPT_SUCO = { id: "sabor", label: "Sabor", choices: ["Cajá", "Graviola", "Cupuaçu", "Limão"] };
const OPT_REFRI = { id: "sabor", label: "Sabor", choices: ["Coca-Cola", "Guaraná Antarctica", "Fanta", "Sprite"] };

const PF_COMPLETO = "Feijão mulato, tropeiro ou macassar; arroz branco ou carioca, macarrão, farofa, vinagrete, purê ou batata frita.";
const COMPLETO_DESC = "Feijão mulato, tropeiro ou macassar; arroz branco ou carioca, macarrão, purê ou batata frita, farofa e vinagrete.";
const CHAPA_ESPECIAL_DESC = "Macaxeira na manteiga, batata frita com cheddar, bacon e pimenta de cheiro.";
const PARMEGIANA_DESC = (proteina) =>
  `Macarrão, molho de tomate, queijo muçarela, ${proteina} empanado, purê, queijo ralado e orégano.`;
const OPTS_PF = [OPT_FEIJAO, OPT_ARROZ, OPT_PURE_BATATA];

const g500kg = (p500, p1k) => [
  { id: "500g", label: "500g", price: p500 },
  { id: "1kg", label: "1kg", price: p1k },
];
const doseLitro = (dose, litro) => [
  { id: "dose", label: "Dose", price: dose },
  { id: "litro", label: "Litro", price: litro },
];

const MENU = [
  /* ---------- PRATOS FEITOS ---------- */
  {
    id: "pf-costela",
    category: "pratos-feitos",
    name: "Costela",
    description: "Arroz branco, pirão e vinagrete.",
    price: 25,
    popular: true,
    emoji: "🥩",
  },
  {
    id: "pf-arrumadinho-charque",
    category: "pratos-feitos",
    name: "Arrumadinho de Charque",
    description: "Feijão macassar, vinagrete, farofa, charque e arroz (opcional).",
    price: 26,
    options: [OPT_ARROZ_OPCIONAL],
    emoji: "🫘",
  },
  {
    id: "pf-arrumadinho-carne-sol",
    category: "pratos-feitos",
    name: "Arrumadinho de Carne de Sol",
    description: "Feijão macassar, vinagrete, farofa, carne de sol e arroz (opcional).",
    price: 27,
    options: [OPT_ARROZ_OPCIONAL],
    emoji: "🫘",
  },
  {
    id: "pf-camarao-parmegiana",
    category: "pratos-feitos",
    name: "Camarão à Parmegiana",
    description: PARMEGIANA_DESC("filé de camarão"),
    price: 28,
    emoji: "🦐",
  },
  {
    id: "pf-file-parmegiana",
    category: "pratos-feitos",
    name: "Filé à Parmegiana",
    description: PARMEGIANA_DESC("filé"),
    price: 28,
    emoji: "🍝",
  },
  {
    id: "pf-frango-parmegiana",
    category: "pratos-feitos",
    name: "Frango à Parmegiana",
    description: PARMEGIANA_DESC("filé de frango"),
    price: 26,
    emoji: "🍗",
  },
  {
    id: "pf-cupim-molho",
    category: "pratos-feitos",
    name: "Cupim ao Molho",
    description: PF_COMPLETO,
    price: 27,
    options: OPTS_PF,
    emoji: "🍖",
  },
  {
    id: "pf-cupim-assado",
    category: "pratos-feitos",
    name: "Cupim Assado",
    description: PF_COMPLETO,
    price: 27,
    options: OPTS_PF,
    emoji: "🍖",
  },
  {
    id: "pf-carne-de-sol",
    category: "pratos-feitos",
    name: "Carne de Sol",
    description: PF_COMPLETO,
    price: 27,
    options: OPTS_PF,
    emoji: "🥩",
  },
  {
    id: "pf-frango-empanado",
    category: "pratos-feitos",
    name: "Frango Empanado",
    description: PF_COMPLETO,
    price: 25,
    options: OPTS_PF,
    emoji: "🍗",
  },
  {
    id: "pf-galeto",
    category: "pratos-feitos",
    name: "Galeto",
    description: PF_COMPLETO,
    price: 27,
    options: OPTS_PF,
    emoji: "🍗",
  },
  {
    id: "pf-maminha",
    category: "pratos-feitos",
    name: "Maminha",
    description: PF_COMPLETO,
    price: 36,
    options: [...OPTS_PF, OPT_PONTO],
    emoji: "🥩",
  },
  {
    id: "pf-picanha",
    category: "pratos-feitos",
    name: "Picanha",
    description: PF_COMPLETO,
    price: 39,
    popular: true,
    options: [...OPTS_PF, OPT_PONTO],
    emoji: "🥩",
  },
  {
    id: "pf-caldeirada",
    category: "pratos-feitos",
    name: "Caldeirada",
    description: "Arroz, pirão e caldeirada.",
    price: 30,
    emoji: "🍲",
  },

  /* ---------- CHAPAS ESPECIAIS ---------- */
  {
    id: "chapa-costela-bafo",
    category: "chapas",
    name: "Costela no Bafo 1kg",
    description: CHAPA_ESPECIAL_DESC,
    price: 105,
    serves: "1kg",
    popular: true,
    emoji: "🥩",
  },
  {
    id: "chapa-cupim",
    category: "chapas",
    name: "Cupim na Chapa",
    description:
      "Arroz branco ou carioca, feijão mulatinho, macassar ou tropeiro, macarrão, purê ou batata frita, vinagrete e farofa.",
    variants: [
      { id: "500g", label: "500g", price: 65 },
      { id: "1kg", label: "1kg", price: 90 },
    ],
    options: [OPT_ARROZ, { ...OPT_FEIJAO, choices: ["Mulatinho", "Macassar", "Tropeiro"] }, OPT_PURE_BATATA],
    emoji: "🍖",
  },
  {
    id: "chapa-maminha",
    category: "chapas",
    name: "Maminha na Chapa 1kg",
    description: CHAPA_ESPECIAL_DESC,
    price: 165,
    serves: "1kg",
    options: [OPT_PONTO],
    emoji: "🥩",
  },
  {
    id: "chapa-picanha",
    category: "chapas",
    name: "Picanha na Chapa 1kg",
    description: CHAPA_ESPECIAL_DESC,
    price: 185,
    serves: "1kg",
    options: [OPT_PONTO],
    emoji: "🔥",
  },

  /* ---------- PRATOS COMPLETOS ---------- */
  {
    id: "comp-arrumadinho-charque",
    category: "completos",
    name: "Arrumadinho de Charque",
    description: "Para 2 pessoas. Feijão macassar, vinagrete, farofa, charque e arroz (opcional).",
    price: 42,
    serves: "2 pessoas",
    options: [OPT_ARROZ_OPCIONAL],
    emoji: "🫘",
  },
  {
    id: "comp-arrumadinho-carne-sol",
    category: "completos",
    name: "Arrumadinho de Carne de Sol",
    description: "Para 2 pessoas. Feijão macassar, vinagrete, farofa, carne de sol e arroz (opcional).",
    price: 45,
    serves: "2 pessoas",
    options: [OPT_ARROZ_OPCIONAL],
    emoji: "🫘",
  },
  {
    id: "comp-carne-sol-queijo",
    category: "completos",
    name: "Carne de Sol na Chapa c/ Queijo Coalho",
    description: COMPLETO_DESC,
    variants: g500kg(100, 150),
    options: OPTS_PF,
    popular: true,
    emoji: "🧀",
  },
  {
    id: "comp-costela-bovina-bafo",
    category: "completos",
    name: "Costela Bovina no Bafo",
    description: COMPLETO_DESC,
    variants: g500kg(70, 100),
    options: OPTS_PF,
    popular: true,
    emoji: "🥩",
  },
  {
    id: "comp-costela-suina-bafo",
    category: "completos",
    name: "Costela Suína no Bafo",
    description: COMPLETO_DESC,
    variants: g500kg(70, 100),
    options: OPTS_PF,
    emoji: "🍖",
  },
  {
    id: "comp-feijoada",
    category: "completos",
    name: "Feijoada",
    description: "Acompanha arroz, farofa e vinagrete.",
    variants: [
      { id: "meio-litro", label: "1/2 litro", price: 42 },
      { id: "litro", label: "1 litro", price: 65 },
    ],
    emoji: "🍲",
  },
  {
    id: "comp-fraldinha",
    category: "completos",
    name: "Fraldinha",
    description: COMPLETO_DESC,
    variants: g500kg(85, 115),
    options: [...OPTS_PF, OPT_PONTO],
    emoji: "🥩",
  },
  {
    id: "comp-galeto",
    category: "completos",
    name: "Galeto Completo",
    description: COMPLETO_DESC,
    price: 65,
    options: OPTS_PF,
    emoji: "🍗",
  },
  {
    id: "comp-maminha",
    category: "completos",
    name: "Maminha",
    description: COMPLETO_DESC,
    variants: g500kg(110, 160),
    options: [...OPTS_PF, OPT_PONTO],
    emoji: "🥩",
  },
  {
    id: "comp-picanha",
    category: "completos",
    name: "Picanha",
    description: COMPLETO_DESC,
    variants: g500kg(125, 180),
    options: [...OPTS_PF, OPT_PONTO],
    emoji: "🔥",
  },

  /* ---------- BEBIDAS NÃO ALCOÓLICAS ---------- */
  { id: "agua-sem-gas", category: "sem-alcool", name: "Água sem Gás", price: 3, emoji: "💧" },
  { id: "agua-com-gas", category: "sem-alcool", name: "Água com Gás", price: 5, emoji: "💧" },
  { id: "agua-tonica", category: "sem-alcool", name: "Água Tônica", price: 6, emoji: "🫧" },
  {
    id: "agua-de-coco",
    category: "sem-alcool",
    name: "Água de Coco",
    variants: [
      { id: "copo", label: "Copo", price: 6 },
      { id: "jarra", label: "Jarra", price: 18 },
    ],
    emoji: "🥥",
  },
  {
    id: "h2o",
    category: "sem-alcool",
    name: "H2O",
    price: 7,
    options: [{ id: "sabor", label: "Sabor", choices: ["Limão", "Limoneto"] }],
    emoji: "🍋",
  },
  {
    id: "monster",
    category: "sem-alcool",
    name: "Monster",
    variants: [
      { id: "265ml", label: "265ml", price: 12 },
      { id: "365ml", label: "365ml", price: 17 },
    ],
    emoji: "⚡",
  },
  { id: "red-bull", category: "sem-alcool", name: "Red Bull", price: 15, emoji: "⚡" },
  { id: "refri-ks", category: "sem-alcool", name: "Refrigerante KS Coca-Cola", price: 5, emoji: "🥤" },
  {
    id: "refrigerante",
    category: "sem-alcool",
    name: "Refrigerante",
    description: "Coca-Cola, Guaraná Antarctica, Fanta ou Sprite.",
    variants: [
      { id: "lata", label: "Lata", price: 7.5 },
      { id: "1l", label: "1 litro", price: 12 },
    ],
    options: [OPT_REFRI],
    emoji: "🥤",
  },
  {
    id: "suco",
    category: "sem-alcool",
    name: "Suco",
    description: "Cajá, graviola, cupuaçu ou limão.",
    variants: [
      { id: "copo", label: "Copo 300ml", price: 7 },
      { id: "jarra", label: "Jarra", price: 16 },
    ],
    options: [OPT_SUCO],
    emoji: "🧃",
  },

  /* ---------- CERVEJAS ---------- */
  { id: "brahma-600", category: "cervejas", name: "Brahma 600ml", price: 13, popular: true, emoji: "🍺" },
  { id: "heineken-600", category: "cervejas", name: "Heineken 600ml", price: 16, emoji: "🍺" },
  { id: "amstel-600", category: "cervejas", name: "Amstel 600ml", price: 14, emoji: "🍺" },
  { id: "petra-600", category: "cervejas", name: "Petra 600ml", price: 10, emoji: "🍺" },
  { id: "eisenbahn-600", category: "cervejas", name: "Eisenbahn 600ml", price: 14, emoji: "🍺" },
  { id: "heineken-ln", category: "cervejas", name: "Heineken Long Neck", price: 11, emoji: "🍾" },
  { id: "heineken-zero-ln", category: "cervejas", name: "Heineken Zero Long Neck", price: 11, emoji: "🍾" },

  /* ---------- VINHOS & DESTILADOS ---------- */
  { id: "vinho-quinta-morgado", category: "destilados", name: "Vinho Quinta do Morgado 750ml", price: 25, emoji: "🍷" },
  { id: "vinho-pergola", category: "destilados", name: "Vinho Pérgola 1 litro", price: 35, emoji: "🍷" },
  { id: "gin-tanqueray", category: "destilados", name: "Gin Tanqueray", variants: doseLitro(15, 100), emoji: "🍸" },
  { id: "vodka-orloff", category: "destilados", name: "Vodka Orloff", variants: doseLitro(7, 70), emoji: "🍸" },
  { id: "vodka-smirnoff", category: "destilados", name: "Vodka Smirnoff", variants: doseLitro(9, 90), emoji: "🍸" },

  /* ---------- WHISKY ---------- */
  { id: "black-white", category: "whisky", name: "Black & White", variants: doseLitro(9, 100), emoji: "🥃" },
  { id: "old-parr", category: "whisky", name: "Old Parr", variants: doseLitro(16, 230), emoji: "🥃" },
  { id: "johnnie-walker", category: "whisky", name: "Johnnie Walker", variants: doseLitro(11, 155), emoji: "🥃" },
  { id: "white-horse", category: "whisky", name: "White Horse", variants: doseLitro(10, 140), emoji: "🥃" },
];

MENU.forEach((item) => {
  if (DISH_PHOTOS[item.id]) item.image = DISH_PHOTOS[item.id];
});

const MENU_BY_ID = Object.fromEntries(MENU.map((item) => [item.id, item]));

const needsChoice = (item) => Boolean(item.variants?.length || item.options?.length);
const minPrice = (item) => (item.variants ? Math.min(...item.variants.map((v) => v.price)) : item.price);

const HIGHLIGHTS = [
  {
    itemId: "chapa-costela-bafo",
    title: "Costela no Bafo",
    text: "Um quilo de costela desmanchando, com macaxeira na manteiga e batata frita com cheddar, bacon e pimenta de cheiro.",
    tag: "Estrela da casa",
    icon: Flame,
    featured: true,
  },
  {
    itemId: "comp-carne-sol-queijo",
    title: "Carne de Sol na Chapa c/ Queijo Coalho",
    text: "O clássico nordestino na chapa, servido completo. 500g ou 1kg.",
    tag: "Regional",
    icon: ChefHat,
  },
  {
    itemId: "comp-picanha",
    title: "Picanha Completa",
    text: "Picanha no ponto que você escolher, com feijão, arroz, macarrão, farofa e vinagrete.",
    tag: "Na brasa",
    icon: Beef,
  },
  {
    itemId: "pf-arrumadinho-charque",
    title: "Arrumadinho de Charque",
    text: "Feijão macassar, charque, farofa e vinagrete. Pernambuco no prato.",
    tag: "Pernambucano",
    icon: Soup,
  },
  {
    itemId: "comp-feijoada",
    title: "Feijoada",
    text: "Encorpada, com arroz, farofa e vinagrete. Meio litro ou um litro.",
    tag: "Pra dividir",
    icon: UtensilsCrossed,
  },
];

/* ============================================================
   HORÁRIOS (minutos a partir de 00:00; >1440 = madrugada seguinte)
   Índice = Date.getDay() → 0 domingo … 6 sábado
   ============================================================ */

const HOURS = [
  { day: "Domingo", open: 11 * 60, close: 24 * 60, note: "Almoço em família" },
  { day: "Segunda", open: 17 * 60, close: 24 * 60 },
  { day: "Terça", open: 17 * 60, close: 24 * 60 },
  { day: "Quarta", open: 17 * 60, close: 24 * 60, note: "Noite de futebol" },
  { day: "Quinta", open: 17 * 60, close: 24 * 60 },
  { day: "Sexta", open: 11 * 60, close: 25 * 60, note: "Até 01h" },
  { day: "Sábado", open: 11 * 60, close: 25 * 60, note: "Até 01h" },
];

const WEEKDAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function formatHour(minutes) {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}h${m ? String(m).padStart(2, "0") : ""}`;
}

function getRecifeNow() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Recife",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (type) => parts.find((p) => p.type === type)?.value;
  return {
    day: WEEKDAY_INDEX[get("weekday")] ?? new Date().getDay(),
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

function getOpenStatus() {
  const { day, minutes } = getRecifeNow();
  const today = HOURS[day];
  const yesterday = HOURS[(day + 6) % 7];
  const openFromYesterday = minutes + 1440 < yesterday.close;
  const openToday = minutes >= today.open && minutes < today.close;
  if (openFromYesterday) return { day, isOpen: true, closesAt: yesterday.close, today };
  if (openToday) return { day, isOpen: true, closesAt: today.close, today };
  return { day, isOpen: false, opensAt: minutes < today.open ? today.open : null, today };
}

/* ============================================================
   UTILITÁRIOS
   ============================================================ */

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const money = (value) => brl.format(value);

/*
  Carrinho: cada linha é um item + tamanho + opções escolhidas.
  { [chave]: { itemId, variantId, options: { feijao: "Tropeiro", … }, qty } }
*/
const CART_KEY = "ponto-da-costela:cart:v2";

function makeLineKey(itemId, variantId = "", options = {}) {
  const opts = Object.keys(options)
    .sort()
    .map((key) => `${key}=${options[key]}`);
  return [itemId, variantId, ...opts].join("|");
}

function getVariant(item, variantId) {
  return item.variants?.find((v) => v.id === variantId);
}

function linePrice(line) {
  const item = MENU_BY_ID[line.itemId];
  if (!item) return 0;
  return item.variants ? getVariant(item, line.variantId)?.price ?? 0 : item.price;
}

function lineTitle(line) {
  const item = MENU_BY_ID[line.itemId];
  const variant = item && getVariant(item, line.variantId);
  return variant ? `${item.name} (${variant.label})` : item?.name ?? "";
}

function lineDetails(line) {
  const item = MENU_BY_ID[line.itemId];
  if (!item?.options) return [];
  return item.options
    .filter((opt) => line.options?.[opt.id])
    .map((opt) => `${opt.label}: ${line.options[opt.id]}`);
}

function isValidLine(line) {
  const item = line && MENU_BY_ID[line.itemId];
  if (!item || !(line.qty > 0)) return false;
  if (item.variants && !getVariant(item, line.variantId)) return false;
  return (item.options ?? []).every((opt) => opt.choices.includes(line.options?.[opt.id]));
}

function loadCart() {
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return Object.fromEntries(Object.entries(parsed).filter(([, line]) => isValidLine(line)));
  } catch {
    return {};
  }
}

function saveCart(cart) {
  try {
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {
    /* armazenamento indisponível: carrinho segue só em memória */
  }
}

function prefersReducedMotion() {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

function WhatsAppIcon({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.57.94.95-3.48-.22-.36a9.38 9.38 0 0 1-1.44-5.01c0-5.19 4.23-9.42 9.43-9.42 2.52 0 4.88.98 6.66 2.76a9.36 9.36 0 0 1 2.76 6.67c0 5.2-4.23 9.42-9.42 9.42m8.02-17.44A11.26 11.26 0 0 0 12.05.75C5.8.75.72 5.83.72 12.08c0 2 .52 3.95 1.52 5.66L.62 23.62l6.01-1.58a11.3 11.3 0 0 0 5.41 1.38h.01c6.25 0 11.33-5.08 11.33-11.33 0-3.03-1.18-5.87-3.32-8.02" />
    </svg>
  );
}

function InstagramIcon({ className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

/* ============================================================
   ESTILO: TOKENS DE CLASSE REUTILIZÁVEIS
   ============================================================ */

const BTN_GOLD =
  "inline-flex items-center justify-center gap-2 rounded-full bg-[#e6b95c] px-6 py-3 font-display text-[15px] font-semibold text-[#141210] shadow-lg shadow-[#e6b95c]/20 transition hover:bg-[#f0c977] active:scale-[0.98]";
const BTN_OUTLINE =
  "inline-flex items-center justify-center gap-2 rounded-full border border-[#e6b95c]/70 px-5 py-2.5 font-display text-[15px] text-[#e6b95c] transition hover:bg-[#e6b95c]/10 active:scale-[0.98]";
const BTN_OUTLINE_DARK =
  "inline-flex items-center justify-center gap-2 rounded-full border border-[#1a1714]/40 px-5 py-2.5 font-display text-[15px] text-[#1a1714] transition hover:bg-[#1a1714]/5 active:scale-[0.98]";

/* ============================================================
   CAMADA DE FUNDO: VÍDEO + BRASAS EM CANVAS (FALLBACK)
   ============================================================ */

function EmberCanvas({ active }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return undefined;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    let width = 0;
    let height = 0;
    let frame = 0;
    let particles = [];
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const spawn = (initial = false) => ({
      x: Math.random() * width,
      y: initial ? Math.random() * height : height + Math.random() * 40,
      r: Math.random() * 1.8 + 0.6,
      vy: Math.random() * 0.7 + 0.35,
      vx: (Math.random() - 0.5) * 0.3,
      sway: Math.random() * Math.PI * 2,
      life: Math.random() * 0.5 + 0.5,
      hue: 18 + Math.random() * 25,
    });

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = width < 640 ? 28 : 60;
      particles = Array.from({ length: count }, () => spawn(true));
    };

    const tick = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        p.sway += 0.02;
        p.y -= p.vy;
        p.x += p.vx + Math.sin(p.sway) * 0.25;
        const fade = Math.max(0, Math.min(1, p.y / height)) * p.life;
        if (p.y < -10 || fade <= 0.02) {
          particles[i] = spawn();
          continue;
        }
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        glow.addColorStop(0, `hsla(${p.hue}, 100%, 65%, ${fade})`);
        glow.addColorStop(1, `hsla(${p.hue}, 100%, 50%, 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        ctx.fill();
      }
      frame = window.requestAnimationFrame(tick);
    };

    const onVisibility = () => {
      window.cancelAnimationFrame(frame);
      if (!document.hidden) frame = window.requestAnimationFrame(tick);
    };

    resize();
    frame = window.requestAnimationFrame(tick);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      ctx.clearRect(0, 0, width, height);
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`absolute inset-0 transition-opacity duration-700 ${active ? "opacity-80" : "opacity-0"}`}
    />
  );
}

function BackgroundVideo({ videoRef, playing, focusMode, onAllSourcesFailed, videoFailed }) {
  const failures = useRef(0);
  const sources = useMemo(getVideoSources, []);

  const handleSourceError = () => {
    failures.current += 1;
    if (failures.current >= sources.length) onAllSourcesFailed();
  };

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* Base quente caso poster e vídeo falhem */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,#5a2a0c_0%,#1c140e_45%,#0f0f11_80%)]" />
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${VIDEO_POSTER})` }}
      />
      {!videoFailed && (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster={VIDEO_POSTER}
          disablePictureInPicture
          className={`absolute inset-0 h-full w-full transform-gpu object-cover will-change-transform [filter:sepia(.12)_saturate(1.05)_brightness(.95)] transition-opacity duration-700 ${
            playing ? "opacity-100" : "opacity-80"
          }`}
        >
          {sources.map((source) => (
            <source key={source.src} src={source.src} type={source.type} onError={handleSourceError} />
          ))}
        </video>
      )}
      {/* Tom quente de luz de brasa sobre o vídeo */}
      <div className="absolute inset-0 bg-[#3b1a06]/20 mix-blend-multiply" />
      {/* Overlay leve (sem desfoque) + sombra suave no centro para o texto continuar legível */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-[#0f0f11]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.4)_0%,transparent_65%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(ellipse_at_bottom,rgba(234,88,12,0.18)_0%,transparent_70%)]" />
      <EmberCanvas active={videoFailed && !focusMode} />
    </div>
  );
}

/* ============================================================
   COMPONENTES DE UI
   ============================================================ */

function FoodImage({ src, alt, emoji, className = "" }) {
  const [failed, setFailed] = useState(false);
  if (failed || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`relative flex items-center justify-center overflow-hidden bg-[#141211] ${className}`}
      >
        {/* Grelha estilizada + brilho de brasa */}
        <span className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent_0_22px,rgba(230,185,92,0.07)_22px_24px)]" />
        <span className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_85%,rgba(234,88,12,0.35),transparent_60%)]" />
        <span className="relative flex aspect-square h-[62%] max-h-28 items-center justify-center rounded-full border border-[#e6b95c]/50 bg-black/40 text-[2.5em] shadow-[0_0_40px_-8px_rgba(234,88,12,0.6)]">
          <span aria-hidden="true">{emoji}</span>
        </span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}

function Ornament({ className = "" }) {
  return (
    <span className={`flex items-center justify-center gap-3 ${className}`} aria-hidden="true">
      <span className="h-px w-10 bg-gradient-to-r from-transparent to-current" />
      <Flame className="h-3.5 w-3.5" />
      <span className="h-px w-10 bg-gradient-to-l from-transparent to-current" />
    </span>
  );
}

function SectionTitle({ script, title, subtitle, light = false, align = "center" }) {
  const centered = align === "center";
  return (
    <div className={`mb-10 max-w-2xl md:mb-14 ${centered ? "mx-auto text-center" : ""}`}>
      {script && (
        <p className={`font-script text-3xl md:text-4xl ${light ? "text-[#a0712a]" : "text-[#e6b95c]"}`}>{script}</p>
      )}
      <h2
        className={`mt-1 font-display text-4xl leading-tight font-medium md:text-6xl ${
          light ? "text-[#1a1714]" : "text-[#f3e3bf]"
        }`}
      >
        {title}
      </h2>
      {centered && <Ornament className={`mt-5 ${light ? "text-[#a0712a]" : "text-[#e6b95c]/70"}`} />}
      {subtitle && (
        <p className={`mt-5 text-base leading-relaxed md:text-lg ${light ? "text-[#5c5247]" : "text-zinc-400"}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

const LOGO_SRC = "brand/logo-ponto-da-costela.png";

/* Logo oficial (fundo transparente). Se o arquivo não carregar, mostra um selo "P&C". */
function BrandLogo({ className = "h-12 w-12" }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span
        className={`relative flex shrink-0 items-center justify-center rounded-full border-2 border-[#e6b95c] text-[#e6b95c] ${className}`}
      >
        <span className="font-display text-lg leading-none font-semibold italic">
          P<span className="text-[0.7em] not-italic">&amp;</span>C
        </span>
        <Flame className="flame-flicker absolute -top-2 h-3.5 w-3.5 rounded-full bg-[#0f0f11] px-0.5 text-[#ea580c]" />
      </span>
    );
  }
  return (
    <img
      src={LOGO_SRC}
      alt="Logo Ponto da Costela"
      width="512"
      height="512"
      decoding="async"
      onError={() => setFailed(true)}
      className={`shrink-0 rounded-full object-contain shadow-lg shadow-black/40 ring-2 ring-[#e6b95c]/70 ${className}`}
    />
  );
}

function Logo() {
  return (
    <a href="#inicio" className="group flex items-center gap-3" aria-label="Ponto da Costela - início">
      <BrandLogo className="h-12 w-12 transition-transform group-hover:scale-105" />
      <span className="leading-none">
        <span className="block font-display text-lg font-semibold text-[#f3e3bf]">Ponto da Costela</span>
        <span className="mt-1 block text-[10px] font-semibold tracking-[0.3em] text-[#e6b95c]/80 uppercase">
          Recife · Arruda
        </span>
      </span>
    </a>
  );
}

const NAV_LINKS = [
  { href: "#inicio", label: "Início" },
  { href: "#destaques", label: "Destaques da Brasa" },
  { href: "#cardapio", label: "Cardápio" },
  { href: "#horarios", label: "Horários" },
  { href: "#localizacao", label: "Localização" },
];

function AnnouncementBar({ status }) {
  const message = status.isOpen
    ? `🔥 Aberto hoje no Arruda até ${formatHour(status.closesAt)}! Venha provar a melhor costela na brasa do Recife!`
    : status.opensAt
      ? `🔥 Hoje abrimos às ${formatHour(status.opensAt)} no Arruda! Venha provar a melhor costela na brasa do Recife!`
      : "🔥 Já fechamos por hoje — amanhã tem mais costela na brasa no Arruda! Faça sua reserva.";

  return (
    <div className="relative z-50 border-b border-[#e6b95c]/20 bg-gradient-to-r from-[#1a0c06] via-[#3a1408] to-[#1a0c06] text-[#f3e3bf]">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 py-2 text-center text-xs font-medium sm:text-sm">
        <p className="line-clamp-2">{message}</p>
        <a
          href="#cardapio"
          className="shrink-0 rounded-full border border-[#e6b95c]/60 px-3 py-1 text-xs font-semibold whitespace-nowrap text-[#e6b95c] transition hover:bg-[#e6b95c]/10 active:scale-95"
        >
          Ver Cardápio
        </a>
      </div>
    </div>
  );
}

function Navbar({ cartCount, onOpenCart }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/40 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Logo />
        <ul className="hidden items-center gap-1 xl:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="rounded-full px-3 py-2 text-sm text-zinc-300 transition hover:text-[#e6b95c]"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="hidden items-center gap-5 text-xs text-zinc-400 lg:flex xl:hidden">
          <a href={`tel:+${BRAND.whatsappNumber}`} className="flex items-center gap-2 hover:text-[#e6b95c]">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e6b95c]/50 text-[#e6b95c]">
              <Phone className="h-3.5 w-3.5" />
            </span>
            <span className="leading-tight">
              Ligue
              <span className="block font-display text-sm text-[#f3e3bf]">{BRAND.whatsappDisplay}</span>
            </span>
          </a>
          <a href="#localizacao" className="flex items-center gap-2 hover:text-[#e6b95c]">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e6b95c]/50 text-[#e6b95c]">
              <MapPin className="h-3.5 w-3.5" />
            </span>
            <span className="leading-tight">
              {BRAND.street}
              <span className="block">{BRAND.district}</span>
            </span>
          </a>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 xl:flex">
            <a href="#cardapio" className={BTN_OUTLINE}>
              <ArrowRight className="h-4 w-4" />
              Ver Cardápio
            </a>
          </div>
          <div className="hidden items-center md:flex">
            <a
              href={WHATSAPP_DEFAULT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`${BTN_GOLD} !px-5 !py-2.5`}
            >
              <WhatsAppIcon className="h-4 w-4" />
              Pedir / Reservar no WhatsApp
            </a>
          </div>
          <button
            type="button"
            onClick={onOpenCart}
            className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[#e6b95c]/50 text-[#e6b95c] transition hover:bg-[#e6b95c]/10 active:scale-95"
            aria-label={`Abrir pedido (${cartCount} itens)`}
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ea580c] px-1 text-[11px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white xl:hidden"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>
      {open && (
        <div className="border-t border-white/10 bg-black/85 backdrop-blur-md xl:hidden">
          <ul className="mx-auto flex max-w-7xl flex-col px-4 py-3">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-lg px-3 py-3.5 font-display text-lg text-[#f3e3bf] active:bg-white/10"
                >
                  {link.label}
                  <ChevronRight className="h-4 w-4 text-[#e6b95c]/60" />
                </a>
              </li>
            ))}
            <li className="pt-2 md:hidden">
              <a
                href={WHATSAPP_DEFAULT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`${BTN_GOLD} w-full`}
              >
                <WhatsAppIcon className="h-5 w-5" />
                Pedir / Reservar no WhatsApp
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}

function HoursStrip({ status }) {
  return (
    <div className="mt-14 w-full">
      <p className="font-script text-3xl text-[#f3e3bf]">Horário de funcionamento</p>
      <ul className="mt-5 grid grid-cols-4 gap-x-2 gap-y-4 sm:grid-cols-7">
        {HOURS.map((row, index) => {
          const isToday = index === status.day;
          return (
            <li
              key={row.day}
              className={`rounded-xl px-1 py-2 ${isToday ? "bg-[#e6b95c]/10 ring-1 ring-[#e6b95c]/40" : ""}`}
            >
              <p className="font-display text-sm text-[#e6b95c]">{row.day}</p>
              <p className="mt-1 text-[11px] whitespace-nowrap text-zinc-300 sm:text-xs">
                {formatHour(row.open)} – {formatHour(row.close)}
              </p>
              {isToday && <p className="mt-0.5 text-[10px] tracking-widest text-[#ea580c] uppercase">Hoje</p>}
            </li>
          );
        })}
      </ul>
      <p className="mt-5 text-xs text-zinc-400">
        Reservas para grupos e comemorações pelo WhatsApp ·{" "}
        <span className="text-[#e6b95c]">{status.isOpen ? `aberto agora até ${formatHour(status.closesAt)}` : "fechado agora"}</span>
      </p>
    </div>
  );
}

function Hero({ status }) {
  const badges = [
    { icon: Star, label: `${BRAND.rating} no Google Reviews`, fill: true },
    { icon: Beef, label: `+${BRAND.followers.replace("+", "")} seguidores apaixonados por churrasco` },
    { icon: Beer, label: "Cerveja Estupidamente Gelada" },
  ];

  return (
    <section id="inicio" className="relative flex min-h-[calc(100svh-7rem)] scroll-mt-24 items-center">
      <div className="text-shadow-hero mx-auto flex w-full max-w-5xl flex-col items-center px-4 pt-16 pb-12 text-center sm:px-6 md:pt-24">
        <BrandLogo className="mb-6 h-28 w-28 shadow-2xl ring-4 md:h-36 md:w-36" />
        <p className="font-script text-3xl text-[#e6b95c] md:text-4xl">Churrasco raiz desde o Arruda</p>
        <h1 className="mt-3 font-display text-[2.6rem] leading-[1.05] font-medium text-[#f3e3bf] sm:text-6xl lg:text-7xl">
          O Verdadeiro <em className="text-[#e6b95c]">Churrasco Raiz</em>
          <br className="hidden sm:block" /> no Coração do Arruda
        </h1>
        <Ornament className="mt-6 text-[#e6b95c]/70" />
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-300 md:text-xl">
          Costela no bafo desmanchando, carne de sol na chapa com queijo coalho, prato feito caprichado e aquela cerveja trincando de gelada.
        </p>
        <div className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <a href="#cardapio" className={`${BTN_GOLD} glow-btn px-8 py-4 text-base`}>
            <UtensilsCrossed className="h-5 w-5" />
            Explorar Cardápio
          </a>
          <a
            href={WHATSAPP_DEFAULT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`${BTN_OUTLINE} px-8 py-4 text-base backdrop-blur-md`}
          >
            <WhatsAppIcon className="h-5 w-5" />
            Pedir no WhatsApp / Delivery
          </a>
        </div>
        <ul className="mt-10 flex flex-wrap justify-center gap-2.5">
          {badges.map(({ icon: Icon, label, fill }) => (
            <li
              key={label}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm text-zinc-200 backdrop-blur-md"
            >
              <Icon className="h-4 w-4 text-[#e6b95c]" fill={fill ? "currentColor" : "none"} />
              {label}
            </li>
          ))}
        </ul>
        <HoursStrip status={status} />
        <a
          href="#sobre"
          className="mt-10 hidden flex-col items-center gap-1 text-xs tracking-widest text-zinc-400 uppercase md:flex"
          aria-label="Rolar para conhecer a casa"
        >
          Role para sentir o calor
          <ArrowDown className="h-4 w-4 animate-bounce text-[#e6b95c]" />
        </a>
      </div>
    </section>
  );
}

function AboutSection() {
  const facts = [
    { value: BRAND.rating, label: "estrelas no Google" },
    { value: BRAND.followers, label: "seguidores no Instagram" },
    { value: "00h", label: "brasa acesa até tarde" },
  ];

  return (
    <section id="sobre" className="relative scroll-mt-24 bg-[#f4efe6] py-20 text-[#1a1714] md:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <div className="grid grid-cols-2 grid-rows-2 gap-3">
          <FoodImage
            src={PHOTOS.fachada}
            alt="Fachada do Ponto da Costela na R. João Liberato, Arruda"
            emoji="🏠"
            className="row-span-2 h-full min-h-[320px] w-full rounded-2xl"
          />
          <FoodImage
            src={PHOTOS.teloes}
            alt="Salão do Ponto da Costela com telões"
            emoji="📺"
            className="h-full min-h-[155px] w-full rounded-2xl"
          />
          <FoodImage
            src={PHOTOS.mesas}
            alt="Salão amplo do Ponto da Costela"
            emoji="🪑"
            className="h-full min-h-[155px] w-full rounded-2xl"
          />
        </div>
        <div>
          <SectionTitle
            light
            align="left"
            script="Bem-vindo à nossa casa"
            title="Onde a brasa encontra a tradição"
          />
          <div className="-mt-4 space-y-4 text-lg leading-relaxed text-[#5c5247]">
            <p>
              No coração do Arruda, a costela sai no bafo, desmanchando no osso, e a carne de sol chega chiando na chapa. É comida feita
              sem pressa, com tempero pernambucano e porção que dá gosto de dividir.
            </p>
            <p>
              Salão amplo e arejado, telões para o jogo, cerveja trincando e aquele atendimento de casa cheia.
              Aqui toda mesa vira resenha.
            </p>
          </div>
          <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-[#1a1714]/10 pt-6">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt className="sr-only">{fact.label}</dt>
                <dd className="font-display text-3xl text-[#a0712a] md:text-4xl">{fact.value}</dd>
                <dd className="mt-1 text-xs text-[#5c5247] md:text-sm">{fact.label}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#destaques" className={BTN_OUTLINE_DARK}>
              <ArrowRight className="h-4 w-4" />
              Destaques da Brasa
            </a>
            <a
              href={WHATSAPP_RESERVA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1a1714] px-5 py-2.5 font-display text-[15px] text-[#f3e3bf] transition hover:bg-black active:scale-[0.98]"
            >
              Reservar mesa
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function PriceTag({ item, className = "" }) {
  if (!item.variants) return <span className={className}>{money(item.price)}</span>;
  return (
    <span className={`whitespace-nowrap ${className}`}>
      <span className="mr-1 font-body text-xs text-zinc-500">a partir de</span>
      {money(minPrice(item))}
    </span>
  );
}

function VariantPrices({ item }) {
  if (!item.variants) return null;
  return (
    <ul className="mt-3 flex flex-wrap gap-1.5">
      {item.variants.map((v) => (
        <li key={v.id} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300">
          {v.label} <span className="text-[#e6b95c]">{money(v.price)}</span>
        </li>
      ))}
    </ul>
  );
}

function Highlights({ onChoose }) {
  const [featured, ...others] = HIGHLIGHTS;
  const featuredItem = MENU_BY_ID[featured.itemId];

  return (
    <section id="destaques" className="relative scroll-mt-24 bg-[#0f0f11] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="order-2 lg:order-1">
            <p className="font-script text-3xl text-[#e6b95c] md:text-4xl">Sinta o sabor</p>
            <h2 className="mt-1 font-display text-5xl leading-tight font-medium text-[#f3e3bf] md:text-7xl">
              Destaques da Brasa
            </h2>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-zinc-400">
              A estrela da casa é a <strong className="font-semibold text-[#f3e3bf]">{featured.title}</strong>:{" "}
              {featured.text.charAt(0).toLowerCase() + featured.text.slice(1)}
            </p>
            <p className="mt-6 font-display text-3xl text-[#e6b95c]">
              <PriceTag item={featuredItem} />
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={() => onChoose(featuredItem.id)} className={BTN_GOLD}>
                <Plus className="h-4 w-4" />
                Adicionar ao pedido
              </button>
              <a href="#cardapio" className={BTN_OUTLINE}>
                <ArrowRight className="h-4 w-4" />
                Ver Cardápio
              </a>
            </div>
          </div>
          <div className="relative order-1 mx-auto aspect-square w-full max-w-md lg:order-2">
            <div className="absolute inset-0 rounded-full border border-[#e6b95c]/40" />
            <div className="absolute inset-6 rounded-full border border-[#e6b95c]/15" />
            <div className="absolute inset-[18%] rotate-6 overflow-hidden rounded-3xl shadow-2xl shadow-black/60 ring-4 ring-[#2a2118]">
              <FoodImage
                src={featuredItem.image}
                alt={featured.title}
                emoji={featuredItem.emoji}
                className="h-full w-full scale-110"
              />
            </div>
            <span className="absolute top-[8%] right-[4%] rounded-full bg-[#ea580c] px-3 py-1 text-xs font-semibold tracking-wide text-white uppercase shadow-lg shadow-orange-600/40">
              {featured.tag}
            </span>
          </div>
        </div>

        <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {others.map((highlight) => {
            const item = MENU_BY_ID[highlight.itemId];
            const Icon = highlight.icon;
            return (
              <article
                key={highlight.itemId}
                className="group flex flex-col overflow-hidden rounded-3xl border border-[#e6b95c]/15 bg-[#16140f] transition duration-300 hover:-translate-y-1 hover:border-[#e6b95c]/40"
              >
                <div className="relative h-48 overflow-hidden">
                  <FoodImage
                    src={item.image}
                    alt={highlight.title}
                    emoji={item.emoji}
                    className="h-full w-full transition duration-700 group-hover:scale-105"
                  />
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs text-[#e6b95c] backdrop-blur">
                    <Icon className="h-3.5 w-3.5" />
                    {highlight.tag}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-xl leading-snug text-[#f3e3bf]">{highlight.title}</h3>
                  <span className="mt-3 h-px w-10 bg-[#e6b95c]/50" />
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-400">{highlight.text}</p>
                  <div className="mt-5 flex items-center justify-between gap-3">
                    <PriceTag item={item} className="font-display text-xl text-[#e6b95c]" />
                    <button
                      type="button"
                      onClick={() => onChoose(item.id)}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#e6b95c]/60 text-[#e6b95c] transition hover:bg-[#e6b95c] hover:text-black active:scale-90"
                      aria-label={`Adicionar ${item.name}`}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* Botão de ação do item: stepper para itens simples, "Escolher" para itens com opções */
function ItemAction({ item, cart, onChoose, onChangeQty, compact = false }) {
  if (needsChoice(item)) {
    const inCart = Object.values(cart).reduce((sum, line) => (line.itemId === item.id ? sum + line.qty : sum), 0);
    return (
      <button
        type="button"
        onClick={() => onChoose(item.id)}
        className={`${BTN_OUTLINE} relative ${compact ? "!px-3.5 !py-2 text-sm" : "!px-4 !py-2 text-sm"}`}
      >
        <Plus className="h-4 w-4" />
        Escolher
        {inCart > 0 && (
          <span className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ea580c] px-1 text-[11px] font-bold text-white">
            {inCart}
          </span>
        )}
      </button>
    );
  }
  const key = makeLineKey(item.id);
  const quantity = cart[key]?.qty ?? 0;
  if (quantity > 0) {
    return (
      <div className="flex items-center gap-1 rounded-full border border-[#e6b95c]/50 p-1">
        <button
          type="button"
          onClick={() => onChangeQty(key, -1)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-[#e6b95c] transition hover:bg-white/10 active:scale-90"
          aria-label={`Remover um ${item.name}`}
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-6 text-center font-semibold text-white" aria-live="polite">
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => onChangeQty(key, 1)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e6b95c] text-black active:scale-90"
          aria-label={`Adicionar mais um ${item.name}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={() => onChoose(item.id)}
      className={`${BTN_OUTLINE} ${compact ? "!px-3.5 !py-2 text-sm" : "!px-4 !py-2 text-sm"}`}
    >
      <Plus className="h-4 w-4" />
      Adicionar
    </button>
  );
}

function MenuCard({ item, cart, onChoose, onChangeQty }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#18181b] transition duration-300 hover:border-[#e6b95c]/40 hover:shadow-xl hover:shadow-black/40">
      <div className="relative h-44 overflow-hidden">
        <FoodImage
          src={item.image}
          alt={item.name}
          emoji={item.emoji}
          className="h-full w-full transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#18181b] via-transparent to-transparent" />
        {item.popular && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-[#f59e0b] px-2.5 py-1 text-[11px] font-bold tracking-wide text-black uppercase shadow-lg shadow-amber-500/30">
            <Flame className="h-3 w-3" />
            Mais Pedido
          </span>
        )}
        {item.serves && (
          <span className="absolute top-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] text-zinc-200 backdrop-blur">
            {item.serves}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg leading-snug text-[#f3e3bf]">{item.name}</h3>
        {item.description && <p className="mt-2 text-sm leading-relaxed text-zinc-400">{item.description}</p>}
        <VariantPrices item={item} />
        {item.options?.length > 0 && (
          <p className="mt-3 text-xs text-zinc-500">
            Você escolhe: {item.options.map((opt) => opt.label.toLowerCase()).join(", ")}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/5 pt-4">
          <PriceTag item={item} className="font-display text-xl text-[#e6b95c]" />
          <ItemAction item={item} cart={cart} onChoose={onChoose} onChangeQty={onChangeQty} />
        </div>
      </div>
    </article>
  );
}

function MenuRow({ item, cart, onChoose, onChangeQty }) {
  return (
    <li className="flex items-center gap-4 py-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/5 text-xl" aria-hidden="true">
        {item.emoji}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 font-display text-[#f3e3bf]">
          {item.name}
          {item.popular && (
            <span className="rounded-full bg-[#f59e0b] px-2 py-0.5 font-body text-[10px] font-bold text-black uppercase">
              Mais Pedido
            </span>
          )}
        </p>
        {item.description && <p className="mt-0.5 text-xs text-zinc-500">{item.description}</p>}
        {item.variants ? (
          <p className="mt-1 text-sm text-zinc-400">
            {item.variants.map((v, i) => (
              <span key={v.id}>
                {i > 0 && <span className="text-zinc-600"> · </span>}
                {v.label} <span className="text-[#e6b95c]">{money(v.price)}</span>
              </span>
            ))}
          </p>
        ) : (
          <p className="mt-1 font-display text-[#e6b95c]">{money(item.price)}</p>
        )}
      </div>
      <ItemAction item={item} cart={cart} onChoose={onChoose} onChangeQty={onChangeQty} compact />
    </li>
  );
}

function MenuSection({ cart, onChoose, onChangeQty }) {
  const [category, setCategory] = useState("todos");
  const listRef = useRef(null);

  const selectCategory = (id) => {
    setCategory(id);
    // Se a lista já passou do topo, volta para o início dela ao trocar de categoria
    const list = listRef.current;
    if (list && list.getBoundingClientRect().top < 0) list.scrollIntoView({ block: "start" });
  };

  const counts = useMemo(() => {
    const result = { todos: MENU.length };
    MENU.forEach((item) => {
      result[item.category] = (result[item.category] || 0) + 1;
    });
    return result;
  }, []);

  const groups = useMemo(
    () =>
      CATEGORIES.filter((c) => c.id !== "todos" && (category === "todos" || c.id === category)).map((c) => ({
        ...c,
        items: MENU.filter((item) => item.category === c.id),
      })),
    [category]
  );

  return (
    <section id="cardapio" className="relative scroll-mt-24 bg-[#121113] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionTitle
          script="Escolha, adicione e peça"
          title="Nosso Cardápio"
          subtitle="Pratos feitos, chapas especiais, pratos completos e bebidas bem geladas. Monte seu pedido e enviamos prontinho para o nosso WhatsApp."
        />
        <div
          role="tablist"
          aria-label="Categorias do cardápio"
          className="no-scrollbar sticky top-[72px] z-30 -mx-4 mb-10 flex gap-2 overflow-x-auto bg-[#121113]/90 px-4 py-3 backdrop-blur-md sm:mx-0 sm:flex-wrap sm:justify-center sm:rounded-3xl"
        >
          {CATEGORIES.map(({ id, label, icon: Icon }) => {
            const active = category === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => selectCategory(id)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm transition active:scale-95 ${
                  active
                    ? "bg-[#e6b95c] font-semibold text-black"
                    : "border border-[#e6b95c]/30 text-zinc-300 hover:border-[#e6b95c]/70 hover:text-[#e6b95c]"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
                <span className={`rounded-full px-1.5 text-[11px] ${active ? "bg-black/15" : "bg-white/10 text-zinc-400"}`}>
                  {counts[id]}
                </span>
              </button>
            );
          })}
        </div>

        <div ref={listRef} className="scroll-mt-40 space-y-16">
          {groups.map((group) => (
            <div key={group.id}>
              <div className="mb-6 flex items-center gap-4">
                <h3 className="font-display text-2xl text-[#f3e3bf] md:text-3xl">{group.label}</h3>
                <span className="h-px flex-1 bg-gradient-to-r from-[#e6b95c]/40 to-transparent" />
              </div>
              {COMPACT_CATEGORIES.has(group.id) ? (
                <ul className="grid divide-y divide-white/5 rounded-3xl border border-white/10 bg-[#18181b] px-5 md:grid-cols-2 md:gap-x-10 md:divide-y-0 [&>li]:border-white/5 md:[&>li]:border-b">
                  {group.items.map((item) => (
                    <MenuRow key={item.id} item={item} cart={cart} onChoose={onChoose} onChangeQty={onChangeQty} />
                  ))}
                </ul>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {group.items.map((item) => (
                    <MenuCard key={item.id} item={item} cart={cart} onChoose={onChoose} onChangeQty={onChangeQty} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="mt-10 text-center text-xs text-zinc-500">
          Preços conforme o cardápio da casa, sujeitos a alteração. Confirme o valor final com nossa equipe no WhatsApp.
        </p>
      </div>
    </section>
  );
}

/* Janela para escolher tamanho, sabor, acompanhamentos e ponto da carne */
function ItemOptionsSheet({ item, onClose, onConfirm }) {
  const [variantId, setVariantId] = useState(item.variants?.[0]?.id ?? "");
  const [options, setOptions] = useState({});
  const [qty, setQty] = useState(1);
  const [showMissing, setShowMissing] = useState(false);
  const closeRef = useRef(null);

  const missing = (item.options ?? []).filter((opt) => !options[opt.id]);
  const unitPrice = item.variants ? getVariant(item, variantId)?.price ?? 0 : item.price;

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const confirm = () => {
    if (missing.length) {
      setShowMissing(true);
      return;
    }
    onConfirm(item.id, variantId, options, qty);
  };

  const chipClass = (active) =>
    `rounded-full px-4 py-2.5 text-sm transition active:scale-95 ${
      active
        ? "bg-[#e6b95c] font-semibold text-black"
        : "border border-white/15 text-zinc-300 hover:border-[#e6b95c]/60 hover:text-[#e6b95c]"
    }`;

  return (
    <div className="fixed inset-0 z-[65] flex items-end justify-center sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Escolher opções de ${item.name}`}
        className="relative flex max-h-[90svh] w-full max-w-lg flex-col rounded-t-3xl border border-[#e6b95c]/25 bg-[#16140f] shadow-2xl sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 pt-5 pb-4">
          <div>
            <p className="font-script text-2xl text-[#e6b95c]">Monte do seu jeito</p>
            <p className="font-display text-2xl leading-tight text-[#f3e3bf]">{item.name}</p>
            {item.description && <p className="mt-1 text-sm text-zinc-400">{item.description}</p>}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5 text-zinc-300 transition hover:bg-white/10"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-5">
          {item.variants && (
            <fieldset>
              <legend className={LABEL_CLASS}>Tamanho</legend>
              <div className="flex flex-wrap gap-2">
                {item.variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    aria-pressed={variantId === v.id}
                    onClick={() => setVariantId(v.id)}
                    className={chipClass(variantId === v.id)}
                  >
                    {v.label} · {money(v.price)}
                  </button>
                ))}
              </div>
            </fieldset>
          )}
          {(item.options ?? []).map((opt) => {
            const isMissing = showMissing && !options[opt.id];
            return (
              <fieldset key={opt.id}>
                <legend className={`${LABEL_CLASS} ${isMissing ? "!text-[#f97316]" : ""}`}>
                  {opt.label} {isMissing && "· escolha uma opção"}
                </legend>
                <div className={`flex flex-wrap gap-2 rounded-2xl ${isMissing ? "ring-1 ring-[#f97316]/60 ring-offset-4 ring-offset-[#16140f]" : ""}`}>
                  {opt.choices.map((choice) => (
                    <button
                      key={choice}
                      type="button"
                      aria-pressed={options[opt.id] === choice}
                      onClick={() => setOptions((prev) => ({ ...prev, [opt.id]: choice }))}
                      className={chipClass(options[opt.id] === choice)}
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              </fieldset>
            );
          })}
          <div className="flex items-center justify-between">
            <span className={LABEL_CLASS}>Quantidade</span>
            <div className="flex items-center gap-1 rounded-full border border-[#e6b95c]/50 p-1">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#e6b95c] active:scale-90"
                aria-label="Diminuir quantidade"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center font-semibold text-white">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e6b95c] text-black active:scale-90"
                aria-label="Aumentar quantidade"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button type="button" onClick={confirm} className={`${BTN_GOLD} w-full py-4 text-base`}>
            <Plus className="h-5 w-5" />
            {missing.length && showMissing
              ? `Escolha: ${missing.map((m) => m.label.toLowerCase()).join(", ")}`
              : `Adicionar · ${money(unitPrice * qty)}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function HoursSection({ status }) {
  const vibes = [
    {
      icon: Tv,
      title: "Telões para os jogos",
      text: "Sport, Náutico, Santa Cruz, Seleção e Brasileirão com som ligado e cerveja gelada. Aqui no Arruda, jogo é evento.",
    },
    {
      icon: PartyPopper,
      title: "Espaço para comemorações",
      text: "Aniversários, confraternizações e resenhas da firma. Reserve mesas pelo WhatsApp e a gente prepara tudo.",
    },
    {
      icon: Trophy,
      title: "Clima de resenha raiz",
      text: "Salão amplo e ventilado, cheiro de brasa no ar e atendimento de casa cheia.",
    },
    {
      icon: Cake,
      title: "Família bem-vinda",
      text: "Almoço de domingo farto, porções para dividir e espaço confortável para a galera toda.",
    },
  ];

  return (
    <section id="horarios" className="relative isolate scroll-mt-24 overflow-hidden py-20 md:py-28">
      <img
        src={PHOTOS.teloes}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="absolute inset-0 -z-10 h-full w-full object-cover [filter:sepia(.4)_brightness(.35)]"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#0f0f11] via-[#0f0f11]/80 to-[#0f0f11]" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionTitle
          script="Horários & clima da casa"
          title="A brasa acende todo dia"
          subtitle="Do almoço de domingo à última cerveja da sexta, tem sempre uma mesa esperando você."
        />
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="overflow-hidden rounded-3xl border border-[#e6b95c]/25 bg-black/60 backdrop-blur-md lg:col-span-2">
            <div className="flex items-center justify-between gap-3 border-b border-[#e6b95c]/15 px-6 py-5">
              <div>
                <p className="font-script text-2xl text-[#e6b95c]">Agora no Arruda</p>
                <p className="font-display text-xl text-[#f3e3bf]">
                  {status.isOpen ? "Brasa acesa!" : "Brasa descansando"}
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                  status.isOpen
                    ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/40"
                    : "bg-zinc-700/40 text-zinc-300 ring-1 ring-zinc-600"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${status.isOpen ? "animate-pulse bg-emerald-400" : "bg-zinc-400"}`} />
                {status.isOpen ? `Aberto até ${formatHour(status.closesAt)}` : "Fechado agora"}
              </span>
            </div>
            <ul className="divide-y divide-white/5">
              {HOURS.map((row, index) => {
                const isToday = index === status.day;
                const lateNight = row.close > 24 * 60;
                return (
                  <li
                    key={row.day}
                    className={`flex items-center justify-between gap-3 px-6 py-3.5 ${isToday ? "bg-[#e6b95c]/10" : ""}`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`font-display ${isToday ? "text-[#e6b95c]" : "text-[#f3e3bf]"}`}>{row.day}</span>
                      {isToday && (
                        <span className="rounded-full bg-[#ea580c] px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                          Hoje
                        </span>
                      )}
                      {row.note && !isToday && <span className="hidden text-xs text-zinc-500 sm:inline">· {row.note}</span>}
                    </span>
                    <span className="text-sm tabular-nums">
                      <span className="text-zinc-300">{formatHour(row.open)}</span>
                      <span className="text-zinc-600"> – </span>
                      <span className={lateNight ? "font-semibold text-[#f59e0b]" : "text-zinc-300"}>
                        {formatHour(row.close)}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="border-t border-white/10 px-6 py-4 text-xs text-zinc-500">
              Horário de Recife. Feriados e dias de jogo podem ter horário especial. Confira no Instagram.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-3">
            {vibes.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-3xl border border-white/10 bg-black/50 p-6 backdrop-blur-md transition hover:border-[#e6b95c]/40"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#e6b95c]/50 text-[#e6b95c]">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-xl text-[#f3e3bf]">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{text}</p>
              </div>
            ))}
            <a
              href={WHATSAPP_RESERVA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-4 rounded-3xl border border-[#e6b95c]/40 bg-gradient-to-r from-[#e6b95c]/15 to-transparent p-6 transition hover:border-[#e6b95c] active:scale-[0.99] sm:col-span-2"
            >
              <span>
                <span className="block font-display text-2xl text-[#f3e3bf]">Vai comemorar? Reserve sua mesa</span>
                <span className="mt-1 block text-sm text-zinc-400">Respondemos rapidinho no WhatsApp {BRAND.whatsappDisplay}</span>
              </span>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e6b95c] text-black">
                <WhatsAppIcon className="h-5 w-5" />
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function LocationSection() {
  const [mapLoaded, setMapLoaded] = useState(false);
  const tips = [
    {
      icon: Car,
      title: "De carro",
      text: "Fica a poucos minutos do Estádio do Arruda. Pela Av. Prof. José dos Anjos, entre na R. João Liberato.",
    },
    {
      icon: CircleParking,
      title: "Estacionamento",
      text: "Vagas na rua em frente e nas transversais. Em dia de jogo, chegue mais cedo: a rua enche!",
    },
    {
      icon: Bus,
      title: "Transporte público",
      text: "Linhas que passam pela Av. Beberibe e região do Arruda deixam você a uma curta caminhada.",
    },
    {
      icon: Bike,
      title: "Delivery",
      text: "Não pode vir? Peça pelo WhatsApp e receba a costela quentinha em casa.",
    },
  ];

  return (
    <section id="localizacao" className="relative scroll-mt-24">
      {/* Janela transparente: o vídeo fixo de fundo aparece aqui */}
      <div className="text-shadow-hero relative flex min-h-[70svh] flex-col items-center justify-center px-4 py-24 text-center">
        <p className="font-script text-3xl text-[#e6b95c] md:text-4xl">Vem pro Arruda</p>
        <h2 className="mt-2 max-w-3xl font-display text-4xl leading-tight text-[#f3e3bf] md:text-6xl">
          Esperamos você para uma noite de brasa
        </h2>
        <div className="mt-10 flex flex-col items-center gap-6 text-left sm:flex-row sm:gap-10">
          <a href={GOOGLE_MAPS_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#e6b95c]/60 text-[#e6b95c]">
              <MapPin className="h-5 w-5" />
            </span>
            <span className="font-display text-lg leading-tight text-[#f3e3bf]">
              {BRAND.street}
              <span className="block text-sm text-zinc-400">
                {BRAND.district} · {BRAND.cep}
              </span>
            </span>
          </a>
          <a href={WHATSAPP_DEFAULT_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#e6b95c]/60 text-[#e6b95c]">
              <Phone className="h-5 w-5" />
            </span>
            <span className="font-display text-lg leading-tight text-[#f3e3bf]">
              Fale com a gente
              <span className="block text-sm text-zinc-400">{BRAND.whatsappDisplay}</span>
            </span>
          </a>
        </div>
        <a href={WHATSAPP_RESERVA_URL} target="_blank" rel="noopener noreferrer" className={`${BTN_GOLD} mt-10`}>
          Reservar sua mesa
        </a>
      </div>

      <div className="bg-[#0f0f11] pb-20 md:pb-28">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 pt-4 sm:px-6 lg:grid-cols-5">
          <div className="relative min-h-[320px] overflow-hidden rounded-3xl border border-[#e6b95c]/20 bg-[#18181b] lg:col-span-3 lg:min-h-[460px]">
            {!mapLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-zinc-500">
                <MapPin className="h-10 w-10 animate-bounce text-[#e6b95c]" />
                <span className="text-sm">Carregando mapa…</span>
              </div>
            )}
            <iframe
              title="Mapa do Ponto da Costela no Arruda, Recife"
              src={MAPS_EMBED_URL}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              onLoad={() => setMapLoaded(true)}
              className="absolute inset-0 h-full w-full border-0 [filter:grayscale(.4)_sepia(.2)]"
            />
          </div>
          <div className="flex flex-col gap-4 lg:col-span-2">
            <div className="rounded-3xl border border-[#e6b95c]/30 bg-[#16140f] p-6">
              <p className="font-script text-2xl text-[#e6b95c]">Como chegar</p>
              <p className="mt-1 font-display text-2xl leading-snug text-[#f3e3bf]">{BRAND.address}</p>
              <p className="mt-1 text-sm text-zinc-400">CEP {BRAND.cep}</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <a href={WAZE_URL} target="_blank" rel="noopener noreferrer" className={`${BTN_OUTLINE} !px-3 text-sm`}>
                  <Navigation className="h-4 w-4" />
                  Abrir no Waze
                </a>
                <a
                  href={GOOGLE_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${BTN_GOLD} !px-3 !py-2.5 text-sm`}
                >
                  <MapPin className="h-4 w-4" />
                  Google Maps
                </a>
              </div>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {tips.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-3 rounded-2xl border border-white/10 bg-[#18181b] p-4">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#e6b95c]" />
                  <div>
                    <p className="font-display text-[#f3e3bf]">{title}</p>
                    <p className="mt-1 text-sm text-zinc-400">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative border-t border-[#e6b95c]/15 bg-black">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="flex flex-col items-center text-center">
          <BrandLogo className="h-24 w-24" />
          <p className="mt-4 font-display text-2xl text-[#f3e3bf]">Ponto da Costela</p>
          <p className="mt-1 font-script text-2xl text-[#e6b95c]">{BRAND.slogan}</p>
          <div className="mt-4 flex items-center gap-1 text-sm text-zinc-300">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} className="h-4 w-4 text-[#e6b95c]" fill="currentColor" />
            ))}
            <span className="ml-1 font-semibold">{BRAND.rating}</span>
            <span className="text-zinc-500">no Google</span>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className={BTN_OUTLINE}>
              <InstagramIcon className="h-4 w-4" />@{BRAND.instagram}
              <span className="text-xs text-zinc-400">· {BRAND.followers}</span>
            </a>
            <a href={WHATSAPP_DEFAULT_URL} target="_blank" rel="noopener noreferrer" className={BTN_OUTLINE}>
              <WhatsAppIcon className="h-4 w-4" />
              {BRAND.whatsappDisplay}
            </a>
          </div>
          <p className="mt-8 max-w-md text-sm text-zinc-400">
            A brasa tá acesa. Chama a turma, separa a sede e vem viver o churrasco raiz mais querido do Recife, na{" "}
            {BRAND.address}.
          </p>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-zinc-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Ponto da Costela - Recife. Todos os direitos reservados.</p>
          <nav className="flex gap-4">
            <a href="#destaques" className="hover:text-[#e6b95c]">Destaques</a>
            <a href="#cardapio" className="hover:text-[#e6b95c]">Cardápio</a>
            <a href="#horarios" className="hover:text-[#e6b95c]">Horários</a>
            <a href="#localizacao" className="hover:text-[#e6b95c]">Localização</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}

/* ============================================================
   CARRINHO / PEDIDO VIA WHATSAPP
   ============================================================ */

const ORDER_TYPES = [
  { id: "delivery", label: "Delivery", icon: Bike },
  { id: "retirada", label: "Retirada", icon: Store },
  { id: "mesa", label: "Na mesa", icon: Armchair },
];

const INPUT_CLASS =
  "w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-base text-white placeholder:text-zinc-600 focus:border-[#e6b95c]/60 focus:ring-2 focus:ring-[#e6b95c]/20 focus:outline-none";
const LABEL_CLASS = "mb-1.5 block text-xs font-semibold tracking-widest text-zinc-400 uppercase";

function CartDrawer({ open, onClose, cart, onChangeQty, onDelete, onClear }) {
  const [orderType, setOrderType] = useState("delivery");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const closeButtonRef = useRef(null);

  const lines = useMemo(
    () =>
      Object.entries(cart)
        .filter(([, line]) => isValidLine(line))
        .map(([key, line]) => {
          const item = MENU_BY_ID[line.itemId];
          return {
            id: key,
            qty: line.qty,
            name: lineTitle(line),
            details: lineDetails(line),
            image: item.image,
            emoji: item.emoji,
            subtotal: linePrice(line) * line.qty,
          };
        }),
    [cart]
  );
  const total = useMemo(() => lines.reduce((sum, line) => sum + line.subtotal, 0), [lines]);
  const itemCount = useMemo(() => lines.reduce((sum, line) => sum + line.qty, 0), [lines]);

  const whatsappUrl = useMemo(() => {
    const typeLabel = ORDER_TYPES.find((t) => t.id === orderType)?.label ?? "";
    const parts = [
      "Olá, Ponto da Costela! 🔥 Gostaria de fazer um pedido:",
      "",
      ...lines.flatMap((line) => [
        `• ${line.qty}x ${line.name} — ${money(line.subtotal)}`,
        ...(line.details.length ? [`   ↳ ${line.details.join(" | ")}`] : []),
      ]),
      "",
      `*Total estimado: ${money(total)}*`,
      "",
      `Tipo: ${typeLabel}`,
    ];
    if (name.trim()) parts.push(`Nome: ${name.trim()}`);
    if (orderType === "delivery" && address.trim()) parts.push(`Endereço: ${address.trim()}`);
    if (notes.trim()) parts.push(`Observações: ${notes.trim()}`);
    return `https://wa.me/${BRAND.whatsappNumber}?text=${encodeURIComponent(parts.join("\n"))}`;
  }, [lines, total, orderType, name, address, notes]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const needsAddress = orderType === "delivery" && !address.trim();

  return (
    <div className={`fixed inset-0 z-[60] ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Seu pedido"
        inert={!open}
        className={`absolute top-0 right-0 flex h-full w-full max-w-md flex-col border-l border-[#e6b95c]/20 bg-[#16140f] shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#e6b95c]/60 text-[#e6b95c]">
              <ShoppingBag className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-xl text-[#f3e3bf]">Seu pedido</p>
              <p className="text-xs text-zinc-400">
                {itemCount} {itemCount === 1 ? "item" : "itens"}
              </p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-zinc-300 transition hover:bg-white/10 active:scale-95"
            aria-label="Fechar pedido"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <BrandLogo className="h-24 w-24" />
            <p className="font-display text-2xl text-[#f3e3bf]">A grelha ainda está vazia</p>
            <p className="text-sm text-zinc-400">
              Adicione a costela, um prato completo e aquela cerveja gelada. A gente cuida do resto.
            </p>
            <a href="#cardapio" onClick={onClose} className={`${BTN_GOLD} mt-2`}>
              <UtensilsCrossed className="h-4 w-4" />
              Ver Cardápio
            </a>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
              <ul className="space-y-3">
                {lines.map((line) => (
                  <li key={line.id} className="flex gap-3 rounded-2xl border border-white/10 bg-black/25 p-3">
                    <FoodImage
                      src={line.image}
                      alt={line.name}
                      emoji={line.emoji}
                      className="h-16 w-16 shrink-0 rounded-xl text-xs"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-display leading-snug text-[#f3e3bf]">{line.name}</p>
                          {line.details.length > 0 && (
                            <p className="mt-0.5 text-xs leading-snug text-zinc-400">{line.details.join(" · ")}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => onDelete(line.id)}
                          className="shrink-0 rounded-lg p-1 text-zinc-500 transition hover:bg-red-500/10 hover:text-red-400"
                          aria-label={`Remover ${line.name} do pedido`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1 rounded-full border border-[#e6b95c]/40 p-0.5">
                          <button
                            type="button"
                            onClick={() => onChangeQty(line.id, -1)}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-[#e6b95c] active:scale-90"
                            aria-label={`Diminuir ${line.name}`}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-6 text-center text-sm font-semibold text-white">{line.qty}</span>
                          <button
                            type="button"
                            onClick={() => onChangeQty(line.id, 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-[#e6b95c] active:scale-90"
                            aria-label={`Aumentar ${line.name}`}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <span className="font-display text-lg text-[#e6b95c]">{money(line.subtotal)}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={onClear}
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 transition hover:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Limpar pedido
              </button>

              <div className="mt-6 space-y-4">
                <fieldset>
                  <legend className={LABEL_CLASS}>Como você quer?</legend>
                  <div className="grid grid-cols-3 gap-2">
                    {ORDER_TYPES.map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setOrderType(id)}
                        aria-pressed={orderType === id}
                        className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-3 text-xs font-semibold transition active:scale-95 ${
                          orderType === id
                            ? "bg-[#e6b95c]/15 text-[#e6b95c] ring-1 ring-[#e6b95c]/70"
                            : "bg-white/5 text-zinc-400 ring-1 ring-white/10"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        {label}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <label className="block">
                  <span className={LABEL_CLASS}>Seu nome</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Como te chamamos?"
                    autoComplete="name"
                    className={INPUT_CLASS}
                  />
                </label>
                {orderType === "delivery" && (
                  <label className="block">
                    <span className={LABEL_CLASS}>Endereço de entrega</span>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Rua, número, bairro e referência"
                      autoComplete="street-address"
                      className={INPUT_CLASS}
                    />
                  </label>
                )}
                <label className="block">
                  <span className={LABEL_CLASS}>Observações</span>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Ponto da carne, troco, sem cebola…"
                    className={`${INPUT_CLASS} resize-none`}
                  />
                </label>
              </div>
            </div>

            <div className="border-t border-white/10 bg-[#0f0f11] px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="mb-1 flex items-center justify-between text-sm text-zinc-400">
                <span>Subtotal</span>
                <span>{money(total)}</span>
              </div>
              <div className="mb-4 flex items-center justify-between">
                <span className="font-display text-lg text-[#f3e3bf]">Total estimado</span>
                <span className="font-display text-3xl text-[#e6b95c]">{money(total)}</span>
              </div>
              {needsAddress && (
                <p className="mb-3 flex items-center gap-1.5 text-xs text-[#e6b95c]/80">
                  <Sparkles className="h-3.5 w-3.5" />
                  Dica: informe o endereço para agilizar a entrega.
                </p>
              )}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-4 text-base font-bold text-black shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 active:scale-[0.98]"
              >
                <WhatsAppIcon className="h-5 w-5" />
                Enviar pedido no WhatsApp
              </a>
              <p className="mt-2 text-center text-[11px] text-zinc-500">
                Taxa de entrega e valor final confirmados pela nossa equipe.
              </p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

/* ============================================================
   CONTROLES FLUTUANTES
   ============================================================ */

function MediaControls({ playing, onTogglePlay, focusMode, onToggleFocus, videoFailed }) {
  return (
    <div className="fixed bottom-4 left-4 z-40 mb-[env(safe-area-inset-bottom)] flex items-center gap-1 rounded-full border border-[#e6b95c]/25 bg-black/60 p-1 backdrop-blur-md">
      {!videoFailed && (
        <button
          type="button"
          onClick={onTogglePlay}
          className="flex h-10 w-10 items-center justify-center rounded-full text-[#e6b95c] transition hover:bg-white/10 active:scale-95"
          aria-label={playing ? "Pausar vídeo de fundo" : "Reproduzir vídeo de fundo"}
          title={playing ? "Pausar vídeo de fundo" : "Reproduzir vídeo de fundo"}
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
      )}
      <button
        type="button"
        onClick={onToggleFocus}
        aria-pressed={focusMode}
        className={`flex h-10 items-center gap-2 rounded-full px-3 text-xs font-semibold transition active:scale-95 ${
          focusMode ? "bg-[#e6b95c]/20 text-[#e6b95c]" : "text-zinc-300 hover:bg-white/10 hover:text-white"
        }`}
        title="Reduz animações e pausa o fundo para focar no cardápio"
      >
        {focusMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        <span className="hidden sm:inline">{focusMode ? "Modo foco ativo" : "Modo foco"}</span>
      </button>
    </div>
  );
}

function FloatingCartButton({ count, total, onClick }) {
  if (count === 0) {
    return (
      <a
        href={WHATSAPP_DEFAULT_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar no WhatsApp"
        className="fixed right-4 bottom-4 z-40 mb-[env(safe-area-inset-bottom)] flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-black shadow-xl shadow-emerald-500/40 transition hover:scale-105 active:scale-95"
      >
        <WhatsAppIcon className="h-7 w-7" />
      </a>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="glow-btn fixed right-4 bottom-4 z-40 mb-[env(safe-area-inset-bottom)] flex items-center gap-3 rounded-full bg-[#e6b95c] py-2.5 pr-5 pl-2.5 text-[#141210] transition active:scale-95"
      aria-label={`Ver pedido: ${count} itens, ${money(total)}`}
    >
      <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-black/15">
        <ShoppingBag className="h-5 w-5" />
        <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ea580c] px-1 text-[11px] font-bold text-white">
          {count}
        </span>
      </span>
      <span className="text-left leading-tight">
        <span className="block text-[11px] font-semibold opacity-70">Ver pedido</span>
        <span className="block font-display text-lg font-semibold">{money(total)}</span>
      </span>
    </button>
  );
}

function Toast({ message }) {
  return (
    <div
      aria-live="polite"
      className={`pointer-events-none fixed top-24 left-1/2 z-[70] -translate-x-1/2 transition-all duration-300 ${
        message ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
      }`}
    >
      {message && (
        <div className="flex items-center gap-2 rounded-full border border-[#e6b95c]/40 bg-black/85 px-4 py-2.5 text-sm text-[#f3e3bf] shadow-xl backdrop-blur-md">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e6b95c] text-black">
            <Check className="h-3.5 w-3.5" />
          </span>
          {message}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   APP
   ============================================================ */

const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..800;1,400..800&family=Great+Vibes&family=Raleway:wght@300..700&display=swap');
  .font-display { font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; }
  .font-script { font-family: 'Great Vibes', 'Brush Script MT', cursive; font-weight: 400; line-height: 1.2; }
  .font-body { font-family: 'Raleway', system-ui, -apple-system, 'Segoe UI', sans-serif; }
  @keyframes flame-flicker {
    0%, 100% { transform: scale(1) rotate(-2deg); opacity: 1; }
    25% { transform: scale(1.08, 0.96) rotate(2deg); opacity: .9; }
    50% { transform: scale(0.96, 1.06) rotate(-1deg); opacity: 1; }
    75% { transform: scale(1.04) rotate(1deg); opacity: .92; }
  }
  .flame-flicker { animation: flame-flicker 1.6s ease-in-out infinite; transform-origin: 50% 90%; }
  @keyframes gold-glow {
    0%, 100% { box-shadow: 0 0 22px -6px rgba(230, 185, 92, .55); }
    50% { box-shadow: 0 0 38px -4px rgba(234, 88, 12, .55); }
  }
  .glow-btn { animation: gold-glow 3s ease-in-out infinite; }
  .text-shadow-hero h1, .text-shadow-hero h2, .text-shadow-hero p { text-shadow: 0 2px 18px rgba(0, 0, 0, .75), 0 1px 3px rgba(0, 0, 0, .6); }
  .no-scrollbar { scrollbar-width: none; }
  .no-scrollbar::-webkit-scrollbar { display: none; }
  html.reduce-motion *, html.reduce-motion *::before, html.reduce-motion *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
  }
  body { -webkit-tap-highlight-color: transparent; }
`;

export default function App() {
  const videoRef = useRef(null);
  const toastTimer = useRef(null);
  const [cart, setCart] = useState(loadCart);
  const [cartOpen, setCartOpen] = useState(false);
  const [choosingId, setChoosingId] = useState(null);
  const [toast, setToast] = useState("");
  const [focusMode, setFocusMode] = useState(prefersReducedMotion);
  const [userPaused, setUserPaused] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [status, setStatus] = useState(getOpenStatus);

  const playing = !focusMode && !userPaused && !videoFailed;

  // Atualiza status de aberto/fechado a cada minuto
  useEffect(() => {
    const id = window.setInterval(() => setStatus(getOpenStatus()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => saveCart(cart), [cart]);

  // Sincroniza vídeo com estado de reprodução e visibilidade da aba
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;
    const sync = () => {
      if (playing && !document.hidden) {
        const attempt = video.play();
        if (attempt && typeof attempt.catch === "function") attempt.catch(() => {});
      } else {
        video.pause();
      }
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, [playing]);

  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", focusMode);
  }, [focusMode]);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const showToast = (message) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 1800);
  };

  const addLine = (itemId, variantId = "", options = {}, qty = 1) => {
    const key = makeLineKey(itemId, variantId, options);
    setCart((prev) => ({
      ...prev,
      [key]: { itemId, variantId, options, qty: (prev[key]?.qty ?? 0) + qty },
    }));
    const line = { itemId, variantId, options, qty };
    showToast(`${lineTitle(line)} adicionado!`);
  };

  // Itens com tamanho/opções abrem a janela de escolha; os demais entram direto
  const chooseItem = (itemId) => {
    const item = MENU_BY_ID[itemId];
    if (!item) return;
    if (needsChoice(item)) setChoosingId(itemId);
    else addLine(itemId);
  };

  const changeQty = (key, delta) => {
    setCart((prev) => {
      const line = prev[key];
      if (!line) return prev;
      const next = { ...prev };
      const qty = line.qty + delta;
      if (qty > 0) next[key] = { ...line, qty };
      else delete next[key];
      return next;
    });
  };

  const deleteLine = (key) => {
    setCart((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const { cartCount, cartTotal } = useMemo(() => {
    let count = 0;
    let total = 0;
    Object.values(cart).forEach((line) => {
      if (!isValidLine(line)) return;
      count += line.qty;
      total += linePrice(line) * line.qty;
    });
    return { cartCount: count, cartTotal: total };
  }, [cart]);

  const closeChooser = useMemo(() => () => setChoosingId(null), []);
  const closeCart = useMemo(() => () => setCartOpen(false), []);

  return (
    <div className="font-body relative isolate min-h-screen overflow-x-clip bg-transparent text-zinc-100 antialiased selection:bg-[#e6b95c]/40">
      <style>{GLOBAL_STYLES}</style>
      <BackgroundVideo
        videoRef={videoRef}
        playing={playing}
        focusMode={focusMode}
        videoFailed={videoFailed}
        onAllSourcesFailed={() => setVideoFailed(true)}
      />

      <AnnouncementBar status={status} />
      <Navbar cartCount={cartCount} onOpenCart={() => setCartOpen(true)} />

      <main>
        <Hero status={status} />
        <AboutSection />
        <Highlights onChoose={chooseItem} />
        <MenuSection cart={cart} onChoose={chooseItem} onChangeQty={changeQty} />
        <HoursSection status={status} />
        <LocationSection />
      </main>

      <Footer />

      <MediaControls
        playing={playing}
        onTogglePlay={() => {
          if (focusMode) {
            setFocusMode(false);
            setUserPaused(false);
          } else {
            setUserPaused((v) => !v);
          }
        }}
        focusMode={focusMode}
        onToggleFocus={() => setFocusMode((v) => !v)}
        videoFailed={videoFailed}
      />
      <FloatingCartButton count={cartCount} total={cartTotal} onClick={() => setCartOpen(true)} />
      <Toast message={cartOpen || choosingId ? "" : toast} />
      <CartDrawer
        open={cartOpen}
        onClose={closeCart}
        cart={cart}
        onChangeQty={changeQty}
        onDelete={deleteLine}
        onClear={() => setCart({})}
      />
      {choosingId && MENU_BY_ID[choosingId] && (
        <ItemOptionsSheet
          key={choosingId}
          item={MENU_BY_ID[choosingId]}
          onClose={closeChooser}
          onConfirm={(itemId, variantId, options, qty) => {
            addLine(itemId, variantId, options, qty);
            setChoosingId(null);
          }}
        />
      )}
    </div>
  );
}
