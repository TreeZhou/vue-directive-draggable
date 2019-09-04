(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["vue-directive-draggable"] = factory();
	else
		root["vue-directive-draggable"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = __webpack_require__(1);

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*!
 * vue-dragging v1.0.0
 * (c) 2019 527533739@qq.com
 * Released under the MIT License.
 */

var DragData = function () {
  function DragData() {
    _classCallCheck(this, DragData);

    this.data = {};
  }

  _createClass(DragData, [{
    key: 'new',
    value: function _new(key) {
      if (!this.data[key]) {
        this.data[key] = {
          List: [],
          KEY_MAP: {}
        };
      }
      return this.data[key];
    }
  }, {
    key: 'get',
    value: function get(key) {
      return this.data[key];
    }
  }]);

  return DragData;
}();

var $dragging = {
  listeners: {},
  $on: function $on(event, func) {
    var events = this.listeners[event];
    if (!events) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(func);
  },
  $once: function $once(event, func) {
    var vm = this;
    function on() {
      vm.$off(event, on);

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      func.apply(vm, args);
    }
    this.$on(event, on);
  },
  $off: function $off(event, func) {
    var events = this.listeners[event];
    if (!func || !events) {
      this.listeners[event] = [];
      return;
    }
    this.listeners[event] = this.listeners[event].filter(function (i) {
      return i !== func;
    });
  },
  $emit: function $emit(event, context) {
    var events = this.listeners[event];
    if (events && events.length > 0) {
      events.forEach(function (func) {
        func(context);
      });
    }
  }
};
var _ = {
  on: function on(el, type, fn) {
    el.addEventListener(type, fn);
  },
  off: function off(el, type, fn) {
    el.removeEventListener(type, fn);
  },
  addClass: function addClass(el, cls) {
    if (arguments.length < 2) {
      el.classList.add(cls);
    } else {
      for (var i = 1, len = arguments.length; i < len; i++) {
        el.classList.add(arguments[i]);
      }
    }
  },
  removeClass: function removeClass(el, cls) {
    if (arguments.length < 2) {
      el.classList.remove(cls);
    } else {
      for (var i = 1, len = arguments.length; i < len; i++) {
        el.classList.remove(arguments[i]);
      }
    }
  }
};

module.exports = function (Vue) {
  var dragData = new DragData();

  var originData = {}; //初始位置数据
  var targetData = {}; //目标位置数据
  var dragImageObj = {}; // drag事件跟随手指移动的元素集合

  // touchmove事件跟随手指移动的元素
  var touchmoveFollowElm = {
    isSert: false,
    cacheElms: {},
    currentElm: null
  };

  function handleDragStart(e) {
    var el = getDraggableEl(e.target);

    var _getDraggableDataByEl = getDraggableDataByEl(el),
        DDD = _getDraggableDataByEl.DDD,
        item = _getDraggableDataByEl.item;

    var index = DDD.List.indexOf(item);

    Vue.set(item, 'dragging', true);

    originData = {
      DDD: DDD,
      index: index,
      item: item,
      el: el
    };
    $dragging.$emit('dragStart', originData);
    initFollowElm(e, item, el);
  }

  // 设置跟随图片
  function initFollowElm(e, item, el) {
    if (item.followElmData) {
      var followElm = getFollowElm(item.followElmData);

      //设置touchmove事件跟随图片
      touchmoveFollowElm.currentElm = followElm.forTouchmove;

      //设置drag事件跟随图片
      if (e.dataTransfer) {
        e.dataTransfer.setDragImage(followElm.forDrag, followElm.forDrag.naturalWidth / 2, followElm.forDrag.naturalHeight / 2);
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
    var img = document.createElement('img');
    img.src = followElmData.src;
    img.style.width = followElmData.width;
    img.style.height = followElmData.height;
    dragImageObj[followElmData.src] = img;

    var followElm = touchmoveFollowElm.cacheElms[followElmData.src] = img.cloneNode(true);
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
    var el = void 0;
    if (e.type === 'touchmove') {
      el = getOverElementFromTouch(e);
      el = getDraggableEl(el);

      //touchmove事件需手动设置跟随元素的位置，drag事件无需设置
      var data = {
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

    var _getDraggableDataByEl2 = getDraggableDataByEl(el),
        DDD = _getDraggableDataByEl2.DDD,
        item = _getDraggableDataByEl2.item;

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
    var _getDraggableDataByEl3 = getDraggableDataByEl(e.target),
        item = _getDraggableDataByEl3.item;

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
    var key = el.getAttribute('drag_name');
    var drag_key = el.getAttribute('drag_key');
    var DDD = dragData.new(key);
    var item = DDD.KEY_MAP[drag_key];
    return {
      DDD: DDD,
      item: item
    };
  }

  function setTouchmoveFollowElm(data) {
    var pageY = data.pageY,
        pageX = data.pageX,
        offsetHeight = data.offsetHeight,
        offsetWidth = data.offsetWidth;

    var followElm = touchmoveFollowElm.currentElm;
    if (!touchmoveFollowElm.isSert) {
      document.body.append(followElm);
      touchmoveFollowElm.isSert = true;
    }
    var style = {
      top: pageY - offsetHeight / 2 + 'px',
      left: pageX - offsetWidth / 2 + 'px'
    };
    Object.keys(style).forEach(function (item) {
      followElm.style[item] = style[item];
    });
  }

  function removeFolowElm(e) {
    if (e.type === 'touchend' && touchmoveFollowElm.currentElm) {
      try {
        if (touchmoveFollowElm.currentElm.parentNode) {
          touchmoveFollowElm.currentElm.parentNode.removeChild(touchmoveFollowElm.currentElm);
        } else {
          document.body.childNodes.forEach(function (item) {
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
    var touch = e.touches && e.touches[0] ? e.touches[0] : e.changedTouches && e.changedTouches[0] ? e.changedTouches[0] : e;
    if (!touch) false;
    var el = document.elementFromPoint(touch.clientX, touch.clientY);
    return el;
  }

  function addDragItem(el, binding, vnode) {
    //子元素都不能选中
    vnode.children.forEach(function (item) {
      if (item.elm && item.elm.style) {
        item.elm.style.pointerEvents = 'none';
      }
    });

    var item = binding.value.item;
    var list = binding.value.list;
    var DDD = dragData.new(binding.value.name);

    var drag_key = vnode.key;
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
    var DDD = dragData.new(binding.value.name);
    var drag_key = vnode.key;
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
    update: function update(el, binding, vnode) {
      var DDD = dragData.new(binding.value.name);
      var item = binding.value.item;
      var list = binding.value.list;

      var drag_key = vnode.key;
      var old_item = DDD.KEY_MAP[drag_key];
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

/***/ })
/******/ ]);
});