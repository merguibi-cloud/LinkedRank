import { Check, X } from "lucide-react";

interface PasswordStrengthProps {
  password: string;
}

const RULES = [
  { id: "length", label: "8 caractères minimum", test: (p: string) => p.length >= 8 },
  { id: "upper", label: "Une majuscule", test: (p: string) => /[A-Z]/.test(p) },
  { id: "number", label: "Un chiffre", test: (p: string) => /[0-9]/.test(p) },
];

export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const passed = RULES.filter((r) => r.test(password)).length;
  const strength = passed === 0 ? 0 : passed === 1 ? 1 : passed === 2 ? 2 : 3;
  const colors = ["bg-red-500", "bg-amber-500", "bg-yellow-400", "bg-emerald-500"];
  const labels = ["Faible", "Moyen", "Bon", "Excellent"];

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < strength ? colors[strength] : "bg-white/10"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Sécurité : <span className="text-white/80">{labels[strength]}</span>
      </p>
      <ul className="space-y-1">
        {RULES.map((rule) => {
          const ok = rule.test(password);
          return (
            <li key={rule.id} className="flex items-center gap-2 text-xs">
              {ok ? (
                <Check className="h-3 w-3 text-emerald-400 shrink-0" />
              ) : (
                <X className="h-3 w-3 text-muted-foreground shrink-0" />
              )}
              <span className={ok ? "text-emerald-400/90" : "text-muted-foreground"}>
                {rule.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
