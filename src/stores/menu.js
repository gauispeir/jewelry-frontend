// stores/menu.js
import { defineStore } from 'pinia';

export const useMenuStore = defineStore('menu', {
  state: () => ({
    isMenuOpen: false,
  }),
  actions: {
    setMenu(value) {
      this.isMenuOpen = value;
    },
  },
  getters: {
    getMenu: (state) => state.isMenuOpen,
  },
});