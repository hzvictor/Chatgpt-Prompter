export function sortMessage(messages: Array<any>) {
  let system: any = [];
  let conversation: any = [];
  const messagesKeys = Object.keys(messages);
  messagesKeys.forEach((item: any) => {
    if (messages[item].active) {
      if (messages[item].role == 'system') {
        system.push(messages[item]);
      } else {
        conversation.push(messages[item]);
      }
    }
  });
  system = system.sort((a: any, b: any) => {
    if (!a.path || !b.path) {
      return 0;
    } else {
      if (a.path[0] < b.path[0]) {
        return -1; // a 小于 b，a 应该排在 b 前面
      } else if (a.path[0] > b.path[0]) {
        return 1; // a 大于 b，a 应该排在 b 后面
      }
    }
  });

  conversation = conversation.sort((a: any, b: any) => {
    if (!a.path || !b.path) {
      return 0;
    } else {
      if (a.path[0] < b.path[0]) {
        return -1; // a 小于 b，a 应该排在 b 前面
      } else if (a.path[0] > b.path[0]) {
        return 1; // a 大于 b，a 应该排在 b 后面
      }
    }
  });

  return system.concat(conversation);
}
