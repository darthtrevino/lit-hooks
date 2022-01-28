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

@customElement("test-comp-b")
class CompB extends LitElement {
  private effects = new SideEffects(this);
  public x = 0;
  public y = 0;

  override render() {
    this.effects.use(
      function renderEffect(this: CompB) {
        this.x = 100;
        return () => {
          this.y = 75;
        };
      }.bind(this),
      []
    );
    return html`<div>okay!</div>`;
  }
}

@customElement("test-comp-noid")
class CompNoid extends LitElement {
  private effects = new SideEffects(this);
  public x = 0;
  public y = 0;

  override render() {
    this.effects.use(() => {
      this.x = 100;
      return () => {
        this.y = 75;
      };
    }, []);
    return html`<div>okay!</div>`;
  }
}
@customElement("test-comp-deps-different")
class CompDepsDifferent extends LitElement {
  private effects = new SideEffects(this);
  public x = 0;
  public y = 0;

  override render() {
    const deps = [this.x];
    if (this.x > 0) {
      deps.push(this.y);
    }
    this.effects.use(
      function depDiff(this: CompDepsDifferent) {
        this.x = 100;
        return () => {
          this.y = 75;
        };
      }.bind(this),
      deps
    );
    return html`<div>okay!</div>`;
  }
}

@customElement("test-comp-single-run")
class SingleRun extends LitElement {
  private effects = new SideEffects(this);
  public x = 0;
  public y = 0;
  public z = 10;

  override render() {
    const deps = [this.x];
    if (this.x > 0) {
      deps.push(this.y);
    }
    this.effects.use(
      function onlySingleRun(this: SingleRun) {
        this.x += 100;
        return () => {
          this.y = 75;
        };
      }.bind(this),
      [this.z]
    );
    return html`<div>okay!</div>`;
  }
}

@customElement("test-comp-no-dispose")
class NoDispose extends LitElement {
  private effects = new SideEffects(this);
  public x = 0;
  public y = 0;
  public z = 10;

  noDisposeEffect = () => {
    this.x += 100;
  };

  override render() {
    const deps = [this.x];
    if (this.x > 0) {
      deps.push(this.y);
    }
    this.effects.use(this.noDisposeEffect, [this.x]);
    return html`<div>okay!</div>`;
  }
}

@customElement("test-comp-no-deps")
class NoDeps extends LitElement {
  private effects = new SideEffects(this);
  public x = 0;
  public y = 0;
  public z = 10;

  noDisposeEffect = () => {
    this.x += 100;
  };

  override render() {
    const deps = [this.x];
    if (this.x > 0) {
      deps.push(this.y);
    }
    this.effects.use(this.noDisposeEffect);
    return html`<div>okay!</div>`;
  }
}

describe("SideEffects Controller", () => {
  it("can execute an effect", () => {
    const comp = new CompA();
    comp.connectedCallback();
    comp.render();
    expect(comp.x).toEqual(100);

    comp.disconnectedCallback();
    expect(comp.y).toEqual(75);
  });

  it("can execute an effect defined inline", () => {
    const comp = new CompB();
    comp.connectedCallback();
    comp.render();
    expect(comp.x).toEqual(100);
  });

  it("throws if an effect cannot be identified", () => {
    const comp = new CompNoid();
    expect(() => comp.render()).toThrow(/Could not get id for hook function/);
  });

  it("throws if the hook dependency list changes length", () => {
    const comp = new CompDepsDifferent();
    comp.render();
    expect(() => comp.render()).toThrow(
      /Effect dependency length should not change/
    );
  });

  it("avoids re-running an effect if the dependencies stay the same", () => {
    const comp = new SingleRun();
    comp.render();
    comp.render();
    comp.render();
    expect(comp.x).toEqual(100);
  });

  it("can handle effects without dispose returns", () => {
    const comp = new NoDispose();
    comp.render();
    comp.render();
    comp.render();
    expect(comp.x).toEqual(300);
  });

  it("renders effects without dependencies every time", () => {
    const comp = new NoDeps();
    comp.render();
    comp.render();
    comp.render();
    expect(comp.x).toEqual(300);
  });
});
