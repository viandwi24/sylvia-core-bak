class Container {
  constructor() {
    this.aliases = new Map();
    this.instances = new Map();
    this.resolved = new Map();
    this.registry = new Map();
  }

  bind(abstract, concrete) {
    if (typeof concrete === 'undefined') {
      concrete = abstract;
    }
    this.registry.set(abstract, concrete);
  }
}

module.exports = Container;