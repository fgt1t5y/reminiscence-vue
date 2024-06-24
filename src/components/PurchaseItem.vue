<template>
  <div class="list-item">
    <div class="item-name">
      <div>
        {{ $t(`item.${item}`) }} ×
        {{ itemProperties[item].buyCount }}
      </div>
    </div>
    <div class="purchase-count">
      <div>{{ $t("ui.purchaseCount") }}</div>
      <div>
        <button @click="purchase(1)">1</button>
        <button @click="purchase(10)">10</button>
        <button @click="purchase(100)">100</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { itemProperties } from "../items";
import type { IItemCount } from "../items";

defineOptions({
  name: "PurchaseItem",
});

const props = defineProps<{ item: string }>();
const emits = defineEmits<{
  (e: "purchase", data: IItemCount): void;
}>();

const purchase = (count: number) => {
  emits("purchase", { item: props.item, count });
};
</script>
