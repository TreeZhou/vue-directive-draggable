/*!
 * vue-dragging v1.0.0
 * (c) 2019 527533739@qq.com
 * Released under the MIT License.
 */

class DragData {
  constructor() {
    this.data = {};
  }
  new(key) {
    if (!this.data[key]) {
      this.data[key] = {
        List: [],
        KEY_MAP: {}
      };
    }
    return this.data[key];
  }
  get(key) {
    return this.data[key];
  }
}

const $dragging = {
  listeners: {},
  $on(event, func) {
    const events = this.listeners[event];
    if (!events) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(func);
  },
  $once(event, func) {
    const vm = this;
    function on(...args) {
      vm.$off(event, on);
      func.apply(vm, args);
    }
    this.$on(event, on);
  },
  $off(event, func) {
    const events = this.listeners[event];
    if (!func || !events) {
      this.listeners[event] = [];
      return;
    }
    this.listeners[event] = this.listeners[event].filter(i => i !== func);
  },
  $emit(event, context) {
    const events = this.listeners[event];
    if (events && events.length > 0) {
      events.forEach(func => {
        func(context);
      });
    }
  }
};
const _ = {
  on(el, type, fn) {
    el.addEventListener(type, fn);
  },
  off(el, type, fn) {
    el.removeEventListener(type, fn);
  },
  addClass(el, cls) {
    if (arguments.length < 2) {
      el.classList.add(cls);
    } else {
      for (let i = 1, len = arguments.length; i < len; i++) {
        el.classList.add(arguments[i]);
      }
    }
  },
  removeClass(el, cls) {
    if (arguments.length < 2) {
      el.classList.remove(cls);
    } else {
      for (let i = 1, len = arguments.length; i < len; i++) {
        el.classList.remove(arguments[i]);
      }
    }
  }
};

module.exports = function(Vue) {
  const dragData = new DragData();

  let originData = {}; //初始位置数据
  let targetData = {}; //目标位置数据
  let dragImageObj = {}; // drag事件跟随手指移动的元素集合

  // touchmove事件跟随手指移动的元素
  let touchmoveFollowElm = {
    isSert: false,
    cacheElms: {},
    currentElm: null
  };

  function handleDragStart(e) {
    const el = getDraggableEl(e.target);
    let { DDD, item } = getDraggableDataByEl(el);
    const index = DDD.List.indexOf(item);

    Vue.set(item, 'dragging', true);

    originData = {
      DDD,
      index,
      item,
      el
    };
    $dragging.$emit('dragStart', originData);
    initFollowElm(e, item, el);
  }

  // 设置跟随图片
  function initFollowElm(e, item, el) {
    if (item.followElmData) {
      let followElm = getFollowElm(item.followElmData);

      //设置touchmove事件跟随图片
      touchmoveFollowElm.currentElm = followElm.forTouchmove;

      //设置drag事件跟随图片
      if (e.dataTransfer) {
        e.dataTransfer.setDragImage(
          followElm.forDrag,
          followElm.forDrag.naturalWidth / 2,
          followElm.forDrag.naturalHeight / 2
        );
      }
    } else {
      //没有穿数据时默认根源数据为本身
      touchmoveFollowElm.currentElm = initFollowElmStyle(el.cloneNode(true));
    }
  }

  function getFollowElm(followElmData) {
    if (dragImageObj[followElmData.src]) {
      return {
        forDrag: dragImageObj[followElmData.src],
        forTouchmove: touchmoveFollowElm.cacheElms[followElmData.src]
      };
    }
    let img = document.createElement('img');
    img.src = followElmData.src;
    img.style.width = followElmData.width;
    img.style.height = followElmData.height;
    dragImageObj[followElmData.src] = img;

    let followElm = (touchmoveFollowElm.cacheElms[
      followElmData.src
    ] = img.cloneNode(true));
    initFollowElmStyle(followElm);

    return {
      forDrag: dragImageObj[followElmData.src],
      forTouchmove: touchmoveFollowElm.cacheElms[followElmData.src]
    };
  }

  function initFollowElmStyle(elm) {
    elm.style.pointerEvents = 'none';
    elm.style.position = 'fixed';
    elm.style.display = 'block';
    elm.style.opacity = '.6';
    elm.dataset.dragFollowElm = 'true';
    return elm;
  }

  function handleDragOver(e) {
    if (e.preventDefault) {
      e.preventDefault();
    }
    return false;
  }

  function handleDragEnter(e) {
    e.stopPropagation();
    e.preventDefault();

    //获取手指当前位置的元素el
    //drag事件的e.target指向变更后的元素，touchmove的e.target始终指向触发toucestart事件的对象。因此需要做适配
    let el;
    if (e.type === 'touchmove') {
      el = getOverElementFromTouch(e);
      el = getDraggableEl(el);

      //touchmove事件需手动设置跟随元素的位置，drag事件无需设置
      let data = {
        pageY: e.touches[0].pageY,
        pageX: e.touches[0].pageX,
        offsetHeight: e.target.offsetHeight,
        offsetWidth: e.target.offsetWidth
      };
      setTouchmoveFollowElm(data);
    } else {
      el = getDraggableEl(e.target);
    }

    //手指不在draggable元素 || 当前元素为起始元素时
    if (!el || el === originData.el) {
      initTargetData();
      return;
    }

    // 目标元素没改变是return
    if (el === targetData.el) {
      return;
    }

    //设置新的draggable元素
    initTargetData();

    let { DDD, item } = getDraggableDataByEl(el);
    Vue.set(item, 'drag-enter', true);

    targetData.item = item;
    targetData.index = DDD.List.indexOf(item);
    targetData.DDD = DDD;
    targetData.el = el;

    $dragging.$emit('dragged', {
      from: originData,
      to: targetData
    });
  }

  function handleDragLeave(e) {
    let { item } = getDraggableDataByEl(e.target);
    if (item === targetData.item) {
      initTargetData();
    }
  }

  function handleDrag() {}

  function handleDragEnd(e) {
    e.stopPropagation();
    e.preventDefault();
    removeFolowElm(e);

    // 移除dragging属性
    Vue.set(originData.item, 'dragging', false);

    if (Object.keys(targetData).length > 0) {
      $dragging.$emit('dragend', {
        from: originData,
        to: targetData
      });
      initTargetData();
    }
    originData = {};
  }

  function handleDrop(e) {
    e.preventDefault();
    if (e.stopPropagation) {
      e.stopPropagation();
    }
    return false;
  }

  function initTargetData() {
    if (targetData.el) {
      Vue.set(targetData.item, 'drag-enter', false);
      targetData = {};
    }
  }

  function getDraggableDataByEl(el) {
    const key = el.getAttribute('drag_name');
    const drag_key = el.getAttribute('drag_key');
    const DDD = dragData.new(key);
    const item = DDD.KEY_MAP[drag_key];
    return {
      DDD,
      item
    };
  }

  function setTouchmoveFollowElm(data) {
    let { pageY, pageX, offsetHeight, offsetWidth } = data;
    let followElm = touchmoveFollowElm.currentElm;
    if (!touchmoveFollowElm.isSert) {
      document.body.append(followElm);
      touchmoveFollowElm.isSert = true;
    }
    let style = {
      top: `${pageY - offsetHeight / 2}px`,
      left: `${pageX - offsetWidth / 2}px`
    };
    Object.keys(style).forEach(item => {
      followElm.style[item] = style[item];
    });
  }

  function removeFolowElm(e) {
    if (e.type === 'touchend' && touchmoveFollowElm.currentElm) {
      try {
        if (touchmoveFollowElm.currentElm.parentNode) {
          touchmoveFollowElm.currentElm.parentNode.removeChild(
            touchmoveFollowElm.currentElm
          );
        } else {
          document.body.childNodes.forEach(item => {
            if (item.dataset && item.dataset.dragFollowElm) {
              document.body.removeChild(item);
            }
          });
        }
        touchmoveFollowElm.currentElm = null;
        touchmoveFollowElm.isSert = false;
      } catch (e) {
        //
      }
    }
  }

  function getDraggableEl(el) {
    if (!el) return;
    while (el.parentNode) {
      if (el.getAttribute && el.getAttribute('drag_name')) {
        return el;
        // break;
      } else {
        el = el.parentNode;
      }
    }
    return false;
  }

  function getOverElementFromTouch(e) {
    const touch =
      e.touches && e.touches[0]
        ? e.touches[0]
        : e.changedTouches && e.changedTouches[0]
        ? e.changedTouches[0]
        : e;
    if (!touch) false;
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    return el;
  }

  function addDragItem(el, binding, vnode) {
    //子元素都不能选中
    vnode.children.forEach(item => {
      if (item.elm && item.elm.style) {
        item.elm.style.pointerEvents = 'none';
      }
    });

    const item = binding.value.item;
    const list = binding.value.list;
    const DDD = dragData.new(binding.value.name);

    const drag_key = vnode.key;
    DDD.KEY_MAP[drag_key] = item;
    if (list && DDD.List !== list) {
      DDD.List = list;
    }
    el.setAttribute('draggable', 'true');
    el.setAttribute('drag_name', binding.value.name);
    el.setAttribute('drag_key', drag_key);

    _.on(el, 'dragstart', handleDragStart);
    _.on(el, 'dragenter', handleDragEnter);
    _.on(el, 'dragover', handleDragOver);
    _.on(el, 'drag', handleDrag);
    _.on(el, 'dragleave', handleDragLeave);
    _.on(el, 'dragend', handleDragEnd);
    _.on(el, 'drop', handleDrop);

    _.on(el, 'mousedown', handleDragStart);
    _.on(el, 'touchstart', handleDragStart);
    _.on(el, 'touchmove', handleDragEnter);
    _.on(el, 'touchend', handleDragEnd);
  }

  function removeDragItem(el, binding, vnode) {
    const DDD = dragData.new(binding.value.name);
    const drag_key = vnode.key;
    DDD.KEY_MAP[drag_key] = undefined;
    _.off(el, 'dragstart', handleDragStart);
    _.off(el, 'dragenter', handleDragEnter);
    _.off(el, 'dragover', handleDragOver);
    _.off(el, 'drag', handleDrag);
    _.off(el, 'dragleave', handleDragLeave);
    _.off(el, 'dragend', handleDragEnd);
    _.off(el, 'drop', handleDrop);

    _.off(el, 'mousedown', handleDragStart);
    _.off(el, 'touchstart', handleDragStart);
    _.off(el, 'touchmove', handleDragEnter);
    _.off(el, 'touchend', handleDragEnd);
  }

  Vue.prototype.$dragging = $dragging;
  Vue.directive('dragging', {
    bind: addDragItem,
    update(el, binding, vnode) {
      const DDD = dragData.new(binding.value.name);
      const item = binding.value.item;
      const list = binding.value.list;

      const drag_key = vnode.key;
      const old_item = DDD.KEY_MAP[drag_key];
      if (item && old_item !== item) {
        DDD.KEY_MAP[drag_key] = item;
      }
      if (list && DDD.List !== list) {
        DDD.List = list;
      }
    },
    unbind: removeDragItem
  });
};
