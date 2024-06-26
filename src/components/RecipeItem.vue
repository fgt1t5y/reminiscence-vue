<template>
  <div class="list-item">
    <div class="item-name">
      <div>
        {{ $t(`item.${item}`) }} ×
        {{ itemProperties[item].craftCount }}
      </div>
    </div>
    <div class="make-count">
      <div>{{ $t("ui.purchaseCount") }}</div>
      <div>
        <button @click="craft(1)">1</button>
        <button @click="craft(10)">10</button>
        <button @click="craft(100)">100</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { itemProperties } from "../items";
import type { IItemCount } from "../type";

defineOptions({
  name: "RecipeItem",
});

const props = defineProps<{ item: string }>();
const emits = defineEmits<{
  (e: "craft", data: IItemCount): void;
}>();

const craft = (count: number) => {
  emits("craft", {
    item: props.item,
    recipe: itemProperties[props.item].recipe,
    count,
  });
};
</script>
