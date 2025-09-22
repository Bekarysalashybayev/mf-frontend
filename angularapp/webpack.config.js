const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({
  // Имя контейнера теперь creditApp, чтобы хост мог импортировать 'creditApp/router'
  name: 'creditApp',
  exposes: {
    './mount': './src/app/mfe/mount.ts',
    // Новый экспорт только со списком роутов (метаданные для хоста)
    './router': './src/router.ts'
  },
  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  },
});
