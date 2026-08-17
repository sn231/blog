<template>
  <footer class="container">
    <div class="footer-info">
      <span>© {{ new Date().getFullYear() }} {{ footerName }}</span>
      <br />
      <span>
        Powered by
        <span class="powered-list" v-for="(obj, ind) in poweredList" :key="obj.url">
          <a :href="obj.url">{{ obj.name }}</a>{{ ind < poweredList.length - 1 ? ' & ' : '' }}
        </span>
      </span>
    </div>
    <div class="footer-brand" aria-label="Snow Love">
      <span class="snow">Snow</span><span class="love">Love</span>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useData } from 'vitepress'

const themeConfig = useData().theme.value
const footerName = themeConfig.footerName
const poweredList = themeConfig.poweredList
</script>

<style scoped lang="less">
footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72px;
  z-index: 100;
  margin-top: 50px;
  padding: 0 20px;
  box-sizing: border-box;
  border-radius: 32px 32px 0 0;
  border-top: solid 2px var(--foreground-color);
  border-left: solid 2px var(--foreground-color);
  border-right: solid 2px var(--foreground-color);
  background: linear-gradient(0.75turn, transparent, var(--foreground-color) 25%),
    var(--triangle-background);
  backdrop-filter: var(--blur-val);
  box-shadow: 0 0 8px rgb(var(--blue-shadow-color), 0.8);
}

.footer-info {
  a {
    color: var(--color-blue);
  }
}

.footer-brand {
  display: flex;
  align-items: baseline;
  gap: 5px;
  font-weight: 800;
  font-size: 22px;
  letter-spacing: -0.03em;
  filter: drop-shadow(0 0 8px rgb(var(--blue-shadow-color), 0.55));

  .snow {
    color: var(--color-blue);
  }

  .love {
    color: var(--font-color-grey);
  }
}

@media (max-width: 768px) {
  footer {
    padding: 0 14px;
  }

  .footer-info {
    font-size: 11px;
    max-width: 76%;
  }

  .footer-brand {
    font-size: 16px;
    gap: 3px;
  }
}
</style>
