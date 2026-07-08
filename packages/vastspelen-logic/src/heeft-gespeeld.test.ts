import { describe, expect, it } from "vitest";
import { heeftGespeeld } from "./heeft-gespeeld";

describe("heeftGespeeld", () => {
  it("is true op precies 75%", () => {
    expect(heeftGespeeld({ minuten: 45, wedstrijdduur: 60 })).toBe(true);
  });

  it("is false net onder 75%", () => {
    expect(heeftGespeeld({ minuten: 44, wedstrijdduur: 60 })).toBe(false);
  });

  it("is true bij volledige wedstrijd", () => {
    expect(heeftGespeeld({ minuten: 60, wedstrijdduur: 60 })).toBe(true);
  });

  it("is false bij 0 minuten", () => {
    expect(heeftGespeeld({ minuten: 0, wedstrijdduur: 60 })).toBe(false);
  });
});
