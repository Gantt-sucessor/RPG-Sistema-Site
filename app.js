const { useState, useEffect, useMemo, useCallback } = React;

/* =================================================================================
   HUNTER × NEN — GERADOR DE FICHAS
   Sistema de RPG "Hunter X Nen RPG v0.8.6" por César Querubim de Castro
   ================================================================================= */

const ATTRIBUTES = [
  { key: "forca", label: "Força", short: "FOR", desc: "Capacidade muscular, atletismo, combate corpo a corpo" },
  { key: "vigor", label: "Vigor", short: "VIG", desc: "Resistência física, pontos de vida, fôlego" },
  { key: "destreza", label: "Destreza", short: "DEX", desc: "Agilidade, armas à distância, reflexos" },
  { key: "intelecto", label: "Intelecto", short: "INT", desc: "Raciocínio, memória, estratégia" },
  { key: "carisma", label: "Carisma", short: "CAR", desc: "Persuasão, intimidação, presença social" },
];

const SKILLS = [
  { key: "atletismo", label: "Atletismo", attr: "forca" },
  { key: "duelo", label: "Duelo", attr: "forca" },
  { key: "robustez", label: "Robustez", attr: "vigor" },
  { key: "resistencia", label: "Resistência", attr: "vigor" },
  { key: "furtividade", label: "Furtividade", attr: "destreza" },
  { key: "acrobacia", label: "Acrobacia", attr: "destreza" },
  { key: "reflexos", label: "Reflexos", attr: "destreza" },
  { key: "pontaria", label: "Pontaria", attr: "destreza" },
  { key: "roubo", label: "Roubo", attr: "destreza" },
  { key: "caca", label: "Caça", attr: "intelecto" },
  { key: "investigacao", label: "Investigação", attr: "intelecto" },
  { key: "medicina", label: "Medicina", attr: "intelecto" },
  { key: "profissao", label: "Profissão", attr: "intelecto" },
  { key: "astucia", label: "Astúcia", attr: "intelecto" },
  { key: "persuasao", label: "Persuasão", attr: "carisma" },
  { key: "intimidacao", label: "Intimidação", attr: "carisma" },
  { key: "vontade", label: "Vontade", attr: "carisma" },
  { key: "intuicao", label: "Intuição", attr: "carisma" },
  { key: "tenacidade", label: "Tenacidade", attr: "carisma" },
  { key: "controle_nen", label: "Controle de Nen", attr: "variavel" },
];

const NEN_CONTROL_ATTR_BY_HATSU = {
  intensificacao: "vigor",
  emissao: "forca",
  transmutacao: "destreza",
  manipulacao: "carisma",
  materializacao: "intelecto",
  especializacao: null,
};

const HATSU_TYPES = [
  { key: "intensificacao", label: "Intensificação", personality: "Direto, determinado, simples" },
  { key: "emissao", label: "Emissão", personality: "Extrovertido, temperamental, imprevisível" },
  { key: "manipulacao", label: "Manipulação", personality: "Controlador, lógico, observador" },
  { key: "materializacao", label: "Materialização", personality: "Nervoso, mentiroso, analítico" },
  { key: "transmutacao", label: "Transmutação", personality: "Volúvel, enganoso, imprevisível" },
  { key: "especializacao", label: "Especialização", personality: "Independente, carismático, individualista" },
];

const HATSU_AFFINITIES = {
  intensificacao: { intensificacao: 100, emissao: 80, transmutacao: 80, manipulacao: 60, materializacao: 60, especializacao: 0 },
  emissao: { emissao: 100, intensificacao: 80, manipulacao: 80, transmutacao: 60, materializacao: 40, especializacao: 0 },
  transmutacao: { transmutacao: 100, intensificacao: 80, materializacao: 80, emissao: 60, manipulacao: 40, especializacao: 0 },
  manipulacao: { manipulacao: 100, emissao: 80, intensificacao: 60, materializacao: 60, transmutacao: 40, especializacao: 0 },
  materializacao: { materializacao: 100, transmutacao: 80, manipulacao: 60, intensificacao: 60, emissao: 40, especializacao: 0 },
  especializacao: { especializacao: 100, manipulacao: 80, materializacao: 80, transmutacao: 60, emissao: 60, intensificacao: 40 },
};

const ORIGINS = {
  treinado_hunter: {
    label: "Treinado por Hunter",
    blurb: "Você cresceu sob a tutela de um Hunter, aprendendo Nen desde cedo, porém isso gerou complicações sociais.",
    attrBonus: { type: "choice", points: 3, allowed: ["forca", "vigor", "destreza", "intelecto"] },
    trainedSkills: { fixed: ["caca", "duelo", "pontaria", "controle_nen"], extraByIntellect: true },
    drawback: "Isolamento: escolha 1 perícia de Carisma para ter -5. No início de cada combate, role Vontade; se <15, fica Abalado na 1ª rodada.",
    subchoices: {
      label: "Qual Hunter treinou você?",
      key: "mentor",
      options: [
        { key: "biscuit", label: "Biscuit Krueger", desc: "Treinamento físico e aprimoramento de Nen. +1 em bônus de técnicas básicas (Ten/Ren/Zetsu/Hatsu); 1x/dia técnica 'Cookie' recupera 2d6 PV após descanso curto. +1 Reputação Associação Hunter." },
        { key: "kite", label: "Kite", desc: "Sobrevivência e adaptabilidade. 1x/dia no início de combate, role 1d6 para conjurar arma especial (2d6 dano) que dura o combate. +1 Reputação Associação Hunter." },
        { key: "morel", label: "Morel Mackernasey", desc: "Estratégia e controle de campo. 1x/dia cria nuvem de fumaça (3m raio): +2 Furtividade, 2 clones de fumaça (2 rodadas), +2 defesa. +1 Reputação Associação Hunter." },
        { key: "wing", label: "Wing", desc: "Ensino e fundamentos de Nen. Aprende técnicas de Nen 25% mais rápido; começa com 1 técnica avançada adicional (Gyo/In/En/Shu/Ken). +1 Reputação Comunidade de Nen." },
        { key: "ging", label: "Ging Freecss", desc: "Arqueologia e intuição. +2 em Investigação. 1x/dia teste de Intuição (DT 18) para dica sobre mistério atual. +1 Reputação Associação Hunter." },
        { key: "knov", label: "Knov", desc: "Infiltração e extração. 1x/dia cria porta dimensional ligando local atual a outro já visitado (até 1km), dura 1 min. +1 Reputação Associação Hunter." },
        { key: "izunavi", label: "Izunavi", desc: "Controle de Nen e eficiência. Gasta 1 PA menos em qualquer habilidade Hatsu (mín. 2). 1x/dia 'Fluxo de Aura' por 3 rodadas: custo de Nen -2 (mín. 3). +1 Reputação Comunidade de Nen." },
      ],
    },
  },

  criminoso: {
    label: "Criminoso",
    blurb: "Você não foi a pessoa mais gentil, mas era a única forma de sobreviver.",
    attrBonus: { type: "fixed_plus_choice", fixed: { destreza: 2 }, points: 1, allowed: ["forca", "intelecto", "carisma"] },
    trainedSkills: { fixed: ["furtividade", "roubo", "persuasao"], extraByIntellect: true },
    drawback: "Procurado: escolha nível de notoriedade (Pequeno Infrator -5 testes sociais c/ autoridades locais; Criminoso Conhecido recompensa 100.000J; Infame recompensa +500.000J, procurado em vários países).",
    subchoices: {
      label: "Especialização criminosa",
      key: "especializacao_crime",
      options: [
        { key: "ladrao_elite", label: "Ladrão de Elite", desc: "+3 em Roubo (arrombamento/furto/desarmar armadilhas). Avalia valor de itens preciosos (Intelecto DT 15). +1 Trupe Fantasma / -1 Governo Mundial." },
        { key: "assassino", label: "Assassino de Aluguel", desc: "Ataque surpreso causa +2d6 de dano; alvo faz Vigor DT 15 ou sangra por 2 rodadas. +1 Máfia / -1 Governo Mundial." },
        { key: "falsificador", label: "Falsificador", desc: "Cria documentos/itens falsos (DT 20 p/ identificar). Identifica falsificações (Intelecto DT 15). +1 Trupe Fantasma / -1 Governo Mundial." },
        { key: "hacker", label: "Hacker", desc: "+3 em testes com sistemas eletrônicos/segurança. Recupera dados deletados (Intelecto, DT variável). +1 Máfia / -1 Governo Mundial." },
        { key: "vigarista", label: "Vigarista", desc: "+3 em Persuasão ao mentir; +3 em Intuição para detectar mentiras. 'Mestre do Disfarce' (2 PA): +2 Persuasão. +1 Máfia / -1 Governo Mundial." },
      ],
    },
  },

  ninja: {
    label: "Ninja",
    blurb: "Treinamento rigoroso desde criança. 'Não importa o método, sempre complete a missão.'",
    attrBonus: { type: "fixed", fixed: { forca: 1, vigor: 1, destreza: 1 } },
    trainedSkills: { fixed: ["robustez", "tenacidade"], choiceOneOf: ["duelo", "pontaria"], extraByIntellect: true },
    drawback: "Peso do treino: durante descanso (exceto hospedagem privativa), recupera apenas 50% de PV e Aura.",
    subchoices: {
      label: "Clã Ninja",
      key: "cla_ninja",
      options: [
        { key: "shinobi_nevoa", label: "Clã Shinobi da Névoa", desc: "Assassinato silencioso/técnicas aquáticas. 1x/cena cria névoa (5m raio, 2 rodadas): +3 Furtividade, crítico -2. Respira debaixo d'água 10min, nada na vel. terrestre. +2 Reputação Clãs Ninja." },
        { key: "koga", label: "Clã Koga", desc: "Venenos e armadilhas. Cria veneno (Medicina DT 15, 10min): 1d6/rodada por 3 rodadas. Identifica venenos (DT 12); +3 resistir venenos. Armadilhas simples (5min, Caça DT 15 p/ detectar). +2 Reputação Clãs Ninja." },
        { key: "iga", label: "Clã Iga", desc: "Infiltração e disfarce. Cria disfarces em 20min: +5 Persuasão para se passar por outra pessoa. Imita vozes após observar 20min. Escala superfícies verticais sem equipamento (½ velocidade). +2 Reputação Clãs Ninja." },
        { key: "momochi", label: "Clã Momochi", desc: "Combate com múltiplas armas. Saca arma como ação livre, nunca desarmado. Todas armas: peso -1 (mín 2), crítico -1. +2 Reputação Clãs Ninja." },
      ],
    },
  },

  trabalhador: {
    label: "Trabalhador",
    blurb: "Não nasceu em família prestigiada nem foi treinado por Hunter, mas sempre sonhou em se tornar um.",
    attrBonus: { type: "choice", points: 2, allowed: ["forca", "vigor", "destreza", "intelecto", "carisma"] },
    trainedSkills: { fixed: ["profissao", "vontade"], choiceCount: 1, extraByIntellect: true },
    drawback: "Apenas um civil: começa com 2 pontos de atributo bônus ao invés de 3 (já refletido acima).",
    subchoices: {
      label: "Carreira anterior",
      key: "carreira",
      options: [
        { key: "medico_enfermeiro", label: "Médico/Enfermeiro", desc: "1x/cena estabiliza um morrendo (ação livre). 3x/cena cura 2d6+Intelecto PV. Identifica doenças/venenos (Medicina DT 15). +1d6 dano em crítico (conhecimento anatômico). +1 Reputação Governo Mundial." },
        { key: "engenheiro_mecanico", label: "Engenheiro/Mecânico", desc: "Cria ferramentas improvisadas/repara equipamentos (Intelecto, DT variável). +3 para achar passagens secretas/avaliar estruturas. +1 Reputação Governo Mundial." },
        { key: "professor_pesquisador", label: "Professor/Pesquisador", desc: "1x/sessão teste de Intelecto (DT 15) p/ conhecimento específico. Aprende idiomas em metade do tempo. +informação extra ao investigar (Intelecto DT 15). +1 Reputação Governo Mundial." },
        { key: "artesao_artista", label: "Artesão/Artista", desc: "+3 em Caça (notar detalhes) e Profissão (criação de itens). Cria obras de arte vendáveis por 1d6×10.000J (1 dia + materiais). +1 Reputação Governo Mundial." },
        { key: "comerciante_negociante", label: "Comerciante/Negociante", desc: "+3 para avaliar valor de itens; compra com 15% desconto / vende 15% mais. Rede de contatos comerciais. +1 Reputação Governo Mundial." },
        { key: "agricultor_cacador", label: "Agricultor/Caçador", desc: "+3 em Caça. Precisa de metade de comida/água. Sofre metade das penalidades climáticas. +1 Reputação Governo Mundial." },
      ],
    },
  },

  formiga_quimera: {
    label: "Formiga Quimera",
    blurb: "Espécie nativa do Continente Negro, reprodução por Fagogênese — cada formiga é única.",
    attrBonus: { type: "choice", points: 4, allowed: ["forca", "vigor", "destreza", "intelecto", "carisma"] },
    trainedSkills: { fixed: ["atletismo", "robustez", "resistencia"], choiceOneOf: ["duelo", "pontaria"], extraByIntellect: true },
    drawback: "Preconceito: dobro de dificuldade no Exame Hunter. -10 em testes sociais com quem odeia formigas quimera; em combate, costuma ser focado por esses inimigos. Escolha 1 perícia de Carisma para ter -5.",
    racialBonus: "Bônus racial: +10 PV iniciais, +2 PV por nível.",
    subchoices: {
      label: "Linhagem (define também a aparência)",
      key: "linhagem",
      options: [
        { key: "inseto", label: "Linhagem de Inseto", desc: "Exoesqueleto: +2 resistência a dano físico. Antenas: +3 Intuição. Escolha 2: Asas (voo 9m vertical) / Mandíbulas (1d8 ação livre, perfurante) / Camuflagem Natural (+3 Furtividade natureza) / Visão Composta (+2 Caça, todas direções). +2 Rep. Formigas Quimera, -2 com todas as outras." },
        { key: "felina", label: "Linhagem Felina", desc: "+3 Reflexos e Acrobacia; sempre cai em pé (½ dano de queda). Escolha 2: Garras Retráteis (1d10 cortante) / Visão Noturna (18m) / Olfato Apurado (+3 rastreamento) / Salto Poderoso (triplo distância). +2 Rep. Formigas Quimera, -2 com todas as outras." },
        { key: "reptil", label: "Linhagem Réptil", desc: "+3 resistência a dano cortante/perfurante. Hibernação: recupera tudo em descanso curto. Escolha 2: Veneno (1d4/3 rodadas) / Regeneração (1x/cena 1d8 PV) / Língua Bifurcada (detectar inimigos) / Camuflagem (+2 Furtividade). +2 Rep. Formigas Quimera, -2 com todas as outras." },
        { key: "aquatica", label: "Linhagem Aquática", desc: "Respira/nada debaixo d'água indefinidamente, mergulha profundo sem dano. +2 atributos físicos debaixo d'água. Escolha 2: Eletrolocação (+5 Caça aquática) / Pele Escorregadia (+3 escapar agarrões) / Bioluminescência (luz 5m) / Jato d'Água (empurra 5m). +2 Rep. Formigas Quimera, -2 com todas as outras." },
        { key: "hibrida", label: "Linhagem Híbrida", desc: "+5 resistência a 1 tipo de dano escolhido; sobrevive em ambientes hostis sem penalidade. Escolha 3 características de quaisquer outras linhagens. +2 Rep. Formigas Quimera, -2 com todas as outras." },
      ],
    },
  },

  herdeiro: {
    label: "Herdeiro",
    blurb: "Você nasceu em uma família prestigiada. Escolha um clã/família.",
    attrBonus: null, // varia por clã, tratado em subchoices
    trainedSkills: null, // varia por clã
    subchoices: {
      label: "Clã / Família",
      key: "cla_herdeiro",
      options: [
        {
          key: "kurta", label: "Clã Kurta",
          desc: "Os olhos escarlates. Praticamente extinto pela Trupe Fantasma; só resta 1 membro vivo no cânone (Kurapika) — você é outro sobrevivente ou herdeiro do legado.",
          attrBonus: { type: "fixed_plus_choice", fixed: { carisma: 2 }, points: 1, allowed: ["forca", "vigor", "destreza", "intelecto", "carisma"] },
          trainedSkills: { fixed: ["atletismo", "robustez", "resistencia"], choiceOneOf: ["duelo", "pontaria"], extraByIntellect: true },
          drawback: "Vingança: ao avistar Tserriednich Hui Guo Rou você ataca por impulso. Exibir os olhos atrai caçadores de recompensa.",
          special: "Olhos Escarlates: ativam por choque emocional, quase-morte, ou ativação forçada (Controle de Nen DT18, 1x/sessão). Ativos: +1 em todos atributos; dificuldade de testes desce 1 nível; usa todos tipos de Hatsu a 100%. Custo: 1 PA para ativar + 4 PA/rodada mantendo.",
        },
        {
          key: "zoldyck", label: "Família Zoldyck",
          desc: "Assassinos profissionais há gerações, montanha Kukuroo. Treinamento cruel desde a infância.",
          attrBonus: { type: "choice", points: 3, allowed: ["forca", "vigor", "destreza", "intelecto", "carisma"] },
          trainedSkills: { fixed: ["caca", "intimidacao", "robustez"], extraByIntellect: true },
          drawback: "Legado Sombrio: sede de sangue — se não matar em 3 dias, -1 em todos atributos; após 7 dias ataca aleatoriamente. -3 Persuasão / +3 Intimidação quando identidade é revelada.",
          special: "Bônus do treinamento: imune a Dano Massivo. Ganha 1 técnica de assassinato a cada 5 níveis (Golpe Silencioso lvl1, Passos das Sombras lvl5, Toque Paralisante lvl10, Aura Assassina OU Punho Serpente lvl15).",
        },
        {
          key: "lunaris", label: "Clã Lunaris",
          desc: "Clã pequeno na floresta de sequoias do continente Yorbian. Poder ligado ao ciclo lunar.",
          attrBonus: { type: "fixed_plus_choice", fixed: { intelecto: 1, carisma: 1 }, points: 1, allowed: ["forca", "vigor", "destreza", "intelecto", "carisma"] },
          trainedSkills: { fixed: ["vontade", "caca"], choiceOneOf: ["duelo", "pontaria"], extraByIntellect: true },
          drawback: "Luz do dia: fica Abalado durante o dia.",
          special: "Habilidades por fase lunar (todas usáveis): Crescente (+1 Destreza, treinado em perícias de Destreza), Minguante (+40% PV máx temporário), Nova (+1 Intelecto, treinado em perícias de Intelecto), Cheia (todos bônus anteriores por 1d8+2 rodadas, ódio quase incontrolável — ataca aliados se combate não terminar antes).",
        },
        {
          key: "pyrox", label: "Clã Pyrox",
          desc: "Clã antigo e prestigiado, cidade de Flaméria. Dom da chama nato.",
          attrBonus: { type: "fixed", fixed: { vigor: 2, forca: 1 } },
          trainedSkills: { fixed: ["robustez", "duelo", "controle_nen"], extraByIntellect: true },
          drawback: "Sensibilidade ao frio: clima <10°C, -1 em todos os atributos.",
          special: "Aquecimento (ação de movimento, 3 fases progressivas, mantém bônus anteriores): Fase 1 (+1 Força, +2 testes Força, 3 dano/rodada); Fase 2 (+xd4 dano de fogo ao atacar, x=½ nível, 6 dano/rodada); Fase 3 (atacantes tomam 4d4 fogo, dano adicional xd4 = nível, 8d6 dano/rodada). Reseta após combate.",
        },
      ],
    },
  },
};
// ===================== CLASSES (TIPOS DE HUNTER) =====================
// pv: {init, perLevel} sem contar Vigor — Vigor é somado em runtime
// pa: {init, perLevel} sem contar Carisma — Carisma é somado em runtime
// defenseBase: número fixo, soma-se Destreza + Equipamentos em runtime

const CLASSES = {
  tesouros: {
    label: "Hunter de Tesouros",
    blurb: "Especializado em localizar e coletar itens raros, antiguidades e tesouros escondidos.",
    trainedSkills: { fixed: ["caca", "persuasao", "controle_nen"], choiceCount: 2 },
    pv: { init: 16, perLevel: 5 },
    pa: { init: 7, perLevel: 4 },
    defenseBase: 14,
    startingMoney: 100000,
    startingMoneyNote: "Pequeno Tesouro: +100.000J e 1 artefato de 1 estrela à escolha, além da habilidade base.",
    baseAbility: {
      name: "Olho do Tesouro",
      desc: "Teste de Caça (DT do mestre) para detectar fraquezas do inimigo ou avaliar veracidade de algo. Se superar a DT:",
      levels: [
        { lvl: 1, text: "Aliado recebe +2 em ataques contra o inimigo identificado, incluindo você. Custo: 2 PA." },
        { lvl: 4, text: "Bônus sobe para +1 dado e +2 em ataques. Custo: 4 PA." },
        { lvl: 8, text: "Além dos bônus anteriores, +2 de defesa para você (aprendeu o padrão de ataque do inimigo). Custo: 8 PA." },
        { lvl: 12, text: "Pode criar um artefato (discutir com mestre): 1★ no lvl 12, 2★ no lvl 13, 3★ no lvl 14, especial no lvl 15." },
        { lvl: 15, text: "+5 em qualquer teste de Caça; se passar da DT, discerne PV e Aura do inimigo. Bônus ao aliado agora é +2 dados e +3 no ataque. Custo: 15 PA." },
      ],
    },
    abilityPool: [
      { name: "Postura Defensiva", desc: "Ação de movimento: ativa postura defensiva, +3 em Reflexos." },
      { name: "Perito à Distância", desc: "+2 em qualquer habilidade à distância (Nen, armas de fogo, etc). Em ataques à distância, adiciona x ao dano (x = nível do personagem)." },
      { name: "Pechincheiro", desc: "Ao negociar redução de preço, teste de Persuasão +7. Sucesso = desconto baseado no resultado; falha = vendedor recusa vender." },
      { name: "Território Aprimorado", desc: "Requer técnica En. Ativação: ação padrão + 4 PA, custo 4 PA/rodada para manter. Em 6m: habilidades de aura custam -1 PA (mín 1); todos ganham 2 resistência a dano; 1x/cena pode dar nova chance a aliado que errou ataque." },
      { name: "Tiro Duplo", desc: "Dispara 2x com 1 ação padrão (2º tiro com metade do dano). Usável x vezes/cena, x = Intelecto." },
      { name: "Vendedor Nato", desc: "Ao vender algo, teste de Persuasão +7; preço depende do resultado." },
      { name: "Aproveitador", desc: "Usa artefatos a 200%: qualquer bônus de tesouro é duplicado." },
      { name: "Rastreador", desc: "1x/dia em cenas de investigação, teste de Investigação +7 para encontrar artefato (DT e tesouro definidos pelo mestre)." },
      { name: "Conhecimento Antigo", desc: "1x/sessão teste de Intelecto (DT variável) para lembrar informações sobre ruínas/artefatos/história antiga." },
      { name: "Sentido de Armadilha", desc: "Ação bônus: por 30min, +5 detectar armadilhas; se passar Caça DT 15, sente armadilhas em raio de 10m." },
      { name: "Restauração de Artefato", desc: "Toca artefato quebrado e gasta PA: restaura por 1d4 dias/rodadas (uso único depois)." },
      { name: "Visão do Passado", desc: "Requer lvl 5. Custo 5 PA. Toca objeto/estrutura antiga, teste de Controle de Nen (DT variável) para visualizar flashes do passado." },
      { name: "Inventário Engenhoso", desc: "Adiciona x à carga máxima (x = Carisma×3); itens de mais de 1 espaço têm tamanho reduzido em 1." },
      { name: "Linguista", desc: "+7 em Intuição/Investigação para decifrar idiomas ou enigmas desconhecidos." },
      { name: "Artesão", desc: "Em cena de interlúdio, ao invés de curar PV, modifica arma (+xd6 dano) ou armadura (+x defesa); x = Carisma ou Intelecto. Dura 1 dia." },
      { name: "Treinamento", desc: "Escolha 2 perícias para se tornar treinado. Pode ser escolhida várias vezes." },
    ],
    levelUpTable: [
      "OLHO DO TESOURO LVL 1", "HABILIDADE DE CLASSE", "HABILIDADE DE CLASSE", "OLHO DO TESOURO LVL 4",
      "1 PONTO DE ATRIBUTO", "HABILIDADE DE CLASSE", "HABILIDADE DE CLASSE", "OLHO DO TESOURO LVL 8",
      "HABILIDADE DE CLASSE", "1 PONTO DE ATRIBUTO", "HABILIDADE DE CLASSE", "OLHO DO TESOURO LVL 12",
      "HABILIDADE DE CLASSE", "HABILIDADE DE CLASSE", "OLHO DO TESOURO LVL 15 + 1 PONTO DE ATRIBUTO",
    ],
  },

  recompensas: {
    label: "Hunter de Recompensas",
    blurb: "Especializado em localizar e caçar alvos para ganhar recompensas do contratante.",
    trainedSkills: { fixed: ["caca", "furtividade", "controle_nen"], choiceCount: 2 },
    pv: { init: 18, perLevel: 6 },
    pa: { init: 6, perLevel: 3 },
    defenseBase: 15,
    startingMoney: 80000,
    startingMoneyNote: "Recompensa: começa com 80.000 jennys.",
    special: "Ficha de Alvos: mestre e jogador escolhem 1-5 alvos por missão, com recompensas associadas.",
    baseAbility: {
      name: "Mestre Furtivo",
      desc: "",
      levels: [
        { lvl: 1, text: "+2 em qualquer teste de Furtividade. Ataque contra inimigo desprevenido: -7 na defesa dele (em vez de -5). Ataque furtivo bem-sucedido: +xd4 dano (x=Destreza)." },
        { lvl: 4, text: "Sacrificando 1 rodada de combate, analisa o inimigo: crítico reduzido em 2 contra ele pelo resto do combate (apenas 1 alvo por vez)." },
        { lvl: 8, text: "Para todos os alvos na 'ficha de alvos', +7 em todos os testes contra eles." },
        { lvl: 12, text: "Ataque furtivo agora causa xd8 de dano (x = Destreza)." },
        { lvl: 15, text: "1x/sessão pode pedir informação útil ao contratante (bônus decidido pelo mestre). Gastando 5 PA ao acertar, impõe qualquer condição física por 1 rodada. +5 em Furtividade. x = Destreza+1." },
      ],
    },
    abilityPool: [
      { name: "Caçador Nato", desc: "Gasta 3 PA para +3 em teste de Caça." },
      { name: "Ataque Surpresa", desc: "Contra alvo desprevenido em ataque furtivo: 1 ataque extra. Usável x vezes/cena (x=Destreza). Custo: 5 PA." },
      { name: "Olhar Penetrante", desc: "Ação padrão: Intuição vs Persuasão do alvo. Sucesso: +3 defesa por 1d4 rodadas contra ele. Usável x vezes/cena (x=Destreza)." },
      { name: "Negociação Astuta", desc: "+5 em testes de negociação; melhores condições em contratos." },
      { name: "Ceifador Cruel", desc: "Ao executar alguém: +10 PV e +3 PA. Ao matar oponente já rendido: +20 PV e +6 PA." },
      { name: "Mãos Leves", desc: "+5 em qualquer teste de Roubo." },
      { name: "Golpe Sujo", desc: "Ao atingir um inimigo, escolha: Cegar (-3 próximo ataque dele), Desequilibrar (cai no chão), ou Desarmar (Duelo DT15). Usável x vezes/cena (x=Destreza)." },
      { name: "Aura do Pavor", desc: "Requer técnica En. 1x/cena, ação padrão, 3 PA: inimigos em 6m fazem Vontade vs Controle de Nen ou ficam vulneráveis e não atacam por 1d4 rodadas (proteger aliado custa 2 PA cada)." },
      { name: "Rastreador Implacável", desc: "Cria 'conexão de rastreamento' a partir de vestígio (Caça DT 15+1/dia desde o vestígio). Mantém por 24h gastando 4 PA/hora; sabe direção e distância (até 5km)." },
      { name: "Algemas de Aura", desc: "Custo 4 PA. Toca oponente: Controle de Nen vs Defesa. Sucesso: alvo Imóvel + custo de Nen dele +2 PA, por 2 rodadas ou até quebrar (Duelo DT 20)." },
      { name: "Rede de Contatos", desc: "1x/sessão Persuasão/Intimidação (DT variável) para informações sobre um alvo." },
      { name: "Captura Viva", desc: "Custo 5 PA. Ataque com -5 de penalidade: se acertar, alvo faz Vigor (DT 15+mod) ou fica lesionado 1d4 rodadas. Não funciona em alvos com >75% PV." },
      { name: "Especialista em Explosivos", desc: "+5 em testes com explosivos; +xd6 dano (x=Destreza)." },
      { name: "Ataque Cirúrgico", desc: "Em ataque furtivo, gasta 2 PA para causar sangramento 1d3 rodadas. Usável x vezes/cena (x=Destreza)." },
      { name: "Desarme Rápido", desc: "Ação livre: teste de Duelo para desarmar ao atacar." },
      { name: "Treinamento", desc: "Escolha 2 perícias para se tornar treinado. Pode ser escolhida várias vezes." },
    ],
    levelUpTable: [
      "MESTRE FURTIVO LVL 1", "HABILIDADE DE CLASSE", "HABILIDADE DE CLASSE", "MESTRE FURTIVO LVL 4",
      "1 PONTO DE ATRIBUTO", "HABILIDADE DE CLASSE", "HABILIDADE DE CLASSE", "MESTRE FURTIVO LVL 8",
      "HABILIDADE DE CLASSE", "1 PONTO DE ATRIBUTO", "HABILIDADE DE CLASSE", "MESTRE FURTIVO LVL 12",
      "HABILIDADE DE CLASSE", "HABILIDADE DE CLASSE", "MESTRE FURTIVO LVL 15 + 1 PONTO DE ATRIBUTO",
    ],
  },

  bestas: {
    label: "Hunter de Bestas",
    blurb: "Especializado em domar e treinar animais selvagens, usando-os em combate ou como auxílio.",
    trainedSkills: { fixed: ["caca", "vontade", "controle_nen"], choiceCount: 2 },
    pv: { init: 11, perLevel: 3 },
    pa: { init: 8, perLevel: 5 },
    defenseBase: 12,
    startingMoney: 0,
    baseAbility: {
      name: "Vínculo",
      desc: "",
      levels: [
        { lvl: 1, text: "Ganha besta selvagem de ameaça baixa. +2 em Controle de Nen." },
        { lvl: 4, text: "Pode evoluir a besta selvagem em 1 nível de ameaça." },
        { lvl: 8, text: "Pode criar besta de Nen de 1 estrela (personificação da sua personalidade)." },
        { lvl: 12, text: "Pode capturar bestas selvagens (custo de comando dobrado, não sobem de nível). Todas as bestas sobem 1 nível/estrela." },
        { lvl: 15, text: "+5 em Controle de Nen. Cria besta de Nen de 3 estrelas (oposto da sua personalidade). Todas bestas no nível máximo. Com 2 bestas de Nen, desbloqueia 'Fusão'." },
      ],
    },
    bestLimitByLevel: [{ lvl: 1, n: 1 }, { lvl: 4, n: 2 }, { lvl: 8, n: 3 }, { lvl: 12, n: 4 }, { lvl: 15, n: 5 }],
    abilityPool: [
      { name: "Sintonia Bestial", desc: "Para cada besta a até 3m de você, +1 de defesa." },
      { name: "Comando Eficaz", desc: "Custo 3 PA. Ao comandar uma besta, se houver outra adjacente, pode comandá-la também com ação padrão." },
      { name: "Besta Produtiva", desc: "Custo 5 PA, ação de comando + padrão. Besta escolhida ganha ação adicional (movimento ou padrão). 1x/rodada. Usos/cena = Intelecto da besta." },
      { name: "Domador de Bestas", desc: "+1 dado em Controle de Nen/Caça para capturar/domesticar. Captura Rápida (8 PA, ação padrão): tenta capturar besta selvagem com <50% PV." },
      { name: "Vínculo de Regeneração", desc: "Ação padrão, custo 5 PA, 2x/cena: besta recupera 1d6 + Vigor + Controle de Nen do Hunter." },
      { name: "Comando a Distância", desc: "Comanda bestas a até 15m (em vez de 9m)." },
      { name: "Transferência de Aura", desc: "Requer técnica En. Ativação 3 PA: besta ganha +1 dado em atributos físicos e +2 defesa. Manter custa 5 PA/rodada. Apenas 1 besta por vez." },
      { name: "Comando Favorito", desc: "Cada besta tem habilidade favorita com custo reduzido: -1 PA/fadiga (baixa/1★), -2 (média/2★), -4 (alta/3★)." },
      { name: "Comunicação Animal", desc: "Custo 1 PA: comunica-se de forma básica com animais não-mágicos por 10 minutos." },
      { name: "Sentidos Aguçados", desc: "Custo 5 PA, ação bônus: aguça um sentido por 10min (visão 2km, audição ultrassônica, etc). +5 em Caça relacionado." },
      { name: "Mimicry", desc: "Custo 4 PA, ação padrão: manifesta característica animal (garras, brânquias, etc) por 10min/2 rodadas. Apenas 1 por vez (Transmutação)." },
      { name: "Adaptação Ambiental", desc: "Custo 4 PA: resistência a ambiente hostil escolhido; +5 Robustez relacionado. Trocar tipo custa 1 PA adicional." },
      { name: "Resistência Animal", desc: "Custo 3 PE. Besta recebe resistência x a dano físico por 2 rodadas (x = Vigor da besta)." },
      { name: "Aprendizado", desc: "Escolha uma besta: ganha 1 habilidade nova a cada 3 níveis. Pode ser escolhida de novo para outras bestas." },
      { name: "Treinamento (besta)", desc: "Escolha 2 perícias para sua besta se tornar treinada. Pode ser escolhida várias vezes." },
      { name: "Treinamento", desc: "Escolha 2 perícias (suas) para ser treinado. Pode ser escolhida várias vezes." },
    ],
    levelUpTable: [
      "VÍNCULO LVL 1", "HABILIDADE DE CLASSE", "HABILIDADE DE CLASSE", "VÍNCULO LVL 4",
      "1 PONTO DE ATRIBUTO", "HABILIDADE DE CLASSE", "HABILIDADE DE CLASSE", "VÍNCULO LVL 8",
      "HABILIDADE DE CLASSE", "1 PONTO DE ATRIBUTO", "HABILIDADE DE CLASSE", "VÍNCULO LVL 12",
      "HABILIDADE DE CLASSE", "HABILIDADE DE CLASSE", "VÍNCULO LVL 15 + 1 PONTO DE ATRIBUTO",
    ],
  },

  medico: {
    label: "Hunter Médico",
    blurb: "Especializado em fornecer assistência médica, com habilidades de cura e conhecimentos avançados.",
    trainedSkills: { fixed: ["caca", "medicina", "controle_nen"], choiceCount: 2 },
    pv: { init: 12, perLevel: 4 },
    pa: { init: 6, perLevel: 4 },
    defenseBase: 12,
    startingMoney: 70000,
    startingMoneyNote: "Tratamentos: começa com 70.000 jennys.",
    baseAbility: {
      name: "Suporte de Auras",
      desc: "",
      levels: [
        { lvl: 1, text: "Aura medicinal cura aliados (não você): ação padrão + 2 PA cura xd6 PV (x = Intelecto), usável x vezes/cena. +2 em testes de Medicina." },
        { lvl: 4, text: "Pode se curar também. Gastando 4 PA, cura qualquer condição física negativa (exceto morrendo, lesionado, condições de origem)." },
        { lvl: 8, text: "Adquire Aura Energética: 4 PA concede 2 pontos em qualquer atributo (por turno/hora de uso)." },
        { lvl: 12, text: "Aura medicinal cura xd8 (6 PA); Aura energética agora concede 3 pontos de atributo (6 PA/turno)." },
        { lvl: 15, text: "8 PA: cura xd10 (x=Intelecto+1). Aura energética: +4 pontos de atributo (máx 2 por atributo) por 8 PA/turno. +5 em qualquer teste de Medicina." },
      ],
    },
    abilityPool: [
      { name: "Ampliar Aura", desc: "A cada 2 PA adicionais ao curar, cura 1 pessoa extra até 1,5m (cura dividida em 2)." },
      { name: "Cura Eficaz", desc: "Ao rolar dados de cura, se tirar 1 ou 2, pode rolar novamente." },
      { name: "Cura Energética", desc: "Investindo 2 PA extra na cura, alvo curado ganha +1 em atributo escolhido por 1d3 rodadas (1x por pessoa)." },
      { name: "Recuperação Rápida", desc: "Ao usar aura medicinal em si mesmo, recupera um dado adicional." },
      { name: "Dissipação de Venenos", desc: "Ao curar com aura medicinal, gasta 4 PA extra para neutralizar todos os venenos do alvo (eficácia depende do veneno)." },
      { name: "Terapia", desc: "Cura condições mentais também (exceto Abalado)." },
      { name: "Tratamento Rápido", desc: "Gasta 3 PA para usar aura medicinal como ação de movimento." },
      { name: "Ressuscitação", desc: "1x/cena, reação: a até 5m de alguém que cai, gasta 8 PA para levantá-lo instantaneamente e curar com aura medicinal." },
      { name: "Estimulante de Aura", desc: "Custo 5 PA: toca alvo voluntário e transfere energia — alvo recupera 3d6 PA. Alvo sofre -1 em Controle de Nen por 1h depois. 1x/dia por pessoa." },
      { name: "Diagnóstico Avançado", desc: "Examina por 1min: identifica 100% qualquer doença/veneno/maldição/anomalia de Nen, gravidade e tratamentos (raras exigem Medicina DT 18)." },
      { name: "Cirurgia de Campo", desc: "1x/cena: tira alvo de 'morrendo' sem testes." },
      { name: "Transferência de Vitalidade", desc: "Sacrifica seus PV para curar alvo tocado (1 PV seu = 2 PV do alvo, até metade do seu PV máximo). Seu dano não cura por meios normais por 24h." },
      { name: "Aprimoramento Cirúrgico", desc: "4 PA ao curar: Adrenalina (+3 Destreza, 2 rodadas) ou Congestão (+3 Força, 2 rodadas)." },
      { name: "Acelerar Pulso", desc: "+1 em todos atributos físicos por 3 rodadas. Usável 2x/cena." },
      { name: "Antídoto Universal", desc: "Custo 8 PA: cria antídoto (ação padrão) que neutraliza qualquer veneno e cura 3d6. Armazenável por 24h. Peso 1." },
      { name: "Treinamento", desc: "Escolha 2 perícias para se tornar treinado. Pode ser escolhida várias vezes." },
    ],
    levelUpTable: [
      "SUPORTE DE AURAS LVL 1", "HABILIDADE DE CLASSE", "HABILIDADE DE CLASSE", "SUPORTE DE AURAS LVL 4",
      "1 PONTO DE ATRIBUTO", "HABILIDADE DE CLASSE", "HABILIDADE DE CLASSE", "SUPORTE DE AURAS LVL 8",
      "HABILIDADE DE CLASSE", "1 PONTO DE ATRIBUTO", "HABILIDADE DE CLASSE", "SUPORTE DE AURAS LVL 12",
      "HABILIDADE DE CLASSE", "HABILIDADE DE CLASSE", "SUPORTE DE AURAS LVL 15 + 1 PONTO DE ATRIBUTO",
    ],
  },

  duelista: {
    label: "Hunter Duelista",
    blurb: "O ápice da perícia Duelo. Mestres do combate, sempre ansiosos por um desafio.",
    trainedSkills: { fixed: ["caca", "duelo", "controle_nen"], choiceCount: 2 },
    pv: { init: 22, perLevel: 9 },
    pa: { init: 4, perLevel: 2 },
    defenseBase: 16,
    startingMoney: 60000,
    startingMoneyNote: "Briga de Rua: começa com 60.000 jennys.",
    baseAbility: {
      name: "Duelista Nato",
      desc: "",
      levels: [
        { lvl: 1, text: "Ganha 'Adaptação ao Combate' (nível 1) e +2 em Duelo." },
        { lvl: 4, text: "Aprende um Estilo de Luta." },
        { lvl: 8, text: "Adaptação ao Combate evolui para nível 2." },
        { lvl: 12, text: "Escolhe um estilo de luta adicional; multiplicador de crítico +1 com qualquer arma." },
        { lvl: 15, text: "+5 em qualquer teste de Duelo; +1 ponto extra em atributo físico. Adaptação ao Combate atinge nível máximo (3)." },
      ],
    },
    combatAdaptation: {
      lvl1: { warmup: "+2 no ataque após 1 rodada", adapt: "+2 defesa contra 1 inimigo após 3 rodadas", unstoppable: "+1 dado em ataques e +1 dado de dano após 5 rodadas" },
      lvl2: { warmup: "+3 no ataque após 1 rodada", adapt: "+3 defesa contra 1 inimigo após 3 rodadas", unstoppable: "3 PA: ataque extra (ação livre); ao acertar: 'Se ajoelhe!!' (3 PA, alvo cai) ou 'É pra doer!!' (4 PA, sangra 2 rodadas)" },
      lvl3: { warmup: "+1 dado no ataque após 1 rodada", adapt: "+3 defesa + 3 resistência a dano contra 1 inimigo após 3 rodadas", unstoppable: "Ataque extra (ação livre), +1 dado de dano, + 'Atormentar' (5 PA, crítico: alvo não ataca quem você escolher por 1 rodada) e 'Nem Doeu' (10 PA, 1x/sessão, ignora metade de dano que levaria ½ ou mais da vida)" },
    },
    fightingStyles: [
      { name: "Tanque", desc: "+15 PV + nível do personagem. Ganha habilidade 'Proteger'." },
      { name: "Berserker", desc: "+4d4 dano adicional, mas deve atacar ao menos 1x/rodada ou ataca a si mesmo." },
      { name: "Escorpião Veloz", desc: "+3 Reflexos, +5 testes de resistência de Destreza, movimento dobrado." },
      { name: "Cobra", desc: "+5 para agarrar; sem desvantagem ao atacar agarrado/agarrando." },
      { name: "Mantis", desc: "+3 defesa. Contra-Ataque: ao defender com sucesso corpo a corpo, reação para atacar com dano dobrado." },
      { name: "Aranha", desc: "+3 Acrobacia/Furtividade. Teia Tática: ação padrão, Duelo vs Defesa — alvo fica Lento até fim da próxima rodada dele." },
      { name: "Guepardo", desc: "+3 Pontaria. Disparo Focado: 1x/rodada, se não se mover, próximo ataque à distância +1 dado de dano." },
      { name: "Coruja", desc: "+3 Intuição/Astúcia. Olhar Desestabilizador: 4 PA, ação padrão, Vontade DT 10+nível ou alvo tem -1 dado no próximo ataque." },
    ],
    abilityPool: [
      { name: "Lutador Aplicado", desc: "Escolhe 1 estilo de luta adicional. Pode ser escolhida 2x." },
      { name: "Mestre da Luta", desc: "Cria seu próprio estilo de luta (balancear com o mestre). Apenas 1x." },
      { name: "Observador", desc: "Quando inimigo erra ataque em você, gasta 2 PA + reação para atacar com +3 no dano." },
      { name: "Proteger", desc: "Aliado a 4,5m que recebe ataque: reação + 3 PA para você receber metade do dano." },
      { name: "Pugilista", desc: "Dano desarmado 2d6+FOR (em vez de 1d4+FOR); gasta 3 PA para +1d6 adicional (máx 3 dados)." },
      { name: "Arsenalista", desc: "+5 de dano com armas de fogo." },
      { name: "Golpe Devastador", desc: "Custo 7 PA. Ação padrão, ataque corpo a corpo com -5 penalidade: se acertar, dobro do dano. Usável x vezes/cena (x=mod FOR). Gasta PA mesmo se errar." },
      { name: "Combatente Versátil", desc: "Trocar estilo de luta não dá -5 nos testes." },
      { name: "Contra-Ataque Preciso", desc: "Quando oponente erra ataque corpo a corpo, reação: ataque com +2 e +1d4 dano adicional." },
      { name: "Fluxo de Combate", desc: "Custo 3 PA/rodada, por 3 rodadas: ação de movimento adicional/turno, sem provocar oportunidade ao mover, +2 Reflexos." },
      { name: "De Ferro", desc: "+2 PV por nível." },
      { name: "Mestre de Armas", desc: "Requer lvl 8, 4 FOR ou 4 DEX. Ataca com 2 armas em 1 ação (2º ataque -50% dano)." },
      { name: "Chama da Determinação", desc: "Após choque emocional grande, +2 em todos atributos por 5 rodadas." },
      { name: "Resistência Voraz", desc: "Ao ser atingido, ação livre: Robustez (DT 15+nível ameaça); sucesso = +1 resistência a dano contra esse inimigo. Máx 5x/alvo." },
      { name: "Desarme Potente", desc: "Teste de Duelo contra inimigo para desarmar; se ganhar, arma voa até 9m." },
      { name: "Treinamento", desc: "Escolha 2 perícias para se tornar treinado. Pode ser escolhida várias vezes." },
    ],
    levelUpTable: [
      "DUELISTA NATO LVL 1", "HABILIDADE DE CLASSE", "HABILIDADE DE CLASSE", "DUELISTA NATO LVL 4",
      "1 PONTO DE ATRIBUTO", "HABILIDADE DE CLASSE", "HABILIDADE DE CLASSE", "DUELISTA NATO LVL 8",
      "HABILIDADE DE CLASSE", "1 PONTO DE ATRIBUTO", "HABILIDADE DE CLASSE", "DUELISTA NATO LVL 12",
      "HABILIDADE DE CLASSE", "HABILIDADE DE CLASSE", "DUELISTA NATO LVL 15 + 1 PONTO DE ATRIBUTO",
    ],
  },

  especialista_hatsu: {
    label: "Hunter Especialista em Hatsu",
    blurb: "Dedicado à análise, otimização e manipulação das regras fundamentais da aura e do Nen.",
    trainedSkills: { fixed: ["controle_nen", "astucia", "vontade"], choiceCount: 2 },
    pv: { init: 11, perLevel: 4 },
    pa: { init: 12, perLevel: 7, attrChoice: ["carisma", "intelecto"] },
    defenseBase: 13,
    startingMoney: 0,
    baseAbility: {
      name: "Fluxo Perfeito (Perfect Flow)",
      desc: "",
      levels: [
        { lvl: 1, text: "Otimização de Aura: +2 em Controle de Nen. 1x/rodada, ação livre: reduz 1 PA o custo de uma técnica de Nen usada na rodada (mín 1). Usável x vezes/cena (x = Intelecto ou Carisma)." },
        { lvl: 4, text: "Sentido Aguçado: +3 em Caça (em vez de +2); ativa Gyo de percepção como ação livre. Ação padrão + 4 PA: Controle de Nen (DT 15+nível ameaça) revela Tipo de Hatsu e Condição de Restrição do alvo." },
        { lvl: 8, text: "Campo de Batalha: 1x/cena, En com ação livre + 8 PA, raio 10m. Aliados dentro: +1 dado Controle de Nen, +2 defesa vs Nen. Otimização de Aura reduz 2 PA (mín 2)." },
        { lvl: 12, text: "Anulação de Fluxo: ação padrão + 12 PA, Controle de Nen contra o alvo. Sucesso: desativa Hatsu do alvo por 1d4 rodadas." },
        { lvl: 15, text: "Mestre Absoluto: +3 em Controle de Nen. Anulação de Fluxo custa 10 PA. 1x/dia, ação padrão: ativa Fluxo Perfeito por 1d4 rodadas — custo de habilidades de Nen -3 (mín 3); 1x/rodada usa técnica básica como ação livre." },
      ],
    },
    abilityPool: [
      { name: "Maestria dos Princípios", desc: "Ten Aprimorado: custo de manutenção -1 PA/rodada (mín 0). Zetsu Tático: ao usar Zetsu, Controle de Nen DT 15 — sucesso recupera +1 PA no fim da rodada." },
      { name: "Ko Defensivo", desc: "3x/combate, reação: você ou aliado a 10m sob ataque recebe +5 defesa contra aquele ataque (Ko defensivo)." },
      { name: "Aura de Repressão", desc: "Custo 5 PA: usa Ren com ação livre para -5 em testes de todos inimigos a 5m (Vontade DT 15 reduz para -2)." },
      { name: "Transferência de Aura", desc: "x vezes/cena (x=Int ou Car), ação padrão: transfere até 10 PA para aliado a 1m. Máx 20 PA por aliado." },
      { name: "Selo de Hatsu", desc: "Armazena habilidade de Hatsu em papel (custo: dobro de PA da habilidade original). Outros autorizados usam com ação padrão." },
      { name: "Mimetismo de Aura", desc: "Custo 8 PA/10min: imita aura de pessoa já vista usando Nen. +10 Persuasão para se passar por ela." },
      { name: "Reserva de Aura", desc: "Armazena até 10 PA em um objeto; recupera depois com ação livre. Objeto deve ficar com você." },
      { name: "Amplificação de Hatsu Aliado", desc: "Custo 5 PA, ação padrão: aliado a até 10m ganha +1 dado no próximo teste." },
      { name: "Dissipação de Condição", desc: "Custo 6 PA, ação padrão: tenta remover condição mental de aliado adjacente (exceto condições de origem). Controle de Nen DT 20." },
      { name: "Deflexão de Nen", desc: "2x/cena, reação a ataque de Nen, 6 PA: Controle de Nen (DT do mestre) reduz dano pela metade." },
      { name: "Criação de Barreira", desc: "Custo 10 PA, ação padrão: cria barreira de Nen com 15 PV, cobertura total atrás dela. Dura até destruída ou fim da cena." },
      { name: "Desvio de Manipulação", desc: "+5 em Vontade para resistir a efeitos de Manipulação de Nen." },
      { name: "Transferência de Condição", desc: "Custo 12 PA, ação padrão: tenta transferir condição negativa de aliado adjacente para si (mestre pode exigir Vontade)." },
      { name: "En de Compartilhamento", desc: "Estende En em 10m como canal de comunicação tática (ação livre para falar telepaticamente)." },
      { name: "Desvio de Foco (Manipulação)", desc: "Custo 6 PA, ação padrão: alvo faz Controle de Nen DT 20 ou reduz 50% bônus de suas habilidades." },
      { name: "Treinamento", desc: "Escolha 2 perícias para se tornar treinado. Pode ser escolhida várias vezes." },
    ],
    levelUpTable: [
      "FLUXO PERFEITO LVL 1", "HABILIDADE DE CLASSE", "HABILIDADE DE CLASSE", "FLUXO PERFEITO LVL 4",
      "1 PONTO DE ATRIBUTO", "HABILIDADE DE CLASSE", "HABILIDADE DE CLASSE", "FLUXO PERFEITO LVL 8",
      "HABILIDADE DE CLASSE", "1 PONTO DE ATRIBUTO", "HABILIDADE DE CLASSE", "FLUXO PERFEITO LVL 12",
      "HABILIDADE DE CLASSE", "HABILIDADE DE CLASSE", "FLUXO PERFEITO LVL 15 + 1 PONTO DE ATRIBUTO",
    ],
  },
};

const ASPIRANTE_HUNTER = {
  label: "Aspirante a Hunter",
  pv: { init: 9 },     // + Vigor
  pa: { init: 3 },     // + Carisma
  defenseBase: 8,      // + Destreza + Equipamentos
  startingMoney: 50000,
  ability: { name: "Esforçado", desc: "Usando 1 ponto de aura, ganha +2 em qualquer teste." },
};
// ===================== NEN: PRINCÍPIOS E TÉCNICAS =====================

const NEN_PRINCIPLES = {
  ren: {
    label: "Ren",
    desc: "Aumento da aura — fortalece potencial, força física e presença em batalha.",
    levels: {
      amador: { lvl: 1, cost: "3 PA/ataque", effect: "+3 dano em ataques físicos" },
      intermediario: { lvl: 5, cost: "6 PA/ataque", effect: "+6 dano em ataques físicos. Intimidação passiva: criaturas INT<3 fazem Vontade DT13 para atacar você." },
      avancado: { lvl: 10, cost: "9 PA/ataque", effect: "+9 dano. Intimidação aprimorada: qualquer criatura faz Vontade DT15. +4 PA extra dá +2 no ataque." },
      mestre: { lvl: 15, cost: "10 PA/ataque", effect: "+12 dano. Intimidação poderosa: Vontade DT18. +5 PA extra dá +3 no ataque. 1x/cena 'Explosão de Ren' dobra dano por 2 rodadas." },
    },
  },
  zetsu: {
    label: "Zetsu",
    desc: "Ocultar a aura — quase indetectável, recupera aura mais rápido.",
    levels: {
      amador: { lvl: 1, cost: "Nenhum (economiza aura)", effect: "+2 Furtividade. Recupera +1 PA/turno. -2 defesa quando ativo." },
      intermediario: { lvl: 5, cost: "Nenhum", effect: "+3 Furtividade. Recupera +2 PA/turno. -4 defesa. Detecta usuários de Nen em 10m." },
      avancado: { lvl: 10, cost: "Nenhum", effect: "+5 Furtividade. Recupera +3 PA/turno. -5 defesa. Detecta em 20m e identifica tipo de Nen." },
      mestre: { lvl: 15, cost: "Nenhum", effect: "+7 Furtividade. Recupera +4 PA/turno. -7 defesa. Detecta em 50m, identifica tipo e potência. Ataque surpresa após cancelar Zetsu: +5 no teste e +4d6 dano." },
    },
  },
  ten: {
    label: "Ten",
    desc: "Proteção da aura — escudo protetor, resistência contra ataques.",
    levels: {
      amador: { lvl: 1, cost: "2 PA ao receber ataque", effect: "+2 resistência a todos os tipos de dano." },
      intermediario: { lvl: 5, cost: "4 PA ao receber ataque", effect: "+4 resistência. Mantém fora de combate até 1h sem custo. Estende a 1 aliado adjacente (efeito dividido por 2)." },
      avancado: { lvl: 10, cost: "6 PA ao receber ataque", effect: "+6 resistência. Mantém até 4h sem custo. Estende a 2 aliados (efeito dividido por 3)." },
      mestre: { lvl: 15, cost: "8 PA/turno", effect: "+8 resistência. Mantém até 12h. Estende a 3 aliados (dividido por 4). 1x/cena absorve totalmente ataque de até 30 dano." },
    },
  },
};

const NEN_TECHNIQUES = {
  gyo: {
    label: "Gyô",
    desc: "Aplicação avançada do Ren: concentra aura em parte específica do corpo, aumentando sua resistência (mas vulnerabilizando o resto).",
    variants: [
      { name: "Gyô de percepção", desc: "+2 Caça, vê ataques com In. Custo: 3 PA cada 10min/rodada com Gyô nos olhos (ação de movimento)." },
      { name: "Gyô de ataque", desc: "+2 no acerto em ataques com o corpo. Custo: 2 PA por ataque (ação de movimento)." },
      { name: "Gyô de defesa", desc: "+3 resistência a dano. Custo: 2 PA por ataque recebido; -2 defesa no turno seguinte (reação)." },
    ],
  },
  in: {
    label: "In",
    desc: "Forma avançada de Zetsu: esconde quase completamente a presença da aura, inclusive em Hatsu.",
    effect: "Todos seus ataques/habilidades acertam o oponente desprevenido. Custo: 5 PA por ataque/habilidade (ação livre). Inútil contra Gyô de percepção.",
  },
  en: {
    label: "En",
    desc: "Combinação de Ren e Ten: estende a aura mais longe do corpo (geralmente uma esfera), sentindo forma e movimento de quem entra nela.",
    effect: "Não é mais pego desprevenido; +3 defesa. Custo: 6 PA por rodada/hora mantendo estendido (ação padrão).",
  },
  shu: {
    label: "Shu",
    desc: "Aplicação avançada do Ten: estende a aura a um objeto, usando-o como extensão do próprio corpo.",
    effect: "Em arma: crítico -2. Em armadura: inimigo que acerta você toma 1d6 de dano. Custo: 3 PA por rodada ativo (ação de movimento).",
  },
  ken: {
    label: "Ken",
    desc: "Versão avançada do Ren: mantém Ren reforçado em todo o corpo, defesa uniforme contra ataques de qualquer direção.",
    effect: "+2 defesa. Custo: 2 PA cada uso (reação).",
  },
};

// ===================== CUSTO DE HABILIDADES DE HATSU =====================
// categoria base (lvl 1-3), intermediaria (4-7), complexa (8-11), arcana (12,13,15)
// DT de uso por categoria
const HATSU_CATEGORY_DT = {
  base: 10,
  intermediaria: 12,
  complexa: 15,
  arcana: 20,
};

const HATSU_CATEGORY_LEVEL_RANGE = {
  base: "Níveis 1-3",
  intermediaria: "Níveis 4-7",
  complexa: "Níveis 8-11",
  arcana: "Níveis 12, 13, 15",
};

// Custo em PA por faixa de afinidade percentual (independente do tipo principal)
// Chave = % de afinidade -> custos por categoria
const HATSU_COST_BY_AFFINITY = {
  100: { base: "2~5", intermediaria: "6~10", complexa: "10~20", arcana: "20+" },
  80: { base: "4~9", intermediaria: "10~15", complexa: "15~25", arcana: "25+" },
  60: { base: "6~12", intermediaria: "13~20", complexa: "20~30", arcana: "30+" },
  40: { base: "8~15", intermediaria: "15~25", complexa: "25~35", arcana: "35+" },
  0: { base: "—", intermediaria: "—", complexa: "—", arcana: "—" }, // não pode usar (especialização para não-especialistas)
};

const HATSU_CATEGORY_BY_LEVEL = (lvl) => {
  if (lvl <= 3) return "base";
  if (lvl <= 7) return "intermediaria";
  if (lvl <= 11) return "complexa";
  return "arcana"; // 12, 13, 15
};

// Níveis em que se aprende naturalmente uma habilidade de Hatsu
const HATSU_LEARN_LEVELS = [1, 3, 5, 7, 9, 11, 13, 15];

// Níveis em que se aprende naturalmente uma técnica de Nen (Gyo/In/En/Shu/Ken)
const NEN_TECHNIQUE_LEARN_LEVELS = [1, 4, 8, 11, 15];

const RESTRICTION_SEVERITY = [
  { key: "leve", label: "Leve", desc: "Inconveniente, mas raramente perigoso", bonus: "+1 PA / +10% poder" },
  { key: "moderada", label: "Moderada", desc: "Significativamente limitante", bonus: "+2 PA / +30% poder" },
  { key: "severa", label: "Severa", desc: "Perigosa ou muito restritiva", bonus: "+3 PA / +50% poder" },
  { key: "extrema", label: "Extrema", desc: "Potencialmente fatal ou permanentemente debilitante", bonus: "+4 PA ou mais / +100% poder" },
];

const TEST_DIFFICULTY = [
  { key: "facil", label: "Fácil", range: "5 ~ 15" },
  { key: "medio", label: "Médio", range: "15 ~ 20" },
  { key: "dificil", label: "Difícil", range: "20 ~ 30" },
  { key: "quase_impossivel", label: "Quase Impossível", range: "30+" },
];

const MISSION_RANKS = [
  { rank: "E", level: "1-2", repGain: 1, repLoss: 1, moneyLow: "5.000-10.000", moneyMed: "10.000-20.000", moneyHigh: "20.000-50.000" },
  { rank: "D", level: "3-4", repGain: 2, repLoss: 2, moneyLow: "50.000-100.000", moneyMed: "100.000-200.000", moneyHigh: "200.000-500.000" },
  { rank: "C", level: "5-6", repGain: 3, repLoss: 3, moneyLow: "500.000-1M", moneyMed: "1M-2M", moneyHigh: "2M-5M" },
  { rank: "B", level: "7-8", repGain: 3, repLoss: 3, moneyLow: "5M-10M", moneyMed: "10M-20M", moneyHigh: "20M-50M" },
  { rank: "A", level: "9-10", repGain: 4, repLoss: 4, moneyLow: "50M-100M", moneyMed: "100M-200M", moneyHigh: "200M-500M" },
  { rank: "S", level: "11+", repGain: 5, repLoss: 5, moneyLow: "500M-1B", moneyMed: "1B-5B", moneyHigh: "5B+" },
];

const FACTIONS = [
  "Associação Hunter", "Trupe Fantasma", "Família Zoldyck", "Máfia", "Formigas Quimera",
  "Governo Mundial", "Clã Kurta", "Clãs Ninja", "Comunidade de Nen", "Reinos Específicos",
];

const CONDITIONS = [
  { name: "Abalado", desc: "-5 em testes de Carisma" },
  { name: "Agarrado", desc: "Vulnerável e -5 em testes para atacar" },
  { name: "Atordoado", desc: "Desprevenido e paralisado" },
  { name: "Caído", desc: "-5 em testes para atacar; gasta ação de movimento para levantar" },
  { name: "Cego", desc: "-10 em testes de Caça" },
  { name: "Desprevenido", desc: "Vulnerável e não pode reagir a ataques" },
  { name: "Em chamas", desc: "1d8 dano elemental até apagar (ação padrão para apagar)" },
  { name: "Envenenado", desc: "Efeito varia de acordo com o veneno" },
  { name: "Exausto", desc: "Lento e vulnerável" },
  { name: "Fadigado", desc: "Lento, vulnerável e fraco" },
  { name: "Fraco", desc: "-2 dados em qualquer teste" },
  { name: "Imóvel", desc: "Deslocamento reduzido a 0m" },
  { name: "Lento", desc: "Deslocamento reduzido pela metade" },
  { name: "Lesionado", desc: "-1 dado em testes físicos (Vigor, Força, Dex)" },
  { name: "Morrendo", desc: "Vulnerável e paralisado" },
  { name: "Paralisado", desc: "Não pode fazer ações" },
  { name: "Sangrando", desc: "1d6 de dano" },
  { name: "Vulnerável", desc: "-5 na defesa" },
  { name: "Agarrando", desc: "-1 dado para atacar" },
];

/* =================================================================================
   HELPERS DE CÁLCULO
   ================================================================================= */

function emptyAttrs() {
  return { forca: 0, vigor: 0, destreza: 0, intelecto: 0, carisma: 0 };
}

function sumAttrs(...objs) {
  const out = emptyAttrs();
  for (const o of objs) {
    if (!o) continue;
    for (const k of Object.keys(out)) out[k] += o[k] || 0;
  }
  return out;
}

function calcMaxPV(character) {
  const { isAspirante, classKey, level, attrs } = character;
  const vigor = attrs.vigor || 0;
  if (isAspirante || !classKey) {
    return ASPIRANTE_HUNTER.pv.init + vigor;
  }
  const cls = CLASSES[classKey];
  if (!cls) return 0;
  const lvl = Math.max(1, level || 1);
  let pv = cls.pv.init + vigor;
  // a cada nível além do 1, ganha pv.perLevel + vigor (conforme tabelas: "Subindo de nível: X + Vigor")
  pv += (lvl - 1) * (cls.pv.perLevel + vigor);
  // bônus racial de Formiga Quimera
  if (character.originKey === "formiga_quimera") {
    pv += 10 + (lvl - 1) * 2;
  }
  return pv;
}

function calcMaxPA(character) {
  const { isAspirante, classKey, level, attrs, paAttrChoice } = character;
  const carisma = attrs.carisma || 0;
  if (isAspirante || !classKey) {
    return ASPIRANTE_HUNTER.pa.init + carisma;
  }
  const cls = CLASSES[classKey];
  if (!cls) return 0;
  const lvl = Math.max(1, level || 1);
  // Especialista em Hatsu pode escolher Carisma OU Intelecto
  let attrVal = carisma;
  if (cls.pa.attrChoice) {
    const chosen = paAttrChoice || cls.pa.attrChoice[0];
    attrVal = attrs[chosen] || 0;
  }
  let pa = cls.pa.init + attrVal;
  pa += (lvl - 1) * (cls.pa.perLevel + attrVal);
  return pa;
}

function calcDefenseBase(character) {
  const { isAspirante, classKey, attrs, equipDefenseBonus } = character;
  const destreza = attrs.destreza || 0;
  const eq = equipDefenseBonus || 0;
  if (isAspirante || !classKey) {
    return ASPIRANTE_HUNTER.defenseBase + destreza + eq;
  }
  const cls = CLASSES[classKey];
  if (!cls) return 0;
  return cls.defenseBase + destreza + eq;
}

function calcCarryCapacity(attrs) {
  const forca = attrs.forca || 0;
  return forca === 0 ? 2 : forca * 3;
}

function attrTotal(character) {
  // soma atributos base + bônus de origem
  return sumAttrs(character.attrs);
}

function getNenControlAttr(hatsuKey, chosenAttrForEspecialista) {
  if (!hatsuKey) return null;
  if (hatsuKey === "especializacao") return chosenAttrForEspecialista || "intelecto";
  return NEN_CONTROL_ATTR_BY_HATSU[hatsuKey];
}

function getAffinity(hatsuPrincipal, hatsuTarget) {
  if (!hatsuPrincipal || !hatsuTarget) return 0;
  return HATSU_AFFINITIES[hatsuPrincipal]?.[hatsuTarget] ?? 0;
}

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

/* =================================================================================
   PERSISTÊNCIA (localStorage nativo do navegador — funciona em qualquer site)
   ================================================================================= */

const STORAGE_PREFIX = "hxn:char:";
const STORAGE_INDEX = "hxn:index";

async function storageListCharacters() {
  try {
    const raw = localStorage.getItem(STORAGE_INDEX);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function storageSaveCharacter(character) {
  const key = STORAGE_PREFIX + character.id;
  localStorage.setItem(key, JSON.stringify(character));
  const list = await storageListCharacters();
  const existing = list.find((c) => c.id === character.id);
  const summary = {
    id: character.id,
    name: character.name || "Sem nome",
    level: character.level || 1,
    classLabel: character.classKey ? CLASSES[character.classKey].label : "Aspirante a Hunter",
    hatsu: character.hatsuPrincipal ? HATSU_TYPES.find((h) => h.key === character.hatsuPrincipal)?.label : null,
    updatedAt: Date.now(),
  };
  if (existing) {
    Object.assign(existing, summary);
  } else {
    list.push(summary);
  }
  localStorage.setItem(STORAGE_INDEX, JSON.stringify(list));
}

async function storageLoadCharacter(id) {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + id);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function storageDeleteCharacter(id) {
  try {
    localStorage.removeItem(STORAGE_PREFIX + id);
  } catch {
    /* ignore */
  }
  const list = await storageListCharacters();
  const filtered = list.filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_INDEX, JSON.stringify(filtered));
}

/* =================================================================================
   FÁBRICA DE PERSONAGEM EM BRANCO
   ================================================================================= */

function blankCharacter() {
  return {
    id: uid(),
    name: "",
    player: "",
    level: 1,
    isAspirante: true,
    attrs: emptyAttrs(), // pontos base distribuídos pelo jogador (6 pontos)
    attrBonusOrigin: emptyAttrs(), // bônus vindo da origem
    attrBonusLevelUp: emptyAttrs(), // pontos extras ganhos ao subir de nível
    skillsTrained: [], // array de skill keys
    originKey: null,
    originSubchoice: null, // ex: mentor, especializacao_crime, cla_ninja...
    originSubchoiceLabel: null,
    originSkillChoices: [], // perícias escolhidas como parte da origem (N = Intelecto)
    originAttrChoices: [], // attr keys escolhidos para o bônus de origem (quando type=choice)
    classKey: null,
    paAttrChoice: "carisma", // só relevante p/ especialista em hatsu
    hatsuPrincipal: null,
    especialistaControlAttr: "intelecto", // atributo de controle de nen se especialista
    nenSpecialization: null, // ren | zetsu | ten — qual princípio o personagem se especializou
    nenTechniquesKnown: [], // gyo, in, en, shu, ken
    hatsuAbilities: [], // [{name, type, category, cost, description, restrictions}]
    classAbilitiesChosen: [], // nomes das habilidades de classe escolhidas no pool
    equipDefenseBonus: 0,
    equipment: [], // [{name, qty, weight, note}]
    money: 0,
    currentPV: null, // se null, usa o máximo
    currentPA: null,
    reputations: {}, // {faction: number}
    notes: "",
    createdAt: Date.now(),
  };
}

/* =================================================================================
   COMPONENTES DE UI GENÉRICOS
   ================================================================================= */

const AURA_COLORS = {
  intensificacao: "#e0533d",
  emissao: "#4d8de0",
  transmutacao: "#9b5de0",
  manipulacao: "#3dbf7a",
  materializacao: "#e0c23d",
  especializacao: "#e7e7e7",
  null: "#c9a24b",
};

function AuraDot({ hatsu, size = 10 }) {
  const color = AURA_COLORS[hatsu] || AURA_COLORS.null;
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        boxShadow: `0 0 ${size}px ${color}99`,
      }}
    />
  );
}

function Pill({ children, active, onClick, color, disabled, title }) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      title={title}
      disabled={disabled}
      style={{
        padding: "8px 14px",
        borderRadius: 999,
        border: `1px solid ${active ? (color || "#c9a24b") : "#3a3d42"}`,
        background: active ? `${color || "#c9a24b"}1f` : "transparent",
        color: active ? (color || "#e8d9ad") : "#aab0b8",
        fontFamily: "'Oxanium', sans-serif",
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: "0.02em",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        transition: "all .15s ease",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

function SectionLabel({ children, eyebrow }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {eyebrow && (
        <div
          style={{
            fontFamily: "'Oxanium', sans-serif",
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#c9a24b",
            marginBottom: 4,
          }}
        >
          {eyebrow}
        </div>
      )}
      <h2
        style={{
          fontFamily: "'Oxanium', sans-serif",
          fontSize: 22,
          fontWeight: 700,
          color: "#f1ede2",
          margin: 0,
        }}
      >
        {children}
      </h2>
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div
      style={{
        background: "linear-gradient(160deg, #181b20 0%, #14161a 100%)",
        border: "1px solid #2a2d33",
        borderRadius: 14,
        padding: 20,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function NumberStepper({ value, onChange, min = 0, max = 99 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1, min, max))}
        style={btnCircleStyle}
      >
        −
      </button>
      <div
        style={{
          minWidth: 32,
          textAlign: "center",
          fontFamily: "'Oxanium', sans-serif",
          fontSize: 18,
          fontWeight: 700,
          color: "#f1ede2",
        }}
      >
        {value}
      </div>
      <button
        type="button"
        onClick={() => onChange(clamp(value + 1, min, max))}
        style={btnCircleStyle}
      >
        +
      </button>
    </div>
  );
}

const btnCircleStyle = {
  width: 28,
  height: 28,
  borderRadius: "50%",
  border: "1px solid #3a3d42",
  background: "#1d2024",
  color: "#e8d9ad",
  fontSize: 16,
  lineHeight: 1,
  cursor: "pointer",
};

function PrimaryButton({ children, onClick, disabled, style }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "12px 26px",
        borderRadius: 10,
        border: "1px solid #c9a24b",
        background: disabled ? "#2a2510" : "linear-gradient(160deg, #d8b25c, #b8893a)",
        color: disabled ? "#7a6f4f" : "#1a1408",
        fontFamily: "'Oxanium', sans-serif",
        fontWeight: 700,
        fontSize: 14,
        letterSpacing: "0.03em",
        cursor: disabled ? "not-allowed" : "pointer",
        boxShadow: disabled ? "none" : "0 4px 18px #c9a24b33",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function GhostButton({ children, onClick, style }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "12px 22px",
        borderRadius: 10,
        border: "1px solid #3a3d42",
        background: "transparent",
        color: "#c7cbd1",
        fontFamily: "'Oxanium', sans-serif",
        fontWeight: 600,
        fontSize: 14,
        cursor: "pointer",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function ModSign(n) {
  return n >= 0 ? `+${n}` : `${n}`;
}

/* =================================================================================
   TELA: HOME (lista de fichas)
   ================================================================================= */

function HomeScreen({ onNewCharacter, onOpenCharacter }) {
  const [list, setList] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    storageListCharacters()
      .then((l) => setList(l.sort((a, b) => b.updatedAt - a.updatedAt)))
      .catch(() => setError(true));
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Apagar esta ficha permanentemente?")) return;
    await storageDeleteCharacter(id);
    setList((l) => l.filter((c) => c.id !== id));
  };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 20px 80px" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div
          style={{
            fontFamily: "'Oxanium', sans-serif",
            fontSize: 12,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "#c9a24b",
            marginBottom: 10,
          }}
        >
          Associação Hunter · Registro de Caçadores
        </div>
        <h1
          style={{
            fontFamily: "'Oxanium', sans-serif",
            fontSize: "clamp(32px, 6vw, 48px)",
            fontWeight: 800,
            color: "#f1ede2",
            margin: 0,
            letterSpacing: "0.01em",
          }}
        >
          Hunter <span style={{ color: "#c9a24b" }}>×</span> Nen
        </h1>
        <p style={{ color: "#8d939b", fontFamily: "'Source Serif 4', serif", fontSize: 16, marginTop: 10 }}>
          Crie sua licença de Hunter. Sem precisar abrir o livro de regras.
        </p>
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 36 }}>
        <PrimaryButton onClick={onNewCharacter} style={{ fontSize: 16, padding: "16px 36px" }}>
          + Criar novo personagem
        </PrimaryButton>
      </div>

      {list === null && !error && (
        <p style={{ textAlign: "center", color: "#666" }}>Carregando fichas salvas…</p>
      )}
      {error && (
        <p style={{ textAlign: "center", color: "#a55" }}>
          Não foi possível acessar o armazenamento. Suas fichas serão mantidas apenas durante esta sessão.
        </p>
      )}
      {list && list.length === 0 && (
        <Card style={{ textAlign: "center", color: "#8d939b" }}>
          Nenhuma ficha ainda. Toda licença começa com o Exame Hunter — crie a primeira acima.
        </Card>
      )}
      {list && list.length > 0 && (
        <div style={{ display: "grid", gap: 12 }}>
          {list.map((c) => (
            <div
              key={c.id}
              onClick={() => onOpenCharacter(c.id)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                padding: "16px 20px",
                borderRadius: 12,
                border: "1px solid #2a2d33",
                background: "#15171b",
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <AuraDot hatsu={hatsuKeyFromLabel(c.hatsu)} size={12} />
                <div>
                  <div style={{ fontFamily: "'Oxanium', sans-serif", fontWeight: 700, color: "#f1ede2", fontSize: 16 }}>
                    {c.name || "Sem nome"}
                  </div>
                  <div style={{ color: "#8d939b", fontSize: 13, fontFamily: "'Source Serif 4', serif" }}>
                    Nível {c.level} · {c.classLabel}
                  </div>
                </div>
              </div>
              <button
                onClick={(e) => handleDelete(c.id, e)}
                title="Apagar ficha"
                style={{
                  background: "transparent",
                  border: "1px solid #3a3d42",
                  color: "#8d939b",
                  borderRadius: 8,
                  padding: "6px 10px",
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                Apagar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function hatsuKeyFromLabel(label) {
  if (!label) return null;
  const found = HATSU_TYPES.find((h) => h.label === label);
  return found ? found.key : null;
}

/* =================================================================================
   WIZARD DE CRIAÇÃO
   ================================================================================= */

const WIZARD_STEPS = [
  { key: "identidade", label: "Identidade" },
  { key: "atributos", label: "Atributos" },
  { key: "origem", label: "Origem" },
  { key: "pericias", label: "Perícias" },
  { key: "classe", label: "Exame & Classe" },
  { key: "nen", label: "Nen & Hatsu" },
  { key: "equipamento", label: "Equipamento" },
  { key: "revisao", label: "Revisão" },
];

function CreationWizard({ onFinish, onCancel }) {
  const [step, setStep] = useState(0);
  const [char, setChar] = useState(blankCharacter);

  const patch = useCallback((fields) => {
    setChar((c) => ({ ...c, ...fields }));
  }, []);

  const goNext = () => setStep((s) => Math.min(WIZARD_STEPS.length - 1, s + 1));
  const goBack = () => {
    if (step === 0) onCancel();
    else setStep((s) => s - 1);
  };

  const stepKey = WIZARD_STEPS[step].key;

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "32px 20px 100px" }}>
      <WizardProgress steps={WIZARD_STEPS} current={step} onJump={(i) => i < step && setStep(i)} />

      <div style={{ marginTop: 28 }}>
        {stepKey === "identidade" && <StepIdentidade char={char} patch={patch} />}
        {stepKey === "atributos" && <StepAtributos char={char} patch={patch} />}
        {stepKey === "origem" && <StepOrigem char={char} patch={patch} />}
        {stepKey === "pericias" && <StepPericias char={char} patch={patch} />}
        {stepKey === "classe" && <StepClasse char={char} patch={patch} />}
        {stepKey === "nen" && <StepNen char={char} patch={patch} />}
        {stepKey === "equipamento" && <StepEquipamento char={char} patch={patch} />}
        {stepKey === "revisao" && <StepRevisao char={char} patch={patch} />}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 40,
          paddingTop: 24,
          borderTop: "1px solid #2a2d33",
        }}
      >
        <GhostButton onClick={goBack}>{step === 0 ? "Cancelar" : "← Voltar"}</GhostButton>
        {step < WIZARD_STEPS.length - 1 ? (
          <PrimaryButton onClick={goNext} disabled={!canAdvance(stepKey, char)}>
            Continuar →
          </PrimaryButton>
        ) : (
          <PrimaryButton onClick={() => onFinish(char)}>Finalizar e salvar ficha</PrimaryButton>
        )}
      </div>
    </div>
  );
}

function canAdvance(stepKey, char) {
  if (stepKey === "identidade") return !!char.name?.trim();
  if (stepKey === "atributos") return totalAttrPoints(char.attrs) === 6;
  if (stepKey === "origem") {
    if (!char.originKey) return false;
    const origin = ORIGINS[char.originKey];
    if (origin.subchoices && !char.originSubchoice) return false;
    return true;
  }
  if (stepKey === "pericias") return true; // validação fina dentro do step
  if (stepKey === "classe") return !!char.classKey;
  if (stepKey === "nen") return !!char.hatsuPrincipal && !!char.nenSpecialization;
  return true;
}

function totalAttrPoints(attrs) {
  return Object.values(attrs).reduce((a, b) => a + b, 0);
}

function WizardProgress({ steps, current, onJump }) {
  return (
    <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 6 }}>
      {steps.map((s, i) => {
        const state = i < current ? "done" : i === current ? "active" : "todo";
        return (
          <div
            key={s.key}
            onClick={() => onJump(i)}
            style={{
              flex: 1,
              minWidth: 84,
              textAlign: "center",
              cursor: state === "done" ? "pointer" : "default",
              padding: "8px 4px",
              borderBottom: `2px solid ${state === "active" ? "#c9a24b" : state === "done" ? "#5c5235" : "#2a2d33"}`,
            }}
          >
            <div
              style={{
                fontFamily: "'Oxanium', sans-serif",
                fontSize: 11,
                letterSpacing: "0.05em",
                color: state === "active" ? "#f1ede2" : state === "done" ? "#c9a24b" : "#5a5e64",
                fontWeight: state === "active" ? 700 : 600,
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </div>
            <div
              style={{
                fontFamily: "'Oxanium', sans-serif",
                fontSize: 12,
                color: state === "active" ? "#f1ede2" : state === "done" ? "#9c9477" : "#5a5e64",
                marginTop: 2,
              }}
            >
              {s.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- STEP: IDENTIDADE ---------- */

function StepIdentidade({ char, patch }) {
  return (
    <Card>
      <SectionLabel eyebrow="Passo 1 de 8">Quem é você?</SectionLabel>
      <p style={{ color: "#8d939b", fontFamily: "'Source Serif 4', serif", lineHeight: 1.6, marginBottom: 24 }}>
        Antes de explorar florestas mortais ou enfrentar criaturas perigosas, defina quem você é nesse mundo.
      </p>
      <div style={{ display: "grid", gap: 18 }}>
        <Field label="Nome do personagem">
          <input
            autoFocus
            value={char.name}
            onChange={(e) => patch({ name: e.target.value })}
            placeholder="ex: Kaito Reyes"
            style={inputStyle}
          />
        </Field>
        <Field label="Seu nome (jogador)">
          <input
            value={char.player}
            onChange={(e) => patch({ player: e.target.value })}
            placeholder="ex: Gabriel"
            style={inputStyle}
          />
        </Field>
      </div>
    </Card>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "block" }}>
      <div
        style={{
          fontFamily: "'Oxanium', sans-serif",
          fontSize: 12,
          letterSpacing: "0.04em",
          color: "#9aa0a8",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      {children}
    </label>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid #3a3d42",
  background: "#0f1113",
  color: "#f1ede2",
  fontFamily: "'Source Serif 4', serif",
  fontSize: 15,
  boxSizing: "border-box",
};

/* ---------- STEP: ATRIBUTOS ---------- */

function StepAtributos({ char, patch }) {
  const total = totalAttrPoints(char.attrs);
  const remaining = 6 - total;

  const setAttr = (key, val) => {
    const newAttrs = { ...char.attrs, [key]: val };
    const newTotal = totalAttrPoints(newAttrs);
    if (newTotal > 6) return;
    patch({ attrs: newAttrs });
  };

  return (
    <Card>
      <SectionLabel eyebrow="Passo 2 de 8">Distribua seus atributos</SectionLabel>
      <p style={{ color: "#8d939b", fontFamily: "'Source Serif 4', serif", lineHeight: 1.6, marginBottom: 8 }}>
        Você tem <strong style={{ color: "#c9a24b" }}>6 pontos</strong> para distribuir, no máximo 4 em um atributo.
        Sua origem dará pontos adicionais depois.
      </p>
      <div
        style={{
          display: "inline-block",
          padding: "4px 14px",
          borderRadius: 999,
          background: remaining === 0 ? "#1d2b1d" : "#2b2310",
          color: remaining === 0 ? "#7fcf7f" : "#e0c23d",
          fontFamily: "'Oxanium', sans-serif",
          fontSize: 13,
          fontWeight: 700,
          marginBottom: 20,
        }}
      >
        {remaining === 0 ? "Todos os pontos distribuídos" : `${remaining} ponto(s) restante(s)`}
      </div>

      <div style={{ display: "grid", gap: 14 }}>
        {ATTRIBUTES.map((a) => (
          <div
            key={a.key}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              borderRadius: 10,
              border: "1px solid #2a2d33",
              background: "#0f1113",
            }}
          >
            <div>
              <div style={{ fontFamily: "'Oxanium', sans-serif", fontWeight: 700, color: "#f1ede2" }}>
                {a.label} <span style={{ color: "#6a6f76", fontSize: 12 }}>({a.short})</span>
              </div>
              <div style={{ color: "#7e848c", fontSize: 13, fontFamily: "'Source Serif 4', serif" }}>{a.desc}</div>
            </div>
            <NumberStepper value={char.attrs[a.key]} onChange={(v) => setAttr(a.key, v)} min={0} max={4} />
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ---------- STEP: ORIGEM ---------- */

function StepOrigem({ char, patch }) {
  const origin = char.originKey ? ORIGINS[char.originKey] : null;
  // Para Herdeiro, o bônus/perícias vêm da subescolha (clã), não da origem em si
  const isHerdeiro = char.originKey === "herdeiro";
  const subDef = origin?.subchoices?.options.find((o) => o.key === char.originSubchoice);
  const effectiveAttrBonus = isHerdeiro ? subDef?.attrBonus : origin?.attrBonus;
  const effectiveTrainedSkills = isHerdeiro ? subDef?.trainedSkills : origin?.trainedSkills;

  const selectOrigin = (key) => {
    patch({
      originKey: key,
      originSubchoice: null,
      originSubchoiceLabel: null,
      originAttrChoices: [],
      originSkillChoices: [],
    });
  };

  const selectSubchoice = (subKey, subLabel) => {
    patch({ originSubchoice: subKey, originSubchoiceLabel: subLabel, originAttrChoices: [] });
  };

  return (
    <Card>
      <SectionLabel eyebrow="Passo 3 de 8">Escolha sua origem</SectionLabel>
      <p style={{ color: "#8d939b", fontFamily: "'Source Serif 4', serif", lineHeight: 1.6, marginBottom: 20 }}>
        A origem define de onde seu personagem veio — a essência por trás de quem ele é antes de se tornar Hunter.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10, marginBottom: 24 }}>
        {Object.entries(ORIGINS).map(([key, o]) => (
          <div
            key={key}
            onClick={() => selectOrigin(key)}
            style={{
              padding: 14,
              borderRadius: 12,
              border: `1px solid ${char.originKey === key ? "#c9a24b" : "#2a2d33"}`,
              background: char.originKey === key ? "#c9a24b14" : "#0f1113",
              cursor: "pointer",
            }}
          >
            <div style={{ fontFamily: "'Oxanium', sans-serif", fontWeight: 700, color: "#f1ede2", marginBottom: 4 }}>
              {o.label}
            </div>
            <div style={{ color: "#7e848c", fontSize: 12.5, fontFamily: "'Source Serif 4', serif", lineHeight: 1.4 }}>
              {o.blurb}
            </div>
          </div>
        ))}
      </div>

      {origin?.subchoices && (
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontFamily: "'Oxanium', sans-serif",
              fontSize: 13,
              color: "#c9a24b",
              marginBottom: 10,
              fontWeight: 700,
            }}
          >
            {origin.subchoices.label}
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {origin.subchoices.options.map((opt) => (
              <div
                key={opt.key}
                onClick={() => selectSubchoice(opt.key, opt.label)}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  border: `1px solid ${char.originSubchoice === opt.key ? "#c9a24b" : "#2a2d33"}`,
                  background: char.originSubchoice === opt.key ? "#c9a24b14" : "#0f1113",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontFamily: "'Oxanium', sans-serif", fontWeight: 700, color: "#f1ede2", fontSize: 14 }}>
                  {opt.label}
                </div>
                <div style={{ color: "#7e848c", fontSize: 12.5, fontFamily: "'Source Serif 4', serif", marginTop: 3, lineHeight: 1.45 }}>
                  {opt.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {origin && (
        <>
          {effectiveAttrBonus && (
            <OriginAttrBonusPicker
              bonus={effectiveAttrBonus}
              chosen={char.originAttrChoices}
              onChange={(choices) => patch({ originAttrChoices: choices })}
            />
          )}

          {effectiveTrainedSkills && (
            <div style={{ marginTop: 16, padding: 14, borderRadius: 10, background: "#0f1113", border: "1px solid #2a2d33" }}>
              <div style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 13, color: "#c9a24b", marginBottom: 8, fontWeight: 700 }}>
                Perícias treinadas pela origem
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {(effectiveTrainedSkills.fixed || []).map((sk) => (
                  <SkillTag key={sk} skillKey={sk} />
                ))}
                {effectiveTrainedSkills.choiceOneOf && (
                  <span style={{ color: "#8d939b", fontSize: 13, fontFamily: "'Source Serif 4', serif" }}>
                    + escolha entre {effectiveTrainedSkills.choiceOneOf.map((k) => SKILLS.find((s) => s.key === k)?.label).join(" ou ")}
                  </span>
                )}
              </div>
              {effectiveTrainedSkills.extraByIntellect && (
                <div style={{ color: "#7e848c", fontSize: 12.5, marginTop: 8, fontFamily: "'Source Serif 4', serif" }}>
                  + perícias adicionais à sua escolha, em número igual ao seu Intelecto (você escolherá no próximo passo).
                </div>
              )}
            </div>
          )}

          {origin.drawback && (
            <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: "#2b181480", border: "1px solid #5a3a2a" }}>
              <strong style={{ color: "#e0a070", fontFamily: "'Oxanium', sans-serif", fontSize: 12.5 }}>Desvantagem: </strong>
              <span style={{ color: "#cbb39e", fontSize: 13, fontFamily: "'Source Serif 4', serif" }}>{origin.drawback}</span>
            </div>
          )}
          {subDef?.drawback && (
            <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: "#2b181480", border: "1px solid #5a3a2a" }}>
              <strong style={{ color: "#e0a070", fontFamily: "'Oxanium', sans-serif", fontSize: 12.5 }}>Desvantagem: </strong>
              <span style={{ color: "#cbb39e", fontSize: 13, fontFamily: "'Source Serif 4', serif" }}>{subDef.drawback}</span>
            </div>
          )}
          {subDef?.special && (
            <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: "#14202b80", border: "1px solid #2a4a5a" }}>
              <strong style={{ color: "#7ec0e0", fontFamily: "'Oxanium', sans-serif", fontSize: 12.5 }}>Especial: </strong>
              <span style={{ color: "#b9d4e0", fontSize: 13, fontFamily: "'Source Serif 4', serif" }}>{subDef.special}</span>
            </div>
          )}
          {origin.racialBonus && (
            <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: "#14201480", border: "1px solid #2a5a3a" }}>
              <strong style={{ color: "#7ee0a0", fontFamily: "'Oxanium', sans-serif", fontSize: 12.5 }}>Bônus racial: </strong>
              <span style={{ color: "#b9e0c8", fontSize: 13, fontFamily: "'Source Serif 4', serif" }}>{origin.racialBonus}</span>
            </div>
          )}
        </>
      )}
    </Card>
  );
}

function SkillTag({ skillKey }) {
  const sk = SKILLS.find((s) => s.key === skillKey);
  if (!sk) return null;
  return (
    <span
      style={{
        padding: "4px 10px",
        borderRadius: 999,
        background: "#c9a24b1f",
        border: "1px solid #c9a24b55",
        color: "#e8d9ad",
        fontSize: 12.5,
        fontFamily: "'Oxanium', sans-serif",
      }}
    >
      {sk.label}
    </span>
  );
}

function OriginAttrBonusPicker({ bonus, chosen, onChange }) {
  if (bonus.type === "fixed") {
    return (
      <div style={{ marginTop: 16, padding: 14, borderRadius: 10, background: "#0f1113", border: "1px solid #2a2d33" }}>
        <div style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 13, color: "#c9a24b", marginBottom: 6, fontWeight: 700 }}>
          Bônus de atributo (fixo)
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {Object.entries(bonus.fixed).map(([k, v]) => (
            <AttrBonusTag key={k} attrKey={k} value={v} />
          ))}
        </div>
      </div>
    );
  }

  if (bonus.type === "choice" || bonus.type === "fixed_plus_choice") {
    const points = bonus.points;
    const allowed = bonus.allowed;
    const totalChosen = chosen.length;

    const addPoint = (attrKey) => {
      if (totalChosen >= points) return;
      onChange([...chosen, attrKey]);
    };
    const removeOne = (attrKey) => {
      const idx = chosen.lastIndexOf(attrKey);
      if (idx === -1) return;
      const copy = [...chosen];
      copy.splice(idx, 1);
      onChange(copy);
    };
    const countFor = (attrKey) => chosen.filter((c) => c === attrKey).length;

    return (
      <div style={{ marginTop: 16, padding: 14, borderRadius: 10, background: "#0f1113", border: "1px solid #2a2d33" }}>
        <div style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 13, color: "#c9a24b", marginBottom: 6, fontWeight: 700 }}>
          Bônus de atributo — distribua {points} ponto(s) {totalChosen < points ? `(${points - totalChosen} restante(s))` : "✓"}
        </div>
        {bonus.type === "fixed_plus_choice" && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
            {Object.entries(bonus.fixed).map(([k, v]) => (
              <AttrBonusTag key={k} attrKey={k} value={v} />
            ))}
          </div>
        )}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {allowed.map((attrKey) => {
            const a = ATTRIBUTES.find((x) => x.key === attrKey);
            const c = countFor(attrKey);
            return (
              <div
                key={attrKey}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: "1px solid #3a3d42",
                }}
              >
                <span style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 13, color: "#e8d9ad" }}>{a.short}</span>
                <button onClick={() => removeOne(attrKey)} style={{ ...btnCircleStyle, width: 22, height: 22, fontSize: 13 }}>
                  −
                </button>
                <span style={{ minWidth: 14, textAlign: "center", color: "#f1ede2", fontFamily: "'Oxanium', sans-serif" }}>{c}</span>
                <button
                  onClick={() => addPoint(attrKey)}
                  disabled={totalChosen >= points}
                  style={{ ...btnCircleStyle, width: 22, height: 22, fontSize: 13, opacity: totalChosen >= points ? 0.3 : 1 }}
                >
                  +
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
}

function AttrBonusTag({ attrKey, value }) {
  const a = ATTRIBUTES.find((x) => x.key === attrKey);
  if (!a) return null;
  return (
    <span
      style={{
        padding: "4px 10px",
        borderRadius: 8,
        background: "#3dbf7a1f",
        border: "1px solid #3dbf7a55",
        color: "#a8e0c0",
        fontSize: 12.5,
        fontFamily: "'Oxanium', sans-serif",
        fontWeight: 700,
      }}
    >
      {a.short} +{value}
    </span>
  );
}

/* ---------- STEP: PERÍCIAS ---------- */

function getOriginEffectiveTrainedSkills(char) {
  if (!char.originKey) return null;
  const origin = ORIGINS[char.originKey];
  if (char.originKey === "herdeiro") {
    const sub = origin.subchoices.options.find((o) => o.key === char.originSubchoice);
    return sub?.trainedSkills || null;
  }
  return origin.trainedSkills || null;
}

function StepPericias({ char, patch }) {
  const trainedDef = getOriginEffectiveTrainedSkills(char);
  const intelecto = char.attrs.intelecto || 0;

  const fixedSkills = trainedDef?.fixed || [];
  const choiceOneOf = trainedDef?.choiceOneOf || null;
  const choiceCount = trainedDef?.choiceCount || 0;
  const extraByIntellect = trainedDef?.extraByIntellect ? intelecto : 0;

  const [oneOfChoice, setOneOfChoice] = useState(char.originOneOfSkill || null);
  const [fixedChoiceSkills, setFixedChoiceSkills] = useState(char.originFixedChoiceSkills || []); // para choiceCount (ex: Trabalhador "1 perícia adicional")
  const [extraSkills, setExtraSkills] = useState(char.originSkillChoices || []);

  const allChosenSoFar = useMemo(() => {
    const arr = [...fixedSkills];
    if (oneOfChoice) arr.push(oneOfChoice);
    arr.push(...fixedChoiceSkills);
    return arr;
  }, [fixedSkills, oneOfChoice, fixedChoiceSkills]);

  const availableForExtra = SKILLS.filter((s) => !allChosenSoFar.includes(s.key));

  const toggleExtraSkill = (key) => {
    setExtraSkills((prev) => {
      let next;
      if (prev.includes(key)) {
        next = prev.filter((k) => k !== key);
      } else {
        if (prev.length >= extraByIntellect) return prev;
        next = [...prev, key];
      }
      patch({ originSkillChoices: next });
      return next;
    });
  };

  const toggleFixedChoice = (key) => {
    setFixedChoiceSkills((prev) => {
      let next;
      if (prev.includes(key)) next = prev.filter((k) => k !== key);
      else {
        if (prev.length >= choiceCount) return prev;
        next = [...prev, key];
      }
      patch({ originFixedChoiceSkills: next });
      return next;
    });
  };

  const handleOneOf = (key) => {
    setOneOfChoice(key);
    patch({ originOneOfSkill: key });
  };

  const allSelected = [...allChosenSoFar, ...extraSkills];
  const ready =
    (!choiceOneOf || !!oneOfChoice) &&
    (choiceCount === 0 || fixedChoiceSkills.length === choiceCount) &&
    extraSkills.length === extraByIntellect;

  useEffect(() => {
    if (ready) patch({ skillsTrained: [...new Set(allSelected)], pericasReady: true });
    else patch({ pericasReady: false });
  }, [oneOfChoice, fixedChoiceSkills, extraSkills]);

  return (
    <Card>
      <SectionLabel eyebrow="Passo 4 de 8">Perícias da origem</SectionLabel>

      {fixedSkills.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <Subtitle>Perícias fixas garantidas pela origem</Subtitle>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {fixedSkills.map((sk) => (
              <SkillTag key={sk} skillKey={sk} />
            ))}
          </div>
        </div>
      )}

      {choiceOneOf && (
        <div style={{ marginBottom: 18 }}>
          <Subtitle>Escolha uma: {choiceOneOf.map((k) => SKILLS.find((s) => s.key === k)?.label).join(" ou ")}</Subtitle>
          <div style={{ display: "flex", gap: 8 }}>
            {choiceOneOf.map((k) => (
              <Pill key={k} active={oneOfChoice === k} onClick={() => handleOneOf(k)}>
                {SKILLS.find((s) => s.key === k)?.label}
              </Pill>
            ))}
          </div>
        </div>
      )}

      {choiceCount > 0 && (
        <div style={{ marginBottom: 18 }}>
          <Subtitle>
            Escolha {choiceCount} perícia(s) adicional(is) ({fixedChoiceSkills.length}/{choiceCount})
          </Subtitle>
          <SkillGrid
            skills={SKILLS.filter((s) => !fixedSkills.includes(s.key) && s.key !== oneOfChoice)}
            selected={fixedChoiceSkills}
            onToggle={toggleFixedChoice}
            disabledExtra={(key) => !fixedChoiceSkills.includes(key) && fixedChoiceSkills.length >= choiceCount}
          />
        </div>
      )}

      <div>
        <Subtitle>
          Perícias livres (igual ao seu Intelecto = {intelecto}) — {extraSkills.length}/{extraByIntellect}
        </Subtitle>
        {extraByIntellect === 0 ? (
          <p style={{ color: "#7e848c", fontSize: 13, fontFamily: "'Source Serif 4', serif" }}>
            Seu Intelecto é 0, então você não ganha perícias livres adicionais por ele.
          </p>
        ) : (
          <SkillGrid
            skills={availableForExtra}
            selected={extraSkills}
            onToggle={toggleExtraSkill}
            disabledExtra={(key) => !extraSkills.includes(key) && extraSkills.length >= extraByIntellect}
          />
        )}
      </div>
    </Card>
  );
}

function Subtitle({ children }) {
  return (
    <div
      style={{
        fontFamily: "'Oxanium', sans-serif",
        fontSize: 13,
        color: "#c9a24b",
        marginBottom: 10,
        fontWeight: 700,
      }}
    >
      {children}
    </div>
  );
}

function SkillGrid({ skills, selected, onToggle, disabledExtra }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {skills.map((s) => (
        <Pill
          key={s.key}
          active={selected.includes(s.key)}
          onClick={() => onToggle(s.key)}
          disabled={disabledExtra && disabledExtra(s.key)}
        >
          {s.label}
        </Pill>
      ))}
    </div>
  );
}

/* ---------- STEP: EXAME & CLASSE ---------- */

function StepClasse({ char, patch }) {
  const [classSkillChoices, setClassSkillChoices] = useState(char.classSkillChoices || []);
  const cls = char.classKey ? CLASSES[char.classKey] : null;
  const choiceCount = cls?.trainedSkills?.choiceCount || 0;

  const selectClass = (key) => {
    patch({ classKey: key, isAspirante: false, classSkillChoices: [] });
    setClassSkillChoices([]);
  };

  const toggleClassSkill = (key) => {
    setClassSkillChoices((prev) => {
      let next;
      if (prev.includes(key)) next = prev.filter((k) => k !== key);
      else {
        if (prev.length >= choiceCount) return prev;
        next = [...prev, key];
      }
      patch({ classSkillChoices: next });
      return next;
    });
  };

  const fixedAlreadyTrained = cls?.trainedSkills?.fixed || [];

  return (
    <Card>
      <SectionLabel eyebrow="Passo 5 de 8">Exame Hunter & Classe</SectionLabel>
      <p style={{ color: "#8d939b", fontFamily: "'Source Serif 4', serif", lineHeight: 1.6, marginBottom: 20 }}>
        Depois de passar no Exame Hunter, escolha seu tipo de Hunter. Até então, seu personagem é um{" "}
        <strong style={{ color: "#c9a24b" }}>Aspirante a Hunter</strong> (PV 9+Vigor, PA 3+Carisma, Defesa 8+Destreza).
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10, marginBottom: 22 }}>
        {Object.entries(CLASSES).map(([key, c]) => (
          <div
            key={key}
            onClick={() => selectClass(key)}
            style={{
              padding: 14,
              borderRadius: 12,
              border: `1px solid ${char.classKey === key ? "#c9a24b" : "#2a2d33"}`,
              background: char.classKey === key ? "#c9a24b14" : "#0f1113",
              cursor: "pointer",
            }}
          >
            <div style={{ fontFamily: "'Oxanium', sans-serif", fontWeight: 700, color: "#f1ede2", marginBottom: 4 }}>
              {c.label}
            </div>
            <div style={{ color: "#7e848c", fontSize: 12.5, fontFamily: "'Source Serif 4', serif", lineHeight: 1.4 }}>
              {c.blurb}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 8, fontSize: 11.5, fontFamily: "'Oxanium', sans-serif", color: "#9aa0a8" }}>
              <span>PV {c.pv.init}+VIG</span>
              <span>PA {c.pa.init}+{c.pa.attrChoice ? "INT/CAR" : "CAR"}</span>
              <span>DEF {c.defenseBase}+DEX</span>
            </div>
          </div>
        ))}
      </div>

      {cls && (
        <>
          <div style={{ marginBottom: 16, padding: 14, borderRadius: 10, background: "#0f1113", border: "1px solid #2a2d33" }}>
            <Subtitle>Perícias treinadas pela classe</Subtitle>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: choiceCount > 0 ? 12 : 0 }}>
              {fixedAlreadyTrained.map((sk) => (
                <SkillTag key={sk} skillKey={sk} />
              ))}
            </div>
            {choiceCount > 0 && (
              <>
                <Subtitle>
                  Escolha {choiceCount} perícia(s) adicional(is) ({classSkillChoices.length}/{choiceCount})
                </Subtitle>
                <SkillGrid
                  skills={SKILLS.filter((s) => !fixedAlreadyTrained.includes(s.key))}
                  selected={classSkillChoices}
                  onToggle={toggleClassSkill}
                  disabledExtra={(key) => !classSkillChoices.includes(key) && classSkillChoices.length >= choiceCount}
                />
              </>
            )}
          </div>

          {cls.pa.attrChoice && (
            <div style={{ marginBottom: 16, padding: 14, borderRadius: 10, background: "#0f1113", border: "1px solid #2a2d33" }}>
              <Subtitle>Atributo para Pontos de Aura</Subtitle>
              <div style={{ display: "flex", gap: 8 }}>
                {cls.pa.attrChoice.map((k) => (
                  <Pill key={k} active={char.paAttrChoice === k} onClick={() => patch({ paAttrChoice: k })}>
                    {ATTRIBUTES.find((a) => a.key === k)?.label}
                  </Pill>
                ))}
              </div>
            </div>
          )}

          <div style={{ padding: 14, borderRadius: 10, background: "#14202b80", border: "1px solid #2a4a5a" }}>
            <Subtitle>{cls.baseAbility.name} (habilidade base)</Subtitle>
            <p style={{ color: "#b9d4e0", fontSize: 13, fontFamily: "'Source Serif 4', serif", lineHeight: 1.5, margin: 0 }}>
              Esta habilidade evolui conforme seu nível (1, 4, 8, 12, 15). Você verá os detalhes completos na sua ficha final.
            </p>
          </div>

          {cls.startingMoneyNote && (
            <p style={{ color: "#9c9477", fontSize: 13, fontFamily: "'Source Serif 4', serif", marginTop: 12 }}>
              💰 {cls.startingMoneyNote}
            </p>
          )}
        </>
      )}
    </Card>
  );
}

/* ---------- STEP: NEN & HATSU ---------- */

function StepNen({ char, patch }) {
  const selectHatsu = (key) => {
    patch({
      hatsuPrincipal: key,
      especialistaControlAttr: key === "especializacao" ? char.especialistaControlAttr || "intelecto" : null,
    });
  };

  return (
    <Card>
      <SectionLabel eyebrow="Passo 6 de 8">Nen & Hatsu</SectionLabel>
      <p style={{ color: "#8d939b", fontFamily: "'Source Serif 4', serif", lineHeight: 1.6, marginBottom: 20 }}>
        Escolha seu tipo de Hatsu com base na personalidade do personagem. Especialização é rara: só com 19 ou 20
        em 1d20 (ou narrativamente liberada pelo mestre).
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10, marginBottom: 22 }}>
        {HATSU_TYPES.map((h) => (
          <div
            key={h.key}
            onClick={() => selectHatsu(h.key)}
            style={{
              padding: 14,
              borderRadius: 12,
              border: `1px solid ${char.hatsuPrincipal === h.key ? AURA_COLORS[h.key] : "#2a2d33"}`,
              background: char.hatsuPrincipal === h.key ? `${AURA_COLORS[h.key]}14` : "#0f1113",
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <AuraDot hatsu={h.key} size={10} />
              <span style={{ fontFamily: "'Oxanium', sans-serif", fontWeight: 700, color: "#f1ede2" }}>{h.label}</span>
            </div>
            <div style={{ color: "#7e848c", fontSize: 12.5, fontFamily: "'Source Serif 4', serif" }}>{h.personality}</div>
          </div>
        ))}
      </div>

      {char.hatsuPrincipal === "especializacao" && (
        <div style={{ marginBottom: 20, padding: 14, borderRadius: 10, background: "#0f1113", border: "1px solid #2a2d33" }}>
          <Subtitle>Atributo de Controle de Nen (Especialista escolhe livremente)</Subtitle>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {ATTRIBUTES.map((a) => (
              <Pill key={a.key} active={char.especialistaControlAttr === a.key} onClick={() => patch({ especialistaControlAttr: a.key })}>
                {a.label}
              </Pill>
            ))}
          </div>
        </div>
      )}

      {char.hatsuPrincipal && (
        <div style={{ marginBottom: 22, padding: 14, borderRadius: 10, background: "#0f1113", border: "1px solid #2a2d33" }}>
          <Subtitle>Afinidades a partir de {HATSU_TYPES.find((h) => h.key === char.hatsuPrincipal)?.label}</Subtitle>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {HATSU_TYPES.map((h) => {
              const aff = getAffinity(char.hatsuPrincipal, h.key);
              return (
                <div
                  key={h.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "5px 10px",
                    borderRadius: 8,
                    background: aff === 0 ? "#1a1a1a" : `${AURA_COLORS[h.key]}14`,
                    border: `1px solid ${aff === 0 ? "#2a2d33" : AURA_COLORS[h.key] + "55"}`,
                  }}
                >
                  <AuraDot hatsu={h.key} size={7} />
                  <span style={{ fontSize: 12, fontFamily: "'Oxanium', sans-serif", color: aff === 0 ? "#5a5e64" : "#e8d9ad" }}>
                    {h.label} {aff}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ marginBottom: 22 }}>
        <Subtitle>Especialização em princípio do Nen</Subtitle>
        <p style={{ color: "#7e848c", fontSize: 13, fontFamily: "'Source Serif 4', serif", marginBottom: 10 }}>
          Escolha um entre Ren, Zetsu ou Ten para se especializar (evolui com o nível). Os outros dois ficam no nível
          amador.
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          {["ren", "zetsu", "ten"].map((k) => (
            <Pill key={k} active={char.nenSpecialization === k} onClick={() => patch({ nenSpecialization: k })}>
              {NEN_PRINCIPLES[k].label}
            </Pill>
          ))}
        </div>
        {char.nenSpecialization && (
          <p style={{ color: "#8d939b", fontSize: 12.5, fontFamily: "'Source Serif 4', serif", marginTop: 10 }}>
            {NEN_PRINCIPLES[char.nenSpecialization].desc}
          </p>
        )}
      </div>

      <div>
        <Subtitle>Técnica de Nen inicial (nível 1)</Subtitle>
        <p style={{ color: "#7e848c", fontSize: 13, fontFamily: "'Source Serif 4', serif", marginBottom: 10 }}>
          Você aprenderá naturalmente uma técnica em níveis 1, 4, 8, 11 e 15. Escolha a primeira agora.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {Object.entries(NEN_TECHNIQUES).map(([k, t]) => (
            <Pill
              key={k}
              active={(char.nenTechniquesKnown || []).includes(k)}
              onClick={() => patch({ nenTechniquesKnown: [k] })}
            >
              {t.label}
            </Pill>
          ))}
        </div>
        {char.nenTechniquesKnown?.[0] && (
          <p style={{ color: "#8d939b", fontSize: 12.5, fontFamily: "'Source Serif 4', serif", marginTop: 10 }}>
            {NEN_TECHNIQUES[char.nenTechniquesKnown[0]].desc}
          </p>
        )}
      </div>
    </Card>
  );
}

/* ---------- LOJA SIMPLIFICADA (itens mais comuns) ---------- */

const SHOP_ITEMS = [
  // armas corpo a corpo
  { name: "Adaga", price: 30000, cat: "Arma corpo a corpo", note: "1d4+DEX · crítico 19/x2 · cortante · peso 1" },
  { name: "Espada comum", price: 60000, cat: "Arma corpo a corpo", note: "2d6+FOR · crítico 19/x2 · cortante · peso 2" },
  { name: "Espada pesada", price: 80000, cat: "Arma corpo a corpo", note: "3d6+FOR (req. 3 FOR) · crítico 20/x3 · cortante · peso 3" },
  { name: "Katana", price: 75000, cat: "Arma corpo a corpo", note: "2d8+DEX (req. 2 DEX) · crítico 19/x3 · cortante · peso 2" },
  { name: "Tetsubo", price: 150000, cat: "Arma corpo a corpo", note: "4d6+FOR (req. 3 FOR) · crítico 20/x2 · impacto · peso 3" },
  { name: "Garras de aço", price: 110000, cat: "Arma corpo a corpo", note: "1d4+FOR · crítico 20/x4 · cortante · peso 1" },
  // armas à distância
  { name: "Arco", price: 25000, cat: "Arma à distância", note: "2d4 · crítico 19/x3 · perfurante · alcance médio · peso 1" },
  { name: "Magnum", price: 40000, cat: "Arma à distância", note: "2d6 · crítico 18/x3 · perfurante · alcance curto · peso 1" },
  { name: "Rifle", price: 200000, cat: "Arma à distância", note: "2d8+DEX · crítico 20/x3 · alcance médio/longo · peso 1" },
  { name: "Besta", price: 45000, cat: "Arma à distância", note: "3d4 · crítico 20/x4 · perfurante · alcance médio · peso 2" },
  // proteção
  { name: "Escudo leve", price: 30000, cat: "Proteção", note: "+3 defesa, -1 dado para atacar · peso 3" },
  { name: "Cota de malha", price: 50000, cat: "Proteção", note: "3 resistência a dano cortante · peso 1" },
  { name: "Colete balístico", price: 60000, cat: "Proteção", note: "3 resistência a dano perfurante · peso 2" },
  { name: "Escudo pesado", price: 90000, cat: "Proteção", note: "+5 defesa, cobertura total, não pode atacar · peso 5" },
  // kits e diversos
  { name: "Kit médico", price: 15000, cat: "Kits", note: "+5 Medicina, 2 usos · peso 1" },
  { name: "Kit de antídotos", price: 15000, cat: "Kits", note: "Atrasa/reduz veneno, 1 uso · peso 1" },
  { name: "Kit de disfarce", price: 15000, cat: "Kits", note: "+5 Enganação, 2 usos · peso 1" },
  { name: "Mochila", price: 50000, cat: "Diversos", note: "+5 espaços de carga" },
  { name: "Corda (20m)", price: 10000, cat: "Diversos", note: "peso 1" },
  { name: "Lanterna", price: 30000, cat: "Diversos", note: "ilumina raio de 12m · peso 1" },
  { name: "Pedra de Aura", price: 250000, cat: "Artefato 1★", note: "Recupera 5 PA, 1x/cena · peso 1" },
];

/* ---------- STEP: EQUIPAMENTO ---------- */

function StepEquipamento({ char, patch }) {
  const cls = char.classKey ? CLASSES[char.classKey] : null;
  const startingMoney = cls ? cls.startingMoney : ASPIRANTE_HUNTER.startingMoney;
  const spent = (char.equipment || []).reduce((acc, i) => acc + i.price * i.qty, 0);
  const money = char.money ?? startingMoney;

  useEffect(() => {
    if (char.money === undefined || char.money === null) {
      patch({ money: startingMoney });
    }
  }, []);

  const addItem = (item) => {
    const list = [...(char.equipment || [])];
    const existing = list.find((i) => i.name === item.name);
    if (existing) existing.qty += 1;
    else list.push({ name: item.name, price: item.price, qty: 1, note: item.note });
    const newSpent = list.reduce((acc, i) => acc + i.price * i.qty, 0);
    patch({ equipment: list, money: startingMoney - newSpent });
  };

  const removeItem = (name) => {
    const list = [...(char.equipment || [])];
    const idx = list.findIndex((i) => i.name === name);
    if (idx === -1) return;
    if (list[idx].qty > 1) list[idx].qty -= 1;
    else list.splice(idx, 1);
    const newSpent = list.reduce((acc, i) => acc + i.price * i.qty, 0);
    patch({ equipment: list, money: startingMoney - newSpent });
  };

  const categories = [...new Set(SHOP_ITEMS.map((i) => i.cat))];

  return (
    <Card>
      <SectionLabel eyebrow="Passo 7 de 8">Equipamento inicial</SectionLabel>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
          borderRadius: 10,
          background: "#0f1113",
          border: "1px solid #2a2d33",
          marginBottom: 20,
        }}
      >
        <span style={{ color: "#9aa0a8", fontFamily: "'Oxanium', sans-serif", fontSize: 13 }}>Dinheiro disponível</span>
        <span style={{ color: char.money < 0 ? "#e0533d" : "#e8d9ad", fontFamily: "'Oxanium', sans-serif", fontWeight: 800, fontSize: 18 }}>
          {(char.money ?? startingMoney).toLocaleString("pt-BR")} J
        </span>
      </div>

      {categories.map((cat) => (
        <div key={cat} style={{ marginBottom: 18 }}>
          <Subtitle>{cat}</Subtitle>
          <div style={{ display: "grid", gap: 6 }}>
            {SHOP_ITEMS.filter((i) => i.cat === cat).map((item) => {
              const inCart = (char.equipment || []).find((i) => i.name === item.name);
              return (
                <div
                  key={item.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderRadius: 10,
                    background: "#0f1113",
                    border: "1px solid #2a2d33",
                  }}
                >
                  <div>
                    <div style={{ color: "#f1ede2", fontFamily: "'Oxanium', sans-serif", fontWeight: 600, fontSize: 13.5 }}>
                      {item.name}{" "}
                      <span style={{ color: "#6a6f76", fontWeight: 400 }}>· {item.price.toLocaleString("pt-BR")}J</span>
                    </div>
                    <div style={{ color: "#7e848c", fontSize: 12, fontFamily: "'Source Serif 4', serif" }}>{item.note}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {inCart && (
                      <>
                        <button onClick={() => removeItem(item.name)} style={{ ...btnCircleStyle, width: 24, height: 24 }}>
                          −
                        </button>
                        <span style={{ color: "#e8d9ad", minWidth: 14, textAlign: "center" }}>{inCart.qty}</span>
                      </>
                    )}
                    <button
                      onClick={() => addItem(item)}
                      disabled={(char.money ?? startingMoney) < item.price}
                      style={{ ...btnCircleStyle, width: 24, height: 24, opacity: (char.money ?? startingMoney) < item.price ? 0.3 : 1 }}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {char.equipment && char.equipment.length > 0 && (
        <div style={{ marginTop: 10, padding: 14, borderRadius: 10, background: "#0f1113", border: "1px solid #2a2d33" }}>
          <Subtitle>Inventário</Subtitle>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {char.equipment.map((i) => (
              <span
                key={i.name}
                style={{
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: "#c9a24b1f",
                  border: "1px solid #c9a24b55",
                  color: "#e8d9ad",
                  fontSize: 12.5,
                  fontFamily: "'Oxanium', sans-serif",
                }}
              >
                {i.name} ×{i.qty}
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

/* ---------- STEP: REVISÃO ---------- */

function StepRevisao({ char }) {
  const finalAttrs = useMemo(() => computeFinalAttrs(char), [char]);
  const maxPV = calcMaxPV({ ...char, attrs: finalAttrs });
  const maxPA = calcMaxPA({ ...char, attrs: finalAttrs });
  const defense = calcDefenseBase({ ...char, attrs: finalAttrs });
  const cls = char.classKey ? CLASSES[char.classKey] : null;

  return (
    <Card>
      <SectionLabel eyebrow="Passo 8 de 8">Revise antes de gerar a licença</SectionLabel>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
        <AuraDot hatsu={char.hatsuPrincipal} size={16} />
        <div>
          <div style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 22, fontWeight: 800, color: "#f1ede2" }}>
            {char.name || "Sem nome"}
          </div>
          <div style={{ color: "#9c9477", fontSize: 13, fontFamily: "'Source Serif 4', serif" }}>
            {cls?.label || "Aspirante a Hunter"} · {ORIGINS[char.originKey]?.label}
            {char.originSubchoiceLabel ? ` (${char.originSubchoiceLabel})` : ""}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 10, marginBottom: 22 }}>
        <StatBox label="PV" value={maxPV} color="#e0533d" />
        <StatBox label="PA" value={maxPA} color="#4d8de0" />
        <StatBox label="Defesa" value={defense} color="#9aa0a8" />
        <StatBox label="Carga" value={calcCarryCapacity(finalAttrs)} color="#9c9477" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))", gap: 8, marginBottom: 22 }}>
        {ATTRIBUTES.map((a) => (
          <div key={a.key} style={{ textAlign: "center", padding: "10px 6px", borderRadius: 10, background: "#0f1113", border: "1px solid #2a2d33" }}>
            <div style={{ color: "#7e848c", fontSize: 11, fontFamily: "'Oxanium', sans-serif" }}>{a.short}</div>
            <div style={{ color: "#f1ede2", fontSize: 20, fontFamily: "'Oxanium', sans-serif", fontWeight: 800 }}>
              {finalAttrs[a.key]}
            </div>
          </div>
        ))}
      </div>

      <p style={{ color: "#8d939b", fontFamily: "'Source Serif 4', serif", fontSize: 13.5, lineHeight: 1.6 }}>
        Tudo certo? Ao confirmar, sua ficha será salva neste dispositivo e você poderá acompanhar PV, PA, nível e
        habilidades direto pelo celular durante a sessão.
      </p>
    </Card>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div style={{ textAlign: "center", padding: "14px 8px", borderRadius: 12, background: "#0f1113", border: `1px solid ${color}44` }}>
      <div style={{ color: "#7e848c", fontSize: 11, fontFamily: "'Oxanium', sans-serif", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </div>
      <div style={{ color, fontSize: 26, fontFamily: "'Oxanium', sans-serif", fontWeight: 800 }}>{value}</div>
    </div>
  );
}

/* ---------- cálculo de atributos finais (base + origem) ---------- */

function computeFinalAttrs(char) {
  const base = { ...char.attrs };
  const origin = char.originKey ? ORIGINS[char.originKey] : null;
  if (!origin) return base;

  const isHerdeiro = char.originKey === "herdeiro";
  const subDef = origin.subchoices?.options.find((o) => o.key === char.originSubchoice);
  const bonus = isHerdeiro ? subDef?.attrBonus : origin.attrBonus;
  if (!bonus) return base;

  const result = { ...base };
  if (bonus.type === "fixed") {
    for (const [k, v] of Object.entries(bonus.fixed)) result[k] = (result[k] || 0) + v;
  } else if (bonus.type === "fixed_plus_choice") {
    for (const [k, v] of Object.entries(bonus.fixed)) result[k] = (result[k] || 0) + v;
    for (const k of char.originAttrChoices || []) result[k] = (result[k] || 0) + 1;
  } else if (bonus.type === "choice") {
    for (const k of char.originAttrChoices || []) result[k] = (result[k] || 0) + 1;
  }
  return result;
}

/* =================================================================================
   TELA: FICHA (dashboard de jogo)
   ================================================================================= */

const SHEET_TABS = [
  { key: "principal", label: "Principal" },
  { key: "pericias", label: "Perícias" },
  { key: "habilidades", label: "Habilidades" },
  { key: "nen", label: "Nen" },
  { key: "inventario", label: "Inventário" },
  { key: "anotacoes", label: "Notas" },
];

function CharacterSheet({ characterId, onBack }) {
  const [char, setChar] = useState(null);
  const [tab, setTab] = useState("principal");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    storageLoadCharacter(characterId).then((c) => setChar(c));
  }, [characterId]);

  const update = useCallback(
    (fields) => {
      setChar((prev) => {
        const next = { ...prev, ...fields };
        setSaving(true);
        storageSaveCharacter(next).finally(() => setSaving(false));
        return next;
      });
    },
    []
  );

  if (!char) {
    return <div style={{ padding: 60, textAlign: "center", color: "#8d939b" }}>Carregando ficha…</div>;
  }

  const finalAttrs = computeFinalAttrs(char);
  const maxPV = calcMaxPV({ ...char, attrs: finalAttrs });
  const maxPA = calcMaxPA({ ...char, attrs: finalAttrs });
  const defense = calcDefenseBase({ ...char, attrs: finalAttrs });
  const curPV = char.currentPV ?? maxPV;
  const curPA = char.currentPA ?? maxPA;
  const cls = char.classKey ? CLASSES[char.classKey] : null;
  const hatsuColor = AURA_COLORS[char.hatsuPrincipal] || AURA_COLORS.null;

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "20px 16px 100px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <GhostButton onClick={onBack} style={{ padding: "8px 14px", fontSize: 13 }}>
          ← Fichas
        </GhostButton>
        <span style={{ color: "#5a5e64", fontSize: 12, fontFamily: "'Oxanium', sans-serif" }}>
          {saving ? "salvando…" : "salvo"}
        </span>
      </div>

      <SheetHeader char={char} update={update} maxPV={maxPV} maxPA={maxPA} hatsuColor={hatsuColor} />

      <div style={{ display: "flex", gap: 4, overflowX: "auto", margin: "22px 0 18px", borderBottom: "1px solid #2a2d33" }}>
        {SHEET_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: "10px 16px",
              background: "transparent",
              border: "none",
              borderBottom: `2px solid ${tab === t.key ? "#c9a24b" : "transparent"}`,
              color: tab === t.key ? "#f1ede2" : "#7e848c",
              fontFamily: "'Oxanium', sans-serif",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "principal" && (
        <TabPrincipal
          char={char}
          update={update}
          finalAttrs={finalAttrs}
          maxPV={maxPV}
          maxPA={maxPA}
          curPV={curPV}
          curPA={curPA}
          defense={defense}
        />
      )}
      {tab === "pericias" && <TabPericias char={char} finalAttrs={finalAttrs} update={update} />}
      {tab === "habilidades" && <TabHabilidades char={char} update={update} />}
      {tab === "nen" && <TabNen char={char} update={update} finalAttrs={finalAttrs} />}
      {tab === "inventario" && <TabInventario char={char} update={update} />}
      {tab === "anotacoes" && <TabAnotacoes char={char} update={update} />}
    </div>
  );
}

function SheetHeader({ char, update, maxPV, maxPA, hatsuColor }) {
  const cls = char.classKey ? CLASSES[char.classKey] : null;
  return (
    <div
      style={{
        position: "relative",
        borderRadius: 18,
        padding: "22px 22px 20px",
        background: `linear-gradient(135deg, #181b20 0%, #14161a 60%, ${hatsuColor}10 100%)`,
        border: `1px solid ${hatsuColor}44`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -60,
          right: -60,
          width: 180,
          height: 180,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${hatsuColor}30, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14 }}>
        <div>
          <div
            style={{
              fontFamily: "'Oxanium', sans-serif",
              fontSize: 11,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: hatsuColor,
              marginBottom: 6,
            }}
          >
            Licença de Hunter
          </div>
          <input
            value={char.name}
            onChange={(e) => update({ name: e.target.value })}
            style={{
              background: "transparent",
              border: "none",
              fontFamily: "'Oxanium', sans-serif",
              fontSize: 28,
              fontWeight: 800,
              color: "#f1ede2",
              padding: 0,
              outline: "none",
              width: "100%",
              maxWidth: 320,
            }}
          />
          <div style={{ color: "#9c9477", fontSize: 13.5, fontFamily: "'Source Serif 4', serif", marginTop: 2 }}>
            {cls?.label || "Aspirante a Hunter"}
            {char.originKey && ` · ${ORIGINS[char.originKey].label}`}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <AuraDot hatsu={char.hatsuPrincipal} size={22} />
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#7e848c", fontSize: 11, fontFamily: "'Oxanium', sans-serif" }}>Nível</div>
            <LevelControl char={char} update={update} />
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 18 }}>
        <TrackerBar
          label="Pontos de Vida"
          color="#e0533d"
          current={char.currentPV ?? maxPV}
          max={maxPV}
          onChange={(v) => update({ currentPV: clamp(v, 0, maxPV) })}
        />
        <TrackerBar
          label="Pontos de Aura"
          color="#4d8de0"
          current={char.currentPA ?? maxPA}
          max={maxPA}
          onChange={(v) => update({ currentPA: clamp(v, 0, maxPA) })}
        />
      </div>
    </div>
  );
}

function LevelControl({ char, update }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <button onClick={() => update({ level: clamp((char.level || 1) - 1, 1, 15) })} style={{ ...btnCircleStyle, width: 22, height: 22, fontSize: 13 }}>
        −
      </button>
      <span style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 22, fontWeight: 800, color: "#f1ede2", minWidth: 26, textAlign: "center" }}>
        {char.level || 1}
      </span>
      <button onClick={() => update({ level: clamp((char.level || 1) + 1, 1, 15) })} style={{ ...btnCircleStyle, width: 22, height: 22, fontSize: 13 }}>
        +
      </button>
    </div>
  );
}

function TrackerBar({ label, color, current, max, onChange }) {
  const pct = max > 0 ? clamp((current / max) * 100, 0, 100) : 0;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ color: "#9aa0a8", fontSize: 11.5, fontFamily: "'Oxanium', sans-serif", letterSpacing: "0.03em" }}>
          {label}
        </span>
        <span style={{ color, fontSize: 13, fontFamily: "'Oxanium', sans-serif", fontWeight: 800 }}>
          {current} / {max}
        </span>
      </div>
      <div style={{ height: 10, borderRadius: 999, background: "#0c0d0f", overflow: "hidden", marginBottom: 8 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, transition: "width .2s ease" }} />
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <SmallBtn onClick={() => onChange(current - 5)}>−5</SmallBtn>
        <SmallBtn onClick={() => onChange(current - 1)}>−1</SmallBtn>
        <SmallBtn onClick={() => onChange(current + 1)}>+1</SmallBtn>
        <SmallBtn onClick={() => onChange(current + 5)}>+5</SmallBtn>
        <SmallBtn onClick={() => onChange(max)}>Máx</SmallBtn>
      </div>
    </div>
  );
}

function SmallBtn({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: "5px 0",
        borderRadius: 7,
        border: "1px solid #2f3338",
        background: "#13151a",
        color: "#aab0b8",
        fontSize: 11.5,
        fontFamily: "'Oxanium', sans-serif",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

/* ---------- ROLAGEM DE DADOS (pool de d20) ---------- */

function rollD20Pool(numDice) {
  const n = Math.max(1, numDice);
  const rolls = Array.from({ length: n }, () => 1 + Math.floor(Math.random() * 20));
  const best = Math.max(...rolls);
  return { rolls, best };
}

function DiceRollButton({ attrValue, skillBonus, label, skillKey }) {
  const [result, setResult] = useState(null);
  const isZero = attrValue === 0;
  const numDice = isZero ? 1 : attrValue;

  const roll = () => {
    const { rolls, best } = rollD20Pool(numDice);
    const penalty = isZero ? -5 : 0;
    const total = best + skillBonus + penalty;
    setResult({ rolls, best, total, penalty });
  };

  return (
    <div>
      <button
        onClick={roll}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid #2a2d33",
          background: "#0f1113",
          color: "#e8d9ad",
          fontFamily: "'Oxanium', sans-serif",
          fontSize: 13,
          fontWeight: 700,
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>{label}</span>
        <span style={{ color: "#7e848c", fontWeight: 400 }}>
          {numDice}d20{skillBonus !== 0 ? ` ${ModSign(skillBonus)}` : ""}
          {isZero ? " (-5)" : ""}
        </span>
      </button>
      {result && (
        <div
          style={{
            marginTop: 6,
            padding: "8px 12px",
            borderRadius: 8,
            background: "#c9a24b14",
            border: "1px solid #c9a24b44",
            fontFamily: "'Oxanium', sans-serif",
            fontSize: 13,
            color: "#e8d9ad",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span style={{ color: "#8d939b" }}>[{result.rolls.join(", ")}] melhor: {result.best}</span>
          <span style={{ fontWeight: 800, fontSize: 16 }}>= {result.total}</span>
        </div>
      )}
    </div>
  );
}

/* ---------- TAB: PRINCIPAL ---------- */

function TabPrincipal({ char, update, finalAttrs, maxPV, maxPA, curPV, curPA, defense }) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Card>
        <Subtitle>Atributos</Subtitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
          {ATTRIBUTES.map((a) => (
            <div key={a.key} style={{ padding: "10px 14px", borderRadius: 10, background: "#0f1113", border: "1px solid #2a2d33" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#9aa0a8", fontSize: 12.5, fontFamily: "'Oxanium', sans-serif" }}>{a.label}</span>
                <span style={{ color: "#f1ede2", fontSize: 18, fontFamily: "'Oxanium', sans-serif", fontWeight: 800 }}>
                  {finalAttrs[a.key]}
                </span>
              </div>
              <div style={{ color: "#5a5e64", fontSize: 11, fontFamily: "'Source Serif 4', serif", marginTop: 2 }}>
                {finalAttrs[a.key] === 0 ? "1d20 (-5)" : `${finalAttrs[a.key]}d20`}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Card style={{ textAlign: "center" }}>
          <div style={{ color: "#7e848c", fontSize: 12, fontFamily: "'Oxanium', sans-serif" }}>Defesa</div>
          <div style={{ color: "#f1ede2", fontSize: 30, fontFamily: "'Oxanium', sans-serif", fontWeight: 800 }}>{defense}</div>
        </Card>
        <Card style={{ textAlign: "center" }}>
          <div style={{ color: "#7e848c", fontSize: 12, fontFamily: "'Oxanium', sans-serif" }}>Capacidade de carga</div>
          <div style={{ color: "#f1ede2", fontSize: 30, fontFamily: "'Oxanium', sans-serif", fontWeight: 800 }}>
            {calcCarryCapacity(finalAttrs)}
          </div>
        </Card>
      </div>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Subtitle>Dinheiro</Subtitle>
          <span style={{ fontFamily: "'Oxanium', sans-serif", fontWeight: 800, fontSize: 20, color: "#e8d9ad" }}>
            {(char.money || 0).toLocaleString("pt-BR")} J
          </span>
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
          {[-50000, -10000, 10000, 50000].map((delta) => (
            <SmallBtn key={delta} onClick={() => update({ money: Math.max(0, (char.money || 0) + delta) })}>
              {delta > 0 ? `+${delta / 1000}k` : `${delta / 1000}k`}
            </SmallBtn>
          ))}
        </div>
      </Card>

      <Card>
        <Subtitle>Esforçado</Subtitle>
        <p style={{ color: "#8d939b", fontSize: 13, fontFamily: "'Source Serif 4', serif", margin: 0 }}>
          Gastando 1 ponto de Aura, ganha +2 em qualquer teste. Lembre disso ao rolar perícias na aba seguinte.
        </p>
      </Card>

      {char.originKey && (
        <Card>
          <Subtitle>Origem: {ORIGINS[char.originKey].label}{char.originSubchoiceLabel ? ` — ${char.originSubchoiceLabel}` : ""}</Subtitle>
          <OriginSummaryText char={char} />
        </Card>
      )}
    </div>
  );
}

function OriginSummaryText({ char }) {
  const origin = ORIGINS[char.originKey];
  const isHerdeiro = char.originKey === "herdeiro";
  const subDef = origin.subchoices?.options.find((o) => o.key === char.originSubchoice);
  const drawback = isHerdeiro ? subDef?.drawback : origin.drawback;
  const special = subDef?.special;
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {drawback && (
        <p style={{ color: "#cbb39e", fontSize: 13, fontFamily: "'Source Serif 4', serif", margin: 0 }}>
          <strong style={{ color: "#e0a070" }}>Desvantagem: </strong>
          {drawback}
        </p>
      )}
      {special && (
        <p style={{ color: "#b9d4e0", fontSize: 13, fontFamily: "'Source Serif 4', serif", margin: 0 }}>
          <strong style={{ color: "#7ec0e0" }}>Especial: </strong>
          {special}
        </p>
      )}
      {origin.racialBonus && (
        <p style={{ color: "#b9e0c8", fontSize: 13, fontFamily: "'Source Serif 4', serif", margin: 0 }}>
          <strong style={{ color: "#7ee0a0" }}>Bônus racial: </strong>
          {origin.racialBonus}
        </p>
      )}
    </div>
  );
}

/* ---------- TAB: PERÍCIAS ---------- */

function TabPericias({ char, finalAttrs, update }) {
  const trained = new Set([
    ...(char.skillsTrained || []),
    ...(char.classSkillChoices || []),
    ...(char.originOneOfSkill ? [char.originOneOfSkill] : []),
    ...(char.originFixedChoiceSkills || []),
  ]);
  const cls = char.classKey ? CLASSES[char.classKey] : null;
  if (cls?.trainedSkills?.fixed) cls.trainedSkills.fixed.forEach((s) => trained.add(s));

  const nenAttr = getNenControlAttr(char.hatsuPrincipal, char.especialistaControlAttr);

  const grouped = useMemo(() => {
    const byAttr = {};
    for (const a of ATTRIBUTES) byAttr[a.key] = [];
    byAttr.variavel = [];
    for (const s of SKILLS) {
      if (s.key === "controle_nen") {
        byAttr.variavel.push(s);
      } else {
        byAttr[s.attr].push(s);
      }
    }
    return byAttr;
  }, []);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Card>
        <p style={{ color: "#8d939b", fontSize: 13, fontFamily: "'Source Serif 4', serif", margin: 0 }}>
          Toque em uma perícia para rolar. O número de d20 = valor do atributo (pega o melhor resultado); perícias
          treinadas somam <strong style={{ color: "#c9a24b" }}>+5</strong>.
        </p>
      </Card>

      {ATTRIBUTES.map((a) => {
        const skillsForAttr = grouped[a.key];
        if (skillsForAttr.length === 0) return null;
        return (
          <Card key={a.key}>
            <Subtitle>
              {a.label} <span style={{ color: "#5a5e64", fontWeight: 400 }}>({finalAttrs[a.key]}d20)</span>
            </Subtitle>
            <div style={{ display: "grid", gap: 8 }}>
              {skillsForAttr.map((s) => {
                const isTrained = trained.has(s.key);
                const bonus = isTrained ? 5 : 0;
                return (
                  <DiceRollButton
                    key={s.key}
                    attrValue={finalAttrs[a.key]}
                    skillBonus={bonus}
                    label={`${s.label}${isTrained ? " ●" : ""}`}
                    skillKey={s.key}
                  />
                );
              })}
            </div>
          </Card>
        );
      })}

      <Card>
        <Subtitle>
          Controle de Nen{" "}
          <span style={{ color: "#5a5e64", fontWeight: 400 }}>
            ({nenAttr ? `${ATTRIBUTES.find((a) => a.key === nenAttr)?.label} · ${finalAttrs[nenAttr]}d20` : "defina seu Hatsu"})
          </span>
        </Subtitle>
        {nenAttr && (
          <DiceRollButton
            attrValue={finalAttrs[nenAttr]}
            skillBonus={trained.has("controle_nen") ? 5 : 0}
            label={`Controle de Nen${trained.has("controle_nen") ? " ●" : ""}`}
            skillKey="controle_nen"
          />
        )}
      </Card>

      <Card>
        <Subtitle>Dificuldade de Teste (referência)</Subtitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: 8 }}>
          {TEST_DIFFICULTY.map((d) => (
            <div key={d.key} style={{ padding: "8px 12px", borderRadius: 8, background: "#0f1113", border: "1px solid #2a2d33", textAlign: "center" }}>
              <div style={{ color: "#9aa0a8", fontSize: 12, fontFamily: "'Oxanium', sans-serif" }}>{d.label}</div>
              <div style={{ color: "#c9a24b", fontSize: 15, fontFamily: "'Oxanium', sans-serif", fontWeight: 700 }}>DT {d.range}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ---------- TAB: HABILIDADES ---------- */

function abilitySlotsForLevel(level) {
  // conforme tabela de subida de nível: ganha habilidade de classe em todo nível exceto 1, 5, 10, 15
  // (1 = base ability lvl1; 5/10/15 = ponto de atributo; os demais = habilidade de classe)
  const noAbilityLevels = new Set([1, 5, 10, 15]);
  let count = 0;
  for (let l = 1; l <= level; l++) {
    if (!noAbilityLevels.has(l)) count++;
  }
  return count;
}

function TabHabilidades({ char, update }) {
  const cls = char.classKey ? CLASSES[char.classKey] : null;
  const level = char.level || 1;

  if (!cls) {
    return (
      <Card>
        <p style={{ color: "#8d939b", fontFamily: "'Source Serif 4', serif" }}>
          Como Aspirante a Hunter, você só tem a habilidade <strong style={{ color: "#c9a24b" }}>Esforçado</strong>{" "}
          (1 PA = +2 em qualquer teste). Escolha uma classe para destravar a árvore de habilidades.
        </p>
      </Card>
    );
  }

  const baseAbilityLevels = cls.baseAbility.levels.filter((l) => l.lvl <= level);
  const slots = abilitySlotsForLevel(level);
  const chosen = char.classAbilitiesChosen || [];
  const remainingSlots = slots - chosen.length;

  const toggleAbility = (name) => {
    let next;
    if (chosen.includes(name)) next = chosen.filter((n) => n !== name);
    else {
      if (remainingSlots <= 0) return;
      next = [...chosen, name];
    }
    update({ classAbilitiesChosen: next });
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <Subtitle>{cls.baseAbility.name}</Subtitle>
          <span style={{ color: "#5a5e64", fontSize: 12, fontFamily: "'Oxanium', sans-serif" }}>habilidade base</span>
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {baseAbilityLevels.map((l) => (
            <div key={l.lvl} style={{ padding: "10px 14px", borderRadius: 10, background: "#0f1113", border: "1px solid #2a2d33" }}>
              <div style={{ color: "#c9a24b", fontSize: 12, fontFamily: "'Oxanium', sans-serif", fontWeight: 700, marginBottom: 4 }}>
                Nível {l.lvl}
              </div>
              <div style={{ color: "#cfd3d8", fontSize: 13.5, fontFamily: "'Source Serif 4', serif", lineHeight: 1.5 }}>{l.text}</div>
            </div>
          ))}
        </div>
      </Card>

      {cls.combatAdaptation && (
        <Card>
          <Subtitle>Adaptação ao Combate</Subtitle>
          {["lvl1", "lvl2", "lvl3"].map((k, i) => {
            const minLevelForTier = i === 0 ? 1 : i === 1 ? 8 : 15;
            if (level < minLevelForTier) return null;
            const tier = cls.combatAdaptation[k];
            return (
              <div key={k} style={{ marginBottom: 10, padding: "10px 14px", borderRadius: 10, background: "#0f1113", border: "1px solid #2a2d33" }}>
                <div style={{ color: "#c9a24b", fontSize: 12, fontFamily: "'Oxanium', sans-serif", fontWeight: 700, marginBottom: 6 }}>
                  Tier {i + 1}
                </div>
                <p style={{ color: "#cfd3d8", fontSize: 13, margin: "0 0 4px", fontFamily: "'Source Serif 4', serif" }}>
                  <strong>Aquecimento (1 rodada):</strong> {tier.warmup}
                </p>
                <p style={{ color: "#cfd3d8", fontSize: 13, margin: "0 0 4px", fontFamily: "'Source Serif 4', serif" }}>
                  <strong>Se adaptando (3 rodadas):</strong> {tier.adapt}
                </p>
                <p style={{ color: "#cfd3d8", fontSize: 13, margin: 0, fontFamily: "'Source Serif 4', serif" }}>
                  <strong>Imparável (5 rodadas):</strong> {tier.unstoppable}
                </p>
              </div>
            );
          })}
        </Card>
      )}

      {cls.fightingStyles && (
        <Card>
          <Subtitle>Estilos de Luta conhecidos</Subtitle>
          <FightingStylePicker char={char} update={update} cls={cls} />
        </Card>
      )}

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
          <Subtitle>Habilidades de classe escolhidas</Subtitle>
          <span
            style={{
              color: remainingSlots > 0 ? "#e0c23d" : "#7fcf7f",
              fontSize: 12,
              fontFamily: "'Oxanium', sans-serif",
              fontWeight: 700,
            }}
          >
            {chosen.length}/{slots} slots
          </span>
        </div>
        <p style={{ color: "#7e848c", fontSize: 12.5, fontFamily: "'Source Serif 4', serif", marginTop: 0 }}>
          Você ganha 1 habilidade de classe na maioria dos níveis (exceto 1, 5, 10 e 15, que dão ponto de atributo).
          No seu nível atual ({level}), você tem direito a {slots} habilidade(s) no total.
        </p>
        <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
          {cls.abilityPool.map((ab) => {
            const isChosen = chosen.includes(ab.name);
            return (
              <div
                key={ab.name}
                onClick={() => toggleAbility(ab.name)}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: `1px solid ${isChosen ? "#c9a24b" : "#2a2d33"}`,
                  background: isChosen ? "#c9a24b14" : "#0f1113",
                  cursor: remainingSlots > 0 || isChosen ? "pointer" : "not-allowed",
                  opacity: !isChosen && remainingSlots <= 0 ? 0.45 : 1,
                }}
              >
                <div style={{ color: "#f1ede2", fontFamily: "'Oxanium', sans-serif", fontWeight: 700, fontSize: 13.5, marginBottom: 3 }}>
                  {ab.name}
                </div>
                <div style={{ color: "#8d939b", fontSize: 12.5, fontFamily: "'Source Serif 4', serif", lineHeight: 1.45 }}>
                  {ab.desc}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function FightingStylePicker({ char, update, cls }) {
  const known = char.fightingStylesKnown || [];
  const level = char.level || 1;
  const baseSlots = level >= 4 ? 1 : 0;
  const extraFromAbility = (char.classAbilitiesChosen || []).filter((n) => n === "Lutador Aplicado").length;
  const extraFromLvl12 = level >= 12 ? 1 : 0;
  const totalSlots = baseSlots + extraFromAbility + extraFromLvl12;

  const toggle = (name) => {
    let next;
    if (known.includes(name)) next = known.filter((n) => n !== name);
    else {
      if (known.length >= totalSlots) return;
      next = [...known, name];
    }
    update({ fightingStylesKnown: next });
  };

  return (
    <div>
      <p style={{ color: "#7e848c", fontSize: 12.5, fontFamily: "'Source Serif 4', serif", marginTop: 0 }}>
        Slots disponíveis: {known.length}/{totalSlots} (1 a partir do nível 4 via Duelista Nato; +1 a cada "Lutador
        Aplicado"; +1 no nível 12).
      </p>
      <div style={{ display: "grid", gap: 8 }}>
        {cls.fightingStyles.map((fs) => {
          const isKnown = known.includes(fs.name);
          return (
            <div
              key={fs.name}
              onClick={() => toggle(fs.name)}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: `1px solid ${isKnown ? "#c9a24b" : "#2a2d33"}`,
                background: isKnown ? "#c9a24b14" : "#0f1113",
                cursor: "pointer",
              }}
            >
              <div style={{ color: "#f1ede2", fontFamily: "'Oxanium', sans-serif", fontWeight: 700, fontSize: 13.5 }}>{fs.name}</div>
              <div style={{ color: "#8d939b", fontSize: 12.5, fontFamily: "'Source Serif 4', serif", marginTop: 3 }}>{fs.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- TAB: NEN ---------- */

function TabNen({ char, update, finalAttrs }) {
  const level = char.level || 1;
  const hatsuLearnedSoFar = HATSU_LEARN_LEVELS.filter((l) => l <= level).length;
  const techLearnedSoFar = NEN_TECHNIQUE_LEARN_LEVELS.filter((l) => l <= level).length;
  const hatsuAbilities = char.hatsuAbilities || [];
  const techniquesKnown = char.nenTechniquesKnown || [];

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Card>
        <Subtitle>Princípios do Nen</Subtitle>
        <div style={{ display: "grid", gap: 10 }}>
          {["ren", "zetsu", "ten"].map((k) => {
            const isSpecialized = char.nenSpecialization === k;
            const tierKey = isSpecialized
              ? level >= 15 ? "mestre" : level >= 10 ? "avancado" : level >= 5 ? "intermediario" : "amador"
              : "amador";
            const tier = NEN_PRINCIPLES[k].levels[tierKey];
            return (
              <div
                key={k}
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  background: isSpecialized ? "#c9a24b14" : "#0f1113",
                  border: `1px solid ${isSpecialized ? "#c9a24b" : "#2a2d33"}`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ color: "#f1ede2", fontFamily: "'Oxanium', sans-serif", fontWeight: 700 }}>
                    {NEN_PRINCIPLES[k].label} {isSpecialized && <span style={{ color: "#c9a24b", fontSize: 11 }}>★ especializado</span>}
                  </span>
                  <span style={{ color: "#9aa0a8", fontSize: 12, fontFamily: "'Oxanium', sans-serif" }}>
                    {capitalize(tierKey)} (nível {tier.lvl})
                  </span>
                </div>
                <p style={{ color: "#8d939b", fontSize: 12.5, margin: "6px 0 0", fontFamily: "'Source Serif 4', serif" }}>
                  Custo: {tier.cost}. {tier.effect}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <Subtitle>Técnicas avançadas</Subtitle>
          <span style={{ color: techniquesKnown.length < techLearnedSoFar ? "#e0c23d" : "#7fcf7f", fontSize: 12, fontFamily: "'Oxanium', sans-serif", fontWeight: 700 }}>
            {techniquesKnown.length}/{techLearnedSoFar} aprendidas
          </span>
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          {Object.entries(NEN_TECHNIQUES).map(([k, t]) => {
            const known = techniquesKnown.includes(k);
            return (
              <div
                key={k}
                onClick={() => {
                  let next;
                  if (known) next = techniquesKnown.filter((x) => x !== k);
                  else {
                    if (techniquesKnown.length >= techLearnedSoFar) return;
                    next = [...techniquesKnown, k];
                  }
                  update({ nenTechniquesKnown: next });
                }}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: `1px solid ${known ? "#c9a24b" : "#2a2d33"}`,
                  background: known ? "#c9a24b14" : "#0f1113",
                  cursor: "pointer",
                  opacity: !known && techniquesKnown.length >= techLearnedSoFar ? 0.45 : 1,
                }}
              >
                <div style={{ color: "#f1ede2", fontFamily: "'Oxanium', sans-serif", fontWeight: 700, fontSize: 13.5 }}>{t.label}</div>
                <div style={{ color: "#8d939b", fontSize: 12.5, fontFamily: "'Source Serif 4', serif", marginTop: 3 }}>{t.desc}</div>
                {t.effect && (
                  <div style={{ color: "#9c9477", fontSize: 12, fontFamily: "'Source Serif 4', serif", marginTop: 4 }}>{t.effect}</div>
                )}
                {t.variants && (
                  <div style={{ marginTop: 6, display: "grid", gap: 4 }}>
                    {t.variants.map((v) => (
                      <div key={v.name} style={{ color: "#9c9477", fontSize: 12, fontFamily: "'Source Serif 4', serif" }}>
                        <strong style={{ color: "#c9a24b" }}>{v.name}:</strong> {v.desc}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <HatsuAbilityCreator char={char} update={update} hatsuLearnedSoFar={hatsuLearnedSoFar} />
    </div>
  );
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ---------- CRIADOR DE HABILIDADES DE HATSU ---------- */

function HatsuAbilityCreator({ char, update, hatsuLearnedSoFar }) {
  const [form, setForm] = useState({ name: "", type: char.hatsuPrincipal || "intensificacao", category: "base", desc: "" });
  const abilities = char.hatsuAbilities || [];

  const affinity = getAffinity(char.hatsuPrincipal, form.type);
  const costRange = HATSU_COST_BY_AFFINITY[affinity]?.[form.category] || "—";
  const dt = HATSU_CATEGORY_DT[form.category];
  const canUseType = char.hatsuPrincipal === "especializacao" || form.type !== "especializacao";

  const addAbility = () => {
    if (!form.name.trim()) return;
    if (abilities.length >= hatsuLearnedSoFar) return;
    const next = [...abilities, { ...form, affinity, costRange, dt, id: uid() }];
    update({ hatsuAbilities: next });
    setForm({ name: "", type: char.hatsuPrincipal || "intensificacao", category: "base", desc: "" });
  };

  const removeAbility = (id) => {
    update({ hatsuAbilities: abilities.filter((a) => a.id !== id) });
  };

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <Subtitle>Habilidades de Hatsu</Subtitle>
        <span
          style={{
            color: abilities.length < hatsuLearnedSoFar ? "#e0c23d" : "#7fcf7f",
            fontSize: 12,
            fontFamily: "'Oxanium', sans-serif",
            fontWeight: 700,
          }}
        >
          {abilities.length}/{hatsuLearnedSoFar} aprendidas
        </span>
      </div>
      <p style={{ color: "#7e848c", fontSize: 12.5, fontFamily: "'Source Serif 4', serif", marginTop: 0 }}>
        Crie suas habilidades junto com o mestre. O custo em PA é calculado automaticamente pela categoria (nível em
        que foi aprendida) e pela sua afinidade com o tipo de Hatsu escolhido.
      </p>

      {abilities.length > 0 && (
        <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
          {abilities.map((ab) => (
            <div key={ab.id} style={{ padding: "10px 14px", borderRadius: 10, background: "#0f1113", border: "1px solid #2a2d33" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <AuraDot hatsu={ab.type} size={8} />
                    <span style={{ color: "#f1ede2", fontFamily: "'Oxanium', sans-serif", fontWeight: 700, fontSize: 13.5 }}>{ab.name}</span>
                  </div>
                  <div style={{ color: "#9aa0a8", fontSize: 11.5, fontFamily: "'Oxanium', sans-serif", marginTop: 3 }}>
                    {HATSU_TYPES.find((h) => h.key === ab.type)?.label} · {HATSU_CATEGORY_LEVEL_RANGE[ab.category]} ·{" "}
                    {ab.affinity}% afinidade · Custo {ab.costRange} PA · DT {ab.dt}
                  </div>
                  {ab.desc && (
                    <div style={{ color: "#8d939b", fontSize: 12.5, fontFamily: "'Source Serif 4', serif", marginTop: 6 }}>{ab.desc}</div>
                  )}
                </div>
                <button onClick={() => removeAbility(ab.id)} style={{ ...btnCircleStyle, width: 22, height: 22, fontSize: 13 }}>
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {abilities.length < hatsuLearnedSoFar && (
        <div style={{ padding: 14, borderRadius: 10, background: "#0f1113", border: "1px solid #2a2d33" }}>
          <div style={{ display: "grid", gap: 10 }}>
            <Field label="Nome da habilidade">
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="ex: Punho de Aço"
                style={inputStyle}
              />
            </Field>
            <Field label="Tipo de Hatsu">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {HATSU_TYPES.filter((h) => h.key !== "especializacao" || char.hatsuPrincipal === "especializacao").map((h) => (
                  <Pill key={h.key} active={form.type === h.key} onClick={() => setForm((f) => ({ ...f, type: h.key }))} color={AURA_COLORS[h.key]}>
                    {h.label} ({getAffinity(char.hatsuPrincipal, h.key)}%)
                  </Pill>
                ))}
              </div>
            </Field>
            <Field label="Categoria (nível em que aprendeu)">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {Object.entries(HATSU_CATEGORY_LEVEL_RANGE).map(([key, range]) => (
                  <Pill key={key} active={form.category === key} onClick={() => setForm((f) => ({ ...f, category: key }))}>
                    {capitalize(key)} ({range})
                  </Pill>
                ))}
              </div>
            </Field>
            <Field label="Descrição / efeito / restrições">
              <textarea
                value={form.desc}
                onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
                placeholder="Descreva o efeito e as condições/restrições combinadas com o mestre..."
                rows={3}
                style={{ ...inputStyle, resize: "vertical", fontFamily: "'Source Serif 4', serif" }}
              />
            </Field>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderRadius: 8,
                background: "#c9a24b14",
                border: "1px solid #c9a24b44",
              }}
            >
              <span style={{ color: "#e8d9ad", fontFamily: "'Oxanium', sans-serif", fontSize: 13 }}>
                Custo calculado: <strong>{costRange} PA</strong>
              </span>
              <span style={{ color: "#e8d9ad", fontFamily: "'Oxanium', sans-serif", fontSize: 13 }}>
                DT de uso: <strong>{dt}</strong>
              </span>
            </div>
            <PrimaryButton onClick={addAbility} disabled={!form.name.trim()}>
              Adicionar habilidade
            </PrimaryButton>
          </div>
        </div>
      )}
    </Card>
  );
}

/* ---------- TAB: INVENTÁRIO ---------- */

function TabInventario({ char, update }) {
  const equipment = char.equipment || [];
  const [newItem, setNewItem] = useState({ name: "", qty: 1, weight: 0, note: "" });

  const addItem = () => {
    if (!newItem.name.trim()) return;
    update({ equipment: [...equipment, { ...newItem, id: uid() }] });
    setNewItem({ name: "", qty: 1, weight: 0, note: "" });
  };

  const removeItem = (idx) => {
    const next = [...equipment];
    next.splice(idx, 1);
    update({ equipment: next });
  };

  const changeQty = (idx, delta) => {
    const next = [...equipment];
    next[idx] = { ...next[idx], qty: Math.max(0, (next[idx].qty || 1) + delta) };
    update({ equipment: next.filter((i) => i.qty > 0) });
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Card>
        <Subtitle>Itens</Subtitle>
        {equipment.length === 0 && (
          <p style={{ color: "#7e848c", fontSize: 13, fontFamily: "'Source Serif 4', serif" }}>Inventário vazio.</p>
        )}
        <div style={{ display: "grid", gap: 8 }}>
          {equipment.map((item, idx) => (
            <div
              key={item.id || idx}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 14px",
                borderRadius: 10,
                background: "#0f1113",
                border: "1px solid #2a2d33",
              }}
            >
              <div>
                <div style={{ color: "#f1ede2", fontFamily: "'Oxanium', sans-serif", fontWeight: 700, fontSize: 13.5 }}>
                  {item.name}
                </div>
                {item.note && (
                  <div style={{ color: "#8d939b", fontSize: 12, fontFamily: "'Source Serif 4', serif" }}>{item.note}</div>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button onClick={() => changeQty(idx, -1)} style={{ ...btnCircleStyle, width: 22, height: 22, fontSize: 13 }}>
                  −
                </button>
                <span style={{ color: "#e8d9ad", minWidth: 18, textAlign: "center", fontFamily: "'Oxanium', sans-serif" }}>
                  {item.qty}
                </span>
                <button onClick={() => changeQty(idx, 1)} style={{ ...btnCircleStyle, width: 22, height: 22, fontSize: 13 }}>
                  +
                </button>
                <button onClick={() => removeItem(idx)} style={{ ...btnCircleStyle, width: 22, height: 22, fontSize: 13 }}>
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <Subtitle>Adicionar item manualmente</Subtitle>
        <div style={{ display: "grid", gap: 10 }}>
          <Field label="Nome">
            <input
              value={newItem.name}
              onChange={(e) => setNewItem((i) => ({ ...i, name: e.target.value }))}
              style={inputStyle}
              placeholder="ex: Corda de aço"
            />
          </Field>
          <Field label="Nota (dano, peso, efeito...)">
            <input
              value={newItem.note}
              onChange={(e) => setNewItem((i) => ({ ...i, note: e.target.value }))}
              style={inputStyle}
              placeholder="ex: peso 1, +2 em testes de escalada"
            />
          </Field>
          <PrimaryButton onClick={addItem} disabled={!newItem.name.trim()}>
            Adicionar
          </PrimaryButton>
        </div>
      </Card>

      <Card>
        <Subtitle>Reputação com facções</Subtitle>
        <div style={{ display: "grid", gap: 8 }}>
          {FACTIONS.map((f) => (
            <div key={f} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#cfd3d8", fontSize: 13, fontFamily: "'Source Serif 4', serif" }}>{f}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button
                  onClick={() => update({ reputations: { ...char.reputations, [f]: clamp((char.reputations?.[f] || 0) - 1, -5, 5) } })}
                  style={{ ...btnCircleStyle, width: 22, height: 22, fontSize: 13 }}
                >
                  −
                </button>
                <span
                  style={{
                    minWidth: 24,
                    textAlign: "center",
                    fontFamily: "'Oxanium', sans-serif",
                    fontWeight: 700,
                    color: (char.reputations?.[f] || 0) >= 0 ? "#7fcf7f" : "#e0533d",
                  }}
                >
                  {ModSign(char.reputations?.[f] || 0)}
                </span>
                <button
                  onClick={() => update({ reputations: { ...char.reputations, [f]: clamp((char.reputations?.[f] || 0) + 1, -5, 5) } })}
                  style={{ ...btnCircleStyle, width: 22, height: 22, fontSize: 13 }}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ---------- TAB: ANOTAÇÕES ---------- */

function TabAnotacoes({ char, update }) {
  return (
    <Card>
      <Subtitle>Anotações livres</Subtitle>
      <p style={{ color: "#7e848c", fontSize: 12.5, fontFamily: "'Source Serif 4', serif", marginTop: 0 }}>
        Use este espaço para histórico, condições ativas, alvos (Hunter de Recompensas), bestas (Hunter de Bestas) ou
        qualquer coisa que não tenha campo próprio.
      </p>
      <textarea
        value={char.notes || ""}
        onChange={(e) => update({ notes: e.target.value })}
        rows={14}
        placeholder="Escreva aqui..."
        style={{ ...inputStyle, resize: "vertical", fontFamily: "'Source Serif 4', serif", lineHeight: 1.5 }}
      />

      <div style={{ marginTop: 18 }}>
        <Subtitle>Condições de referência</Subtitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px,1fr))", gap: 6 }}>
          {CONDITIONS.map((c) => (
            <div key={c.name} style={{ padding: "6px 10px", borderRadius: 8, background: "#0f1113", border: "1px solid #2a2d33" }}>
              <div style={{ color: "#e8d9ad", fontSize: 12, fontFamily: "'Oxanium', sans-serif", fontWeight: 700 }}>{c.name}</div>
              <div style={{ color: "#7e848c", fontSize: 11, fontFamily: "'Source Serif 4', serif" }}>{c.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

/* =================================================================================
   APP RAIZ
   ================================================================================= */

function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Oxanium:wght@500;600;700;800&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap');
      * { box-sizing: border-box; }
      body, html { margin: 0; padding: 0; }
      input::placeholder, textarea::placeholder { color: #5a5e64; }
      input:focus, textarea:focus { outline: 1px solid #c9a24b55; }
      ::-webkit-scrollbar { height: 6px; width: 6px; }
      ::-webkit-scrollbar-thumb { background: #3a3d42; border-radius: 4px; }
      @media (prefers-reduced-motion: reduce) {
        * { transition: none !important; }
      }
    `}</style>
  );
}

function App() {
  const [route, setRoute] = useState({ screen: "home" });

  const goHome = () => setRoute({ screen: "home" });
  const goNew = () => setRoute({ screen: "wizard" });
  const openChar = (id) => setRoute({ screen: "sheet", id });

  const handleFinishWizard = async (char) => {
    await storageSaveCharacter(char);
    setRoute({ screen: "sheet", id: char.id });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at top, #1a1d22 0%, #0c0d0f 60%)",
        color: "#f1ede2",
      }}
    >
      <GlobalStyles />
      {route.screen === "home" && <HomeScreen onNewCharacter={goNew} onOpenCharacter={openChar} />}
      {route.screen === "wizard" && <CreationWizard onFinish={handleFinishWizard} onCancel={goHome} />}
      {route.screen === "sheet" && <CharacterSheet characterId={route.id} onBack={goHome} />}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
