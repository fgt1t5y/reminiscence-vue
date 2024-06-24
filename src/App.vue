<template>
  <div class="scene">
    <dialog class="title-screen" ref="titleScreen" open>
      <div class="title-wrapper">
        <h1>Reminiscence</h1>
        <button class="btn-regular" @click="startNewGame">
          {{ $t("ui.newGame") }}
        </button>
        <button class="btn-regular">{{ $t("ui.loadGame") }}</button>
        <button class="btn-regular">{{ $t("ui.settings") }}</button>
      </div>
      <div style="text-align: center">
        <span>{{ $t("message.system.alphaVersion") }}</span>
      </div>
    </dialog>
    <dialog class="game-screen" ref="gameScreen">
      <div class="game-data-display">
        <div>
          <b>{{ $t("ui.day") }}</b>
          <span>{{ currentData.day }}</span>
        </div>
        <div>
          <b>{{ $t("ui.time") }}</b>
          <span>{{ $t(`ui.time.${currentData.time}`) }}</span>
        </div>
        <div>
          <b>{{ $t("ui.money") }}</b>
          <span>{{ currentData.money }}</span>
        </div>
        <div>
          <b>{{ $t("ui.fame") }}</b>
          <span>{{ currentData.fame }}</span>
        </div>
      </div>
      <hr />
      <details open>
        <summary>
          <h2>{{ $t("ui.inventory") }}</h2>
        </summary>
        <details open>
          <summary>
            <h3>{{ $t("ui.ingredients") }}</h3>
          </summary>
          <div class="inventory">${this.#renderInventory('ingredient')}</div>
        </details>
        <details open>
          <summary>
            <h3>{{ $t("ui.products") }}</h3>
          </summary>
          <div class="inventory">${this.#renderInventory('product')}</div>
        </details>
      </details>
      <hr />
      <details open>
        <summary>
          <h2>{{ $t("ui.recipes") }}</h2>
        </summary>
        <div class="recipes">${this.#renderRecipes()}</div>
      </details>
      <hr />
      <details>
        <summary>
          <h2>{{ $t("ui.purchase") }}</h2>
        </summary>
        <div class="purchase">
          <div v-for="purchase in purchaseList" class="list-item">
            <div class="item-name">
              <div>
                {{ $t(`item.${purchase}`) }} ×
                {{ itemProperties[purchase].buyCount }}
              </div>
            </div>
            <div class="purchase-count">
              <div>{{ $t("ui.purchaseCount") }}</div>
              <div>
                <button>1</button>
                <button>10</button>
                <button>100</button>
              </div>
            </div>
          </div>
        </div>
      </details>
    </dialog>
  </div>
  <div class="console-wrapper">
    <div class="console" ref="consolePanel"></div>
    <div class="click-to-continue">
      {{ $t("message.system.clickToContinue") }}
    </div>
    <div class="input-wrapper">
      <textarea
        class="input"
        ref="consoleInput"
        @keydown="handleConsoleKeydown"
      ></textarea>
      <button class="submit" @click="handleConsoleSubmit">OK</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import {
  GameData,
  type IGameData,
  defaultData,
  defaultSettings,
  type ISettings,
} from "./GameData";
import { compareObjects } from "./utils";
import { computed } from "vue";
import { itemProperties } from "./items";
import { gameEvents } from "./events";
import type { IEventAction, IEventReward } from "./event";

const { t, mergeLocaleMessage } = useI18n();

// 合并事件语言文本到主文本
gameEvents.forEach((event) => {
  mergeLocaleMessage("en_US", event.languageMap.en_US);
  mergeLocaleMessage("zh_CN", event.languageMap.zh_CN);
});

const currentData = ref<IGameData>(defaultData);
const currentSettings = ref<ISettings>(defaultSettings);
const titleScreen = ref<HTMLDialogElement>();
const consolePanel = ref<HTMLDivElement>();
const consoleInput = ref<HTMLTextAreaElement>();
const gameScreen = ref<HTMLDialogElement>();
const currentSlot = ref<number>(0);

const purchaseList = computed(() => {
  return Object.keys(itemProperties)
    .filter((item) => itemProperties[item].tag.includes("ingredient"))
    .sort();
});

const gameConsole = {
  put: (...data: any[]) => {
    let div = document.createElement("div");
    const consoleEl = consolePanel.value;
    if (!consoleEl) return;
    data.forEach((item) => {
      if (item instanceof Node) {
        div.appendChild(item);
      } else {
        div.innerHTML = item;
      }
      consoleEl.appendChild(div);
    });
    while (consoleEl.childElementCount > 255) {
      consoleEl.removeChild(consoleEl.firstChild!);
    }
    consoleEl.scrollTo({
      top: consoleEl.scrollHeight,
      behavior: "smooth",
    });
  },
  clear: () => {
    consolePanel.value!.innerHTML = "";
  },
};

const handleConsoleKeydown = (e: KeyboardEvent) => {
  if (e.key == "Enter") {
    e.preventDefault();
    executeCommand(consoleInput.value?.value!);
  }
};

const handleConsoleSubmit = () => {
  let input = consoleInput.value!.value.trim();
  executeCommand(input);
};

const executeCommand = (data: string) => {
  if (!data) return;

  if (data.startsWith("help")) {
    gameConsole.put(t("help.title"));
    gameConsole.put(t("help.command.help"));
    gameConsole.put(t("help.command.clear"));
    gameConsole.put(t("help.command.settings"));
    gameConsole.put(t("help.command.save"));
    gameConsole.put(t("help.command.load"));
    gameConsole.put(t("help.command.delete"));
  } else if (data.trim() == "clear") {
    gameConsole.clear();
  } else if (data.trim() == "settings") {
    gameConsole.put(t("message.system.notImplemented"));
  } else if (data.trim().startsWith("save")) {
    let slot = Number(data.split(" ")[1]);
    if (slot >= 0 && slot <= 4 && Number.isInteger(slot)) {
      saveGame(slot);
      gameConsole.put(t("message.system.saved") + `${slot}`);
    } else {
      gameConsole.put(t("message.system.invalidSlot"));
    }
  } else if (data.trim().startsWith("load")) {
    let slot = Number(data.split(" ")[1]);
    if (slot >= 0 && slot <= 4 && Number.isInteger(slot)) {
      let isNewGame = loadGame(slot);
      if (isNewGame == false) {
        gameConsole.put(t("message.system.loaded"));
      }
    } else {
      gameConsole.put(t("message.system.invalidSlot"));
    }
  } else if (data.trim().startsWith("delete")) {
    let slot = Number(data.split(" ")[1]);
    if (slot >= 0 && slot <= 4 && Number.isInteger(slot)) {
      GameData.setItem(`saves.${slot}`, {});
      gameConsole.put(t("message.system.deletedSave") + `${slot}`);
    } else {
      gameConsole.put(t("message.system.invalidSlot"));
    }
  } else if (data.trim().startsWith("money")) {
    let nm = Number(data.split(" ")[1]);
    currentData.value.money = nm;
  } else {
    gameConsole.put(t("message.system.invalidCommand"));
  }
  consoleInput.value!.value = "";
};

const startNewGame = () => {
  titleScreen.value!.close();
  // currentData.value = structuredClone(defaultData);
  saveGame(0);
  gameScreen.value!.show();
  gameConsole.clear();

  listenToEvents();
  checkEventConditions();
};

const saveGame = (slot: number) => {
  GameData.setItem(`saves.${slot}`, currentData.value);
};

const loadGame = (slot: number) => {
  GameData.setItem("autoLoad", slot);
  location.reload();
};

const autoLoad = () => {
  let autoLoad = GameData.getItem("autoLoad") as number;
  if (autoLoad != null) {
    let data = GameData.getItem(`saves.${autoLoad}`);
    if (Object.keys(data).length > 0) {
      currentData.value = compareObjects(defaultData, data);
      if (gameScreen.value!.open == false) {
        gameScreen.value!.show();
      }
      titleScreen.value!.close();
      gameConsole.clear();
      currentSlot.value = autoLoad;
      GameData.setItem("autoLoad", null);
      return false;
    } else {
      startNewGame();
      gameConsole.put(t("message.system.noSaveFound"));
      currentSlot.value = autoLoad;
      GameData.setItem("autoLoad", null);
      return true;
    }
  }
};

const createDialogItem = (name: string, text: string, icon: string) => {
  // let item = createElement("aq-minicard");
  // let header = createElement("aq-ts")
  //   .attribute("key", name)
  //   .attribute("slot", "header");
  // let content = createElement("aq-ts").attribute("key", text);
  // item.appendChild(header);
  // item.appendChild(content);
  // if (icon) {
  //   item.icon = icon;
  // }
  // return item;
};

const listenToEvents = () => {
  gameEvents.forEach((event) => {
    event.addEventListener("start", () => {
      gameConsole.put(document.createElement("hr"));
    });
    event.addEventListener("step", (e: CustomEvent) => {
      let step = e.detail as IEventAction;
      switch (step.type) {
        case "dialog": {
          const s = step as IEventAction<"dialog">;
          gameConsole.put(
            // createDialogItem(s.data.name, s.data.text, s.data.icon)
            s.data.text
          );
          break;
        }
        case "text": {
          const s = step as IEventAction<"text">;
          gameConsole.put(t(s.data));
          break;
        }
        default: {
          throw new Error(`Invalid event step type: ${step.type}`);
        }
      }
      consolePanel.value!.addEventListener(
        "click",
        () => {
          event.play();
        },
        { once: true }
      );
    });
    event.addEventListener("complete", (e: CustomEvent) => {
      let rewards = e.detail as IEventReward[];
      rewards.forEach((reward) => {
        switch (reward.type) {
          case "item": {
            const r = reward as IEventReward<"item">;
            const count = currentData.value.inventory[r.data.item];
            currentData.value.inventory[r.data.item] = count + r.data.count;
            break;
          }
          case "flag": {
            const r = reward as IEventReward<"flag">;
            currentData.value.flags[r.data.flag] = r.data.value;
            break;
          }
          case "money": {
            const r = reward as IEventReward<"money">;
            const money = currentData.value.money;
            currentData.value.money = money + r.data.money;
            break;
          }
          case "recipe": {
            const r = reward as IEventReward<"recipe">;
            currentData.value.recipes[r.data.recipe] = true;
            break;
          }
          case "fame": {
            const r = reward as IEventReward<"fame">;
            const fame = currentData.value.fame;
            currentData.value.fame = fame + r.data.fame;
            break;
          }
          default: {
            throw new TypeError(`Invalid event reward type: ${reward.type}`);
          }
        }
      });
      if (currentData.value.completedEvents.includes(event.id) == false) {
        currentData.value.completedEvents.push(event.id);
      }
      gameConsole.put(document.createElement("hr"));
      currentData.value.ongoingEvent = null;
      checkEventConditions();
    });
  });
};

const checkEventConditions = () => {
  gameEvents.forEach((event) => {
    // console.debug(`Checking event condition: ${event.id}`);
    if (
      currentData.value.completedEvents.includes(event.id) &&
      event.repeatable == false
    ) {
      console.debug(
        `Event condition not met: ${event.id}, because it's already completed and not repeatable.`
      );
      return;
    }

    let data = currentData.value;
    let condition = event.condition;
    let isEventStartable = false;
    let flags = [];

    if (Object.keys(condition).length == 0) isEventStartable = true;

    if ("day" in condition) {
      console.debug(
        `Checking event condition: ${event.id}, day requied ${condition.day}, current day ${data?.day}`
      );
      if (data?.day >= condition.day) {
        flags.push(true);
      } else flags.push(false);
    }
    if ("time" in condition) {
      if (data?.time == condition.time) {
        flags.push(true);
      } else flags.push(false);
    }
    if ("hasItem" in condition) {
      let items = condition.hasItem;
      let allExists = items.every(
        (item) =>
          data?.inventory?.[item.item] &&
          data?.inventory?.[item.item] >= item.count
      );
      if (allExists) {
        flags.push(true);
      } else flags.push(false);
    }
    if ("eventCompleted" in condition) {
      let targets = condition.eventCompleted;
      let allCompleted = targets.every((target) =>
        data.completedEvents.includes(target)
      );
      if (allCompleted) {
        flags.push(true);
      } else flags.push(false);
    }

    if (flags.every((f) => f == true) || flags.length == 0)
      isEventStartable = true;
    if (data.completedEvents.includes(event.id) && event.repeatable == false)
      isEventStartable = false;

    if (
      isEventStartable &&
      currentData.value.ongoingEvent == null &&
      currentData.value.completedEvents.includes(event.id) == false
    ) {
      event.play();
      currentData.value.ongoingEvent = event.id;
    }
  });
};

onMounted(() => {
  gameConsole.put(t("message.system.inited"));

  let data = GameData.getData();
  currentSettings.value = data || defaultSettings;
  GameData.saveData(currentSettings.value);

  autoLoad();
});
</script>
