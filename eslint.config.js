// @ts-check
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import ts from 'typescript-eslint';

const JS_EXT = ['js', 'jsx', 'mjs', 'cjs'];

/** @type {(import('eslint').Linter.Config | undefined)[]} */
export default [
    // eslint
    js.configs.recommended,
    {
        rules: {
            'no-undef': 0,
            eqeqeq: [1, 'smart'],
            'no-console': 1,
        },
    },

    // typescript
    .../** @type {(import('eslint').Linter.Config)[]} */ (ts.configs.recommendedTypeChecked),
    .../** @type {(import('eslint').Linter.Config)[]} */ (ts.configs.stylisticTypeChecked),
    {
        languageOptions: {
            parserOptions: {
                ecmaVersion: 'latest',
                projectService: true,
                tsconfigRootDir: process.cwd(),
            },
        },
    },
    {
        rules: {
            '@typescript-eslint/array-type': [1, { default: 'array-simple' }],
            // https://github.com/typescript-eslint/typescript-eslint/issues/3602
            '@typescript-eslint/class-literal-property-style': 0,
            '@typescript-eslint/consistent-type-definitions': 0,
            '@typescript-eslint/consistent-type-exports': [
                1,
                {
                    fixMixedExportsWithInlineTypeSpecifier: true,
                },
            ],
            '@typescript-eslint/consistent-type-imports': [
                1,
                {
                    prefer: 'type-imports',
                    fixStyle: 'inline-type-imports',
                    disallowTypeAnnotations: false,
                },
            ],
            '@typescript-eslint/explicit-function-return-type': [
                2,
                {
                    allowConciseArrowFunctionExpressionsStartingWithVoid: true,
                    allowExpressions: true,
                    allowIIFEs: true,
                },
            ],
            '@typescript-eslint/explicit-member-accessibility': [1, { accessibility: 'no-public' }],
            '@typescript-eslint/explicit-module-boundary-types': 1,
            '@typescript-eslint/no-extraneous-class': [1, { allowWithDecorator: true }],
            '@typescript-eslint/no-import-type-side-effects': 2,
            '@typescript-eslint/no-invalid-void-type': [1, { allowAsThisParameter: true }],
            '@typescript-eslint/no-meaningless-void-operator': 1,
            '@typescript-eslint/no-mixed-enums': 2,
            '@typescript-eslint/no-namespace': 0,
            '@typescript-eslint/no-non-null-asserted-nullish-coalescing': 2,
            '@typescript-eslint/no-require-imports': 0,
            '@typescript-eslint/no-this-alias': [2, { allowedNames: ['self'] }],
            '@typescript-eslint/no-unnecessary-template-expression': 1,
            // Hard to work with type-imported enums, which is preferred in our codebase.
            '@typescript-eslint/no-unsafe-enum-comparison': 0,
            '@typescript-eslint/no-unused-vars': [1, { args: 'none', varsIgnorePattern: '^_', caughtErrors: 'none' }],
            'no-useless-constructor': 0,
            '@typescript-eslint/no-useless-constructor': 1,
            '@typescript-eslint/parameter-properties': [
                1,
                {
                    allow: ['protected readonly', 'public readonly', 'private readonly', 'readonly', 'private'],
                    prefer: 'parameter-property',
                },
            ],
            'prefer-destructuring': 0,
            '@typescript-eslint/prefer-destructuring': [
                1,
                {
                    VariableDeclarator: {
                        array: false,
                        object: true,
                    },
                    AssignmentExpression: {
                        array: false,
                        object: false,
                    },
                },
            ],
            '@typescript-eslint/prefer-nullish-coalescing': [
                1,
                {
                    ignoreConditionalTests: true,
                    ignoreMixedLogicalExpressions: true,
                    ignorePrimitives: { string: true },
                },
            ],
            '@typescript-eslint/prefer-readonly': 1,
            '@typescript-eslint/prefer-readonly-parameter-types': 0,
            '@typescript-eslint/prefer-reduce-type-parameter': 1,
            '@typescript-eslint/prefer-return-this-type': 1,
            '@typescript-eslint/prefer-ts-expect-error': 2,
            '@typescript-eslint/promise-function-async': 1,
            '@typescript-eslint/require-array-sort-compare': 2,
            '@typescript-eslint/switch-exhaustiveness-check': 1,
            '@typescript-eslint/unified-signatures': [1, { ignoreDifferentlyNamedParameters: true }],
        },
    },
    {
        files: JS_EXT.map((ext) => `**/*.${ext}`),
        rules: {
            // Disable as these rules are not supported in JavaScript, use jsdoc rules instead
            // https://typescript-eslint.io/rules/explicit-module-boundary-types#configuring-in-a-mixed-jsts-codebase
            '@typescript-eslint/explicit-function-return-type': 0,
            '@typescript-eslint/explicit-member-accessibility': 0,
            '@typescript-eslint/explicit-module-boundary-types': 0,

            // Due to the lack support for jsdoc type assertion, disable these rules in JavaScript
            // https://github.com/typescript-eslint/typescript-eslint/issues/1682
            '@typescript-eslint/no-unsafe-call': 0,
            '@typescript-eslint/no-unsafe-return': 0,
            '@typescript-eslint/no-unsafe-assignment': 0,
            '@typescript-eslint/no-unsafe-argument': 0,
            '@typescript-eslint/no-unsafe-member-access': 0,
        },
    },
    {
        name: 'Disable rules that conflict with Prettier',
        ...prettier,
    },
    {
        ignores: ['node_modules/', 'dist/', 'coverage/', 'test/', 'tools/', 'scripts/', '*.config.{js,ts}'],
    },
];
