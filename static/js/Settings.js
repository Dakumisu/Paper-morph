import * as dat from "dat.gui"; // https://github.com/dataarts/dat.gui#readme

export default new class Settings {
   constructor() {
      if (Settings._instance) {
         throw new Error("Singleton classes can't be instantiated more than once.")
      }
      Settings._instance = this;

      this.gui = new dat.GUI()
   }
}