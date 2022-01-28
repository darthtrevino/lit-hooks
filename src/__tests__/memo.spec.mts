import { Memoization } from "../memo.mjs";
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("test-memo-a")
class CompA extends LitElement {
  private memos = new Memoization(this);
  public x = 0;
  public memoCount = 0;

  private resultMemo = () => {
    this.memoCount++;
    return 100;
  };

  override render() {
    this.x = this.memos.use(this.resultMemo, []);
    return html`<div>okay!</div>`;
  }
}

@customElement("test-memo-deps-different")
class CompDepsDifferent extends LitElement {
  private memos = new Memoization(this);
  public x = 0;

  private resultMemo = () => {
    this.x += 1;
    return 100;
  };

  override render() {
    const deps = [this.x];
    if (this.x > 0) {
      deps.push(100);
    }
    this.memos.use(this.resultMemo, deps);
    return html`<div>okay!</div>`;
  }
}

describe("Memization Controller", () => {
  it("can execute an memoization", () => {
    const comp = new CompA();
    comp.connectedCallback();
    comp.render();
    comp.render();
    comp.render();
    expect(comp.x).toEqual(100);
    expect(comp.memoCount).toEqual(1);
  });

  it("throws if the hook dependency list changes length", () => {
    const comp = new CompDepsDifferent();
    comp.render();
    expect(() => comp.render()).toThrow(
      /Effect dependency length should not change/
    );
  });
});
