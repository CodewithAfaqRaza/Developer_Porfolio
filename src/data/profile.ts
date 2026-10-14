export const profile = {
  name: "Danyal Zeb",
  brandTagline: "Thoughtful Web Engineering",
  // TODO: Confirm the suggested senior title and all specialties before publishing.
  role: "Creative web engineering",
  proposedRole: "Senior Full-Stack Drupal Developer & Creative Web Engineer",
  headline: "Thoughtful engineering. Lasting experiences.",
  intro:
    "Drupal architecture, modern frontend engineering, and considered interactions. Turning complex requirements into clear, reliable digital experiences.",
  about:
    "I work on Drupal websites for technology, cybersecurity, real estate, gaming, and specialist industry events, alongside corporate and product-focused platforms.",
  aboutDetail:
    "My work includes Swapcard integration, custom UTM tracking and API integrations, with custom URN handling for Kingdom of Gaming—connecting event content with the systems behind each visitor journey.",
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
    name: "Frontend & interaction",
    label: "02 / INTERFACES",
    description:
      "Responsive interfaces with a considered balance of clarity and expression.",
    skills: ["React", "TypeScript", "JavaScript", "CSS"],
  },
  {
    name: "Creative interaction",
    label: "03 / EXPERIENCES",
    description:
      "Scroll-led compositions, expressive typography, and interaction with purpose.",
    skills: ["React", "GSAP", "SVG", "Interaction design"],
  },
  {
    name: "APIs & event integrations",
    label: "04 / FOUNDATIONS",
    description:
      "Swapcard connections, custom UTM tracking and external APIs, plus custom URN handling for Kingdom of Gaming.",
    skills: ["Swapcard", "Custom UTM", "Custom URN", "API integration"],
  },
  {
    name: "Performance",
    label: "05 / SPEED",
    description:
      "Lean assets, responsive interfaces, and attention to the moments that affect perceived speed.",
    skills: ["Core Web Vitals", "Optimization", "Responsive design"],
  },
  {
    name: "Accessibility",
    label: "06 / INCLUSION",
    description:
      "Clear navigation and inclusive interactions that work across devices and input methods.",
    skills: ["Semantic HTML", "Keyboard access", "Reduced motion"],
  },
];
