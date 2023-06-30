

<h1 align="center">Chatgpt Prompter</h1>



[![](https://prompterhub.oss-us-east-1.aliyuncs.com/Blank%208%20Grids%20Collage.png)](https://dev.prompterhub.com)

[![](https://prompterhub.oss-us-east-1.aliyuncs.com/Screenshot%202023-04-25%20at%203.30.23%20PM.png)](https://dev.prompterhub.com)

## ✨ Demo
<p >
  <a href="https://dev.prompterhub.com">
   Prompter Hub
  </a>
</p>

## ✨ Old Demo
<p >
  <a href="https://test.prompterhub.com">
   Prompter Hub
  </a>
</p>

## ✨ Introduction


### playgroud
The main purpose of the project is to better debug chatgpt's prompt. Based on the official chatgpt's playgorud, some functional improvements have been made. The official playground does not support logit_bias for the time being, nor does it support synchronous sending of multiple messages.
In order to support dynamic switching of prompts, drag-and-drop editing operations are supported, and some simple judgments can be made to change prompts.

### prompt
I divided the prompt of the chat3.5 modle into four levels.

- system This is the lowest level prompt in 3.5, basically useless.
- There are assistant and user in conversation, and the weight of uer is slightly higher.
- history This refers to the history in the chat, you can selectively record which chat records are used to enter the history queue, and you can also reset the history during the chat.
- modify This is the prompt with the highest weight, which can be written directly before and after the user input.

### Fine-tuning
Fine-tuning is a technique to further train a model based on a pre-trained model to adapt to a specific task or domain. In order to increase the interactivity of Fine-tuning and make it easier to train your own model.

### drag and drop editing

The dendrogram edited by the user will be calculated as two pieces of data, one is the json tree, which contains the relationship between each node. The other is the function map, which contains the function of each node.
When the user enters or ChatGPT returns content, the entire tree needs to be traversed to find a node that matches the current state. Once a matching node is found, the code will execute the code corresponding to the node, and continue to traverse the next node after execution is complete. If a node cannot match the current state, the traversal will be interrupted and return to the previous node, and continue to search for matching nodes until the root node is found or all nodes have been traversed.
When multiple branches can match the current state, the code merges the execution results of these branches into one result. If there is a conflict during the merge process, such as two branches returning different results, the last result will be used as the final result.

## ✨ Features

-  Basic functions of the playground.
-  Fine-tuning.
-  Synchronously generate multiple assistant messages.
-  Multiple messages can be tested.
-  Drag and drop edit switch prompt.
-  Support custom triggers using js and python.
-  Support logit_bias

## 📦 Install

```bash
yarn
```

```bash
yarn start
```

## 🔨 Usage

[![](https://prompterhub.oss-us-east-1.aliyuncs.com/Screen%20Recording%202023-04-25%20at%203.50.35%20PM.gif)](https://test.prompterhub.com)

### TypeScript

Although the code uses typescript, it basically uses any.

### unfinished part

- Fix some bugs
- Support for generating chrome plugins
- Support chatgpt3, support custom fine tough