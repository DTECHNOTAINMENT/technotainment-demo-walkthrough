/**
 * ModerationProvider port — docs/INTEGRATIONS.md §4 ("Moderation AI"). Real
 * provider: Hive (image/video) / OpenAI (text). AI auto-flag holds risky items for
 * human review (docs/DECISIONS.md §2).
 */

export type ModerationVerdict = "pass" | "flag" | "block";

export interface ModerationResult {
  verdict: ModerationVerdict;
  /** Triggered category labels (e.g. "violence", "nudity"). */
  categories: string[];
  /** 0–1 confidence of the strongest signal. */
  score: number;
}

export interface ModerationProvider {
  /** Check a piece of content (text or media) against policy. */
  check(input: {
    kind: "text" | "image" | "video";
    content: string; // text body, or media URL for image/video
  }): Promise<ModerationResult>;
}
