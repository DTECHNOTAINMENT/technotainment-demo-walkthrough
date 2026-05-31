"use client";

// Header action buttons for the channel page — mirrors microcast.jsx's right-side actions
// for a normal viewer: follow (glass) + tip with CAST (brand-gradient) + share.
// Public/SSR page: we always render the viewer actions (no owner detection here).
// - follow  -> POST /api/follow (no-DB safe; route simulates the toggle)
// - tip     -> scrolls to the SupportBar (#support) so the existing tip flow drives the spend
// - share   -> client no-op confirm (copies the URL when possible)
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";

export function ChannelActions({ channelId, handle }: { channelId: string; handle: string }) {
  const router = useRouter();
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [shared, setShared] = useState(false);

  async function toggleFollow() {
    if (busy) return;
    setBusy(true);
    const next = !following;
    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ channelId, action: next ? "follow" : "unfollow" }),
      });
      if (res.status === 401) {
        router.push("/sign-in");
        return;
      }
      setFollowing(next);
    } catch {
      // No-DB demo: still reflect the toggle so the flow completes.
      setFollowing(next);
    } finally {
      setBusy(false);
    }
  }

  function tip() {
    const el = document.getElementById("support");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function share() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: handle, url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      /* user cancelled / unavailable — fine */
    }
    setShared(true);
    setTimeout(() => setShared(false), 1600);
  }

  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <button onClick={() => void toggleFollow()} className="btn btn-glass lower" style={{ padding: "10px 16px" }} disabled={busy}>
        <Icon name="heart" size={14} stroke={2.4} fill={following ? "currentColor" : "none"} /> {following ? "following" : "follow"}
      </button>
      <button onClick={tip} className="btn btn-grad lower" style={{ padding: "10px 16px" }}>
        <Icon name="tip" size={14} stroke={2.4} /> tip with CAST
      </button>
      <button onClick={() => void share()} className="btn btn-glass lower" style={{ padding: "10px 16px" }}>
        <Icon name="share" size={14} stroke={2.4} /> {shared ? "copied" : "share"}
      </button>
    </div>
  );
}

export default ChannelActions;
