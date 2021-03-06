import path from 'path'
import { createServer } from 'vite'
import Vue from '@vitejs/plugin-vue'
import Layouts from 'vite-plugin-vue-layouts'
import Pages from 'vite-plugin-pages'
import ViteComponents from 'vite-plugin-components'
import Store from 'vite-plugin-store'


import {_eval} from './eval'

import {buildConfig} from './build'
// 开发者的项目根路径
const projectRoot = process.cwd()
const fileName = 'normo.config.ts'
// 返回相对路径
const relativePath = path.relative(projectRoot, '/'+fileName).replace(/\\/g, '/')
// 返回绝对路径
const resolvePath = path.join(projectRoot, '/'+fileName).replace(/\\/g, '/')

// TODO: xxx

let configJsCode:string = 'module.exports = {}'
// 1、读取配置文件 默认 normo.config.ts


;(async () => {
  configJsCode = await buildConfig(resolvePath, false)
  let viteConfig =  await _eval(configJsCode)
  viteConfig = viteConfig.default ? viteConfig.default : viteConfig
  // TODO: 默认配置

  const server = await createServer({
    // any valid user config options, plus `mode` and `configFile`
    configFile: false,
    root: projectRoot,
    resolve: {
      alias: {
        '@/': `${path.resolve(projectRoot, '')}/`,
        ...viteConfig.alias
      }
    },
    publicDir: viteConfig.publicDir ? viteConfig.publicDir : 'static',
    // TODO: 布局、组件、页面、store、中间件、插件
    plugins: [
      // 支持vue
      Vue(),
      // 布局 https://github.com/JohnCampionJr/vite-plugin-vue-layouts
      Layouts({
        layoutsDir: viteConfig.layoutsDir ? viteConfig.layoutsDir : 'layouts'
      }),
      // https://github.com/hannoeru/vite-plugin-pages
      Pages({
        pagesDir: viteConfig.pagesDir ? viteConfig.pagesDir : 'pages',
        extensions: ['vue', 'js', 'md'],
        replaceSquareBrackets: false
      }),
      // https://github.com/antfu/vite-plugin-components
      ViteComponents({
        dirs: [viteConfig.componentsDir ? viteConfig.componentsDir : 'components'],
        deep: false
      }),
      // 状态：
      Store({
        storeDir:  viteConfig.storeDir ? viteConfig.storeDir : 'pages',
        extensions: ['ts', 'js']
      })
    ],
    server: {
      port: 1337
    }
  })
  await server.listen()
})()