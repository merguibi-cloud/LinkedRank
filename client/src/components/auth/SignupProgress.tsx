import type { SignupStep } from "./AuthLayout";

const STEPS = [
  { step: 1 as SignupStep, label: "Profil" },
  { step: 2 as SignupStep, label: "Sécurité" },
];

export function SignupProgress({ currentStep }: { currentStep: SignupStep }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2">
        {STEPS.map((s, index) => (
          <div key={s.step} className="flex items-center gap-2 flex-1">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                s.step <= currentStep
                  ? "bg-gradient-to-br from-violet to-rose text-white"
                  : "border border-white/20 text-muted-foreground"
              }`}
            >
              {s.step}
            </div>
            <span
              className={`text-sm font-medium hidden sm:block ${
                s.step <= currentStep ? "text-white" : "text-muted-foreground"
              }`}
            >
              {s.label}
            </span>
            {index < STEPS.length - 1 && (
              <div
                className={`h-0.5 flex-1 rounded transition-colors ${
                  s.step < currentStep ? "bg-violet" : "bg-white/10"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
