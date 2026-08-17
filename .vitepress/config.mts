import { defineConfigWithTheme } from 'vitepress'
// @ts-ignore
import mdItCustomAttrs from 'markdown-it-custom-attrs'

export interface ThemeConfig {
  // navBar
  menuList: { name: string; url: string }[]

  // banner
  videoBanner: boolean
  name: string
  welcomeText: string
  motto: string[]
  social: { icon: string; url: string }[]

  // spine
  spineVoiceLang: 'zh' | 'jp'

  // footer
  footerName: string
  poweredList: { name: string; url: string }[]

  // gitalk
  clientID: string
  clientSecret: string
  repo: string
  owner: string
  admin: string[]
}

export default defineConfigWithTheme<ThemeConfig>({
  lang: 'zh-CN',
  head: [
    ['link', { rel: 'shortcut icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#8cc8ff' }],
    ['meta', { name: 'author', content: 'sn231' }],
    // gitalk（仅在配置 clientID 后启用）
    ['link', { rel: 'stylesheet', href: 'https://unpkg.com/gitalk/dist/gitalk.css' }],
    ['script', { src: 'https://unpkg.com/gitalk/dist/gitalk.min.js' }],
    // bluearchive font
    [
      'link',
      {
        rel: 'stylesheet',
        href: '/font/Blueaka/Blueaka.css',
      },
    ],
    [
      'link',
      {
        rel: 'stylesheet',
        href: '/font/Blueaka_Bold/Blueaka_Bold.css',
      },
    ],
    // 图片灯箱
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://cdn.jsdelivr.net/npm/@fancyapps/ui/dist/fancybox.css',
      },
    ],
    [
      'script',
      {
        src: 'https://cdn.jsdelivr.net/npm/@fancyapps/ui@4.0/dist/fancybox.umd.js',
      },
    ],
  ],
  ignoreDeadLinks: true,
  sitemap: {
    hostname: 'https://snowlove.is-a.dev',
  },
  title: 'Snow Love',
  description: 'Snow Love 的个人博客，记录阅读、技术、游戏与日常。',
  themeConfig: {
    menuList: [
      { name: '首页', url: '' },
      { name: '标签', url: 'tags/' },
    ],

    videoBanner: false,
    name: 'Snow Love',
    welcomeText: 'Snow Love',
    motto: [
      '把喜欢的故事、折腾过的东西和偶尔闪过的想法，都留在这里。',
      '愿每一次记录，都像雪落一样安静，却留下痕迹。',
      '读书、游戏、技术与日常，慢慢写，长期更新。',
    ],
    social: [{ icon: 'github', url: 'https://github.com/sn231' }],

    spineVoiceLang: 'jp',

    footerName: 'Snow Love',
    poweredList: [
      { name: 'VitePress', url: 'https://github.com/vuejs/vitepress' },
      { name: 'BlueArchive Theme', url: 'https://github.com/Alittfre/vitepress-theme-bluearchive' },
      { name: 'GitHub', url: 'https://github.com/sn231/blog' },
    ],

    // 暂不启用评论。原模板包含示例 OAuth 配置，不应继续用于公开站点。
    clientID: '',
    clientSecret: '',
    repo: 'blog',
    owner: 'sn231',
    admin: ['sn231'],
  },
  markdown: {
    theme: 'solarized-dark',
    lineNumbers: true,
    math: true,
    config: (md) => {
      md.use(mdItCustomAttrs, 'image', {
        'data-fancybox': 'gallery',
      })
    },
  },
})
