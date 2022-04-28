const replace = require('@rollup/plugin-replace');

module.exports = {
  rollup(config, opts) {
    config.output.esModule = true
    config.plugins = config.plugins.map(p =>
      p.name === 'replace'
        ? replace({
            'process.env.NODE_ENV': JSON.stringify(opts.env),
            preventAssignment: true,
          })
        : p
    );
    return config;
  },
};