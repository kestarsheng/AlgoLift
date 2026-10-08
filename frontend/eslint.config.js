// ESLint flat config：vue-eslint-parser + @typescript-eslint 基础规则。
// 注：@typescript-eslint 8.x 与 TypeScript 7.x 存在 API 兼容性问题，
// 配置已就绪，待 @typescript-eslint 发布 TS 7 支持后即可运行 lint。
import js from '@eslint/js';
import vue from 'eslint-plugin-vue';
import tsParser from '@typescript-eslint/parser';
import vueParser from 'vue-eslint-parser';

export default [
  { ignores: ['dist/**', 'node_modules/**', 'coverage/**', '*.js', 'vite.config.js', 'vite.config.ts'] },
  js.configs.recommended,
  ...vue.configs['flat/recommended'],
  {
    files: ['**/*.ts'],
    languageOptions: { parser: tsParser, parserOptions: { ecmaVersion: 2022, sourceType: 'module', project: false } },
  },
  {
    files: ['**/*.vue'],
    languageOptions: { parser: vueParser, parserOptions: { parser: tsParser, ecmaVersion: 2022, sourceType: 'module', project: false } },
  },
  {
    rules: {
      'no-unused-vars': 'off',
      'no-undef': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'off',
    },
  },
];
