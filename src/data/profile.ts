export const profile = {
  name: "Danyal Zeb",
  brandTagline: "Thoughtful Web Engineering",
  // TODO: Confirm the suggested senior title and all specialties before publishing.
  role: "Creative web engineering",
  proposedRole: "Senior Full-Stack Drupal Developer & Creative Web Engineer",
  headline: "Thoughtful engineering. Lasting experiences.",
  intro:
    "From distinctive Drupal websites to powerful web applications and complex platforms, I bring together thoughtful design, full-stack engineering and practical AI.",
  about:
    "I turn complex requirements into clear digital experiences—from brand and content websites to ecommerce platforms and complex web applications.",
  aboutDetail:
    "My focus includes Drupal AI, content assistance and workflow automation, alongside Swapcard integrations, custom UTM tracking, URN handling and external APIs that connect websites with business systems.",
  linkedin: "https://www.linkedin.com/in/danyal-zeb-4a1571249/",
  // TODO: Supply real public contact details. Empty values hide controls.
  email: "",
  github: "https://github.com/danyal-zeb/",
  whatsapp: "+92 316 9712793",
  cv: "/danyal-zeb-cv.pdf",
  contentApproved: false,
} as const;

export const profileInitials = profile.name.trim().split(/\s+/).map(part => part[0]).join("").toUpperCase();

export const capabilities = [
  {
    name: "Drupal & architecture",
    label: "01 / SYSTEMS",
    description:
      "Content models, custom modules, migrations, and maintainable foundations.",
    skills: ["Drupal", "PHP", "Twig", "Content architecture"],
  },
  {
    name: "Full-stack development",
    label: "02 / APPLICATIONS",
    description:
      "Connecting frontend interfaces, backend logic, databases and APIs into complete web applications.",
    skills: ["React", "TypeScript", "PHP", "Node.js", "SQL", "REST APIs"],
  },
  {
    name: "Frontend & interaction",
    label: "03 / INTERFACES",
    description:
      "Responsive interfaces with a considered balance of clarity and expression.",
    skills: ["React", "TypeScript", "JavaScript", "CSS"],
  },
  {
    name: "Drupal AI",
    label: "04 / INTELLIGENT CONTENT",
    description:
      "Connecting Drupal with AI providers for content assistance and automated editorial workflows.",
    skills: ["Drupal AI", "AI providers", "Content assistance", "AI Automators"],
  },
  {
    name: "AI integrations & automation",
    label: "05 / AUTOMATION",
    description:
      "Bringing language-model APIs, conversational interfaces and useful automation into web experiences.",
    skills: ["LLM APIs", "Prompt engineering", "Chatbot integrations", "Workflow automation"],
  },
  {
    name: "Creative interaction",
    label: "06 / EXPERIENCES",
    description:
      "Scroll-led compositions, expressive typography, and interaction with purpose.",
    skills: ["React", "GSAP", "SVG", "Interaction design"],
  },
  {
    name: "APIs & event integrations",
    label: "07 / FOUNDATIONS",
    description:
      "Connecting event platforms and business systems through Swapcard, custom UTM tracking, URN handling and external APIs.",
    skills: ["Swapcard", "Custom UTM", "Custom URN", "API integration"],
  },
  {
    name: "Performance",
    label: "08 / SPEED",
    description:
      "Lean assets, responsive interfaces, and attention to the moments that affect perceived speed.",
    skills: ["Core Web Vitals", "Optimization", "Responsive design"],
  },
  {
    name: "Accessibility",
    label: "09 / INCLUSION",
    description:
      "Clear navigation and inclusive interactions that work across devices and input methods.",
    skills: ["Semantic HTML", "Keyboard access", "Reduced motion"],
  },
];
