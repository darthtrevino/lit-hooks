import { SideEffects } from "../effects.mjs";
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("test-comp-a")
class CompA extends LitElement {
  private effects = new SideEffects(this);
  public x = 0;
  public y = 0;

  private renderEffect = () => {
    this.x = 100;
    return () => {
      this.y = 75;
    };
  };

  override render() {
    this.effects.use(this.renderEffect, []);
    return html`<div>okay!</div>`;
  }
}

describe("SideEffects Controller", () => {
  it("can execute an effect", () => {
    const comp = new CompA();
    comp.render();
    expect(comp.x).toEqual(100);
  });
});
