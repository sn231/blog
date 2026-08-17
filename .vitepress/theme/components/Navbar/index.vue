<template>
  <header :class="{ postViewer: state.currPost.href }" class="container">
    <nav>
      <a class="brand" :href="base" @click="handleNavClick('')" aria-label="Snow Love 首页">
        <span class="brand-mark">SL</span>
        <span class="brand-name">Snow Love</span>
      </a>
      <span class="menu">
        <ul>
          <li v-for="item in menuList" :key="item.url">
            <a :href="base + item.url" @click="handleNavClick(item.url)">{{ item.name }}</a>
          </li>
        </ul>
      </span>
      <div
        class="hamburger"
        :class="{ active: state.showDropdownMenu }"
        @click="toggleDropdownMenu"
      >
        <span class="line"></span>
        <span class="line"></span>
        <span class="line"></span>
      </div>
      <DropdownMenu :showMenu="state.showDropdownMenu"></DropdownMenu>
    </nav>
  </header>
  <SearchDialog v-if="state.searchDialog" @close-dialog="closeDialog"></SearchDialog>
</template>

<script setup lang="ts">
import { useData } from 'vitepress'
import { useStore } from '../../store'
import SearchDialog from './Search-Dialog.vue'
import DropdownMenu from './Dropdown-Menu.vue'

const base = useData().site.value.base
const themeConfig = useData().theme.value
const menuList = themeConfig.menuList
const { state } = useStore()

const closeDialog = () => {
  state.searchDialog = false
}

const toggleDropdownMenu = () => {
  state.showDropdownMenu = !state.showDropdownMenu
}

const resetPage = () => {
  state.currPage = 1
}

const handleNavClick = (url: string) => {
  if (url === '') resetPage()
  if (url === 'tags/') {
    resetPage()
    state.currTag = ''
  }
}
</script>

<style scoped lang="less">
.postViewer {
  height: 50vh;
}

header {
  height: 75vh;
  position: relative;

  nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    height: 72px;
    z-index: 100;
    box-sizing: border-box;
    padding: 0 20px;
    border-radius: 0 0 32px 32px;
    border-bottom: solid 2px var(--foreground-color);
    border-left: solid 2px var(--foreground-color);
    border-right: solid 2px var(--foreground-color);
    background: linear-gradient(0.25turn, transparent, var(--foreground-color) 25%),
      var(--triangle-background);
    backdrop-filter: var(--blur-val);
    box-shadow: 0 0 8px rgb(var(--blue-shadow-color), 0.8);
  }

  .brand {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    color: var(--font-color-grey);
    user-select: none;
  }

  .brand-mark {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 800;
    letter-spacing: -0.04em;
    color: var(--foreground-color);
    background: var(--color-blue);
    box-shadow: 0 0 12px rgb(var(--blue-shadow-color), 0.65);
  }

  .brand-name {
    font-size: 19px;
    font-weight: 700;
    letter-spacing: 0.02em;
  }

  .menu {
    ul {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      margin: 0;

      li {
        margin: 0 64px;

        a {
          display: block;
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 20px;
          font-weight: 600;
          color: var(--font-color-grey);
          transition: transform 0.8s cubic-bezier(0.25, 1, 0.5, 1), color 0.5s,
            background-color 0.5s;

          &:hover {
            color: var(--font-color-gold);
            background-color: var(--btn-background);
            transform: translateY(-2px);
          }
        }
      }
    }
  }

  .hamburger {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 32px;
    cursor: pointer;
  }

  .hamburger .line {
    display: block;
    width: 80%;
    height: 4px;
    border-radius: 4px;
    background-color: var(--font-color-grey);
    margin-bottom: 4px;
    transition: all 0.3s ease-in-out;
  }

  .hamburger.active .line:nth-child(1) {
    transform: translateY(8px) rotate(45deg);
  }

  .hamburger.active .line:nth-child(2) {
    opacity: 0;
  }

  .hamburger.active .line:nth-child(3) {
    transform: translateY(-8px) rotate(-45deg);
  }
}

@media (max-width: 768px) {
  header {
    nav {
      height: 64px;
      padding: 0 14px;
    }

    .brand-mark {
      width: 32px;
      height: 32px;
      border-radius: 10px;
    }

    .brand-name {
      display: none;
    }

    .menu ul li {
      margin: 0 8px;

      a {
        font-size: 16px;
        padding: 8px 10px;
      }
    }
  }
}
</style>
