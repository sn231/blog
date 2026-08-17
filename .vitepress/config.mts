import { defineConfigWithTheme } from 'vitepress'
// @ts-ignore
import mdItCustomAttrs from 'markdown-it-custom-attrs'

export interface ThemeConfig {
  menuList: { name: string; url: string }[]
  videoBanner: boolean
  name: string
  welcomeText: string
  motto: string[]
  social: { icon: string; url: string }[]
  spineVoiceLang: 'zh' | 'jp'
  footerName: string
  poweredList: { name: string; url: string }[]
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
    ['meta', { property: 'og:site_name', content: 'Snow Love' }],
    ['meta', { property: 'og:type', content: 'website' }],
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
  description: 'Snow Love 的个人博客：阅读、技术、游戏与日常记录。',
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

    // 保留主题配置字段以兼容上游，但角色播放器已从 Snow Love 布局移除。
    spineVoiceLang: 'jp',

    footerName: 'Snow Love',
    poweredList: [
      { name: 'VitePress', url: 'https://github.com/vuejs/vitepress' },
      { name: 'BlueArchive Theme', url: 'https://github.com/Alittfre/vitepress-theme-bluearchive' },
      { name: 'Vercel', url: 'https://vercel.com' },
      { name: 'GitHub', url: 'https://github.com/sn231/blog' },
    ],

    // 评论暂不启用；不在前端保存 OAuth secret。
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
