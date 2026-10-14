import { useState } from "react";
import { ArrowUpRight, Check, Copy } from "lucide-react";
import { profile } from "../data/profile";
import { ContactForm } from "../components/contact/ContactForm";

export function Contact() {
  const [copyStatus, setCopyStatus] = useState("");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopyStatus("Email copied");
    } catch {
      setCopyStatus("Could not copy. Use the email link.");
    }
  };
  return (
    <section id="contact" className="contact-section">
      <div className="container">
        <p className="eyebrow">
          <span>04 /</span> GREAT THINGS START WITH A CONVERSATION
        </p>
        <div className="contact-headline" data-reveal>
          <h2>
            Have an idea?
            <br />
            <span>Let’s discuss it.</span>
          </h2>
          <a
            className="contact-circle"
            href={profile.email ? `mailto:${profile.email}` : profile.linkedin}
            aria-label={
              profile.email
                ? `Email ${profile.name}`
                : `Connect with ${profile.name} on LinkedIn`
            }
            {...(!profile.email
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
          >
            <ArrowUpRight strokeWidth={1.25} />
          </a>
        </div>
        <ContactForm />
        <div className="contact-bottom">
          <p>
            Have an idea in mind?
            <br />
            Let’s see where it can go.
          </p>
          <div className="contact-links">
            {profile.email && (
              <div className="email-row">
                <a href={`mailto:${profile.email}`}>{profile.email}</a>
                <button onClick={copy} aria-label="Copy email address">
                  {copyStatus === "Email copied" ? (
                    <Check size={16} />
                  ) : (
                    <Copy size={16} />
                  )}
                </button>
                <span role="status" className="copy-status">
                  {copyStatus}
                </span>
              </div>
            )}
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn <ArrowUpRight size={17} />
            </a>
            {profile.github && (
              <a
                href={profile.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub <ArrowUpRight size={17} />
              </a>
            )}
            {profile.cv && (
              <a href={profile.cv} target="_blank" rel="noopener noreferrer">
                View Résumé <ArrowUpRight size={17} />
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
