import type { IItemGroup } from "./type";

export const itemProperties: IItemGroup = {
  flour: {
    tag: ["ingredient"],
    price: 4,
    buyCount: 1,
  },
  sugar: {
    tag: ["ingredient"],
    price: 8,
    buyCount: 3,
  },
  butter: {
    tag: ["ingredient"],
    price: 10,
    buyCount: 3,
  },
  egg: {
    tag: ["ingredient"],
    price: 4,
    buyCount: 1,
  },
  salt: {
    tag: ["ingredient"],
    price: 6,
    buyCount: 2,
  },
  soda: {
    tag: ["ingredient"],
    price: 4,
    buyCount: 2,
  },
  cacao: {
    tag: ["ingredient"],
    price: 12,
    buyCount: 2,
  },
  cinnamon: {
    tag: ["ingredient", "spice"],
    price: 8,
    buyCount: 2,
  },
  vanilla: {
    tag: ["ingredient", "spice"],
    price: 18,
    buyCount: 1,
  },
  milk: {
    tag: ["ingredient"],
    price: 5,
    buyCount: 1,
  },
  cream: {
    tag: ["ingredient"],
    price: 7,
    buyCount: 1,
  },
  sesame: {
    tag: ["ingredient"],
    price: 1.2,
    buyCount: 10,
  },
  peanut: {
    tag: ["ingredient", "nut"],
    price: 2,
    buyCount: 8,
  },
  almond: {
    tag: ["ingredient", "nut"],
    price: 3,
    buyCount: 8,
  },

  whiteBread: {
    tag: ["bread", "product"],
    price: 8,
    recipe: {
      flour: 1,
    },
    craftCount: 1,
  },
  bagel: {
    tag: ["bread", "product"],
    price: 8,
    recipe: {
      flour: 1,
      sugar: 1,
    },
    craftCount: 2,
  },
  pretzel: {
    tag: ["bread", "product"],
    price: 8,
    recipe: {
      flour: 1,
      soda: 1,
      salt: 1,
    },
    craftCount: 2,
  },
  toast: {
    tag: ["bread", "product"],
    price: 10,
    recipe: {
      flour: 5,
      sugar: 1,
      egg: 1,
      milk: 3,
    },
    craftCount: 9,
  },
  cupcake: {
    tag: ["cake", "product"],
    price: 12,
    craftCount: 10,
    recipe: {
      flour: 3,
      sugar: 2,
      milk: 2,
      butter: 1,
      egg: 3,
    },
  },
};
