import { siteConfig } from "@/lib/site-config";
import { MAX_ORDERS_PER_DAY } from "@/lib/tunisia";
import type { Locale } from "@/types";

/* ==========================================================================
   Questions of the FAQ page (/faq), in French and in Arabic.
   Answers are lists of paragraphs; they can use **bold** and [links](/path)
   (see components/content/rich-text.tsx). Keep the same group and question
   ids in both languages: they are the anchors of the page (/faq#paiement).
   ========================================================================== */

export type FaqItem = { id: string; question: string; answer: string[] };

/** Group ids are also used to pick the icon of the group (app/[lang]/faq/page.tsx). */
export type FaqGroupId = "site" | "commandes" | "garantie" | "partenaires" | "donnees";

export type FaqGroup = { id: FaqGroupId; title: string; items: FaqItem[] };

const email = `[${siteConfig.email}](mailto:${siteConfig.email})`;
const retentionDays = siteConfig.deliveryDataRetentionDays;

export const faq: Record<Locale, FaqGroup[]> = {
  fr: [
    {
      id: "site",
      title: "Le site",
      items: [
        {
          id: "celiaccare",
          question: "Qu'est-ce que CeliacCare ?",
          answer: [
            "CeliacCare est une plateforme tunisienne dédiée au sans gluten. Elle réunit des **produits fabriqués par de petits artisans et commerces locaux**, des **restaurants partenaires** où commander des plats sans gluten, et des conseils pratiques pour les personnes cœliaques ou sensibles au gluten.",
            "Chaque fiche indique un niveau de garantie, la source de l'information et sa date de vérification.",
          ],
        },
        {
          id: "compte",
          question: "Faut-il créer un compte ?",
          answer: [
            "Non. Vous pouvez consulter les produits, les artisans et les restaurants, puis commander, sans créer de compte. Pour suivre une commande, il suffit de sa référence et du numéro de téléphone utilisé : rendez-vous sur [Suivre ma commande](/suivi).",
          ],
        },
        {
          id: "petits-producteurs",
          question: "Pourquoi ne trouve-t-on pas de grandes marques ?",
          answer: [
            "C'est un choix : CeliacCare met en avant les **petits producteurs, artisans, coopératives et commerces de quartier** tunisiens qui font l'effort de proposer du sans gluten. Les produits industriels se trouvent déjà en grande surface ; nous voulons faire connaître ceux que l'on ne trouve nulle part ailleurs.",
          ],
        },
      ],
    },
    {
      id: "commandes",
      title: "Les commandes & la livraison",
      items: [
        {
          id: "commander",
          question: "Comment passer une commande ?",
          answer: [
            "Ajoutez à votre panier des produits de nos artisans, ou les plats d'un restaurant partenaire : un panier contient soit des produits d'artisans, soit les plats d'un seul restaurant.",
            "Indiquez ensuite votre nom, votre numéro de téléphone et votre adresse de livraison. Un récapitulatif (articles, montant, frais et délai de livraison) s'affiche avant la confirmation, puis vous recevez une référence pour suivre votre commande.",
          ],
        },
        {
          id: "limite-par-jour",
          question: `Pourquoi ${MAX_ORDERS_PER_DAY} commandes maximum par jour ?`,
          answer: [
            `Pour protéger les commerçants contre les fausses commandes et les robots, chaque numéro de téléphone peut passer **au maximum ${MAX_ORDERS_PER_DAY} commandes par jour**. Le compteur repart à zéro chaque jour à minuit, heure de Tunis.`,
            "Si vous atteignez la limite, un message vous l'indique : il suffit de réessayer le lendemain. Pour un besoin particulier (une association, un événement…), [écrivez-nous](/contact?sujet=ORDER).",
          ],
        },
        {
          id: "paiement",
          question: "Comment se fait le paiement ?",
          answer: [
            "Le paiement se fait **à la livraison**, en espèces ou, lorsque c'est proposé, par carte bancaire au moment de la remise. Vous ne payez rien en ligne et aucune donnée bancaire n'est demandée sur le site.",
          ],
        },
        {
          id: "livraison",
          question: "Où livrez-vous, en combien de temps et à quel prix ?",
          answer: [
            "Les produits de nos artisans sont livrés dans les gouvernorats couverts par notre réseau. Pour chacun, les **frais**, le **délai** et, le cas échéant, le montant à partir duquel la livraison est offerte s'affichent avant la confirmation de la commande.",
            "Les restaurants partenaires livrent dans leur propre zone : leurs frais, leur délai et leur minimum de commande sont indiqués sur leur page.",
          ],
        },
        {
          id: "suivi",
          question: "Comment suivre ou modifier ma commande ?",
          answer: [
            "Rendez-vous sur [Suivre ma commande](/suivi) avec votre référence et votre numéro de téléphone pour voir son statut : en attente, confirmée, en préparation, en cours de livraison ou livrée.",
            "Pour modifier ou annuler une commande, contactez-nous au plus vite, avant sa préparation, via le [formulaire de contact](/contact?sujet=ORDER) ou sur WhatsApp.",
          ],
        },
      ],
    },
    {
      id: "garantie",
      title: "La garantie sans gluten",
      items: [
        {
          id: "niveaux-de-garantie",
          question: "Que signifient les 3 niveaux de garantie ?",
          answer: [
            "**Certifié sans gluten** : le produit ou l'établissement est certifié par un organisme officiel ; nous avons vérifié le logo, l'organisme et le numéro de certification.",
            "**Naturellement sans gluten** : la recette ne contient pas de gluten, ou l'option sans gluten est préparée avec des précautions, sans certification officielle.",
            "**Risque de traces** : aucun ingrédient ne contient de gluten, mais une contamination croisée reste possible (atelier ou cuisine partagés).",
          ],
        },
        {
          id: "verification",
          question: "Comment vérifiez-vous les informations ?",
          answer: [
            "Avant de publier une fiche, nous vérifions les ingrédients, les pratiques de préparation et, s'il y a lieu, les certificats, auprès du commerçant ou sur place. Chaque fiche affiche sa **source** et sa **date de vérification**.",
            "Une fiche qui n'a pas été revérifiée depuis plus de 12 mois est signalée automatiquement et remise en révision.",
          ],
        },
        {
          id: "risque-de-traces",
          question: "Un produit « Risque de traces » convient-il à une personne cœliaque ?",
          answer: [
            "En général, non : pour une personne cœliaque, même une très petite quantité de gluten peut être nocive. Ces produits s'adressent plutôt aux personnes moins sensibles. En cas de doute, demandez l'avis de votre médecin ou de votre diététicien.",
          ],
        },
        {
          id: "signaler-une-erreur",
          question: "J'ai repéré une erreur sur une fiche : que faire ?",
          answer: [
            "Merci ! Utilisez le bouton **« Signaler une erreur »** présent sur chaque fiche de produit, d'artisan ou de restaurant. Notre équipe examine chaque signalement et corrige la fiche si nécessaire.",
            "Gardez aussi le réflexe de lire l'étiquette : CeliacCare informe, mais les recettes peuvent changer.",
          ],
        },
      ],
    },
    {
      id: "partenaires",
      title: "Les artisans & restaurants",
      items: [
        {
          id: "devenir-partenaire",
          question: "Je suis artisan ou restaurateur : comment devenir partenaire ?",
          answer: [
            "Écrivez-nous via le [formulaire de contact](/contact?sujet=PARTNERSHIP), sujet « Devenir partenaire ». Présentez votre activité, vos produits ou plats sans gluten et vos précautions (atelier séparé, ustensiles dédiés, certification…).",
            "Nous vérifions vos informations, puis nous publions votre fiche avec son niveau de garantie. Les restaurants conventionnés peuvent ensuite recevoir des commandes en ligne.",
          ],
        },
        {
          id: "proposer-une-adresse",
          question: "Comment proposer une adresse que je connais ?",
          answer: [
            "Une boulangerie, une épicerie ou un restaurant propose du sans gluten près de chez vous ? [Proposez cette adresse](/contact?sujet=SUGGESTION) en indiquant son nom, sa ville et ce que vous y avez trouvé. Nous la vérifierons avant de l'ajouter.",
          ],
        },
        {
          id: "avis",
          question: "Les avis sont-ils vérifiés ?",
          answer: [
            "Oui. Chaque avis est **lu par notre équipe avant publication** : les avis injurieux, publicitaires ou hors sujet sont refusés. Les notes affichées ne tiennent compte que des avis approuvés.",
          ],
        },
      ],
    },
    {
      id: "donnees",
      title: "Vos données",
      items: [
        {
          id: "donnees-de-livraison",
          question: "Que faites-vous de mes données de livraison ?",
          answer: [
            `Votre nom, votre téléphone et votre adresse servent **uniquement à livrer votre commande**. Ils sont transmis seulement au commerçant concerné et, s'il y a lieu, au livreur, puis supprimés ${retentionDays} jours après la livraison. Nous ne les vendons ni ne les partageons jamais.`,
            "Tous les détails se trouvent dans notre [politique de confidentialité](/confidentialite).",
          ],
        },
        {
          id: "cookies",
          question: "Utilisez-vous des cookies ?",
          answer: [
            "Seulement ceux qui sont indispensables : votre panier est enregistré dans votre navigateur, un cookie retient la langue choisie, et l'espace administrateur utilise un cookie de session. **Aucun cookie publicitaire ni de mesure d'audience.**",
          ],
        },
        {
          id: "vos-droits",
          question: "Comment consulter ou faire supprimer mes données ?",
          answer: [
            `Conformément à la loi organique n° 2004-63, vous pouvez accéder à vos données, les faire rectifier ou supprimer. Écrivez-nous via le [formulaire de contact](/contact) ou à ${email}.`,
          ],
        },
      ],
    },
  ],

  ar: [
    {
      id: "site",
      title: "الموقع",
      items: [
        {
          id: "celiaccare",
          question: "ما هو CeliacCare؟",
          answer: [
            "CeliacCare منصة تونسية مخصّصة للأغذية الخالية من الغلوتين. تجمع **منتجات يصنعها حرفيون ومحلات محلية صغيرة**، و**مطاعم شريكة** يمكنك أن تطلب منها أطباقًا خالية من الغلوتين، ونصائح عملية لمرضى السيلياك والأشخاص الحساسين للغلوتين.",
            "تعرض كل بطاقة مستوى الضمان ومصدر المعلومة وتاريخ التحقق منها.",
          ],
        },
        {
          id: "compte",
          question: "هل يجب إنشاء حساب؟",
          answer: [
            "لا. يمكنك تصفّح المنتجات والحرفيين والمطاعم، ثم الطلب، دون إنشاء حساب. ولتتبّع طلبيتك يكفي مرجعها ورقم الهاتف المستعمل: توجّه إلى صفحة [تتبّع طلبي](/suivi).",
          ],
        },
        {
          id: "petits-producteurs",
          question: "لماذا لا نجد العلامات التجارية الكبرى؟",
          answer: [
            "إنه اختيار مقصود: يسلّط CeliacCare الضوء على **صغار المنتجين والحرفيين والتعاضديات ومحلات الأحياء** في تونس، الذين يبذلون جهدًا لتقديم منتجات خالية من الغلوتين. فالمنتجات الصناعية متوفرة أصلًا في المساحات الكبرى، ونحن نريد التعريف بما لا تجده في مكان آخر.",
          ],
        },
      ],
    },
    {
      id: "commandes",
      title: "الطلبات والتوصيل",
      items: [
        {
          id: "commander",
          question: "كيف أقدّم طلبية؟",
          answer: [
            "أضف إلى سلتك منتجات حرفيينا أو أطباق أحد المطاعم الشريكة: تحتوي السلة إمّا على منتجات الحرفيين، وإمّا على أطباق مطعم واحد فقط.",
            "بعد ذلك أدخل اسمك ورقم هاتفك وعنوان التوصيل. يظهر لك ملخّص (المنتجات، المبلغ، معلوم التوصيل ومدّته) قبل التأكيد، ثم تتلقى مرجعًا لتتبّع طلبيتك.",
          ],
        },
        {
          id: "limite-par-jour",
          question: "لماذا ثلاث طلبات على الأكثر في اليوم؟",
          answer: [
            `لحماية التجار من الطلبات الوهمية والروبوتات، يمكن لكل رقم هاتف أن يقدّم **${MAX_ORDERS_PER_DAY} طلبات على الأكثر في اليوم**. ويعود العدّاد إلى الصفر كل يوم عند منتصف الليل بتوقيت تونس.`,
            "إذا بلغت هذا الحد تظهر لك رسالة توضّح ذلك، ويكفي أن تعيد المحاولة في اليوم الموالي. ولأي حاجة خاصة (جمعية، مناسبة…) [راسلنا](/contact?sujet=ORDER).",
          ],
        },
        {
          id: "paiement",
          question: "كيف يتم الدفع؟",
          answer: [
            "يتم الدفع **عند الاستلام**، نقدًا أو بالبطاقة البنكية عند التسليم إذا كانت هذه الخدمة متاحة. لا تدفع أي مبلغ عبر الإنترنت، ولا يطلب منك الموقع أي معطيات بنكية.",
          ],
        },
        {
          id: "livraison",
          question: "أين توصلون، وفي كم من الوقت، وبأي سعر؟",
          answer: [
            "نوصل منتجات حرفيينا إلى الولايات التي تغطيها شبكتنا. ولكل ولاية يظهر **معلوم التوصيل** و**مدّته**، وعند الاقتضاء المبلغ الذي يصبح التوصيل ابتداءً منه مجانيًا، وذلك قبل تأكيد الطلبية.",
            "أما المطاعم الشريكة فتوصل داخل منطقتها الخاصة، ويُذكر معلوم التوصيل ومدّته والحد الأدنى للطلب في صفحة كل مطعم.",
          ],
        },
        {
          id: "suivi",
          question: "كيف أتتبّع طلبيتي أو أعدّلها؟",
          answer: [
            "توجّه إلى صفحة [تتبّع طلبي](/suivi) وأدخل المرجع ورقم هاتفك لمعرفة حالتها: في الانتظار، مؤكدة، قيد التحضير، في الطريق إليك أو تم تسليمها.",
            "لتعديل طلبية أو إلغائها، اتصل بنا في أسرع وقت قبل بدء تحضيرها، عبر [استمارة الاتصال](/contact?sujet=ORDER) أو على واتساب.",
          ],
        },
      ],
    },
    {
      id: "garantie",
      title: "ضمان الخلو من الغلوتين",
      items: [
        {
          id: "niveaux-de-garantie",
          question: "ماذا تعني مستويات الضمان الثلاثة؟",
          answer: [
            "**حاصل على شهادة خالٍ من الغلوتين**: المنتج أو المؤسسة حاصلة على شهادة من هيئة رسمية، وقد تحققنا من الشعار والهيئة ورقم الشهادة.",
            "**خالٍ من الغلوتين بطبيعته**: الوصفة لا تحتوي على الغلوتين، أو يُحضَّر الخيار الخالي من الغلوتين مع اتخاذ احتياطات، دون شهادة رسمية.",
            "**احتمال وجود آثار**: لا يحتوي أي مكوّن على الغلوتين، لكن التلوث المتبادل يبقى ممكنًا (ورشة أو مطبخ مشترك).",
          ],
        },
        {
          id: "verification",
          question: "كيف تتحققون من المعلومات؟",
          answer: [
            "قبل نشر أي بطاقة، نتحقق من المكوّنات وطرق التحضير، ومن الشهادات عند الاقتضاء، لدى التاجر أو في عين المكان. وتعرض كل بطاقة **مصدرها** و**تاريخ التحقق** منها.",
            "وإذا لم تتم مراجعة بطاقة منذ أكثر من 12 شهرًا، يُشار إليها آليًا وتُعاد إلى المراجعة.",
          ],
        },
        {
          id: "risque-de-traces",
          question: "هل يناسب منتجٌ يحمل عبارة «احتمال وجود آثار» مريضَ السيلياك؟",
          answer: [
            "في الغالب لا، فحتى كمية صغيرة جدًا من الغلوتين قد تضرّ مريض السيلياك. هذه المنتجات موجّهة بالأحرى إلى الأشخاص الأقل حساسية. وعند الشك، استشر طبيبك أو أخصائي التغذية.",
          ],
        },
        {
          id: "signaler-une-erreur",
          question: "لاحظت خطأ في إحدى البطاقات، ماذا أفعل؟",
          answer: [
            "شكرًا لك! استعمل زر **«الإبلاغ عن خطأ»** الموجود في كل بطاقة منتج أو حرفي أو مطعم. يدرس فريقنا كل بلاغ ويصحّح البطاقة عند الحاجة.",
            "وحافظ دائمًا على عادة قراءة الملصق: CeliacCare يقدّم معلومات، لكن الوصفات قد تتغيّر.",
          ],
        },
      ],
    },
    {
      id: "partenaires",
      title: "الحرفيون والمطاعم",
      items: [
        {
          id: "devenir-partenaire",
          question: "أنا حرفي أو صاحب مطعم: كيف أصبح شريكًا؟",
          answer: [
            "راسلنا عبر [استمارة الاتصال](/contact?sujet=PARTNERSHIP) باختيار موضوع «أن أصبح شريكًا». عرّفنا بنشاطك وبمنتجاتك أو أطباقك الخالية من الغلوتين وباحتياطاتك (ورشة منفصلة، أدوات مخصصة، شهادة…).",
            "نتحقق من معلوماتك ثم ننشر بطاقتك مع مستوى الضمان الخاص بها. ويمكن للمطاعم المتعاقدة بعد ذلك أن تستقبل طلبات عبر الإنترنت.",
          ],
        },
        {
          id: "proposer-une-adresse",
          question: "كيف أقترح عنوانًا أعرفه؟",
          answer: [
            "هل توجد قربك مخبزة أو بقالة أو مطعم يقدّم منتجات خالية من الغلوتين؟ [اقترح هذا العنوان](/contact?sujet=SUGGESTION) مع ذكر اسمه ومدينته وما وجدته فيه، وسنتحقق منه قبل إضافته.",
          ],
        },
        {
          id: "avis",
          question: "هل تتم مراجعة التقييمات؟",
          answer: [
            "نعم. **يقرأ فريقنا كل تقييم قبل نشره**، ونرفض التقييمات المسيئة أو الإشهارية أو الخارجة عن الموضوع. ولا تُحتسب في المعدّل المعروض إلا التقييمات المقبولة.",
          ],
        },
      ],
    },
    {
      id: "donnees",
      title: "معطياتك الشخصية",
      items: [
        {
          id: "donnees-de-livraison",
          question: "ماذا تفعلون بمعطيات التوصيل الخاصة بي؟",
          answer: [
            `يُستعمل اسمك وهاتفك وعنوانك **لتوصيل طلبيتك فقط**. لا تُرسَل إلا إلى التاجر المعني، وإلى عامل التوصيل عند الاقتضاء، ثم تُحذف بعد ${retentionDays} يومًا من التسليم. ونحن لا نبيعها ولا نشاركها أبدًا.`,
            "تجد كل التفاصيل في [سياسة الخصوصية](/confidentialite).",
          ],
        },
        {
          id: "cookies",
          question: "هل تستعملون ملفات تعريف الارتباط (الكوكيز)؟",
          answer: [
            "نستعمل فقط ما هو ضروري: تُحفظ سلتك في متصفحك، ويتذكّر ملف تعريف ارتباط اللغة التي اخترتها، ويستعمل فضاء الإدارة ملف جلسة. **لا نستعمل أي ملفات إشهارية أو لقياس عدد الزوار.**",
          ],
        },
        {
          id: "vos-droits",
          question: "كيف أطّلع على معطياتي أو أطلب حذفها؟",
          answer: [
            `وفقًا للقانون الأساسي عدد 63 لسنة 2004، يحق لك النفاذ إلى معطياتك وطلب تصحيحها أو حذفها. راسلنا عبر [استمارة الاتصال](/contact) أو على العنوان ${email}.`,
          ],
        },
      ],
    },
  ],
};
