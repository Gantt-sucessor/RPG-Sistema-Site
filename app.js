(() => {
  // site/app.jsx
  var { useState, useEffect, useMemo, useCallback } = React;
  var ATTRIBUTES = [
    { key: "forca", label: "For\xE7a", short: "FOR", desc: "Capacidade muscular, atletismo, combate corpo a corpo" },
    { key: "vigor", label: "Vigor", short: "VIG", desc: "Resist\xEAncia f\xEDsica, pontos de vida, f\xF4lego" },
    { key: "destreza", label: "Destreza", short: "DEX", desc: "Agilidade, armas \xE0 dist\xE2ncia, reflexos" },
    { key: "intelecto", label: "Intelecto", short: "INT", desc: "Racioc\xEDnio, mem\xF3ria, estrat\xE9gia" },
    { key: "carisma", label: "Carisma", short: "CAR", desc: "Persuas\xE3o, intimida\xE7\xE3o, presen\xE7a social" }
  ];
  var SKILLS = [
    { key: "atletismo", label: "Atletismo", attr: "forca" },
    { key: "duelo", label: "Duelo", attr: "forca" },
    { key: "robustez", label: "Robustez", attr: "vigor" },
    { key: "resistencia", label: "Resist\xEAncia", attr: "vigor" },
    { key: "furtividade", label: "Furtividade", attr: "destreza" },
    { key: "acrobacia", label: "Acrobacia", attr: "destreza" },
    { key: "reflexos", label: "Reflexos", attr: "destreza" },
    { key: "pontaria", label: "Pontaria", attr: "destreza" },
    { key: "roubo", label: "Roubo", attr: "destreza" },
    { key: "caca", label: "Ca\xE7a", attr: "intelecto" },
    { key: "investigacao", label: "Investiga\xE7\xE3o", attr: "intelecto" },
    { key: "medicina", label: "Medicina", attr: "intelecto" },
    { key: "profissao", label: "Profiss\xE3o", attr: "intelecto" },
    { key: "astucia", label: "Ast\xFAcia", attr: "intelecto" },
    { key: "persuasao", label: "Persuas\xE3o", attr: "carisma" },
    { key: "intimidacao", label: "Intimida\xE7\xE3o", attr: "carisma" },
    { key: "vontade", label: "Vontade", attr: "carisma" },
    { key: "intuicao", label: "Intui\xE7\xE3o", attr: "carisma" },
    { key: "tenacidade", label: "Tenacidade", attr: "carisma" },
    { key: "controle_nen", label: "Controle de Nen", attr: "variavel" }
  ];
  var NEN_CONTROL_ATTR_BY_HATSU = {
    intensificacao: "vigor",
    emissao: "forca",
    transmutacao: "destreza",
    manipulacao: "carisma",
    materializacao: "intelecto",
    especializacao: null
  };
  var HATSU_TYPES = [
    { key: "intensificacao", label: "Intensifica\xE7\xE3o", personality: "Direto, determinado, simples" },
    { key: "emissao", label: "Emiss\xE3o", personality: "Extrovertido, temperamental, imprevis\xEDvel" },
    { key: "manipulacao", label: "Manipula\xE7\xE3o", personality: "Controlador, l\xF3gico, observador" },
    { key: "materializacao", label: "Materializa\xE7\xE3o", personality: "Nervoso, mentiroso, anal\xEDtico" },
    { key: "transmutacao", label: "Transmuta\xE7\xE3o", personality: "Vol\xFAvel, enganoso, imprevis\xEDvel" },
    { key: "especializacao", label: "Especializa\xE7\xE3o", personality: "Independente, carism\xE1tico, individualista" }
  ];
  var HATSU_AFFINITIES = {
    intensificacao: { intensificacao: 100, emissao: 80, transmutacao: 80, manipulacao: 60, materializacao: 60, especializacao: 0 },
    emissao: { emissao: 100, intensificacao: 80, manipulacao: 80, transmutacao: 60, materializacao: 40, especializacao: 0 },
    transmutacao: { transmutacao: 100, intensificacao: 80, materializacao: 80, emissao: 60, manipulacao: 40, especializacao: 0 },
    manipulacao: { manipulacao: 100, emissao: 80, intensificacao: 60, materializacao: 60, transmutacao: 40, especializacao: 0 },
    materializacao: { materializacao: 100, transmutacao: 80, manipulacao: 60, intensificacao: 60, emissao: 40, especializacao: 0 },
    especializacao: { especializacao: 100, manipulacao: 80, materializacao: 80, transmutacao: 60, emissao: 60, intensificacao: 40 }
  };
  var ORIGINS = {
    treinado_hunter: {
      label: "Treinado por Hunter",
      blurb: "Voc\xEA cresceu sob a tutela de um Hunter, aprendendo Nen desde cedo, por\xE9m isso gerou complica\xE7\xF5es sociais.",
      attrBonus: { type: "choice", points: 3, allowed: ["forca", "vigor", "destreza", "intelecto"] },
      trainedSkills: { fixed: ["caca", "duelo", "pontaria", "controle_nen"], extraByIntellect: true },
      drawback: "Isolamento: escolha 1 per\xEDcia de Carisma para ter -5. No in\xEDcio de cada combate, role Vontade; se <15, fica Abalado na 1\xAA rodada.",
      subchoices: {
        label: "Qual Hunter treinou voc\xEA?",
        key: "mentor",
        options: [
          { key: "biscuit", label: "Biscuit Krueger", desc: "Treinamento f\xEDsico e aprimoramento de Nen. +1 em b\xF4nus de t\xE9cnicas b\xE1sicas (Ten/Ren/Zetsu/Hatsu); 1x/dia t\xE9cnica 'Cookie' recupera 2d6 PV ap\xF3s descanso curto. +1 Reputa\xE7\xE3o Associa\xE7\xE3o Hunter." },
          { key: "kite", label: "Kite", desc: "Sobreviv\xEAncia e adaptabilidade. 1x/dia no in\xEDcio de combate, role 1d6 para conjurar arma especial (2d6 dano) que dura o combate. +1 Reputa\xE7\xE3o Associa\xE7\xE3o Hunter." },
          { key: "morel", label: "Morel Mackernasey", desc: "Estrat\xE9gia e controle de campo. 1x/dia cria nuvem de fuma\xE7a (3m raio): +2 Furtividade, 2 clones de fuma\xE7a (2 rodadas), +2 defesa. +1 Reputa\xE7\xE3o Associa\xE7\xE3o Hunter." },
          { key: "wing", label: "Wing", desc: "Ensino e fundamentos de Nen. Aprende t\xE9cnicas de Nen 25% mais r\xE1pido; come\xE7a com 1 t\xE9cnica avan\xE7ada adicional (Gyo/In/En/Shu/Ken). +1 Reputa\xE7\xE3o Comunidade de Nen." },
          { key: "ging", label: "Ging Freecss", desc: "Arqueologia e intui\xE7\xE3o. +2 em Investiga\xE7\xE3o. 1x/dia teste de Intui\xE7\xE3o (DT 18) para dica sobre mist\xE9rio atual. +1 Reputa\xE7\xE3o Associa\xE7\xE3o Hunter." },
          { key: "knov", label: "Knov", desc: "Infiltra\xE7\xE3o e extra\xE7\xE3o. 1x/dia cria porta dimensional ligando local atual a outro j\xE1 visitado (at\xE9 1km), dura 1 min. +1 Reputa\xE7\xE3o Associa\xE7\xE3o Hunter." },
          { key: "izunavi", label: "Izunavi", desc: "Controle de Nen e efici\xEAncia. Gasta 1 PA menos em qualquer habilidade Hatsu (m\xEDn. 2). 1x/dia 'Fluxo de Aura' por 3 rodadas: custo de Nen -2 (m\xEDn. 3). +1 Reputa\xE7\xE3o Comunidade de Nen." }
        ]
      }
    },
    criminoso: {
      label: "Criminoso",
      blurb: "Voc\xEA n\xE3o foi a pessoa mais gentil, mas era a \xFAnica forma de sobreviver.",
      attrBonus: { type: "fixed_plus_choice", fixed: { destreza: 2 }, points: 1, allowed: ["forca", "intelecto", "carisma"] },
      trainedSkills: { fixed: ["furtividade", "roubo", "persuasao"], extraByIntellect: true },
      drawback: "Procurado: escolha n\xEDvel de notoriedade (Pequeno Infrator -5 testes sociais c/ autoridades locais; Criminoso Conhecido recompensa 100.000J; Infame recompensa +500.000J, procurado em v\xE1rios pa\xEDses).",
      subchoices: {
        label: "Especializa\xE7\xE3o criminosa",
        key: "especializacao_crime",
        options: [
          { key: "ladrao_elite", label: "Ladr\xE3o de Elite", desc: "+3 em Roubo (arrombamento/furto/desarmar armadilhas). Avalia valor de itens preciosos (Intelecto DT 15). +1 Trupe Fantasma / -1 Governo Mundial." },
          { key: "assassino", label: "Assassino de Aluguel", desc: "Ataque surpreso causa +2d6 de dano; alvo faz Vigor DT 15 ou sangra por 2 rodadas. +1 M\xE1fia / -1 Governo Mundial." },
          { key: "falsificador", label: "Falsificador", desc: "Cria documentos/itens falsos (DT 20 p/ identificar). Identifica falsifica\xE7\xF5es (Intelecto DT 15). +1 Trupe Fantasma / -1 Governo Mundial." },
          { key: "hacker", label: "Hacker", desc: "+3 em testes com sistemas eletr\xF4nicos/seguran\xE7a. Recupera dados deletados (Intelecto, DT vari\xE1vel). +1 M\xE1fia / -1 Governo Mundial." },
          { key: "vigarista", label: "Vigarista", desc: "+3 em Persuas\xE3o ao mentir; +3 em Intui\xE7\xE3o para detectar mentiras. 'Mestre do Disfarce' (2 PA): +2 Persuas\xE3o. +1 M\xE1fia / -1 Governo Mundial." }
        ]
      }
    },
    ninja: {
      label: "Ninja",
      blurb: "Treinamento rigoroso desde crian\xE7a. 'N\xE3o importa o m\xE9todo, sempre complete a miss\xE3o.'",
      attrBonus: { type: "fixed", fixed: { forca: 1, vigor: 1, destreza: 1 } },
      trainedSkills: { fixed: ["robustez", "tenacidade"], choiceOneOf: ["duelo", "pontaria"], extraByIntellect: true },
      drawback: "Peso do treino: durante descanso (exceto hospedagem privativa), recupera apenas 50% de PV e Aura.",
      subchoices: {
        label: "Cl\xE3 Ninja",
        key: "cla_ninja",
        options: [
          { key: "shinobi_nevoa", label: "Cl\xE3 Shinobi da N\xE9voa", desc: "Assassinato silencioso/t\xE9cnicas aqu\xE1ticas. 1x/cena cria n\xE9voa (5m raio, 2 rodadas): +3 Furtividade, cr\xEDtico -2. Respira debaixo d'\xE1gua 10min, nada na vel. terrestre. +2 Reputa\xE7\xE3o Cl\xE3s Ninja." },
          { key: "koga", label: "Cl\xE3 Koga", desc: "Venenos e armadilhas. Cria veneno (Medicina DT 15, 10min): 1d6/rodada por 3 rodadas. Identifica venenos (DT 12); +3 resistir venenos. Armadilhas simples (5min, Ca\xE7a DT 15 p/ detectar). +2 Reputa\xE7\xE3o Cl\xE3s Ninja." },
          { key: "iga", label: "Cl\xE3 Iga", desc: "Infiltra\xE7\xE3o e disfarce. Cria disfarces em 20min: +5 Persuas\xE3o para se passar por outra pessoa. Imita vozes ap\xF3s observar 20min. Escala superf\xEDcies verticais sem equipamento (\xBD velocidade). +2 Reputa\xE7\xE3o Cl\xE3s Ninja." },
          { key: "momochi", label: "Cl\xE3 Momochi", desc: "Combate com m\xFAltiplas armas. Saca arma como a\xE7\xE3o livre, nunca desarmado. Todas armas: peso -1 (m\xEDn 2), cr\xEDtico -1. +2 Reputa\xE7\xE3o Cl\xE3s Ninja." }
        ]
      }
    },
    trabalhador: {
      label: "Trabalhador",
      blurb: "N\xE3o nasceu em fam\xEDlia prestigiada nem foi treinado por Hunter, mas sempre sonhou em se tornar um.",
      attrBonus: { type: "choice", points: 2, allowed: ["forca", "vigor", "destreza", "intelecto", "carisma"] },
      trainedSkills: { fixed: ["profissao", "vontade"], choiceCount: 1, extraByIntellect: true },
      drawback: "Apenas um civil: come\xE7a com 2 pontos de atributo b\xF4nus ao inv\xE9s de 3 (j\xE1 refletido acima).",
      subchoices: {
        label: "Carreira anterior",
        key: "carreira",
        options: [
          { key: "medico_enfermeiro", label: "M\xE9dico/Enfermeiro", desc: "1x/cena estabiliza um morrendo (a\xE7\xE3o livre). 3x/cena cura 2d6+Intelecto PV. Identifica doen\xE7as/venenos (Medicina DT 15). +1d6 dano em cr\xEDtico (conhecimento anat\xF4mico). +1 Reputa\xE7\xE3o Governo Mundial." },
          { key: "engenheiro_mecanico", label: "Engenheiro/Mec\xE2nico", desc: "Cria ferramentas improvisadas/repara equipamentos (Intelecto, DT vari\xE1vel). +3 para achar passagens secretas/avaliar estruturas. +1 Reputa\xE7\xE3o Governo Mundial." },
          { key: "professor_pesquisador", label: "Professor/Pesquisador", desc: "1x/sess\xE3o teste de Intelecto (DT 15) p/ conhecimento espec\xEDfico. Aprende idiomas em metade do tempo. +informa\xE7\xE3o extra ao investigar (Intelecto DT 15). +1 Reputa\xE7\xE3o Governo Mundial." },
          { key: "artesao_artista", label: "Artes\xE3o/Artista", desc: "+3 em Ca\xE7a (notar detalhes) e Profiss\xE3o (cria\xE7\xE3o de itens). Cria obras de arte vend\xE1veis por 1d6\xD710.000J (1 dia + materiais). +1 Reputa\xE7\xE3o Governo Mundial." },
          { key: "comerciante_negociante", label: "Comerciante/Negociante", desc: "+3 para avaliar valor de itens; compra com 15% desconto / vende 15% mais. Rede de contatos comerciais. +1 Reputa\xE7\xE3o Governo Mundial." },
          { key: "agricultor_cacador", label: "Agricultor/Ca\xE7ador", desc: "+3 em Ca\xE7a. Precisa de metade de comida/\xE1gua. Sofre metade das penalidades clim\xE1ticas. +1 Reputa\xE7\xE3o Governo Mundial." }
        ]
      }
    },
    formiga_quimera: {
      label: "Formiga Quimera",
      blurb: "Esp\xE9cie nativa do Continente Negro, reprodu\xE7\xE3o por Fagog\xEAnese \u2014 cada formiga \xE9 \xFAnica.",
      attrBonus: { type: "choice", points: 4, allowed: ["forca", "vigor", "destreza", "intelecto", "carisma"] },
      trainedSkills: { fixed: ["atletismo", "robustez", "resistencia"], choiceOneOf: ["duelo", "pontaria"], extraByIntellect: true },
      drawback: "Preconceito: dobro de dificuldade no Exame Hunter. -10 em testes sociais com quem odeia formigas quimera; em combate, costuma ser focado por esses inimigos. Escolha 1 per\xEDcia de Carisma para ter -5.",
      racialBonus: "B\xF4nus racial: +10 PV iniciais, +2 PV por n\xEDvel.",
      subchoices: {
        label: "Linhagem (define tamb\xE9m a apar\xEAncia)",
        key: "linhagem",
        options: [
          { key: "inseto", label: "Linhagem de Inseto", desc: "Exoesqueleto: +2 resist\xEAncia a dano f\xEDsico. Antenas: +3 Intui\xE7\xE3o. Escolha 2: Asas (voo 9m vertical) / Mand\xEDbulas (1d8 a\xE7\xE3o livre, perfurante) / Camuflagem Natural (+3 Furtividade natureza) / Vis\xE3o Composta (+2 Ca\xE7a, todas dire\xE7\xF5es). +2 Rep. Formigas Quimera, -2 com todas as outras." },
          { key: "felina", label: "Linhagem Felina", desc: "+3 Reflexos e Acrobacia; sempre cai em p\xE9 (\xBD dano de queda). Escolha 2: Garras Retr\xE1teis (1d10 cortante) / Vis\xE3o Noturna (18m) / Olfato Apurado (+3 rastreamento) / Salto Poderoso (triplo dist\xE2ncia). +2 Rep. Formigas Quimera, -2 com todas as outras." },
          { key: "reptil", label: "Linhagem R\xE9ptil", desc: "+3 resist\xEAncia a dano cortante/perfurante. Hiberna\xE7\xE3o: recupera tudo em descanso curto. Escolha 2: Veneno (1d4/3 rodadas) / Regenera\xE7\xE3o (1x/cena 1d8 PV) / L\xEDngua Bifurcada (detectar inimigos) / Camuflagem (+2 Furtividade). +2 Rep. Formigas Quimera, -2 com todas as outras." },
          { key: "aquatica", label: "Linhagem Aqu\xE1tica", desc: "Respira/nada debaixo d'\xE1gua indefinidamente, mergulha profundo sem dano. +2 atributos f\xEDsicos debaixo d'\xE1gua. Escolha 2: Eletroloca\xE7\xE3o (+5 Ca\xE7a aqu\xE1tica) / Pele Escorregadia (+3 escapar agarr\xF5es) / Bioluminesc\xEAncia (luz 5m) / Jato d'\xC1gua (empurra 5m). +2 Rep. Formigas Quimera, -2 com todas as outras." },
          { key: "hibrida", label: "Linhagem H\xEDbrida", desc: "+5 resist\xEAncia a 1 tipo de dano escolhido; sobrevive em ambientes hostis sem penalidade. Escolha 3 caracter\xEDsticas de quaisquer outras linhagens. +2 Rep. Formigas Quimera, -2 com todas as outras." }
        ]
      }
    },
    herdeiro: {
      label: "Herdeiro",
      blurb: "Voc\xEA nasceu em uma fam\xEDlia prestigiada. Escolha um cl\xE3/fam\xEDlia.",
      attrBonus: null,
      // varia por clã, tratado em subchoices
      trainedSkills: null,
      // varia por clã
      subchoices: {
        label: "Cl\xE3 / Fam\xEDlia",
        key: "cla_herdeiro",
        options: [
          {
            key: "kurta",
            label: "Cl\xE3 Kurta",
            desc: "Os olhos escarlates. Praticamente extinto pela Trupe Fantasma; s\xF3 resta 1 membro vivo no c\xE2none (Kurapika) \u2014 voc\xEA \xE9 outro sobrevivente ou herdeiro do legado.",
            attrBonus: { type: "fixed_plus_choice", fixed: { carisma: 2 }, points: 1, allowed: ["forca", "vigor", "destreza", "intelecto", "carisma"] },
            trainedSkills: { fixed: ["atletismo", "robustez", "resistencia"], choiceOneOf: ["duelo", "pontaria"], extraByIntellect: true },
            drawback: "Vingan\xE7a: ao avistar Tserriednich Hui Guo Rou voc\xEA ataca por impulso. Exibir os olhos atrai ca\xE7adores de recompensa.",
            special: "Olhos Escarlates: ativam por choque emocional, quase-morte, ou ativa\xE7\xE3o for\xE7ada (Controle de Nen DT18, 1x/sess\xE3o). Ativos: +1 em todos atributos; dificuldade de testes desce 1 n\xEDvel; usa todos tipos de Hatsu a 100%. Custo: 1 PA para ativar + 4 PA/rodada mantendo."
          },
          {
            key: "zoldyck",
            label: "Fam\xEDlia Zoldyck",
            desc: "Assassinos profissionais h\xE1 gera\xE7\xF5es, montanha Kukuroo. Treinamento cruel desde a inf\xE2ncia.",
            attrBonus: { type: "choice", points: 3, allowed: ["forca", "vigor", "destreza", "intelecto", "carisma"] },
            trainedSkills: { fixed: ["caca", "intimidacao", "robustez"], extraByIntellect: true },
            drawback: "Legado Sombrio: sede de sangue \u2014 se n\xE3o matar em 3 dias, -1 em todos atributos; ap\xF3s 7 dias ataca aleatoriamente. -3 Persuas\xE3o / +3 Intimida\xE7\xE3o quando identidade \xE9 revelada.",
            special: "B\xF4nus do treinamento: imune a Dano Massivo. Ganha 1 t\xE9cnica de assassinato a cada 5 n\xEDveis (Golpe Silencioso lvl1, Passos das Sombras lvl5, Toque Paralisante lvl10, Aura Assassina OU Punho Serpente lvl15)."
          },
          {
            key: "lunaris",
            label: "Cl\xE3 Lunaris",
            desc: "Cl\xE3 pequeno na floresta de sequoias do continente Yorbian. Poder ligado ao ciclo lunar.",
            attrBonus: { type: "fixed_plus_choice", fixed: { intelecto: 1, carisma: 1 }, points: 1, allowed: ["forca", "vigor", "destreza", "intelecto", "carisma"] },
            trainedSkills: { fixed: ["vontade", "caca"], choiceOneOf: ["duelo", "pontaria"], extraByIntellect: true },
            drawback: "Luz do dia: fica Abalado durante o dia.",
            special: "Habilidades por fase lunar (todas us\xE1veis): Crescente (+1 Destreza, treinado em per\xEDcias de Destreza), Minguante (+40% PV m\xE1x tempor\xE1rio), Nova (+1 Intelecto, treinado em per\xEDcias de Intelecto), Cheia (todos b\xF4nus anteriores por 1d8+2 rodadas, \xF3dio quase incontrol\xE1vel \u2014 ataca aliados se combate n\xE3o terminar antes)."
          },
          {
            key: "pyrox",
            label: "Cl\xE3 Pyrox",
            desc: "Cl\xE3 antigo e prestigiado, cidade de Flam\xE9ria. Dom da chama nato.",
            attrBonus: { type: "fixed", fixed: { vigor: 2, forca: 1 } },
            trainedSkills: { fixed: ["robustez", "duelo", "controle_nen"], extraByIntellect: true },
            drawback: "Sensibilidade ao frio: clima <10\xB0C, -1 em todos os atributos.",
            special: "Aquecimento (a\xE7\xE3o de movimento, 3 fases progressivas, mant\xE9m b\xF4nus anteriores): Fase 1 (+1 For\xE7a, +2 testes For\xE7a, 3 dano/rodada); Fase 2 (+xd4 dano de fogo ao atacar, x=\xBD n\xEDvel, 6 dano/rodada); Fase 3 (atacantes tomam 4d4 fogo, dano adicional xd4 = n\xEDvel, 8d6 dano/rodada). Reseta ap\xF3s combate."
          }
        ]
      }
    }
  };
  var CLASSES = {
    tesouros: {
      label: "Hunter de Tesouros",
      blurb: "Especializado em localizar e coletar itens raros, antiguidades e tesouros escondidos.",
      trainedSkills: { fixed: ["caca", "persuasao", "controle_nen"], choiceCount: 2 },
      pv: { init: 16, perLevel: 5 },
      pa: { init: 7, perLevel: 4 },
      defenseBase: 14,
      startingMoney: 1e5,
      startingMoneyNote: "Pequeno Tesouro: +100.000J e 1 artefato de 1 estrela \xE0 escolha, al\xE9m da habilidade base.",
      baseAbility: {
        name: "Olho do Tesouro",
        desc: "Teste de Ca\xE7a (DT do mestre) para detectar fraquezas do inimigo ou avaliar veracidade de algo. Se superar a DT:",
        levels: [
          { lvl: 1, text: "Aliado recebe +2 em ataques contra o inimigo identificado, incluindo voc\xEA. Custo: 2 PA." },
          { lvl: 4, text: "B\xF4nus sobe para +1 dado e +2 em ataques. Custo: 4 PA." },
          { lvl: 8, text: "Al\xE9m dos b\xF4nus anteriores, +2 de defesa para voc\xEA (aprendeu o padr\xE3o de ataque do inimigo). Custo: 8 PA." },
          { lvl: 12, text: "Pode criar um artefato (discutir com mestre): 1\u2605 no lvl 12, 2\u2605 no lvl 13, 3\u2605 no lvl 14, especial no lvl 15." },
          { lvl: 15, text: "+5 em qualquer teste de Ca\xE7a; se passar da DT, discerne PV e Aura do inimigo. B\xF4nus ao aliado agora \xE9 +2 dados e +3 no ataque. Custo: 15 PA." }
        ]
      },
      abilityPool: [
        { name: "Postura Defensiva", desc: "A\xE7\xE3o de movimento: ativa postura defensiva, +3 em Reflexos." },
        { name: "Perito \xE0 Dist\xE2ncia", desc: "+2 em qualquer habilidade \xE0 dist\xE2ncia (Nen, armas de fogo, etc). Em ataques \xE0 dist\xE2ncia, adiciona x ao dano (x = n\xEDvel do personagem)." },
        { name: "Pechincheiro", desc: "Ao negociar redu\xE7\xE3o de pre\xE7o, teste de Persuas\xE3o +7. Sucesso = desconto baseado no resultado; falha = vendedor recusa vender." },
        { name: "Territ\xF3rio Aprimorado", desc: "Requer t\xE9cnica En. Ativa\xE7\xE3o: a\xE7\xE3o padr\xE3o + 4 PA, custo 4 PA/rodada para manter. Em 6m: habilidades de aura custam -1 PA (m\xEDn 1); todos ganham 2 resist\xEAncia a dano; 1x/cena pode dar nova chance a aliado que errou ataque." },
        { name: "Tiro Duplo", desc: "Dispara 2x com 1 a\xE7\xE3o padr\xE3o (2\xBA tiro com metade do dano). Us\xE1vel x vezes/cena, x = Intelecto." },
        { name: "Vendedor Nato", desc: "Ao vender algo, teste de Persuas\xE3o +7; pre\xE7o depende do resultado." },
        { name: "Aproveitador", desc: "Usa artefatos a 200%: qualquer b\xF4nus de tesouro \xE9 duplicado." },
        { name: "Rastreador", desc: "1x/dia em cenas de investiga\xE7\xE3o, teste de Investiga\xE7\xE3o +7 para encontrar artefato (DT e tesouro definidos pelo mestre)." },
        { name: "Conhecimento Antigo", desc: "1x/sess\xE3o teste de Intelecto (DT vari\xE1vel) para lembrar informa\xE7\xF5es sobre ru\xEDnas/artefatos/hist\xF3ria antiga." },
        { name: "Sentido de Armadilha", desc: "A\xE7\xE3o b\xF4nus: por 30min, +5 detectar armadilhas; se passar Ca\xE7a DT 15, sente armadilhas em raio de 10m." },
        { name: "Restaura\xE7\xE3o de Artefato", desc: "Toca artefato quebrado e gasta PA: restaura por 1d4 dias/rodadas (uso \xFAnico depois)." },
        { name: "Vis\xE3o do Passado", desc: "Requer lvl 5. Custo 5 PA. Toca objeto/estrutura antiga, teste de Controle de Nen (DT vari\xE1vel) para visualizar flashes do passado." },
        { name: "Invent\xE1rio Engenhoso", desc: "Adiciona x \xE0 carga m\xE1xima (x = Carisma\xD73); itens de mais de 1 espa\xE7o t\xEAm tamanho reduzido em 1." },
        { name: "Linguista", desc: "+7 em Intui\xE7\xE3o/Investiga\xE7\xE3o para decifrar idiomas ou enigmas desconhecidos." },
        { name: "Artes\xE3o", desc: "Em cena de interl\xFAdio, ao inv\xE9s de curar PV, modifica arma (+xd6 dano) ou armadura (+x defesa); x = Carisma ou Intelecto. Dura 1 dia." },
        { name: "Treinamento", desc: "Escolha 2 per\xEDcias para se tornar treinado. Pode ser escolhida v\xE1rias vezes." }
      ],
      levelUpTable: [
        "OLHO DO TESOURO LVL 1",
        "HABILIDADE DE CLASSE",
        "HABILIDADE DE CLASSE",
        "OLHO DO TESOURO LVL 4",
        "1 PONTO DE ATRIBUTO",
        "HABILIDADE DE CLASSE",
        "HABILIDADE DE CLASSE",
        "OLHO DO TESOURO LVL 8",
        "HABILIDADE DE CLASSE",
        "1 PONTO DE ATRIBUTO",
        "HABILIDADE DE CLASSE",
        "OLHO DO TESOURO LVL 12",
        "HABILIDADE DE CLASSE",
        "HABILIDADE DE CLASSE",
        "OLHO DO TESOURO LVL 15 + 1 PONTO DE ATRIBUTO"
      ]
    },
    recompensas: {
      label: "Hunter de Recompensas",
      blurb: "Especializado em localizar e ca\xE7ar alvos para ganhar recompensas do contratante.",
      trainedSkills: { fixed: ["caca", "furtividade", "controle_nen"], choiceCount: 2 },
      pv: { init: 18, perLevel: 6 },
      pa: { init: 6, perLevel: 3 },
      defenseBase: 15,
      startingMoney: 8e4,
      startingMoneyNote: "Recompensa: come\xE7a com 80.000 jennys.",
      special: "Ficha de Alvos: mestre e jogador escolhem 1-5 alvos por miss\xE3o, com recompensas associadas.",
      baseAbility: {
        name: "Mestre Furtivo",
        desc: "",
        levels: [
          { lvl: 1, text: "+2 em qualquer teste de Furtividade. Ataque contra inimigo desprevenido: -7 na defesa dele (em vez de -5). Ataque furtivo bem-sucedido: +xd4 dano (x=Destreza)." },
          { lvl: 4, text: "Sacrificando 1 rodada de combate, analisa o inimigo: cr\xEDtico reduzido em 2 contra ele pelo resto do combate (apenas 1 alvo por vez)." },
          { lvl: 8, text: "Para todos os alvos na 'ficha de alvos', +7 em todos os testes contra eles." },
          { lvl: 12, text: "Ataque furtivo agora causa xd8 de dano (x = Destreza)." },
          { lvl: 15, text: "1x/sess\xE3o pode pedir informa\xE7\xE3o \xFAtil ao contratante (b\xF4nus decidido pelo mestre). Gastando 5 PA ao acertar, imp\xF5e qualquer condi\xE7\xE3o f\xEDsica por 1 rodada. +5 em Furtividade. x = Destreza+1." }
        ]
      },
      abilityPool: [
        { name: "Ca\xE7ador Nato", desc: "Gasta 3 PA para +3 em teste de Ca\xE7a." },
        { name: "Ataque Surpresa", desc: "Contra alvo desprevenido em ataque furtivo: 1 ataque extra. Us\xE1vel x vezes/cena (x=Destreza). Custo: 5 PA." },
        { name: "Olhar Penetrante", desc: "A\xE7\xE3o padr\xE3o: Intui\xE7\xE3o vs Persuas\xE3o do alvo. Sucesso: +3 defesa por 1d4 rodadas contra ele. Us\xE1vel x vezes/cena (x=Destreza)." },
        { name: "Negocia\xE7\xE3o Astuta", desc: "+5 em testes de negocia\xE7\xE3o; melhores condi\xE7\xF5es em contratos." },
        { name: "Ceifador Cruel", desc: "Ao executar algu\xE9m: +10 PV e +3 PA. Ao matar oponente j\xE1 rendido: +20 PV e +6 PA." },
        { name: "M\xE3os Leves", desc: "+5 em qualquer teste de Roubo." },
        { name: "Golpe Sujo", desc: "Ao atingir um inimigo, escolha: Cegar (-3 pr\xF3ximo ataque dele), Desequilibrar (cai no ch\xE3o), ou Desarmar (Duelo DT15). Us\xE1vel x vezes/cena (x=Destreza)." },
        { name: "Aura do Pavor", desc: "Requer t\xE9cnica En. 1x/cena, a\xE7\xE3o padr\xE3o, 3 PA: inimigos em 6m fazem Vontade vs Controle de Nen ou ficam vulner\xE1veis e n\xE3o atacam por 1d4 rodadas (proteger aliado custa 2 PA cada)." },
        { name: "Rastreador Implac\xE1vel", desc: "Cria 'conex\xE3o de rastreamento' a partir de vest\xEDgio (Ca\xE7a DT 15+1/dia desde o vest\xEDgio). Mant\xE9m por 24h gastando 4 PA/hora; sabe dire\xE7\xE3o e dist\xE2ncia (at\xE9 5km)." },
        { name: "Algemas de Aura", desc: "Custo 4 PA. Toca oponente: Controle de Nen vs Defesa. Sucesso: alvo Im\xF3vel + custo de Nen dele +2 PA, por 2 rodadas ou at\xE9 quebrar (Duelo DT 20)." },
        { name: "Rede de Contatos", desc: "1x/sess\xE3o Persuas\xE3o/Intimida\xE7\xE3o (DT vari\xE1vel) para informa\xE7\xF5es sobre um alvo." },
        { name: "Captura Viva", desc: "Custo 5 PA. Ataque com -5 de penalidade: se acertar, alvo faz Vigor (DT 15+mod) ou fica lesionado 1d4 rodadas. N\xE3o funciona em alvos com >75% PV." },
        { name: "Especialista em Explosivos", desc: "+5 em testes com explosivos; +xd6 dano (x=Destreza)." },
        { name: "Ataque Cir\xFArgico", desc: "Em ataque furtivo, gasta 2 PA para causar sangramento 1d3 rodadas. Us\xE1vel x vezes/cena (x=Destreza)." },
        { name: "Desarme R\xE1pido", desc: "A\xE7\xE3o livre: teste de Duelo para desarmar ao atacar." },
        { name: "Treinamento", desc: "Escolha 2 per\xEDcias para se tornar treinado. Pode ser escolhida v\xE1rias vezes." }
      ],
      levelUpTable: [
        "MESTRE FURTIVO LVL 1",
        "HABILIDADE DE CLASSE",
        "HABILIDADE DE CLASSE",
        "MESTRE FURTIVO LVL 4",
        "1 PONTO DE ATRIBUTO",
        "HABILIDADE DE CLASSE",
        "HABILIDADE DE CLASSE",
        "MESTRE FURTIVO LVL 8",
        "HABILIDADE DE CLASSE",
        "1 PONTO DE ATRIBUTO",
        "HABILIDADE DE CLASSE",
        "MESTRE FURTIVO LVL 12",
        "HABILIDADE DE CLASSE",
        "HABILIDADE DE CLASSE",
        "MESTRE FURTIVO LVL 15 + 1 PONTO DE ATRIBUTO"
      ]
    },
    bestas: {
      label: "Hunter de Bestas",
      blurb: "Especializado em domar e treinar animais selvagens, usando-os em combate ou como aux\xEDlio.",
      trainedSkills: { fixed: ["caca", "vontade", "controle_nen"], choiceCount: 2 },
      pv: { init: 11, perLevel: 3 },
      pa: { init: 8, perLevel: 5 },
      defenseBase: 12,
      startingMoney: 0,
      baseAbility: {
        name: "V\xEDnculo",
        desc: "",
        levels: [
          { lvl: 1, text: "Ganha besta selvagem de amea\xE7a baixa. +2 em Controle de Nen." },
          { lvl: 4, text: "Pode evoluir a besta selvagem em 1 n\xEDvel de amea\xE7a." },
          { lvl: 8, text: "Pode criar besta de Nen de 1 estrela (personifica\xE7\xE3o da sua personalidade)." },
          { lvl: 12, text: "Pode capturar bestas selvagens (custo de comando dobrado, n\xE3o sobem de n\xEDvel). Todas as bestas sobem 1 n\xEDvel/estrela." },
          { lvl: 15, text: "+5 em Controle de Nen. Cria besta de Nen de 3 estrelas (oposto da sua personalidade). Todas bestas no n\xEDvel m\xE1ximo. Com 2 bestas de Nen, desbloqueia 'Fus\xE3o'." }
        ]
      },
      bestLimitByLevel: [{ lvl: 1, n: 1 }, { lvl: 4, n: 2 }, { lvl: 8, n: 3 }, { lvl: 12, n: 4 }, { lvl: 15, n: 5 }],
      abilityPool: [
        { name: "Sintonia Bestial", desc: "Para cada besta a at\xE9 3m de voc\xEA, +1 de defesa." },
        { name: "Comando Eficaz", desc: "Custo 3 PA. Ao comandar uma besta, se houver outra adjacente, pode comand\xE1-la tamb\xE9m com a\xE7\xE3o padr\xE3o." },
        { name: "Besta Produtiva", desc: "Custo 5 PA, a\xE7\xE3o de comando + padr\xE3o. Besta escolhida ganha a\xE7\xE3o adicional (movimento ou padr\xE3o). 1x/rodada. Usos/cena = Intelecto da besta." },
        { name: "Domador de Bestas", desc: "+1 dado em Controle de Nen/Ca\xE7a para capturar/domesticar. Captura R\xE1pida (8 PA, a\xE7\xE3o padr\xE3o): tenta capturar besta selvagem com <50% PV." },
        { name: "V\xEDnculo de Regenera\xE7\xE3o", desc: "A\xE7\xE3o padr\xE3o, custo 5 PA, 2x/cena: besta recupera 1d6 + Vigor + Controle de Nen do Hunter." },
        { name: "Comando a Dist\xE2ncia", desc: "Comanda bestas a at\xE9 15m (em vez de 9m)." },
        { name: "Transfer\xEAncia de Aura", desc: "Requer t\xE9cnica En. Ativa\xE7\xE3o 3 PA: besta ganha +1 dado em atributos f\xEDsicos e +2 defesa. Manter custa 5 PA/rodada. Apenas 1 besta por vez." },
        { name: "Comando Favorito", desc: "Cada besta tem habilidade favorita com custo reduzido: -1 PA/fadiga (baixa/1\u2605), -2 (m\xE9dia/2\u2605), -4 (alta/3\u2605)." },
        { name: "Comunica\xE7\xE3o Animal", desc: "Custo 1 PA: comunica-se de forma b\xE1sica com animais n\xE3o-m\xE1gicos por 10 minutos." },
        { name: "Sentidos Agu\xE7ados", desc: "Custo 5 PA, a\xE7\xE3o b\xF4nus: agu\xE7a um sentido por 10min (vis\xE3o 2km, audi\xE7\xE3o ultrass\xF4nica, etc). +5 em Ca\xE7a relacionado." },
        { name: "Mimicry", desc: "Custo 4 PA, a\xE7\xE3o padr\xE3o: manifesta caracter\xEDstica animal (garras, br\xE2nquias, etc) por 10min/2 rodadas. Apenas 1 por vez (Transmuta\xE7\xE3o)." },
        { name: "Adapta\xE7\xE3o Ambiental", desc: "Custo 4 PA: resist\xEAncia a ambiente hostil escolhido; +5 Robustez relacionado. Trocar tipo custa 1 PA adicional." },
        { name: "Resist\xEAncia Animal", desc: "Custo 3 PE. Besta recebe resist\xEAncia x a dano f\xEDsico por 2 rodadas (x = Vigor da besta)." },
        { name: "Aprendizado", desc: "Escolha uma besta: ganha 1 habilidade nova a cada 3 n\xEDveis. Pode ser escolhida de novo para outras bestas." },
        { name: "Treinamento (besta)", desc: "Escolha 2 per\xEDcias para sua besta se tornar treinada. Pode ser escolhida v\xE1rias vezes." },
        { name: "Treinamento", desc: "Escolha 2 per\xEDcias (suas) para ser treinado. Pode ser escolhida v\xE1rias vezes." }
      ],
      levelUpTable: [
        "V\xCDNCULO LVL 1",
        "HABILIDADE DE CLASSE",
        "HABILIDADE DE CLASSE",
        "V\xCDNCULO LVL 4",
        "1 PONTO DE ATRIBUTO",
        "HABILIDADE DE CLASSE",
        "HABILIDADE DE CLASSE",
        "V\xCDNCULO LVL 8",
        "HABILIDADE DE CLASSE",
        "1 PONTO DE ATRIBUTO",
        "HABILIDADE DE CLASSE",
        "V\xCDNCULO LVL 12",
        "HABILIDADE DE CLASSE",
        "HABILIDADE DE CLASSE",
        "V\xCDNCULO LVL 15 + 1 PONTO DE ATRIBUTO"
      ]
    },
    medico: {
      label: "Hunter M\xE9dico",
      blurb: "Especializado em fornecer assist\xEAncia m\xE9dica, com habilidades de cura e conhecimentos avan\xE7ados.",
      trainedSkills: { fixed: ["caca", "medicina", "controle_nen"], choiceCount: 2 },
      pv: { init: 12, perLevel: 4 },
      pa: { init: 6, perLevel: 4 },
      defenseBase: 12,
      startingMoney: 7e4,
      startingMoneyNote: "Tratamentos: come\xE7a com 70.000 jennys.",
      baseAbility: {
        name: "Suporte de Auras",
        desc: "",
        levels: [
          { lvl: 1, text: "Aura medicinal cura aliados (n\xE3o voc\xEA): a\xE7\xE3o padr\xE3o + 2 PA cura xd6 PV (x = Intelecto), us\xE1vel x vezes/cena. +2 em testes de Medicina." },
          { lvl: 4, text: "Pode se curar tamb\xE9m. Gastando 4 PA, cura qualquer condi\xE7\xE3o f\xEDsica negativa (exceto morrendo, lesionado, condi\xE7\xF5es de origem)." },
          { lvl: 8, text: "Adquire Aura Energ\xE9tica: 4 PA concede 2 pontos em qualquer atributo (por turno/hora de uso)." },
          { lvl: 12, text: "Aura medicinal cura xd8 (6 PA); Aura energ\xE9tica agora concede 3 pontos de atributo (6 PA/turno)." },
          { lvl: 15, text: "8 PA: cura xd10 (x=Intelecto+1). Aura energ\xE9tica: +4 pontos de atributo (m\xE1x 2 por atributo) por 8 PA/turno. +5 em qualquer teste de Medicina." }
        ]
      },
      abilityPool: [
        { name: "Ampliar Aura", desc: "A cada 2 PA adicionais ao curar, cura 1 pessoa extra at\xE9 1,5m (cura dividida em 2)." },
        { name: "Cura Eficaz", desc: "Ao rolar dados de cura, se tirar 1 ou 2, pode rolar novamente." },
        { name: "Cura Energ\xE9tica", desc: "Investindo 2 PA extra na cura, alvo curado ganha +1 em atributo escolhido por 1d3 rodadas (1x por pessoa)." },
        { name: "Recupera\xE7\xE3o R\xE1pida", desc: "Ao usar aura medicinal em si mesmo, recupera um dado adicional." },
        { name: "Dissipa\xE7\xE3o de Venenos", desc: "Ao curar com aura medicinal, gasta 4 PA extra para neutralizar todos os venenos do alvo (efic\xE1cia depende do veneno)." },
        { name: "Terapia", desc: "Cura condi\xE7\xF5es mentais tamb\xE9m (exceto Abalado)." },
        { name: "Tratamento R\xE1pido", desc: "Gasta 3 PA para usar aura medicinal como a\xE7\xE3o de movimento." },
        { name: "Ressuscita\xE7\xE3o", desc: "1x/cena, rea\xE7\xE3o: a at\xE9 5m de algu\xE9m que cai, gasta 8 PA para levant\xE1-lo instantaneamente e curar com aura medicinal." },
        { name: "Estimulante de Aura", desc: "Custo 5 PA: toca alvo volunt\xE1rio e transfere energia \u2014 alvo recupera 3d6 PA. Alvo sofre -1 em Controle de Nen por 1h depois. 1x/dia por pessoa." },
        { name: "Diagn\xF3stico Avan\xE7ado", desc: "Examina por 1min: identifica 100% qualquer doen\xE7a/veneno/maldi\xE7\xE3o/anomalia de Nen, gravidade e tratamentos (raras exigem Medicina DT 18)." },
        { name: "Cirurgia de Campo", desc: "1x/cena: tira alvo de 'morrendo' sem testes." },
        { name: "Transfer\xEAncia de Vitalidade", desc: "Sacrifica seus PV para curar alvo tocado (1 PV seu = 2 PV do alvo, at\xE9 metade do seu PV m\xE1ximo). Seu dano n\xE3o cura por meios normais por 24h." },
        { name: "Aprimoramento Cir\xFArgico", desc: "4 PA ao curar: Adrenalina (+3 Destreza, 2 rodadas) ou Congest\xE3o (+3 For\xE7a, 2 rodadas)." },
        { name: "Acelerar Pulso", desc: "+1 em todos atributos f\xEDsicos por 3 rodadas. Us\xE1vel 2x/cena." },
        { name: "Ant\xEDdoto Universal", desc: "Custo 8 PA: cria ant\xEDdoto (a\xE7\xE3o padr\xE3o) que neutraliza qualquer veneno e cura 3d6. Armazen\xE1vel por 24h. Peso 1." },
        { name: "Treinamento", desc: "Escolha 2 per\xEDcias para se tornar treinado. Pode ser escolhida v\xE1rias vezes." }
      ],
      levelUpTable: [
        "SUPORTE DE AURAS LVL 1",
        "HABILIDADE DE CLASSE",
        "HABILIDADE DE CLASSE",
        "SUPORTE DE AURAS LVL 4",
        "1 PONTO DE ATRIBUTO",
        "HABILIDADE DE CLASSE",
        "HABILIDADE DE CLASSE",
        "SUPORTE DE AURAS LVL 8",
        "HABILIDADE DE CLASSE",
        "1 PONTO DE ATRIBUTO",
        "HABILIDADE DE CLASSE",
        "SUPORTE DE AURAS LVL 12",
        "HABILIDADE DE CLASSE",
        "HABILIDADE DE CLASSE",
        "SUPORTE DE AURAS LVL 15 + 1 PONTO DE ATRIBUTO"
      ]
    },
    duelista: {
      label: "Hunter Duelista",
      blurb: "O \xE1pice da per\xEDcia Duelo. Mestres do combate, sempre ansiosos por um desafio.",
      trainedSkills: { fixed: ["caca", "duelo", "controle_nen"], choiceCount: 2 },
      pv: { init: 22, perLevel: 9 },
      pa: { init: 4, perLevel: 2 },
      defenseBase: 16,
      startingMoney: 6e4,
      startingMoneyNote: "Briga de Rua: come\xE7a com 60.000 jennys.",
      baseAbility: {
        name: "Duelista Nato",
        desc: "",
        levels: [
          { lvl: 1, text: "Ganha 'Adapta\xE7\xE3o ao Combate' (n\xEDvel 1) e +2 em Duelo." },
          { lvl: 4, text: "Aprende um Estilo de Luta." },
          { lvl: 8, text: "Adapta\xE7\xE3o ao Combate evolui para n\xEDvel 2." },
          { lvl: 12, text: "Escolhe um estilo de luta adicional; multiplicador de cr\xEDtico +1 com qualquer arma." },
          { lvl: 15, text: "+5 em qualquer teste de Duelo; +1 ponto extra em atributo f\xEDsico. Adapta\xE7\xE3o ao Combate atinge n\xEDvel m\xE1ximo (3)." }
        ]
      },
      combatAdaptation: {
        lvl1: { warmup: "+2 no ataque ap\xF3s 1 rodada", adapt: "+2 defesa contra 1 inimigo ap\xF3s 3 rodadas", unstoppable: "+1 dado em ataques e +1 dado de dano ap\xF3s 5 rodadas" },
        lvl2: { warmup: "+3 no ataque ap\xF3s 1 rodada", adapt: "+3 defesa contra 1 inimigo ap\xF3s 3 rodadas", unstoppable: "3 PA: ataque extra (a\xE7\xE3o livre); ao acertar: 'Se ajoelhe!!' (3 PA, alvo cai) ou '\xC9 pra doer!!' (4 PA, sangra 2 rodadas)" },
        lvl3: { warmup: "+1 dado no ataque ap\xF3s 1 rodada", adapt: "+3 defesa + 3 resist\xEAncia a dano contra 1 inimigo ap\xF3s 3 rodadas", unstoppable: "Ataque extra (a\xE7\xE3o livre), +1 dado de dano, + 'Atormentar' (5 PA, cr\xEDtico: alvo n\xE3o ataca quem voc\xEA escolher por 1 rodada) e 'Nem Doeu' (10 PA, 1x/sess\xE3o, ignora metade de dano que levaria \xBD ou mais da vida)" }
      },
      fightingStyles: [
        { name: "Tanque", desc: "+15 PV + n\xEDvel do personagem. Ganha habilidade 'Proteger'." },
        { name: "Berserker", desc: "+4d4 dano adicional, mas deve atacar ao menos 1x/rodada ou ataca a si mesmo." },
        { name: "Escorpi\xE3o Veloz", desc: "+3 Reflexos, +5 testes de resist\xEAncia de Destreza, movimento dobrado." },
        { name: "Cobra", desc: "+5 para agarrar; sem desvantagem ao atacar agarrado/agarrando." },
        { name: "Mantis", desc: "+3 defesa. Contra-Ataque: ao defender com sucesso corpo a corpo, rea\xE7\xE3o para atacar com dano dobrado." },
        { name: "Aranha", desc: "+3 Acrobacia/Furtividade. Teia T\xE1tica: a\xE7\xE3o padr\xE3o, Duelo vs Defesa \u2014 alvo fica Lento at\xE9 fim da pr\xF3xima rodada dele." },
        { name: "Guepardo", desc: "+3 Pontaria. Disparo Focado: 1x/rodada, se n\xE3o se mover, pr\xF3ximo ataque \xE0 dist\xE2ncia +1 dado de dano." },
        { name: "Coruja", desc: "+3 Intui\xE7\xE3o/Ast\xFAcia. Olhar Desestabilizador: 4 PA, a\xE7\xE3o padr\xE3o, Vontade DT 10+n\xEDvel ou alvo tem -1 dado no pr\xF3ximo ataque." }
      ],
      abilityPool: [
        { name: "Lutador Aplicado", desc: "Escolhe 1 estilo de luta adicional. Pode ser escolhida 2x." },
        { name: "Mestre da Luta", desc: "Cria seu pr\xF3prio estilo de luta (balancear com o mestre). Apenas 1x." },
        { name: "Observador", desc: "Quando inimigo erra ataque em voc\xEA, gasta 2 PA + rea\xE7\xE3o para atacar com +3 no dano." },
        { name: "Proteger", desc: "Aliado a 4,5m que recebe ataque: rea\xE7\xE3o + 3 PA para voc\xEA receber metade do dano." },
        { name: "Pugilista", desc: "Dano desarmado 2d6+FOR (em vez de 1d4+FOR); gasta 3 PA para +1d6 adicional (m\xE1x 3 dados)." },
        { name: "Arsenalista", desc: "+5 de dano com armas de fogo." },
        { name: "Golpe Devastador", desc: "Custo 7 PA. A\xE7\xE3o padr\xE3o, ataque corpo a corpo com -5 penalidade: se acertar, dobro do dano. Us\xE1vel x vezes/cena (x=mod FOR). Gasta PA mesmo se errar." },
        { name: "Combatente Vers\xE1til", desc: "Trocar estilo de luta n\xE3o d\xE1 -5 nos testes." },
        { name: "Contra-Ataque Preciso", desc: "Quando oponente erra ataque corpo a corpo, rea\xE7\xE3o: ataque com +2 e +1d4 dano adicional." },
        { name: "Fluxo de Combate", desc: "Custo 3 PA/rodada, por 3 rodadas: a\xE7\xE3o de movimento adicional/turno, sem provocar oportunidade ao mover, +2 Reflexos." },
        { name: "De Ferro", desc: "+2 PV por n\xEDvel." },
        { name: "Mestre de Armas", desc: "Requer lvl 8, 4 FOR ou 4 DEX. Ataca com 2 armas em 1 a\xE7\xE3o (2\xBA ataque -50% dano)." },
        { name: "Chama da Determina\xE7\xE3o", desc: "Ap\xF3s choque emocional grande, +2 em todos atributos por 5 rodadas." },
        { name: "Resist\xEAncia Voraz", desc: "Ao ser atingido, a\xE7\xE3o livre: Robustez (DT 15+n\xEDvel amea\xE7a); sucesso = +1 resist\xEAncia a dano contra esse inimigo. M\xE1x 5x/alvo." },
        { name: "Desarme Potente", desc: "Teste de Duelo contra inimigo para desarmar; se ganhar, arma voa at\xE9 9m." },
        { name: "Treinamento", desc: "Escolha 2 per\xEDcias para se tornar treinado. Pode ser escolhida v\xE1rias vezes." }
      ],
      levelUpTable: [
        "DUELISTA NATO LVL 1",
        "HABILIDADE DE CLASSE",
        "HABILIDADE DE CLASSE",
        "DUELISTA NATO LVL 4",
        "1 PONTO DE ATRIBUTO",
        "HABILIDADE DE CLASSE",
        "HABILIDADE DE CLASSE",
        "DUELISTA NATO LVL 8",
        "HABILIDADE DE CLASSE",
        "1 PONTO DE ATRIBUTO",
        "HABILIDADE DE CLASSE",
        "DUELISTA NATO LVL 12",
        "HABILIDADE DE CLASSE",
        "HABILIDADE DE CLASSE",
        "DUELISTA NATO LVL 15 + 1 PONTO DE ATRIBUTO"
      ]
    },
    especialista_hatsu: {
      label: "Hunter Especialista em Hatsu",
      blurb: "Dedicado \xE0 an\xE1lise, otimiza\xE7\xE3o e manipula\xE7\xE3o das regras fundamentais da aura e do Nen.",
      trainedSkills: { fixed: ["controle_nen", "astucia", "vontade"], choiceCount: 2 },
      pv: { init: 11, perLevel: 4 },
      pa: { init: 12, perLevel: 7, attrChoice: ["carisma", "intelecto"] },
      defenseBase: 13,
      startingMoney: 0,
      baseAbility: {
        name: "Fluxo Perfeito (Perfect Flow)",
        desc: "",
        levels: [
          { lvl: 1, text: "Otimiza\xE7\xE3o de Aura: +2 em Controle de Nen. 1x/rodada, a\xE7\xE3o livre: reduz 1 PA o custo de uma t\xE9cnica de Nen usada na rodada (m\xEDn 1). Us\xE1vel x vezes/cena (x = Intelecto ou Carisma)." },
          { lvl: 4, text: "Sentido Agu\xE7ado: +3 em Ca\xE7a (em vez de +2); ativa Gyo de percep\xE7\xE3o como a\xE7\xE3o livre. A\xE7\xE3o padr\xE3o + 4 PA: Controle de Nen (DT 15+n\xEDvel amea\xE7a) revela Tipo de Hatsu e Condi\xE7\xE3o de Restri\xE7\xE3o do alvo." },
          { lvl: 8, text: "Campo de Batalha: 1x/cena, En com a\xE7\xE3o livre + 8 PA, raio 10m. Aliados dentro: +1 dado Controle de Nen, +2 defesa vs Nen. Otimiza\xE7\xE3o de Aura reduz 2 PA (m\xEDn 2)." },
          { lvl: 12, text: "Anula\xE7\xE3o de Fluxo: a\xE7\xE3o padr\xE3o + 12 PA, Controle de Nen contra o alvo. Sucesso: desativa Hatsu do alvo por 1d4 rodadas." },
          { lvl: 15, text: "Mestre Absoluto: +3 em Controle de Nen. Anula\xE7\xE3o de Fluxo custa 10 PA. 1x/dia, a\xE7\xE3o padr\xE3o: ativa Fluxo Perfeito por 1d4 rodadas \u2014 custo de habilidades de Nen -3 (m\xEDn 3); 1x/rodada usa t\xE9cnica b\xE1sica como a\xE7\xE3o livre." }
        ]
      },
      abilityPool: [
        { name: "Maestria dos Princ\xEDpios", desc: "Ten Aprimorado: custo de manuten\xE7\xE3o -1 PA/rodada (m\xEDn 0). Zetsu T\xE1tico: ao usar Zetsu, Controle de Nen DT 15 \u2014 sucesso recupera +1 PA no fim da rodada." },
        { name: "Ko Defensivo", desc: "3x/combate, rea\xE7\xE3o: voc\xEA ou aliado a 10m sob ataque recebe +5 defesa contra aquele ataque (Ko defensivo)." },
        { name: "Aura de Repress\xE3o", desc: "Custo 5 PA: usa Ren com a\xE7\xE3o livre para -5 em testes de todos inimigos a 5m (Vontade DT 15 reduz para -2)." },
        { name: "Transfer\xEAncia de Aura", desc: "x vezes/cena (x=Int ou Car), a\xE7\xE3o padr\xE3o: transfere at\xE9 10 PA para aliado a 1m. M\xE1x 20 PA por aliado." },
        { name: "Selo de Hatsu", desc: "Armazena habilidade de Hatsu em papel (custo: dobro de PA da habilidade original). Outros autorizados usam com a\xE7\xE3o padr\xE3o." },
        { name: "Mimetismo de Aura", desc: "Custo 8 PA/10min: imita aura de pessoa j\xE1 vista usando Nen. +10 Persuas\xE3o para se passar por ela." },
        { name: "Reserva de Aura", desc: "Armazena at\xE9 10 PA em um objeto; recupera depois com a\xE7\xE3o livre. Objeto deve ficar com voc\xEA." },
        { name: "Amplifica\xE7\xE3o de Hatsu Aliado", desc: "Custo 5 PA, a\xE7\xE3o padr\xE3o: aliado a at\xE9 10m ganha +1 dado no pr\xF3ximo teste." },
        { name: "Dissipa\xE7\xE3o de Condi\xE7\xE3o", desc: "Custo 6 PA, a\xE7\xE3o padr\xE3o: tenta remover condi\xE7\xE3o mental de aliado adjacente (exceto condi\xE7\xF5es de origem). Controle de Nen DT 20." },
        { name: "Deflex\xE3o de Nen", desc: "2x/cena, rea\xE7\xE3o a ataque de Nen, 6 PA: Controle de Nen (DT do mestre) reduz dano pela metade." },
        { name: "Cria\xE7\xE3o de Barreira", desc: "Custo 10 PA, a\xE7\xE3o padr\xE3o: cria barreira de Nen com 15 PV, cobertura total atr\xE1s dela. Dura at\xE9 destru\xEDda ou fim da cena." },
        { name: "Desvio de Manipula\xE7\xE3o", desc: "+5 em Vontade para resistir a efeitos de Manipula\xE7\xE3o de Nen." },
        { name: "Transfer\xEAncia de Condi\xE7\xE3o", desc: "Custo 12 PA, a\xE7\xE3o padr\xE3o: tenta transferir condi\xE7\xE3o negativa de aliado adjacente para si (mestre pode exigir Vontade)." },
        { name: "En de Compartilhamento", desc: "Estende En em 10m como canal de comunica\xE7\xE3o t\xE1tica (a\xE7\xE3o livre para falar telepaticamente)." },
        { name: "Desvio de Foco (Manipula\xE7\xE3o)", desc: "Custo 6 PA, a\xE7\xE3o padr\xE3o: alvo faz Controle de Nen DT 20 ou reduz 50% b\xF4nus de suas habilidades." },
        { name: "Treinamento", desc: "Escolha 2 per\xEDcias para se tornar treinado. Pode ser escolhida v\xE1rias vezes." }
      ],
      levelUpTable: [
        "FLUXO PERFEITO LVL 1",
        "HABILIDADE DE CLASSE",
        "HABILIDADE DE CLASSE",
        "FLUXO PERFEITO LVL 4",
        "1 PONTO DE ATRIBUTO",
        "HABILIDADE DE CLASSE",
        "HABILIDADE DE CLASSE",
        "FLUXO PERFEITO LVL 8",
        "HABILIDADE DE CLASSE",
        "1 PONTO DE ATRIBUTO",
        "HABILIDADE DE CLASSE",
        "FLUXO PERFEITO LVL 12",
        "HABILIDADE DE CLASSE",
        "HABILIDADE DE CLASSE",
        "FLUXO PERFEITO LVL 15 + 1 PONTO DE ATRIBUTO"
      ]
    }
  };
  var ASPIRANTE_HUNTER = {
    label: "Aspirante a Hunter",
    pv: { init: 9 },
    // + Vigor
    pa: { init: 3 },
    // + Carisma
    defenseBase: 8,
    // + Destreza + Equipamentos
    startingMoney: 5e4,
    ability: { name: "Esfor\xE7ado", desc: "Usando 1 ponto de aura, ganha +2 em qualquer teste." }
  };
  var NEN_PRINCIPLES = {
    ren: {
      label: "Ren",
      desc: "Aumento da aura \u2014 fortalece potencial, for\xE7a f\xEDsica e presen\xE7a em batalha.",
      levels: {
        amador: { lvl: 1, cost: "3 PA/ataque", effect: "+3 dano em ataques f\xEDsicos" },
        intermediario: { lvl: 5, cost: "6 PA/ataque", effect: "+6 dano em ataques f\xEDsicos. Intimida\xE7\xE3o passiva: criaturas INT<3 fazem Vontade DT13 para atacar voc\xEA." },
        avancado: { lvl: 10, cost: "9 PA/ataque", effect: "+9 dano. Intimida\xE7\xE3o aprimorada: qualquer criatura faz Vontade DT15. +4 PA extra d\xE1 +2 no ataque." },
        mestre: { lvl: 15, cost: "10 PA/ataque", effect: "+12 dano. Intimida\xE7\xE3o poderosa: Vontade DT18. +5 PA extra d\xE1 +3 no ataque. 1x/cena 'Explos\xE3o de Ren' dobra dano por 2 rodadas." }
      }
    },
    zetsu: {
      label: "Zetsu",
      desc: "Ocultar a aura \u2014 quase indetect\xE1vel, recupera aura mais r\xE1pido.",
      levels: {
        amador: { lvl: 1, cost: "Nenhum (economiza aura)", effect: "+2 Furtividade. Recupera +1 PA/turno. -2 defesa quando ativo." },
        intermediario: { lvl: 5, cost: "Nenhum", effect: "+3 Furtividade. Recupera +2 PA/turno. -4 defesa. Detecta usu\xE1rios de Nen em 10m." },
        avancado: { lvl: 10, cost: "Nenhum", effect: "+5 Furtividade. Recupera +3 PA/turno. -5 defesa. Detecta em 20m e identifica tipo de Nen." },
        mestre: { lvl: 15, cost: "Nenhum", effect: "+7 Furtividade. Recupera +4 PA/turno. -7 defesa. Detecta em 50m, identifica tipo e pot\xEAncia. Ataque surpresa ap\xF3s cancelar Zetsu: +5 no teste e +4d6 dano." }
      }
    },
    ten: {
      label: "Ten",
      desc: "Prote\xE7\xE3o da aura \u2014 escudo protetor, resist\xEAncia contra ataques.",
      levels: {
        amador: { lvl: 1, cost: "2 PA ao receber ataque", effect: "+2 resist\xEAncia a todos os tipos de dano." },
        intermediario: { lvl: 5, cost: "4 PA ao receber ataque", effect: "+4 resist\xEAncia. Mant\xE9m fora de combate at\xE9 1h sem custo. Estende a 1 aliado adjacente (efeito dividido por 2)." },
        avancado: { lvl: 10, cost: "6 PA ao receber ataque", effect: "+6 resist\xEAncia. Mant\xE9m at\xE9 4h sem custo. Estende a 2 aliados (efeito dividido por 3)." },
        mestre: { lvl: 15, cost: "8 PA/turno", effect: "+8 resist\xEAncia. Mant\xE9m at\xE9 12h. Estende a 3 aliados (dividido por 4). 1x/cena absorve totalmente ataque de at\xE9 30 dano." }
      }
    }
  };
  var NEN_TECHNIQUES = {
    gyo: {
      label: "Gy\xF4",
      desc: "Aplica\xE7\xE3o avan\xE7ada do Ren: concentra aura em parte espec\xEDfica do corpo, aumentando sua resist\xEAncia (mas vulnerabilizando o resto).",
      variants: [
        { name: "Gy\xF4 de percep\xE7\xE3o", desc: "+2 Ca\xE7a, v\xEA ataques com In. Custo: 3 PA cada 10min/rodada com Gy\xF4 nos olhos (a\xE7\xE3o de movimento)." },
        { name: "Gy\xF4 de ataque", desc: "+2 no acerto em ataques com o corpo. Custo: 2 PA por ataque (a\xE7\xE3o de movimento)." },
        { name: "Gy\xF4 de defesa", desc: "+3 resist\xEAncia a dano. Custo: 2 PA por ataque recebido; -2 defesa no turno seguinte (rea\xE7\xE3o)." }
      ]
    },
    in: {
      label: "In",
      desc: "Forma avan\xE7ada de Zetsu: esconde quase completamente a presen\xE7a da aura, inclusive em Hatsu.",
      effect: "Todos seus ataques/habilidades acertam o oponente desprevenido. Custo: 5 PA por ataque/habilidade (a\xE7\xE3o livre). In\xFAtil contra Gy\xF4 de percep\xE7\xE3o."
    },
    en: {
      label: "En",
      desc: "Combina\xE7\xE3o de Ren e Ten: estende a aura mais longe do corpo (geralmente uma esfera), sentindo forma e movimento de quem entra nela.",
      effect: "N\xE3o \xE9 mais pego desprevenido; +3 defesa. Custo: 6 PA por rodada/hora mantendo estendido (a\xE7\xE3o padr\xE3o)."
    },
    shu: {
      label: "Shu",
      desc: "Aplica\xE7\xE3o avan\xE7ada do Ten: estende a aura a um objeto, usando-o como extens\xE3o do pr\xF3prio corpo.",
      effect: "Em arma: cr\xEDtico -2. Em armadura: inimigo que acerta voc\xEA toma 1d6 de dano. Custo: 3 PA por rodada ativo (a\xE7\xE3o de movimento)."
    },
    ken: {
      label: "Ken",
      desc: "Vers\xE3o avan\xE7ada do Ren: mant\xE9m Ren refor\xE7ado em todo o corpo, defesa uniforme contra ataques de qualquer dire\xE7\xE3o.",
      effect: "+2 defesa. Custo: 2 PA cada uso (rea\xE7\xE3o)."
    }
  };
  var HATSU_CATEGORY_DT = {
    base: 10,
    intermediaria: 12,
    complexa: 15,
    arcana: 20
  };
  var HATSU_CATEGORY_LEVEL_RANGE = {
    base: "N\xEDveis 1-3",
    intermediaria: "N\xEDveis 4-7",
    complexa: "N\xEDveis 8-11",
    arcana: "N\xEDveis 12, 13, 15"
  };
  var HATSU_COST_BY_AFFINITY = {
    100: { base: "2~5", intermediaria: "6~10", complexa: "10~20", arcana: "20+" },
    80: { base: "4~9", intermediaria: "10~15", complexa: "15~25", arcana: "25+" },
    60: { base: "6~12", intermediaria: "13~20", complexa: "20~30", arcana: "30+" },
    40: { base: "8~15", intermediaria: "15~25", complexa: "25~35", arcana: "35+" },
    0: { base: "\u2014", intermediaria: "\u2014", complexa: "\u2014", arcana: "\u2014" }
    // não pode usar (especialização para não-especialistas)
  };
  var HATSU_LEARN_LEVELS = [1, 3, 5, 7, 9, 11, 13, 15];
  var NEN_TECHNIQUE_LEARN_LEVELS = [1, 4, 8, 11, 15];
  var TEST_DIFFICULTY = [
    { key: "facil", label: "F\xE1cil", range: "5 ~ 15" },
    { key: "medio", label: "M\xE9dio", range: "15 ~ 20" },
    { key: "dificil", label: "Dif\xEDcil", range: "20 ~ 30" },
    { key: "quase_impossivel", label: "Quase Imposs\xEDvel", range: "30+" }
  ];
  var FACTIONS = [
    "Associa\xE7\xE3o Hunter",
    "Trupe Fantasma",
    "Fam\xEDlia Zoldyck",
    "M\xE1fia",
    "Formigas Quimera",
    "Governo Mundial",
    "Cl\xE3 Kurta",
    "Cl\xE3s Ninja",
    "Comunidade de Nen",
    "Reinos Espec\xEDficos"
  ];
  var CONDITIONS = [
    { name: "Abalado", desc: "-5 em testes de Carisma" },
    { name: "Agarrado", desc: "Vulner\xE1vel e -5 em testes para atacar" },
    { name: "Atordoado", desc: "Desprevenido e paralisado" },
    { name: "Ca\xEDdo", desc: "-5 em testes para atacar; gasta a\xE7\xE3o de movimento para levantar" },
    { name: "Cego", desc: "-10 em testes de Ca\xE7a" },
    { name: "Desprevenido", desc: "Vulner\xE1vel e n\xE3o pode reagir a ataques" },
    { name: "Em chamas", desc: "1d8 dano elemental at\xE9 apagar (a\xE7\xE3o padr\xE3o para apagar)" },
    { name: "Envenenado", desc: "Efeito varia de acordo com o veneno" },
    { name: "Exausto", desc: "Lento e vulner\xE1vel" },
    { name: "Fadigado", desc: "Lento, vulner\xE1vel e fraco" },
    { name: "Fraco", desc: "-2 dados em qualquer teste" },
    { name: "Im\xF3vel", desc: "Deslocamento reduzido a 0m" },
    { name: "Lento", desc: "Deslocamento reduzido pela metade" },
    { name: "Lesionado", desc: "-1 dado em testes f\xEDsicos (Vigor, For\xE7a, Dex)" },
    { name: "Morrendo", desc: "Vulner\xE1vel e paralisado" },
    { name: "Paralisado", desc: "N\xE3o pode fazer a\xE7\xF5es" },
    { name: "Sangrando", desc: "1d6 de dano" },
    { name: "Vulner\xE1vel", desc: "-5 na defesa" },
    { name: "Agarrando", desc: "-1 dado para atacar" }
  ];
  function emptyAttrs() {
    return { forca: 0, vigor: 0, destreza: 0, intelecto: 0, carisma: 0 };
  }
  var AUTO_APPLIED_ABILITIES = /* @__PURE__ */ new Set(["De Ferro"]);
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
    pv += (lvl - 1) * (cls.pv.perLevel + vigor);
    if (character.originKey === "formiga_quimera") {
      pv += 10 + (lvl - 1) * 2;
    }
    const deFerroCount = (character.classAbilitiesChosen || []).filter((n) => n === "De Ferro").length;
    if (deFerroCount > 0) {
      pv += 2 * lvl * deFerroCount;
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
  function getNenControlAttr(hatsuKey, chosenAttrForEspecialista) {
    if (!hatsuKey) return null;
    if (hatsuKey === "especializacao") return chosenAttrForEspecialista || "intelecto";
    return NEN_CONTROL_ATTR_BY_HATSU[hatsuKey];
  }
  function getAffinity(hatsuPrincipal, hatsuTarget) {
    var _a, _b;
    if (!hatsuPrincipal || !hatsuTarget) return 0;
    return (_b = (_a = HATSU_AFFINITIES[hatsuPrincipal]) == null ? void 0 : _a[hatsuTarget]) != null ? _b : 0;
  }
  function uid() {
    return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  }
  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }
  var STORAGE_PREFIX = "hxn:char:";
  var STORAGE_INDEX = "hxn:index";
  async function storageListCharacters() {
    try {
      const raw = localStorage.getItem(STORAGE_INDEX);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch (e) {
      return [];
    }
  }
  async function storageSaveCharacter(character) {
    var _a;
    const key = STORAGE_PREFIX + character.id;
    localStorage.setItem(key, JSON.stringify(character));
    const list = await storageListCharacters();
    const existing = list.find((c) => c.id === character.id);
    const summary = {
      id: character.id,
      name: character.name || "Sem nome",
      level: character.level || 1,
      classLabel: character.classKey ? CLASSES[character.classKey].label : "Aspirante a Hunter",
      hatsu: character.hatsuPrincipal ? (_a = HATSU_TYPES.find((h) => h.key === character.hatsuPrincipal)) == null ? void 0 : _a.label : null,
      updatedAt: Date.now()
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
    } catch (e) {
      return null;
    }
  }
  async function storageDeleteCharacter(id) {
    try {
      localStorage.removeItem(STORAGE_PREFIX + id);
    } catch (e) {
    }
    const list = await storageListCharacters();
    const filtered = list.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_INDEX, JSON.stringify(filtered));
  }
  function blankCharacter() {
    return {
      id: uid(),
      name: "",
      player: "",
      level: 1,
      isAspirante: true,
      attrs: emptyAttrs(),
      // pontos base distribuídos pelo jogador (6 pontos)
      attrBonusOrigin: emptyAttrs(),
      // bônus vindo da origem
      attrBonusLevelUp: emptyAttrs(),
      // pontos extras ganhos ao subir de nível
      skillsTrained: [],
      // array de skill keys
      originKey: null,
      originSubchoice: null,
      // ex: mentor, especializacao_crime, cla_ninja...
      originSubchoiceLabel: null,
      originSkillChoices: [],
      // perícias escolhidas como parte da origem (N = Intelecto)
      originAttrChoices: [],
      // attr keys escolhidos para o bônus de origem (quando type=choice)
      classKey: null,
      paAttrChoice: "carisma",
      // só relevante p/ especialista em hatsu
      hatsuPrincipal: null,
      especialistaControlAttr: "intelecto",
      // atributo de controle de nen se especialista
      nenSpecialization: null,
      // ren | zetsu | ten — qual princípio o personagem se especializou
      nenTechniquesKnown: [],
      // gyo, in, en, shu, ken
      hatsuAbilities: [],
      // [{name, type, category, cost, description, restrictions}]
      classAbilitiesChosen: [],
      // nomes das habilidades de classe escolhidas no pool
      equipDefenseBonus: 0,
      equipment: [],
      // [{name, qty, weight, note}]
      money: 0,
      currentPV: null,
      // se null, usa o máximo
      currentPA: null,
      reputations: {},
      // {faction: number}
      notes: "",
      createdAt: Date.now()
    };
  }
  var AURA_COLORS = {
    intensificacao: "#e0533d",
    emissao: "#4d8de0",
    transmutacao: "#9b5de0",
    manipulacao: "#3dbf7a",
    materializacao: "#e0c23d",
    especializacao: "#e7e7e7",
    null: "#c9a24b"
  };
  function AuraDot({ hatsu, size = 10 }) {
    const color = AURA_COLORS[hatsu] || AURA_COLORS.null;
    return /* @__PURE__ */ React.createElement(
      "span",
      {
        style: {
          display: "inline-block",
          width: size,
          height: size,
          borderRadius: "50%",
          background: color,
          boxShadow: `0 0 ${size}px ${color}99`
        }
      }
    );
  }
  function Pill({ children, active, onClick, color, disabled, title }) {
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: disabled ? void 0 : onClick,
        title,
        disabled,
        style: {
          padding: "8px 14px",
          borderRadius: 999,
          border: `1px solid ${active ? color || "#c9a24b" : "#3a3d42"}`,
          background: active ? `${color || "#c9a24b"}1f` : "transparent",
          color: active ? color || "#e8d9ad" : "#aab0b8",
          fontFamily: "'Oxanium', sans-serif",
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: "0.02em",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.4 : 1,
          transition: "all .15s ease",
          whiteSpace: "nowrap"
        }
      },
      children
    );
  }
  function SectionLabel({ children, eyebrow }) {
    return /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 14 } }, eyebrow && /* @__PURE__ */ React.createElement(
      "div",
      {
        style: {
          fontFamily: "'Oxanium', sans-serif",
          fontSize: 11,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "#c9a24b",
          marginBottom: 4
        }
      },
      eyebrow
    ), /* @__PURE__ */ React.createElement(
      "h2",
      {
        style: {
          fontFamily: "'Oxanium', sans-serif",
          fontSize: 22,
          fontWeight: 700,
          color: "#f1ede2",
          margin: 0
        }
      },
      children
    ));
  }
  function Card({ children, style }) {
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        style: {
          background: "linear-gradient(160deg, #181b20 0%, #14161a 100%)",
          border: "1px solid #2a2d33",
          borderRadius: 14,
          padding: 20,
          ...style
        }
      },
      children
    );
  }
  function NumberStepper({ value, onChange, min = 0, max = 99 }) {
    return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => onChange(clamp(value - 1, min, max)),
        style: btnCircleStyle
      },
      "\u2212"
    ), /* @__PURE__ */ React.createElement(
      "div",
      {
        style: {
          minWidth: 32,
          textAlign: "center",
          fontFamily: "'Oxanium', sans-serif",
          fontSize: 18,
          fontWeight: 700,
          color: "#f1ede2"
        }
      },
      value
    ), /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick: () => onChange(clamp(value + 1, min, max)),
        style: btnCircleStyle
      },
      "+"
    ));
  }
  var btnCircleStyle = {
    width: 28,
    height: 28,
    borderRadius: "50%",
    border: "1px solid #3a3d42",
    background: "#1d2024",
    color: "#e8d9ad",
    fontSize: 16,
    lineHeight: 1,
    cursor: "pointer"
  };
  function PrimaryButton({ children, onClick, disabled, style }) {
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick,
        disabled,
        style: {
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
          ...style
        }
      },
      children
    );
  }
  function GhostButton({ children, onClick, style }) {
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        type: "button",
        onClick,
        style: {
          padding: "12px 22px",
          borderRadius: 10,
          border: "1px solid #3a3d42",
          background: "transparent",
          color: "#c7cbd1",
          fontFamily: "'Oxanium', sans-serif",
          fontWeight: 600,
          fontSize: 14,
          cursor: "pointer",
          ...style
        }
      },
      children
    );
  }
  function ModSign(n) {
    return n >= 0 ? `+${n}` : `${n}`;
  }
  function HomeScreen({ onNewCharacter, onOpenCharacter }) {
    const [list, setList] = useState(null);
    const [error, setError] = useState(null);
    useEffect(() => {
      storageListCharacters().then((l) => setList(l.sort((a, b) => b.updatedAt - a.updatedAt))).catch(() => setError(true));
    }, []);
    const handleDelete = async (id, e) => {
      e.stopPropagation();
      if (!window.confirm("Apagar esta ficha permanentemente?")) return;
      await storageDeleteCharacter(id);
      setList((l) => l.filter((c) => c.id !== id));
    };
    return /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 760, margin: "0 auto", padding: "48px 20px 80px" } }, /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", marginBottom: 40 } }, /* @__PURE__ */ React.createElement(
      "div",
      {
        style: {
          fontFamily: "'Oxanium', sans-serif",
          fontSize: 12,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "#c9a24b",
          marginBottom: 10
        }
      },
      "Associa\xE7\xE3o Hunter \xB7 Registro de Ca\xE7adores"
    ), /* @__PURE__ */ React.createElement(
      "h1",
      {
        style: {
          fontFamily: "'Oxanium', sans-serif",
          fontSize: "clamp(32px, 6vw, 48px)",
          fontWeight: 800,
          color: "#f1ede2",
          margin: 0,
          letterSpacing: "0.01em"
        }
      },
      "Hunter ",
      /* @__PURE__ */ React.createElement("span", { style: { color: "#c9a24b" } }, "\xD7"),
      " Nen"
    ), /* @__PURE__ */ React.createElement("p", { style: { color: "#8d939b", fontFamily: "'Source Serif 4', serif", fontSize: 16, marginTop: 10 } }, "Crie sua licen\xE7a de Hunter. Sem precisar abrir o livro de regras.")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "center", marginBottom: 36 } }, /* @__PURE__ */ React.createElement(PrimaryButton, { onClick: onNewCharacter, style: { fontSize: 16, padding: "16px 36px" } }, "+ Criar novo personagem")), list === null && !error && /* @__PURE__ */ React.createElement("p", { style: { textAlign: "center", color: "#666" } }, "Carregando fichas salvas\u2026"), error && /* @__PURE__ */ React.createElement("p", { style: { textAlign: "center", color: "#a55" } }, "N\xE3o foi poss\xEDvel acessar o armazenamento. Suas fichas ser\xE3o mantidas apenas durante esta sess\xE3o."), list && list.length === 0 && /* @__PURE__ */ React.createElement(Card, { style: { textAlign: "center", color: "#8d939b" } }, "Nenhuma ficha ainda. Toda licen\xE7a come\xE7a com o Exame Hunter \u2014 crie a primeira acima."), list && list.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 12 } }, list.map((c) => /* @__PURE__ */ React.createElement(
      "div",
      {
        key: c.id,
        onClick: () => onOpenCharacter(c.id),
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          padding: "16px 20px",
          borderRadius: 12,
          border: "1px solid #2a2d33",
          background: "#15171b",
          cursor: "pointer"
        }
      },
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 14 } }, /* @__PURE__ */ React.createElement(AuraDot, { hatsu: hatsuKeyFromLabel(c.hatsu), size: 12 }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "'Oxanium', sans-serif", fontWeight: 700, color: "#f1ede2", fontSize: 16 } }, c.name || "Sem nome"), /* @__PURE__ */ React.createElement("div", { style: { color: "#8d939b", fontSize: 13, fontFamily: "'Source Serif 4', serif" } }, "N\xEDvel ", c.level, " \xB7 ", c.classLabel))),
      /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: (e) => handleDelete(c.id, e),
          title: "Apagar ficha",
          style: {
            background: "transparent",
            border: "1px solid #3a3d42",
            color: "#8d939b",
            borderRadius: 8,
            padding: "6px 10px",
            cursor: "pointer",
            fontSize: 12
          }
        },
        "Apagar"
      )
    ))));
  }
  function hatsuKeyFromLabel(label) {
    if (!label) return null;
    const found = HATSU_TYPES.find((h) => h.label === label);
    return found ? found.key : null;
  }
  var WIZARD_STEPS = [
    { key: "identidade", label: "Identidade" },
    { key: "atributos", label: "Atributos" },
    { key: "origem", label: "Origem" },
    { key: "pericias", label: "Per\xEDcias" },
    { key: "classe", label: "Exame & Classe" },
    { key: "nen", label: "Nen & Hatsu" },
    { key: "equipamento", label: "Equipamento" },
    { key: "revisao", label: "Revis\xE3o" }
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
    return /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 880, margin: "0 auto", padding: "32px 20px 100px" } }, /* @__PURE__ */ React.createElement(WizardProgress, { steps: WIZARD_STEPS, current: step, onJump: (i) => i < step && setStep(i) }), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 28 } }, stepKey === "identidade" && /* @__PURE__ */ React.createElement(StepIdentidade, { char, patch }), stepKey === "atributos" && /* @__PURE__ */ React.createElement(StepAtributos, { char, patch }), stepKey === "origem" && /* @__PURE__ */ React.createElement(StepOrigem, { char, patch }), stepKey === "pericias" && /* @__PURE__ */ React.createElement(StepPericias, { char, patch }), stepKey === "classe" && /* @__PURE__ */ React.createElement(StepClasse, { char, patch }), stepKey === "nen" && /* @__PURE__ */ React.createElement(StepNen, { char, patch }), stepKey === "equipamento" && /* @__PURE__ */ React.createElement(StepEquipamento, { char, patch }), stepKey === "revisao" && /* @__PURE__ */ React.createElement(StepRevisao, { char, patch })), /* @__PURE__ */ React.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          marginTop: 40,
          paddingTop: 24,
          borderTop: "1px solid #2a2d33"
        }
      },
      /* @__PURE__ */ React.createElement(GhostButton, { onClick: goBack }, step === 0 ? "Cancelar" : "\u2190 Voltar"),
      step < WIZARD_STEPS.length - 1 ? /* @__PURE__ */ React.createElement(PrimaryButton, { onClick: goNext, disabled: !canAdvance(stepKey, char) }, "Continuar \u2192") : /* @__PURE__ */ React.createElement(PrimaryButton, { onClick: () => onFinish(char) }, "Finalizar e salvar ficha")
    ));
  }
  function canAdvance(stepKey, char) {
    var _a;
    if (stepKey === "identidade") return !!((_a = char.name) == null ? void 0 : _a.trim());
    if (stepKey === "atributos") return totalAttrPoints(char.attrs) === 6;
    if (stepKey === "origem") {
      if (!char.originKey) return false;
      const origin = ORIGINS[char.originKey];
      if (origin.subchoices && !char.originSubchoice) return false;
      return true;
    }
    if (stepKey === "pericias") return true;
    if (stepKey === "classe") return !!char.classKey;
    if (stepKey === "nen") return !!char.hatsuPrincipal && !!char.nenSpecialization;
    return true;
  }
  function totalAttrPoints(attrs) {
    return Object.values(attrs).reduce((a, b) => a + b, 0);
  }
  function WizardProgress({ steps, current, onJump }) {
    return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 4, overflowX: "auto", paddingBottom: 6 } }, steps.map((s, i) => {
      const state = i < current ? "done" : i === current ? "active" : "todo";
      return /* @__PURE__ */ React.createElement(
        "div",
        {
          key: s.key,
          onClick: () => onJump(i),
          style: {
            flex: 1,
            minWidth: 84,
            textAlign: "center",
            cursor: state === "done" ? "pointer" : "default",
            padding: "8px 4px",
            borderBottom: `2px solid ${state === "active" ? "#c9a24b" : state === "done" ? "#5c5235" : "#2a2d33"}`
          }
        },
        /* @__PURE__ */ React.createElement(
          "div",
          {
            style: {
              fontFamily: "'Oxanium', sans-serif",
              fontSize: 11,
              letterSpacing: "0.05em",
              color: state === "active" ? "#f1ede2" : state === "done" ? "#c9a24b" : "#5a5e64",
              fontWeight: state === "active" ? 700 : 600
            }
          },
          String(i + 1).padStart(2, "0")
        ),
        /* @__PURE__ */ React.createElement(
          "div",
          {
            style: {
              fontFamily: "'Oxanium', sans-serif",
              fontSize: 12,
              color: state === "active" ? "#f1ede2" : state === "done" ? "#9c9477" : "#5a5e64",
              marginTop: 2
            }
          },
          s.label
        )
      );
    }));
  }
  function StepIdentidade({ char, patch }) {
    return /* @__PURE__ */ React.createElement(Card, null, /* @__PURE__ */ React.createElement(SectionLabel, { eyebrow: "Passo 1 de 8" }, "Quem \xE9 voc\xEA?"), /* @__PURE__ */ React.createElement("p", { style: { color: "#8d939b", fontFamily: "'Source Serif 4', serif", lineHeight: 1.6, marginBottom: 24 } }, "Antes de explorar florestas mortais ou enfrentar criaturas perigosas, defina quem voc\xEA \xE9 nesse mundo."), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 18 } }, /* @__PURE__ */ React.createElement(Field, { label: "Nome do personagem" }, /* @__PURE__ */ React.createElement(
      "input",
      {
        autoFocus: true,
        value: char.name,
        onChange: (e) => patch({ name: e.target.value }),
        placeholder: "ex: Kaito Reyes",
        style: inputStyle
      }
    )), /* @__PURE__ */ React.createElement(Field, { label: "Seu nome (jogador)" }, /* @__PURE__ */ React.createElement(
      "input",
      {
        value: char.player,
        onChange: (e) => patch({ player: e.target.value }),
        placeholder: "ex: Gabriel",
        style: inputStyle
      }
    ))));
  }
  function Field({ label, children }) {
    return /* @__PURE__ */ React.createElement("label", { style: { display: "block" } }, /* @__PURE__ */ React.createElement(
      "div",
      {
        style: {
          fontFamily: "'Oxanium', sans-serif",
          fontSize: 12,
          letterSpacing: "0.04em",
          color: "#9aa0a8",
          marginBottom: 6
        }
      },
      label
    ), children);
  }
  var inputStyle = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #3a3d42",
    background: "#0f1113",
    color: "#f1ede2",
    fontFamily: "'Source Serif 4', serif",
    fontSize: 15,
    boxSizing: "border-box"
  };
  function StepAtributos({ char, patch }) {
    const total = totalAttrPoints(char.attrs);
    const remaining = 6 - total;
    const setAttr = (key, val) => {
      const newAttrs = { ...char.attrs, [key]: val };
      const newTotal = totalAttrPoints(newAttrs);
      if (newTotal > 6) return;
      patch({ attrs: newAttrs });
    };
    return /* @__PURE__ */ React.createElement(Card, null, /* @__PURE__ */ React.createElement(SectionLabel, { eyebrow: "Passo 2 de 8" }, "Distribua seus atributos"), /* @__PURE__ */ React.createElement("p", { style: { color: "#8d939b", fontFamily: "'Source Serif 4', serif", lineHeight: 1.6, marginBottom: 8 } }, "Voc\xEA tem ", /* @__PURE__ */ React.createElement("strong", { style: { color: "#c9a24b" } }, "6 pontos"), " para distribuir, no m\xE1ximo 4 em um atributo. Sua origem dar\xE1 pontos adicionais depois."), /* @__PURE__ */ React.createElement(
      "div",
      {
        style: {
          display: "inline-block",
          padding: "4px 14px",
          borderRadius: 999,
          background: remaining === 0 ? "#1d2b1d" : "#2b2310",
          color: remaining === 0 ? "#7fcf7f" : "#e0c23d",
          fontFamily: "'Oxanium', sans-serif",
          fontSize: 13,
          fontWeight: 700,
          marginBottom: 20
        }
      },
      remaining === 0 ? "Todos os pontos distribu\xEDdos" : `${remaining} ponto(s) restante(s)`
    ), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 14 } }, ATTRIBUTES.map((a) => /* @__PURE__ */ React.createElement(
      "div",
      {
        key: a.key,
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderRadius: 10,
          border: "1px solid #2a2d33",
          background: "#0f1113"
        }
      },
      /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "'Oxanium', sans-serif", fontWeight: 700, color: "#f1ede2" } }, a.label, " ", /* @__PURE__ */ React.createElement("span", { style: { color: "#6a6f76", fontSize: 12 } }, "(", a.short, ")")), /* @__PURE__ */ React.createElement("div", { style: { color: "#7e848c", fontSize: 13, fontFamily: "'Source Serif 4', serif" } }, a.desc)),
      /* @__PURE__ */ React.createElement(NumberStepper, { value: char.attrs[a.key], onChange: (v) => setAttr(a.key, v), min: 0, max: 4 })
    ))));
  }
  function StepOrigem({ char, patch }) {
    var _a;
    const origin = char.originKey ? ORIGINS[char.originKey] : null;
    const isHerdeiro = char.originKey === "herdeiro";
    const subDef = (_a = origin == null ? void 0 : origin.subchoices) == null ? void 0 : _a.options.find((o) => o.key === char.originSubchoice);
    const effectiveAttrBonus = isHerdeiro ? subDef == null ? void 0 : subDef.attrBonus : origin == null ? void 0 : origin.attrBonus;
    const effectiveTrainedSkills = isHerdeiro ? subDef == null ? void 0 : subDef.trainedSkills : origin == null ? void 0 : origin.trainedSkills;
    const selectOrigin = (key) => {
      patch({
        originKey: key,
        originSubchoice: null,
        originSubchoiceLabel: null,
        originAttrChoices: [],
        originSkillChoices: []
      });
    };
    const selectSubchoice = (subKey, subLabel) => {
      patch({ originSubchoice: subKey, originSubchoiceLabel: subLabel, originAttrChoices: [] });
    };
    return /* @__PURE__ */ React.createElement(Card, null, /* @__PURE__ */ React.createElement(SectionLabel, { eyebrow: "Passo 3 de 8" }, "Escolha sua origem"), /* @__PURE__ */ React.createElement("p", { style: { color: "#8d939b", fontFamily: "'Source Serif 4', serif", lineHeight: 1.6, marginBottom: 20 } }, "A origem define de onde seu personagem veio \u2014 a ess\xEAncia por tr\xE1s de quem ele \xE9 antes de se tornar Hunter."), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10, marginBottom: 24 } }, Object.entries(ORIGINS).map(([key, o]) => /* @__PURE__ */ React.createElement(
      "div",
      {
        key,
        onClick: () => selectOrigin(key),
        style: {
          padding: 14,
          borderRadius: 12,
          border: `1px solid ${char.originKey === key ? "#c9a24b" : "#2a2d33"}`,
          background: char.originKey === key ? "#c9a24b14" : "#0f1113",
          cursor: "pointer"
        }
      },
      /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "'Oxanium', sans-serif", fontWeight: 700, color: "#f1ede2", marginBottom: 4 } }, o.label),
      /* @__PURE__ */ React.createElement("div", { style: { color: "#7e848c", fontSize: 12.5, fontFamily: "'Source Serif 4', serif", lineHeight: 1.4 } }, o.blurb)
    ))), (origin == null ? void 0 : origin.subchoices) && /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 20 } }, /* @__PURE__ */ React.createElement(
      "div",
      {
        style: {
          fontFamily: "'Oxanium', sans-serif",
          fontSize: 13,
          color: "#c9a24b",
          marginBottom: 10,
          fontWeight: 700
        }
      },
      origin.subchoices.label
    ), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 8 } }, origin.subchoices.options.map((opt) => /* @__PURE__ */ React.createElement(
      "div",
      {
        key: opt.key,
        onClick: () => selectSubchoice(opt.key, opt.label),
        style: {
          padding: 12,
          borderRadius: 10,
          border: `1px solid ${char.originSubchoice === opt.key ? "#c9a24b" : "#2a2d33"}`,
          background: char.originSubchoice === opt.key ? "#c9a24b14" : "#0f1113",
          cursor: "pointer"
        }
      },
      /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "'Oxanium', sans-serif", fontWeight: 700, color: "#f1ede2", fontSize: 14 } }, opt.label),
      /* @__PURE__ */ React.createElement("div", { style: { color: "#7e848c", fontSize: 12.5, fontFamily: "'Source Serif 4', serif", marginTop: 3, lineHeight: 1.45 } }, opt.desc)
    )))), origin && /* @__PURE__ */ React.createElement(React.Fragment, null, effectiveAttrBonus && /* @__PURE__ */ React.createElement(
      OriginAttrBonusPicker,
      {
        bonus: effectiveAttrBonus,
        chosen: char.originAttrChoices,
        onChange: (choices) => patch({ originAttrChoices: choices })
      }
    ), effectiveTrainedSkills && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 16, padding: 14, borderRadius: 10, background: "#0f1113", border: "1px solid #2a2d33" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "'Oxanium', sans-serif", fontSize: 13, color: "#c9a24b", marginBottom: 8, fontWeight: 700 } }, "Per\xEDcias treinadas pela origem"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 6 } }, (effectiveTrainedSkills.fixed || []).map((sk) => /* @__PURE__ */ React.createElement(SkillTag, { key: sk, skillKey: sk })), effectiveTrainedSkills.choiceOneOf && /* @__PURE__ */ React.createElement("span", { style: { color: "#8d939b", fontSize: 13, fontFamily: "'Source Serif 4', serif" } }, "+ escolha entre ", effectiveTrainedSkills.choiceOneOf.map((k) => {
      var _a2;
      return (_a2 = SKILLS.find((s) => s.key === k)) == null ? void 0 : _a2.label;
    }).join(" ou "))), effectiveTrainedSkills.extraByIntellect && /* @__PURE__ */ React.createElement("div", { style: { color: "#7e848c", fontSize: 12.5, marginTop: 8, fontFamily: "'Source Serif 4', serif" } }, "+ per\xEDcias adicionais \xE0 sua escolha, em n\xFAmero igual ao seu Intelecto (voc\xEA escolher\xE1 no pr\xF3ximo passo).")), origin.drawback && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 12, padding: 12, borderRadius: 10, background: "#2b181480", border: "1px solid #5a3a2a" } }, /* @__PURE__ */ React.createElement("strong", { style: { color: "#e0a070", fontFamily: "'Oxanium', sans-serif", fontSize: 12.5 } }, "Desvantagem: "), /* @__PURE__ */ React.createElement("span", { style: { color: "#cbb39e", fontSize: 13, fontFamily: "'Source Serif 4', serif" } }, origin.drawback)), (subDef == null ? void 0 : subDef.drawback) && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 12, padding: 12, borderRadius: 10, background: "#2b181480", border: "1px solid #5a3a2a" } }, /* @__PURE__ */ React.createElement("strong", { style: { color: "#e0a070", fontFamily: "'Oxanium', sans-serif", fontSize: 12.5 } }, "Desvantagem: "), /* @__PURE__ */ React.createElement("span", { style: { color: "#cbb39e", fontSize: 13, fontFamily: "'Source Serif 4', serif" } }, subDef.drawback)), (subDef == null ? void 0 : subDef.special) && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 12, padding: 12, borderRadius: 10, background: "#14202b80", border: "1px solid #2a4a5a" } }, /* @__PURE__ */ React.createElement("strong", { style: { color: "#7ec0e0", fontFamily: "'Oxanium', sans-serif", fontSize: 12.5 } }, "Especial: "), /* @__PURE__ */ React.createElement("span", { style: { color: "#b9d4e0", fontSize: 13, fontFamily: "'Source Serif 4', serif" } }, subDef.special)), origin.racialBonus && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 12, padding: 12, borderRadius: 10, background: "#14201480", border: "1px solid #2a5a3a" } }, /* @__PURE__ */ React.createElement("strong", { style: { color: "#7ee0a0", fontFamily: "'Oxanium', sans-serif", fontSize: 12.5 } }, "B\xF4nus racial: "), /* @__PURE__ */ React.createElement("span", { style: { color: "#b9e0c8", fontSize: 13, fontFamily: "'Source Serif 4', serif" } }, origin.racialBonus))));
  }
  function SkillTag({ skillKey }) {
    const sk = SKILLS.find((s) => s.key === skillKey);
    if (!sk) return null;
    return /* @__PURE__ */ React.createElement(
      "span",
      {
        style: {
          padding: "4px 10px",
          borderRadius: 999,
          background: "#c9a24b1f",
          border: "1px solid #c9a24b55",
          color: "#e8d9ad",
          fontSize: 12.5,
          fontFamily: "'Oxanium', sans-serif"
        }
      },
      sk.label
    );
  }
  function OriginAttrBonusPicker({ bonus, chosen, onChange }) {
    if (bonus.type === "fixed") {
      return /* @__PURE__ */ React.createElement("div", { style: { marginTop: 16, padding: 14, borderRadius: 10, background: "#0f1113", border: "1px solid #2a2d33" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "'Oxanium', sans-serif", fontSize: 13, color: "#c9a24b", marginBottom: 6, fontWeight: 700 } }, "B\xF4nus de atributo (fixo)"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } }, Object.entries(bonus.fixed).map(([k, v]) => /* @__PURE__ */ React.createElement(AttrBonusTag, { key: k, attrKey: k, value: v }))));
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
      return /* @__PURE__ */ React.createElement("div", { style: { marginTop: 16, padding: 14, borderRadius: 10, background: "#0f1113", border: "1px solid #2a2d33" } }, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "'Oxanium', sans-serif", fontSize: 13, color: "#c9a24b", marginBottom: 6, fontWeight: 700 } }, "B\xF4nus de atributo \u2014 distribua ", points, " ponto(s) ", totalChosen < points ? `(${points - totalChosen} restante(s))` : "\u2713"), bonus.type === "fixed_plus_choice" && /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 } }, Object.entries(bonus.fixed).map(([k, v]) => /* @__PURE__ */ React.createElement(AttrBonusTag, { key: k, attrKey: k, value: v }))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, flexWrap: "wrap" } }, allowed.map((attrKey) => {
        const a = ATTRIBUTES.find((x) => x.key === attrKey);
        const c = countFor(attrKey);
        return /* @__PURE__ */ React.createElement(
          "div",
          {
            key: attrKey,
            style: {
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 10px",
              borderRadius: 8,
              border: "1px solid #3a3d42"
            }
          },
          /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "'Oxanium', sans-serif", fontSize: 13, color: "#e8d9ad" } }, a.short),
          /* @__PURE__ */ React.createElement("button", { onClick: () => removeOne(attrKey), style: { ...btnCircleStyle, width: 22, height: 22, fontSize: 13 } }, "\u2212"),
          /* @__PURE__ */ React.createElement("span", { style: { minWidth: 14, textAlign: "center", color: "#f1ede2", fontFamily: "'Oxanium', sans-serif" } }, c),
          /* @__PURE__ */ React.createElement(
            "button",
            {
              onClick: () => addPoint(attrKey),
              disabled: totalChosen >= points,
              style: { ...btnCircleStyle, width: 22, height: 22, fontSize: 13, opacity: totalChosen >= points ? 0.3 : 1 }
            },
            "+"
          )
        );
      })));
    }
    return null;
  }
  function AttrBonusTag({ attrKey, value }) {
    const a = ATTRIBUTES.find((x) => x.key === attrKey);
    if (!a) return null;
    return /* @__PURE__ */ React.createElement(
      "span",
      {
        style: {
          padding: "4px 10px",
          borderRadius: 8,
          background: "#3dbf7a1f",
          border: "1px solid #3dbf7a55",
          color: "#a8e0c0",
          fontSize: 12.5,
          fontFamily: "'Oxanium', sans-serif",
          fontWeight: 700
        }
      },
      a.short,
      " +",
      value
    );
  }
  function getOriginEffectiveTrainedSkills(char) {
    if (!char.originKey) return null;
    const origin = ORIGINS[char.originKey];
    if (char.originKey === "herdeiro") {
      const sub = origin.subchoices.options.find((o) => o.key === char.originSubchoice);
      return (sub == null ? void 0 : sub.trainedSkills) || null;
    }
    return origin.trainedSkills || null;
  }
  function StepPericias({ char, patch }) {
    const trainedDef = getOriginEffectiveTrainedSkills(char);
    const intelecto = char.attrs.intelecto || 0;
    const fixedSkills = (trainedDef == null ? void 0 : trainedDef.fixed) || [];
    const choiceOneOf = (trainedDef == null ? void 0 : trainedDef.choiceOneOf) || null;
    const choiceCount = (trainedDef == null ? void 0 : trainedDef.choiceCount) || 0;
    const extraByIntellect = (trainedDef == null ? void 0 : trainedDef.extraByIntellect) ? intelecto : 0;
    const [oneOfChoice, setOneOfChoice] = useState(char.originOneOfSkill || null);
    const [fixedChoiceSkills, setFixedChoiceSkills] = useState(char.originFixedChoiceSkills || []);
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
    const ready = (!choiceOneOf || !!oneOfChoice) && (choiceCount === 0 || fixedChoiceSkills.length === choiceCount) && extraSkills.length === extraByIntellect;
    useEffect(() => {
      if (ready) patch({ skillsTrained: [...new Set(allSelected)], pericasReady: true });
      else patch({ pericasReady: false });
    }, [oneOfChoice, fixedChoiceSkills, extraSkills]);
    return /* @__PURE__ */ React.createElement(Card, null, /* @__PURE__ */ React.createElement(SectionLabel, { eyebrow: "Passo 4 de 8" }, "Per\xEDcias da origem"), fixedSkills.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 18 } }, /* @__PURE__ */ React.createElement(Subtitle, null, "Per\xEDcias fixas garantidas pela origem"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 6 } }, fixedSkills.map((sk) => /* @__PURE__ */ React.createElement(SkillTag, { key: sk, skillKey: sk })))), choiceOneOf && /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 18 } }, /* @__PURE__ */ React.createElement(Subtitle, null, "Escolha uma: ", choiceOneOf.map((k) => {
      var _a;
      return (_a = SKILLS.find((s) => s.key === k)) == null ? void 0 : _a.label;
    }).join(" ou ")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, choiceOneOf.map((k) => {
      var _a;
      return /* @__PURE__ */ React.createElement(Pill, { key: k, active: oneOfChoice === k, onClick: () => handleOneOf(k) }, (_a = SKILLS.find((s) => s.key === k)) == null ? void 0 : _a.label);
    }))), choiceCount > 0 && /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 18 } }, /* @__PURE__ */ React.createElement(Subtitle, null, "Escolha ", choiceCount, " per\xEDcia(s) adicional(is) (", fixedChoiceSkills.length, "/", choiceCount, ")"), /* @__PURE__ */ React.createElement(
      SkillGrid,
      {
        skills: SKILLS.filter((s) => !fixedSkills.includes(s.key) && s.key !== oneOfChoice),
        selected: fixedChoiceSkills,
        onToggle: toggleFixedChoice,
        disabledExtra: (key) => !fixedChoiceSkills.includes(key) && fixedChoiceSkills.length >= choiceCount
      }
    )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(Subtitle, null, "Per\xEDcias livres (igual ao seu Intelecto = ", intelecto, ") \u2014 ", extraSkills.length, "/", extraByIntellect), extraByIntellect === 0 ? /* @__PURE__ */ React.createElement("p", { style: { color: "#7e848c", fontSize: 13, fontFamily: "'Source Serif 4', serif" } }, "Seu Intelecto \xE9 0, ent\xE3o voc\xEA n\xE3o ganha per\xEDcias livres adicionais por ele.") : /* @__PURE__ */ React.createElement(
      SkillGrid,
      {
        skills: availableForExtra,
        selected: extraSkills,
        onToggle: toggleExtraSkill,
        disabledExtra: (key) => !extraSkills.includes(key) && extraSkills.length >= extraByIntellect
      }
    )));
  }
  function Subtitle({ children }) {
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        style: {
          fontFamily: "'Oxanium', sans-serif",
          fontSize: 13,
          color: "#c9a24b",
          marginBottom: 10,
          fontWeight: 700
        }
      },
      children
    );
  }
  function SkillGrid({ skills, selected, onToggle, disabledExtra }) {
    return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 6 } }, skills.map((s) => /* @__PURE__ */ React.createElement(
      Pill,
      {
        key: s.key,
        active: selected.includes(s.key),
        onClick: () => onToggle(s.key),
        disabled: disabledExtra && disabledExtra(s.key)
      },
      s.label
    )));
  }
  function StepClasse({ char, patch }) {
    var _a, _b;
    const [classSkillChoices, setClassSkillChoices] = useState(char.classSkillChoices || []);
    const cls = char.classKey ? CLASSES[char.classKey] : null;
    const choiceCount = ((_a = cls == null ? void 0 : cls.trainedSkills) == null ? void 0 : _a.choiceCount) || 0;
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
    const fixedAlreadyTrained = ((_b = cls == null ? void 0 : cls.trainedSkills) == null ? void 0 : _b.fixed) || [];
    return /* @__PURE__ */ React.createElement(Card, null, /* @__PURE__ */ React.createElement(SectionLabel, { eyebrow: "Passo 5 de 8" }, "Exame Hunter & Classe"), /* @__PURE__ */ React.createElement("p", { style: { color: "#8d939b", fontFamily: "'Source Serif 4', serif", lineHeight: 1.6, marginBottom: 20 } }, "Depois de passar no Exame Hunter, escolha seu tipo de Hunter. At\xE9 ent\xE3o, seu personagem \xE9 um", " ", /* @__PURE__ */ React.createElement("strong", { style: { color: "#c9a24b" } }, "Aspirante a Hunter"), " (PV 9+Vigor, PA 3+Carisma, Defesa 8+Destreza)."), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10, marginBottom: 22 } }, Object.entries(CLASSES).map(([key, c]) => /* @__PURE__ */ React.createElement(
      "div",
      {
        key,
        onClick: () => selectClass(key),
        style: {
          padding: 14,
          borderRadius: 12,
          border: `1px solid ${char.classKey === key ? "#c9a24b" : "#2a2d33"}`,
          background: char.classKey === key ? "#c9a24b14" : "#0f1113",
          cursor: "pointer"
        }
      },
      /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "'Oxanium', sans-serif", fontWeight: 700, color: "#f1ede2", marginBottom: 4 } }, c.label),
      /* @__PURE__ */ React.createElement("div", { style: { color: "#7e848c", fontSize: 12.5, fontFamily: "'Source Serif 4', serif", lineHeight: 1.4 } }, c.blurb),
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 10, marginTop: 8, fontSize: 11.5, fontFamily: "'Oxanium', sans-serif", color: "#9aa0a8" } }, /* @__PURE__ */ React.createElement("span", null, "PV ", c.pv.init, "+VIG"), /* @__PURE__ */ React.createElement("span", null, "PA ", c.pa.init, "+", c.pa.attrChoice ? "INT/CAR" : "CAR"), /* @__PURE__ */ React.createElement("span", null, "DEF ", c.defenseBase, "+DEX"))
    ))), cls && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 16, padding: 14, borderRadius: 10, background: "#0f1113", border: "1px solid #2a2d33" } }, /* @__PURE__ */ React.createElement(Subtitle, null, "Per\xEDcias treinadas pela classe"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: choiceCount > 0 ? 12 : 0 } }, fixedAlreadyTrained.map((sk) => /* @__PURE__ */ React.createElement(SkillTag, { key: sk, skillKey: sk }))), choiceCount > 0 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(Subtitle, null, "Escolha ", choiceCount, " per\xEDcia(s) adicional(is) (", classSkillChoices.length, "/", choiceCount, ")"), /* @__PURE__ */ React.createElement(
      SkillGrid,
      {
        skills: SKILLS.filter((s) => !fixedAlreadyTrained.includes(s.key)),
        selected: classSkillChoices,
        onToggle: toggleClassSkill,
        disabledExtra: (key) => !classSkillChoices.includes(key) && classSkillChoices.length >= choiceCount
      }
    ))), cls.pa.attrChoice && /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 16, padding: 14, borderRadius: 10, background: "#0f1113", border: "1px solid #2a2d33" } }, /* @__PURE__ */ React.createElement(Subtitle, null, "Atributo para Pontos de Aura"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, cls.pa.attrChoice.map((k) => {
      var _a2;
      return /* @__PURE__ */ React.createElement(Pill, { key: k, active: char.paAttrChoice === k, onClick: () => patch({ paAttrChoice: k }) }, (_a2 = ATTRIBUTES.find((a) => a.key === k)) == null ? void 0 : _a2.label);
    }))), /* @__PURE__ */ React.createElement("div", { style: { padding: 14, borderRadius: 10, background: "#14202b80", border: "1px solid #2a4a5a" } }, /* @__PURE__ */ React.createElement(Subtitle, null, cls.baseAbility.name, " (habilidade base)"), /* @__PURE__ */ React.createElement("p", { style: { color: "#b9d4e0", fontSize: 13, fontFamily: "'Source Serif 4', serif", lineHeight: 1.5, margin: 0 } }, "Esta habilidade evolui conforme seu n\xEDvel (1, 4, 8, 12, 15). Voc\xEA ver\xE1 os detalhes completos na sua ficha final.")), cls.startingMoneyNote && /* @__PURE__ */ React.createElement("p", { style: { color: "#9c9477", fontSize: 13, fontFamily: "'Source Serif 4', serif", marginTop: 12 } }, "\u{1F4B0} ", cls.startingMoneyNote)));
  }
  function StepNen({ char, patch }) {
    var _a, _b;
    const selectHatsu = (key) => {
      patch({
        hatsuPrincipal: key,
        especialistaControlAttr: key === "especializacao" ? char.especialistaControlAttr || "intelecto" : null
      });
    };
    return /* @__PURE__ */ React.createElement(Card, null, /* @__PURE__ */ React.createElement(SectionLabel, { eyebrow: "Passo 6 de 8" }, "Nen & Hatsu"), /* @__PURE__ */ React.createElement("p", { style: { color: "#8d939b", fontFamily: "'Source Serif 4', serif", lineHeight: 1.6, marginBottom: 20 } }, "Escolha seu tipo de Hatsu com base na personalidade do personagem. Especializa\xE7\xE3o \xE9 rara: s\xF3 com 19 ou 20 em 1d20 (ou narrativamente liberada pelo mestre)."), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10, marginBottom: 22 } }, HATSU_TYPES.map((h) => /* @__PURE__ */ React.createElement(
      "div",
      {
        key: h.key,
        onClick: () => selectHatsu(h.key),
        style: {
          padding: 14,
          borderRadius: 12,
          border: `1px solid ${char.hatsuPrincipal === h.key ? AURA_COLORS[h.key] : "#2a2d33"}`,
          background: char.hatsuPrincipal === h.key ? `${AURA_COLORS[h.key]}14` : "#0f1113",
          cursor: "pointer"
        }
      },
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 4 } }, /* @__PURE__ */ React.createElement(AuraDot, { hatsu: h.key, size: 10 }), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "'Oxanium', sans-serif", fontWeight: 700, color: "#f1ede2" } }, h.label)),
      /* @__PURE__ */ React.createElement("div", { style: { color: "#7e848c", fontSize: 12.5, fontFamily: "'Source Serif 4', serif" } }, h.personality)
    ))), char.hatsuPrincipal === "especializacao" && /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 20, padding: 14, borderRadius: 10, background: "#0f1113", border: "1px solid #2a2d33" } }, /* @__PURE__ */ React.createElement(Subtitle, null, "Atributo de Controle de Nen (Especialista escolhe livremente)"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" } }, ATTRIBUTES.map((a) => /* @__PURE__ */ React.createElement(Pill, { key: a.key, active: char.especialistaControlAttr === a.key, onClick: () => patch({ especialistaControlAttr: a.key }) }, a.label)))), char.hatsuPrincipal && /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 22, padding: 14, borderRadius: 10, background: "#0f1113", border: "1px solid #2a2d33" } }, /* @__PURE__ */ React.createElement(Subtitle, null, "Afinidades a partir de ", (_a = HATSU_TYPES.find((h) => h.key === char.hatsuPrincipal)) == null ? void 0 : _a.label), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 8 } }, HATSU_TYPES.map((h) => {
      const aff = getAffinity(char.hatsuPrincipal, h.key);
      return /* @__PURE__ */ React.createElement(
        "div",
        {
          key: h.key,
          style: {
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 10px",
            borderRadius: 8,
            background: aff === 0 ? "#1a1a1a" : `${AURA_COLORS[h.key]}14`,
            border: `1px solid ${aff === 0 ? "#2a2d33" : AURA_COLORS[h.key] + "55"}`
          }
        },
        /* @__PURE__ */ React.createElement(AuraDot, { hatsu: h.key, size: 7 }),
        /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, fontFamily: "'Oxanium', sans-serif", color: aff === 0 ? "#5a5e64" : "#e8d9ad" } }, h.label, " ", aff, "%")
      );
    }))), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 22 } }, /* @__PURE__ */ React.createElement(Subtitle, null, "Especializa\xE7\xE3o em princ\xEDpio do Nen"), /* @__PURE__ */ React.createElement("p", { style: { color: "#7e848c", fontSize: 13, fontFamily: "'Source Serif 4', serif", marginBottom: 10 } }, "Escolha um entre Ren, Zetsu ou Ten para se especializar (evolui com o n\xEDvel). Os outros dois ficam no n\xEDvel amador."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8 } }, ["ren", "zetsu", "ten"].map((k) => /* @__PURE__ */ React.createElement(Pill, { key: k, active: char.nenSpecialization === k, onClick: () => patch({ nenSpecialization: k }) }, NEN_PRINCIPLES[k].label))), char.nenSpecialization && /* @__PURE__ */ React.createElement("p", { style: { color: "#8d939b", fontSize: 12.5, fontFamily: "'Source Serif 4', serif", marginTop: 10 } }, NEN_PRINCIPLES[char.nenSpecialization].desc)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(Subtitle, null, "T\xE9cnica de Nen inicial (n\xEDvel 1)"), /* @__PURE__ */ React.createElement("p", { style: { color: "#7e848c", fontSize: 13, fontFamily: "'Source Serif 4', serif", marginBottom: 10 } }, "Voc\xEA aprender\xE1 naturalmente uma t\xE9cnica em n\xEDveis 1, 4, 8, 11 e 15. Escolha a primeira agora."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 8 } }, Object.entries(NEN_TECHNIQUES).map(([k, t]) => /* @__PURE__ */ React.createElement(
      Pill,
      {
        key: k,
        active: (char.nenTechniquesKnown || []).includes(k),
        onClick: () => patch({ nenTechniquesKnown: [k] })
      },
      t.label
    ))), ((_b = char.nenTechniquesKnown) == null ? void 0 : _b[0]) && /* @__PURE__ */ React.createElement("p", { style: { color: "#8d939b", fontSize: 12.5, fontFamily: "'Source Serif 4', serif", marginTop: 10 } }, NEN_TECHNIQUES[char.nenTechniquesKnown[0]].desc)));
  }
  var SHOP_ITEMS = [
    // armas corpo a corpo
    { name: "Adaga", price: 3e4, cat: "Arma corpo a corpo", note: "1d4+DEX \xB7 cr\xEDtico 19/x2 \xB7 cortante \xB7 peso 1" },
    { name: "Espada comum", price: 6e4, cat: "Arma corpo a corpo", note: "2d6+FOR \xB7 cr\xEDtico 19/x2 \xB7 cortante \xB7 peso 2" },
    { name: "Espada pesada", price: 8e4, cat: "Arma corpo a corpo", note: "3d6+FOR (req. 3 FOR) \xB7 cr\xEDtico 20/x3 \xB7 cortante \xB7 peso 3" },
    { name: "Katana", price: 75e3, cat: "Arma corpo a corpo", note: "2d8+DEX (req. 2 DEX) \xB7 cr\xEDtico 19/x3 \xB7 cortante \xB7 peso 2" },
    { name: "Tetsubo", price: 15e4, cat: "Arma corpo a corpo", note: "4d6+FOR (req. 3 FOR) \xB7 cr\xEDtico 20/x2 \xB7 impacto \xB7 peso 3" },
    { name: "Garras de a\xE7o", price: 11e4, cat: "Arma corpo a corpo", note: "1d4+FOR \xB7 cr\xEDtico 20/x4 \xB7 cortante \xB7 peso 1" },
    // armas à distância
    { name: "Arco", price: 25e3, cat: "Arma \xE0 dist\xE2ncia", note: "2d4 \xB7 cr\xEDtico 19/x3 \xB7 perfurante \xB7 alcance m\xE9dio \xB7 peso 1" },
    { name: "Magnum", price: 4e4, cat: "Arma \xE0 dist\xE2ncia", note: "2d6 \xB7 cr\xEDtico 18/x3 \xB7 perfurante \xB7 alcance curto \xB7 peso 1" },
    { name: "Rifle", price: 2e5, cat: "Arma \xE0 dist\xE2ncia", note: "2d8+DEX \xB7 cr\xEDtico 20/x3 \xB7 alcance m\xE9dio/longo \xB7 peso 1" },
    { name: "Besta", price: 45e3, cat: "Arma \xE0 dist\xE2ncia", note: "3d4 \xB7 cr\xEDtico 20/x4 \xB7 perfurante \xB7 alcance m\xE9dio \xB7 peso 2" },
    // proteção
    { name: "Escudo leve", price: 3e4, cat: "Prote\xE7\xE3o", note: "+3 defesa, -1 dado para atacar \xB7 peso 3" },
    { name: "Cota de malha", price: 5e4, cat: "Prote\xE7\xE3o", note: "3 resist\xEAncia a dano cortante \xB7 peso 1" },
    { name: "Colete bal\xEDstico", price: 6e4, cat: "Prote\xE7\xE3o", note: "3 resist\xEAncia a dano perfurante \xB7 peso 2" },
    { name: "Escudo pesado", price: 9e4, cat: "Prote\xE7\xE3o", note: "+5 defesa, cobertura total, n\xE3o pode atacar \xB7 peso 5" },
    // kits e diversos
    { name: "Kit m\xE9dico", price: 15e3, cat: "Kits", note: "+5 Medicina, 2 usos \xB7 peso 1" },
    { name: "Kit de ant\xEDdotos", price: 15e3, cat: "Kits", note: "Atrasa/reduz veneno, 1 uso \xB7 peso 1" },
    { name: "Kit de disfarce", price: 15e3, cat: "Kits", note: "+5 Engana\xE7\xE3o, 2 usos \xB7 peso 1" },
    { name: "Mochila", price: 5e4, cat: "Diversos", note: "+5 espa\xE7os de carga" },
    { name: "Corda (20m)", price: 1e4, cat: "Diversos", note: "peso 1" },
    { name: "Lanterna", price: 3e4, cat: "Diversos", note: "ilumina raio de 12m \xB7 peso 1" },
    { name: "Pedra de Aura", price: 25e4, cat: "Artefato 1\u2605", note: "Recupera 5 PA, 1x/cena \xB7 peso 1" }
  ];
  function StepEquipamento({ char, patch }) {
    var _a, _b;
    const cls = char.classKey ? CLASSES[char.classKey] : null;
    const startingMoney = cls ? cls.startingMoney : ASPIRANTE_HUNTER.startingMoney;
    const spent = (char.equipment || []).reduce((acc, i) => acc + i.price * i.qty, 0);
    const money = (_a = char.money) != null ? _a : startingMoney;
    useEffect(() => {
      if (char.money === void 0 || char.money === null) {
        patch({ money: startingMoney });
      }
    }, []);
    const addItem = (item) => {
      const list = [...char.equipment || []];
      const existing = list.find((i) => i.name === item.name);
      if (existing) existing.qty += 1;
      else list.push({ name: item.name, price: item.price, qty: 1, note: item.note });
      const newSpent = list.reduce((acc, i) => acc + i.price * i.qty, 0);
      patch({ equipment: list, money: startingMoney - newSpent });
    };
    const removeItem = (name) => {
      const list = [...char.equipment || []];
      const idx = list.findIndex((i) => i.name === name);
      if (idx === -1) return;
      if (list[idx].qty > 1) list[idx].qty -= 1;
      else list.splice(idx, 1);
      const newSpent = list.reduce((acc, i) => acc + i.price * i.qty, 0);
      patch({ equipment: list, money: startingMoney - newSpent });
    };
    const categories = [...new Set(SHOP_ITEMS.map((i) => i.cat))];
    return /* @__PURE__ */ React.createElement(Card, null, /* @__PURE__ */ React.createElement(SectionLabel, { eyebrow: "Passo 7 de 8" }, "Equipamento inicial"), /* @__PURE__ */ React.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
          borderRadius: 10,
          background: "#0f1113",
          border: "1px solid #2a2d33",
          marginBottom: 20
        }
      },
      /* @__PURE__ */ React.createElement("span", { style: { color: "#9aa0a8", fontFamily: "'Oxanium', sans-serif", fontSize: 13 } }, "Dinheiro dispon\xEDvel"),
      /* @__PURE__ */ React.createElement("span", { style: { color: char.money < 0 ? "#e0533d" : "#e8d9ad", fontFamily: "'Oxanium', sans-serif", fontWeight: 800, fontSize: 18 } }, ((_b = char.money) != null ? _b : startingMoney).toLocaleString("pt-BR"), " J")
    ), categories.map((cat) => /* @__PURE__ */ React.createElement("div", { key: cat, style: { marginBottom: 18 } }, /* @__PURE__ */ React.createElement(Subtitle, null, cat), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 6 } }, SHOP_ITEMS.filter((i) => i.cat === cat).map((item) => {
      var _a2, _b2;
      const inCart = (char.equipment || []).find((i) => i.name === item.name);
      return /* @__PURE__ */ React.createElement(
        "div",
        {
          key: item.name,
          style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 14px",
            borderRadius: 10,
            background: "#0f1113",
            border: "1px solid #2a2d33"
          }
        },
        /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { color: "#f1ede2", fontFamily: "'Oxanium', sans-serif", fontWeight: 600, fontSize: 13.5 } }, item.name, " ", /* @__PURE__ */ React.createElement("span", { style: { color: "#6a6f76", fontWeight: 400 } }, "\xB7 ", item.price.toLocaleString("pt-BR"), "J")), /* @__PURE__ */ React.createElement("div", { style: { color: "#7e848c", fontSize: 12, fontFamily: "'Source Serif 4', serif" } }, item.note)),
        /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8 } }, inCart && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("button", { onClick: () => removeItem(item.name), style: { ...btnCircleStyle, width: 24, height: 24 } }, "\u2212"), /* @__PURE__ */ React.createElement("span", { style: { color: "#e8d9ad", minWidth: 14, textAlign: "center" } }, inCart.qty)), /* @__PURE__ */ React.createElement(
          "button",
          {
            onClick: () => addItem(item),
            disabled: ((_a2 = char.money) != null ? _a2 : startingMoney) < item.price,
            style: { ...btnCircleStyle, width: 24, height: 24, opacity: ((_b2 = char.money) != null ? _b2 : startingMoney) < item.price ? 0.3 : 1 }
          },
          "+"
        ))
      );
    })))), char.equipment && char.equipment.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 10, padding: 14, borderRadius: 10, background: "#0f1113", border: "1px solid #2a2d33" } }, /* @__PURE__ */ React.createElement(Subtitle, null, "Invent\xE1rio"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 6 } }, char.equipment.map((i) => /* @__PURE__ */ React.createElement(
      "span",
      {
        key: i.name,
        style: {
          padding: "4px 10px",
          borderRadius: 999,
          background: "#c9a24b1f",
          border: "1px solid #c9a24b55",
          color: "#e8d9ad",
          fontSize: 12.5,
          fontFamily: "'Oxanium', sans-serif"
        }
      },
      i.name,
      " \xD7",
      i.qty
    )))));
  }
  function StepRevisao({ char }) {
    var _a;
    const finalAttrs = useMemo(() => computeFinalAttrs(char), [char]);
    const maxPV = calcMaxPV({ ...char, attrs: finalAttrs });
    const maxPA = calcMaxPA({ ...char, attrs: finalAttrs });
    const defense = calcDefenseBase({ ...char, attrs: finalAttrs });
    const cls = char.classKey ? CLASSES[char.classKey] : null;
    return /* @__PURE__ */ React.createElement(Card, null, /* @__PURE__ */ React.createElement(SectionLabel, { eyebrow: "Passo 8 de 8" }, "Revise antes de gerar a licen\xE7a"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 12, marginBottom: 22 } }, /* @__PURE__ */ React.createElement(AuraDot, { hatsu: char.hatsuPrincipal, size: 16 }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontFamily: "'Oxanium', sans-serif", fontSize: 22, fontWeight: 800, color: "#f1ede2" } }, char.name || "Sem nome"), /* @__PURE__ */ React.createElement("div", { style: { color: "#9c9477", fontSize: 13, fontFamily: "'Source Serif 4', serif" } }, (cls == null ? void 0 : cls.label) || "Aspirante a Hunter", " \xB7 ", (_a = ORIGINS[char.originKey]) == null ? void 0 : _a.label, char.originSubchoiceLabel ? ` (${char.originSubchoiceLabel})` : ""))), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 10, marginBottom: 22 } }, /* @__PURE__ */ React.createElement(StatBox, { label: "PV", value: maxPV, color: "#e0533d" }), /* @__PURE__ */ React.createElement(StatBox, { label: "PA", value: maxPA, color: "#4d8de0" }), /* @__PURE__ */ React.createElement(StatBox, { label: "Defesa", value: defense, color: "#9aa0a8" }), /* @__PURE__ */ React.createElement(StatBox, { label: "Carga", value: calcCarryCapacity(finalAttrs), color: "#9c9477" })), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))", gap: 8, marginBottom: 22 } }, ATTRIBUTES.map((a) => /* @__PURE__ */ React.createElement("div", { key: a.key, style: { textAlign: "center", padding: "10px 6px", borderRadius: 10, background: "#0f1113", border: "1px solid #2a2d33" } }, /* @__PURE__ */ React.createElement("div", { style: { color: "#7e848c", fontSize: 11, fontFamily: "'Oxanium', sans-serif" } }, a.short), /* @__PURE__ */ React.createElement("div", { style: { color: "#f1ede2", fontSize: 20, fontFamily: "'Oxanium', sans-serif", fontWeight: 800 } }, finalAttrs[a.key])))), /* @__PURE__ */ React.createElement("p", { style: { color: "#8d939b", fontFamily: "'Source Serif 4', serif", fontSize: 13.5, lineHeight: 1.6 } }, "Tudo certo? Ao confirmar, sua ficha ser\xE1 salva neste dispositivo e voc\xEA poder\xE1 acompanhar PV, PA, n\xEDvel e habilidades direto pelo celular durante a sess\xE3o."));
  }
  function StatBox({ label, value, color }) {
    return /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", padding: "14px 8px", borderRadius: 12, background: "#0f1113", border: `1px solid ${color}44` } }, /* @__PURE__ */ React.createElement("div", { style: { color: "#7e848c", fontSize: 11, fontFamily: "'Oxanium', sans-serif", textTransform: "uppercase", letterSpacing: "0.05em" } }, label), /* @__PURE__ */ React.createElement("div", { style: { color, fontSize: 26, fontFamily: "'Oxanium', sans-serif", fontWeight: 800 } }, value));
  }
  function computeFinalAttrs(char) {
    var _a;
    const base = { ...char.attrs };
    const origin = char.originKey ? ORIGINS[char.originKey] : null;
    let result = { ...base };
    if (origin) {
      const isHerdeiro = char.originKey === "herdeiro";
      const subDef = (_a = origin.subchoices) == null ? void 0 : _a.options.find((o) => o.key === char.originSubchoice);
      const bonus = isHerdeiro ? subDef == null ? void 0 : subDef.attrBonus : origin.attrBonus;
      if (bonus) {
        if (bonus.type === "fixed") {
          for (const [k, v] of Object.entries(bonus.fixed)) result[k] = (result[k] || 0) + v;
        } else if (bonus.type === "fixed_plus_choice") {
          for (const [k, v] of Object.entries(bonus.fixed)) result[k] = (result[k] || 0) + v;
          for (const k of char.originAttrChoices || []) result[k] = (result[k] || 0) + 1;
        } else if (bonus.type === "choice") {
          for (const k of char.originAttrChoices || []) result[k] = (result[k] || 0) + 1;
        }
      }
    }
    const levelUp = char.attrBonusLevelUp || {};
    for (const k of Object.keys(result)) result[k] = (result[k] || 0) + (levelUp[k] || 0);
    return result;
  }
  var ATTR_POINT_LEVELS = [5, 10, 15];
  function totalLevelUpPointsAvailable(char) {
    const level = char.level || 1;
    let points = ATTR_POINT_LEVELS.filter((l) => l <= level).length;
    if (char.classKey === "duelista" && level >= 15) points += 1;
    return points;
  }
  function totalLevelUpPointsAllocated(char) {
    const levelUp = char.attrBonusLevelUp || {};
    return Object.values(levelUp).reduce((a, b) => a + (b || 0), 0);
  }
  var SHEET_TABS = [
    { key: "principal", label: "Principal" },
    { key: "pericias", label: "Per\xEDcias" },
    { key: "habilidades", label: "Habilidades" },
    { key: "nen", label: "Nen" },
    { key: "inventario", label: "Invent\xE1rio" },
    { key: "anotacoes", label: "Notas" }
  ];
  function CharacterSheet({ characterId, onBack }) {
    var _a, _b;
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
      return /* @__PURE__ */ React.createElement("div", { style: { padding: 60, textAlign: "center", color: "#8d939b" } }, "Carregando ficha\u2026");
    }
    const finalAttrs = computeFinalAttrs(char);
    const maxPV = calcMaxPV({ ...char, attrs: finalAttrs });
    const maxPA = calcMaxPA({ ...char, attrs: finalAttrs });
    const defense = calcDefenseBase({ ...char, attrs: finalAttrs });
    const curPV = (_a = char.currentPV) != null ? _a : maxPV;
    const curPA = (_b = char.currentPA) != null ? _b : maxPA;
    const cls = char.classKey ? CLASSES[char.classKey] : null;
    const hatsuColor = AURA_COLORS[char.hatsuPrincipal] || AURA_COLORS.null;
    return /* @__PURE__ */ React.createElement("div", { style: { maxWidth: 880, margin: "0 auto", padding: "20px 16px 100px" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 } }, /* @__PURE__ */ React.createElement(GhostButton, { onClick: onBack, style: { padding: "8px 14px", fontSize: 13 } }, "\u2190 Fichas"), /* @__PURE__ */ React.createElement("span", { style: { color: "#5a5e64", fontSize: 12, fontFamily: "'Oxanium', sans-serif" } }, saving ? "salvando\u2026" : "salvo")), /* @__PURE__ */ React.createElement(SheetHeader, { char, update, maxPV, maxPA, hatsuColor }), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 4, overflowX: "auto", margin: "22px 0 18px", borderBottom: "1px solid #2a2d33" } }, SHEET_TABS.map((t) => /* @__PURE__ */ React.createElement(
      "button",
      {
        key: t.key,
        onClick: () => setTab(t.key),
        style: {
          padding: "10px 16px",
          background: "transparent",
          border: "none",
          borderBottom: `2px solid ${tab === t.key ? "#c9a24b" : "transparent"}`,
          color: tab === t.key ? "#f1ede2" : "#7e848c",
          fontFamily: "'Oxanium', sans-serif",
          fontWeight: 700,
          fontSize: 13,
          cursor: "pointer",
          whiteSpace: "nowrap"
        }
      },
      t.label
    ))), tab === "principal" && /* @__PURE__ */ React.createElement(
      TabPrincipal,
      {
        char,
        update,
        finalAttrs,
        maxPV,
        maxPA,
        curPV,
        curPA,
        defense
      }
    ), tab === "pericias" && /* @__PURE__ */ React.createElement(TabPericias, { char, finalAttrs, update }), tab === "habilidades" && /* @__PURE__ */ React.createElement(TabHabilidades, { char, update }), tab === "nen" && /* @__PURE__ */ React.createElement(TabNen, { char, update, finalAttrs }), tab === "inventario" && /* @__PURE__ */ React.createElement(TabInventario, { char, update }), tab === "anotacoes" && /* @__PURE__ */ React.createElement(TabAnotacoes, { char, update }));
  }
  function SheetHeader({ char, update, maxPV, maxPA, hatsuColor }) {
    var _a, _b;
    const cls = char.classKey ? CLASSES[char.classKey] : null;
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        style: {
          position: "relative",
          borderRadius: 18,
          padding: "22px 22px 20px",
          background: `linear-gradient(135deg, #181b20 0%, #14161a 60%, ${hatsuColor}10 100%)`,
          border: `1px solid ${hatsuColor}44`,
          overflow: "hidden"
        }
      },
      /* @__PURE__ */ React.createElement(
        "div",
        {
          style: {
            position: "absolute",
            top: -60,
            right: -60,
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${hatsuColor}30, transparent 70%)`,
            pointerEvents: "none"
          }
        }
      ),
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(
        "div",
        {
          style: {
            fontFamily: "'Oxanium', sans-serif",
            fontSize: 11,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: hatsuColor,
            marginBottom: 6
          }
        },
        "Licen\xE7a de Hunter"
      ), /* @__PURE__ */ React.createElement(
        "input",
        {
          value: char.name,
          onChange: (e) => update({ name: e.target.value }),
          style: {
            background: "transparent",
            border: "none",
            fontFamily: "'Oxanium', sans-serif",
            fontSize: 28,
            fontWeight: 800,
            color: "#f1ede2",
            padding: 0,
            outline: "none",
            width: "100%",
            maxWidth: 320
          }
        }
      ), /* @__PURE__ */ React.createElement("div", { style: { color: "#9c9477", fontSize: 13.5, fontFamily: "'Source Serif 4', serif", marginTop: 2 } }, (cls == null ? void 0 : cls.label) || "Aspirante a Hunter", char.originKey && ` \xB7 ${ORIGINS[char.originKey].label}`)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } }, /* @__PURE__ */ React.createElement(AuraDot, { hatsu: char.hatsuPrincipal, size: 22 }), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "right" } }, /* @__PURE__ */ React.createElement("div", { style: { color: "#7e848c", fontSize: 11, fontFamily: "'Oxanium', sans-serif" } }, "N\xEDvel"), /* @__PURE__ */ React.createElement(LevelControl, { char, update })))),
      /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 18 } }, /* @__PURE__ */ React.createElement(
        TrackerBar,
        {
          label: "Pontos de Vida",
          color: "#e0533d",
          current: (_a = char.currentPV) != null ? _a : maxPV,
          max: maxPV,
          onChange: (v) => update({ currentPV: clamp(v, 0, maxPV) })
        }
      ), /* @__PURE__ */ React.createElement(
        TrackerBar,
        {
          label: "Pontos de Aura",
          color: "#4d8de0",
          current: (_b = char.currentPA) != null ? _b : maxPA,
          max: maxPA,
          onChange: (v) => update({ currentPA: clamp(v, 0, maxPA) })
        }
      ))
    );
  }
  function LevelControl({ char, update }) {
    return /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement("button", { onClick: () => update({ level: clamp((char.level || 1) - 1, 1, 15) }), style: { ...btnCircleStyle, width: 22, height: 22, fontSize: 13 } }, "\u2212"), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "'Oxanium', sans-serif", fontSize: 22, fontWeight: 800, color: "#f1ede2", minWidth: 26, textAlign: "center" } }, char.level || 1), /* @__PURE__ */ React.createElement("button", { onClick: () => update({ level: clamp((char.level || 1) + 1, 1, 15) }), style: { ...btnCircleStyle, width: 22, height: 22, fontSize: 13 } }, "+"));
  }
  function TrackerBar({ label, color, current, max, onChange }) {
    const pct = max > 0 ? clamp(current / max * 100, 0, 100) : 0;
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: 6 } }, /* @__PURE__ */ React.createElement("span", { style: { color: "#9aa0a8", fontSize: 11.5, fontFamily: "'Oxanium', sans-serif", letterSpacing: "0.03em" } }, label), /* @__PURE__ */ React.createElement("span", { style: { color, fontSize: 13, fontFamily: "'Oxanium', sans-serif", fontWeight: 800 } }, current, " / ", max)), /* @__PURE__ */ React.createElement("div", { style: { height: 10, borderRadius: 999, background: "#0c0d0f", overflow: "hidden", marginBottom: 8 } }, /* @__PURE__ */ React.createElement("div", { style: { height: "100%", width: `${pct}%`, background: color, transition: "width .2s ease" } })), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6 } }, /* @__PURE__ */ React.createElement(SmallBtn, { onClick: () => onChange(current - 5) }, "\u22125"), /* @__PURE__ */ React.createElement(SmallBtn, { onClick: () => onChange(current - 1) }, "\u22121"), /* @__PURE__ */ React.createElement(SmallBtn, { onClick: () => onChange(current + 1) }, "+1"), /* @__PURE__ */ React.createElement(SmallBtn, { onClick: () => onChange(current + 5) }, "+5"), /* @__PURE__ */ React.createElement(SmallBtn, { onClick: () => onChange(max) }, "M\xE1x")));
  }
  function SmallBtn({ children, onClick }) {
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick,
        style: {
          flex: 1,
          padding: "5px 0",
          borderRadius: 7,
          border: "1px solid #2f3338",
          background: "#13151a",
          color: "#aab0b8",
          fontSize: 11.5,
          fontFamily: "'Oxanium', sans-serif",
          cursor: "pointer"
        }
      },
      children
    );
  }
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
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: roll,
        style: {
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
          alignItems: "center"
        }
      },
      /* @__PURE__ */ React.createElement("span", null, label),
      /* @__PURE__ */ React.createElement("span", { style: { color: "#7e848c", fontWeight: 400 } }, numDice, "d20", skillBonus !== 0 ? ` ${ModSign(skillBonus)}` : "", isZero ? " (-5)" : "")
    ), result && /* @__PURE__ */ React.createElement(
      "div",
      {
        style: {
          marginTop: 6,
          padding: "8px 12px",
          borderRadius: 8,
          background: "#c9a24b14",
          border: "1px solid #c9a24b44",
          fontFamily: "'Oxanium', sans-serif",
          fontSize: 13,
          color: "#e8d9ad",
          display: "flex",
          justifyContent: "space-between"
        }
      },
      /* @__PURE__ */ React.createElement("span", { style: { color: "#8d939b" } }, "[", result.rolls.join(", "), "] melhor: ", result.best),
      /* @__PURE__ */ React.createElement("span", { style: { fontWeight: 800, fontSize: 16 } }, "= ", result.total)
    ));
  }
  function AttrLevelUpCard({ char, update }) {
    const available = totalLevelUpPointsAvailable(char);
    const allocated = totalLevelUpPointsAllocated(char);
    const remaining = available - allocated;
    const levelUp = char.attrBonusLevelUp || {};
    if (available === 0) {
      return /* @__PURE__ */ React.createElement(Card, null, /* @__PURE__ */ React.createElement(Subtitle, null, "Pontos de atributo (subida de n\xEDvel)"), /* @__PURE__ */ React.createElement("p", { style: { color: "#7e848c", fontSize: 12.5, fontFamily: "'Source Serif 4', serif", margin: 0 } }, "Voc\xEA ganha 1 ponto de atributo livre nos n\xEDveis 5, 10 e 15 (Duelista ganha +1 extra no 15). No n\xEDvel atual (", char.level || 1, ") voc\xEA ainda n\xE3o tem pontos dispon\xEDveis."));
    }
    const addPoint = (key) => {
      if (remaining <= 0) return;
      update({ attrBonusLevelUp: { ...levelUp, [key]: (levelUp[key] || 0) + 1 } });
    };
    const removePoint = (key) => {
      if (!levelUp[key]) return;
      update({ attrBonusLevelUp: { ...levelUp, [key]: levelUp[key] - 1 } });
    };
    return /* @__PURE__ */ React.createElement(Card, null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline" } }, /* @__PURE__ */ React.createElement(Subtitle, null, "Pontos de atributo (subida de n\xEDvel)"), /* @__PURE__ */ React.createElement(
      "span",
      {
        style: {
          color: remaining > 0 ? "#e0c23d" : "#7fcf7f",
          fontSize: 12,
          fontFamily: "'Oxanium', sans-serif",
          fontWeight: 700
        }
      },
      allocated,
      "/",
      available,
      " alocados"
    )), /* @__PURE__ */ React.createElement("p", { style: { color: "#7e848c", fontSize: 12.5, fontFamily: "'Source Serif 4', serif", marginTop: 0 } }, "Ganhos nos n\xEDveis 5, 10 e 15 (+1 extra no 15 para Duelista). Distribua livremente entre os atributos."), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 10 } }, ATTRIBUTES.map((a) => {
      const v = levelUp[a.key] || 0;
      return /* @__PURE__ */ React.createElement(
        "div",
        {
          key: a.key,
          style: {
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 10px",
            borderRadius: 8,
            border: "1px solid #3a3d42"
          }
        },
        /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "'Oxanium', sans-serif", fontSize: 13, color: "#e8d9ad" } }, a.short),
        /* @__PURE__ */ React.createElement("button", { onClick: () => removePoint(a.key), disabled: !v, style: { ...btnCircleStyle, width: 22, height: 22, fontSize: 13, opacity: !v ? 0.3 : 1 } }, "\u2212"),
        /* @__PURE__ */ React.createElement("span", { style: { minWidth: 14, textAlign: "center", color: "#f1ede2", fontFamily: "'Oxanium', sans-serif" } }, v),
        /* @__PURE__ */ React.createElement(
          "button",
          {
            onClick: () => addPoint(a.key),
            disabled: remaining <= 0,
            style: { ...btnCircleStyle, width: 22, height: 22, fontSize: 13, opacity: remaining <= 0 ? 0.3 : 1 }
          },
          "+"
        )
      );
    })));
  }
  function TabPrincipal({ char, update, finalAttrs, maxPV, maxPA, curPV, curPA, defense }) {
    return /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 16 } }, /* @__PURE__ */ React.createElement(Card, null, /* @__PURE__ */ React.createElement(Subtitle, null, "Atributos"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 } }, ATTRIBUTES.map((a) => /* @__PURE__ */ React.createElement("div", { key: a.key, style: { padding: "10px 14px", borderRadius: 10, background: "#0f1113", border: "1px solid #2a2d33" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between" } }, /* @__PURE__ */ React.createElement("span", { style: { color: "#9aa0a8", fontSize: 12.5, fontFamily: "'Oxanium', sans-serif" } }, a.label), /* @__PURE__ */ React.createElement("span", { style: { color: "#f1ede2", fontSize: 18, fontFamily: "'Oxanium', sans-serif", fontWeight: 800 } }, finalAttrs[a.key])), /* @__PURE__ */ React.createElement("div", { style: { color: "#5a5e64", fontSize: 11, fontFamily: "'Source Serif 4', serif", marginTop: 2 } }, finalAttrs[a.key] === 0 ? "1d20 (-5)" : `${finalAttrs[a.key]}d20`))))), /* @__PURE__ */ React.createElement(AttrLevelUpCard, { char, update }), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } }, /* @__PURE__ */ React.createElement(Card, { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { color: "#7e848c", fontSize: 12, fontFamily: "'Oxanium', sans-serif" } }, "Defesa"), /* @__PURE__ */ React.createElement("div", { style: { color: "#f1ede2", fontSize: 30, fontFamily: "'Oxanium', sans-serif", fontWeight: 800 } }, defense)), /* @__PURE__ */ React.createElement(Card, { style: { textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { color: "#7e848c", fontSize: 12, fontFamily: "'Oxanium', sans-serif" } }, "Capacidade de carga"), /* @__PURE__ */ React.createElement("div", { style: { color: "#f1ede2", fontSize: 30, fontFamily: "'Oxanium', sans-serif", fontWeight: 800 } }, calcCarryCapacity(finalAttrs)))), /* @__PURE__ */ React.createElement(Card, null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ React.createElement(Subtitle, null, "Dinheiro"), /* @__PURE__ */ React.createElement("span", { style: { fontFamily: "'Oxanium', sans-serif", fontWeight: 800, fontSize: 20, color: "#e8d9ad" } }, (char.money || 0).toLocaleString("pt-BR"), " J")), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 6, marginTop: 10 } }, [-5e4, -1e4, 1e4, 5e4].map((delta) => /* @__PURE__ */ React.createElement(SmallBtn, { key: delta, onClick: () => update({ money: Math.max(0, (char.money || 0) + delta) }) }, delta > 0 ? `+${delta / 1e3}k` : `${delta / 1e3}k`)))), /* @__PURE__ */ React.createElement(Card, null, /* @__PURE__ */ React.createElement(Subtitle, null, "Esfor\xE7ado"), /* @__PURE__ */ React.createElement("p", { style: { color: "#8d939b", fontSize: 13, fontFamily: "'Source Serif 4', serif", margin: 0 } }, "Gastando 1 ponto de Aura, ganha +2 em qualquer teste. Lembre disso ao rolar per\xEDcias na aba seguinte.")), char.originKey && /* @__PURE__ */ React.createElement(Card, null, /* @__PURE__ */ React.createElement(Subtitle, null, "Origem: ", ORIGINS[char.originKey].label, char.originSubchoiceLabel ? ` \u2014 ${char.originSubchoiceLabel}` : ""), /* @__PURE__ */ React.createElement(OriginSummaryText, { char })));
  }
  function OriginSummaryText({ char }) {
    var _a;
    const origin = ORIGINS[char.originKey];
    const isHerdeiro = char.originKey === "herdeiro";
    const subDef = (_a = origin.subchoices) == null ? void 0 : _a.options.find((o) => o.key === char.originSubchoice);
    const drawback = isHerdeiro ? subDef == null ? void 0 : subDef.drawback : origin.drawback;
    const special = subDef == null ? void 0 : subDef.special;
    return /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 8 } }, drawback && /* @__PURE__ */ React.createElement("p", { style: { color: "#cbb39e", fontSize: 13, fontFamily: "'Source Serif 4', serif", margin: 0 } }, /* @__PURE__ */ React.createElement("strong", { style: { color: "#e0a070" } }, "Desvantagem: "), drawback), special && /* @__PURE__ */ React.createElement("p", { style: { color: "#b9d4e0", fontSize: 13, fontFamily: "'Source Serif 4', serif", margin: 0 } }, /* @__PURE__ */ React.createElement("strong", { style: { color: "#7ec0e0" } }, "Especial: "), special), origin.racialBonus && /* @__PURE__ */ React.createElement("p", { style: { color: "#b9e0c8", fontSize: 13, fontFamily: "'Source Serif 4', serif", margin: 0 } }, /* @__PURE__ */ React.createElement("strong", { style: { color: "#7ee0a0" } }, "B\xF4nus racial: "), origin.racialBonus));
  }
  function TabPericias({ char, finalAttrs, update }) {
    var _a, _b;
    const trained = /* @__PURE__ */ new Set([
      ...char.skillsTrained || [],
      ...char.classSkillChoices || [],
      ...char.originOneOfSkill ? [char.originOneOfSkill] : [],
      ...char.originFixedChoiceSkills || []
    ]);
    const cls = char.classKey ? CLASSES[char.classKey] : null;
    if ((_a = cls == null ? void 0 : cls.trainedSkills) == null ? void 0 : _a.fixed) cls.trainedSkills.fixed.forEach((s) => trained.add(s));
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
    return /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 16 } }, /* @__PURE__ */ React.createElement(Card, null, /* @__PURE__ */ React.createElement("p", { style: { color: "#8d939b", fontSize: 13, fontFamily: "'Source Serif 4', serif", margin: 0 } }, "Toque em uma per\xEDcia para rolar. O n\xFAmero de d20 = valor do atributo (pega o melhor resultado); per\xEDcias treinadas somam ", /* @__PURE__ */ React.createElement("strong", { style: { color: "#c9a24b" } }, "+5"), ".")), ATTRIBUTES.map((a) => {
      const skillsForAttr = grouped[a.key];
      if (skillsForAttr.length === 0) return null;
      return /* @__PURE__ */ React.createElement(Card, { key: a.key }, /* @__PURE__ */ React.createElement(Subtitle, null, a.label, " ", /* @__PURE__ */ React.createElement("span", { style: { color: "#5a5e64", fontWeight: 400 } }, "(", finalAttrs[a.key], "d20)")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 8 } }, skillsForAttr.map((s) => {
        const isTrained = trained.has(s.key);
        const bonus = isTrained ? 5 : 0;
        return /* @__PURE__ */ React.createElement(
          DiceRollButton,
          {
            key: s.key,
            attrValue: finalAttrs[a.key],
            skillBonus: bonus,
            label: `${s.label}${isTrained ? " \u25CF" : ""}`,
            skillKey: s.key
          }
        );
      })));
    }), /* @__PURE__ */ React.createElement(Card, null, /* @__PURE__ */ React.createElement(Subtitle, null, "Controle de Nen", " ", /* @__PURE__ */ React.createElement("span", { style: { color: "#5a5e64", fontWeight: 400 } }, "(", nenAttr ? `${(_b = ATTRIBUTES.find((a) => a.key === nenAttr)) == null ? void 0 : _b.label} \xB7 ${finalAttrs[nenAttr]}d20` : "defina seu Hatsu", ")")), nenAttr && /* @__PURE__ */ React.createElement(
      DiceRollButton,
      {
        attrValue: finalAttrs[nenAttr],
        skillBonus: trained.has("controle_nen") ? 5 : 0,
        label: `Controle de Nen${trained.has("controle_nen") ? " \u25CF" : ""}`,
        skillKey: "controle_nen"
      }
    )), /* @__PURE__ */ React.createElement(Card, null, /* @__PURE__ */ React.createElement(Subtitle, null, "Dificuldade de Teste (refer\xEAncia)"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: 8 } }, TEST_DIFFICULTY.map((d) => /* @__PURE__ */ React.createElement("div", { key: d.key, style: { padding: "8px 12px", borderRadius: 8, background: "#0f1113", border: "1px solid #2a2d33", textAlign: "center" } }, /* @__PURE__ */ React.createElement("div", { style: { color: "#9aa0a8", fontSize: 12, fontFamily: "'Oxanium', sans-serif" } }, d.label), /* @__PURE__ */ React.createElement("div", { style: { color: "#c9a24b", fontSize: 15, fontFamily: "'Oxanium', sans-serif", fontWeight: 700 } }, "DT ", d.range))))));
  }
  function abilitySlotsForLevel(level) {
    const noAbilityLevels = /* @__PURE__ */ new Set([1, 5, 10, 15]);
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
      return /* @__PURE__ */ React.createElement(Card, null, /* @__PURE__ */ React.createElement("p", { style: { color: "#8d939b", fontFamily: "'Source Serif 4', serif" } }, "Como Aspirante a Hunter, voc\xEA s\xF3 tem a habilidade ", /* @__PURE__ */ React.createElement("strong", { style: { color: "#c9a24b" } }, "Esfor\xE7ado"), " ", "(1 PA = +2 em qualquer teste). Escolha uma classe para destravar a \xE1rvore de habilidades."));
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
    return /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 16 } }, /* @__PURE__ */ React.createElement(Card, null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline" } }, /* @__PURE__ */ React.createElement(Subtitle, null, cls.baseAbility.name), /* @__PURE__ */ React.createElement("span", { style: { color: "#5a5e64", fontSize: 12, fontFamily: "'Oxanium', sans-serif" } }, "habilidade base")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 10 } }, baseAbilityLevels.map((l) => /* @__PURE__ */ React.createElement("div", { key: l.lvl, style: { padding: "10px 14px", borderRadius: 10, background: "#0f1113", border: "1px solid #2a2d33" } }, /* @__PURE__ */ React.createElement("div", { style: { color: "#c9a24b", fontSize: 12, fontFamily: "'Oxanium', sans-serif", fontWeight: 700, marginBottom: 4 } }, "N\xEDvel ", l.lvl), /* @__PURE__ */ React.createElement("div", { style: { color: "#cfd3d8", fontSize: 13.5, fontFamily: "'Source Serif 4', serif", lineHeight: 1.5 } }, l.text))))), cls.combatAdaptation && /* @__PURE__ */ React.createElement(Card, null, /* @__PURE__ */ React.createElement(Subtitle, null, "Adapta\xE7\xE3o ao Combate"), ["lvl1", "lvl2", "lvl3"].map((k, i) => {
      const minLevelForTier = i === 0 ? 1 : i === 1 ? 8 : 15;
      if (level < minLevelForTier) return null;
      const tier = cls.combatAdaptation[k];
      return /* @__PURE__ */ React.createElement("div", { key: k, style: { marginBottom: 10, padding: "10px 14px", borderRadius: 10, background: "#0f1113", border: "1px solid #2a2d33" } }, /* @__PURE__ */ React.createElement("div", { style: { color: "#c9a24b", fontSize: 12, fontFamily: "'Oxanium', sans-serif", fontWeight: 700, marginBottom: 6 } }, "Tier ", i + 1), /* @__PURE__ */ React.createElement("p", { style: { color: "#cfd3d8", fontSize: 13, margin: "0 0 4px", fontFamily: "'Source Serif 4', serif" } }, /* @__PURE__ */ React.createElement("strong", null, "Aquecimento (1 rodada):"), " ", tier.warmup), /* @__PURE__ */ React.createElement("p", { style: { color: "#cfd3d8", fontSize: 13, margin: "0 0 4px", fontFamily: "'Source Serif 4', serif" } }, /* @__PURE__ */ React.createElement("strong", null, "Se adaptando (3 rodadas):"), " ", tier.adapt), /* @__PURE__ */ React.createElement("p", { style: { color: "#cfd3d8", fontSize: 13, margin: 0, fontFamily: "'Source Serif 4', serif" } }, /* @__PURE__ */ React.createElement("strong", null, "Impar\xE1vel (5 rodadas):"), " ", tier.unstoppable));
    })), cls.fightingStyles && /* @__PURE__ */ React.createElement(Card, null, /* @__PURE__ */ React.createElement(Subtitle, null, "Estilos de Luta conhecidos"), /* @__PURE__ */ React.createElement(FightingStylePicker, { char, update, cls })), /* @__PURE__ */ React.createElement(Card, null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 } }, /* @__PURE__ */ React.createElement(Subtitle, null, "Habilidades de classe escolhidas"), /* @__PURE__ */ React.createElement(
      "span",
      {
        style: {
          color: remainingSlots > 0 ? "#e0c23d" : "#7fcf7f",
          fontSize: 12,
          fontFamily: "'Oxanium', sans-serif",
          fontWeight: 700
        }
      },
      chosen.length,
      "/",
      slots,
      " slots"
    )), /* @__PURE__ */ React.createElement("p", { style: { color: "#7e848c", fontSize: 12.5, fontFamily: "'Source Serif 4', serif", marginTop: 0 } }, "Voc\xEA ganha 1 habilidade de classe na maioria dos n\xEDveis (exceto 1, 5, 10 e 15, que d\xE3o ponto de atributo). No seu n\xEDvel atual (", level, "), voc\xEA tem direito a ", slots, " habilidade(s) no total."), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 8, marginTop: 10 } }, cls.abilityPool.map((ab) => {
      const isChosen = chosen.includes(ab.name);
      const isAutomatic = AUTO_APPLIED_ABILITIES.has(ab.name);
      return /* @__PURE__ */ React.createElement(
        "div",
        {
          key: ab.name,
          onClick: () => toggleAbility(ab.name),
          style: {
            padding: "10px 14px",
            borderRadius: 10,
            border: `1px solid ${isChosen ? "#c9a24b" : "#2a2d33"}`,
            background: isChosen ? "#c9a24b14" : "#0f1113",
            cursor: remainingSlots > 0 || isChosen ? "pointer" : "not-allowed",
            opacity: !isChosen && remainingSlots <= 0 ? 0.45 : 1
          }
        },
        /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 3 } }, /* @__PURE__ */ React.createElement("span", { style: { color: "#f1ede2", fontFamily: "'Oxanium', sans-serif", fontWeight: 700, fontSize: 13.5 } }, ab.name), isAutomatic && /* @__PURE__ */ React.createElement(
          "span",
          {
            title: "J\xE1 soma automaticamente nos seus stats",
            style: {
              fontSize: 10.5,
              fontFamily: "'Oxanium', sans-serif",
              color: "#7fcf7f",
              background: "#1d2b1d",
              padding: "2px 6px",
              borderRadius: 999,
              fontWeight: 700
            }
          },
          "\u26A1 auto"
        )),
        /* @__PURE__ */ React.createElement("div", { style: { color: "#8d939b", fontSize: 12.5, fontFamily: "'Source Serif 4', serif", lineHeight: 1.45 } }, ab.desc)
      );
    }))));
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
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { style: { color: "#7e848c", fontSize: 12.5, fontFamily: "'Source Serif 4', serif", marginTop: 0 } }, "Slots dispon\xEDveis: ", known.length, "/", totalSlots, ' (1 a partir do n\xEDvel 4 via Duelista Nato; +1 a cada "Lutador Aplicado"; +1 no n\xEDvel 12).'), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 8 } }, cls.fightingStyles.map((fs) => {
      const isKnown = known.includes(fs.name);
      return /* @__PURE__ */ React.createElement(
        "div",
        {
          key: fs.name,
          onClick: () => toggle(fs.name),
          style: {
            padding: "10px 14px",
            borderRadius: 10,
            border: `1px solid ${isKnown ? "#c9a24b" : "#2a2d33"}`,
            background: isKnown ? "#c9a24b14" : "#0f1113",
            cursor: "pointer"
          }
        },
        /* @__PURE__ */ React.createElement("div", { style: { color: "#f1ede2", fontFamily: "'Oxanium', sans-serif", fontWeight: 700, fontSize: 13.5 } }, fs.name),
        /* @__PURE__ */ React.createElement("div", { style: { color: "#8d939b", fontSize: 12.5, fontFamily: "'Source Serif 4', serif", marginTop: 3 } }, fs.desc)
      );
    })));
  }
  function TabNen({ char, update, finalAttrs }) {
    const level = char.level || 1;
    const hatsuLearnedSoFar = HATSU_LEARN_LEVELS.filter((l) => l <= level).length;
    const techLearnedSoFar = NEN_TECHNIQUE_LEARN_LEVELS.filter((l) => l <= level).length;
    const hatsuAbilities = char.hatsuAbilities || [];
    const techniquesKnown = char.nenTechniquesKnown || [];
    return /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 16 } }, /* @__PURE__ */ React.createElement(Card, null, /* @__PURE__ */ React.createElement(Subtitle, null, "Princ\xEDpios do Nen"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 10 } }, ["ren", "zetsu", "ten"].map((k) => {
      const isSpecialized = char.nenSpecialization === k;
      const tierKey = isSpecialized ? level >= 15 ? "mestre" : level >= 10 ? "avancado" : level >= 5 ? "intermediario" : "amador" : "amador";
      const tier = NEN_PRINCIPLES[k].levels[tierKey];
      return /* @__PURE__ */ React.createElement(
        "div",
        {
          key: k,
          style: {
            padding: "12px 14px",
            borderRadius: 10,
            background: isSpecialized ? "#c9a24b14" : "#0f1113",
            border: `1px solid ${isSpecialized ? "#c9a24b" : "#2a2d33"}`
          }
        },
        /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline" } }, /* @__PURE__ */ React.createElement("span", { style: { color: "#f1ede2", fontFamily: "'Oxanium', sans-serif", fontWeight: 700 } }, NEN_PRINCIPLES[k].label, " ", isSpecialized && /* @__PURE__ */ React.createElement("span", { style: { color: "#c9a24b", fontSize: 11 } }, "\u2605 especializado")), /* @__PURE__ */ React.createElement("span", { style: { color: "#9aa0a8", fontSize: 12, fontFamily: "'Oxanium', sans-serif" } }, capitalize(tierKey), " (n\xEDvel ", tier.lvl, ")")),
        /* @__PURE__ */ React.createElement("p", { style: { color: "#8d939b", fontSize: 12.5, margin: "6px 0 0", fontFamily: "'Source Serif 4', serif" } }, "Custo: ", tier.cost, ". ", tier.effect)
      );
    }))), /* @__PURE__ */ React.createElement(Card, null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline" } }, /* @__PURE__ */ React.createElement(Subtitle, null, "T\xE9cnicas avan\xE7adas"), /* @__PURE__ */ React.createElement("span", { style: { color: techniquesKnown.length < techLearnedSoFar ? "#e0c23d" : "#7fcf7f", fontSize: 12, fontFamily: "'Oxanium', sans-serif", fontWeight: 700 } }, techniquesKnown.length, "/", techLearnedSoFar, " aprendidas")), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 8 } }, Object.entries(NEN_TECHNIQUES).map(([k, t]) => {
      const known = techniquesKnown.includes(k);
      return /* @__PURE__ */ React.createElement(
        "div",
        {
          key: k,
          onClick: () => {
            let next;
            if (known) next = techniquesKnown.filter((x) => x !== k);
            else {
              if (techniquesKnown.length >= techLearnedSoFar) return;
              next = [...techniquesKnown, k];
            }
            update({ nenTechniquesKnown: next });
          },
          style: {
            padding: "10px 14px",
            borderRadius: 10,
            border: `1px solid ${known ? "#c9a24b" : "#2a2d33"}`,
            background: known ? "#c9a24b14" : "#0f1113",
            cursor: "pointer",
            opacity: !known && techniquesKnown.length >= techLearnedSoFar ? 0.45 : 1
          }
        },
        /* @__PURE__ */ React.createElement("div", { style: { color: "#f1ede2", fontFamily: "'Oxanium', sans-serif", fontWeight: 700, fontSize: 13.5 } }, t.label),
        /* @__PURE__ */ React.createElement("div", { style: { color: "#8d939b", fontSize: 12.5, fontFamily: "'Source Serif 4', serif", marginTop: 3 } }, t.desc),
        t.effect && /* @__PURE__ */ React.createElement("div", { style: { color: "#9c9477", fontSize: 12, fontFamily: "'Source Serif 4', serif", marginTop: 4 } }, t.effect),
        t.variants && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 6, display: "grid", gap: 4 } }, t.variants.map((v) => /* @__PURE__ */ React.createElement("div", { key: v.name, style: { color: "#9c9477", fontSize: 12, fontFamily: "'Source Serif 4', serif" } }, /* @__PURE__ */ React.createElement("strong", { style: { color: "#c9a24b" } }, v.name, ":"), " ", v.desc)))
      );
    }))), /* @__PURE__ */ React.createElement(HatsuAbilityCreator, { char, update, hatsuLearnedSoFar }));
  }
  function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  function HatsuAbilityCreator({ char, update, hatsuLearnedSoFar }) {
    var _a;
    const [form, setForm] = useState({ name: "", type: char.hatsuPrincipal || "intensificacao", category: "base", desc: "" });
    const abilities = char.hatsuAbilities || [];
    const affinity = getAffinity(char.hatsuPrincipal, form.type);
    const costRange = ((_a = HATSU_COST_BY_AFFINITY[affinity]) == null ? void 0 : _a[form.category]) || "\u2014";
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
    return /* @__PURE__ */ React.createElement(Card, null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline" } }, /* @__PURE__ */ React.createElement(Subtitle, null, "Habilidades de Hatsu"), /* @__PURE__ */ React.createElement(
      "span",
      {
        style: {
          color: abilities.length < hatsuLearnedSoFar ? "#e0c23d" : "#7fcf7f",
          fontSize: 12,
          fontFamily: "'Oxanium', sans-serif",
          fontWeight: 700
        }
      },
      abilities.length,
      "/",
      hatsuLearnedSoFar,
      " aprendidas"
    )), /* @__PURE__ */ React.createElement("p", { style: { color: "#7e848c", fontSize: 12.5, fontFamily: "'Source Serif 4', serif", marginTop: 0 } }, "Crie suas habilidades junto com o mestre. O custo em PA \xE9 calculado automaticamente pela categoria (n\xEDvel em que foi aprendida) e pela sua afinidade com o tipo de Hatsu escolhido."), abilities.length > 0 && /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 8, marginBottom: 16 } }, abilities.map((ab) => {
      var _a2;
      return /* @__PURE__ */ React.createElement("div", { key: ab.id, style: { padding: "10px 14px", borderRadius: 10, background: "#0f1113", border: "1px solid #2a2d33" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement(AuraDot, { hatsu: ab.type, size: 8 }), /* @__PURE__ */ React.createElement("span", { style: { color: "#f1ede2", fontFamily: "'Oxanium', sans-serif", fontWeight: 700, fontSize: 13.5 } }, ab.name)), /* @__PURE__ */ React.createElement("div", { style: { color: "#9aa0a8", fontSize: 11.5, fontFamily: "'Oxanium', sans-serif", marginTop: 3 } }, (_a2 = HATSU_TYPES.find((h) => h.key === ab.type)) == null ? void 0 : _a2.label, " \xB7 ", HATSU_CATEGORY_LEVEL_RANGE[ab.category], " \xB7", " ", ab.affinity, "% afinidade \xB7 Custo ", ab.costRange, " PA \xB7 DT ", ab.dt), ab.desc && /* @__PURE__ */ React.createElement("div", { style: { color: "#8d939b", fontSize: 12.5, fontFamily: "'Source Serif 4', serif", marginTop: 6 } }, ab.desc)), /* @__PURE__ */ React.createElement("button", { onClick: () => removeAbility(ab.id), style: { ...btnCircleStyle, width: 22, height: 22, fontSize: 13 } }, "\xD7")));
    })), abilities.length < hatsuLearnedSoFar && /* @__PURE__ */ React.createElement("div", { style: { padding: 14, borderRadius: 10, background: "#0f1113", border: "1px solid #2a2d33" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 10 } }, /* @__PURE__ */ React.createElement(Field, { label: "Nome da habilidade" }, /* @__PURE__ */ React.createElement(
      "input",
      {
        value: form.name,
        onChange: (e) => setForm((f) => ({ ...f, name: e.target.value })),
        placeholder: "ex: Punho de A\xE7o",
        style: inputStyle
      }
    )), /* @__PURE__ */ React.createElement(Field, { label: "Tipo de Hatsu" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 6 } }, HATSU_TYPES.filter((h) => h.key !== "especializacao" || char.hatsuPrincipal === "especializacao").map((h) => /* @__PURE__ */ React.createElement(Pill, { key: h.key, active: form.type === h.key, onClick: () => setForm((f) => ({ ...f, type: h.key })), color: AURA_COLORS[h.key] }, h.label, " (", getAffinity(char.hatsuPrincipal, h.key), "%)")))), /* @__PURE__ */ React.createElement(Field, { label: "Categoria (n\xEDvel em que aprendeu)" }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 6 } }, Object.entries(HATSU_CATEGORY_LEVEL_RANGE).map(([key, range]) => /* @__PURE__ */ React.createElement(Pill, { key, active: form.category === key, onClick: () => setForm((f) => ({ ...f, category: key })) }, capitalize(key), " (", range, ")")))), /* @__PURE__ */ React.createElement(Field, { label: "Descri\xE7\xE3o / efeito / restri\xE7\xF5es" }, /* @__PURE__ */ React.createElement(
      "textarea",
      {
        value: form.desc,
        onChange: (e) => setForm((f) => ({ ...f, desc: e.target.value })),
        placeholder: "Descreva o efeito e as condi\xE7\xF5es/restri\xE7\xF5es combinadas com o mestre...",
        rows: 3,
        style: { ...inputStyle, resize: "vertical", fontFamily: "'Source Serif 4', serif" }
      }
    )), /* @__PURE__ */ React.createElement(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          padding: "10px 14px",
          borderRadius: 8,
          background: "#c9a24b14",
          border: "1px solid #c9a24b44"
        }
      },
      /* @__PURE__ */ React.createElement("span", { style: { color: "#e8d9ad", fontFamily: "'Oxanium', sans-serif", fontSize: 13 } }, "Custo calculado: ", /* @__PURE__ */ React.createElement("strong", null, costRange, " PA")),
      /* @__PURE__ */ React.createElement("span", { style: { color: "#e8d9ad", fontFamily: "'Oxanium', sans-serif", fontSize: 13 } }, "DT de uso: ", /* @__PURE__ */ React.createElement("strong", null, dt))
    ), /* @__PURE__ */ React.createElement(PrimaryButton, { onClick: addAbility, disabled: !form.name.trim() }, "Adicionar habilidade"))));
  }
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
    return /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 16 } }, /* @__PURE__ */ React.createElement(Card, null, /* @__PURE__ */ React.createElement(Subtitle, null, "Itens"), equipment.length === 0 && /* @__PURE__ */ React.createElement("p", { style: { color: "#7e848c", fontSize: 13, fontFamily: "'Source Serif 4', serif" } }, "Invent\xE1rio vazio."), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 8 } }, equipment.map((item, idx) => /* @__PURE__ */ React.createElement(
      "div",
      {
        key: item.id || idx,
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 14px",
          borderRadius: 10,
          background: "#0f1113",
          border: "1px solid #2a2d33"
        }
      },
      /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { color: "#f1ede2", fontFamily: "'Oxanium', sans-serif", fontWeight: 700, fontSize: 13.5 } }, item.name), item.note && /* @__PURE__ */ React.createElement("div", { style: { color: "#8d939b", fontSize: 12, fontFamily: "'Source Serif 4', serif" } }, item.note)),
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement("button", { onClick: () => changeQty(idx, -1), style: { ...btnCircleStyle, width: 22, height: 22, fontSize: 13 } }, "\u2212"), /* @__PURE__ */ React.createElement("span", { style: { color: "#e8d9ad", minWidth: 18, textAlign: "center", fontFamily: "'Oxanium', sans-serif" } }, item.qty), /* @__PURE__ */ React.createElement("button", { onClick: () => changeQty(idx, 1), style: { ...btnCircleStyle, width: 22, height: 22, fontSize: 13 } }, "+"), /* @__PURE__ */ React.createElement("button", { onClick: () => removeItem(idx), style: { ...btnCircleStyle, width: 22, height: 22, fontSize: 13 } }, "\xD7"))
    )))), /* @__PURE__ */ React.createElement(Card, null, /* @__PURE__ */ React.createElement(Subtitle, null, "Adicionar item manualmente"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 10 } }, /* @__PURE__ */ React.createElement(Field, { label: "Nome" }, /* @__PURE__ */ React.createElement(
      "input",
      {
        value: newItem.name,
        onChange: (e) => setNewItem((i) => ({ ...i, name: e.target.value })),
        style: inputStyle,
        placeholder: "ex: Corda de a\xE7o"
      }
    )), /* @__PURE__ */ React.createElement(Field, { label: "Nota (dano, peso, efeito...)" }, /* @__PURE__ */ React.createElement(
      "input",
      {
        value: newItem.note,
        onChange: (e) => setNewItem((i) => ({ ...i, note: e.target.value })),
        style: inputStyle,
        placeholder: "ex: peso 1, +2 em testes de escalada"
      }
    )), /* @__PURE__ */ React.createElement(PrimaryButton, { onClick: addItem, disabled: !newItem.name.trim() }, "Adicionar"))), /* @__PURE__ */ React.createElement(Card, null, /* @__PURE__ */ React.createElement(Subtitle, null, "Reputa\xE7\xE3o com fac\xE7\xF5es"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gap: 8 } }, FACTIONS.map((f) => {
      var _a, _b;
      return /* @__PURE__ */ React.createElement("div", { key: f, style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, /* @__PURE__ */ React.createElement("span", { style: { color: "#cfd3d8", fontSize: 13, fontFamily: "'Source Serif 4', serif" } }, f), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => {
            var _a2;
            return update({ reputations: { ...char.reputations, [f]: clamp((((_a2 = char.reputations) == null ? void 0 : _a2[f]) || 0) - 1, -5, 5) } });
          },
          style: { ...btnCircleStyle, width: 22, height: 22, fontSize: 13 }
        },
        "\u2212"
      ), /* @__PURE__ */ React.createElement(
        "span",
        {
          style: {
            minWidth: 24,
            textAlign: "center",
            fontFamily: "'Oxanium', sans-serif",
            fontWeight: 700,
            color: (((_a = char.reputations) == null ? void 0 : _a[f]) || 0) >= 0 ? "#7fcf7f" : "#e0533d"
          }
        },
        ModSign(((_b = char.reputations) == null ? void 0 : _b[f]) || 0)
      ), /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => {
            var _a2;
            return update({ reputations: { ...char.reputations, [f]: clamp((((_a2 = char.reputations) == null ? void 0 : _a2[f]) || 0) + 1, -5, 5) } });
          },
          style: { ...btnCircleStyle, width: 22, height: 22, fontSize: 13 }
        },
        "+"
      )));
    }))));
  }
  function TabAnotacoes({ char, update }) {
    return /* @__PURE__ */ React.createElement(Card, null, /* @__PURE__ */ React.createElement(Subtitle, null, "Anota\xE7\xF5es livres"), /* @__PURE__ */ React.createElement("p", { style: { color: "#7e848c", fontSize: 12.5, fontFamily: "'Source Serif 4', serif", marginTop: 0 } }, "Use este espa\xE7o para hist\xF3rico, condi\xE7\xF5es ativas, alvos (Hunter de Recompensas), bestas (Hunter de Bestas) ou qualquer coisa que n\xE3o tenha campo pr\xF3prio."), /* @__PURE__ */ React.createElement(
      "textarea",
      {
        value: char.notes || "",
        onChange: (e) => update({ notes: e.target.value }),
        rows: 14,
        placeholder: "Escreva aqui...",
        style: { ...inputStyle, resize: "vertical", fontFamily: "'Source Serif 4', serif", lineHeight: 1.5 }
      }
    ), /* @__PURE__ */ React.createElement("div", { style: { marginTop: 18 } }, /* @__PURE__ */ React.createElement(Subtitle, null, "Condi\xE7\xF5es de refer\xEAncia"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px,1fr))", gap: 6 } }, CONDITIONS.map((c) => /* @__PURE__ */ React.createElement("div", { key: c.name, style: { padding: "6px 10px", borderRadius: 8, background: "#0f1113", border: "1px solid #2a2d33" } }, /* @__PURE__ */ React.createElement("div", { style: { color: "#e8d9ad", fontSize: 12, fontFamily: "'Oxanium', sans-serif", fontWeight: 700 } }, c.name), /* @__PURE__ */ React.createElement("div", { style: { color: "#7e848c", fontSize: 11, fontFamily: "'Source Serif 4', serif" } }, c.desc))))));
  }
  function GlobalStyles() {
    return /* @__PURE__ */ React.createElement("style", null, `
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
    `);
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
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        style: {
          minHeight: "100vh",
          background: "radial-gradient(ellipse at top, #1a1d22 0%, #0c0d0f 60%)",
          color: "#f1ede2"
        }
      },
      /* @__PURE__ */ React.createElement(GlobalStyles, null),
      route.screen === "home" && /* @__PURE__ */ React.createElement(HomeScreen, { onNewCharacter: goNew, onOpenCharacter: openChar }),
      route.screen === "wizard" && /* @__PURE__ */ React.createElement(CreationWizard, { onFinish: handleFinishWizard, onCancel: goHome }),
      route.screen === "sheet" && /* @__PURE__ */ React.createElement(CharacterSheet, { characterId: route.id, onBack: goHome })
    );
  }
  var root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(/* @__PURE__ */ React.createElement(App, null));
})();
