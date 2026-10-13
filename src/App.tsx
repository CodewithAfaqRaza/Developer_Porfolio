import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { Hero } from "./sections/Hero";
import { FeaturedWork } from "./sections/FeaturedWork";
import { About } from "./sections/About";
import { Skills } from "./sections/Skills";
import { Experience } from "./sections/Experience";
import { Contact } from "./sections/Contact";
import { ScrollExperience } from "./components/effects/ScrollExperience";
import { Approach } from "./sections/Approach";
import { lazy, Suspense } from "react";
const AdminDashboard = lazy(() => import("./admin/AdminDashboard"));

export default function App() {
  if (["/admin", "/admin/"].includes(window.location.pathname)) return <Suspense fallback={<p>Loading private workspace…</p>}><AdminDashboard /></Suspense>;
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div id="top" />
      <Header />
      <ScrollExperience>
        <main id="main">
          <Hero />
          <About />
          <Approach />
          <Skills />
          <FeaturedWork />
          <Experience />
          <Contact />
        </main>
        <Footer />
      </ScrollExperience>
    </>
  );
}
