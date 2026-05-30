/**
 * Creator Studio — go-live control room (/studio/live). Server-loads the channel's
 * streams (listStreams, newest first) to seed the client StGoLive with the current
 * live stream (if any) or the last one's encoder details. All interactivity — go
 * live / end / rotate key, simulated monitor — lives in the client component.
 * Mirrors prototype/v4/studio-golive.jsx. Realtime chat is Phase 5.
 */
import { redirect } from "next/navigation";
import { requireCreatorChannel } from "@/lib/studio";
import { listStreams } from "@/lib/queries/studio";
import { StGoLive } from "@/components/studio/StGoLive";

export default async function StudioLivePage() {
  let channelId: string;
  try {
    const { channel } = await requireCreatorChannel();
    channelId = channel.id;
  } catch {
    redirect("/studio/onboarding");
  }

  const streams = await listStreams(channelId);
  const liveStream = streams.find((s) => s.status === "live");
  const seed = liveStream ?? streams[0] ?? null;

  return (
    <div style={{ maxWidth: 1300, margin: "0 auto", padding: "28px 24px 80px" }}>
      <StGoLive
        initial={
          seed
            ? {
                streamId: seed.id,
                rtmpUrl: seed.rtmpUrl,
                streamKey: seed.streamKey,
                live: seed.status === "live",
              }
            : null
        }
      />
    </div>
  );
}
