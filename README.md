# vue-directive-draggable

通过 vue 指令的方式实现元素 drag 的功能，支持**移动端**和 PC 端。

- 安卓和桌面版使用 drag 和 drop 接口，ios 使用 touch 事件实现
  ![](https://github.com/TreeZhou/vue-directive-draggable/blob/master/preview.gif)

## Install

```sh
$ npm install vue-directive-draggable
```

## Features

- 拖拽源对象添加`dragging`属性
- 拖拽目标对象添加`drag-enter`属性

## Directive’s options.

`v-dragging = "options"`

### Options

- Type: object

| 参数 | 类型   | 必填 | 说明             |
| ---- | ------ | ---- | ---------------- |
| list | array  | true | 所有 item 的集合 |
| name | string | true | 节点名           |
| item | object | true | 节点数据         |

### Item

| 参数          | 类型   | 必填  | 说明                   |
| ------------- | ------ | ----- | ---------------------- |
| key           | string | true  | 唯一标识               |
| followElmData | object | false | 跟随鼠标元素的对象数据 |

### FollowElmData

| 参数   | 类型            | 必填  | 说明             |
| ------ | --------------- | ----- | ---------------- |
| src    | Image \| string | false | 拖拽对象支持图片 |
| width  | string          | false | 拖拽对象宽       |
| height | string          | false | 拖拽对象高       |

example: Options.item

```js
  {
    key: '1',
    followElmData:{
      src:'',
      width:'',
      height:''
    },
  },
```

## Events

监听方法：`vm.$dragging.$on(<eventName>)`

| 事件名    | 回调参数                                                          | 说明           |
| --------- | ----------------------------------------------------------------- | -------------- |
| dragStart | dragEventData：object;                                            | 开始拖拽时触发 |
| dragged   | {form：dragEventData,to：dragEventData}；源对象数据，目标对象数据 | 拖动过程中触发 |
| dragged   | {form：dragEventData,to：dragEventData}                           | 拖动结束时触发 |

### dragEventData

| 参数  | 类型    | 说明                             |
| ----- | ------- | -------------------------------- |
| DDD   | object  | 整个操作组的数据，包含 list,item |
| index | -       |                                  |
| item  | object  |                                  |
| el    | Element | 元素的 DOM 节点                  |

## Usage

```HTML
<!-- demo.vue -->
 <template>
     <div class="list">
       <div
         class="item"
         v-for="item in list"
         v-dragging="{ item: item, list: list, name: 'listName' }"
         :key="item.key"
         :class="{'drag-enter': item['drag-enter']}"
         :style="{'background-color':item.backgroundColor}"
       >
         <div v-show="item['drag-enter']" class="placeholder">
           拖拽目标对象添加`drag-enter`属性
         </div>
         <div v-show="item.dragging" class="placeholder">
           拖拽源对象添加`dragging`属性
         </div>
       </div>
     </div>
 </template>
 <script>
  import Vue from 'vue';
  import vueDragging from 'vue-directive-draggable';
  Vue.use(vueDragging);

   export default {
     data() {
       return {
           list: [
             {
               key: '1',
               backgroundColor:"red"
             },
             {
               key: '2',
               backgroundColor:"yellow"
             },
           ]
       }
     },
     mounted() {
       this.$dragging.$on('dragStart', originDada => {
         console.log(originDada);
       });
       this.$dragging.$on('dragged', draggedDate => {
           console.log(draggedDate);
       });
       this.$dragging.$on('dragend', dragendData => {
         console.log(dragendData);

         //交换源对象与目标对象的背景颜色
         let toColor = dragendData.to.item.backgroundColor;
         let fromColor = dragendData.from.item.backgroundColor;
         dragendData.to.item.backgroundColor = fromColor;
         dragendData.from.item.backgroundColor = toColor;
       });
     }
 }
 </script>
 <style>
   .item {
    width: 100px;
    height: 100px;
    transition: transform 1s;
    border: 1px black solid;
    box-sizing: border-box;
    margin: 0 auto;

   }
   .drag-enter {
     transform: scale(1.2);
   }
   .placeholder {
     background-color: white;
     width: 100%;
     height: 100%;
   }
 </style>
```
