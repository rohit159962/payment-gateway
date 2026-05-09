import { CardType, PaymentFormValues } from "@/types";

const CARD_STYLES: Record<CardType, { logo: string; accent: string }> = {
  visa:       { logo: "VISA",  accent: "#1A1F71" },
  mastercard: { logo: "MC",    accent: "#EB001B" },
  amex:       { logo: "AMEX", accent: "#007BC1" },
  unknown:    { logo: "",      accent: "#374151" },
};

interface Props {
  form: PaymentFormValues;
  cardType: CardType;
}

export function CardPreview({ form, cardType }: Props) {
  const style = CARD_STYLES[cardType];
  const raw = form.cardNumber.replace(/\s/g, "");
  const isAmex = cardType === "amex";
  const placeholder = isAmex ? "···· ······ ·····" : "···· ···· ···· ····";
  const display = form.cardNumber || placeholder;

  return (
    <div
      className="rounded-2xl p-7 relative overflow-hidden select-none"
      style={{
        background: `linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, ${style.accent}33 100%)`,
        boxShadow: "0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
        border: "1px solid rgba(255,255,255,0.08)",
        minHeight: 190,
      }}
    >
      {/* Holographic overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 20% 50%, rgba(120,119,198,0.08), transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(255,200,100,0.04), transparent 50%)",
        }}
      />

      {/* Chip + Brand */}
      <div className="flex justify-between items-center mb-6">
        <div
          className="w-10 h-7 rounded grid grid-cols-2 gap-0.5 p-1"
          style={{ background: "linear-gradient(135deg, #d4a843, #f5d98a, #c8941a)" }}
        >
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-black/20 rounded-sm" />
          ))}
        </div>
        {style.logo && (
          <span className="font-black text-lg tracking-widest opacity-90" style={{ color: "#fff" }}>
            {style.logo}
          </span>
        )}
      </div>

      {/* Card Number */}
      <div className="font-mono text-xl tracking-[3px] text-white/90 mb-5 font-semibold">
        {display}
      </div>

      {/* Name + Expiry */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[9px] text-white/40 uppercase tracking-widest mb-1">Card Holder</p>
          <p className="text-sm text-white/85 font-semibold tracking-wide truncate max-w-[140px]">
            {form.cardholderName || "FULL NAME"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-white/40 uppercase tracking-widest mb-1">Expires</p>
          <p className="text-sm text-white/85 font-semibold">{form.expiry || "MM/YY"}</p>
        </div>
      </div>
    </div>
  );
}