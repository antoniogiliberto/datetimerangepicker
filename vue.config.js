const VuetifyLoaderPlugin = require('vuetify-loader/lib/plugin')

module.exports = {
  lintOnSave: false,
  configureWebpack: {
    output: {
      libraryExport: 'default'
    },
    plugins: [new VuetifyLoaderPlugin()]
  }
};
