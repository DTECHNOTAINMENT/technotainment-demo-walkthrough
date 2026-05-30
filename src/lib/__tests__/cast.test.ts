import { describe, it, expect } from "vitest";
import {
  isValidCast,
  assertCast,
  castToFiat,
  fiatToCast,
  formatFiat,
  formatCast,
  feeSplit,
} from "../cast";

describe("cast money helpers", () => {
  it("validates integer CAST only", () => {
    expect(isValidCast(100)).toBe(true);
    expect(isValidCast(0)).toBe(true);
    expect(isValidCast(-50)).toBe(true);
    expect(isValidCast(10.5)).toBe(false);
    expect(isValidCast(NaN)).toBe(false);
    expect(isValidCast("100" as unknown)).toBe(false);
  });

  it("throws on non-integer CAST", () => {
    expect(() => assertCast(10.5)).toThrow();
    expect(() => assertCast(100)).not.toThrow();
  });

  it("converts CAST <-> fiat at 100 CAST = £1.00", () => {
    expect(castToFiat(4200)).toBe(42);
    expect(fiatToCast(42)).toBe(4200);
    expect(fiatToCast(0.01)).toBe(1);
  });

  it("formats fiat and cast", () => {
    expect(formatFiat(4200)).toBe("£42.00");
    expect(formatCast(12500)).toBe("12,500");
  });

  it("splits the platform fee (12% default) as integers", () => {
    const { feeCast, netCast } = feeSplit(1000);
    expect(feeCast).toBe(120);
    expect(netCast).toBe(880);
    expect(feeCast + netCast).toBe(1000); // never loses a cast
  });

  it("supports a per-creator take-rate override", () => {
    const { feeCast, netCast } = feeSplit(1000, 0.2);
    expect(feeCast).toBe(200);
    expect(netCast).toBe(800);
  });
});
