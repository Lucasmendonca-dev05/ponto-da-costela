import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
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
  Clock,
  Drumstick,
  Eye,
  EyeOff,
  Flame,
  Heart,
  LayoutGrid,
  MapPin,
  Menu,
  Minus,
  Navigation,
  PartyPopper,
  Pause,
  Play,
  Plus,
  Sandwich,
  ShoppingBag,
  Soup,
  Sparkles,
  Star,
  Store,
  Trash2,
  Trophy,
  Tv,
  UtensilsCrossed,
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
  cep: "52120-070",
  whatsappDisplay: "(81) 99950-2765",
  whatsappNumber: "5581999502765",
  instagram: "pontodacostelarecife",
  followers: "42k+",
  rating: "4.7",
};

const WHATSAPP_DEFAULT_URL =
  "https://wa.me/5581999502765?text=Ol%C3%A1,%20gostaria%20de%20fazer%20um%20pedido/reserva%20no%20Ponto%20da%20Costela!";
const INSTAGRAM_URL = `https://www.instagram.com/${BRAND.instagram}/`;
const MAPS_QUERY = encodeURIComponent(`${BRAND.address}, ${BRAND.cep}`);
const GOOGLE_MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${MAPS_QUERY}`;
const WAZE_URL = `https://waze.com/ul?q=${MAPS_QUERY}&navigate=yes`;
const MAPS_EMBED_URL = `https://www.google.com/maps?q=${MAPS_QUERY}&output=embed`;

/*
  Vídeo 3D de fundo (Google Flow).
  A primeira fonte é o arquivo exportado do Google Flow — coloque-o em
  public/videos/brasa-google-flow.mp4 (ou .webm). Se ele não existir, o
  navegador cai automaticamente nas fontes de mockup seguintes. Se nenhuma
  carregar, o fundo usa o poster + a camada de brasas animadas em canvas.
*/
const VIDEO_SOURCES = [
  { src: "videos/brasa-google-flow.webm", type: "video/webm" },
  { src: "videos/brasa-google-flow.mp4", type: "video/mp4" },
  {
    src: "https://videos.pexels.com/video-files/857032/857032-hd_1280_720_25fps.mp4",
    type: "video/mp4",
  },
  {
    src: "https://assets.mixkit.co/videos/preview/mixkit-fire-burning-in-the-dark-1162-large.mp4",
    type: "video/mp4",
  },
];
const VIDEO_POSTER =
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1600&q=70";

const img = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=70`;

/* ============================================================
   CARDÁPIO
   ============================================================ */

const CATEGORIES = [
  { id: "todos", label: "Todos", icon: LayoutGrid },
  { id: "brasa", label: "Na Brasa", icon: Flame },
  { id: "regionais", label: "Regionais", icon: ChefHat },
  { id: "petiscos", label: "Petiscos", icon: Drumstick },
  { id: "burgers", label: "Burgers", icon: Sandwich },
  { id: "sopas", label: "Sopas", icon: Soup },
  { id: "bebidas", label: "Bebidas", icon: Beer },
];

const MENU = [
  {
    id: "costela-especial",
    category: "brasa",
    name: "Costela Especial na Brasa",
    description:
      "Costela bovina assada lentamente por horas, desmanchando no osso. Acompanha farofa da casa, vinagrete e mandioca.",
    price: 89.9,
    serves: "Serve 2 a 3",
    popular: true,
    emoji: "🥩",
    image: img("photo-1544025162-d76694265947"),
  },
  {
    id: "picanha-brasa",
    category: "brasa",
    name: "Picanha na Brasa",
    description:
      "Picanha selecionada com capa de gordura dourada no fogo, sal grosso, arroz, farofa e vinagrete.",
    price: 99.9,
    serves: "Serve 2",
    emoji: "🔥",
    image: img("photo-1529692236671-f1f6cf9683ba"),
  },
  {
    id: "espetinhos-mistos",
    category: "brasa",
    name: "Espetinhos Mistos (4 un.)",
    description:
      "Boi, frango, linguiça e queijo coalho tostado na brasa, com molho de alho da casa.",
    price: 42.9,
    emoji: "🍢",
    image: img("photo-1555939594-58d7cb561ad1"),
  },
  {
    id: "linguica-artesanal",
    category: "brasa",
    name: "Linguiça Artesanal na Brasa",
    description:
      "Linguiça artesanal suculenta, grelhada no carvão, com cebola caramelizada e pão de alho.",
    price: 34.9,
    emoji: "🌭",
    image: img("photo-1532636875304-0c89119d9b4d"),
  },
  {
    id: "carne-de-sol",
    category: "regionais",
    name: "Carne de Sol com Queijo Empanado & Macaxeira",
    description:
      "O clássico regional: carne de sol na manteiga de garrafa, queijo coalho empanado crocante e macaxeira frita sequinha.",
    price: 79.9,
    serves: "Serve 2",
    popular: true,
    emoji: "🧀",
    image: img("photo-1504674900247-0877df9cc836"),
  },
  {
    id: "mao-de-vaca",
    category: "regionais",
    name: "Mão de Vaca com Pirão",
    description:
      "Prato quente típico pernambucano, cozido lentamente com temperos da terra e pirão tradicional encorpado.",
    price: 64.9,
    serves: "Serve 2",
    emoji: "🍲",
    image: img("photo-1547592166-23ac45744acd"),
  },
  {
    id: "arrumadinho",
    category: "regionais",
    name: "Arrumadinho de Charque",
    description:
      "Charque acebolada, feijão verde, farofa, vinagrete e queijo coalho em cubos. Nordeste raiz no prato.",
    price: 39.9,
    emoji: "🫘",
    image: img("photo-1512058564366-18510be2db19"),
  },
  {
    id: "camarao-alho-oleo",
    category: "petiscos",
    name: "Camarão Alho e Óleo",
    description:
      "Camarões salteados no alho dourado e azeite, finalizados com salsinha. Acompanha pão torrado.",
    price: 59.9,
    popular: true,
    emoji: "🦐",
    image: img("photo-1565680018434-b513d5e5fd47"),
  },
  {
    id: "batata-cheddar-bacon",
    category: "petiscos",
    name: "Batata Frita Cheddar & Bacon",
    description:
      "Porção generosa de batata crocante coberta com cheddar cremoso e bacon em cubos.",
    price: 32.9,
    emoji: "🍟",
    image: img("photo-1573080496219-bb080dd4f877"),
  },
  {
    id: "bolinhos-charque",
    category: "petiscos",
    name: "Bolinhos Crocantes de Charque (10 un.)",
    description:
      "Bolinhos de macaxeira recheados com charque e queijo, fritos na hora. Crocantes por fora, cremosos por dentro.",
    price: 29.9,
    emoji: "🧆",
    image: img("photo-1541592106381-b31e9677c0e5"),
  },
  {
    id: "dadinho-tapioca",
    category: "petiscos",
    name: "Dadinho de Tapioca com Melaço",
    description:
      "Dadinhos de tapioca com queijo coalho, servidos com melaço de cana e pimenta da casa.",
    price: 26.9,
    emoji: "🧈",
    image: img("photo-1601050690597-df0568f70950"),
  },
  {
    id: "burguer-brasa",
    category: "burgers",
    name: "Burguer Brasa",
    description:
      "Blend bovino 180g grelhado no fogo, queijo derretido, bacon crocante, cebola caramelizada e maionese defumada no pão brioche.",
    price: 36.9,
    popular: true,
    emoji: "🍔",
    image: img("photo-1568901346375-23c9450c58cd"),
  },
  {
    id: "burguer-costela",
    category: "burgers",
    name: "Burguer de Costela Desfiada",
    description:
      "Costela desfiada da casa, queijo coalho maçaricado, cebola roxa e barbecue de rapadura.",
    price: 39.9,
    emoji: "🥪",
    image: img("photo-1553979459-d2229ba7433b"),
  },
  {
    id: "smash-duplo",
    category: "burgers",
    name: "Smash Duplo",
    description:
      "Dois smash de 90g com crosta perfeita, cheddar duplo, picles e molho especial.",
    price: 32.9,
    emoji: "🍔",
    image: img("photo-1550547660-d9450f859349"),
  },
  {
    id: "caldinho-feijao",
    category: "sopas",
    name: "Caldinho de Feijão",
    description:
      "Caldinho cremoso com bacon, charque e cebolinha. Ideal para abrir os trabalhos.",
    price: 12.9,
    emoji: "🥣",
    image: img("photo-1547592180-85f173990554"),
  },
  {
    id: "caldinho-camarao",
    category: "sopas",
    name: "Caldinho de Camarão",
    description: "Caldinho encorpado de camarão com leite de coco e coentro.",
    price: 16.9,
    emoji: "🍤",
    image: img("photo-1476718406336-bb5a9690ee2a"),
  },
  {
    id: "caldo-mocoto",
    category: "sopas",
    name: "Caldo de Mocotó",
    description:
      "Tradicional, forte e quentinho. Aquele que levanta qualquer um depois do jogo.",
    price: 22.9,
    emoji: "🍜",
    image: img("photo-1604152135912-04a022e23696"),
  },
  {
    id: "chopp-pilsen",
    category: "bebidas",
    name: "Chopp Pilsen 300ml",
    description: "Tirado na hora, colarinho cremoso e temperatura de congelar a alma.",
    price: 9.9,
    popular: true,
    emoji: "🍺",
    image: img("photo-1608270586620-248524c67de9"),
  },
  {
    id: "balde-long-neck",
    category: "bebidas",
    name: "Balde com 5 Long Necks",
    description: "Cerveja estupidamente gelada no balde de gelo. Perfeito para a resenha.",
    price: 49.9,
    emoji: "🧊",
    image: img("photo-1535958636474-b021ee887b13"),
  },
  {
    id: "caipirinha",
    category: "bebidas",
    name: "Caipirinha da Casa",
    description: "Limão, cachaça artesanal e açúcar na medida. Também com vodka ou saquê.",
    price: 19.9,
    emoji: "🍹",
    image: img("photo-1541546006121-5c3bc5e8c7b9"),
  },
  {
    id: "suco-natural",
    category: "bebidas",
    name: "Suco Natural 500ml",
    description: "Maracujá, acerola, cajá ou graviola. Feito na hora.",
    price: 10.9,
    emoji: "🥤",
    image: img("photo-1600271886742-f049cd451bba"),
  },
  {
    id: "refrigerante",
    category: "bebidas",
    name: "Refrigerante Lata",
    description: "Coca-Cola, Guaraná ou Fanta, bem gelados.",
    price: 6.9,
    emoji: "🥫",
    image: img("photo-1581636625402-29b2a704ef13"),
  },
];

const MENU_BY_ID = Object.fromEntries(MENU.map((item) => [item.id, item]));

const HIGHLIGHTS = [
  {
    itemId: "costela-especial",
    title: "Costela Especial na Brasa",
    text: "Assada lentamente, desmanchando no osso, com farofa e vinagrete.",
    tag: "Estrela da casa",
    icon: Flame,
    featured: true,
  },
  {
    itemId: "carne-de-sol",
    title: "Carne de Sol com Queijo Empanado & Macaxeira",
    text: "O clássico regional farto e crocante.",
    tag: "Regional",
    icon: ChefHat,
  },
  {
    itemId: "burguer-brasa",
    title: "Burguer Brasa",
    text: "Blend suculento grelhado no fogo com queijo derretido e bacon.",
    tag: "No fogo",
    icon: Sandwich,
  },
  {
    itemId: "mao-de-vaca",
    title: "Mão de Vaca com Pirão Tradicional",
    text: "Prato quente típico da culinária pernambucana.",
    tag: "Pernambucano",
    icon: Soup,
  },
  {
    itemId: "camarao-alho-oleo",
    title: "Petiscos de Respeito",
    text: "Camarão alho e óleo, batata frita e bolinhos crocantes.",
    tag: "Pra dividir",
    icon: Drumstick,
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

const CART_KEY = "ponto-da-costela:cart";

function loadCart() {
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return Object.fromEntries(
      Object.entries(parsed).filter(([id, qty]) => MENU_BY_ID[id] && qty > 0)
    );
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
   CAMADA DE FUNDO: VÍDEO 3D + BRASAS EM CANVAS
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

  const handleSourceError = () => {
    failures.current += 1;
    if (failures.current >= VIDEO_SOURCES.length) onAllSourcesFailed();
  };

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* Base quente caso poster e vídeo falhem */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,#7c2d12_0%,#1c0f0a_45%,#0f0f11_80%)]" />
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
          className={`absolute inset-0 h-full w-full transform-gpu object-cover will-change-transform transition-opacity duration-700 ${
            playing ? "opacity-100" : "opacity-70"
          }`}
        >
          {VIDEO_SOURCES.map((source) => (
            <source key={source.src} src={source.src} type={source.type} onError={handleSourceError} />
          ))}
        </video>
      )}
      {/* Overlay para legibilidade */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-[#0f0f11] backdrop-blur-sm" />
      {/* Brilho de brasa vindo de baixo + fagulhas acima do overlay */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-[radial-gradient(ellipse_at_bottom,rgba(234,88,12,0.28)_0%,rgba(220,38,38,0.12)_35%,transparent_70%)]" />
      <EmberCanvas active={!focusMode} />
    </div>
  );
}

/* ============================================================
   COMPONENTES DE UI
   ============================================================ */

function FoodImage({ src, alt, emoji, className = "" }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex items-center justify-center bg-[radial-gradient(circle_at_30%_20%,#ea580c55,#18181b_70%)] text-6xl ${className}`}
      >
        <span aria-hidden="true">{emoji}</span>
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

function SectionTitle({ eyebrow, title, subtitle, icon: Icon }) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
      <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold tracking-widest text-orange-400 uppercase">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {eyebrow}
      </span>
      <h2 className="mt-4 text-3xl font-black tracking-tight text-white md:text-5xl">{title}</h2>
      {subtitle && <p className="mt-4 text-base text-zinc-400 md:text-lg">{subtitle}</p>}
    </div>
  );
}

function Logo({ compact = false }) {
  return (
    <a href="#inicio" className="group flex items-center gap-2.5" aria-label="Ponto da Costela - início">
      <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#dc2626] to-[#ea580c] shadow-lg shadow-orange-600/40 transition-transform group-hover:scale-105">
        <Flame className="flame-flicker h-5 w-5 text-amber-100" />
        <span className="absolute -bottom-1 left-1/2 h-1 w-7 -translate-x-1/2 rounded-full bg-zinc-800 ring-1 ring-zinc-600" />
      </span>
      <span className="leading-none">
        <span className="block text-lg font-black tracking-tight text-white">
          Ponto da <span className="text-[#f59e0b]">Costela</span>
        </span>
        {!compact && (
          <span className="block text-[10px] font-semibold tracking-[0.3em] text-zinc-400 uppercase">
            Recife · Arruda
          </span>
        )}
      </span>
    </a>
  );
}

const NAV_LINKS = [
  { href: "#inicio", label: "Início" },
  { href: "#cardapio", label: "Cardápio" },
  { href: "#destaques", label: "Destaques da Brasa" },
  { href: "#horarios", label: "Horários" },
  { href: "#localizacao", label: "Localização" },
];

function AnnouncementBar({ status }) {
  const message = status.isOpen
    ? `🔥 Aberto hoje no Arruda até ${formatHour(status.closesAt)}! Venha provar a melhor costela na brasa do Recife!`
    : status.opensAt
      ? `🔥 Hoje abrimos às ${formatHour(status.opensAt)} no Arruda! Venha provar a melhor costela na brasa do Recife!`
      : "🔥 Já fechamos por hoje — amanhã tem mais costela na brasa no Arruda! Peça sua reserva.";

  return (
    <div className="relative z-50 bg-gradient-to-r from-[#dc2626] via-[#ea580c] to-[#dc2626] text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 py-2 text-center text-xs font-semibold sm:text-sm">
        <p className="line-clamp-2">{message}</p>
        <a
          href="#cardapio"
          className="shrink-0 rounded-full bg-black/25 px-3 py-1 text-xs font-bold whitespace-nowrap ring-1 ring-white/30 transition hover:bg-black/40 active:scale-95"
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
        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 transition hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenCart}
            className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10 active:scale-95"
            aria-label={`Abrir pedido (${cartCount} itens)`}
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f59e0b] px-1 text-[11px] font-black text-black">
                {cartCount}
              </span>
            )}
          </button>
          <a
            href={WHATSAPP_DEFAULT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-xl bg-gradient-to-r from-[#dc2626] to-[#ea580c] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-600/30 transition hover:shadow-orange-500/50 active:scale-95 md:inline-flex"
          >
            <WhatsAppIcon className="h-4 w-4" />
            Pedir / Reservar no WhatsApp
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white lg:hidden"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>
      {open && (
        <div className="border-t border-white/10 bg-black/80 backdrop-blur-md lg:hidden">
          <ul className="mx-auto flex max-w-7xl flex-col px-4 py-3">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-lg px-3 py-3.5 text-base font-medium text-zinc-200 active:bg-white/10"
                >
                  {link.label}
                  <ChevronRight className="h-4 w-4 text-zinc-500" />
                </a>
              </li>
            ))}
            <li className="pt-2">
              <a
                href={WHATSAPP_DEFAULT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#dc2626] to-[#ea580c] px-4 py-3.5 font-bold text-white active:scale-[0.98]"
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

function Hero() {
  const badges = [
    { icon: Star, label: `${BRAND.rating} no Google Reviews`, accent: "text-[#f59e0b]", fill: true },
    { icon: Beef, label: `+${BRAND.followers.replace("+", "")} seguidores apaixonados por churrasco`, accent: "text-[#ea580c]" },
    { icon: Beer, label: "Chopp e Cerveja Estupidamente Gelados", accent: "text-amber-300" },
  ];

  return (
    <section id="inicio" className="relative flex min-h-[calc(100svh-7rem)] scroll-mt-24 items-center">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 md:py-24">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-200 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
            </span>
            {BRAND.slogan}
          </span>
          <h1 className="mt-6 text-4xl leading-[1.05] font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
            O Verdadeiro{" "}
            <span className="bg-gradient-to-r from-[#f59e0b] via-[#ea580c] to-[#dc2626] bg-clip-text text-transparent">
              Churrasco Raiz
            </span>{" "}
            no Coração do Arruda
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-zinc-300 md:text-xl">
            Costela derretendo na brasa, petiscos fartos, hambúrguer artesanal e aquela cerveja
            trincando de gelada.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href="#cardapio"
              className="glow-btn group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#dc2626] to-[#ea580c] px-7 py-4 text-base font-bold text-white transition active:scale-[0.98]"
            >
              <UtensilsCrossed className="h-5 w-5" />
              Explorar Cardápio
              <ArrowDown className="h-4 w-4 transition group-hover:translate-y-0.5" />
            </a>
            <a
              href={WHATSAPP_DEFAULT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-7 py-4 text-base font-bold text-emerald-300 shadow-[0_0_30px_-8px_rgba(16,185,129,0.6)] backdrop-blur-md transition hover:bg-emerald-500/20 hover:shadow-[0_0_40px_-6px_rgba(16,185,129,0.8)] active:scale-[0.98]"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Pedir no WhatsApp / Delivery
            </a>
          </div>
          <ul className="mt-10 flex flex-wrap gap-3">
            {badges.map(({ icon: Icon, label, accent, fill }) => (
              <li
                key={label}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm font-medium text-zinc-200 backdrop-blur-md"
              >
                <Icon className={`h-4 w-4 ${accent}`} fill={fill ? "currentColor" : "none"} />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <a
        href="#destaques"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-xs text-zinc-400 md:flex"
        aria-label="Rolar para os destaques"
      >
        <span>Role para sentir o calor</span>
        <ArrowDown className="h-4 w-4 animate-bounce" />
      </a>
    </section>
  );
}

function Highlights({ onAdd }) {
  return (
    <section id="destaques" className="relative scroll-mt-24 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionTitle
          icon={Flame}
          eyebrow="Destaques da Brasa"
          title="Os campeões da casa"
          subtitle="Os pratos que fizeram o Arruda inteiro sentir o cheiro de brasa. Pede um, volta por todos."
        />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {HIGHLIGHTS.map((highlight) => {
            const item = MENU_BY_ID[highlight.itemId];
            const Icon = highlight.icon;
            return (
              <article
                key={highlight.itemId}
                className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-orange-500/40 hover:shadow-2xl hover:shadow-orange-600/20 ${
                  highlight.featured ? "md:col-span-2 lg:row-span-2 lg:col-span-1" : ""
                }`}
              >
                <div className={`relative overflow-hidden ${highlight.featured ? "h-64 lg:h-[26rem]" : "h-52"}`}>
                  <FoodImage
                    src={item.image}
                    alt={highlight.title}
                    emoji={item.emoji}
                    className="h-full w-full transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f11] via-[#0f0f11]/30 to-transparent" />
                  <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs font-bold text-[#f59e0b] ring-1 ring-[#f59e0b]/40 backdrop-blur">
                    <Icon className="h-3.5 w-3.5" />
                    {highlight.tag}
                  </span>
                </div>
                <div className="relative -mt-10 p-6">
                  <h3 className={`font-black text-white ${highlight.featured ? "text-2xl md:text-3xl" : "text-xl"}`}>
                    {highlight.title}
                  </h3>
                  <p className="mt-2 text-zinc-400">{highlight.text}</p>
                  <div className="mt-5 flex items-center justify-between gap-3">
                    <span className="text-sm text-zinc-500">
                      a partir de{" "}
                      <strong className="text-lg font-black text-[#f59e0b]">{money(item.price)}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => onAdd(item.id)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold text-white ring-1 ring-white/15 transition hover:bg-gradient-to-r hover:from-[#dc2626] hover:to-[#ea580c] active:scale-95"
                    >
                      <Plus className="h-4 w-4" />
                      Adicionar
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

function MenuCard({ item, quantity, onAdd, onRemove }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#18181b]/90 transition duration-300 hover:border-orange-500/40 hover:shadow-xl hover:shadow-orange-600/10">
      <div className="relative h-44 overflow-hidden">
        <FoodImage
          src={item.image}
          alt={item.name}
          emoji={item.emoji}
          className="h-full w-full transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#18181b] via-transparent to-transparent" />
        {item.popular && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-[#f59e0b] px-2.5 py-1 text-[11px] font-black tracking-wide text-black uppercase shadow-lg shadow-amber-500/30">
            <Flame className="h-3 w-3" />
            Mais Pedido
          </span>
        )}
        {item.serves && (
          <span className="absolute top-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-zinc-200 backdrop-blur">
            {item.serves}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg leading-snug font-bold text-white">{item.name}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-400">{item.description}</p>
        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="text-xl font-black text-[#f59e0b]">{money(item.price)}</span>
          {quantity > 0 ? (
            <div className="flex items-center gap-1 rounded-xl bg-white/5 p-1 ring-1 ring-orange-500/40">
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-white transition hover:bg-white/10 active:scale-90"
                aria-label={`Remover um ${item.name}`}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-6 text-center font-bold text-white" aria-live="polite">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => onAdd(item.id)}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-r from-[#dc2626] to-[#ea580c] text-white active:scale-90"
                aria-label={`Adicionar mais um ${item.name}`}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onAdd(item.id)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#dc2626] to-[#ea580c] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-600/25 transition hover:shadow-orange-500/40 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Adicionar
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function MenuSection({ cart, onAdd, onRemove }) {
  const [category, setCategory] = useState("todos");

  const counts = useMemo(() => {
    const result = { todos: MENU.length };
    MENU.forEach((item) => {
      result[item.category] = (result[item.category] || 0) + 1;
    });
    return result;
  }, []);

  const items = useMemo(
    () => (category === "todos" ? MENU : MENU.filter((item) => item.category === category)),
    [category]
  );

  return (
    <section id="cardapio" className="relative scroll-mt-24 bg-[#0f0f11]/95 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionTitle
          icon={UtensilsCrossed}
          eyebrow="Cardápio Digital"
          title="Escolha, adicione e peça no WhatsApp"
          subtitle="Monte seu pedido aqui e enviamos tudo prontinho para o nosso WhatsApp oficial. Simples assim."
        />
        <div
          role="tablist"
          aria-label="Categorias do cardápio"
          className="no-scrollbar sticky top-[68px] z-30 -mx-4 mb-8 flex gap-2 overflow-x-auto bg-[#0f0f11]/85 px-4 py-3 backdrop-blur-md sm:mx-0 sm:flex-wrap sm:justify-center sm:rounded-2xl sm:px-3"
        >
          {CATEGORIES.map(({ id, label, icon: Icon }) => {
            const active = category === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setCategory(id)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition active:scale-95 ${
                  active
                    ? "bg-gradient-to-r from-[#dc2626] to-[#ea580c] text-white shadow-lg shadow-red-600/30"
                    : "border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
                <span
                  className={`rounded-full px-1.5 text-[11px] ${active ? "bg-black/25" : "bg-white/10 text-zinc-400"}`}
                >
                  {counts[id]}
                </span>
              </button>
            );
          })}
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <MenuCard
              key={item.id}
              item={item}
              quantity={cart[item.id] || 0}
              onAdd={onAdd}
              onRemove={onRemove}
            />
          ))}
        </div>
        <p className="mt-8 text-center text-xs text-zinc-500">
          Preços e disponibilidade sujeitos a alteração. Confirme o valor final com nossa equipe no
          WhatsApp.
        </p>
      </div>
    </section>
  );
}

function HoursSection({ status }) {
  const vibes = [
    {
      icon: Tv,
      title: "Telão para os jogos",
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
      text: "Ambiente rústico, cheiro de brasa no ar e atendimento de casa cheia — como todo bom churrasco deve ser.",
    },
    {
      icon: Cake,
      title: "Família bem-vinda",
      text: "Almoço de domingo farto, porções para dividir e espaço confortável para a galera toda.",
    },
  ];

  return (
    <section id="horarios" className="relative scroll-mt-24 bg-[#0f0f11] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionTitle
          icon={Clock}
          eyebrow="Horários & Clima da Casa"
          title="A brasa acende todo dia"
          subtitle="Do almoço de domingo ao último chopp da sexta, tem sempre uma mesa esperando você."
        />
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#18181b] lg:col-span-2">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-gradient-to-r from-[#dc2626]/20 to-transparent px-6 py-5">
              <div>
                <p className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">Agora no Arruda</p>
                <p className="mt-1 text-lg font-black text-white">
                  {status.isOpen ? "Brasa acesa!" : "Brasa descansando"}
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${
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
                    className={`flex items-center justify-between gap-3 px-6 py-3.5 ${
                      isToday ? "bg-orange-500/10" : ""
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`font-semibold ${isToday ? "text-white" : "text-zinc-300"}`}>{row.day}</span>
                      {isToday && (
                        <span className="rounded-full bg-[#ea580c] px-2 py-0.5 text-[10px] font-black text-white uppercase">
                          Hoje
                        </span>
                      )}
                      {row.note && !isToday && (
                        <span className="hidden text-xs text-zinc-500 sm:inline">· {row.note}</span>
                      )}
                    </span>
                    <span className="font-mono text-sm tabular-nums">
                      <span className="text-zinc-300">{formatHour(row.open)}</span>
                      <span className="text-zinc-600"> – </span>
                      <span className={`font-bold ${lateNight ? "text-[#f59e0b]" : "text-orange-400"}`}>
                        {formatHour(row.close)}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="border-t border-white/10 px-6 py-4 text-xs text-zinc-500">
              Horário de Recife. Feriados e dias de jogo podem ter horário especial — confira no Instagram.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-3">
            {vibes.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#18181b] to-[#0f0f11] p-6 transition hover:border-orange-500/30"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#dc2626]/20 to-[#ea580c]/20 text-orange-400 ring-1 ring-orange-500/30">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{text}</p>
              </div>
            ))}
            <a
              href={WHATSAPP_DEFAULT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="glow-btn flex items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-[#dc2626] to-[#ea580c] p-6 text-white active:scale-[0.99] sm:col-span-2"
            >
              <span>
                <span className="block text-lg font-black">Vai comemorar? Reserve sua mesa</span>
                <span className="block text-sm text-orange-100">Respondemos rapidinho no WhatsApp {BRAND.whatsappDisplay}</span>
              </span>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-black/20">
                <WhatsAppIcon className="h-6 w-6" />
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
      text: "Vagas na rua em frente e nas transversais. Em dia de jogo, chegue mais cedo — a rua enche!",
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
    <section id="localizacao" className="relative scroll-mt-24 bg-[#0f0f11] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionTitle
          icon={MapPin}
          eyebrow="Localização"
          title="Vem pro Arruda!"
          subtitle="Siga o cheiro da brasa. A gente está te esperando com a mesa posta."
        />
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="relative min-h-[320px] overflow-hidden rounded-3xl border border-white/10 bg-[#18181b] lg:col-span-3 lg:min-h-[460px]">
            {!mapLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-zinc-500">
                <MapPin className="h-10 w-10 animate-bounce text-orange-500" />
                <span className="text-sm">Carregando mapa…</span>
              </div>
            )}
            <iframe
              title="Mapa do Ponto da Costela no Arruda, Recife"
              src={MAPS_EMBED_URL}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              onLoad={() => setMapLoaded(true)}
              className="absolute inset-0 h-full w-full border-0 opacity-90 grayscale-[35%] invert-[8%]"
            />
          </div>
          <div className="flex flex-col gap-4 lg:col-span-2">
            <div className="rounded-3xl border border-orange-500/30 bg-gradient-to-br from-[#dc2626]/15 via-[#18181b] to-[#18181b] p-6">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#dc2626] to-[#ea580c] text-white">
                  <MapPin className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-xl leading-snug font-black text-white">{BRAND.address}</p>
                  <p className="mt-1 text-sm text-zinc-400">CEP {BRAND.cep}</p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <a
                  href={WAZE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500/15 px-4 py-3.5 text-sm font-bold text-sky-300 ring-1 ring-sky-400/40 transition hover:bg-sky-500/25 active:scale-95"
                >
                  <Navigation className="h-4 w-4" />
                  Abrir no Waze
                </a>
                <a
                  href={GOOGLE_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-3.5 text-sm font-bold text-white ring-1 ring-white/20 transition hover:bg-white/15 active:scale-95"
                >
                  <MapPin className="h-4 w-4" />
                  Google Maps
                </a>
              </div>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {tips.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-3 rounded-2xl border border-white/10 bg-[#18181b] p-4">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#f59e0b]" />
                  <div>
                    <p className="font-bold text-white">{title}</p>
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
    <footer className="relative border-t border-white/10 bg-black">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-zinc-400">{BRAND.slogan}.</p>
            <div className="mt-4 flex items-center gap-1 text-sm text-zinc-300">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="h-4 w-4 text-[#f59e0b]" fill="currentColor" />
              ))}
              <span className="ml-1 font-semibold">{BRAND.rating}</span>
              <span className="text-zinc-500">no Google</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-bold tracking-widest text-zinc-500 uppercase">Fale com a gente</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a
                  href={WHATSAPP_DEFAULT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-zinc-300 transition hover:text-emerald-300"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                  {BRAND.whatsappDisplay}
                </a>
              </li>
              <li>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-zinc-300 transition hover:text-pink-300"
                >
                  <InstagramIcon className="h-4 w-4" />@{BRAND.instagram}
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-zinc-400">
                    {BRAND.followers} seguidores
                  </span>
                </a>
              </li>
              <li className="inline-flex items-start gap-2 text-zinc-400">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                {BRAND.address} · CEP {BRAND.cep}
              </li>
            </ul>
          </div>
          <div className="rounded-3xl border border-orange-500/20 bg-gradient-to-br from-[#dc2626]/15 to-transparent p-6">
            <Flame className="flame-flicker h-8 w-8 text-[#ea580c]" />
            <p className="mt-3 text-xl font-black text-white">A brasa tá acesa. Bora pro Arruda?</p>
            <p className="mt-2 text-sm text-zinc-400">
              Chama a turma, separa a sede e vem viver o churrasco raiz mais querido do Recife.
            </p>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold text-white ring-1 ring-white/15 transition hover:bg-white/15 active:scale-95"
            >
              <InstagramIcon className="h-4 w-4" />
              Seguir no Instagram
            </a>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-zinc-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Ponto da Costela - Recife. Todos os direitos reservados.</p>
          <p className="inline-flex items-center gap-1">
            Feito com <Heart className="h-3 w-3 text-[#dc2626]" fill="currentColor" /> e muita brasa no Arruda.
          </p>
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

function CartDrawer({ open, onClose, cart, onAdd, onRemove, onDelete, onClear }) {
  const [orderType, setOrderType] = useState("delivery");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const closeButtonRef = useRef(null);

  const lines = useMemo(
    () =>
      Object.entries(cart)
        .filter(([id, qty]) => MENU_BY_ID[id] && qty > 0)
        .map(([id, qty]) => ({ ...MENU_BY_ID[id], qty, subtotal: MENU_BY_ID[id].price * qty })),
    [cart]
  );
  const total = useMemo(() => lines.reduce((sum, line) => sum + line.subtotal, 0), [lines]);
  const itemCount = useMemo(() => lines.reduce((sum, line) => sum + line.qty, 0), [lines]);

  const whatsappUrl = useMemo(() => {
    const typeLabel = ORDER_TYPES.find((t) => t.id === orderType)?.label ?? "";
    const parts = [
      "Olá, Ponto da Costela! 🔥 Gostaria de fazer um pedido:",
      "",
      ...lines.map((line) => `• ${line.qty}x ${line.name} — ${money(line.subtotal)}`),
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
        className={`absolute top-0 right-0 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#18181b] shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#dc2626] to-[#ea580c] text-white">
              <ShoppingBag className="h-5 w-5" />
            </span>
            <div>
              <p className="text-lg font-black text-white">Seu pedido</p>
              <p className="text-xs text-zinc-400">
                {itemCount} {itemCount === 1 ? "item" : "itens"}
              </p>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-zinc-300 transition hover:bg-white/10 active:scale-95"
            aria-label="Fechar pedido"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-500/10 text-orange-400">
              <Flame className="flame-flicker h-10 w-10" />
            </span>
            <p className="text-lg font-bold text-white">A grelha ainda está vazia</p>
            <p className="text-sm text-zinc-400">
              Adicione a costela, uns petiscos e aquele chopp gelado. A gente cuida do resto.
            </p>
            <a
              href="#cardapio"
              onClick={onClose}
              className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#dc2626] to-[#ea580c] px-5 py-3 font-bold text-white active:scale-95"
            >
              <UtensilsCrossed className="h-4 w-4" />
              Ver Cardápio
            </a>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
              <ul className="space-y-3">
                {lines.map((line) => (
                  <li key={line.id} className="flex gap-3 rounded-2xl border border-white/10 bg-black/20 p-3">
                    <FoodImage
                      src={line.image}
                      alt={line.name}
                      emoji={line.emoji}
                      className="h-16 w-16 shrink-0 rounded-xl text-3xl"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm leading-snug font-bold text-white">{line.name}</p>
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
                        <div className="flex items-center gap-1 rounded-lg bg-white/5 p-0.5 ring-1 ring-white/10">
                          <button
                            type="button"
                            onClick={() => onRemove(line.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-white active:scale-90"
                            aria-label={`Diminuir ${line.name}`}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-6 text-center text-sm font-bold text-white">{line.qty}</span>
                          <button
                            type="button"
                            onClick={() => onAdd(line.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-md text-white active:scale-90"
                            aria-label={`Aumentar ${line.name}`}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <span className="font-black text-[#f59e0b]">{money(line.subtotal)}</span>
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
                  <legend className="mb-2 text-xs font-bold tracking-widest text-zinc-400 uppercase">
                    Como você quer?
                  </legend>
                  <div className="grid grid-cols-3 gap-2">
                    {ORDER_TYPES.map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setOrderType(id)}
                        aria-pressed={orderType === id}
                        className={`flex flex-col items-center gap-1 rounded-xl px-2 py-3 text-xs font-bold transition active:scale-95 ${
                          orderType === id
                            ? "bg-orange-500/15 text-orange-300 ring-1 ring-orange-500/60"
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
                  <span className="mb-1.5 block text-xs font-bold tracking-widest text-zinc-400 uppercase">
                    Seu nome
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Como te chamamos?"
                    autoComplete="name"
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-base text-white placeholder:text-zinc-600 focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
                  />
                </label>
                {orderType === "delivery" && (
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold tracking-widest text-zinc-400 uppercase">
                      Endereço de entrega
                    </span>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Rua, número, bairro e referência"
                      autoComplete="street-address"
                      className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-base text-white placeholder:text-zinc-600 focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
                    />
                  </label>
                )}
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold tracking-widest text-zinc-400 uppercase">
                    Observações
                  </span>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Ponto da carne, troco, sem cebola…"
                    className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-base text-white placeholder:text-zinc-600 focus:border-orange-500/60 focus:ring-2 focus:ring-orange-500/20 focus:outline-none"
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
                <span className="font-bold text-white">Total estimado</span>
                <span className="text-2xl font-black text-[#f59e0b]">{money(total)}</span>
              </div>
              {needsAddress && (
                <p className="mb-3 flex items-center gap-1.5 text-xs text-amber-300/80">
                  <Sparkles className="h-3.5 w-3.5" />
                  Dica: informe o endereço para agilizar a entrega.
                </p>
              )}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-4 text-base font-black text-black shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400 active:scale-[0.98]"
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
    <div className="fixed bottom-4 left-4 z-40 flex items-center gap-1 rounded-2xl border border-white/10 bg-black/60 p-1 backdrop-blur-md pb-[max(0.25rem,env(safe-area-inset-bottom))] sm:pb-1">
      {!videoFailed && (
        <button
          type="button"
          onClick={onTogglePlay}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-300 transition hover:bg-white/10 hover:text-white active:scale-95"
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
        className={`flex h-10 items-center gap-2 rounded-xl px-3 text-xs font-semibold transition active:scale-95 ${
          focusMode ? "bg-orange-500/20 text-orange-300" : "text-zinc-300 hover:bg-white/10 hover:text-white"
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
        className="fixed right-4 bottom-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-black shadow-xl shadow-emerald-500/40 transition hover:scale-105 active:scale-95 mb-[env(safe-area-inset-bottom)]"
      >
        <WhatsAppIcon className="h-7 w-7" />
      </a>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="glow-btn fixed right-4 bottom-4 z-40 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-[#dc2626] to-[#ea580c] py-3 pr-5 pl-3 text-white transition active:scale-95 mb-[env(safe-area-inset-bottom)]"
      aria-label={`Ver pedido: ${count} itens, ${money(total)}`}
    >
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-black/25">
        <ShoppingBag className="h-5 w-5" />
        <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f59e0b] px-1 text-[11px] font-black text-black">
          {count}
        </span>
      </span>
      <span className="text-left leading-tight">
        <span className="block text-[11px] font-semibold text-orange-100">Ver pedido</span>
        <span className="block font-black">{money(total)}</span>
      </span>
    </button>
  );
}

function Toast({ message }) {
  return (
    <div
      aria-live="polite"
      className={`pointer-events-none fixed top-20 left-1/2 z-[70] -translate-x-1/2 transition-all duration-300 ${
        message ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
      }`}
    >
      {message && (
        <div className="flex items-center gap-2 rounded-full border border-emerald-400/30 bg-black/85 px-4 py-2.5 text-sm font-semibold text-white shadow-xl backdrop-blur-md">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-black">
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
  @keyframes flame-flicker {
    0%, 100% { transform: scale(1) rotate(-2deg); opacity: 1; }
    25% { transform: scale(1.08, 0.96) rotate(2deg); opacity: .9; }
    50% { transform: scale(0.96, 1.06) rotate(-1deg); opacity: 1; }
    75% { transform: scale(1.04) rotate(1deg); opacity: .92; }
  }
  .flame-flicker { animation: flame-flicker 1.6s ease-in-out infinite; transform-origin: 50% 90%; }
  @keyframes ember-glow {
    0%, 100% { box-shadow: 0 0 22px -4px rgba(234, 88, 12, .65), 0 0 0 0 rgba(220, 38, 38, .35); }
    50% { box-shadow: 0 0 38px -2px rgba(245, 158, 11, .75), 0 0 0 6px rgba(220, 38, 38, 0); }
  }
  .glow-btn { animation: ember-glow 2.8s ease-in-out infinite; }
  .glow-btn:hover { filter: brightness(1.08); }
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

  const addItem = (id) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    const item = MENU_BY_ID[id];
    if (item) showToast(`${item.name} adicionado!`);
  };

  const removeItem = (id) => {
    setCart((prev) => {
      const qty = (prev[id] || 0) - 1;
      const next = { ...prev };
      if (qty > 0) next[id] = qty;
      else delete next[id];
      return next;
    });
  };

  const deleteItem = (id) => {
    setCart((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const { cartCount, cartTotal } = useMemo(() => {
    let count = 0;
    let total = 0;
    Object.entries(cart).forEach(([id, qty]) => {
      const item = MENU_BY_ID[id];
      if (!item) return;
      count += qty;
      total += item.price * qty;
    });
    return { cartCount: count, cartTotal: total };
  }, [cart]);

  const closeCart = useMemo(() => () => setCartOpen(false), []);

  return (
    <div className="relative isolate min-h-screen overflow-x-clip bg-transparent font-sans text-zinc-100 antialiased selection:bg-orange-500/40">
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
        <Hero />
        <Highlights onAdd={addItem} />
        <MenuSection cart={cart} onAdd={addItem} onRemove={removeItem} />
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
      <Toast message={cartOpen ? "" : toast} />
      <CartDrawer
        open={cartOpen}
        onClose={closeCart}
        cart={cart}
        onAdd={addItem}
        onRemove={removeItem}
        onDelete={deleteItem}
        onClear={() => setCart({})}
      />
    </div>
  );
}
