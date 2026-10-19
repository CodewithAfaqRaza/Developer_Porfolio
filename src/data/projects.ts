export type PortfolioProject = {
  id: string;
  title: string;
  eyebrow: string;
  summary: string;
  role: string;
  year?: string;
  stack: string[];
  cover?: string;
  mobileCover?: string;
  mobilePreviewKind?: "capture" | "concept";
  href?: string;
  languageVersions?: { language: string; locale: string; href: string }[];
  languageNote?: string;
  contributions: string[];
  outcome?: string;
  approvedForPortfolio: boolean;
  isDemo: boolean;
  visual: "event" | "content" | "motion";
  challenge: string;
  siteExperience?: string;
  monogram?: string;
};


// Project participation and integration scope supplied by Danyal.
// Site descriptions and visible motion reviewed on 13 October 2026.
export const projects: PortfolioProject[] = [
  {
    id: "leap",
    languageVersions: [{ language: "Arabic", locale: "ar", href: "https://onegiantleap.com/ar/node/4974" }],
    languageNote: "Arabic event content is available; the linked page reflects an earlier event edition.",
    mobileCover: "/images/projects/color/leap-mobile-concept.jpg",
    mobilePreviewKind: "concept",
    cover: "/images/projects/color/leap.jpg",
    title: "LEAP",
    eyebrow: "TECHNOLOGY / GLOBAL EVENTS",
    summary: "A technology event platform connecting innovators, speakers, exhibitors, and investors.",
    role: "Drupal development & integrations",
    stack: [
      "Drupal",
      "Multilingual",
      "Swapcard",
      "Custom UTM",
      "API integration"
    ],
    href: "https://onegiantleap.com/",
    contributions: [
      "Drupal website development",
      "Swapcard integration",
      "Custom UTM tracking",
      "API integration"
    ],
    approvedForPortfolio: true,
    isDemo: false,
    visual: "event",
    challenge: "Build connected digital journeys for a large technology event, bringing Drupal content and external event systems together.",
    monogram: "LEAP"
  },
  {
    id: "black-hat-mea",
    languageVersions: [{ language: "Arabic", locale: "ar", href: "https://blackhatmea.com/ar/ar" }],
    languageNote: "An Arabic landing page is available; this does not imply every page is translated.",
    mobileCover: "/images/projects/color/black-hat-mea-mobile-concept.jpg",
    mobilePreviewKind: "concept",
    cover: "/images/projects/color/black-hat-mea.jpg",
    title: "Black Hat MEA",
    eyebrow: "CYBERSECURITY / EVENTS",
    summary: "A cybersecurity conference and exhibition website for the regional infosec community.",
    role: "Drupal development & integrations",
    stack: [
      "Drupal",
      "Multilingual",
      "Swapcard",
      "Custom UTM",
      "API integration"
    ],
    href: "https://blackhatmea.com/",
    contributions: [
      "Drupal website development",
      "Swapcard integration",
      "Custom UTM tracking",
      "API integration"
    ],
    approvedForPortfolio: true,
    isDemo: false,
    visual: "content",
    challenge: "Support a cybersecurity event website with Drupal development and connected registration and event experiences.",
    monogram: "BH"
  },
  {
    id: "cityscape-global",
    languageVersions: [{ language: "Arabic", locale: "ar", href: "https://cityscapeglobal.com/ar" }],
    languageNote: "English and Arabic website content.",
    mobileCover: "/images/projects/color/cityscape-global-mobile-concept.jpg",
    mobilePreviewKind: "concept",
    cover: "/images/projects/color/cityscape-global.jpg",
    title: "Cityscape Global",
    eyebrow: "REAL ESTATE / EVENTS",
    summary: "A real estate event platform connecting property, investment, and development communities.",
    role: "Drupal development & integrations",
    stack: [
      "Drupal",
      "Multilingual",
      "Swapcard",
      "Custom UTM",
      "API integration"
    ],
    href: "https://cityscapeglobal.com/",
    contributions: [
      "Drupal website development",
      "Swapcard integration",
      "Custom UTM tracking",
      "API integration"
    ],
    approvedForPortfolio: true,
    isDemo: false,
    visual: "content",
    challenge: "Support a real estate event website with Drupal content and connected third-party event integrations.",
    monogram: "CG"
  },
  {
    id: "kingdom-of-gaming",
    mobileCover: "/images/projects/color/kingdom-of-gaming-mobile.jpg",
    mobilePreviewKind: "capture",
    title: "Kingdom of Gaming",
    eyebrow: "GAMING / EVENTS",
    summary: "A gaming industry and culture event website with a vivid animated video hero.",
    role: "Drupal development & integrations",
    stack: [
      "Drupal",
      "Swapcard",
      "Custom UTM",
      "Custom URN",
      "API integration"
    ],
    href: "https://kingdomofgaming.com/",
    contributions: [
      "Drupal website development",
      "Swapcard integration",
      "Custom UTM tracking",
      "Custom URN handling",
      "API integration"
    ],
    approvedForPortfolio: true,
    isDemo: false,
    visual: "content",
    challenge: "Connect Drupal event content and external platforms for a gaming industry audience.",
    monogram: "KOG",
    cover: "/images/projects/color/kingdom-of-gaming.jpg",
    siteExperience: "The public site uses a looping animated video hero with a gaming-inspired visual identity."
  },
  {
    id: "umrah-ziyarah",
    languageVersions: [{ language: "Arabic", locale: "ar", href: "https://umrah-ziyarah.com/ar" }],
    languageNote: "English and Arabic website content, including right-to-left Arabic pages.",
    mobileCover: "/images/projects/color/umrah-ziyarah-mobile.jpg",
    mobilePreviewKind: "capture",
    title: "Umrah & Ziyarah Forum",
    eyebrow: "TRAVEL & PILGRIMAGE / EVENTS",
    summary: "A forum website serving the Umrah and Ziyarah ecosystem with event content and visitor journeys.",
    role: "Drupal development & integrations",
    stack: [
      "Drupal",
      "Multilingual",
      "Swapcard",
      "Custom UTM",
      "API integration"
    ],
    href: "https://umrah-ziyarah.com/",
    contributions: [
      "Drupal website development",
      "Swapcard integration",
      "Custom UTM tracking",
      "API integration"
    ],
    approvedForPortfolio: true,
    isDemo: false,
    visual: "content",
    challenge: "Contribute Drupal development and integrations for an event serving pilgrimage and travel professionals.",
    monogram: "UZ",
    cover: "/images/projects/color/umrah-ziyarah.jpg",
    siteExperience: "The public site uses an autoplaying video hero and carries UTM campaign parameters through navigation."
  },
  {
    "id": "money2020-middle-east",
    "title": "Money20/20 Middle East",
    "eyebrow": "FINTECH / EVENTS",
    "summary": "A fintech event website connecting financial services, payments, technology, startups and investors.",
    "role": "Drupal development & integrations",
    "stack": [
      "Drupal",
      "Swapcard",
      "Custom UTM",
      "API integration"
    ],
    "href": "https://money2020middleeast.com/",
    "contributions": [
      "Drupal website development",
      "Swapcard integration",
      "Custom UTM tracking",
      "API integration"
    ],
    "challenge": "Connect fintech event content with external platforms and campaign-aware visitor journeys.",
    "monogram": "M20",
    "mobileCover": "/images/projects/color/money2020-middle-east-mobile-concept.jpg",
    "mobilePreviewKind": "concept",
    "cover": "/images/projects/color/money2020-middle-east.jpg",
    "approvedForPortfolio": true,
    "isDemo": false,
    "visual": "content"
  },
  {
    "id": "cityscape-west-ksa",
    languageVersions: [{ language: "Arabic", locale: "ar", href: "https://cityscapewestksa.com/ar/form/book-a-stand-enquiry-form" }],
    languageNote: "An Arabic enquiry form is available; the Arabic homepage route still contains substantial English text.",
    "title": "Cityscape West KSA",
    "eyebrow": "REAL ESTATE / EVENTS",
    "summary": "A real estate event website presenting property development and investment opportunities in western Saudi Arabia.",
    "role": "Drupal development",
    "stack": ["Drupal", "Multilingual"],
    "href": "https://cityscapewestksa.com/",
    "contributions": [
      "Drupal website development"
    ],
    "challenge": "Contribute Drupal development for a real estate event website and its content publishing experience.",
    "monogram": "CW",
    "mobileCover": "/images/projects/color/cityscape-west-ksa-mobile-concept.jpg",
    "mobilePreviewKind": "concept",
    "cover": "/images/projects/color/cityscape-west-ksa.jpg",
    "approvedForPortfolio": true,
    "isDemo": false,
    "visual": "content"
  },
  {
    id: "deepfest",
    mobileCover: "/images/projects/color/deepfest-mobile-concept.jpg",
    mobilePreviewKind: "concept",
    cover: "/images/projects/color/deepfest.jpg",
    title: "DeepFest",
    eyebrow: "ARTIFICIAL INTELLIGENCE / EVENTS",
    summary: "An AI event website bringing together technology leaders, researchers, and industry communities.",
    role: "Drupal development & integrations",
    stack: [
      "Drupal",
      "Swapcard",
      "Custom UTM",
      "API integration"
    ],
    href: "https://deepfest.com/",
    contributions: [
      "Drupal website development",
      "Swapcard integration",
      "Custom UTM tracking",
      "API integration"
    ],
    approvedForPortfolio: true,
    isDemo: false,
    visual: "content",
    challenge: "Connect AI event content with external platforms and campaign-aware visitor journeys.",
    monogram: "DF"
  },
  {
    id: "leap-east",
    languageVersions: [{ language: "Chinese", locale: "zh", href: "https://www.leapeast.com.cn/" }],
    languageNote: "The English website links to a separate Chinese edition.",
    mobileCover: "/images/projects/color/leap-east-mobile.jpg",
    mobilePreviewKind: "capture",
    cover: "/images/projects/color/leap-east.jpg",
    title: "LEAP East",
    eyebrow: "TECHNOLOGY / HONG KONG",
    summary: "A Hong Kong technology event website connecting enterprises, investors, startups, and global innovators.",
    role: "Drupal development & integrations",
    stack: ["Drupal", "Multilingual", "Swapcard", "Custom UTM", "API integration"],
    href: "https://leapeast.com/",
    contributions: ["Drupal website development", "Swapcard integration", "Custom UTM tracking", "API integration"],
    approvedForPortfolio: true,
    isDemo: false,
    visual: "content",
    challenge: "Contribute Drupal website development for LEAP’s Hong Kong event and its technology-focused content and visitor journeys.",
    monogram: "LE"
  },
  {
    id: "bio-middle-east",
    languageVersions: [{ language: "Arabic", locale: "ar", href: "https://biomiddleeast.com/ar" }],
    languageNote: "English and Arabic website content, including right-to-left Arabic pages.",
    mobileCover: "/images/projects/color/bio-middle-east-mobile.jpg",
    mobilePreviewKind: "capture",
    title: "BIO Middle East",
    eyebrow: "BIOTECHNOLOGY / EVENTS",
    summary: "A biotechnology and life sciences event website supporting industry discovery and participation.",
    role: "Drupal development & integrations",
    stack: [
      "Drupal",
      "Multilingual",
      "Swapcard",
      "Custom UTM",
      "API integration"
    ],
    href: "https://biomiddleeast.com/",
    contributions: [
      "Drupal website development",
      "Swapcard integration",
      "Custom UTM tracking",
      "API integration"
    ],
    approvedForPortfolio: true,
    isDemo: false,
    visual: "content",
    challenge: "Connect Drupal event content with external systems and campaign-aware journeys for a biotechnology audience.",
    monogram: "BIO",
    cover: "/images/projects/color/bio-middle-east.jpg"
  },
  {
    id: "idwsc",
    languageVersions: [{ language: "Arabic", locale: "ar", href: "https://idwsc.com/ar" }],
    languageNote: "English and Arabic website content.",
    mobileCover: "/images/projects/color/idwsc-mobile-concept.jpg",
    mobilePreviewKind: "concept",
    cover: "/images/projects/color/idwsc.jpg",
    title: "Global Water Sustainability Conference",
    eyebrow: "WATER SUSTAINABILITY / EVENTS",
    summary: "A conference website connecting the global water sustainability community.",
    role: "Drupal development & integrations",
    stack: [
      "Drupal",
      "Multilingual",
      "Swapcard",
      "Custom UTM",
      "API integration"
    ],
    href: "https://idwsc.com/",
    contributions: [
      "Drupal website development",
      "Swapcard integration",
      "Custom UTM tracking",
      "API integration"
    ],
    approvedForPortfolio: true,
    isDemo: false,
    visual: "content",
    challenge: "Support Drupal development and event integrations for a water sustainability conference.",
    monogram: "GWSC"
  },
  {
    id: "red-sea-yacht-show",
    languageVersions: [{ language: "Arabic", locale: "ar", href: "https://redseayachtshow.com/ar" }],
    languageNote: "English and Arabic website content, including right-to-left Arabic pages.",
    mobileCover: "/images/projects/color/red-sea-yacht-show-mobile.jpg",
    mobilePreviewKind: "capture",
    title: "Red Sea Yacht Show",
    eyebrow: "MARINE & LIFESTYLE / EVENTS",
    summary: "A yacht show website with an immersive, video-led digital experience.",
    role: "Drupal development & integrations",
    stack: [
      "Drupal",
      "Multilingual",
      "Swapcard",
      "Custom UTM",
      "API integration"
    ],
    href: "https://redseayachtshow.com/",
    contributions: [
      "Drupal website development",
      "Swapcard integration",
      "Custom UTM tracking",
      "API integration"
    ],
    approvedForPortfolio: true,
    isDemo: false,
    visual: "content",
    challenge: "Contribute Drupal development and integrations to a yacht show website with a distinctive visual experience.",
    monogram: "RSYS",
    cover: "/images/projects/color/red-sea-yacht-show.jpg",
    siteExperience: "The public site uses a multi-video experience with forward/reverse sequences, looping scenes, and animated floating elements."
  },
  {
    id: "tahaluf",
    languageVersions: [{ language: "Arabic", locale: "ar", href: "https://tahaluf.com/ar" }],
    languageNote: "English and Arabic corporate website content.",
    mobileCover: "/images/projects/color/tahaluf-mobile-concept.jpg",
    mobilePreviewKind: "concept",
    cover: "/images/projects/color/tahaluf.jpg",
    title: "Tahaluf",
    eyebrow: "CORPORATE / EVENT ORGANISER",
    summary: "A corporate website presenting an international event organiser and its event portfolio.",
    role: "Drupal development contributor",
    stack: ["Drupal", "Multilingual"],
    href: "https://tahaluf.com/",
    contributions: [
      "Drupal website development"
    ],
    approvedForPortfolio: true,
    isDemo: false,
    visual: "content",
    challenge: "Contribute Drupal development to the corporate website and its publishing experience.",
    monogram: "T"
  },
  {
    id: "american-elements",
    mobileCover: "/images/projects/color/american-elements-mobile-concept.jpg",
    mobilePreviewKind: "concept",
    cover: "/images/projects/color/american-elements.jpg",
    title: "American Elements",
    eyebrow: "ECOMMERCE / ADVANCED MATERIALS",
    summary: "An advanced materials ecommerce website combining a large product catalog, technical information and customer purchasing enquiries.",
    role: "Drupal & ecommerce development contributor",
    stack: ["Drupal", "Ecommerce", "Product catalog"],
    href: "https://www.americanelements.com/",
    contributions: [
      "Drupal website development",
      "Ecommerce website development",
      "Product catalog and technical content presentation"
    ],
    approvedForPortfolio: true,
    isDemo: false,
    visual: "content",
    challenge: "Support a Drupal ecommerce website that connects extensive materials and product information with purchasing and quote-request journeys.",
    siteExperience: "The public website includes product search, a shopping cart, customer sign-in and quote-request journeys alongside technical materials content.",
    monogram: "AE"
  },
];
