import { ShieldCheck, Clock, Star, PhoneCall, Wrench, ThermometerSun, BadgeCheck } from "lucide-react";
import HvacLeadForm from "./components/HvacLeadForm";

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

export default function HvacLeadsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top bar */}
      <div className="bg-slate-900 py-2 text-center text-xs font-medium text-white">
        Serving homeowners across the USA &middot; Available 7 days a week
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-b from-sky-900 to-sky-700 px-4 py-12 text-white sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <span className="inline-block rounded-full bg-orange-500/90 px-3 py-1 text-xs font-bold uppercase tracking-wide">
              Free &middot; No Obligation
            </span>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
              AC Not Cooling? Furnace Acting Up?
            </h1>
            <p className="mt-4 max-w-xl text-lg text-sky-100">
              Get matched with a licensed, local HVAC technician and receive a free repair or
              installation quote &mdash; usually within the hour.
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

          <div className="lg:justify-self-end lg:w-full lg:max-w-md">
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
    </div>
  );
}
