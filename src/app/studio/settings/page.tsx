/**
 * /studio/settings — channel identity, payout & tax, moderation and team. Tabbed settings
 * fed from the creator/channel record. There's no settings-write endpoint in this phase, so
 * the form is presentational (controlled-but-local); persistence ships in a later phase.
 */
import { redirect } from "next/navigation";
import { requireCreatorChannel } from "@/lib/studio";
import { StudioPageHead } from "@/components/studio-ui";
import { SxSettings } from "@/components/studio-x/SxSettings";

export const dynamic = "force-dynamic";

export default async function StudioSettingsPage() {
  let creator: Awaited<ReturnType<typeof requireCreatorChannel>>["creator"];
  let channelBio: string | null;
  try {
    const result = await requireCreatorChannel();
    creator = result.creator;
    channelBio = result.channel.bio;
  } catch {
    redirect("/studio/onboarding");
  }

  return (
    <div className="page-pad" style={{ maxWidth: 1100, margin: "0 auto" }}>
      <StudioPageHead
        eyebrow="creator studio"
        title="settings"
        sub="your channel identity, payout details, moderation rules and team access."
      />
      <SxSettings
        name={creator.name}
        handle={creator.handle}
        category={creator.category}
        bio={creator.bio ?? channelBio ?? ""}
        brand={creator.brand}
        brand2={creator.brand2}
        takeRatePct={creator.takeRatePct}
        payoutLabel="bank transfer · barclays"
        payoutSub="•••• 4417 · GBP"
      />
    </div>
  );
}
