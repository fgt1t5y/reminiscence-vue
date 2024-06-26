import type {
  IEventAction,
  IEventCondition,
  IEventReward,
  ILanguageMap,
} from "./type";

export class GameEvent extends EventTarget {
  id: string;
  sequence: IEventAction[];
  condition: IEventCondition;
  languageMap: ILanguageMap;
  rewards: IEventReward[];
  repeatable: boolean;

  constructor(id: string) {
    super();

    this.id = id;
    this.sequence = [];
    this.condition = {};
    this.languageMap = {};
    this.rewards = [];
    this.repeatable = false;
  }

  currentStep = 0;

  dialog(name: string, text: string, icon: string) {
    this.sequence.push({ type: "dialog", data: { name, text, icon } });
  }

  text(text: string) {
    this.sequence.push({ type: "text", data: text });
  }

  // wait(condition) {}

  play() {
    if (this.currentStep >= this.sequence.length) {
      return;
    } else {
      if (this.currentStep == 0) {
        this.dispatchEvent(new CustomEvent("start", { detail: this.id }));
      }
      const step = this.sequence[this.currentStep];
      this.dispatchEvent(new CustomEvent("step", { detail: step }));
      this.currentStep++;
      if (this.currentStep == this.sequence.length) {
        this.dispatchEvent(
          new CustomEvent("complete", { detail: this.rewards })
        );
      }
    }
  }

  terminate() {
    this.currentStep = 0;
  }

  lang(map: ILanguageMap) {
    this.languageMap = map;
  }

  getLang() {
    return this.languageMap;
  }
}
