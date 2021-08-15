module.exports = {
  devServer: {
    port: 8080,  // 端口号的配置
    open: true   // 自动打开浏览器
  }
}

module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        'views': '@/views',
        'components': '@/components',
        'network': '@/network',
        'common': '@/common',
        'assets': '@/assets',
        'utils': '@/utils'
      }
    }
  }
}