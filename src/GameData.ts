import { compareObjects } from "./utils";

export interface ISettings {
  saves: Record<number, IGameData | {}>;
  settings: Record<string, any>;
  autoLoad?: number;
}

export const defaultSettings: ISettings = {
  saves: {
    0: {},
    1: {},
    2: {},
    3: {},
    4: {},
  },
  settings: {
    language: "zh_CN",
  },
  autoLoad: undefined,
};

export interface IGameData {
  day: number;
  time: number;
  money: number;
  fame: number;
  ongoingEvent: string | null;
  completedEvents: string[];
  inventory: Record<string, number>;
  shelf: null;
  recipes: Record<string, boolean>;
  flags: Record<string, boolean>;
}

export const defaultData: IGameData = {
  day: 0,
  time: 2,
  money: 99999,
  fame: 0,
  ongoingEvent: null,
  completedEvents: [],
  inventory: {
    flour: 20,
    sugar: 10,
    egg: 10,
    butter: 10,
  },
  shelf: null,
  recipes: {
    whiteBread: true,
  },
  flags: {},
};

export class GameData {
  static getData(): ISettings | null {
    let local = localStorage.getItem("reminiscence_game_data");
    if (local == null) {
      localStorage.setItem(
        "reminiscence_game_data",
        JSON.stringify(defaultSettings)
      );
      return null;
    } else {
      let data = JSON.parse(local);
      return compareObjects(defaultSettings, data);
    }
  }

  static saveData(data: ISettings) {
    localStorage.setItem("reminiscence_game_data", JSON.stringify(data));
  }

  /**
   * @param {string} path
   * @example GameData.getItem('saves.1.currentDay')
   */
  static getItem(path: string): any {
    let data = GameData.getData();
    if (data == null) return null;
    let keys = path.split(".");
    let result = data;
    for (let i = 0; i < keys.length; i++) {
      if (result[keys[i]] == null) return null;
      result = result[keys[i]];
    }
    return result;
  }

  /**
   *
   * @param {string} path
   * @param {any} value
   * @example GameData.setItem('saves.1.currentDay', 12)
   */
  static setItem(path: string, value: any) {
    let data = GameData.getData();
    if (data == null) return;
    let keys = path.split(".");
    let result = data;
    for (let i = 0; i < keys.length - 1; i++) {
      if (result[keys[i]] == null) result[keys[i]] = {};
      result = result[keys[i]];
    }
    result[keys[keys.length - 1]] = value;
    GameData.saveData(data);
  }
}
