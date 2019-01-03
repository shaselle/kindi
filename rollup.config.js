export default [
    {
        input: 'html.js',
        output: {
            file: 'kindi.js',
            format: 'esm'
        }
    },
    {
        input: 'test/app.js',
        output: {
            file: './test/test-app.js',
            format: 'iife'
        }
    }
];