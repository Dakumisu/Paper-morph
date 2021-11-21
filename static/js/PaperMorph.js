import { BoxBufferGeometry, Color, DoubleSide, Group, Mesh, PlaneBufferGeometry, ShaderMaterial, SphereBufferGeometry, TextureLoader, Vector2 } from 'three'
import vertex from '../glsl/vertex.vert'
import fragment from '../glsl/fragment.frag'
import Colors from './Colors'
import Settings from './Settings'

import paperTexture from '../img/texture/Watercolor_ColdPress.jpg'

class PaperMorph {
   constructor(opt) {
      this.scene = opt.scene
      this.color = opt.color || 'pasteque'
      
      this.params = {}
      this.colors = []
      
      this.initialized = false
      this.init()
      this.resize()
   }
   
   settings() {
      this.params.scale = 5.
      this.params.color = this.color
      Settings.gui.add(this.params, "scale", 1, 20, .1)
      Settings.gui.add(this.params, 'color', this.colors ).onChange((value) => {
         this.changeColor();
      })
   }
   
   init() {
      this.meshs = []

      for (const color in Colors.colors) {
         this.colors.push(color)
      }

      this.settings()
      this.getGeometry()
      this.textureLoader()
      // this.getMaterial()
      this.getMesh()
   }

   textureLoader() {
      const loader = new TextureLoader()
      this.texture = loader.load(paperTexture)
   }

   getGeometry() {
      this.geometry = new PlaneBufferGeometry(1, 1, 1, 1)
   }

   getMaterial() {
      const material =  new ShaderMaterial({
         vertexShader: vertex,
         fragmentShader: fragment,
         uniforms: {
            uTime: { value : 0 },
            uOffset: { value : 0},
            uStrength: { value : 0},
            uScale: { value : this.params.scale},
            uColor: { value: new Color(0xffffff) },
            uTexture: { value: this.texture },
            uAlpha: { value: 1 },
            uResolution : { value : new Vector2(this.scene.sizes.width, this.scene.sizes.height) },
            uPixelRatio: { value: window.devicePixelRatio }
         },
         side: DoubleSide,
         transparent: true
      })

      return material
   }

   async changeColor() {
      for (let i = 0; i < Colors.colors[this.params.color].length; i++) {
         const color = Colors.colors[this.params.color][i] 
   
         this.meshs[i].material.uniforms.uColor.value = new Color(`#${color}`)
      }
   }

   getMesh() {
      this.paperPlanes = new Group()

      let scale = 0
      for (let i = 0; i < Colors.colors[this.params.color].length; i++) {
         this.meshs.push(new Mesh(this.geometry, this.getMaterial()))

         this.meshs[i].material.uniforms.uOffset.value = i
         this.meshs[i].material.uniforms.uStrength.value = (i / Colors.colors[this.params.color].length)
         this.meshs[i].frustumCulled = false
         this.meshs[i].position.z = -i * .03

         this.paperPlanes.add(this.meshs[i])
      }

      this.changeColor()
         .then(() => {
            this.add(this.paperPlanes)
            this.initialized = true
         })
   }
   
   add(object) {
      this.scene.scene.add(object)
   }

   resize() {
      window.addEventListener('resize', () => {
         this.meshs.forEach(mesh => {
            mesh.material.uniforms.uResolution.value = new Vector2(this.scene.sizes.width, this.scene.sizes.height)
            mesh.material.uniforms.uPixelRatio.value = window.devicePixelRatio
         })
     })
   }

   update(time) {
      if(!this.initialized) return

      this.meshs.forEach(mesh => {
         mesh.material.uniforms.uTime.value = time
         mesh.material.uniforms.uScale.value = this.params.scale
      })
   }
}

export default PaperMorph