module.exports = {
  meta: {
    type: 'problem',
    docs: { description: 'Disallow Redux in favor of Zustand' },
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        if (node.source.value.startsWith('redux')) {
          context.report({
            node,
            message: 'Redux is not allowed. Use Zustand instead.',
          });
        }
      },
    };
  },
};
