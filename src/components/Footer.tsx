import { HeartPulse, ShieldAlert } from "lucide-react";
export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 text-sm text-slate-500 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 text-slate-300"><HeartPulse className="h-4 w-4 text-rose-400" /> CardioAI · Projet d'application intelligente</div>
        <div className="flex max-w-xl items-start gap-2"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <p>Outil pédagogique d'aide à la décision. Il ne remplace en aucun cas le diagnostic d'un professionnel de santé.</p></div>
      </div>
    </footer>
  );
}
