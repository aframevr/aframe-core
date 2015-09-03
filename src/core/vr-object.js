/* globals define, VRNode, TWEEN */
(function(define){'use strict';define(function(require,exports,module){

  var proto =  Object.create(
    VRNode.prototype, {
      init: {
        value: function() {
          this.object3D = new THREE.Object3D();
          this.load();
        }
      },

      detachedCallback: {
        value: function() {
          var parent = this.parentNode;
          if (parent) {
            parent.remove(this);
          } else {
            // In certain cases like removing an element from the DOM inspector
            // The parentNode is null when calling this function.
            this.sceneEl.remove(this);
          }
        }
      },

      add: {
        value: function(el) {
          this.object3D.add(el.object3D);
        }
      },

      load: {
        value: function() {
          var parent = this.parentNode;
          // Handle to the associated DOM element
          this.object3D.el = this;
          if (parent) {
            parent.add(this);
          }
          VRObject.prototype.onAttributeChanged.call(this);
          VRNode.prototype.load.call(this);
          this.addAnimations();
        }
      },

      remove: {
        value: function(el) {
          this.object3D.remove(el.object3D);
        }
      },

      onAttributeChanged: {
        value: function() {
          this.object3D = this.object3D || new THREE.Object3D();

          // Position
          var position = this.getAttribute('position');
          var x = position.x || 0;
          var y = position.y || 0;
          var z = position.z || 0;

          // Rotation
          var rotation = this.getAttribute('rotation');
          var rotationX = THREE.Math.degToRad(rotation.x) || 0;
          var rotationY = THREE.Math.degToRad(rotation.y) || 0;
          var rotationZ = THREE.Math.degToRad(rotation.z) || 0;

          // Scale
          var scale = this.getAttribute('scale');
          var scaleX = scale.x || 1;
          var scaleY = scale.y || 1;
          var scaleZ = scale.z || 1;

          // Setting three.js parameters
          this.object3D.position.set(x, y, z);
          this.object3D.rotation.order = 'YXZ';
          this.object3D.rotation.set(rotationX, rotationY, rotationZ);
          this.object3D.scale.set(scaleX, scaleY, scaleZ);
        }
      },

      getAttribute: {
        value: function(attr) {
          var value = HTMLElement.prototype.getAttribute.call(this, attr);
          if (attr === 'position' ||
              attr === 'rotation' ||
              attr === 'scale') {
            value = this.parseAttributeString(value);
          }
          return value;
        }
      },

      setAttribute: {
        value: function(attr, val) {
          if (attr === 'position' ||
              attr === 'rotation' ||
              attr === 'scale') {
            val = [val.x, val.y, val.z].join(' ');
          }
          HTMLElement.prototype.setAttribute.call(this, attr, val);
        },
      },

      parseAttributeString: {
        value: function(str) {
          var values;
          if (!str) { return {}; }
          values = str.split(' ');
          return {
            x: parseFloat(values[0]),
            y: parseFloat(values[1]),
            z: parseFloat(values[2])
          };
        }
      },

      attributeChangedCallback: {
        value: function(name, previousValue, value) {
          VRObject.prototype.onAttributeChanged.call(this);
          if (VRObject.prototype.onAttributeChanged !== this.onAttributeChanged) {
            this.onAttributeChanged();
          }
        }
      },

      addAnimations: {
        value: function() {
          var animationList = this.hasAttribute('animation') ?
            this.getAttribute('animation').split(' ') : [];
          animationList.forEach(this.startTween.bind(this));
        },
      },

      startTween: {
        value: function(animationName) {
          var animationTag = document.getElementById(animationName);
          var from = this.getAttribute(animationTag.prop);
          this.fixUpDefaultValues(animationTag.prop, from);
          var self = this;
          new TWEEN.Tween(from)
            .to(animationTag.to, animationTag.duration)
            .delay(animationTag.delay)
            .onUpdate(function () {
              self.setAttribute(animationTag.prop, this);
            })
            .start();
        },
      },

      fixUpDefaultValues: {
        value: function (prop, val) {
          if (prop === 'position' || prop === 'rotation') {
            val.x = val.x || 0;
            val.y = val.y || 0;
            val.z = val.z || 0;
          } else if (prop === 'scale') {
            val.x = val.x || 1;
            val.y = val.y || 1;
            val.z = val.z || 1;
          }
        },
      },
  });

  // Registering element and exporting prototype
  var VRTags = window.VRTags = window.VRTags || {};
  VRTags["VR-OBJECT"] = true;
  module.exports = document.registerElement('vr-object', { prototype: proto });

});})(typeof define==='function'&&define.amd?define
:(function(n,w){'use strict';return typeof module==='object'?function(c){
c(require,exports,module);}:function(c){var m={exports:{}};c(function(n){
return w[n];},m.exports,m);w[n]=m.exports;};})('VRObject',this));
