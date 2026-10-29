const faqs = [
  {
    question: "What does Afaq Raza specialize in?",
    answer: "Afaq Raza specializes in Drupal development, Drupal architecture, full-stack software engineering, React and TypeScript interfaces, API integrations, AI-powered content workflows, accessibility, and web performance.",
  },
  {
    question: "What Drupal services does Afaq Raza provide?",
    answer: "His Drupal work includes content architecture, custom modules, migrations, multilingual publishing, Drupal AI integrations, editorial workflow automation, event-platform integrations, and connected external APIs.",
  },
  {
    question: "Can Afaq Raza build full-stack web applications?",
    answer: "Yes. His portfolio focuses on connecting frontend interfaces, backend logic, databases, REST APIs, and practical AI into complete web applications and digital platforms.",
  },
  {
    question: "What technologies does Afaq Raza work with?",
    answer: "The portfolio highlights Drupal, PHP, Twig, React, TypeScript, JavaScript, Node.js, SQL, GSAP, SVG, REST APIs, Swapcard integrations, custom UTM tracking, and AI provider integrations.",
  },
];

export function ExpertiseFAQ() {
  return (
    <section className="expertise-faq container" aria-labelledby="expertise-faq-title">
      <div className="section-side-label">
        <p className="eyebrow">ANSWERS</p>
        <span>DRUPAL &amp; SOFTWARE ENGINEERING</span>
      </div>
      <div className="expertise-faq-content">
        <p className="eyebrow">COMMON QUESTIONS</p>
        <h2 id="expertise-faq-title">A clear answer to<br />what I build.</h2>
        <div className="expertise-faq-list">
          {faqs.map((faq) => (
            <details key={faq.question}>
              <summary>{faq.question}</summary>
              <div className="expertise-faq-answer"><p>{faq.answer}</p></div>
            </details>
          ))}
        </div>
      </div>
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
        })}
      </script>
    </section>
  );
}
