// ══════════════════════════════════════════════════════════════════════
// Bancos de perguntas — Marcador de Consumo Alimentar (SISVAN)
// ══════════════════════════════════════════════════════════════════════

const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

// ── Menores de 6 meses ─────────────────────────────────────────────────
const Q06 = [
  { id: "peito",    txt: "Tomou leite do peito?" },
  { id: "mingau",   txt: "Consumiu mingau?" },
  { id: "agua",     txt: "Consumiu água/chá?" },
  { id: "lvaca",    txt: "Consumiu leite de vaca?" },
  { id: "formula",  txt: "Consumiu fórmula infantil?" },
  { id: "suco",     txt: "Consumiu suco de fruta?" },
  { id: "fruta",    txt: "Consumiu fruta?" },
  { id: "comidsal", txt: "Consumiu comida de sal?" },
  { id: "outros",   txt: "Consumiu outros alimentos/bebidas?" },
];

// ── 6 a 23 meses ──────────────────────────────────────────────────────
const Q623 = [
  { id: "peito",       txt: "Tomou leite do peito?" },
  { id: "fruta",       txt: "Comeu fruta inteira, em pedaço ou amassada?", sub: { type: "vez", id: "fruta_v" } },
  { id: "comidsal",    txt: "Comeu comida de sal (de panela, papa ou sopa)?", sub: { type: "vezcons", idvez: "comidsal_v", idcons: "comidsal_c" } },
  { id: "oleite",      txt: "Consumiu outro leite que não o leite do peito?" },
  { id: "mingau",      txt: "Consumiu mingau com leite?" },
  { id: "iogurte",     txt: "Consumiu iogurte?" },
  { id: "legumes",     txt: "Consumiu legumes?" },
  { id: "alaranj",     txt: "Consumiu vegetal/fruta alaranjada ou folhas verdes-escuras?" },
  { id: "folha",       txt: "Consumiu verdura de folha?" },
  { id: "carne",       txt: "Consumiu carne ou ovo?" },
  { id: "figado",      txt: "Consumiu fígado?" },
  { id: "feijao",      txt: "Consumiu feijão?" },
  { id: "arroz",       txt: "Consumiu arroz, batata, inhame, aipim, farinha ou macarrão?" },
  { id: "hamburguer",  txt: "Consumiu hambúrguer e/ou embutidos?" },
  { id: "bebadoc",     txt: "Consumiu bebidas adoçadas?" },
  { id: "salgado",     txt: "Consumiu macarrão instantâneo, salgadinhos ou biscoitos salgados?" },
  { id: "biscoito",    txt: "Consumiu biscoito recheado, doces ou guloseimas?" },
];

// ── 2 anos ou mais / Adulto / Gestante / Idoso ───────────────────────
const Q2P = [
  { id: "tv",          txt: "Faz refeições assistindo TV/celular/computador?" },
  { id: "refeicoes",   txt: "Refeições realizadas no dia:", type: "meal" },
  { id: "feijao",      txt: "Consumiu feijão?" },
  { id: "frutas",      txt: "Consumiu frutas frescas?" },
  { id: "verduras",    txt: "Consumiu verduras e/ou legumes?" },
  { id: "hamburguer",  txt: "Consumiu hambúrguer e/ou embutidos?" },
  { id: "bebadoc",     txt: "Consumiu bebidas adoçadas?" },
  { id: "salgado",     txt: "Consumiu macarrão instantâneo, salgadinhos ou biscoitos salgados?" },
  { id: "biscoito",    txt: "Consumiu biscoito recheado, doces ou guloseimas?" },
];

// ── Constantes auxiliares ─────────────────────────────────────────────
const MEALS = ["Café da manhã", "Lanche da manhã", "Almoço", "Lanche da tarde", "Jantar", "Ceia"];
const CONS_OPTS = ["Em pedaços", "Amassada", "Passada na peneira", "Liquidificada", "Só o caldo", "Não sabe"];
