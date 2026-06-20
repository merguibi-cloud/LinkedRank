import { Button } from "@/components/ui/button";

import { getLinkedInConnectUrl } from "@/const";

import { useLinkedInStatus } from "@/hooks/useLinkedInStatus";

import { CheckCircle2, Linkedin } from "lucide-react";



function BannerSkeleton() {

  return (

    <div

      className="mb-6 flex min-h-[76px] items-center gap-3 rounded-xl border border-border/50 bg-card/30 p-4 animate-pulse"

      aria-hidden="true"

    >

      <div className="h-12 w-12 shrink-0 rounded-full bg-muted" />

      <div className="flex-1 space-y-2">

        <div className="h-4 w-48 rounded bg-muted" />

        <div className="h-3 w-64 rounded bg-muted" />

      </div>

    </div>

  );

}



export function LinkedInConnectBanner() {

  const { status, loading } = useLinkedInStatus();



  if (loading) {

    return <BannerSkeleton />;

  }



  if (status.connected) {

    return (

      <div className="mb-6 flex flex-col gap-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-center gap-3 min-w-0">

          {status.profilePicture ? (

            <img

              src={status.profilePicture}

              alt={status.profileName ?? "Profil LinkedIn"}

              className="h-12 w-12 shrink-0 rounded-full object-cover border-2 border-emerald-500/40"

              referrerPolicy="no-referrer"

            />

          ) : (

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0077B5]">

              <Linkedin className="h-6 w-6 text-white" />

            </div>

          )}

          <div className="min-w-0">

            <p className="font-medium text-white flex items-center gap-2">

              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />

              LinkedIn connecté

            </p>

            <p className="text-sm text-muted-foreground truncate">

              {status.profileName

                ? `Compte : ${status.profileName}`

                : "Votre compte est prêt pour publier"}

            </p>

          </div>

        </div>

        <span className="shrink-0 text-sm font-medium text-emerald-400">Prêt à publier</span>

      </div>

    );

  }



  return (

    <div className="mb-6 flex flex-col gap-4 rounded-xl border border-[#0077B5]/30 bg-[#0077B5]/10 p-4 sm:flex-row sm:items-center sm:justify-between">

      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0077B5]">

          <Linkedin className="h-5 w-5 text-white" />

        </div>

        <div>

          <p className="font-medium text-white">LinkedIn non connecté</p>

          <p className="text-sm text-muted-foreground">

            Connectez votre compte pour publier et programmer vos posts

          </p>

        </div>

      </div>

      <a href={getLinkedInConnectUrl("/dashboard")} className="shrink-0">

        <Button className="bg-[#0077B5] hover:bg-[#006699]">

          <Linkedin className="mr-2 h-4 w-4" />

          Connecter LinkedIn

        </Button>

      </a>

    </div>

  );

}


