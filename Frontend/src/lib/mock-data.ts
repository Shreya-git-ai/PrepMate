export type Material = {
  id: string;
  title: string;
  subject: string;
  pages: number;
  uploadedAt: string;
  status: "ready" | "processing";
  topics: number;
};

export const materials: Material[] = [
  {
    id: "m1",
    title: "Organic Chemistry — Unit 3 Notes",
    subject: "Chemistry",
    pages: 42,
    uploadedAt: "2 days ago",
    status: "ready",
    topics: 8,
  },
  {
    id: "m2",
    title: "Data Structures: Trees & Graphs",
    subject: "Computer Science",
    pages: 31,
    uploadedAt: "5 days ago",
    status: "ready",
    topics: 6,
  },
  {
    id: "m3",
    title: "Cell Biology Lecture Slides",
    subject: "Biology",
    pages: 58,
    uploadedAt: "1 week ago",
    status: "ready",
    topics: 11,
  },
  {
    id: "m4",
    title: "Thermodynamics Problem Sheet",
    subject: "Physics",
    pages: 12,
    uploadedAt: "just now",
    status: "processing",
    topics: 0,
  },
];

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  citations?: { label: string; page: number }[];
};

export const initialChat: ChatMessage[] = [
  {
    id: "c1",
    role: "user",
    text: "Explain the difference between SN1 and SN2 reactions in simple terms.",
  },
  {
    id: "c2",
    role: "assistant",
    text: "SN2 is a one-step reaction: the nucleophile attacks while the leaving group departs, so it needs an uncrowded carbon and gives inverted stereochemistry. SN1 goes through a carbocation in two steps, so it favours tertiary carbons, polar protic solvents, and gives a racemic mixture.",
    citations: [
      { label: "Organic Chemistry — Unit 3", page: 14 },
      { label: "Organic Chemistry — Unit 3", page: 17 },
    ],
  },
  {
    id: "c3",
    role: "user",
    text: "Which one is faster in a polar protic solvent?",
  },
  {
    id: "c4",
    role: "assistant",
    text: "SN1 speeds up in polar protic solvents because they stabilise the carbocation intermediate through hydrogen bonding. The same solvents slow SN2 down by caging the nucleophile.",
    citations: [{ label: "Organic Chemistry — Unit 3", page: 19 }],
  },
];

export const suggestedQuestions = [
  "Summarise Markovnikov's rule",
  "How does a red-black tree stay balanced?",
  "What happens during prophase I?",
];

export type Topic = {
  id: string;
  title: string;
  source: string;
  mastery: number;
  bullets: string[];
};

export const topics: Topic[] = [
  {
    id: "t1",
    title: "Nucleophilic Substitution",
    source: "Organic Chemistry — Unit 3",
    mastery: 42,
    bullets: [
      "SN1: two steps via a carbocation, favoured by tertiary substrates.",
      "SN2: one step, backside attack, inversion of configuration.",
      "Solvent choice flips which mechanism dominates.",
      "Leaving group ability follows I⁻ > Br⁻ > Cl⁻ > F⁻.",
    ],
  },
  {
    id: "t2",
    title: "Graph Traversal",
    source: "Data Structures: Trees & Graphs",
    mastery: 78,
    bullets: [
      "BFS uses a queue and finds shortest paths in unweighted graphs.",
      "DFS uses a stack or recursion and powers cycle detection.",
      "Both run in O(V + E) with an adjacency list.",
    ],
  },
  {
    id: "t3",
    title: "Meiosis & Crossing Over",
    source: "Cell Biology Lecture Slides",
    mastery: 35,
    bullets: [
      "Prophase I is where homologous chromosomes pair and swap segments.",
      "Crossing over is the main source of genetic recombination.",
      "Two divisions produce four haploid, non-identical cells.",
    ],
  },
  {
    id: "t4",
    title: "Balanced Search Trees",
    source: "Data Structures: Trees & Graphs",
    mastery: 61,
    bullets: [
      "AVL trees rebalance with rotations after every insert or delete.",
      "Red-black trees relax balance for cheaper writes.",
      "Both guarantee O(log n) search.",
    ],
  },
  {
    id: "t5",
    title: "Enzyme Kinetics",
    source: "Cell Biology Lecture Slides",
    mastery: 51,
    bullets: [
      "Michaelis–Menten links reaction rate to substrate concentration.",
      "Km is the substrate concentration at half Vmax.",
      "Competitive inhibitors raise Km, leave Vmax unchanged.",
    ],
  },
  {
    id: "t6",
    title: "Laws of Thermodynamics",
    source: "Thermodynamics Problem Sheet",
    mastery: 28,
    bullets: [
      "First law: energy is conserved, ΔU = Q − W.",
      "Second law: entropy of an isolated system never decreases.",
      "Carnot efficiency sets the ceiling for any heat engine.",
    ],
  },
];

export type Question = {
  id: string;
  topic: string;
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

export const quizQuestions: Question[] = [
  {
    id: "q1",
    topic: "Nucleophilic Substitution",
    prompt: "Which condition most strongly favours an SN1 mechanism?",
    options: [
      "A primary alkyl halide in acetone",
      "A tertiary alkyl halide in aqueous ethanol",
      "A strong nucleophile at high concentration",
      "A polar aprotic solvent with a small nucleophile",
    ],
    answerIndex: 1,
    explanation:
      "Tertiary substrates form stable carbocations, and polar protic solvents like aqueous ethanol stabilise them further.",
  },
  {
    id: "q2",
    topic: "Meiosis & Crossing Over",
    prompt: "Crossing over between homologous chromosomes occurs during:",
    options: ["Prophase I", "Metaphase II", "Anaphase I", "Telophase II"],
    answerIndex: 0,
    explanation: "Synapsis and chiasmata formation happen in prophase I of meiosis.",
  },
  {
    id: "q3",
    topic: "Graph Traversal",
    prompt: "Which traversal finds the shortest path in an unweighted graph?",
    options: ["Depth-first search", "Breadth-first search", "Topological sort", "Dijkstra only"],
    answerIndex: 1,
    explanation: "BFS explores level by level, so the first time it reaches a node is via a shortest path.",
  },
  {
    id: "q4",
    topic: "Laws of Thermodynamics",
    prompt: "The second law of thermodynamics states that:",
    options: [
      "Energy can neither be created nor destroyed",
      "Entropy of an isolated system never decreases",
      "Absolute zero is unreachable",
      "Heat flows from cold to hot spontaneously",
    ],
    answerIndex: 1,
    explanation: "Entropy of an isolated system increases or stays constant — never decreases.",
  },
  {
    id: "q5",
    topic: "Enzyme Kinetics",
    prompt: "A competitive inhibitor has which effect?",
    options: [
      "Lowers Vmax, Km unchanged",
      "Raises Km, Vmax unchanged",
      "Lowers both Km and Vmax",
      "No effect on either",
    ],
    answerIndex: 1,
    explanation: "Competitive inhibitors compete for the active site, so more substrate is needed for half Vmax.",
  },
];

export type WeakTopic = {
  topic: string;
  source: string;
  accuracy: number;
  attempts: number;
};

export const weakTopics: WeakTopic[] = [
  { topic: "Laws of Thermodynamics", source: "Thermodynamics Problem Sheet", accuracy: 28, attempts: 9 },
  { topic: "Meiosis & Crossing Over", source: "Cell Biology Lecture Slides", accuracy: 35, attempts: 14 },
  { topic: "Nucleophilic Substitution", source: "Organic Chemistry — Unit 3", accuracy: 42, attempts: 21 },
  { topic: "Enzyme Kinetics", source: "Cell Biology Lecture Slides", accuracy: 51, attempts: 11 },
  { topic: "Balanced Search Trees", source: "Data Structures: Trees & Graphs", accuracy: 61, attempts: 16 },
  { topic: "Graph Traversal", source: "Data Structures: Trees & Graphs", accuracy: 78, attempts: 18 },
];

export const revisionNotes = [
  {
    topic: "Laws of Thermodynamics",
    source: "Thermodynamics Problem Sheet",
    accuracy: 28,
    bullets: [
      "ΔU = Q − W. Sign convention: W is work done *by* the system.",
      "Entropy of an isolated system never decreases (second law).",
      "Carnot efficiency = 1 − Tc/Th, temperatures in kelvin.",
      "Adiabatic means Q = 0, isothermal means ΔU = 0 for an ideal gas.",
    ],
  },
  {
    topic: "Meiosis & Crossing Over",
    source: "Cell Biology Lecture Slides",
    accuracy: 35,
    bullets: [
      "Prophase I: pairing (synapsis) → chiasmata → crossing over.",
      "Independent assortment happens at metaphase I, not II.",
      "Result: four genetically distinct haploid cells.",
    ],
  },
  {
    topic: "Nucleophilic Substitution",
    source: "Organic Chemistry — Unit 3",
    accuracy: 42,
    bullets: [
      "SN2 = one step, inversion, favoured by primary carbons + polar aprotic solvents.",
      "SN1 = two steps, racemisation, favoured by tertiary carbons + polar protic solvents.",
      "Better leaving group → faster in both mechanisms.",
    ],
  },
  {
    topic: "Enzyme Kinetics",
    source: "Cell Biology Lecture Slides",
    accuracy: 51,
    bullets: [
      "Km = substrate concentration at ½ Vmax; low Km = high affinity.",
      "Competitive → Km up. Non-competitive → Vmax down.",
      "Lineweaver–Burk: y-intercept 1/Vmax, x-intercept −1/Km.",
    ],
  },
];
