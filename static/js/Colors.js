import * as THREE from 'three'

export default new class PaperMorph {
   constructor(opt) {
      if (PaperMorph._instance) {
         throw new Error("Singleton classes can't be instantiated more than once.")
      }
      PaperMorph._instance = this;

      this.colors = {}

      this.addColor()
   }

   addColor() {
      this.colors.melon = ["ffcdb2","ffc1aa","ffb4a2","f2a69f","e5989b","cd8e94","b5838d","917681","6d6875","7a7682"]
      this.colors.cassis = ["f94144","f3722c","f8961e","f9844a","f9c74f","90be6d","43aa8b","4d908e","577590","277da1"]
      this.colors.pasteque = ["d8f3dc","b7e4c7","95d5b2","74c69d","52b788","40916c","2d6a4f","1b4332","081c15", "1e312a"]
      // this.colors.myrtille = ["10002b","240046","3c096c","4b1183","5a189a","7b2cbf","9d4edd","b266ee","c77dff","e0aaff"]
      this.colors.myrtille = ["e0aaff","c77dff","b266ee","9d4edd","7b2cbf","5a189a","4b1183","3c096c","240046","10002b"]
      this.colors.kiwi = ["532a09","7b4618","915c27","ad8042","bfab67","bfc882","a4b75c","647332","3e4c22","2e401c"]
   }
}