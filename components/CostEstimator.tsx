"use client";

import { Fragment, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// ─── Pricing constants ────────────────────────────────────────────────────────

const LABOUR_RATE = 20; // $20/hr — covers student labour only
const HAUL_FEE = 20;    // flat charge for driving waste to landfill
const DUMP_FEE = 25;    // facility dump fee estimate (under 250 kg)

// ─── Service configs ──────────────────────────────────────────────────────────

type SizeOption   = { label: string; hours: number };
type AddOnOption  = { id: string; label: string; hours?: number; flat?: number };
type SupplyOption = { id: string; label: string; price: number; perUnit?: boolean; unitLabel?: string };

type ServiceConfig = {
  sizes: SizeOption[];
  addOns: AddOnOption[];
  hasDisposal: boolean;
  supplies: SupplyOption[];
  notes?: string[];
};

const CONFIGS: Record<string, ServiceConfig> = {
  "Yard Work": {
    sizes: [
      { label: "Small",       hours: 1 },
      { label: "Medium",      hours: 2 },
      { label: "Large",       hours: 3 },
      { label: "Extra Large", hours: 4 },
    ],
    addOns: [
      { id: "flower_bed", label: "Flower bed cleanup", hours: 0.5 },
      { id: "edge_trim",  label: "Edge trimming",      hours: 0.5 },
    ],
    hasDisposal: true,
    supplies: [
      { id: "rake",        label: "Rake",        price: 5  },
      { id: "leaf_blower", label: "Leaf blower", price: 10 },
      { id: "lawn_mower",  label: "Lawn mower",  price: 15 },
      { id: "leaf_bags",   label: "Leaf bags",   price: 3, perUnit: true, unitLabel: "bag" },
    ],
  },
  "Junk Removal": {
    sizes: [
      { label: "Small Load",   hours: 1 },
      { label: "Medium Load",  hours: 2 },
      { label: "Large Load",   hours: 3 },
      { label: "Full Truck",   hours: 4 },
    ],
    addOns: [
      { id: "stairs", label: "Stairs / no elevator",     flat: 10 },
      { id: "heavy",  label: "Heavy items (appliances)", flat: 15 },
    ],
    hasDisposal: true,
    supplies: [
      { id: "dolly",   label: "Dolly / hand truck",  price: 15 },
      { id: "hd_bags", label: "Heavy-duty bags",     price: 5, perUnit: true, unitLabel: "bag" },
      { id: "gloves",  label: "Work gloves",          price: 3 },
    ],
  },
  "Fence Painting": {
    sizes: [
      { label: "Up to 5 panels", hours: 2 },
      { label: "6–10 panels",    hours: 4 },
      { label: "11–20 panels",   hours: 6 },
      { label: "20+ panels",     hours: 8 },
    ],
    addOns: [
      { id: "second_coat", label: "Second coat",   hours: 2 },
      { id: "sanding",     label: "Sanding / prep", hours: 1 },
      { id: "primer",      label: "Primer coat",    hours: 1 },
    ],
    hasDisposal: false,
    supplies: [
      { id: "roller",     label: "Paint roller",    price: 10 },
      { id: "brushes",    label: "Paint brushes",   price: 5  },
      { id: "tray",       label: "Paint tray",      price: 5  },
      { id: "drop_cloth", label: "Drop cloth",      price: 8  },
      { id: "tape",       label: "Painter's tape",  price: 5  },
    ],
    notes: ["Paint not included — customer provides or purchases separately."],
  },
  "Small Apartment Move": {
    sizes: [
      { label: "Studio / Bachelor", hours: 2 },
      { label: "1 Bedroom",         hours: 3 },
      { label: "2 Bedroom",         hours: 5 },
      { label: "3 Bedroom",         hours: 7 },
    ],
    addOns: [
      { id: "stairs",      label: "Stairs / no elevator",       flat: 10 },
      { id: "distance",    label: "Over 10 km distance",        flat: 15 },
      { id: "disassembly", label: "Disassembly / reassembly",   hours: 1 },
    ],
    hasDisposal: false,
    supplies: [
      { id: "blankets", label: "Moving blankets",   price: 5, perUnit: true, unitLabel: "blanket" },
      { id: "dolly",    label: "Dolly / hand truck", price: 15 },
      { id: "tape",     label: "Packing tape",       price: 5  },
      { id: "straps",   label: "Rope / straps",      price: 5  },
    ],
  },
  "TV Mounting": {
    sizes: [
      { label: `Under 55"`, hours: 1   },
      { label: `55"–75"`,   hours: 1.5 },
      { label: `Over 75"`,  hours: 2   },
    ],
    addOns: [
      { id: "brick",      label: "Brick / concrete wall",   hours: 0.5 },
      { id: "cable_mgmt", label: "Cable management",        hours: 0.5 },
      { id: "bracket",    label: "Mount bracket included",  flat: 25   },
    ],
    hasDisposal: false,
    supplies: [
      { id: "drill_bits", label: "Drill bits",           price: 10 },
      { id: "level",      label: "Level",                price: 5  },
      { id: "anchors",    label: "Wall anchors / hardware", price: 8 },
    ],
    notes: ["Mount bracket not included unless selected above."],
  },
  "General Labour": {
    sizes: [
      { label: "1 hour",  hours: 1 },
      { label: "2 hours", hours: 2 },
      { label: "3 hours", hours: 3 },
      { label: "4 hours", hours: 4 },
      { label: "6 hours", hours: 6 },
      { label: "8 hours", hours: 8 },
    ],
    addOns: [],
    hasDisposal: false,
    supplies: [
      { id: "basic_tools", label: "Basic tool kit", price: 15 },
      { id: "power_tools", label: "Power tools",    price: 20 },
    ],
  },
};

// ─── Types ────────────────────────────────────────────────────────────────────

type DbService      = { id: string; name: string; icon: string };
type SupplySelection = { id: string; qty: number };
type Step           = 1 | 2 | 3 | 4;

type EstimateResult = {
  totalHours: number;
  labourCost: number;
  hourAddOns: { label: string; hours: number }[];
  flatAddOnLines: { label: string; amount: number }[];
  disposalLines: { label: string; amount: number }[];
  supplyLines: { label: string; amount: number; qty: number }[];
  total: number;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return `$${n % 1 === 0 ? n : n.toFixed(2)}`;
}

const STEP_LABELS = ["Service", "Job Details", "Equipment", "Estimate"];

// ─── Component ────────────────────────────────────────────────────────────────

export default function CostEstimator() {
  const router = useRouter();

  const [dbServices,      setDbServices]      = useState<DbService[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [step,            setStep]            = useState<Step>(1);
  const [serviceName,     setServiceName]     = useState<string | null>(null);
  const [sizeIdx,         setSizeIdx]         = useState<number | null>(null);
  const [selectedAddOns,  setSelectedAddOns]  = useState<string[]>([]);
  const [haulToLandfill,  setHaulToLandfill]  = useState(false);
  const [dumpFee,         setDumpFee]         = useState(false);
  const [equipment,       setEquipment]       = useState<"customer" | "crew">("customer");
  const [supplies,        setSupplies]        = useState<SupplySelection[]>([]);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("services")
        .select("id, name, icon")
        .eq("active", true)
        .order("name");
      setDbServices(data ?? []);
      setLoadingServices(false);
    }
    load();
  }, []);

  const config    = serviceName ? (CONFIGS[serviceName] ?? null) : null;
  const dbService = dbServices.find((s) => s.name === serviceName) ?? null;
  const size      = config && sizeIdx !== null ? config.sizes[sizeIdx] : null;

  // ─── Estimate calculation ──────────────────────────────────────────────────

  const estimate: EstimateResult | null = (() => {
    if (!config || !size) return null;

    let totalHours = size.hours;
    const hourAddOns: EstimateResult["hourAddOns"] = [];
    const flatAddOnLines: EstimateResult["flatAddOnLines"] = [];

    for (const aoId of selectedAddOns) {
      const ao = config.addOns.find((a) => a.id === aoId);
      if (!ao) continue;
      if (ao.hours) { totalHours += ao.hours; hourAddOns.push({ label: ao.label, hours: ao.hours }); }
      if (ao.flat)   flatAddOnLines.push({ label: ao.label, amount: ao.flat });
    }

    const labourCost = LABOUR_RATE * totalHours;

    const disposalLines: EstimateResult["disposalLines"] = [];
    if (haulToLandfill) disposalLines.push({ label: "Haul to landfill (drive time)", amount: HAUL_FEE });
    if (dumpFee)        disposalLines.push({ label: "Landfill dump fee (est.)",       amount: DUMP_FEE });

    const supplyLines: EstimateResult["supplyLines"] = [];
    for (const sel of supplies) {
      const sup = config.supplies.find((s) => s.id === sel.id);
      if (sup) supplyLines.push({ label: sup.label, amount: sup.price * sel.qty, qty: sel.qty });
    }

    const total =
      labourCost +
      flatAddOnLines.reduce((s, l) => s + l.amount, 0) +
      disposalLines.reduce((s, l) => s + l.amount, 0) +
      supplyLines.reduce((s, l) => s + l.amount, 0);

    return { totalHours, labourCost, hourAddOns, flatAddOnLines, disposalLines, supplyLines, total };
  })();

  // ─── Handlers ─────────────────────────────────────────────────────────────

  function pickService(name: string) {
    setServiceName(name);
    setSizeIdx(null);
    setSelectedAddOns([]);
    setHaulToLandfill(false);
    setDumpFee(false);
    setEquipment("customer");
    setSupplies([]);
    setStep(2);
  }

  function toggleAddOn(id: string) {
    setSelectedAddOns((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  }

  function toggleSupply(id: string) {
    setSupplies((prev) =>
      prev.find((s) => s.id === id) ? prev.filter((s) => s.id !== id) : [...prev, { id, qty: 1 }]
    );
  }

  function setSupplyQty(id: string, qty: number) {
    setSupplies((prev) => prev.map((s) => (s.id === id ? { ...s, qty: Math.max(1, qty) } : s)));
  }

  function handleBookJob() {
    if (!dbService || !estimate) return;
    const params = new URLSearchParams({
      service:   dbService.id,
      price:     Math.ceil(estimate.total).toString(),
      equipment,
    });
    router.push(`/book?${params}`);
  }

  function reset() {
    setServiceName(null);
    setSizeIdx(null);
    setSelectedAddOns([]);
    setHaulToLandfill(false);
    setDumpFee(false);
    setEquipment("customer");
    setSupplies([]);
    setStep(1);
  }

  const hasDisposal = estimate && (haulToLandfill || dumpFee);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-2xl">

      {/* Step indicator */}
      <div className="mb-10 flex items-start">
        {STEP_LABELS.map((label, i) => {
          const n = (i + 1) as Step;
          const done   = step > n;
          const active = step === n;
          return (
            <Fragment key={label}>
              {i > 0 && (
                <div className={`mt-4 h-0.5 flex-1 transition-colors ${done ? "bg-indigo-300" : "bg-gray-200"}`} />
              )}
              <div className="flex flex-col items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => { if (done) setStep(n); }}
                  disabled={!done}
                  className={[
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition",
                    active ? "bg-indigo-600 text-white shadow" :
                    done   ? "cursor-pointer bg-indigo-100 text-indigo-600 hover:bg-indigo-200" :
                             "bg-gray-100 text-gray-400",
                  ].join(" ")}
                >
                  {done ? "✓" : n}
                </button>
                <span className={`w-16 text-center text-xs font-medium ${
                  active ? "text-indigo-600" : done ? "text-indigo-400" : "text-gray-400"
                }`}>
                  {label}
                </span>
              </div>
            </Fragment>
          );
        })}
      </div>

      {/* ── Step 1: Service ── */}
      {step === 1 && (
        <div>
          <h2 className="mb-5 text-xl font-bold text-gray-900">What service do you need?</h2>
          {loadingServices ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-100" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {dbServices
                .filter((s) => CONFIGS[s.name])
                .map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => pickService(s.name)}
                    className="flex flex-col items-center gap-2 rounded-2xl border-2 border-gray-200 bg-white px-3 py-5 text-center transition hover:border-indigo-300 hover:bg-indigo-50"
                  >
                    <span className="text-3xl">{s.icon}</span>
                    <span className="text-sm font-semibold text-gray-800">{s.name}</span>
                    <span className="text-xs text-gray-400">{fmt(LABOUR_RATE)}/hr labour</span>
                  </button>
                ))}
            </div>
          )}
        </div>
      )}

      {/* ── Step 2: Job Details ── */}
      {step === 2 && config && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setStep(1)} className="text-sm text-indigo-500 hover:underline">
              ← Back
            </button>
            <h2 className="text-xl font-bold text-gray-900">Job Details</h2>
          </div>

          {/* Size */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-700">Job Size <span className="font-normal text-red-400">*</span></h3>
            <div className="grid grid-cols-2 gap-2">
              {config.sizes.map((sz, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSizeIdx(i)}
                  className={[
                    "rounded-xl border-2 px-4 py-3 text-left transition",
                    sizeIdx === i
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 bg-white hover:border-indigo-300",
                  ].join(" ")}
                >
                  <p className={`text-sm font-semibold ${sizeIdx === i ? "text-indigo-700" : "text-gray-800"}`}>
                    {sz.label}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {sz.hours} hr{sz.hours !== 1 ? "s" : ""} · {fmt(LABOUR_RATE * sz.hours)} labour
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Add-ons */}
          {config.addOns.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-700">
                Add-ons <span className="font-normal text-gray-400">(optional)</span>
              </h3>
              <div className="space-y-2">
                {config.addOns.map((ao) => (
                  <label
                    key={ao.id}
                    className={[
                      "flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 transition",
                      selectedAddOns.includes(ao.id)
                        ? "border-indigo-400 bg-indigo-50"
                        : "border-gray-200 bg-white hover:border-gray-300",
                    ].join(" ")}
                  >
                    <input
                      type="checkbox"
                      checked={selectedAddOns.includes(ao.id)}
                      onChange={() => toggleAddOn(ao.id)}
                      className="accent-indigo-600"
                    />
                    <span className="flex-1 text-sm font-medium text-gray-800">{ao.label}</span>
                    <span className="text-sm font-semibold text-indigo-600">
                      {ao.hours
                        ? `+${ao.hours}hr · +${fmt(LABOUR_RATE * ao.hours)}`
                        : `+${fmt(ao.flat!)}`}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Disposal */}
          {config.hasDisposal && (
            <div>
              <h3 className="mb-1 text-sm font-semibold text-gray-700">
                Disposal <span className="font-normal text-gray-400">(optional — select only if needed)</span>
              </h3>
              <div className="mb-3 space-y-2">
                <label className={[
                  "flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 transition",
                  haulToLandfill ? "border-indigo-400 bg-indigo-50" : "border-gray-200 bg-white hover:border-gray-300",
                ].join(" ")}>
                  <input type="checkbox" checked={haulToLandfill} onChange={(e) => setHaulToLandfill(e.target.checked)} className="accent-indigo-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">Haul waste to landfill</p>
                    <p className="text-xs text-gray-400">Flat fee covering student drive time to the facility</p>
                  </div>
                  <span className="text-sm font-semibold text-indigo-600">+{fmt(HAUL_FEE)}</span>
                </label>
                <label className={[
                  "flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 transition",
                  dumpFee ? "border-indigo-400 bg-indigo-50" : "border-gray-200 bg-white hover:border-gray-300",
                ].join(" ")}>
                  <input type="checkbox" checked={dumpFee} onChange={(e) => setDumpFee(e.target.checked)} className="accent-indigo-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">Landfill dump fee</p>
                    <p className="text-xs text-gray-400">Est. {fmt(DUMP_FEE)} for loads under 250 kg — heavier loads charged by weight</p>
                  </div>
                  <span className="text-sm font-semibold text-indigo-600">+{fmt(DUMP_FEE)} est.</span>
                </label>
              </div>
              <p className="text-xs text-amber-600">⚠ Dump fees are facility estimates and may vary.</p>
            </div>
          )}

          {/* Service notes */}
          {config.notes && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              {config.notes.map((note, i) => (
                <p key={i} className="text-sm text-amber-800">{note}</p>
              ))}
            </div>
          )}

          <button
            type="button"
            disabled={sizeIdx === null}
            onClick={() => setStep(3)}
            className="w-full rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue to Equipment →
          </button>
        </div>
      )}

      {/* ── Step 3: Equipment & Supplies ── */}
      {step === 3 && config && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setStep(2)} className="text-sm text-indigo-500 hover:underline">
              ← Back
            </button>
            <h2 className="text-xl font-bold text-gray-900">Equipment &amp; Supplies</h2>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-700">Who brings the tools and supplies?</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Customer provides — DEFAULT */}
              <button
                type="button"
                onClick={() => { setEquipment("customer"); setSupplies([]); }}
                className={[
                  "flex flex-col gap-1 rounded-xl border-2 px-4 py-4 text-left transition",
                  equipment === "customer"
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200 bg-white hover:border-gray-300",
                ].join(" ")}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${equipment === "customer" ? "text-indigo-700" : "text-gray-800"}`}>
                    Customer provides
                  </span>
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                    Default
                  </span>
                </div>
                <p className="text-xs text-gray-500">You supply the tools and materials — no supply charge added</p>
              </button>

              {/* Crew brings */}
              <button
                type="button"
                onClick={() => setEquipment("crew")}
                className={[
                  "flex flex-col gap-1 rounded-xl border-2 px-4 py-4 text-left transition",
                  equipment === "crew"
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200 bg-white hover:border-gray-300",
                ].join(" ")}
              >
                <span className={`text-sm font-bold ${equipment === "crew" ? "text-indigo-700" : "text-gray-800"}`}>
                  We bring everything
                </span>
                <p className="text-xs text-gray-500">Select which items you need the crew to bring</p>
              </button>
            </div>
          </div>

          {/* Supply checklist */}
          {equipment === "crew" && config.supplies.length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-700">
                Select supplies needed <span className="font-normal text-gray-400">(optional)</span>
              </h3>
              <div className="space-y-2">
                {config.supplies.map((sup) => {
                  const sel = supplies.find((s) => s.id === sup.id);
                  return (
                    <div
                      key={sup.id}
                      className={[
                        "flex items-center gap-3 rounded-xl border-2 px-4 py-3 transition",
                        sel ? "border-indigo-400 bg-indigo-50" : "border-gray-200 bg-white",
                      ].join(" ")}
                    >
                      <input
                        type="checkbox"
                        checked={!!sel}
                        onChange={() => toggleSupply(sup.id)}
                        className="accent-indigo-600"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-800">{sup.label}</span>
                        {sup.perUnit && (
                          <span className="ml-1 text-xs text-gray-400">({fmt(sup.price)}/{sup.unitLabel})</span>
                        )}
                      </div>
                      {sel && sup.perUnit ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSupplyQty(sup.id, sel.qty - 1)}
                            className="flex h-6 w-6 items-center justify-center rounded border border-gray-300 text-sm text-gray-600 hover:bg-gray-100"
                          >−</button>
                          <span className="w-6 text-center text-sm font-semibold text-gray-800">{sel.qty}</span>
                          <button
                            type="button"
                            onClick={() => setSupplyQty(sup.id, sel.qty + 1)}
                            className="flex h-6 w-6 items-center justify-center rounded border border-gray-300 text-sm text-gray-600 hover:bg-gray-100"
                          >+</button>
                          <span className="ml-1 w-12 text-right text-sm font-semibold text-indigo-600">
                            {fmt(sup.price * sel.qty)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm font-semibold text-indigo-600">{fmt(sup.price)}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {equipment === "customer" && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              No supply charge — you&apos;re providing your own tools and materials.
            </div>
          )}

          <button
            type="button"
            onClick={() => setStep(4)}
            className="w-full rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            See My Estimate →
          </button>
        </div>
      )}

      {/* ── Step 4: Estimate ── */}
      {step === 4 && estimate && size && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setStep(3)} className="text-sm text-indigo-500 hover:underline">
              ← Back
            </button>
            <h2 className="text-xl font-bold text-gray-900">Your Estimate</h2>
          </div>

          {/* Itemized breakdown */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

            {/* Labour */}
            <div className="border-b border-gray-100 px-5 py-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">Labour</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">
                  {size.label} · {estimate.totalHours} hr{estimate.totalHours !== 1 ? "s" : ""} × {fmt(LABOUR_RATE)}/hr
                </span>
                <span className="font-semibold text-gray-900">{fmt(estimate.labourCost)}</span>
              </div>
              {estimate.hourAddOns.map((ao) => (
                <p key={ao.label} className="mt-1 pl-3 text-xs text-gray-400">
                  + {ao.label} ({ao.hours}hr included above)
                </p>
              ))}
            </div>

            {/* Flat add-ons */}
            {estimate.flatAddOnLines.length > 0 && (
              <div className="border-b border-gray-100 px-5 py-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">Add-ons</p>
                {estimate.flatAddOnLines.map((line) => (
                  <div key={line.label} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{line.label}</span>
                    <span className="font-semibold text-gray-900">{fmt(line.amount)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Disposal */}
            {estimate.disposalLines.length > 0 && (
              <div className="border-b border-gray-100 px-5 py-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">Disposal</p>
                {estimate.disposalLines.map((line) => (
                  <div key={line.label} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{line.label}</span>
                    <span className="font-semibold text-gray-900">{fmt(line.amount)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Supplies */}
            {estimate.supplyLines.length > 0 && (
              <div className="border-b border-gray-100 px-5 py-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">Supplies</p>
                {estimate.supplyLines.map((line) => (
                  <div key={line.label} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      {line.label}{line.qty > 1 ? ` ×${line.qty}` : ""}
                    </span>
                    <span className="font-semibold text-gray-900">{fmt(line.amount)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Total */}
            <div className="bg-indigo-600 px-5 py-5">
              <div className="flex items-center justify-between text-white">
                <span className="font-semibold">Estimated Total</span>
                <span className="text-4xl font-extrabold">{fmt(estimate.total)}</span>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-center text-xs text-gray-400">
            Estimate only — final price confirmed before work begins. GST not included.
            {hasDisposal ? " Dump fees are facility estimates and may vary." : ""}
          </p>

          {/* Book CTA */}
          <button
            type="button"
            onClick={handleBookJob}
            className="w-full rounded-xl bg-orange-500 px-6 py-4 text-sm font-bold text-white shadow transition hover:bg-orange-600"
          >
            Book This Job →
          </button>

          <button
            type="button"
            onClick={reset}
            className="w-full rounded-xl border border-gray-200 px-6 py-3 text-sm text-gray-500 transition hover:bg-gray-50"
          >
            Start Over
          </button>
        </div>
      )}
    </div>
  );
}
