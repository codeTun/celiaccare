import type { ContentSection } from "@/components/content/types";
import { siteConfig } from "@/lib/site-config";
import { MAX_ORDERS_PER_DAY } from "@/lib/tunisia";
import type { Locale } from "@/types";

/* ==========================================================================
   Legal pages (spec §6.4 / §6.5), in French and in Arabic:
   - legalNotice    -> /mentions-legales
   - privacyPolicy  -> /confidentialite   (organic law n° 2004-63)
   - termsOfUse     -> /conditions
   Facts marked `todo: true` must be completed before going live
   (they show a "À compléter" badge on the page).
   ========================================================================== */

/** Date of the last update of the legal pages (shown at the top of each page). */
export const LEGAL_UPDATED_AT = "2026-11-15";

const email = `[${siteConfig.email}](mailto:${siteConfig.email})`;
const phone = `[${siteConfig.phone}](tel:${siteConfig.phone.replace(/\s/g, "")})`;
const retentionDays = siteConfig.deliveryDataRetentionDays;

/* -------------------------------------------------------------------------- */
/*  Mentions légales                                                          */
/* -------------------------------------------------------------------------- */

export const legalNotice: Record<Locale, ContentSection[]> = {
  fr: [
    {
      id: "editeur",
      title: "Éditeur du site",
      blocks: [
        {
          type: "paragraph",
          text: "CeliacCare est un **projet étudiant** réalisé dans le cadre du Master BioMIS.",
        },
        {
          type: "facts",
          items: [
            { label: "Nom du site", value: "CeliacCare" },
            { label: "Éditeur", value: "Projet étudiant CeliacCare — Master BioMIS" },
            { label: "Établissement", value: "Nom de l'université ou de l'école", todo: true },
            { label: "Responsable de la publication", value: "Prénom et nom de la personne responsable", todo: true },
            { label: "Adresse", value: "Adresse postale de l'éditeur", todo: true },
            {
              label: "Immatriculation",
              value: "Identifiant unique au registre national des entreprises (RNE), si une structure est créée",
              todo: true,
            },
            { label: "E-mail", value: email },
            { label: "Téléphone", value: phone },
          ],
        },
      ],
    },
    {
      id: "hebergement",
      title: "Hébergement",
      blocks: [
        {
          type: "facts",
          items: [
            { label: "Hébergeur", value: "Nom de la société d'hébergement", todo: true },
            { label: "Adresse", value: "Adresse de l'hébergeur", todo: true },
            { label: "Contact", value: "Site web ou téléphone de l'hébergeur", todo: true },
          ],
        },
        {
          type: "paragraph",
          text: "Les photos des produits, des artisans et des restaurants sont stockées et diffusées par le service **Cloudinary**.",
        },
      ],
    },
    {
      id: "propriete-intellectuelle",
      title: "Propriété intellectuelle",
      blocks: [
        {
          type: "paragraph",
          text: "Le nom CeliacCare, son logo (une porte de Sidi Bou Saïd encadrant une fleur de jasmin), la structure du site, ses textes et ses éléments graphiques sont protégés. Sauf mention contraire, ils appartiennent à CeliacCare et ne peuvent pas être reproduits sans autorisation écrite.",
        },
        {
          type: "paragraph",
          text: "Les photos et les descriptions des produits, des artisans et des restaurants sont fournies par les commerçants partenaires, qui garantissent disposer des droits nécessaires à leur publication.",
        },
      ],
    },
    {
      id: "responsabilite",
      title: "Responsabilité",
      blocks: [
        {
          type: "paragraph",
          text: "CeliacCare publie des informations vérifiées, avec leur source et leur date de vérification. Elles peuvent toutefois contenir des erreurs ou devenir inexactes, par exemple après un changement de recette, de fournisseur ou d'organisation de la cuisine.",
        },
        {
          type: "callout",
          tone: "warning",
          text: "CeliacCare informe mais ne garantit pas l'absence totale de gluten. Vérifiez toujours l'étiquette : les recettes peuvent changer. Pour toute question de santé, consultez votre médecin.",
        },
        {
          type: "paragraph",
          text: "Les liens vers d'autres sites sont proposés pour vous être utiles ; CeliacCare n'est pas responsable de leur contenu. Le rôle de CeliacCare et celui des commerçants sont précisés dans nos [conditions générales d'utilisation](/conditions).",
        },
      ],
    },
    {
      id: "donnees-personnelles",
      title: "Données personnelles",
      blocks: [
        {
          type: "paragraph",
          text: "Le traitement de vos données personnelles respecte la **loi organique n° 2004-63 du 27 juillet 2004** portant sur la protection des données à caractère personnel. Il est décrit en détail dans notre [politique de confidentialité](/confidentialite).",
        },
      ],
    },
    {
      id: "contact",
      title: "Nous contacter",
      blocks: [
        {
          type: "paragraph",
          text: `Pour toute question sur le site ou sur ces mentions : [formulaire de contact](/contact) ou ${email}.`,
        },
      ],
    },
  ],

  ar: [
    {
      id: "editeur",
      title: "الجهة الناشرة",
      blocks: [
        {
          type: "paragraph",
          text: "CeliacCare **مشروع طلابي** أُنجز في إطار ماجستير BioMIS.",
        },
        {
          type: "facts",
          items: [
            { label: "اسم الموقع", value: "CeliacCare" },
            { label: "الناشر", value: "المشروع الطلابي CeliacCare — ماجستير BioMIS" },
            { label: "المؤسسة الجامعية", value: "اسم الجامعة أو المدرسة", todo: true },
            { label: "المسؤول عن النشر", value: "اسم الشخص المسؤول ولقبه", todo: true },
            { label: "العنوان", value: "العنوان البريدي للناشر", todo: true },
            {
              label: "التسجيل",
              value: "المعرّف الوحيد بالسجل الوطني للمؤسسات، في حال إحداث هيكل قانوني",
              todo: true,
            },
            { label: "البريد الإلكتروني", value: email },
            { label: "الهاتف", value: phone },
          ],
        },
      ],
    },
    {
      id: "hebergement",
      title: "الاستضافة",
      blocks: [
        {
          type: "facts",
          items: [
            { label: "المستضيف", value: "اسم شركة الاستضافة", todo: true },
            { label: "العنوان", value: "عنوان المستضيف", todo: true },
            { label: "الاتصال", value: "الموقع الإلكتروني أو هاتف المستضيف", todo: true },
          ],
        },
        {
          type: "paragraph",
          text: "تُخزَّن صور المنتجات والحرفيين والمطاعم وتُعرض عبر خدمة **Cloudinary**.",
        },
      ],
    },
    {
      id: "propriete-intellectuelle",
      title: "الملكية الفكرية",
      blocks: [
        {
          type: "paragraph",
          text: "اسم CeliacCare وشعاره (باب من سيدي بوسعيد يحتضن زهرة ياسمين) وهيكلة الموقع ونصوصه وعناصره الرسومية محميّة. وما لم يُذكر خلاف ذلك، فهي ملك لـ CeliacCare ولا يجوز نسخها دون إذن كتابي.",
        },
        {
          type: "paragraph",
          text: "يوفّر التجار الشركاء صور المنتجات والحرفيين والمطاعم وأوصافها، ويضمنون امتلاكهم الحقوق اللازمة لنشرها.",
        },
      ],
    },
    {
      id: "responsabilite",
      title: "المسؤولية",
      blocks: [
        {
          type: "paragraph",
          text: "ينشر CeliacCare معلومات تم التحقق منها، مع مصدرها وتاريخ التحقق. غير أنها قد تتضمن أخطاء أو تصبح غير دقيقة، مثلًا بعد تغيير الوصفة أو المزوّد أو تنظيم المطبخ.",
        },
        {
          type: "callout",
          tone: "warning",
          text: "يقدّم CeliacCare معلومات لكنه لا يضمن الغياب التام للغلوتين. تحقّق دائمًا من الملصق لأن الوصفات قد تتغيّر، واستشر طبيبك في كل ما يتعلق بصحتك.",
        },
        {
          type: "paragraph",
          text: "نقترح الروابط نحو مواقع أخرى للإفادة، ولا يتحمّل CeliacCare مسؤولية محتواها. ودور CeliacCare ودور التجار مبيّنان في [الشروط العامة للاستعمال](/conditions).",
        },
      ],
    },
    {
      id: "donnees-personnelles",
      title: "المعطيات الشخصية",
      blocks: [
        {
          type: "paragraph",
          text: "تحترم معالجة معطياتك الشخصية **القانون الأساسي عدد 63 لسنة 2004 المؤرخ في 27 جويلية 2004** المتعلق بحماية المعطيات الشخصية، وهي مفصّلة في [سياسة الخصوصية](/confidentialite).",
        },
      ],
    },
    {
      id: "contact",
      title: "اتصل بنا",
      blocks: [
        {
          type: "paragraph",
          text: `لأي سؤال يخصّ الموقع أو هذه البيانات: [استمارة الاتصال](/contact) أو ${email}.`,
        },
      ],
    },
  ],
};

/* -------------------------------------------------------------------------- */
/*  Politique de confidentialité                                              */
/* -------------------------------------------------------------------------- */

export const privacyPolicy: Record<Locale, ContentSection[]> = {
  fr: [
    {
      id: "engagement",
      title: "Notre engagement",
      blocks: [
        {
          type: "paragraph",
          text: "Ce que vous achetez sans gluten peut révéler des informations sur votre santé. C'est pourquoi nous collectons **le minimum de données**, nous les protégeons, et nous ne les vendons ni ne les louons jamais.",
        },
        {
          type: "paragraph",
          text: "Cette politique explique quelles données nous traitons, pourquoi et pendant combien de temps, conformément à la **loi organique n° 2004-63 du 27 juillet 2004** portant sur la protection des données à caractère personnel.",
        },
      ],
    },
    {
      id: "responsable",
      title: "Responsable du traitement",
      blocks: [
        {
          type: "facts",
          items: [
            { label: "Responsable", value: "CeliacCare, projet étudiant (voir les [mentions légales](/mentions-legales))" },
            { label: "Contact", value: email },
            { label: "Déclaration à l'INPDP", value: "Numéro de déclaration auprès de l'INPDP", todo: true },
          ],
        },
      ],
    },
    {
      id: "donnees-collectees",
      title: "Les données que nous collectons",
      blocks: [
        {
          type: "paragraph",
          text: "Vous pouvez consulter tout le site et commander **sans créer de compte**. Nous ne collectons que les données nécessaires à chaque service :",
        },
        {
          type: "facts",
          items: [
            {
              label: "Commande",
              value: "Nom complet, numéro de téléphone, adresse de livraison (gouvernorat, ville, rue, précisions), contenu de la commande et note éventuelle.",
            },
            { label: "Formulaire de contact", value: "Nom, e-mail et/ou téléphone, sujet et message." },
            { label: "Avis", value: "Le nom ou le pseudonyme que vous choisissez d'afficher, votre note et votre commentaire." },
            {
              label: "Signalement d'erreur",
              value: "La description de l'erreur et, si vous le souhaitez, un e-mail ou un téléphone pour vous tenir informé.",
            },
            {
              label: "Sécurité",
              value: "Une **empreinte chiffrée** de votre adresse IP (jamais l'adresse elle-même), pour limiter les abus.",
            },
          ],
        },
        {
          type: "paragraph",
          text: "Nous ne vous demandons jamais de données bancaires ni d'informations médicales.",
        },
      ],
    },
    {
      id: "finalites",
      title: "Pourquoi nous les utilisons",
      blocks: [
        {
          type: "list",
          style: "checks",
          items: [
            "Préparer et livrer vos commandes, et vous contacter à leur sujet.",
            `Appliquer la règle de ${MAX_ORDERS_PER_DAY} commandes par jour et par numéro de téléphone, qui protège les commerçants contre les fausses commandes.`,
            "Répondre à vos messages.",
            "Publier les avis après modération et traiter les signalements d'erreur.",
            "Protéger le site contre les robots et les abus.",
            "Établir des statistiques globales et anonymes (nombre de commandes, produits les plus demandés).",
          ],
        },
        {
          type: "paragraph",
          text: "Nous ne faisons **ni publicité ciblée, ni profilage, ni revente** de données.",
        },
      ],
    },
    {
      id: "destinataires",
      title: "Qui peut y accéder",
      blocks: [
        {
          type: "list",
          items: [
            "**Le commerçant concerné** (artisan ou restaurant), et lui seul, reçoit les informations nécessaires pour préparer votre commande.",
            "**Le livreur** chargé de la course reçoit votre nom, votre téléphone et votre adresse.",
            "**L'équipe CeliacCare** y accède pour gérer les commandes, les messages et la modération, depuis un espace administrateur protégé.",
            "**Nos prestataires techniques** (hébergement) les stockent pour notre compte, sans pouvoir les utiliser pour eux-mêmes.",
          ],
        },
        {
          type: "paragraph",
          text: "Vos données ne sont **jamais vendues, louées ou cédées** à des tiers.",
        },
      ],
    },
    {
      id: "conservation",
      title: "Combien de temps nous les gardons",
      blocks: [
        {
          type: "facts",
          items: [
            { label: "Données de livraison", value: `Nom, téléphone et adresse : supprimés **${retentionDays} jours après la livraison**.` },
            {
              label: "Compteurs et tentatives de commande",
              value: `${retentionDays} jours, pour appliquer la limite de ${MAX_ORDERS_PER_DAY} commandes par jour et repérer les abus.`,
            },
            { label: "Messages", value: "Le temps de traiter votre demande, puis 12 mois au plus." },
            { label: "Avis publiés", value: "Tant que la fiche concernée est en ligne, ou jusqu'à votre demande de suppression." },
            {
              label: "Empreintes d'adresse IP",
              value: "Quelques jours pour la limitation des envois, ou avec la commande, le message ou l'avis concerné.",
            },
          ],
        },
        {
          type: "paragraph",
          text: "Passé ces délais, les données sont supprimées ou rendues anonymes, par exemple pour les statistiques.",
        },
      ],
    },
    {
      id: "cookies",
      title: "Cookies et stockage dans votre navigateur",
      blocks: [
        {
          type: "paragraph",
          text: "CeliacCare n'utilise **aucun cookie publicitaire, de réseau social ou de mesure d'audience**. Seuls des éléments indispensables au fonctionnement du site sont utilisés :",
        },
        {
          type: "facts",
          items: [
            {
              label: "Panier",
              value: "Enregistré dans le stockage local de votre navigateur (localStorage). Il ne nous est transmis qu'au moment où vous passez commande.",
            },
            { label: "Langue", value: "Un cookie retient la langue choisie (français ou arabe) pendant un an." },
            { label: "Espace administrateur", value: "Un cookie de session sécurisé, réservé à l'équipe CeliacCare et valable 8 heures au plus (2 heures sans activité)." },
          ],
        },
        {
          type: "paragraph",
          text: "Ces éléments étant strictement nécessaires, ils ne demandent pas de consentement préalable. Vous pouvez les effacer à tout moment dans les réglages de votre navigateur (votre panier sera alors vidé).",
        },
      ],
    },
    {
      id: "securite",
      title: "Sécurité",
      blocks: [
        {
          type: "list",
          style: "checks",
          items: [
            "Connexion chiffrée (HTTPS) sur tout le site.",
            "Espace administrateur protégé par un mot de passe robuste, une double authentification possible et des sessions limitées dans le temps.",
            "Mots de passe chiffrés ; adresses IP jamais enregistrées en clair.",
            "Accès aux données limité aux personnes qui en ont besoin, et sauvegardes régulières.",
          ],
        },
      ],
    },
    {
      id: "vos-droits",
      title: "Vos droits",
      blocks: [
        {
          type: "paragraph",
          text: "Conformément à la loi organique n° 2004-63, vous disposez d'un **droit d'accès**, d'un **droit de rectification** et d'un **droit de suppression** de vos données, ainsi que d'un droit d'opposition à leur traitement pour des raisons légitimes.",
        },
        {
          type: "paragraph",
          text: `Pour les exercer, écrivez-nous via le [formulaire de contact](/contact) ou à ${email}, en précisant si possible la référence de commande ou le numéro de téléphone concerné. Nous vous répondrons dans les meilleurs délais.`,
        },
        {
          type: "paragraph",
          text: "Si vous estimez que vos droits ne sont pas respectés, vous pouvez saisir l'**Instance nationale de protection des données personnelles (INPDP)** : [www.inpdp.nat.tn](https://www.inpdp.nat.tn).",
        },
      ],
    },
    {
      id: "modifications",
      title: "Modifications",
      blocks: [
        {
          type: "paragraph",
          text: "Cette politique peut évoluer, par exemple lorsque le site propose de nouveaux services. La date de la dernière mise à jour est indiquée en haut de cette page.",
        },
      ],
    },
  ],

  ar: [
    {
      id: "engagement",
      title: "التزامنا",
      blocks: [
        {
          type: "paragraph",
          text: "ما تشتريه من منتجات خالية من الغلوتين قد يكشف معلومات عن صحتك. لذلك نجمع **الحد الأدنى من المعطيات**، ونحميها، ولا نبيعها ولا نؤجّرها أبدًا.",
        },
        {
          type: "paragraph",
          text: "توضّح هذه السياسة المعطيات التي نعالجها ولماذا وإلى متى، وفقًا **للقانون الأساسي عدد 63 لسنة 2004 المؤرخ في 27 جويلية 2004** المتعلق بحماية المعطيات الشخصية.",
        },
      ],
    },
    {
      id: "responsable",
      title: "المسؤول عن المعالجة",
      blocks: [
        {
          type: "facts",
          items: [
            { label: "المسؤول", value: "CeliacCare، مشروع طلابي (انظر [البيانات القانونية](/mentions-legales))" },
            { label: "الاتصال", value: email },
            { label: "التصريح لدى الهيئة", value: "رقم التصريح لدى الهيئة الوطنية لحماية المعطيات الشخصية", todo: true },
          ],
        },
      ],
    },
    {
      id: "donnees-collectees",
      title: "المعطيات التي نجمعها",
      blocks: [
        {
          type: "paragraph",
          text: "يمكنك تصفّح الموقع بأكمله والطلب **دون إنشاء حساب**. ولا نجمع إلا المعطيات الضرورية لكل خدمة:",
        },
        {
          type: "facts",
          items: [
            {
              label: "الطلبية",
              value: "الاسم الكامل، رقم الهاتف، عنوان التوصيل (الولاية، المدينة، النهج، توضيحات)، محتوى الطلبية وملاحظة إن وُجدت.",
            },
            { label: "استمارة الاتصال", value: "الاسم، البريد الإلكتروني و/أو الهاتف، الموضوع والرسالة." },
            { label: "التقييم", value: "الاسم أو الاسم المستعار الذي تختار إظهاره، وتقييمك وتعليقك." },
            { label: "الإبلاغ عن خطأ", value: "وصف الخطأ، وإن رغبت بريد إلكتروني أو هاتف لإعلامك بالمتابعة." },
            { label: "الأمان", value: "**بصمة مشفّرة** لعنوان IP الخاص بك (وليس العنوان نفسه أبدًا)، للحدّ من التجاوزات." },
          ],
        },
        {
          type: "paragraph",
          text: "لا نطلب منك أبدًا أي معطيات بنكية أو معلومات طبية.",
        },
      ],
    },
    {
      id: "finalites",
      title: "لماذا نستعملها",
      blocks: [
        {
          type: "list",
          style: "checks",
          items: [
            "تحضير طلبياتك وتوصيلها، والاتصال بك بشأنها.",
            `تطبيق قاعدة ${MAX_ORDERS_PER_DAY} طلبات يوميًا لكل رقم هاتف، التي تحمي التجار من الطلبات الوهمية.`,
            "الرد على رسائلك.",
            "نشر التقييمات بعد مراجعتها ومعالجة البلاغات عن الأخطاء.",
            "حماية الموقع من الروبوتات والتجاوزات.",
            "إعداد إحصائيات عامة ومجهولة الهوية (عدد الطلبات، المنتجات الأكثر طلبًا).",
          ],
        },
        {
          type: "paragraph",
          text: "لا نقوم **بأي إشهار موجّه أو تنميط أو بيع** للمعطيات.",
        },
      ],
    },
    {
      id: "destinataires",
      title: "من يمكنه الاطلاع عليها",
      blocks: [
        {
          type: "list",
          items: [
            "**التاجر المعني** (حرفي أو مطعم)، ولا أحد غيره، يتلقى المعلومات اللازمة لتحضير طلبيتك.",
            "**عامل التوصيل** المكلّف بالطلبية يتلقى اسمك وهاتفك وعنوانك.",
            "**فريق CeliacCare** يطّلع عليها لإدارة الطلبات والرسائل ومراجعة التقييمات، عبر فضاء إدارة محمي.",
            "**مزوّدو الخدمات التقنية** (الاستضافة) يخزّنونها لحسابنا، دون أن يحق لهم استعمالها لأغراضهم.",
          ],
        },
        {
          type: "paragraph",
          text: "لا تُباع معطياتك **ولا تُؤجَّر ولا يُتنازل عنها** لأي طرف آخر.",
        },
      ],
    },
    {
      id: "conservation",
      title: "مدة الاحتفاظ بها",
      blocks: [
        {
          type: "facts",
          items: [
            { label: "معطيات التوصيل", value: `الاسم والهاتف والعنوان: تُحذف **بعد ${retentionDays} يومًا من التسليم**.` },
            {
              label: "عدّادات الطلبات ومحاولاتها",
              value: `${retentionDays} يومًا، لتطبيق حدّ ${MAX_ORDERS_PER_DAY} طلبات يوميًا ورصد التجاوزات.`,
            },
            { label: "الرسائل", value: "المدة اللازمة لمعالجة طلبك، ثم 12 شهرًا على الأكثر." },
            { label: "التقييمات المنشورة", value: "ما دامت البطاقة المعنية منشورة، أو إلى حين طلبك حذفها." },
            { label: "بصمات عناوين IP", value: "بضعة أيام للحدّ من الإرسال المتكرر، أو مع الطلبية أو الرسالة أو التقييم المعني." },
          ],
        },
        {
          type: "paragraph",
          text: "بعد انقضاء هذه الآجال، تُحذف المعطيات أو تُصبح مجهولة الهوية، مثلًا لأغراض إحصائية.",
        },
      ],
    },
    {
      id: "cookies",
      title: "ملفات تعريف الارتباط والتخزين في متصفحك",
      blocks: [
        {
          type: "paragraph",
          text: "لا يستعمل CeliacCare **أي ملفات تعريف ارتباط إشهارية أو خاصة بالشبكات الاجتماعية أو بقياس عدد الزوار**. ولا نستعمل إلا العناصر الضرورية لعمل الموقع:",
        },
        {
          type: "facts",
          items: [
            { label: "السلة", value: "تُحفظ في التخزين المحلي لمتصفحك (localStorage)، ولا تصلنا إلا عند تقديم الطلبية." },
            { label: "اللغة", value: "ملف تعريف ارتباط يحفظ اللغة المختارة (العربية أو الفرنسية) لمدة سنة." },
            { label: "فضاء الإدارة", value: "ملف جلسة مؤمَّن، خاص بفريق CeliacCare وصالح لمدة 8 ساعات على الأكثر (ساعتان دون نشاط)." },
          ],
        },
        {
          type: "paragraph",
          text: "بما أن هذه العناصر ضرورية تمامًا، فهي لا تتطلب موافقة مسبقة. ويمكنك حذفها في أي وقت من إعدادات متصفحك (وستُفرَّغ سلتك حينها).",
        },
      ],
    },
    {
      id: "securite",
      title: "الأمان",
      blocks: [
        {
          type: "list",
          style: "checks",
          items: [
            "اتصال مشفّر (HTTPS) في كامل الموقع.",
            "فضاء إدارة محمي بكلمة مرور قوية، مع إمكانية التحقق بخطوتين، وجلسات محدودة في الزمن.",
            "كلمات مرور مشفّرة، وعناوين IP لا تُسجَّل أبدًا كما هي.",
            "نفاذ إلى المعطيات مقتصر على من يحتاجها، ونسخ احتياطية منتظمة.",
          ],
        },
      ],
    },
    {
      id: "vos-droits",
      title: "حقوقك",
      blocks: [
        {
          type: "paragraph",
          text: "وفقًا للقانون الأساسي عدد 63 لسنة 2004، لك **حق النفاذ** إلى معطياتك و**حق تصحيحها** و**حق حذفها**، إضافة إلى حق الاعتراض على معالجتها لأسباب مشروعة.",
        },
        {
          type: "paragraph",
          text: `لممارسة هذه الحقوق، راسلنا عبر [استمارة الاتصال](/contact) أو على ${email}، مع ذكر مرجع الطلبية أو رقم الهاتف المعني إن أمكن. وسنردّ عليك في أقرب الآجال.`,
        },
        {
          type: "paragraph",
          text: "إذا رأيت أن حقوقك لم تُحترم، يمكنك اللجوء إلى **الهيئة الوطنية لحماية المعطيات الشخصية**: [www.inpdp.nat.tn](https://www.inpdp.nat.tn).",
        },
      ],
    },
    {
      id: "modifications",
      title: "التعديلات",
      blocks: [
        {
          type: "paragraph",
          text: "قد تتطوّر هذه السياسة، مثلًا عندما يقدّم الموقع خدمات جديدة. ويُذكر تاريخ آخر تحديث في أعلى هذه الصفحة.",
        },
      ],
    },
  ],
};

/* -------------------------------------------------------------------------- */
/*  Conditions générales d'utilisation                                         */
/* -------------------------------------------------------------------------- */

export const termsOfUse: Record<Locale, ContentSection[]> = {
  fr: [
    {
      id: "objet",
      title: "Objet",
      blocks: [
        {
          type: "paragraph",
          text: "Les présentes conditions générales encadrent l'utilisation du site CeliacCare et les commandes passées par son intermédiaire. En utilisant le site ou en passant commande, vous les acceptez.",
        },
      ],
    },
    {
      id: "role-de-celiaccare",
      title: "Le rôle de CeliacCare",
      blocks: [
        {
          type: "paragraph",
          text: "CeliacCare est un **annuaire et un service de mise en relation**. Le site présente des produits sans gluten d'artisans et de commerces tunisiens ainsi que des restaurants partenaires (« restaurants conventionnés »), et transmet vos commandes au commerçant concerné.",
        },
        {
          type: "list",
          items: [
            "CeliacCare vérifie les informations publiées (ingrédients, pratiques de préparation, certificats éventuels) et affiche pour chaque fiche un niveau de garantie, sa source et sa date de vérification.",
            "CeliacCare **ne fabrique pas et ne cuisine pas** les produits et les plats proposés.",
            "CeliacCare transmet les commandes aux commerçants et coordonne leur livraison.",
          ],
        },
      ],
    },
    {
      id: "role-du-commercant",
      title: "Le rôle du commerçant",
      blocks: [
        {
          type: "list",
          items: [
            "Le commerçant (artisan, commerce ou restaurant) **fabrique ou prépare** les produits et les plats, et en est responsable : composition, hygiène, respect des pratiques déclarées, qualité et conformité à la réglementation.",
            "Il s'engage à fournir des informations exactes et à signaler sans délai tout changement (recette, fournisseur, organisation de la cuisine).",
            "Il fixe ses prix, ses délais et, pour les restaurants, sa zone de livraison et son minimum de commande.",
          ],
        },
      ],
    },
    {
      id: "commandes",
      title: "Les commandes",
      blocks: [
        {
          type: "list",
          style: "steps",
          items: [
            "Vous composez votre panier : soit des produits d'artisans, soit les plats d'un seul restaurant.",
            "Vous indiquez votre nom, un numéro de téléphone tunisien valide et votre adresse de livraison complète : ces champs sont obligatoires.",
            "Un récapitulatif (articles, prix, frais et délai de livraison) s'affiche : la commande n'est envoyée qu'après votre confirmation.",
            "Vous recevez une référence pour suivre votre commande. Le commerçant ou notre équipe peut vous appeler pour la confirmer.",
          ],
        },
        {
          type: "paragraph",
          text: "Les prix sont indiqués en dinars tunisiens (DT). Une commande peut être refusée ou annulée si un article n'est plus disponible ou si les informations de livraison sont incomplètes ou erronées ; vous en êtes alors informé. Vous pouvez demander l'annulation d'une commande tant qu'elle n'est pas en préparation, en [nous contactant](/contact?sujet=ORDER).",
        },
      ],
    },
    {
      id: "limite-de-commandes",
      title: `Limite de ${MAX_ORDERS_PER_DAY} commandes par jour`,
      blocks: [
        {
          type: "paragraph",
          text: `Pour éviter la saturation du site par des robots et limiter les fausses commandes, un même numéro de téléphone peut passer **au maximum ${MAX_ORDERS_PER_DAY} commandes par jour**. Le compteur est remis à zéro chaque jour à minuit, heure de Tunis.`,
        },
        {
          type: "paragraph",
          text: `Lorsque la limite est atteinte, la commande est refusée et un message vous l'indique clairement : « Vous avez atteint le maximum de ${MAX_ORDERS_PER_DAY} commandes aujourd'hui. Réessayez demain. »`,
        },
        {
          type: "paragraph",
          text: "Les tentatives refusées sont enregistrées afin de repérer les comportements suspects. CeliacCare peut **bloquer un numéro abusif** ou, au cas par cas, accorder une exception justifiée.",
        },
      ],
    },
    {
      id: "paiement-et-livraison",
      title: "Paiement et livraison",
      blocks: [
        {
          type: "list",
          items: [
            "Le paiement se fait **à la livraison**, en espèces ou, lorsque c'est proposé, par carte bancaire au moment de la remise. Aucun paiement en ligne n'est demandé.",
            "Les zones desservies, les frais, les délais et, le cas échéant, le minimum de commande sont affichés **avant** la confirmation de la commande.",
            "Les délais de livraison sont indicatifs. Merci de rester joignable au numéro indiqué et présent à l'adresse de livraison.",
            "À la réception, vérifiez votre commande. En cas de problème (article manquant ou abîmé), contactez-nous au plus vite.",
          ],
        },
      ],
    },
    {
      id: "responsabilite-et-sante",
      title: "Responsabilité et avertissement santé",
      blocks: [
        {
          type: "callout",
          tone: "warning",
          title: "Avertissement important",
          text: "CeliacCare informe mais **ne garantit pas l'absence totale de gluten**. Vérifiez toujours l'étiquette : les recettes peuvent changer. Les informations du site ne remplacent pas un avis médical : pour toute question de santé, consultez votre médecin.",
        },
        {
          type: "paragraph",
          text: "Les informations publiées sont vérifiées avec soin, mais elles reposent en partie sur les déclarations des commerçants et peuvent évoluer. Le niveau de garantie de chaque fiche indique la fiabilité de l'information : un produit « Risque de traces » peut contenir du gluten.",
        },
        {
          type: "paragraph",
          text: "La composition, la préparation et la conformité des produits et des plats relèvent de la responsabilité du commerçant qui les fabrique ou les prépare. Dans les limites prévues par la loi, CeliacCare ne peut être tenu responsable d'une réaction liée à un produit ou à un plat, notamment en cas de changement de recette non signalé.",
        },
      ],
    },
    {
      id: "avis-et-signalements",
      title: "Avis et signalements",
      blocks: [
        {
          type: "list",
          items: [
            "Les avis sont publiés **après modération**. Ils doivent décrire votre expérience réelle et rester courtois : les contenus injurieux, discriminatoires, publicitaires ou hors sujet sont refusés.",
            "En publiant un avis, vous autorisez CeliacCare à l'afficher sur le site.",
            "Le bouton « Signaler une erreur » permet de nous alerter sur une information inexacte : chaque signalement est examiné et suivi.",
          ],
        },
      ],
    },
    {
      id: "bon-usage",
      title: "Bon usage du site",
      blocks: [
        {
          type: "paragraph",
          text: "Il est interdit d'utiliser le site de manière frauduleuse : fausses commandes, envois automatisés, collecte de données, tentative d'accès à l'espace administrateur. En cas d'abus, CeliacCare peut refuser une commande, bloquer un numéro de téléphone ou suspendre l'accès aux services.",
        },
      ],
    },
    {
      id: "droit-applicable",
      title: "Droit applicable",
      blocks: [
        {
          type: "paragraph",
          text: "Les présentes conditions sont soumises au **droit tunisien**. En cas de litige, une solution amiable sera recherchée en priorité ; à défaut, les tribunaux tunisiens compétents seront saisis.",
        },
        {
          type: "paragraph",
          text: "CeliacCare peut modifier ces conditions ; la version applicable est celle en ligne au moment de votre commande. Une question ? [Écrivez-nous](/contact).",
        },
      ],
    },
  ],

  ar: [
    {
      id: "objet",
      title: "الموضوع",
      blocks: [
        {
          type: "paragraph",
          text: "تنظّم هذه الشروط العامة استعمال موقع CeliacCare والطلبيات المقدّمة عن طريقه. وباستعمالك الموقع أو تقديمك طلبية، فإنك تقبل بها.",
        },
      ],
    },
    {
      id: "role-de-celiaccare",
      title: "دور CeliacCare",
      blocks: [
        {
          type: "paragraph",
          text: "CeliacCare **دليل وخدمة ربط بين الحرفاء والتجار**. يعرض الموقع منتجات خالية من الغلوتين لحرفيين ومحلات تونسية، إضافة إلى مطاعم شريكة («مطاعم متعاقدة»)، ويحيل طلبياتك إلى التاجر المعني.",
        },
        {
          type: "list",
          items: [
            "يتحقق CeliacCare من المعلومات المنشورة (المكوّنات، طرق التحضير، الشهادات إن وُجدت)، ويعرض لكل بطاقة مستوى الضمان ومصدره وتاريخ التحقق.",
            "CeliacCare **لا يصنع ولا يطبخ** المنتجات والأطباق المعروضة.",
            "يحيل CeliacCare الطلبيات إلى التجار وينسّق عملية توصيلها.",
          ],
        },
      ],
    },
    {
      id: "role-du-commercant",
      title: "دور التاجر",
      blocks: [
        {
          type: "list",
          items: [
            "التاجر (حرفي أو محل أو مطعم) **يصنع أو يحضّر** المنتجات والأطباق ويتحمّل مسؤوليتها: التركيبة، النظافة، احترام طرق التحضير المصرّح بها، الجودة والمطابقة للتراتيب.",
            "يلتزم بتقديم معلومات صحيحة وبالإعلام دون تأخير بأي تغيير (الوصفة، المزوّد، تنظيم المطبخ).",
            "يحدّد أسعاره وآجاله، وبالنسبة إلى المطاعم منطقة التوصيل والحد الأدنى للطلب.",
          ],
        },
      ],
    },
    {
      id: "commandes",
      title: "الطلبيات",
      blocks: [
        {
          type: "list",
          style: "steps",
          items: [
            "تُكوّن سلتك: إمّا منتجات الحرفيين، وإمّا أطباق مطعم واحد.",
            "تُدخل اسمك ورقم هاتف تونسي صالحًا وعنوان التوصيل كاملًا: هذه الحقول إجبارية.",
            "يظهر ملخّص (المنتجات، الأسعار، معلوم التوصيل ومدّته): ولا تُرسَل الطلبية إلا بعد تأكيدك.",
            "تتلقى مرجعًا لتتبّع طلبيتك، وقد يتصل بك التاجر أو فريقنا لتأكيدها.",
          ],
        },
        {
          type: "paragraph",
          text: "تُعرض الأسعار بالدينار التونسي. ويمكن رفض طلبية أو إلغاؤها إذا لم يعد منتج متوفرًا أو كانت معطيات التوصيل ناقصة أو خاطئة، ويتم إعلامك بذلك. ويمكنك طلب إلغاء طلبيتك ما لم يبدأ تحضيرها، [بالاتصال بنا](/contact?sujet=ORDER).",
        },
      ],
    },
    {
      id: "limite-de-commandes",
      title: `حدّ ${MAX_ORDERS_PER_DAY} طلبات في اليوم`,
      blocks: [
        {
          type: "paragraph",
          text: `لتجنّب إغراق الموقع بالروبوتات والحدّ من الطلبات الوهمية، يمكن لرقم الهاتف الواحد أن يقدّم **${MAX_ORDERS_PER_DAY} طلبات على الأكثر في اليوم**. ويعود العدّاد إلى الصفر كل يوم عند منتصف الليل بتوقيت تونس.`,
        },
        {
          type: "paragraph",
          text: `عند بلوغ هذا الحد، تُرفض الطلبية وتظهر لك رسالة واضحة: «لقد بلغت الحد الأقصى المتمثل في ${MAX_ORDERS_PER_DAY} طلبات اليوم. أعد المحاولة غدًا.»`,
        },
        {
          type: "paragraph",
          text: "تُسجَّل المحاولات المرفوضة لرصد السلوكيات المشبوهة. ويمكن لـ CeliacCare **حجب رقم مسيء** أو منح استثناء مبرّر حسب كل حالة.",
        },
      ],
    },
    {
      id: "paiement-et-livraison",
      title: "الدفع والتوصيل",
      blocks: [
        {
          type: "list",
          items: [
            "يتم الدفع **عند الاستلام**، نقدًا أو بالبطاقة البنكية عند التسليم إذا كانت هذه الخدمة متاحة. لا يُطلب منك أي دفع عبر الإنترنت.",
            "تُعرض المناطق المشمولة ومعلوم التوصيل ومدّته، والحد الأدنى للطلب عند الاقتضاء، **قبل** تأكيد الطلبية.",
            "آجال التوصيل تقريبية. يرجى أن تبقى متاحًا على الرقم المذكور وحاضرًا في عنوان التوصيل.",
            "عند الاستلام، تحقّق من طلبيتك. وفي حال وجود مشكلة (منتج ناقص أو تالف)، اتصل بنا في أسرع وقت.",
          ],
        },
      ],
    },
    {
      id: "responsabilite-et-sante",
      title: "المسؤولية والتنبيه الصحي",
      blocks: [
        {
          type: "callout",
          tone: "warning",
          title: "تنبيه هام",
          text: "يقدّم CeliacCare معلومات لكنه **لا يضمن الغياب التام للغلوتين**. تحقّق دائمًا من الملصق لأن الوصفات قد تتغيّر. ولا تعوّض معلومات الموقع الاستشارة الطبية: استشر طبيبك في كل ما يتعلق بصحتك.",
        },
        {
          type: "paragraph",
          text: "يتم التحقق من المعلومات المنشورة بعناية، لكنها تستند جزئيًا إلى تصريحات التجار وقد تتغيّر. ويدلّ مستوى الضمان في كل بطاقة على درجة موثوقية المعلومة: فالمنتج الذي يحمل عبارة «احتمال وجود آثار» قد يحتوي على الغلوتين.",
        },
        {
          type: "paragraph",
          text: "تقع تركيبة المنتجات والأطباق وتحضيرها ومطابقتها على مسؤولية التاجر الذي يصنعها أو يحضّرها. وفي الحدود التي يسمح بها القانون، لا يمكن تحميل CeliacCare مسؤولية أي ردّ فعل مرتبط بمنتج أو طبق، خاصة في حال تغيير الوصفة دون إعلام.",
        },
      ],
    },
    {
      id: "avis-et-signalements",
      title: "التقييمات والبلاغات",
      blocks: [
        {
          type: "list",
          items: [
            "تُنشر التقييمات **بعد مراجعتها**. ويجب أن تصف تجربتك الحقيقية وأن تبقى مهذّبة: نرفض المحتوى المسيء أو التمييزي أو الإشهاري أو الخارج عن الموضوع.",
            "بنشرك تقييمًا، فإنك تأذن لـ CeliacCare بعرضه على الموقع.",
            "يتيح زر «الإبلاغ عن خطأ» تنبيهنا إلى معلومة غير دقيقة، ويُدرس كل بلاغ ويُتابَع.",
          ],
        },
      ],
    },
    {
      id: "bon-usage",
      title: "حسن استعمال الموقع",
      blocks: [
        {
          type: "paragraph",
          text: "يُمنع استعمال الموقع بطريقة احتيالية: طلبيات وهمية، إرسال آلي، جمع المعطيات، محاولة النفاذ إلى فضاء الإدارة. وفي حال التجاوز، يمكن لـ CeliacCare رفض طلبية أو حجب رقم هاتف أو تعليق النفاذ إلى الخدمات.",
        },
      ],
    },
    {
      id: "droit-applicable",
      title: "القانون المنطبق",
      blocks: [
        {
          type: "paragraph",
          text: "تخضع هذه الشروط **للقانون التونسي**. وفي حال النزاع، يتم البحث أولًا عن حلّ ودّي، وإلا فتختص المحاكم التونسية بالنظر فيه.",
        },
        {
          type: "paragraph",
          text: "يمكن لـ CeliacCare تعديل هذه الشروط، والنسخة المنطبقة هي المنشورة على الموقع عند تقديم طلبيتك. لديك سؤال؟ [راسلنا](/contact).",
        },
      ],
    },
  ],
};
