const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({
  // Имя контейнера должно совпадать с ключом remotes в host (angularApp)
  name: 'angularApp',
  exposes: {
    './CreditPage': './src/app/pages/credit/credit.ts',
    './CreditMount': './src/app/mfe/credit-mount.ts'
  },
  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  },
});
