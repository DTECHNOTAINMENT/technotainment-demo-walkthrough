/**
 * /studio/onboarding — "become a creator" entry. This page sits under the studio segment but
 * is the ONE studio route that must render for a NON-creator (the layout redirects non-creators
 * here), so it renders the onboarding form itself rather than relying on requireCreatorChannel.
 * Server gate: must be signed in; if already a creator, bounce to /studio.
 */
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/session";
import { requireCreatorChannel } from "@/lib/studio";
import { SxOnboard } from "@/components/studio-x/SxOnboard";

export const dynamic = "force-dynamic";

export default async function StudioOnboardingPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/sign-in?next=/studio/onboarding");

  // Already a creator? Skip straight to the studio. (Don't let redirect() — which throws —
  // be swallowed by the not-a-creator catch.)
  let isCreator = false;
  try {
    await requireCreatorChannel();
    isCreator = true;
  } catch {
    // not a creator yet — render the onboarding form below
  }
  if (isCreator) redirect("/studio");

  return <SxOnboard defaultName={session.displayName} defaultHandle={session.handle} />;
}
