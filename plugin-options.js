module.exports = {
  test: {
    timeout: 5000
  },
  test$mytag: {
    timeout: 10000
  },
  DocCryptoService: {
    types: {
      doca: {
        fields: ['enc1', 'enc2'],
        current: 2,
        default: 1,
        versions: {
          1: { key: 'N6ebP//Us2DclG5LbFlb1ymjtZiGIz5tjYV/dlgV6KI=' },
          2: { key: 'N6ebP//Us2DclG5LbFlb1ymjtZiGIz5tjYV/dlgV6KI=' }
        },
        children: {
          subb: 'docb',
          subarr: 'docb'
        }
      },
      docb: {
        fields: ['enc1'],
        current: 1,
        default: 1,
        versions: {
          1: { key: 'N6ebP//Us2DclG5LbFlb1ymjtZiGIz5tjYV/dlgV6KI=' }
        },
        children: {
          subc: 'docc'
        }
      },
      docc: {
        fields: ['enc1'],
        current: 2,
        default: 2,
        versions: {
          1: { key: 'N6ebP//Us2DclG5LbFlb1ymjtZiGIz5tjYV/dlgV6KI=' },
          2: { key: 'N6ebP//Us2DclG5LbFlb1ymjtZiGIz5tjYV/dlgV6KI=' }
        }
      }
    }
  },
  BcryptService: {
    bcryptRounds: 4
  }
};