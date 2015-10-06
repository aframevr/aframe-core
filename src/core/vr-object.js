require('../vr-register-element');

var THREE = require('../../lib/three');
var VRComponents = require('./components');
var VRNode = require('./vr-node');
var VRUtils = require('../vr-utils');

/**
 *
 * VRObject represents all elements that are part of the 3D scene.
 * They all have a position, rotation and a scale.
 *
 */
var proto = {

  //  ----------------------------------  //
  //   Native custom elements callbacks   //
  //  ----------------------------------  //
  attachedCallback: {
    value: function () {
      this.object3D = new THREE.Object3D();
      this.components = {};
      this.addToParent();
      this.load();
    },
    writable: window.debug
  },

  detachedCallback: {
    value: function () {
      this.parentEl.remove(this);
    },
    writable: window.debug
  },

  attributeChangedCallback: {
    value: function (attrName, oldVal, newVal) {
      this.updateComponent(attrName);
    },
    writable: window.debug
  },

  applyMixin: {
    value: function (attr) {
      if (!attr) {
        this.updateComponents();
        return;
      }
      this.updateComponent(attr);
    }
  },

  add: {
    value: function (el) {
      if (!el.object3D) {
        VRUtils.error("Trying to add an object3D that doesn't exist");
      }
      this.object3D.add(el.object3D);
    },
    writable: window.debug
  },

  addToParent: {
    value: function () {
      var parent = this.parentEl = this.parentNode;
      var attachedToParent = this.attachedToParent;
      if (!parent || attachedToParent || !VRNode.prototype.isPrototypeOf(parent)) { return; }
      // To prevent an object to attach itself multiple times to the parent
      this.attachedToParent = true;
      parent.add(this);
    },
    writable: window.debug
  },

  load: {
    value: function () {
      // To prevent calling load more than once
      if (this.hasLoaded) { return; }
      // Handle to the associated DOM element
      this.object3D.el = this;
      // It attaches itself to the threejs parent object3D
      this.addToParent();
      // It sets default values on the attributes if they're not defined
      this.initAttributes();
      // Components initializaion
      this.initComponents();
      // Call the parent class
      VRNode.prototype.load.call(this);
    },
    writable: window.debug
  },

  setAttribute: {
    value: function (attr, val) {
      return VRNode.prototype.setAttribute.call(this, attr, val);
    },
    writable: window.debug
  },

  remove: {
    value: function (el) {
      this.object3D.remove(el.object3D);
    },
    writable: window.debug
  },

  initComponents: {
    value: function () {
      var mixinEl = this.mixinEl;
      var self = this;
      Object.keys(VRComponents).forEach(initComponent);
      function initComponent (key) {
        if (self.hasAttribute(key) || (mixinEl && mixinEl.hasAttribute(key))) {
          if (!VRComponents[key].Component) { return; }
          self.components[key] = new VRComponents[key].Component(self);
        }
      }
      // Updates components to match attributes values
      this.updateComponents();
    }
  },

  updateComponents: {
    value: function () {
      var components = Object.keys(this.components);
      // Updates components
      components.forEach(this.updateComponent.bind(this));
    },
    writable: window.debug
  },

  updateComponent: {
    value: function (name) {
      var component = VRComponents[name];
      if (!component) {
        VRUtils.warn('Unknown component name: ' + name);
        return;
      }
      this.components[name].updateAttributes(this.getAttribute(name));
    },
    writable: window.debug
  },

  initAttributes: {
    value: function (el) {
      var position = this.hasAttribute('position');
      var rotation = this.hasAttribute('rotation');
      var scale = this.hasAttribute('scale');
      if (!position) { this.setAttribute('position', '0 0 0'); }
      if (!rotation) { this.setAttribute('rotation', '0 0 0'); }
      if (!scale) { this.setAttribute('scale', '1 1 1'); }
    },
    writable: window.debug
  },

  getAttribute: {
    value: function (attrName, defaultValue) {
      return VRNode.prototype.getAttribute.call(this, attrName, defaultValue);
    },
    writable: window.debug
  },

  /**
   * Returns Object3D attatched to this entity based on type.  If type is left blank,
   * the method will return the current Object3D.  If none exists, it will create and
   * return a new Mesh.
   *
   * @type {String} Type of Object3D being requested.
   */
  getObject3D: {
    value: function (type) {
      // Object3D type to be create by default
      var defaultType = 'Mesh';

      // return current Object3D if type is not specified.
      if (this.currentObject3D && !type) {
        return this.currentObject3D;
      }

      // finds children of specific Object3D type.
      var obj = this.object3D.children.filter(function (child) {
        return child.type === type;
      })[0];

      // Create new Object3D of type
      if (!obj) {
        obj = new THREE[type || defaultType]();
        this.object3D.add(obj);
      }

      // Replace existing Object3D.
      if (obj !== this.currentObject3D) {
        this.object3D.remove(this.currentObject3D);
      }
      this.currentObject3D = obj;

      return obj;
    }
  }
};

module.exports = document.registerElement(
  'vr-object',
  { prototype: Object.create(VRNode.prototype, proto) }
);
