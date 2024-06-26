export interface ISettings {
  saves: Record<number, IGameData | {}>;
  settings: Record<string, any>;
  autoLoad?: number;
}

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

export interface IItemCount {
  item: string;
  count: number;
  recipe?: Record<string, number>;
}

export interface IItemProps {
  tag: string[];
  price: number;
  buyCount?: number;
  recipe?: Record<string, number>;
  craftCount?: number;
}

export interface IItemGroup {
  [name: string]: IItemProps;
}

export interface IEventCondition {
  day?: number;
  // time: "morning" | "afternoon" | "night";
  time?: number;
  hasItem?: IItemCount[];
  eventCompleted?: string[];
}

export interface IEventAction<TYPE = "dialog" | "text" | "condition"> {
  type: TYPE;
  data: TYPE extends "dialog"
    ? {
        name: string;
        text: string;
        icon: string;
      }
    : TYPE extends "text"
    ? string
    : never;
}

export interface IEventReward<
  TYPE = "item" | "flag" | "money" | "recipe" | "fame"
> {
  type: TYPE;
  data: TYPE extends "item"
    ? {
        item: string;
        count: number;
      }
    : TYPE extends "flag"
    ? {
        flag: string;
        value: boolean;
      }
    : TYPE extends "money"
    ? {
        money: number;
      }
    : TYPE extends "recipe"
    ? {
        recipe: string;
      }
    : TYPE extends "fame"
    ? {
        fame: number;
      }
    : never;
}

export interface ILanguageMap {
  en_US?: Record<string, string>;
  zh_CN?: Record<string, string>;
}
