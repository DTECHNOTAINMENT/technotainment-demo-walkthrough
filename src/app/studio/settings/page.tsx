/**
 * /studio/settings — channel identity (name, handle, category, bio, brand colours). Lightly
 * editable form fed from the creator record; persistence ships in a later phase.
 */
import { redirect } from "next/navigation";
import { requireCreatorChannel } from "@/lib/studio";
import { SxPageHead, SX_PAGE } from "@/components/studio-x/SxPrimitives";
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
    <div style={{ ...SX_PAGE, maxWidth: 1000 }}>
      <SxPageHead title="settings" sub="your channel identity, brand and bio." />
      <SxSettings
        name={creator.name}
        handle={creator.handle}
        category={creator.category}
        bio={creator.bio ?? channelBio ?? ""}
        brand={creator.brand}
        brand2={creator.brand2}
      />
    </div>
  );
}
