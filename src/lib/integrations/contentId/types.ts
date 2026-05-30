/**
 * ContentIdProvider port — docs/INTEGRATIONS.md §4 ("Content-ID"). Real provider:
 * Audible Magic. Scans uploaded media for copyrighted music (DMCA) — important for
 * a music-heavy platform.
 */

export type ContentIdResult = "clear" | "match" | "review";

export interface ContentIdScan {
  result: ContentIdResult;
  /** Matched rights-holder references when result is "match". */
  matches: { title: string; rightsHolder: string }[];
}

export interface ContentIdProvider {
  /** Scan a media asset for copyrighted content. */
  scan(input: { assetId: string; mediaUrl?: string }): Promise<ContentIdScan>;
}
