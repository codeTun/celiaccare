import type { ContentSection } from "@/components/content/types";
import type { Locale } from "@/types";

/* ==========================================================================
   The gluten-free guide (/guide-sans-gluten), in French and in Arabic.
   General information only — never medical advice (the page shows a
   disclaimer). Block types: components/content/types.ts.
   Keep the same section ids in both languages (anchors of the page).
   ========================================================================== */

/** Date of the last review of the guide (shown on the page and in the JSON-LD). */
export const GUIDE_UPDATED_AT = "2026-11-15";

export const guide: Record<Locale, ContentSection[]> = {
  fr: [
    {
      id: "maladie-coeliaque",
      title: "La maladie cœliaque, c'est quoi ?",
      blocks: [
        {
          type: "paragraph",
          text: "La maladie cœliaque est une **maladie auto-immune**. Chez les personnes concernées, le **gluten** — une protéine présente dans le blé, l'orge et le seigle — déclenche une réaction du système immunitaire qui abîme la paroi de l'intestin grêle. Les nutriments sont alors moins bien absorbés.",
        },
        {
          type: "paragraph",
          text: "Elle peut apparaître à tout âge et ses signes sont très variables : troubles digestifs, fatigue, anémie, perte de poids, retard de croissance chez l'enfant… et parfois aucun symptôme visible. **Seul un médecin peut poser le diagnostic**, le plus souvent grâce à une prise de sang puis une biopsie de l'intestin. Il est généralement conseillé de ne pas supprimer le gluten avant la fin des examens, car cela peut fausser les résultats : parlez-en d'abord à votre médecin.",
        },
        {
          type: "paragraph",
          text: "À ce jour, le seul traitement reconnu est un **régime strict sans gluten, à vie**. Même de petites quantités, comme quelques miettes, peuvent suffire à entretenir l'inflammation : d'où l'importance d'éviter la contamination croisée.",
        },
        {
          type: "paragraph",
          text: "La maladie cœliaque est différente de la **sensibilité au gluten non cœliaque** et de l'**allergie au blé**. Ces situations se ressemblent mais ne se prennent pas en charge de la même façon : là encore, le diagnostic revient à un professionnel de santé.",
        },
        {
          type: "callout",
          tone: "takeaway",
          items: [
            "Une maladie auto-immune déclenchée par le gluten, et non une simple préférence alimentaire.",
            "Le diagnostic se fait chez le médecin, avant tout changement d'alimentation.",
            "Le traitement : un régime sans gluten strict, sans « petite exception ».",
          ],
        },
      ],
    },
    {
      id: "cereales-a-eviter",
      title: "Les céréales qui contiennent du gluten",
      blocks: [
        {
          type: "paragraph",
          text: "Le gluten se trouve dans plusieurs céréales et dans tout ce qui en est fait : farines, semoules, flocons, pains, pâtes, biscuits, chapelures, sauces liées à la farine…",
        },
        {
          type: "foods",
          tone: "avoid",
          title: "À éviter : elles contiennent du gluten",
          items: [
            { name: "Blé (tendre et dur)", note: "farine, semoule, boulgour, frik" },
            { name: "Orge", note: "y compris le malt d'orge" },
            { name: "Seigle", note: "pains et biscuits de seigle" },
            { name: "Épeautre", note: "une variété ancienne de blé" },
            { name: "Kamut", note: "blé de Khorasan" },
            { name: "Triticale", note: "un croisement de blé et de seigle" },
            { name: "Avoine non certifiée", note: "très souvent contaminée par le blé" },
          ],
        },
        { type: "subheading", text: "Le malt, un piège fréquent" },
        {
          type: "paragraph",
          text: "Le **malt** (extrait de malt, sirop de malt, arôme de malt) est presque toujours tiré de l'orge. On le trouve dans des céréales du petit-déjeuner, des biscuits, des boissons maltées et dans la bière, qui contient donc du gluten sauf mention « sans gluten ».",
        },
        { type: "subheading", text: "Et l'avoine ?" },
        {
          type: "paragraph",
          text: "L'avoine est un cas à part : elle est très souvent contaminée par le blé dans les champs, les moulins ou les usines. Seule l'**avoine certifiée sans gluten** convient à la plupart des personnes cœliaques, et certaines la tolèrent mal malgré tout. Demandez conseil à votre médecin avant de l'introduire.",
        },
        {
          type: "callout",
          tone: "takeaway",
          items: [
            "Retenez le trio **blé, orge, seigle**, et tous leurs dérivés.",
            "Le **malt** vient de l'orge : il contient du gluten.",
            "Un doute sur un ingrédient ? Mieux vaut s'abstenir et demander.",
          ],
        },
      ],
    },
    {
      id: "cuisine-tunisienne",
      title: "Dans la cuisine tunisienne",
      blocks: [
        {
          type: "paragraph",
          text: "Notre cuisine fait la part belle à la semoule de blé dur. Bonne nouvelle : beaucoup de plats existent en version sans gluten, et d'autres le sont naturellement. Voici les plus courants.",
        },
        {
          type: "dishes",
          items: [
            {
              name: "Couscous de blé",
              verdict: "avoid",
              note: "Préparé avec de la semoule de blé dur. Il existe d'excellents couscous de maïs, de riz ou de sorgho.",
            },
            {
              name: "Chorba frik",
              verdict: "avoid",
              note: "Le frik est du blé vert concassé : la chorba frik contient donc du gluten.",
            },
            {
              name: "Lablabi",
              verdict: "avoid",
              note: "Le bouillon de pois chiches est versé sur du pain rassis émietté.",
            },
            {
              name: "Brik et malsouka",
              verdict: "avoid",
              note: "Les feuilles de malsouka sont faites de semoule et de farine de blé. Les feuilles de riz les remplacent bien.",
            },
            {
              name: "Bsissa traditionnelle",
              verdict: "avoid",
              note: "Souvent à base d'orge ou de blé grillés. Certains artisans la préparent avec des céréales sans gluten : vérifiez la composition.",
            },
            {
              name: "Pains et pâtisseries à la semoule",
              verdict: "avoid",
              note: "Tabouna, mlawi, makroudh, samsa, baklawa… Des versions sans gluten existent chez des artisans spécialisés.",
            },
            {
              name: "Mloukhia",
              verdict: "ok",
              note: "Poudre de corète, huile d'olive, viande et épices : naturellement sans gluten.",
            },
            {
              name: "Salade méchouia",
              verdict: "ok",
              note: "Poivrons et tomates grillés, ail et huile d'olive : naturellement sans gluten.",
            },
            {
              name: "Harissa",
              verdict: "check",
              note: "La harissa maison (piments, ail, épices, huile) est sans gluten. Pour les pots et les tubes du commerce, lisez l'étiquette : certains additifs peuvent en contenir.",
            },
            {
              name: "Riz djerbien",
              verdict: "check",
              note: "Le riz est sans gluten, mais il est souvent cuit à la vapeur dans un couscoussier qui a servi au couscous de blé.",
            },
            {
              name: "Crème de droô (sorgho)",
              verdict: "check",
              note: "Le sorgho est naturellement sans gluten, mais certains mélanges ou recettes ajoutent de la farine : demandez ou lisez l'étiquette.",
            },
          ],
        },
        {
          type: "callout",
          tone: "tip",
          title: "Les bons remplacements",
          items: [
            "**Couscous** : semoule de maïs, de riz, de sorgho (droô) ou de millet.",
            "**Feuilles de brik** : feuilles de riz.",
            "**Chapelure** : poudre d'amande, farine de pois chiches ou chapelure sans gluten.",
            "**Pour lier une sauce** : fécule de maïs ou de pomme de terre.",
          ],
        },
      ],
    },
    {
      id: "aliments-sans-gluten",
      title: "Les aliments naturellement sans gluten",
      blocks: [
        {
          type: "paragraph",
          text: "La plupart des produits frais et bruts sont naturellement sans gluten : une alimentation variée et gourmande reste tout à fait possible.",
        },
        {
          type: "foods",
          tone: "ok",
          title: "Céréales et féculents",
          items: [
            { name: "Riz" },
            { name: "Maïs" },
            { name: "Sorgho (droô)" },
            { name: "Millet" },
            { name: "Sarrasin" },
            { name: "Quinoa" },
            { name: "Pommes de terre" },
            { name: "Patates douces" },
          ],
        },
        {
          type: "foods",
          tone: "ok",
          title: "Légumineuses",
          items: [{ name: "Pois chiches" }, { name: "Lentilles" }, { name: "Fèves" }, { name: "Haricots" }, { name: "Petits pois" }],
        },
        {
          type: "foods",
          tone: "ok",
          title: "Produits frais",
          items: [
            { name: "Fruits et légumes" },
            { name: "Viandes et volailles" },
            { name: "Poissons" },
            { name: "Œufs" },
            { name: "Lait, lben, raïb et fromages nature" },
            { name: "Huile d'olive" },
            { name: "Dattes" },
            { name: "Fruits secs nature" },
            { name: "Miel" },
          ],
        },
        {
          type: "paragraph",
          text: "Attention : « naturellement sans gluten » ne veut pas dire « sans risque ». Ces aliments peuvent être contaminés pendant leur transformation : farine de pois chiches moulue dans un moulin à blé, épices vendues en vrac, viandes marinées ou panées, charcuterie…",
        },
        {
          type: "callout",
          tone: "takeaway",
          items: [
            "Privilégiez les produits bruts et préparez vous-même vos mélanges d'épices.",
            "Méfiez-vous des produits transformés : sauces, bouillons cubes, charcuterie, épices moulues.",
          ],
        },
      ],
    },
    {
      id: "contamination-croisee",
      title: "La contamination croisée",
      blocks: [
        {
          type: "paragraph",
          text: "Quelques miettes suffisent : un aliment sans gluten peut être contaminé au contact d'une surface, d'un ustensile, d'une huile de friture ou même de la farine en suspension dans l'air. C'est la cause la plus fréquente d'exposition involontaire au gluten.",
        },
        {
          type: "cards",
          items: [
            {
              icon: "home",
              title: "À la maison",
              items: [
                "Gardez un **couscoussier réservé** au sans gluten : le tamis et le tissu retiennent la semoule de blé.",
                "Un grille-pain, une planche et des ustensiles en bois **dédiés** : le bois et les rayures retiennent les miettes.",
                "Préparez d'abord le repas sans gluten, couvrez-le, puis cuisinez le reste.",
                "Évitez de fariner un plan de travail commun : la farine reste longtemps dans l'air.",
                "Des pots séparés pour le beurre, la confiture ou les pâtes à tartiner.",
                "Rangez les produits sans gluten en hauteur, dans des boîtes fermées et étiquetées.",
              ],
            },
            {
              icon: "restaurant",
              title: "Au restaurant",
              items: [
                "**Friteuse partagée** : des frites cuites dans l'huile des beignets ou des produits panés ne sont plus sans gluten.",
                "**Grill et plancha** : demandez une cuisson sur une surface propre ou sur du papier cuisson.",
                "**Eau de cuisson** : le riz et les légumes ne doivent pas cuire dans l'eau des pâtes.",
                "**Sauces et marinades** : elles sont souvent liées à la farine ou contiennent de la sauce soja, faite avec du blé.",
                "**Pain sur la table** : demandez qu'il ne soit pas servi près de votre assiette.",
              ],
            },
          ],
        },
        {
          type: "callout",
          tone: "warning",
          text: "Un plat sans ingrédient à gluten, préparé dans une cuisine où l'on travaille la farine, peut contenir des traces. C'est pourquoi CeliacCare ne référence que des commerces **100\u00a0% sans gluten** : ateliers et cuisines où la farine de blé n'entre jamais.",
        },
      ],
    },
    {
      id: "lire-les-etiquettes",
      title: "Bien lire les étiquettes",
      blocks: [
        {
          type: "paragraph",
          text: "Prenez l'habitude de lire la liste d'ingrédients **à chaque achat**, même pour un produit que vous connaissez : les recettes changent sans prévenir.",
        },
        {
          type: "list",
          style: "steps",
          items: [
            "**Repérez les allergènes mis en évidence** : dans la liste d'ingrédients, les céréales à gluten (blé, orge, seigle, avoine, épeautre…) sont souvent écrites en gras, en majuscules ou soulignées.",
            "**Traquez les mots qui cachent du gluten** : farine, semoule, chapelure, amidon de blé, malt, extrait ou sirop de malt, protéines de blé, boulgour, frik.",
            "**Lisez la mention « peut contenir »** : « peut contenir des traces de blé » ou « fabriqué dans un atelier qui utilise du gluten » signale un risque de contamination croisée. La plupart des personnes cœliaques évitent ces produits.",
            "**Cherchez les logos fiables** : l'épi de blé barré ou une mention « sans gluten » certifiée indiquent un produit qui respecte le seuil international de 20 mg de gluten par kilo (20 ppm).",
            "**En cas de doute, abstenez-vous.** Pour un produit vendu sur CeliacCare, [posez-nous la question](/contact) : nous interrogeons le fabricant pour vous.",
          ],
        },
        {
          type: "labelExample",
          title: "Exemple : des galettes de riz… pas si innocentes",
          product: "Galettes de riz soufflé",
          ingredients: "Ingrédients : riz complet (96 %), huile de tournesol, **extrait de malt d'orge**, sel.",
          traces: "Peut contenir des traces de **blé** et de sésame.",
          notes: [
            "Le riz est naturellement sans gluten…",
            "…mais l'**extrait de malt d'orge** en contient.",
            "La mention « peut contenir des traces de blé » signale en plus un risque de contamination croisée.",
          ],
          verdict: "Verdict : à éviter dans un régime sans gluten.",
        },
        {
          type: "callout",
          tone: "takeaway",
          items: [
            "Lisez l'étiquette à chaque achat.",
            "« Peut contenir des traces de blé » : à éviter si vous êtes cœliaque.",
            "Pas d'étiquette (vrac, marché, fait maison) ? Demandez la composition et la façon dont le produit est préparé.",
          ],
        },
      ],
    },
    {
      id: "manger-dehors",
      title: "Manger au restaurant en Tunisie",
      blocks: [
        {
          type: "paragraph",
          text: "Au restaurant, au café ou chez des proches, le plus sûr est d'expliquer simplement votre situation. Le gluten reste mal connu : quelques questions précises font toute la différence.",
        },
        { type: "subheading", text: "Les questions à poser" },
        {
          type: "list",
          style: "questions",
          items: [
            "Ce plat contient-il de la farine, de la semoule ou du pain, même en petite quantité ?",
            "La sauce est-elle liée avec de la farine ? Utilisez-vous des bouillons cubes ?",
            "Les frites sont-elles cuites dans une friteuse à part ?",
            "Le riz ou les légumes sont-ils cuits à la vapeur dans le couscoussier ?",
            "Pouvez-vous préparer mon plat sur un plan de travail propre, avec des ustensiles propres ?",
          ],
        },
        {
          type: "phrasebook",
          title: "La phrase à montrer en cuisine",
          note: "Enregistrez-la sur votre téléphone, dans les deux langues.",
          phrases: [
            {
              lang: "fr",
              text: "Je suis atteint(e) de la maladie cœliaque : je ne peux manger ni blé, ni orge, ni seigle, ni semoule, ni farine, ni pain, même en très petite quantité. Pouvez-vous préparer mon plat avec des ustensiles propres ?",
            },
            {
              lang: "ar",
              text: "أنا مصاب بمرض السيلياك: لا يمكنني أكل القمح أو الشعير أو السميد أو الدقيق (الفارينة) أو الخبز، ولو بكمية صغيرة جدًا. هل يمكن تحضير طبقي بأدوات نظيفة؟",
            },
          ],
        },
        {
          type: "callout",
          tone: "tip",
          title: "Nos conseils",
          items: [
            "Allez-y de préférence en dehors des heures de pointe : l'équipe en cuisine a plus de temps pour préparer votre plat avec soin.",
            "Parlez de **maladie cœliaque** plutôt que de « régime » : c'est une raison médicale, pas une préférence.",
            "Sur CeliacCare, chaque restaurant affiche ses **pratiques de préparation** (cuisine séparée, ustensiles dédiés, personnel formé) et son niveau de garantie : [voir les restaurants partenaires](/restaurants).",
          ],
        },
      ],
    },
    {
      id: "nos-garanties",
      title: "Nos niveaux de garantie",
      blocks: [
        {
          type: "paragraph",
          text: "CeliacCare ne référence que des commerces **100\u00a0% sans gluten**. Chaque produit, artisan et restaurant affiche son niveau de garantie, la **source** de l'information (certificat, site officiel, réseaux sociaux, étiquette, presse…) et sa **date de vérification**. Une fiche qui n'a pas été revérifiée depuis plus de 12 mois est signalée et remise en révision.",
        },
        {
          type: "guarantees",
          advice: {
            CERTIFIED: "Le choix le plus sûr : un organisme officiel contrôle le produit ou l'établissement.",
            DEDICATED:
              "Aucune farine de blé dans l'atelier ou la cuisine, mais pas de contrôle officiel : en cas de doute, posez-nous vos questions (nous interrogeons le commerce pour vous) et lisez l'étiquette.",
          },
        },
        {
          type: "paragraph",
          text: "Vous constatez une erreur ? Chaque fiche propose un bouton **« Signaler une erreur »** et notre équipe vérifie chaque signalement. Pour en savoir plus, consultez notre [FAQ](/faq) ou [notre démarche](/a-propos).",
        },
      ],
    },
  ],

  ar: [
    {
      id: "maladie-coeliaque",
      title: "ما هو مرض السيلياك؟",
      blocks: [
        {
          type: "paragraph",
          text: "مرض السيلياك (الداء البطني) **مرض مناعي ذاتي**. لدى المصابين به، يثير **الغلوتين** — وهو بروتين موجود في القمح والشعير والجاودار — ردّ فعل لدى الجهاز المناعي يُتلف جدار الأمعاء الدقيقة، فيقلّ امتصاص العناصر الغذائية.",
        },
        {
          type: "paragraph",
          text: "قد يظهر في أي سنّ، وأعراضه متنوّعة جدًا: اضطرابات هضمية، تعب، فقر دم، نقص في الوزن، تأخّر في النمو لدى الأطفال… وأحيانًا لا تظهر أي أعراض. **وحده الطبيب يستطيع تشخيص المرض**، غالبًا بتحليل دم ثم خزعة من الأمعاء. ويُنصح عادةً بعدم التوقف عن تناول الغلوتين قبل انتهاء الفحوصات لأن ذلك قد يُفسد نتائجها: تحدّث أولًا مع طبيبك.",
        },
        {
          type: "paragraph",
          text: "إلى اليوم، العلاج الوحيد المعترف به هو **حمية صارمة خالية من الغلوتين مدى الحياة**. فحتى الكميات الصغيرة، مثل بعض الفتات، قد تكفي لإبقاء الالتهاب، ومن هنا أهمية تجنّب التلوث المتبادل.",
        },
        {
          type: "paragraph",
          text: "يختلف مرض السيلياك عن **الحساسية للغلوتين غير السيلياكية** وعن **حساسية القمح**. تتشابه هذه الحالات لكنها لا تُعالج بالطريقة نفسها، والتشخيص هنا أيضًا من اختصاص أهل الطب.",
        },
        {
          type: "callout",
          tone: "takeaway",
          items: [
            "مرض مناعي ذاتي يثيره الغلوتين، وليس مجرد تفضيل غذائي.",
            "يتم التشخيص عند الطبيب، قبل أي تغيير في النظام الغذائي.",
            "العلاج: حمية صارمة خالية من الغلوتين، دون أي «استثناء صغير».",
          ],
        },
      ],
    },
    {
      id: "cereales-a-eviter",
      title: "الحبوب التي تحتوي على الغلوتين",
      blocks: [
        {
          type: "paragraph",
          text: "يوجد الغلوتين في عدة حبوب وفي كل ما يُصنع منها: الدقيق، السميد، الرقائق، الخبز، العجين، البسكويت، فتات الخبز، والصلصات المكثّفة بالدقيق…",
        },
        {
          type: "foods",
          tone: "avoid",
          title: "يجب تجنّبها: تحتوي على الغلوتين",
          items: [
            { name: "القمح (اللين والصلب)", note: "الدقيق، السميد، البرغل، الفريك" },
            { name: "الشعير", note: "بما في ذلك الشعير المُنبَّت (المالت)" },
            { name: "الجاودار (الشيلم)", note: "خبزه وبسكويته" },
            { name: "الحنطة الإسبانية (السبلت)", note: "صنف قديم من القمح" },
            { name: "الكاموت", note: "قمح خراسان" },
            { name: "التريتيكال", note: "هجين من القمح والجاودار" },
            { name: "الشوفان غير المعتمد", note: "كثيرًا ما يكون ملوّثًا بالقمح" },
          ],
        },
        { type: "subheading", text: "المالت، فخّ شائع" },
        {
          type: "paragraph",
          text: "يُستخرج **المالت** (مستخلص المالت، شراب المالت، نكهة المالت) في الغالب من الشعير. ونجده في بعض حبوب الإفطار والبسكويت والمشروبات المصنوعة من الشعير وفي الجعة، التي تحتوي إذن على الغلوتين ما لم يُذكر خلاف ذلك.",
        },
        { type: "subheading", text: "وماذا عن الشوفان؟" },
        {
          type: "paragraph",
          text: "الشوفان حالة خاصة: فهو كثيرًا ما يتلوّث بالقمح في الحقول أو المطاحن أو المصانع. ولا يناسب أغلب مرضى السيلياك إلا **الشوفان المعتمد خاليًا من الغلوتين**، وبعضهم لا يتحمّله رغم ذلك. استشر طبيبك قبل إدخاله إلى نظامك الغذائي.",
        },
        {
          type: "callout",
          tone: "takeaway",
          items: [
            "تذكّر الثلاثي: **القمح والشعير والجاودار**، وكل مشتقاتها.",
            "**المالت** مصدره الشعير، فهو يحتوي على الغلوتين.",
            "هل لديك شكّ في مكوّن ما؟ من الأفضل الامتناع والسؤال.",
          ],
        },
      ],
    },
    {
      id: "cuisine-tunisienne",
      title: "في المطبخ التونسي",
      blocks: [
        {
          type: "paragraph",
          text: "يعتمد مطبخنا كثيرًا على سميد القمح الصلب. والخبر السار أن أطباقًا عديدة لها نسخ خالية من الغلوتين، وأن أطباقًا أخرى خالية منه بطبيعتها. إليك أكثرها شيوعًا.",
        },
        {
          type: "dishes",
          items: [
            {
              name: "كسكسي القمح",
              verdict: "avoid",
              note: "يُحضَّر بسميد القمح الصلب. وتوجد أنواع ممتازة من كسكسي الذرة أو الأرز أو الدرع.",
            },
            {
              name: "شربة فريك",
              verdict: "avoid",
              note: "الفريك قمح أخضر مجروش، لذلك تحتوي شربة الفريك على الغلوتين.",
            },
            {
              name: "اللبلابي",
              verdict: "avoid",
              note: "يُسكب مرق الحمّص على خبز يابس مفتّت.",
            },
            {
              name: "البريك والملسوقة",
              verdict: "avoid",
              note: "تُصنع أوراق الملسوقة من السميد ودقيق القمح. ويمكن تعويضها بأوراق الأرز.",
            },
            {
              name: "البسيسة التقليدية",
              verdict: "avoid",
              note: "تُحضَّر غالبًا من الشعير أو القمح المحمّص. يعدّها بعض الحرفيين بحبوب خالية من الغلوتين: تحقّق من تركيبتها.",
            },
            {
              name: "الخبز والحلويات بالسميد",
              verdict: "avoid",
              note: "خبز الطابونة، الملاوي، المقروض، الصامصة، البقلاوة… وتوجد نسخ خالية من الغلوتين لدى حرفيين مختصّين.",
            },
            {
              name: "الملوخية",
              verdict: "ok",
              note: "مسحوق الملوخية، زيت الزيتون، اللحم والتوابل: خالية من الغلوتين بطبيعتها.",
            },
            {
              name: "السلطة المشوية",
              verdict: "ok",
              note: "فلفل وطماطم مشويان، ثوم وزيت زيتون: خالية من الغلوتين بطبيعتها.",
            },
            {
              name: "الهريسة",
              verdict: "check",
              note: "الهريسة المنزلية (فلفل، ثوم، توابل، زيت) خالية من الغلوتين. أما الهريسة المعلّبة فاقرأ ملصقها، فبعض الإضافات قد تحتوي عليه.",
            },
            {
              name: "الرز الجربي",
              verdict: "check",
              note: "الأرز خالٍ من الغلوتين، لكنه يُطهى غالبًا على البخار في كسكاس استُعمل لكسكسي القمح.",
            },
            {
              name: "عصيدة الدرع",
              verdict: "check",
              note: "الدرع (الذرة البيضاء) خالٍ من الغلوتين بطبيعته، لكن بعض الخلطات أو الوصفات تضيف الدقيق: اسأل أو اقرأ الملصق.",
            },
          ],
        },
        {
          type: "callout",
          tone: "tip",
          title: "بدائل موفّقة",
          items: [
            "**الكسكسي**: سميد الذرة أو الأرز أو الدرع أو الدخن.",
            "**أوراق البريك**: أوراق الأرز.",
            "**فتات الخبز**: مسحوق اللوز أو دقيق الحمّص أو فتات خبز خالٍ من الغلوتين.",
            "**لتكثيف الصلصة**: نشا الذرة أو نشا البطاطا.",
          ],
        },
      ],
    },
    {
      id: "aliments-sans-gluten",
      title: "الأطعمة الخالية من الغلوتين بطبيعتها",
      blocks: [
        {
          type: "paragraph",
          text: "معظم المنتجات الطازجة وغير المصنّعة خالية من الغلوتين بطبيعتها، لذلك يبقى الأكل المتنوّع واللذيذ ممكنًا تمامًا.",
        },
        {
          type: "foods",
          tone: "ok",
          title: "الحبوب والنشويات",
          items: [
            { name: "الأرز" },
            { name: "الذرة" },
            { name: "الدرع (الذرة البيضاء)" },
            { name: "الدخن" },
            { name: "الحنطة السوداء" },
            { name: "الكينوا" },
            { name: "البطاطا" },
            { name: "البطاطا الحلوة" },
          ],
        },
        {
          type: "foods",
          tone: "ok",
          title: "البقول",
          items: [{ name: "الحمّص" }, { name: "العدس" }, { name: "الفول" }, { name: "اللوبيا" }, { name: "الجلبانة" }],
        },
        {
          type: "foods",
          tone: "ok",
          title: "المنتجات الطازجة",
          items: [
            { name: "الغلال والخضر" },
            { name: "اللحوم والدواجن" },
            { name: "الأسماك" },
            { name: "البيض" },
            { name: "الحليب واللبن والرايب والأجبان الطبيعية" },
            { name: "زيت الزيتون" },
            { name: "التمر" },
            { name: "الفواكه الجافة الطبيعية" },
            { name: "العسل" },
          ],
        },
        {
          type: "paragraph",
          text: "انتبه: «خالٍ من الغلوتين بطبيعته» لا يعني «خاليًا من أي خطر». فقد تتلوّث هذه الأطعمة أثناء تحويلها: دقيق حمّص مطحون في مطحنة قمح، توابل تُباع بالميزان، لحوم متبّلة أو مغطّاة بالفتات، لحوم مصنّعة…",
        },
        {
          type: "callout",
          tone: "takeaway",
          items: [
            "فضّل المنتجات غير المصنّعة، وحضّر خلطات التوابل بنفسك.",
            "احذر المنتجات المصنّعة: الصلصات، مكعبات المرق، اللحوم المصنّعة، التوابل المطحونة.",
          ],
        },
      ],
    },
    {
      id: "contamination-croisee",
      title: "التلوث المتبادل",
      blocks: [
        {
          type: "paragraph",
          text: "يكفي القليل من الفتات: قد يتلوّث طعام خالٍ من الغلوتين بملامسة سطح أو أداة أو زيت قلي، بل وحتى بالدقيق العالق في الهواء. وهذا هو السبب الأكثر شيوعًا للتعرّض للغلوتين دون قصد.",
        },
        {
          type: "cards",
          items: [
            {
              icon: "home",
              title: "في المنزل",
              items: [
                "خصّص **كسكاسًا** للطبخ دون غلوتين: فالمصفاة والقماش يحتفظان بسميد القمح.",
                "محمصة خبز ولوح تقطيع وأدوات خشبية **مخصّصة**: فالخشب والخدوش تحتفظ بالفتات.",
                "حضّر الوجبة الخالية من الغلوتين أولًا وغطّها، ثم اطبخ الباقي.",
                "تجنّب نثر الدقيق على سطح عمل مشترك، فهو يبقى عالقًا في الهواء طويلًا.",
                "خصّص علبًا منفصلة للزبدة والمربّى والمعجونات.",
                "رتّب المنتجات الخالية من الغلوتين في الرفوف العليا، في علب مغلقة وعليها ملصقات.",
              ],
            },
            {
              icon: "restaurant",
              title: "في المطعم",
              items: [
                "**المقلاة المشتركة**: البطاطا المقلية في زيت الفطائر أو الأطعمة المغطّاة بالفتات لم تعد خالية من الغلوتين.",
                "**الشواية والبلانشا**: اطلب الطهي على سطح نظيف أو على ورق الطبخ.",
                "**ماء الطهي**: لا يجب أن يُطهى الأرز أو الخضر في ماء العجين.",
                "**الصلصات والتتبيلات**: كثيرًا ما تُكثَّف بالدقيق أو تحتوي على صلصة الصويا المصنوعة من القمح.",
                "**الخبز على الطاولة**: اطلب ألّا يوضع قرب طبقك.",
              ],
            },
          ],
        },
        {
          type: "callout",
          tone: "warning",
          text: "قد يحتوي طبق خالٍ من مكوّنات الغلوتين على آثار منه إذا حُضّر في مطبخ يُستعمل فيه الدقيق. لهذا لا يدرج CeliacCare إلا المتاجر **الخالية تمامًا من الغلوتين**: ورشات ومطابخ لا يدخلها دقيق القمح أبدًا.",
        },
      ],
    },
    {
      id: "lire-les-etiquettes",
      title: "كيف تقرأ الملصقات",
      blocks: [
        {
          type: "paragraph",
          text: "اعتد على قراءة قائمة المكوّنات **في كل مرة تشتري فيها**، حتى بالنسبة إلى منتج تعرفه: فالوصفات تتغيّر دون سابق إعلام.",
        },
        {
          type: "list",
          style: "steps",
          items: [
            "**ابحث عن مسببات الحساسية البارزة**: في قائمة المكوّنات، كثيرًا ما تُكتب الحبوب التي تحتوي على الغلوتين (القمح، الشعير، الجاودار، الشوفان، السبلت…) بخط عريض أو بحروف كبيرة أو تحتها خط.",
            "**تعقّب الكلمات التي تُخفي الغلوتين**: الدقيق، السميد، فتات الخبز، نشا القمح، المالت، مستخلص المالت أو شرابه، بروتينات القمح، البرغل، الفريك.",
            "**اقرأ عبارة «قد يحتوي على»**: عبارة «قد يحتوي على آثار القمح» أو «صُنع في ورشة تستعمل الغلوتين» تنبّه إلى خطر التلوث المتبادل، ويتجنّب أغلب مرضى السيلياك هذه المنتجات.",
            "**ابحث عن الشعارات الموثوقة**: سنبلة القمح المشطوبة أو عبارة «خالٍ من الغلوتين» المعتمدة تدلّان على منتج يحترم الحدّ الدولي المحدّد بـ20 ملغ من الغلوتين في الكيلوغرام (20 جزءًا في المليون).",
            "**عند الشك، امتنع.** وإذا كان المنتج معروضًا على CeliacCare، [اطرح علينا سؤالك](/contact): نستفسر لدى المصنّع نيابةً عنك.",
          ],
        },
        {
          type: "labelExample",
          title: "مثال: رقائق أرز… ليست بريئة كما تبدو",
          product: "رقائق الأرز المنفوخ",
          ingredients: "المكوّنات: أرز كامل (96%)، زيت عباد الشمس، **مستخلص مالت الشعير**، ملح.",
          traces: "قد يحتوي على آثار **القمح** والسمسم.",
          notes: [
            "الأرز خالٍ من الغلوتين بطبيعته…",
            "…لكن **مستخلص مالت الشعير** يحتوي عليه.",
            "وعبارة «قد يحتوي على آثار القمح» تنبّه كذلك إلى خطر التلوث المتبادل.",
          ],
          verdict: "الخلاصة: يجب تجنّبه في الحمية الخالية من الغلوتين.",
        },
        {
          type: "callout",
          tone: "takeaway",
          items: [
            "اقرأ الملصق في كل مرة تشتري فيها.",
            "«قد يحتوي على آثار القمح»: تجنّبه إذا كنت مصابًا بالسيلياك.",
            "لا يوجد ملصق (بيع بالميزان، سوق، صنع منزلي)؟ اسأل عن المكوّنات وعن طريقة التحضير.",
          ],
        },
      ],
    },
    {
      id: "manger-dehors",
      title: "الأكل في المطعم في تونس",
      blocks: [
        {
          type: "paragraph",
          text: "في المطعم أو المقهى أو عند الأقارب، أسلم طريقة هي أن تشرح وضعك ببساطة. فالغلوتين ما يزال غير معروف بشكل كافٍ، وبعض الأسئلة الدقيقة تصنع الفرق.",
        },
        { type: "subheading", text: "الأسئلة التي يجب طرحها" },
        {
          type: "list",
          style: "questions",
          items: [
            "هل يحتوي هذا الطبق على دقيق أو سميد أو خبز، ولو بكمية صغيرة؟",
            "هل تُكثَّف الصلصة بالدقيق؟ هل تستعملون مكعبات المرق؟",
            "هل تُقلى البطاطا في مقلاة منفصلة؟",
            "هل يُطهى الأرز أو الخضر على البخار في الكسكاس؟",
            "هل يمكن تحضير طبقي على سطح عمل نظيف وبأدوات نظيفة؟",
          ],
        },
        {
          type: "phrasebook",
          title: "الجملة التي تعرضها على الطبّاخ",
          note: "احفظها في هاتفك باللغتين.",
          phrases: [
            {
              lang: "ar",
              text: "أنا مصاب بمرض السيلياك: لا يمكنني أكل القمح أو الشعير أو السميد أو الدقيق (الفارينة) أو الخبز، ولو بكمية صغيرة جدًا. هل يمكن تحضير طبقي بأدوات نظيفة؟",
            },
            {
              lang: "fr",
              text: "Je suis atteint(e) de la maladie cœliaque : je ne peux manger ni blé, ni orge, ni seigle, ni semoule, ni farine, ni pain, même en très petite quantité. Pouvez-vous préparer mon plat avec des ustensiles propres ?",
            },
          ],
        },
        {
          type: "callout",
          tone: "tip",
          title: "نصائحنا",
          items: [
            "يُفضَّل أن تذهب خارج أوقات الذروة: يكون لدى فريق المطبخ وقت أكبر لتحضير طبقك بعناية.",
            "تحدّث عن **مرض السيلياك** بدل «الحمية»: فهو سبب طبي وليس تفضيلًا.",
            "على CeliacCare، يعرض كل مطعم **طرق التحضير** المعتمدة لديه (مطبخ منفصل، أدوات مخصصة، طاقم مدرّب) ومستوى الضمان: [تصفّح المطاعم الشريكة](/restaurants).",
          ],
        },
      ],
    },
    {
      id: "nos-garanties",
      title: "مستويات الضمان لدينا",
      blocks: [
        {
          type: "paragraph",
          text: "لا يدرج CeliacCare إلا المتاجر **الخالية تمامًا من الغلوتين**. يعرض كل منتج وحرفي ومطعم مستوى الضمان، و**مصدر** المعلومة (شهادة، موقع رسمي، شبكات التواصل، ملصق، صحافة…) و**تاريخ التحقق** منها. وإذا لم تتم مراجعة بطاقة منذ أكثر من 12 شهرًا، يُشار إليها وتُعاد إلى المراجعة.",
        },
        {
          type: "guarantees",
          advice: {
            CERTIFIED: "الخيار الأكثر أمانًا: هيئة رسمية تراقب المنتج أو المؤسسة.",
            DEDICATED:
              "لا يدخل دقيق القمح إلى الورشة أو المطبخ، لكن دون رقابة رسمية: عند الشك، اطرح علينا أسئلتك (نستفسر لدى المتجر نيابةً عنك) واقرأ الملصق.",
          },
        },
        {
          type: "paragraph",
          text: "هل لاحظت خطأ؟ تحتوي كل بطاقة على زر **«الإبلاغ عن خطأ»**، ويتحقق فريقنا من كل بلاغ. ولمعرفة المزيد، تصفّح [الأسئلة الشائعة](/faq) أو [منهجيتنا](/a-propos).",
        },
      ],
    },
  ],
};
