- 目标为元素，偏移为 0
  
  - 删除数据时，默认行为回退到上一行
  
  - 文档块中只有一个元素时，删除目标都为当前元素，获取的源码偏移需要额外处理

- 在文档块下（不包括容器块内的），目标为分割符 `<hr />` 时，无法获取到 markdown node

- 在以下 markdown 渲染中，在 `西` 字前按推格键获取的源码位置异常

  ```md
  > 噶佳佳
  > 哈哈
  >
  > ***
  >
  > 西路路
  ```

- 在以下 markdown 渲染中，在 `baz*→` 前按退格键获取的源码位置异常

  ```md
    Foo *bar
  baz*→
  ====
  ```

- 当换行符渲染为 `<br />` 时，无法获取到换行符的源码位置，因为实现没有记录换行符源码位置

- 缩进代码块无法获取源码位置，因为内部的文本内容不被解析为 Text 节点

- 手动处理源码位置时，要小心 tab 是一个字符，但 markdown 某些时候可能视 tab 为 4 个空格