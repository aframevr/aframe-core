var THREE = window.VRMarkup.THREE;
var VRObject = window.VRMarkup.VRObject;

document.registerElement(
  'vr-video',
  {
    prototype: Object.create(
      VRObject.prototype, {
        createdCallback: {
          value: function () {
            var material = this.getMaterial();
            var geometry = this.getGeometry();
            this.object3D = new THREE.Mesh(geometry, material);
            this.load();
          }
        },

        /* no `update` function needed */

        getGeometry: {
          value: function () {
            var width = parseFloat(this.getAttribute('width') || 50);
            var height = parseFloat(this.getAttribute('height') || 50);
            return new THREE.PlaneGeometry(width, height, 1, 1);
          }
        },

        getMaterial: {
          value: function () {
            var video = document.createElement('video');
            video.crossOrigin = 'anonymous';
            video.src = this.getAttribute('src');
            video.autoplay = this.hasAttribute('autoplay');
            video.loop = this.hasAttribute('loop');

            var texture = new THREE.VideoTexture(video);
            texture.minFilter = THREE.LinearFilter;
            texture.format = THREE.RGBFormat;
            texture.generateMipmaps = false;

            return new THREE.MeshBasicMaterial({
              map: texture
            });
          }
        }
      }
    )
  }
);
