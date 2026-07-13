import type { Metadata } from "next";
import { ShieldCheck, Clock, Star, PhoneCall, Wrench, ThermometerSun, BadgeCheck } from "lucide-react";
import HvacLeadForm from "../components/HvacLeadForm";
import StickyMobileCta from "../components/StickyMobileCta";

export const metadata: Metadata = {
  title: "Free HVAC Quote | Same-Day AC & Heating Repair Near You",
  description: "Get a free quote from a licensed, local HVAC pro. AC repair, furnace repair, and new installs. Fast response, no obligation.",
};

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: "Licensed & Insured" },
  { icon: Clock, label: "Same-Day Service" },
  { icon: Star, label: "4.9/5 (2,300+ Reviews)" },
  { icon: BadgeCheck, label: "100% Satisfaction Guarantee" },
];

const SERVICES = [
  { icon: ThermometerSun, title: "AC Repair & Installation", desc: "Fast diagnosis and repair for any AC brand, or a full system replacement." },
  { icon: Wrench, title: "Furnace & Heating", desc: "Keep your home warm with expert furnace repair, tune-ups, and installs." },
  { icon: PhoneCall, title: "24/7 Emergency Service", desc: "No heat or no cool? A local tech can be dispatched today." },
];

const STEPS = [
  { step: "1", title: "Tell us what you need", desc: "Answer a few quick questions about your HVAC issue." },
  { step: "2", title: "Get matched locally", desc: "We connect you with a licensed HVAC pro in your area." },
  { step: "3", title: "Get your free quote", desc: "A technician calls to schedule your free, no-obligation quote." },
];

const TESTIMONIALS = [
  {
    name: "Rebecca H.",
    location: "Phoenix, AZ",
    rating: 5,
    quote: "Our AC died on the hottest day of the year. Filled out the form and had a tech at our door in under 2 hours. Fair price, no upsell games.",
  },
  {
    name: "Marcus T.",
    location: "Columbus, OH",
    rating: 5,
    quote: "Furnace was making a awful noise right before a cold snap. They matched me with someone local who fixed it same day. Would use again.",
  },
  {
    name: "Priya D.",
    location: "Austin, TX",
    rating: 5,
    quote: "Got three things wrong with my old unit explained clearly, plus an honest quote on replacement vs. repair. No pressure either way.",
  },
];

const FAQS = [
  {
    q: "How much does an HVAC repair quote cost?",
    a: "The quote itself is free with no obligation. You only pay if you decide to move forward with the repair or installation.",
  },
  {
    q: "How fast can someone come out?",
    a: "Most homeowners hear back within the hour, and same-day appointments are available in most areas, including emergency no-heat/no-cool situations.",
  },
  {
    q: "Are the technicians licensed and insured?",
    a: "Yes. We only match you with licensed, insured local HVAC technicians and companies.",
  },
  {
    q: "Do you serve my area?",
    a: "We match homeowners across the USA. Enter your zip code in the form and we'll confirm availability in your area when we reach out.",
  },
  {
    q: "What if I need financing?",
    a: "Many of our local partners offer financing options for new system installations. Ask about it when they call to schedule your quote.",
  },
];

const HERO_VARIANTS: Record<string, { badge: string; headline: string; subhead: string }> = {
  default: {
    badge: "Free · No Obligation",
    headline: "AC Not Cooling? Furnace Acting Up?",
    subhead: "Get matched with a licensed, local HVAC technician and receive a free repair or installation quote — usually within the hour.",
  },
  emergency: {
    badge: "24/7 Emergency Dispatch",
    headline: "No Heat or No AC? Get Help Today.",
    subhead: "Don't wait it out. A licensed local HVAC tech can be dispatched today for emergency repairs — get your free quote now.",
  },
  savings: {
    badge: "Free Quote · Save Up To 30%",
    headline: "Compare Local HVAC Quotes Before You Book",
    subhead: "See what a licensed local technician would charge before you commit — free, fast, and no obligation to book.",
  },
  install: {
    badge: "Free · No Obligation",
    headline: "Old AC or Furnace? Get a Free Replacement Quote",
    subhead: "Get matched with a licensed local HVAC pro for a no-pressure quote on a new, more efficient system.",
  },
};

function getHeroVariant(utmContent?: string) {
  if (utmContent && HERO_VARIANTS[utmContent]) return HERO_VARIANTS[utmContent];
  return HERO_VARIANTS.default;
}

export default async function HvacLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const utmContent = typeof params.utm_content === "string" ? params.utm_content : undefined;
  const hero = getHeroVariant(utmContent);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 text-slate-900 lg:pb-0">
      {/* Top bar */}
      <div className="bg-slate-900 py-2 text-center text-xs font-medium text-white">
        Serving homeowners across the USA &middot; Available 7 days a week
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-b from-sky-900 to-sky-700 px-4 py-12 text-white sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <span className="inline-block rounded-full bg-orange-500/90 px-3 py-1 text-xs font-bold uppercase tracking-wide">
              {hero.badge}
            </span>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
              {hero.headline}
            </h1>
            <p className="mt-4 max-w-xl text-lg text-sky-100">
              {hero.subhead}
            </p>
            <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
              {TRUST_ITEMS.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2 text-sm text-sky-50">
                  <Icon className="h-4 w-4 flex-shrink-0 text-orange-400" />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <div id="quote-form" className="scroll-mt-6 lg:justify-self-end lg:w-full lg:max-w-md">
            <HvacLeadForm />
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
          HVAC Services We Help You Find
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {SERVICES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
              <p className="mt-1.5 text-sm text-slate-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white px-4 py-14">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">How It Works</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-3">
            {STEPS.map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-sky-700 text-sm font-bold text-white">
                  {step}
                </div>
                <h3 className="mt-3 font-semibold text-slate-900">{title}</h3>
                <p className="mt-1.5 text-sm text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
          What Homeowners Are Saying
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {TESTIMONIALS.map(({ name, location, rating, quote }) => (
            <div key={name} className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex gap-0.5">
                {Array.from({ length: rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">&ldquo;{quote}&rdquo;</p>
              <p className="mt-4 text-sm font-semibold text-slate-900">
                {name} <span className="font-normal text-slate-400">&middot; {location}</span>
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white px-4 py-14">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
            Frequently Asked Questions
          </h2>
          <div className="mt-8 divide-y divide-slate-200 rounded-xl border border-slate-200">
            {FAQS.map(({ q, a }) => (
              <details key={q} className="group p-5 open:bg-slate-50">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-900 marker:content-none [&::-webkit-details-marker]:hidden">
                  {q}
                  <span className="flex-shrink-0 text-xl leading-none text-slate-400 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-14">
        <div className="mx-auto max-w-3xl">
          <HvacLeadForm />
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-slate-50 px-4 py-6 text-center text-xs text-slate-400">
        By submitting this form you agree to be contacted about your HVAC service request. This is a
        lead-generation page and does not guarantee service availability in all areas.
      </footer>

      <StickyMobileCta />
    </div>
  );
}
