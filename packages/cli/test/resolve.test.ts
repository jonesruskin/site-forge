import { describe, expect, it } from "vitest";

import { dependentsOf, resolvePlan } from "../src/resolve";
import { loadRepoRegistry } from "./helpers";

describe("resolvePlan", async () => {
  const registry = await loadRepoRegistry();

  it("adds required modules and orders dependencies first", () => {
    const plan = resolvePlan(registry, { modules: ["contact"], sections: [], ui: [] });
    const names = plan.modules.map((m) => m.name);
    expect(names).toContain("email");
    expect(names).toContain("rate-limit");
    expect(names.indexOf("email")).toBeLessThan(names.indexOf("contact"));
    expect(names.indexOf("rate-limit")).toBeLessThan(names.indexOf("contact"));
    expect(plan.implied.sort()).toEqual(["email", "rate-limit"]);
  });

  it("collects UI primitives transitively", () => {
    const plan = resolvePlan(registry, { modules: ["contact"], sections: [], ui: [] });
    const ui = plan.ui.map((u) => u.name);
    expect(ui).toEqual(expect.arrayContaining(["button", "field", "input", "label", "textarea"]));
  });

  it("only reports new items as added", () => {
    const first = resolvePlan(registry, { modules: ["email"], sections: [], ui: [] });
    const installed = {
      modules: Object.fromEntries(first.modules.map((m) => [m.name, m])),
      sections: {},
      ui: {},
    };
    const second = resolvePlan(registry, { modules: ["contact"], sections: [], ui: [] }, installed);
    expect(second.added.modules).not.toContain("email");
    expect(second.added.modules).toContain("contact");
  });

  it("suggests close matches for unknown names", () => {
    expect(() => resolvePlan(registry, { modules: ["contakt"], sections: [], ui: [] })).toThrow(
      /Did you mean "contact"/,
    );
  });

  it("finds dependents", () => {
    const plan = resolvePlan(registry, { modules: ["contact"], sections: [], ui: [] });
    const modules = Object.fromEntries(plan.modules.map((m) => [m.name, m]));
    expect(dependentsOf("email", modules)).toContain("contact");
  });

  it("rejects conflicts", () => {
    const contact = registry.getModule("contact");
    const fake = { ...registry.getModule("seo"), name: "fake-seo", conflicts: ["contact"] };
    registry.modules.set("fake-seo", fake);
    try {
      expect(() =>
        resolvePlan(registry, { modules: [contact.name, "fake-seo"], sections: [], ui: [] }),
      ).toThrow(/conflicts/);
    } finally {
      registry.modules.delete("fake-seo");
    }
  });

  it("rejects cycles", () => {
    registry.modules.set("cycle-a", {
      ...registry.getModule("seo"),
      name: "cycle-a",
      requires: ["cycle-b"],
    });
    registry.modules.set("cycle-b", {
      ...registry.getModule("seo"),
      name: "cycle-b",
      requires: ["cycle-a"],
    });
    try {
      expect(() => resolvePlan(registry, { modules: ["cycle-a"], sections: [], ui: [] })).toThrow(
        /Circular/,
      );
    } finally {
      registry.modules.delete("cycle-a");
      registry.modules.delete("cycle-b");
    }
  });
});
