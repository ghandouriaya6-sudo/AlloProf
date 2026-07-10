// ===== AlloProf - Données d'exemple =====
// À remplacer plus tard par les données issues de Firestore.
// Chaque niveau (du CP à la 2ème Bac) dispose d'au moins un cours,
// un exercice corrigé et un examen blanc, avec des questions déjà intégrées
// afin que la correction automatique fonctionne quel que soit la matière.

const ALLOPROF_DATA = {
  matieres: [
    { id: "maths", nom: "Mathématiques", icone: "📐" },
    { id: "physique", nom: "Physique-Chimie", icone: "⚗️" },
    { id: "svt", nom: "SVT", icone: "🧬" },
    { id: "francais", nom: "Français", icone: "📘" },
    { id: "arabe", nom: "Arabe", icone: "📖" },
    { id: "anglais", nom: "Anglais", icone: "🇬🇧" },
    { id: "philosophie", nom: "Philosophie", icone: "🧠" },
    { id: "histoire-geo", nom: "Histoire-Géographie", icone: "🗺️" },
    { id: "info", nom: "Informatique", icone: "💻" },
    { id: "islamique", nom: "Education Islamique", icone: "🕌" }
  ],

  niveaux: [
    // Primaire
    { id: "cp", nom: "CP" },
    { id: "ce1", nom: "CE1" },
    { id: "ce2", nom: "CE2" },
    { id: "cm1", nom: "CM1" },
    { id: "cm2", nom: "CM2" },
    { id: "6ap", nom: "6ème Primaire" },

    // Collège
    { id: "1ac", nom: "1ère Année Collège" },
    { id: "2ac", nom: "2ème Année Collège" },
    { id: "3ac", nom: "3ème Année Collège" },

    // Lycée
    { id: "tc", nom: "Tronc Commun" },
    { id: "1bac", nom: "1ère Baccalauréat" },
    { id: "2bac", nom: "2ème Baccalauréat" }
  ],

  /* =========================================================
     COURS — au moins un cours par niveau (CP → 2ème Bac)
     Champs "youtube" et "pdf" laissés vides ici : dès qu'un admin
     ajoute un lien depuis /pages/admin-cours.html, la vidéo et le PDF
     s'affichent automatiquement sur la page cours-detail.html.
     ========================================================= */
  cours: [
    {
      id: "c1",
      titre: "Les fractions et leurs opérations",
      description: "Comprendre, simplifier et calculer avec les fractions à travers des exemples concrets.",
      matiere: "maths",
      niveau: "1ac",
      premium: false,
      duree: "45 min",
      youtube: "",
      pdf: "",
      chapitres: [
        { titre: "Introduction aux fractions", duree: "8 min" },
        { titre: "Addition et soustraction", duree: "12 min" },
        { titre: "Multiplication et division", duree: "15 min" },
        { titre: "Exercices d'application", duree: "10 min" }
      ],
      progression: 60
    },
    {
      id: "c2",
      titre: "La réaction chimique et ses lois",
      description: "Les bases de la chimie : réactifs, produits, conservation de la matière.",
      matiere: "physique",
      niveau: "tc",
      premium: true,
      duree: "55 min",
      youtube: "",
      pdf: "",
      chapitres: [
        { titre: "Qu'est-ce qu'une réaction chimique ?", duree: "10 min" },
        { titre: "Loi de conservation de la masse", duree: "15 min" },
        { titre: "Équilibrage des équations", duree: "20 min" },
        { titre: "Exercices corrigés", duree: "10 min" }
      ],
      progression: 0
    },
    {
      id: "c3",
      titre: "La cellule, unité du vivant",
      description: "Structure et fonctionnement de la cellule animale et végétale.",
      matiere: "svt",
      niveau: "2ac",
      premium: false,
      duree: "38 min",
      youtube: "",
      pdf: "",
      chapitres: [
        { titre: "Découverte de la cellule", duree: "10 min" },
        { titre: "Cellule animale vs végétale", duree: "14 min" },
        { titre: "Division cellulaire", duree: "14 min" }
      ],
      progression: 100
    },
    {
      id: "c4",
      titre: "L'analyse grammaticale de phrase",
      description: "Identifier sujet, verbe, compléments et propositions.",
      matiere: "francais",
      niveau: "cm1",
      premium: false,
      duree: "30 min",
      youtube: "",
      pdf: "",
      chapitres: [
        { titre: "La phrase simple", duree: "10 min" },
        { titre: "Sujet et verbe", duree: "10 min" },
        { titre: "Les compléments", duree: "10 min" }
      ],
      progression: 20
    },
    {
      id: "c5",
      titre: "قواعد النحو والصرف",
      description: "أساسيات الإعراب والتمييز بين الأسماء والأفعال والحروف.",
      matiere: "arabe",
      niveau: "3ac",
      premium: true,
      duree: "40 min",
      youtube: "",
      pdf: "",
      chapitres: [
        { titre: "أقسام الكلام", duree: "12 min" },
        { titre: "الإعراب الأساسي", duree: "15 min" },
        { titre: "تطبيقات", duree: "13 min" }
      ],
      progression: 0
    },
    {
      id: "c6",
      titre: "Present Simple vs Present Continuous",
      description: "Master the difference between these two essential English tenses.",
      matiere: "anglais",
      niveau: "2ac",
      premium: false,
      duree: "25 min",
      youtube: "",
      pdf: "",
      chapitres: [
        { titre: "Present Simple", duree: "8 min" },
        { titre: "Present Continuous", duree: "8 min" },
        { titre: "Comparing both tenses", duree: "9 min" }
      ],
      progression: 0
    },
    {
      id: "c7",
      titre: "Introduction à la philosophie : la conscience",
      description: "Qu'est-ce que la conscience ? Approche philosophique pour le lycée.",
      matiere: "philosophie",
      niveau: "2bac",
      premium: true,
      duree: "50 min",
      youtube: "",
      pdf: "",
      chapitres: [
        { titre: "Définir la conscience", duree: "15 min" },
        { titre: "Conscience et inconscient", duree: "20 min" },
        { titre: "Débat philosophique", duree: "15 min" }
      ],
      progression: 0
    },
    {
      id: "c8",
      titre: "Le Maroc, géographie physique",
      description: "Relief, climat et grandes régions naturelles du Maroc.",
      matiere: "histoire-geo",
      niveau: "ce2",
      premium: false,
      duree: "28 min",
      youtube: "",
      pdf: "",
      chapitres: [
        { titre: "Le relief marocain", duree: "10 min" },
        { titre: "Le climat", duree: "9 min" },
        { titre: "Les régions naturelles", duree: "9 min" }
      ],
      progression: 0
    },
    {
      id: "c9",
      titre: "Algorithmique : les boucles",
      description: "Comprendre et écrire des boucles for et while en pseudo-code et Python.",
      matiere: "info",
      niveau: "tc",
      premium: false,
      duree: "42 min",
      youtube: "",
      pdf: "",
      chapitres: [
        { titre: "Qu'est-ce qu'une boucle ?", duree: "10 min" },
        { titre: "La boucle for", duree: "15 min" },
        { titre: "La boucle while", duree: "17 min" }
      ],
      progression: 40
    },
    {
      id: "c10",
      titre: "أركان الإسلام",
      description: "شرح مفصل لأركان الإسلام الخمسة وأهميتها في حياة المسلم.",
      matiere: "islamique",
      niveau: "cp",
      premium: false,
      duree: "22 min",
      youtube: "",
      pdf: "",
      chapitres: [
        { titre: "الشهادتان", duree: "6 min" },
        { titre: "الصلاة والزكاة", duree: "8 min" },
        { titre: "الصوم والحج", duree: "8 min" }
      ],
      progression: 0
    },
    {
      id: "c11",
      titre: "Je lis des syllabes et des sons",
      description: "Apprendre à reconnaître et assembler les sons simples pour bien lire.",
      matiere: "francais",
      niveau: "ce1",
      premium: false,
      duree: "20 min",
      youtube: "",
      pdf: "",
      chapitres: [
        { titre: "Les voyelles", duree: "6 min" },
        { titre: "Les syllabes simples", duree: "7 min" },
        { titre: "Je lis des mots", duree: "7 min" }
      ],
      progression: 0
    },
    {
      id: "c12",
      titre: "Les nombres décimaux",
      description: "Comprendre, comparer et calculer avec les nombres décimaux.",
      matiere: "maths",
      niveau: "cm2",
      premium: false,
      duree: "32 min",
      youtube: "",
      pdf: "",
      chapitres: [
        { titre: "Qu'est-ce qu'un nombre décimal ?", duree: "10 min" },
        { titre: "Comparer les décimaux", duree: "11 min" },
        { titre: "Additionner des décimaux", duree: "11 min" }
      ],
      progression: 0
    },
    {
      id: "c13",
      titre: "Les organes du corps humain",
      description: "Découvrir les grands organes et leur rôle dans le corps humain.",
      matiere: "svt",
      niveau: "6ap",
      premium: false,
      duree: "26 min",
      youtube: "",
      pdf: "",
      chapitres: [
        { titre: "Le squelette et les muscles", duree: "9 min" },
        { titre: "Le cœur et la respiration", duree: "9 min" },
        { titre: "La digestion", duree: "8 min" }
      ],
      progression: 0
    },
    {
      id: "c14",
      titre: "La dérivation et les fonctions numériques",
      description: "Notion de nombre dérivé, tangente et variations d'une fonction.",
      matiere: "maths",
      niveau: "1bac",
      premium: true,
      duree: "48 min",
      youtube: "",
      pdf: "",
      chapitres: [
        { titre: "Taux de variation", duree: "12 min" },
        { titre: "Le nombre dérivé", duree: "16 min" },
        { titre: "Tableau de variations", duree: "20 min" }
      ],
      progression: 0
    }
  ],

  /* =========================================================
     EXERCICES — un QCM corrigé par cours (donc par niveau),
     avec les questions déjà incluses pour que la correction
     automatique fonctionne immédiatement pour toutes les matières.
     ========================================================= */
  exercices: [
    {
      id: "e1", coursId: "c1", titre: "QCM - Les fractions", niveauDifficulte: "Facile",
      questions: [
        { q: "1/2 + 1/4 = ?", options: ["3/4", "2/6", "1/8", "2/4"], correct: 0, explication: "1/2 = 2/4, donc 2/4 + 1/4 = 3/4." },
        { q: "Simplifie 6/8.", options: ["3/4", "2/3", "6/8", "4/6"], correct: 0, explication: "On divise par 2 : 6÷2 = 3, 8÷2 = 4, soit 3/4." },
        { q: "L'inverse de 3/5 est :", options: ["5/3", "3/5", "-3/5", "1/5"], correct: 0, explication: "L'inverse d'une fraction a/b est b/a." }
      ]
    },
    {
      id: "e2", coursId: "c2", titre: "QCM - La réaction chimique", niveauDifficulte: "Moyen",
      questions: [
        { q: "Une réaction chimique conserve toujours :", options: ["La masse", "Le volume", "La couleur", "L'odeur"], correct: 0, explication: "La loi de Lavoisier : rien ne se perd, rien ne se crée." },
        { q: "Les réactifs sont :", options: ["Les substances de départ", "Les substances finales", "Les catalyseurs", "Les solvants"], correct: 0, explication: "Les réactifs se transforment en produits." },
        { q: "Équilibrer une équation signifie :", options: ["Avoir le même nombre d'atomes des deux côtés", "Avoir le même volume", "Avoir la même couleur", "Avoir la même masse molaire"], correct: 0, explication: "On ajuste les coefficients pour respecter la conservation des atomes." }
      ]
    },
    {
      id: "e3", coursId: "c3", titre: "QCM - La cellule", niveauDifficulte: "Moyen",
      questions: [
        { q: "Quelle est l'unité de base du vivant ?", options: ["La cellule", "L'atome", "L'organe", "Le tissu"], correct: 0, explication: "La cellule est l'unité fondamentale de tout être vivant." },
        { q: "Quel organite produit l'énergie cellulaire ?", options: ["La mitochondrie", "Le noyau", "La vacuole", "Le ribosome"], correct: 0, explication: "La mitochondrie est le siège de la respiration cellulaire." },
        { q: "Où se trouve l'ADN dans la cellule ?", options: ["Dans le noyau", "Dans la membrane", "Dans le cytoplasme", "Dans la paroi"], correct: 0, explication: "L'ADN est contenu dans le noyau cellulaire." }
      ]
    },
    {
      id: "e4", coursId: "c4", titre: "QCM - Analyse grammaticale", niveauDifficulte: "Facile",
      questions: [
        { q: "Dans 'Le chat dort.', le sujet est :", options: ["Le chat", "dort", "Le", "chat dort"], correct: 0, explication: "Le sujet fait l'action exprimée par le verbe." },
        { q: "Dans une phrase, le verbe exprime :", options: ["Une action ou un état", "Un lieu", "Une couleur", "Un nombre"], correct: 0, explication: "Le verbe est le noyau de la phrase, il exprime l'action ou l'état." },
        { q: "Un complément d'objet direct répond à la question :", options: ["Quoi ? / Qui ?", "Où ?", "Quand ?", "Comment ?"], correct: 0, explication: "Le COD répond à la question 'quoi' ou 'qui' posée après le verbe." }
      ]
    },
    {
      id: "e5", coursId: "c5", titre: "اختبار - النحو والصرف", niveauDifficulte: "Difficile",
      questions: [
        { q: "الكلمة تنقسم إلى:", options: ["اسم وفعل وحرف", "اسم وفعل فقط", "حرف وفعل فقط", "جملة وحرف"], correct: 0, explication: "أقسام الكلام في اللغة العربية ثلاثة: اسم، فعل، حرف." },
        { q: "الفعل المضارع يدل على:", options: ["الحال والاستقبال", "الماضي فقط", "الأمر فقط", "لا شيء"], correct: 0, explication: "الفعل المضارع يدل على حدث يقع في الحاضر أو المستقبل." },
        { q: "علامة رفع الاسم المفرد هي:", options: ["الضمة", "الفتحة", "الكسرة", "السكون"], correct: 0, explication: "الاسم المفرد يُرفع بالضمة الظاهرة." }
      ]
    },
    {
      id: "e6", coursId: "c6", titre: "QCM - Present Simple vs Continuous", niveauDifficulte: "Facile",
      questions: [
        { q: "She ___ to school every day.", options: ["goes", "is going", "go", "going"], correct: 0, explication: "Habitude régulière → Present Simple avec 's' à la 3e personne." },
        { q: "Look! It ___ now.", options: ["is raining", "rains", "rain", "rained"], correct: 0, explication: "Action en cours au moment où l'on parle → Present Continuous." },
        { q: "I ___ coffee every morning.", options: ["drink", "am drinking", "drinks", "drank"], correct: 0, explication: "Habitude → Present Simple, pas de 's' à la 1re personne." }
      ]
    },
    {
      id: "e7", coursId: "c7", titre: "QCM - La conscience", niveauDifficulte: "Difficile",
      questions: [
        { q: "La conscience désigne principalement :", options: ["La capacité à se connaître soi-même", "La capacité à courir vite", "Un organe du corps", "Une loi physique"], correct: 0, explication: "La conscience est la faculté de se représenter ses propres pensées et le monde." },
        { q: "L'inconscient a été théorisé notamment par :", options: ["Freud", "Newton", "Darwin", "Einstein"], correct: 0, explication: "Sigmund Freud a développé la théorie de l'inconscient en psychanalyse." },
        { q: "Un débat philosophique cherche avant tout à :", options: ["Confronter des arguments rationnels", "Trouver un vainqueur", "Réciter un cours", "Éviter la réflexion"], correct: 0, explication: "La philosophie avance par l'argumentation et la confrontation des idées." }
      ]
    },
    {
      id: "e8", coursId: "c8", titre: "QCM - Géographie du Maroc", niveauDifficulte: "Facile",
      questions: [
        { q: "La plus grande chaîne de montagnes du Maroc est :", options: ["L'Atlas", "Le Rif", "Les Andes", "Le Sahara"], correct: 0, explication: "La chaîne de l'Atlas traverse le Maroc du sud-ouest au nord-est." },
        { q: "Le climat du sud du Maroc est plutôt :", options: ["Désertique", "Polaire", "Tropical humide", "Équatorial"], correct: 0, explication: "Le sud marocain est bordé par le Sahara, au climat désertique." },
        { q: "Le Rif se situe :", options: ["Au nord du Maroc", "Au sud du Maroc", "À l'est du Maroc", "Au centre du Maroc"], correct: 0, explication: "La chaîne du Rif longe la côte méditerranéenne au nord." }
      ]
    },
    {
      id: "e9", coursId: "c9", titre: "QCM - Boucles en algorithmique", niveauDifficulte: "Difficile",
      questions: [
        { q: "Boucle pour répéter N fois :", options: ["for", "while", "if", "def"], correct: 0, explication: "La boucle for est conçue pour un nombre d'itérations connu." },
        { q: "Boucle tant qu'une condition est vraie :", options: ["while", "for", "switch", "class"], correct: 0, explication: "La boucle while tourne tant que la condition reste vraie." },
        { q: "Mot-clé pour définir une fonction en Python :", options: ["def", "fun", "function", "void"], correct: 0, explication: "En Python, on définit une fonction avec le mot-clé 'def'." }
      ]
    },
    {
      id: "e10", coursId: "c10", titre: "اختبار - أركان الإسلام", niveauDifficulte: "Facile",
      questions: [
        { q: "كم عدد أركان الإسلام؟", options: ["خمسة", "ثلاثة", "سبعة", "عشرة"], correct: 0, explication: "أركان الإسلام خمسة: الشهادتان، الصلاة، الزكاة، الصوم، الحج." },
        { q: "الركن الأول من أركان الإسلام هو:", options: ["الشهادتان", "الصلاة", "الصوم", "الحج"], correct: 0, explication: "الشهادتان هما أساس الدخول في الإسلام." },
        { q: "الزكاة تكون على:", options: ["المال", "الجسد", "الوقت", "العقل"], correct: 0, explication: "الزكاة هي إخراج جزء من المال لمستحقيه." }
      ]
    },
    {
      id: "e11", coursId: "c11", titre: "QCM - Sons et syllabes", niveauDifficulte: "Facile",
      questions: [
        { q: "Combien de syllabes dans 'ba-na-ne' ?", options: ["3", "2", "4", "1"], correct: 0, explication: "On découpe : ba / na / ne, soit 3 syllabes." },
        { q: "Quelle lettre est une voyelle ?", options: ["a", "b", "c", "d"], correct: 0, explication: "Les voyelles sont a, e, i, o, u, y." },
        { q: "Le mot 'chat' commence par le son :", options: ["ch", "s", "t", "a"], correct: 0, explication: "Le son 'ch' se prononce comme dans 'chapeau'." }
      ]
    },
    {
      id: "e12", coursId: "c12", titre: "QCM - Nombres décimaux", niveauDifficulte: "Moyen",
      questions: [
        { q: "Dans 3,25 la partie décimale est :", options: ["25", "3", "325", "0"], correct: 0, explication: "Après la virgule, on trouve la partie décimale : 25." },
        { q: "3,5 + 1,2 = ?", options: ["4,7", "4,5", "3,7", "5,7"], correct: 0, explication: "On additionne les parties entières puis décimales : 3,5 + 1,2 = 4,7." },
        { q: "Le plus grand nombre est :", options: ["2,8", "2,45", "2,08", "2,5"], correct: 0, explication: "2,8 est plus grand car son chiffre des dixièmes (8) est le plus élevé." }
      ]
    },
    {
      id: "e13", coursId: "c13", titre: "QCM - Le corps humain", niveauDifficulte: "Facile",
      questions: [
        { q: "L'organe qui fait circuler le sang est :", options: ["Le cœur", "Le poumon", "L'estomac", "Le foie"], correct: 0, explication: "Le cœur pompe le sang dans tout le corps." },
        { q: "Les poumons servent à :", options: ["Respirer", "Digérer", "Marcher", "Voir"], correct: 0, explication: "Les poumons permettent les échanges d'oxygène et de gaz carbonique." },
        { q: "Le squelette est composé de :", options: ["Os", "Muscles", "Sang", "Peau"], correct: 0, explication: "Le squelette est l'ensemble des os du corps." }
      ]
    },
    {
      id: "e14", coursId: "c14", titre: "QCM - Dérivation", niveauDifficulte: "Difficile",
      questions: [
        { q: "Le nombre dérivé de f en a mesure :", options: ["La pente de la tangente en a", "L'aire sous la courbe", "La valeur de f en a", "La limite de f à l'infini"], correct: 0, explication: "f'(a) représente le coefficient directeur de la tangente au point a." },
        { q: "La dérivée de f(x) = x² est :", options: ["2x", "x", "2", "x²"], correct: 0, explication: "La règle de dérivation donne (xⁿ)' = n·xⁿ⁻¹, donc (x²)' = 2x." },
        { q: "Si f'(x) > 0 sur un intervalle, alors f est :", options: ["Croissante", "Décroissante", "Constante", "Négative"], correct: 0, explication: "Une dérivée positive indique que la fonction est croissante." }
      ]
    }
  ],

  /* =========================================================
     EXAMENS — un examen blanc chronométré par niveau (CP → 2ème Bac),
     avec les questions déjà incluses pour que la correction
     automatique fonctionne immédiatement pour tous les niveaux.
     ========================================================= */
  examens: [
    {
      id: "ex1", titre: "Examen blanc - Mathématiques (CP)", matiere: "maths", niveau: "cp", duree: 15, premium: false,
      questions: [
        { q: "2 + 3 = ?", options: ["5", "4", "6", "3"], correct: 0 },
        { q: "5 - 2 = ?", options: ["3", "2", "4", "1"], correct: 0 },
        { q: "Combien font 1 + 1 ?", options: ["2", "1", "3", "0"], correct: 0 }
      ]
    },
    {
      id: "ex2", titre: "Examen blanc - Français (CE1)", matiere: "francais", niveau: "ce1", duree: 20, premium: false,
      questions: [
        { q: "'Papa' contient combien de syllabes ?", options: ["2", "1", "3", "4"], correct: 0 },
        { q: "Quel mot rime avec 'chat' ?", options: ["rat", "chien", "table", "livre"], correct: 0 },
        { q: "La lettre 'o' est :", options: ["Une voyelle", "Une consonne", "Un chiffre", "Un signe"], correct: 0 }
      ]
    },
    {
      id: "ex3", titre: "Examen blanc - Mathématiques (CE2)", matiere: "maths", niveau: "ce2", duree: 25, premium: false,
      questions: [
        { q: "6 × 3 = ?", options: ["18", "16", "21", "9"], correct: 0 },
        { q: "20 ÷ 4 = ?", options: ["5", "4", "6", "8"], correct: 0 },
        { q: "Le double de 7 est :", options: ["14", "12", "16", "9"], correct: 0 }
      ]
    },
    {
      id: "ex4", titre: "Examen blanc - Français (CM1)", matiere: "francais", niveau: "cm1", duree: 30, premium: false,
      questions: [
        { q: "Dans 'Le chien court.', le verbe est :", options: ["court", "chien", "Le", "chien court"], correct: 0 },
        { q: "'Les enfants jouent.' : le sujet est :", options: ["Les enfants", "jouent", "Les", "enfants jouent"], correct: 0 },
        { q: "Un nom commun désigne :", options: ["Une chose ou un être en général", "Toujours une personne précise", "Une couleur", "Un chiffre"], correct: 0 }
      ]
    },
    {
      id: "ex5", titre: "Examen blanc - Mathématiques (CM2)", matiere: "maths", niveau: "cm2", duree: 35, premium: false,
      questions: [
        { q: "4,5 + 2,3 = ?", options: ["6,8", "6,5", "7,8", "6,3"], correct: 0 },
        { q: "Le plus petit nombre est :", options: ["1,09", "1,9", "1,90", "1,99"], correct: 0 },
        { q: "10,0 - 3,4 = ?", options: ["6,6", "7,6", "6,4", "7,4"], correct: 0 }
      ]
    },
    {
      id: "ex6", titre: "Examen blanc - SVT (6ème Primaire)", matiere: "svt", niveau: "6ap", duree: 30, premium: false,
      questions: [
        { q: "L'organe qui pompe le sang est :", options: ["Le cœur", "Le foie", "L'estomac", "Le rein"], correct: 0 },
        { q: "On respire grâce :", options: ["Aux poumons", "Au cœur", "Au foie", "Aux muscles"], correct: 0 },
        { q: "Les os forment :", options: ["Le squelette", "Le sang", "La peau", "L'air"], correct: 0 }
      ]
    },
    {
      id: "ex7", titre: "Examen blanc - Mathématiques (1ère Année Collège)", matiere: "maths", niveau: "1ac", duree: 45, premium: false,
      questions: [
        { q: "1/2 + 1/3 = ?", options: ["5/6", "2/5", "1/6", "3/5"], correct: 0 },
        { q: "3/4 de 12 = ?", options: ["9", "8", "6", "4"], correct: 0 },
        { q: "Simplifie 8/12.", options: ["2/3", "4/6", "1/2", "3/4"], correct: 0 },
        { q: "5/10 est égal à :", options: ["1/2", "1/5", "2/5", "5/2"], correct: 0 }
      ]
    },
    {
      id: "ex8", titre: "Examen blanc - SVT (2ème Année Collège)", matiere: "svt", niveau: "2ac", duree: 40, premium: false,
      questions: [
        { q: "L'unité de base du vivant est :", options: ["La cellule", "L'organe", "Le tissu", "L'atome"], correct: 0 },
        { q: "La mitochondrie produit :", options: ["De l'énergie", "De l'ADN", "Du sucre", "De l'eau"], correct: 0 },
        { q: "La paroi cellulaire se trouve chez :", options: ["Les cellules végétales", "Les cellules animales", "Les deux", "Aucune"], correct: 0 }
      ]
    },
    {
      id: "ex9", titre: "امتحان تجريبي - اللغة العربية (الثالثة إعدادي)", matiere: "arabe", niveau: "3ac", duree: 50, premium: true,
      questions: [
        { q: "الاسم المرفوع علامته:", options: ["الضمة", "الفتحة", "الكسرة", "السكون"], correct: 0 },
        { q: "الفعل الماضي يدل على:", options: ["حدث وقع في الزمن الماضي", "حدث في المستقبل", "حدث حالي", "لا شيء"], correct: 0 },
        { q: "من حروف الجر:", options: ["في", "قد", "لن", "لم"], correct: 0 }
      ]
    },
    {
      id: "ex10", titre: "Examen blanc - Physique-Chimie (Tronc Commun)", matiere: "physique", niveau: "tc", duree: 60, premium: true,
      questions: [
        { q: "Unité de la force :", options: ["Newton", "Watt", "Joule", "Volt"], correct: 0 },
        { q: "Une réaction chimique conserve : ", options: ["La masse", "Le volume", "La chaleur", "La couleur"], correct: 0 },
        { q: "Symbole de l'oxygène :", options: ["O", "H", "N", "C"], correct: 0 },
        { q: "Le réactif limitant est celui qui :", options: ["Est entièrement consommé en premier", "Reste en excès", "N'intervient pas", "Change de couleur"], correct: 0 }
      ]
    },
    {
      id: "ex11", titre: "Examen blanc - Mathématiques (1ère Bac)", matiere: "maths", niveau: "1bac", duree: 60, premium: true,
      questions: [
        { q: "La dérivée de f(x) = 3x + 2 est :", options: ["3", "3x", "2", "0"], correct: 0 },
        { q: "Si f'(x) > 0, f est :", options: ["Croissante", "Décroissante", "Constante", "Nulle"], correct: 0 },
        { q: "Le nombre dérivé en a correspond à :", options: ["La pente de la tangente", "L'aire sous la courbe", "La valeur en a", "Une constante"], correct: 0 }
      ]
    },
    {
      id: "ex12", titre: "Examen blanc - Philosophie (2ème Bac)", matiere: "philosophie", niveau: "2bac", duree: 90, premium: true,
      questions: [
        { q: "La conscience permet essentiellement de :", options: ["Se connaître soi-même", "Courir vite", "Digérer", "Voir loin"], correct: 0 },
        { q: "L'inconscient a été théorisé par :", options: ["Freud", "Newton", "Darwin", "Einstein"], correct: 0 },
        { q: "Un argument philosophique doit être :", options: ["Rationnel et justifié", "Basé sur l'émotion seule", "Toujours court", "Sans exemple"], correct: 0 }
      ]
    }
  ]
};