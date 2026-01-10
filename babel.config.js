module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            [
                'module-resolver',
                {
                    root: ['./'],
                    extensions: ['.ts', '.tsx', '.js', '.json'],
                    alias: {
                        '@components': './components',
                        '@styles': './styles',
                        '@screens': './screens',
                        '@hooks': './hooks',
                        '@utils': './utils',
                        '@types': './types',
                        '@assets': './assets',
                    },
                },
            ],
        ],
    };
};
