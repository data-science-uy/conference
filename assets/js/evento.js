/* Programa público actualizado con la grilla y las fichas compartidas. */
const EVENTO_TRACKS = {
  1: { name: "Track 1", location: "Auditorio LATU" },
  2: { name: "Track 2", location: "Club Emprendedor · Las Orquídeas" }
};
const EVENTO_PLACEHOLDER = "../assets/images/speakers/evento-placeholder.svg";
const participant = (name, role = "Speaker", details = {}) => ({ name, role, photo: EVENTO_PLACEHOLDER, ...details });
const EVENTO_SPEAKERS = {
  mauro: participant("Mauro D. Ríos", "Speaker", {
    title: "Technological Key Opinion Leader (KOL)",
    photo: "../assets/images/speakers/2026/mauro-rios.webp",
    linkedin: "https://www.linkedin.com/in/maurodrios/",
    funFact: "Siente debilidad por escribir, investigar y enseñar."
  }),
  emanuele: participant("Emanuele Luzio", "Speaker", {
    title: "Machine Learning Engineer",
    photo: "../assets/images/speakers/2026/emanuele-luzio.webp",
    linkedin: "https://www.linkedin.com/in/emanueleluzio-ph-d/",
    funFact: "Su helado favorito es el chocolate."
  }),
  sofia: participant("Sofia Valli B", "Speaker", {
    title: "Senior ML Engineer",
    photo: "../assets/images/speakers/2026/sofia-valli.webp",
    linkedin: "https://www.linkedin.com/in/sofia-valli-barreto/",
    funFact: "Es fan de las ballenas y las noctilucas."
  }),
  joaquin: participant("Joaquin Gonzalez", "Speaker", {
    title: "PhD",
    photo: "../assets/images/speakers/2026/joaquin-gonzalez.webp"
  }),
  rodrigo: participant("Rodrigo Sastre", "Speaker", {
    title: "Co-founder",
    photo: "../assets/images/speakers/2026/rodrigo-sastre.webp",
    linkedin: "https://www.linkedin.com/in/rodrigo-sastre-2797672b0/",
    funFact: "De niño quería ser cantante, Dexter (el del laboratorio) o cajero de supermercado."
  }),
  diego: participant("Diego de Fuentes", "Speaker", {
    title: "CTO · Licenciado en Sistemas", institution: "GeneXus Consulting",
    photo: "../assets/images/speakers/2026/diego-de-fuentes.webp",
    linkedin: "https://www.linkedin.com/in/diego-de-fuentes-b6613156/",
    funFact: "Es fan de Nacional y de las motos."
  })
};
const EVENTO_PANELISTS = {
  marcos: participant("Marcos Soto", "Panelista", {
    title: "Engineering Manager, Machine Learning and AI", institution: "Xmartlabs / Universidad Loyola Andalucía",
    photo: "../assets/images/speakers/2026/marcos-soto.webp", linkedin: "https://www.linkedin.com/in/marcosesoto/"
  }),
  bruno: participant("Bruno Tomás Caracini", "Panelista", {
    title: "AI Lead Engineer", institution: "Blend360",
    photo: "../assets/images/speakers/2026/bruno-caracini.webp", linkedin: "https://www.linkedin.com/in/bruno-tomas-caracini/"
  }),
  guillermo: participant("Guillermo Varela", "Panelista", {
    title: "Vicepresidente", institution: "Marvik",
    photo: "../assets/images/speakers/2026/guillermo-varela.webp", linkedin: "https://www.linkedin.com/in/guillermovarelauruguay/"
  }),
  lorena: participant("Lorena Marotta", "Panelista", {
    title: "Solution Architect", institution: "SunnyData",
    photo: "../assets/images/speakers/2026/lorena-marotta.webp", linkedin: "https://www.linkedin.com/in/lorena-marotta-4b086342/"
  }),
  matias: participant("Matias Di Martino", "Panelista", {
    title: "Director Científico del Centro Vidart", institution: "Centro Vidart",
    photo: "../assets/images/speakers/2026/matias-di-martino.webp", linkedin: "https://www.linkedin.com/in/j-matias-di-martino-7a6582170/"
  }),
  ignacio: participant("Ignacio Lynch", "Panelista", {
    title: "Economista / Coordinador Académico de Postgrados / CEO", institution: "UM / Octopus Data Solutions",
    photo: "../assets/images/speakers/2026/ignacio-lynch.webp", linkedin: "https://www.linkedin.com/in/ignaciolynch"
  })
};
const EVENTO_MODERATORS = {
  franz: participant("Franz Mayr", "Moderador", {
    title: "Machine Learning Engineer · PhD en IA",
    photo: "../assets/images/about-us/franz.png", linkedin: "https://www.linkedin.com/in/franz-mayr-ojeda/"
  }),
  leandro: participant("Leandro Dominguez", "Moderador", {
    title: "Machine Learning Engineer",
    photo: "../assets/images/about-us/lea.png", linkedin: "https://www.linkedin.com/in/leandro-dominguez/"
  })
};
const EVENTO_AGENDA = [
  { id: "acreditacion", start: "10:00", end: "10:30", title: "Recepción y acreditación", type: "break" },
  { id: "bienvenida", start: "10:30", end: "10:55", title: "Bienvenida", type: "break" },
  {
    id: "ia-pensar", start: "11:00", end: "11:40", track: 1,
    title: "¿Puede la IA pensar? De Turing y ChatGPT hasta la consciencia real", participants: [EVENTO_SPEAKERS.mauro], confirmed: true,
    description: "¿Qué tan cerca está la IA de pensar o tener consciencia? A partir de Turing, Searle, Penrose y Dreyfus, Mauro propone una mirada interdisciplinaria sobre sus capacidades y límites, más allá del marketing. Una charla para desmitificar la tecnología y distinguir la sofisticación estadística actual del horizonte de una inteligencia artificial general."
  },
  {
    id: "leaf-values", start: "11:00", end: "11:40", track: 2,
    title: "Leaf Values as Coordinates: Exact Contrastive Explanation for Gradient-Boosted Ensembles", participants: [EVENTO_SPEAKERS.emanuele], confirmed: true,
    description: "Un ensamble de gradient boosting suma un valor de hoja por árbol. Emanuele propone leer esos valores como coordenadas: en ese espacio, el modelo actúa linealmente. Así, la diferencia entre dos predicciones puede explicarse de forma exacta y rastrearse hasta divisiones concretas de los árboles, sin ajustar otro modelo ni recurrir al muestreo."
  },
  { id: "coffee-manana", start: "11:40", end: "12:00", title: "Coffee break", location: "Hall del auditorio", type: "break" },
  {
    id: "panel-pensamiento", start: "12:00", end: "13:00", type: "panel",
    title: "¿Estamos tercerizando nuestra capacidad de pensar?", label: "Panel 1",
    participants: [EVENTO_PANELISTS.marcos, EVENTO_PANELISTS.guillermo, EVENTO_PANELISTS.ignacio, EVENTO_MODERATORS.franz],
    description: "Una conversación sobre cómo el uso cotidiano de la inteligencia artificial puede transformar nuestro pensamiento, nuestro criterio y la forma en que tomamos decisiones."
  },
  { id: "almuerzo", start: "13:00", end: "14:30", title: "Almuerzo", location: "Hall del auditorio", type: "break" },
  {
    id: "genexus", start: "14:30", end: "15:10", track: 1,
    title: "De la Software Factory a la Agentic Factory", participants: [EVENTO_SPEAKERS.diego], confirmed: true,
    label: "Charla patrocinada", sponsor: "GeneXus Consulting",
    description: "Diego recorre el camino de una Software Factory a una Agentic Factory: desde los asistentes individuales hasta agentes que participan en un método compartido. La charla aborda cómo empezar a transformar una fábrica de software para trabajar con agentes. Pensada para líderes de consultoras, responsables de desarrollo y delivery, referentes técnicos y arquitectos, y también para analistas funcionales y responsables de producto."
  },
  {
    id: "data-governance", start: "14:30", end: "15:10", track: 2,
    title: "Data governance en la era agéntica", participants: [EVENTO_SPEAKERS.rodrigo], confirmed: true,
    description: "Los agentes de IA necesitan entender qué datos tiene una organización, qué significan, de dónde vienen y bajo qué condiciones pueden usarlos. Rodrigo explora cómo construir una capa semántica que les permita trabajar con criterio y cómo su actividad puede enriquecerla. Una mirada desde data governance para diseñar soluciones agénticas confiables sobre información distribuida."
  },
  {
    id: "navier-stokes", start: "15:15", end: "15:55", track: 1,
    title: "El problema del milenio de Navier-Stokes, fisica, AI y drama", participants: [EVENTO_SPEAKERS.sofia], confirmed: true,
    description: "Una mirada a la solución con IA anunciada para el enigma de Navier–Stokes, uno de los problemas del milenio. Sofía recorre su ciencia, su historia y las disputas que la rodean, incluidas acusaciones de plagio y dilemas éticos. La charla invita a discutir cómo la IA transforma la producción de conocimiento y qué responsabilidades plantea."
  },
  {
    id: "inferencia-cientifica", start: "15:15", end: "15:55", track: 2,
    title: "Aprendizaje profundo para la inferencia científica", participants: [EVENTO_SPEAKERS.joaquin], confirmed: true,
    description: "Joaquín presenta dos problemas abiertos de la neurociencia contemporánea en los que su investigación con aprendizaje profundo sugiere avances cualitativos. La charla aborda la identificación de conexiones monosinápticas in vivo y el registro sin contacto de parámetros fisiológicos en animales. Un recorrido por aplicaciones concretas de estas arquitecturas en la frontera de la inferencia científica."
  },
  { id: "coffee-tarde", start: "15:55", end: "16:20", title: "Coffee break y merienda", location: "Hall del auditorio", type: "break" },
  {
    id: "panel-soberania", start: "16:20", end: "17:20", type: "panel",
    title: "¿Pueden Uruguay y la región tener soberanía en IA?", label: "Panel 2",
    participants: [EVENTO_PANELISTS.bruno, EVENTO_PANELISTS.lorena, EVENTO_PANELISTS.matias, EVENTO_MODERATORS.leandro],
    description: "Un intercambio sobre las capacidades, los desafíos y las oportunidades de Uruguay y la región para desarrollar autonomía y soberanía en inteligencia artificial."
  },
  { id: "cierre", start: "17:20", end: "18:00", title: "Cierre y sorpresas", type: "break" }
];

const agenda = document.getElementById("track-agenda");
const tabs = [...document.querySelectorAll(".track-tab")];
const dialog = document.getElementById("talk-dialog");
let selectedTrack = 1;
let previousBodyOverflow = "";

function span(className, text) {
  const element = document.createElement("span");
  element.className = className;
  element.textContent = text;
  return element;
}

function eventTime(item) {
  return `${item.start}${item.end ? ` – ${item.end}` : ""}`;
}

function renderAgenda(track, announce = false) {
  selectedTrack = track;
  for (const tab of tabs) {
    const active = Number(tab.dataset.track) === track;
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
  }
  agenda.setAttribute("aria-labelledby", `tab-${track}`);
  document.getElementById("track-location").textContent = `${EVENTO_TRACKS[track].name} · ${EVENTO_TRACKS[track].location}`;
  const fragment = document.createDocumentFragment();
  for (const item of EVENTO_AGENDA.filter(item => !item.track || item.track === track)) {
    const isBreak = item.type === "break";
    const card = document.createElement(isBreak ? "article" : "button");
    card.className = `agenda-card agenda-card--${isBreak ? "break" : "talk"}${item.sponsor ? " agenda-card--sponsored" : ""}`;
    card.dataset.event = item.id;
    if (item.sponsor) card.append(span("card-sponsor", `Presentada por ${item.sponsor}`));
    const top = document.createElement("span");
    top.className = "card-top";
    top.append(span("card-time", eventTime(item)));
    if (!isBreak) {
      top.append(span(`card-tag card-tag--${item.track ? `track-${item.track}` : "shared"}`, item.track ? `Track ${item.track}` : "Ambos tracks · Panel"));
    }
    card.append(top, span("card-title", item.title));
    if (item.location) card.append(span("card-location", item.location));
    if (!isBreak) {
      card.type = "button";
      card.setAttribute("aria-haspopup", "dialog");
      const speakers = item.participants.filter(person => person.role !== "Moderador");
      card.append(span("card-speakers", speakers.map(person => person.name).join(" · ")));
      const moderator = item.participants.find(person => person.role === "Moderador");
      if (moderator) card.append(span("card-moderator", `Modera: ${moderator.name}`));
      const footer = document.createElement("span");
      footer.className = "card-footer";
      footer.append(span("card-label", item.label || "Charla"));
      const action = span("card-action", "Ver charla");
      const arrow = span("", "↗");
      arrow.setAttribute("aria-hidden", "true");
      action.append(arrow);
      footer.append(action);
      card.append(footer);
      card.addEventListener("click", () => openTalk(item));
    }
    fragment.append(card);
  }
  agenda.replaceChildren(fragment);
  if (announce) document.getElementById("agenda-announcement").textContent = `Agenda del ${EVENTO_TRACKS[track].name}. Sala: ${EVENTO_TRACKS[track].location}. Las actividades compartidas se muestran en ambos tracks.`;
}

function openTalk(item) {
  const kind = document.getElementById("dialog-kind");
  kind.textContent = item.track ? `Track ${item.track} · ${item.label || "Charla"}` : item.label;
  if (item.sponsor) kind.textContent += ` por ${item.sponsor}`;
  kind.dataset.track = item.track || "shared";
  document.getElementById("dialog-title").textContent = item.title;
  document.getElementById("dialog-meta").textContent = `${eventTime(item)} · ${item.track ? EVENTO_TRACKS[item.track].location : "Auditorio LATU · Actividad compartida"}`;
  document.getElementById("dialog-description").textContent = item.description;
  const participants = document.getElementById("dialog-participants");
  participants.replaceChildren();
  for (const person of item.participants) {
    const profile = document.createElement("div");
    profile.className = "participant-card";
    const row = document.createElement("div");
    row.className = "participant";
    const photo = document.createElement("img");
    photo.src = person.photo;
    photo.alt = person.photo === EVENTO_PLACEHOLDER ? "Foto por confirmar" : `Foto de ${person.name}`;
    photo.width = 80;
    photo.height = 96;
    const copy = document.createElement("div");
    copy.className = "participant-copy";
    if (person.role === "Moderador" || person.role === "Panelista") copy.append(span("participant-badge", person.role));
    copy.append(span("participant-name", person.name), span("participant-role", person.title || person.role));
    if (person.institution) copy.append(span("participant-institution", person.institution));
    if (person.linkedin) {
      const link = document.createElement("a");
      link.className = "participant-link";
      link.href = person.linkedin;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "LinkedIn ↗";
      link.setAttribute("aria-label", `LinkedIn de ${person.name}`);
      copy.append(link);
    }
    row.append(photo, copy);
    profile.append(row);
    if (person.funFact) {
      const fact = document.createElement("p");
      fact.className = "participant-fact";
      fact.append(span("participant-fact-label", "Dato de color"), document.createTextNode(person.funFact));
      profile.append(fact);
    }
    participants.append(profile);
  }
  previousBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  dialog.showModal();
  dialog.scrollTop = 0;
}

tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => renderAgenda(Number(tab.dataset.track), true));
  tab.addEventListener("keydown", event => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    renderAgenda(Number(tabs[next].dataset.track), true);
    tabs[next].focus();
  });
});
document.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});
dialog.addEventListener("close", () => { document.body.style.overflow = previousBodyOverflow; });
renderAgenda(selectedTrack);
