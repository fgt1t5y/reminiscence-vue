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
        <div class="data-item">
          <RiCalendar2Line />
          <span>{{ currentData.day }}</span>
        </div>
        <div class="data-item">
          <RiTimeLine />
          <span>{{ $t(`ui.time.${currentData.time}`) }}</span>
        </div>
        <div class="data-item">
          <RiCopperCoinLine />
          <span>{{ currentData.money }}</span>
        </div>
        <div class="data-item">
          <RiUserHeartLine />
          <span>{{ currentData.fame.toFixed(1) }}</span>
        </div>
      </div>
      <div class="game-toolbar">
        <button
          v-if="currentData.flags.firstDayCompleted"
          class="btn-regular"
          :disabled="currentData.ongoingEvent !== null"
          @click="dayLapse()"
        >
          <RiArrowRightSLine />
          {{ $t("ui.nextDay") }}
        </button>
        <button
          v-if="currentData.flags.firstDayCompleted"
          class="btn-regular"
          :disabled="currentData.ongoingEvent !== null"
          @click="timeLapse()"
        >
          <RiZzzLine />
          {{ $t("ui.nextTime") }}
        </button>
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
          <div class="inventory">
            <div
              v-if="ingredientList"
              v-for="ingredient in ingredientList"
              class="list-item"
            >
              <div class="item-name">
                <div>
                  {{ $t(`item.${ingredient}`) }} ×
                  {{ currentData.inventory[ingredient] }}
                </div>
              </div>
            </div>
            <div v-else>{{ $t("ui.emptyInventory") }}</div>
          </div>
        </details>
        <details open>
          <summary>
            <h3>{{ $t("ui.products") }}</h3>
          </summary>
          <div class="inventory">
            <div
              v-if="productList.length > 0"
              v-for="product in productList"
              class="list-item"
            >
              <div class="item-name">
                <div>
                  {{ $t(`item.${product}`) }} ×
                  {{ currentData.inventory[product] }}
                </div>
              </div>
            </div>
            <div v-else>{{ $t("ui.emptyInventory") }}</div>
          </div>
        </details>
      </details>
      <hr />
      <details open>
        <summary>
          <h2>{{ $t("ui.recipes") }}</h2>
        </summary>
        <div class="recipes">
          <RecipeItem
            v-for="recipe in recipeList"
            :item="recipe"
            @craft="handleCraft"
          />
        </div>
      </details>
      <hr />
      <details open>
        <summary>
          <h2>{{ $t("ui.purchase") }}</h2>
        </summary>
        <div class="purchase">
          <PurchaseItem
            v-for="purchase in purchaseList"
            :item="purchase"
            @purchase="handlePurchase"
          />
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
      <button class="submit" @click="handleConsoleSubmit">
        <RiCheckLine />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import type {
  ISettings,
  IGameData,
  IItemCount,
  IEventAction,
  IEventReward,
} from "./type";
import { GameData, defaultData, defaultSettings } from "./GameData";
import { compareObjects } from "./utils";
import { computed } from "vue";
import { itemProperties } from "./items";
import { gameEvents } from "./events";
import PurchaseItem from "./components/PurchaseItem.vue";
import RecipeItem from "./components/RecipeItem.vue";
import {
  RiZzzLine,
  RiArrowRightSLine,
  RiCalendar2Line,
  RiTimeLine,
  RiCopperCoinLine,
  RiUserHeartLine,
  RiCheckLine,
} from "@remixicon/vue";

const { t, mergeLocaleMessage } = useI18n();

// 合并事件语言文本到主文本
gameEvents.forEach((event) => {
  mergeLocaleMessage("en_US", event.languageMap.en_US);
  mergeLocaleMessage("zh_CN", event.languageMap.zh_CN);
});

// 当前存档数据直接设为新存档的数据，这样就不用新建存档的时候再复制
const currentData = ref<IGameData>(defaultData);
const currentSettings = ref<ISettings>(defaultSettings);
const titleScreen = ref<HTMLDialogElement>();
const consolePanel = ref<HTMLDivElement>();
const consoleInput = ref<HTMLTextAreaElement>();
const gameScreen = ref<HTMLDialogElement>();
const currentSlot = ref<number>(0);

const ingredientList = computed(() => {
  return Object.keys(currentData.value.inventory ?? {})
    .sort()
    .filter((item) => {
      return itemProperties[item].tag.includes("ingredient");
    });
});

const productList = computed(() => {
  return Object.keys(currentData.value.inventory ?? {})
    .sort()
    .filter((item) => {
      return itemProperties[item].tag.includes("product");
    });
});

const recipeList = computed(() => {
  return Object.keys(currentData.value.recipes ?? {});
});

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
  t: (key: string) => {
    gameConsole.put(t(key));
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
    gameConsole.t("help.title");
    gameConsole.t("help.command.help");
    gameConsole.t("help.command.clear");
    gameConsole.t("help.command.settings");
    gameConsole.t("help.command.save");
    gameConsole.t("help.command.load");
    gameConsole.t("help.command.delete");
  } else if (data.trim() == "clear") {
    gameConsole.clear();
  } else if (data.trim() == "settings") {
    gameConsole.t("message.system.notImplemented");
  } else if (data.trim().startsWith("save")) {
    let slot = Number(data.split(" ")[1]);
    if (slot >= 0 && slot <= 4 && Number.isInteger(slot)) {
      saveGame(slot);
      gameConsole.put(t("message.system.saved") + `${slot}`);
    } else {
      gameConsole.t("message.system.invalidSlot");
    }
  } else if (data.trim().startsWith("load")) {
    let slot = Number(data.split(" ")[1]);
    if (slot >= 0 && slot <= 4 && Number.isInteger(slot)) {
      loadGame(slot);
      gameConsole.t("message.system.loaded");
    } else {
      gameConsole.t("message.system.invalidSlot");
    }
  } else if (data.trim().startsWith("delete")) {
    let slot = Number(data.split(" ")[1]);
    if (slot >= 0 && slot <= 4 && Number.isInteger(slot)) {
      GameData.setItem(`saves.${slot}`, {});
      gameConsole.put(t("message.system.deletedSave") + `${slot}`);
    } else {
      gameConsole.t("message.system.invalidSlot");
    }
  } else if (data.trim().startsWith("money")) {
    let nm = Number(data.split(" ")[1]);
    currentData.value.money = nm;
  } else {
    gameConsole.t("message.system.invalidCommand");
  }
  consoleInput.value!.value = "";
};

const startNewGame = () => {
  titleScreen.value!.close();
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
  autoLoad();

  listenToEvents();
  checkEventConditions();
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
      gameConsole.t("message.system.noSaveFound");
      currentSlot.value = autoLoad;
      GameData.setItem("autoLoad", null);
      return true;
    }
  }
};

// const createDialogItem = (name: string, text: string, icon: string) => {
//   let item = document.createElement("div");
//   item.classList.add('minicard')
//   let header = createElement("aq-ts")
//     .attribute("key", name)
//     .attribute("slot", "header");
//   let content = createElement("aq-ts").attribute("key", text);
//   item.appendChild(header);
//   item.appendChild(content);
//   if (icon) {
//     item.icon = icon;
//   }
//   return item;
// };

const listenToEvents = () => {
  gameEvents.forEach((event) => {
    event.addEventListener("start", () => {
      gameConsole.put(document.createElement("hr"));
    });
    // @ts-ignore
    event.addEventListener("step", (e: CustomEvent) => {
      let step = e.detail as IEventAction;
      switch (step.type) {
        case "dialog": {
          const s = step as IEventAction<"dialog">;
          gameConsole.t(s.data.text);
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
    // @ts-ignore
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
    console.debug(`Checking event condition: ${event.id}`);
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
    let flags = [] as boolean[];

    if (Object.keys(condition).length == 0) isEventStartable = true;

    if ("day" in condition) {
      console.debug(
        `Checking event condition: ${event.id}, day requied ${condition.day}, current day ${data?.day}`
      );
      if (data?.day >= condition.day!) {
        flags.push(true);
      } else flags.push(false);
    }
    if ("time" in condition) {
      if (data?.time == condition.time) {
        flags.push(true);
      } else flags.push(false);
    }
    if ("hasItem" in condition) {
      let items = condition.hasItem!;
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
      let targets = condition.eventCompleted!;
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

const dayLapse = (count = 1) => {
  currentData.value.day += count;
  sellByTime(3 - currentData.value.time);
  currentData.value.time = 0;
  checkEventConditions();
};

const timeLapse = (count = 1) => {
  let time = currentData.value.time;
  if (time == 2) {
    dayLapse();
  } else {
    currentData.value.time += count;
  }
  sellByTime();
  checkEventConditions();
};

const sellByTime = (time = 1) => {
  if (currentData.value.day == 0) return;
  for (let i = 0; i < time; i++) {
    let fame = currentData.value.fame;
    let itemList = Object.keys(currentData.value.inventory ?? {});
    let sellableItems = itemList.filter((item) =>
      itemProperties[item].tag.includes("product")
    );
    sellableItems.forEach((item) => {
      let stockedCount = currentData.value.inventory[item];
      let sellCount = Math.min(stockedCount, Math.ceil(fame * stockedCount));
      if (sellCount == 0) return;
      gameConsole.put(
        `${t("message.game.sold_")} ${t(`item.${item}`)} × ${sellCount}，${t(
          "message.game.earned_"
        )} ${sellCount * itemProperties[item].price}`
      );
      currentData.value.inventory[item] = stockedCount - sellCount;
      currentData.value.fame += sellCount * 0.003;
      currentData.value.money += sellCount * itemProperties[item].price;
    });
  }
};

const handleCraft = (order: IItemCount) => {
  const { item, count, recipe } = order;
  let craftCount = itemProperties[item].craftCount ?? 1;
  let inventory = currentData.value.inventory;
  let ingredientList = Object.keys(recipe!);
  let canCraft = ingredientList.every(
    (ingr) => inventory?.[ingr] >= recipe![ingr] * count
  );
  const originCount = currentData.value.inventory[item] || 0;
  if (canCraft) {
    currentData.value.inventory[item] = originCount + count * craftCount;
    ingredientList.forEach((ingr) => {
      const origin = currentData.value.inventory[ingr];
      currentData.value.inventory[ingr] = origin - recipe![ingr] * count;
    });
    checkEventConditions();
  } else {
    alert(t("message.game.notEnoughIngredient"));
  }
};

const handlePurchase = (order: IItemCount) => {
  let item = order.item;
  let price = itemProperties[item].price;
  let count = order.count * itemProperties[item].buyCount! || 1;
  let sum = price * count;
  let originCount = currentData.value.inventory[item] || 0;
  if (currentData.value.money >= sum) {
    currentData.value.money -= sum;
    currentData.value.inventory[item] = count + originCount;
    checkEventConditions();
  }
};

onMounted(() => {
  gameConsole.t("message.system.inited");

  let data = GameData.getData();
  currentSettings.value = data || defaultSettings;
  GameData.saveData(currentSettings.value);

  // autoLoad();
});
</script>
