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
    mobileCover: "/images/projects/color/leap-mobile-concept.jpg",
    mobilePreviewKind: "concept",
    cover: "/images/projects/color/leap.jpg",
    title: "LEAP",
    eyebrow: "TECHNOLOGY / GLOBAL EVENTS",
    summary: "A technology event platform connecting innovators, speakers, exhibitors, and investors.",
    role: "Drupal development & integrations",
    stack: [
      "Drupal",
      "Swapcard",
      "Custom UTM",
      "Custom URN",
      "API integration"
    ],
    href: "https://onegiantleap.com/",
    contributions: [
      "Drupal website development",
      "Swapcard integration",
      "Custom UTM tracking",
      "Custom URN handling",
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
    mobileCover: "/images/projects/color/black-hat-mea-mobile-concept.jpg",
    mobilePreviewKind: "concept",
    cover: "/images/projects/color/black-hat-mea.jpg",
    title: "Black Hat MEA",
    eyebrow: "CYBERSECURITY / EVENTS",
    summary: "A cybersecurity conference and exhibition website for the regional infosec community.",
    role: "Drupal development & integrations",
    stack: [
      "Drupal",
      "Swapcard",
      "Custom UTM",
      "Custom URN",
      "API integration"
    ],
    href: "https://blackhatmea.com/",
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
    challenge: "Support a cybersecurity event website with Drupal development and connected registration and event experiences.",
    monogram: "BH"
  },
  {
    id: "cityscape-global",
    mobileCover: "/images/projects/color/cityscape-global-mobile-concept.jpg",
    mobilePreviewKind: "concept",
    cover: "/images/projects/color/cityscape-global.jpg",
    title: "Cityscape Global",
    eyebrow: "REAL ESTATE / EVENTS",
    summary: "A real estate event platform connecting property, investment, and development communities.",
    role: "Drupal development & integrations",
    stack: [
      "Drupal",
      "Swapcard",
      "Custom UTM",
      "Custom URN",
      "API integration"
    ],
    href: "https://cityscapeglobal.com/",
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
    mobileCover: "/images/projects/color/umrah-ziyarah-mobile.jpg",
    mobilePreviewKind: "capture",
    title: "Umrah & Ziyarah Forum",
    eyebrow: "TRAVEL & PILGRIMAGE / EVENTS",
    summary: "A forum website serving the Umrah and Ziyarah ecosystem with event content and visitor journeys.",
    role: "Drupal development & integrations",
    stack: [
      "Drupal",
      "Swapcard",
      "Custom UTM",
      "Custom URN",
      "API integration"
    ],
    href: "https://umrah-ziyarah.com/",
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
    challenge: "Contribute Drupal development and integrations for an event serving pilgrimage and travel professionals.",
    monogram: "UZ",
    cover: "/images/projects/color/umrah-ziyarah.jpg",
    siteExperience: "The public site uses an autoplaying video hero and carries UTM campaign parameters through navigation."
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
      "Custom URN",
      "API integration"
    ],
    href: "https://deepfest.com/",
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
    challenge: "Connect AI event content with external platforms and campaign-aware visitor journeys.",
    monogram: "DF"
  },
  {
    id: "leap-east",
    mobileCover: "/images/projects/color/leap-east-mobile.jpg",
    mobilePreviewKind: "capture",
    cover: "/images/projects/color/leap-east.jpg",
    title: "LEAP East",
    eyebrow: "TECHNOLOGY / HONG KONG",
    summary: "A Hong Kong technology event website connecting enterprises, investors, startups, and global innovators.",
    role: "Drupal development & integrations",
    stack: ["Drupal", "Swapcard", "Custom UTM", "Custom URN", "API integration"],
    href: "https://leapeast.com/",
    contributions: ["Drupal website development", "Swapcard integration", "Custom UTM tracking", "Custom URN handling", "API integration"],
    approvedForPortfolio: true,
    isDemo: false,
    visual: "content",
    challenge: "Contribute Drupal website development for LEAP’s Hong Kong event and its technology-focused content and visitor journeys.",
    monogram: "LE"
  },
  {
    id: "bio-middle-east",
    mobileCover: "/images/projects/color/bio-middle-east-mobile.jpg",
    mobilePreviewKind: "capture",
    title: "BIO Middle East",
    eyebrow: "BIOTECHNOLOGY / EVENTS",
    summary: "A biotechnology and life sciences event website supporting industry discovery and participation.",
    role: "Drupal development & integrations",
    stack: [
      "Drupal",
      "Swapcard",
      "Custom UTM",
      "Custom URN",
      "API integration"
    ],
    href: "https://biomiddleeast.com/",
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
    challenge: "Connect Drupal event content with external systems and campaign-aware journeys for a biotechnology audience.",
    monogram: "BIO",
    cover: "/images/projects/color/bio-middle-east.jpg"
  },
  {
    id: "idwsc",
    mobileCover: "/images/projects/color/idwsc-mobile-concept.jpg",
    mobilePreviewKind: "concept",
    cover: "/images/projects/color/idwsc.jpg",
    title: "Global Water Sustainability Conference",
    eyebrow: "WATER SUSTAINABILITY / EVENTS",
    summary: "A conference website connecting the global water sustainability community.",
    role: "Drupal development & integrations",
    stack: [
      "Drupal",
      "Swapcard",
      "Custom UTM",
      "Custom URN",
      "API integration"
    ],
    href: "https://idwsc.com/",
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
    challenge: "Support Drupal development and event integrations for a water sustainability conference.",
    monogram: "GWSC"
  },
  {
    id: "red-sea-yacht-show",
    mobileCover: "/images/projects/color/red-sea-yacht-show-mobile.jpg",
    mobilePreviewKind: "capture",
    title: "Red Sea Yacht Show",
    eyebrow: "MARINE & LIFESTYLE / EVENTS",
    summary: "A yacht show website with an immersive, video-led digital experience.",
    role: "Drupal development & integrations",
    stack: [
      "Drupal",
      "Swapcard",
      "Custom UTM",
      "Custom URN",
      "API integration"
    ],
    href: "https://redseayachtshow.com/",
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
    challenge: "Contribute Drupal development and integrations to a yacht show website with a distinctive visual experience.",
    monogram: "RSYS",
    cover: "/images/projects/color/red-sea-yacht-show.jpg",
    siteExperience: "The public site uses a multi-video experience with forward/reverse sequences, looping scenes, and animated floating elements."
  },
  {
    id: "tahaluf",
    mobileCover: "/images/projects/color/tahaluf-mobile-concept.jpg",
    mobilePreviewKind: "concept",
    cover: "/images/projects/color/tahaluf.jpg",
    title: "Tahaluf",
    eyebrow: "CORPORATE / EVENT ORGANISER",
    summary: "A corporate website presenting an international event organiser and its event portfolio.",
    role: "Drupal development contributor",
    stack: [
      "Drupal"
    ],
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
    eyebrow: "ADVANCED MATERIALS / MANUFACTURING",
    summary: "An advanced materials manufacturer website with extensive product and technical information.",
    role: "Drupal development contributor",
    stack: [
      "Drupal"
    ],
    href: "https://www.americanelements.com/",
    contributions: [
      "Drupal website development"
    ],
    approvedForPortfolio: true,
    isDemo: false,
    visual: "content",
    challenge: "Contribute Drupal development to a content-rich advanced materials website.",
    monogram: "AE"
  },
];
