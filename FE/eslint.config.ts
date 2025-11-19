import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
    {
        name: 'app/files-to-lint',
        files: ['**/*.{ts,mts,tsx,vue}'],
    },

    globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

    pluginVue.configs['flat/essential'],
    vueTsConfigs.recommended,
    skipFormatting,
    {
        name: 'app/routes-override',
        files: ['src/routes/**/*.vue'],
        rules: {
            'vue/multi-word-component-names': 'off',
        },
    },
    {
        name: 'app/components-override',
        files: ['src/components/**/*.vue'],
        rules: {
            'vue/multi-word-component-names': 'off',
        },
    },
    {
        name: 'app/stores-override',
    },
    {
        name: 'app/any-off-specific-files',
        files: ['src/stores/auth.ts', 'src/middleware/index.ts'],
        rules: {
            indent: ['error', 4, { SwitchCase: 1 }],
        },
    },
    {
        name: 'app/vue-indentation',
        files: ['**/*.vue'],
        rules: {
            indent: 'off',
            'vue/script-indent': ['error', 4, { baseIndent: 0, switchCase: 1 }],
            'vue/html-indent': 'off',
        },
    },
)
