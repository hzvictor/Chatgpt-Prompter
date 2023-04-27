import { Element } from 'slate';
import { nanoid } from 'nanoid';

export const makeNodeId = () => nanoid(32);

export const assignIdRecursively = (node: any) => {
  if (Element.isElement(node)) {
    if (!node.id) {
      node.id = makeNodeId();
    }
    node.children.forEach(assignIdRecursively);
  }
};

export const withNodeId = (editor: any) => {
  const { apply } = editor;

  editor.apply = (operation: any) => {
    if (operation.type === 'insert_node') {
      assignIdRecursively(operation.node);
      return apply(operation);
    }

    if (operation.type === 'split_node') {
      operation.properties.id = makeNodeId();
      return apply(operation);
    }

    return apply(operation);
  };

  return editor;
};

// export const assignChriendIdRecursively = (node: any) => {
//   if (Element.isElement(node)) {
//     if (!node.id) {
//       node.id = makeNodeId();
//     }
//   }
// };

export const assignIdAndRoleRecursively = (node: any, role: string) => {
  try {
    if (Element.isElement(node)) {
      if (!node.id) {
        node.id = makeNodeId();
        node.role = role;
      }
      node.children.forEach((item) => {
        assignIdAndRoleRecursively(item, role);
      });
    }
  } catch (error) {}
};

export const withNodeIdAndRole = (editor: any, role: string) => {
  const { apply } = editor;
  if (role != 'conversation') {
    editor.apply = (operation: any) => {
      if (operation.type === 'insert_node') {
        assignIdAndRoleRecursively(operation.node, role);
        return apply(operation);
      }

      if (operation.type === 'split_node') {
        operation.properties.id = makeNodeId();
        operation.properties.role = role;
        return apply(operation);
      }

      return apply(operation);
    };
  } else {
    editor.apply = (operation: any) => {
      let role = 'user';
      if (editor.children.length % 2 == 0 || editor.children.length == 0) {
        role = 'assistant';
      }
      if (operation.type === 'insert_node') {
        assignIdAndRoleRecursively(operation.node, role);
        return apply(operation);
      }

      if (operation.type === 'split_node') {
        operation.properties.id = makeNodeId();
        operation.properties.role = role;
        return apply(operation);
      }

      return apply(operation);
    };
  }

  return editor;
};
