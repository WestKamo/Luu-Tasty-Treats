"use client";

import { motion } from "framer-motion";
import { Clock, Truck, RefreshCcw, ShieldCheck, Cake, CreditCard } from "lucide-react";

const policies = [
  {
    icon: Clock,
    title: "Order Lead Times",
    body: "Standard cakes need 72 hours' notice. Tiered, sculpted, or wedding cakes need 10 to 14 days. Same-day requests are occasionally possible — message us and we'll tell you honestly whether we can do it justice.",
  },
  {
    icon: CreditCard,
    title: "Payment & Deposits",
    body: "Orders under R1 500 are paid in full at checkout. Larger and custom orders require a 50% non-refundable deposit to reserve your date, with the balance due 48 hours before collection.",
  },
  {
    icon: Truck,
    title: "Collection & Delivery",
    body: "Free collection from our Kokosi, Fochville studio. Delivery within a 30km radius is charged at a flat R50. Once a cake leaves our hands, transport and handling become the customer's responsibility — cakes are delicate by nature.",
  },
  {
    icon: RefreshCcw,
    title: "Changes & Cancellations",
    body: "Design changes are welcome up to 72 hours before your collection date. Cancellations more than 7 days out receive a full refund minus the deposit. Inside 72 hours, ingredients are bought and work has started, so we can't refund.",
  },
  {
    icon: Cake,
    title: "Allergens & Ingredients",
    body: "Our kitchen handles wheat, dairy, eggs, and nuts. We take allergy requests seriously but cannot guarantee a completely allergen-free environment. Please tell us about allergies in your order notes, not after.",
  },
  {
    icon: ShieldCheck,
    title: "Your Privacy",
    body: "We collect only what we need to bake and deliver your order: your name, contact details, and address. We never sell your information. Payment card details are handled entirely by our payment provider and never touch our servers.",
  },
];

export default function PoliciesPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 sm:py-16">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs uppercase tracking-[0.25em] text-berry-dark">The Fine Print</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-chocolate sm:text-5xl">
          Our Policies
        </h1>
        <p className="mt-4 max-w-2xl text-chocolate/60">
          Everything we bake is made to order, by hand, for one specific celebration.
          These policies exist so there are no surprises on either side.
        </p>
      </motion.div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {policies.map((policy, i) => (
          <motion.div
            key={policy.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07, duration: 0.45 }}
            className="rounded-4xl border border-chocolate/8 bg-white p-6 shadow-soft transition hover:shadow-xl"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-vanilla">
              <policy.icon className="h-5 w-5 text-chocolate" />
            </div>
            <h2 className="mt-4 font-serif text-lg font-semibold text-chocolate">{policy.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-chocolate/60">{policy.body}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mt-12 rounded-4xl bg-chocolate p-8 text-center text-cream"
      >
        <h3 className="font-serif text-xl font-semibold">Still have a question?</h3>
        <p className="mt-2 text-sm text-cream/70">
          Every cake is different. If something here doesn&apos;t fit your situation, just ask.
        </p>
      </motion.div>
    </div>
  );
}