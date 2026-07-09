import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { createClient, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/_core/hooks/useAuth";
import { Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function AdminLogin() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (user.role === "admin") {
      setLocation("/admin");
    } else {
      setAccessDenied(true);
      if (isSupabaseConfigured()) {
        createClient().auth.signOut();
      }
    }
  }, [user?.id, user?.role, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAccessDenied(false);

    try {
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          toast.error(error.message || "Connexion échouée");
          return;
        }
        // useAuth will re-run; useEffect above will redirect or show access denied
      } else {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || "Connexion échouée");
          return;
        }
        // useEffect will handle redirect once useAuth picks up the new session
        toast.success("Connexion réussie !");
      }
    } catch {
      toast.error("Erreur de connexion au serveur");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05050D] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-white/40" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05050D] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#614AFC] to-[#E24EA0] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">LinkedRank <span className="text-white/30 font-normal text-sm">/ admin</span></span>
        </div>

        {/* Card */}
        <div className="bg-[#0F101C] border border-[#262838] rounded-2xl p-8">
          <h1 className="text-xl font-semibold text-white mb-1">Espace administrateur</h1>
          <p className="text-sm text-white/40 mb-6">Accès réservé à l'équipe interne.</p>

          {accessDenied && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              Ce compte n'a pas les droits administrateur.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="admin@linkedrank.fr"
                  className="w-full bg-[#181928] border border-[#262838] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#614AFC] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full bg-[#181928] border border-[#262838] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#614AFC] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#614AFC] to-[#E24EA0] hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Accéder au dashboard"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-white/20 mt-6">
          LinkedRank — usage interne uniquement
        </p>
      </div>
    </div>
  );
}
