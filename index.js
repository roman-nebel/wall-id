function check() {
  console.log("check!");
}

function Wall(config) {
  if (new.target) {
    this.baseConfig = config;
    this.walls = {};
    return {
      register: (name, config) => {
        this.walls[name] = Object.assign({}, this.baseConfig, config);
        return true;
      },
      use: (config) => {
        if (typeof config === "string" && config in this.walls) {
          return (req, res, next) => {
            check();
          };
        } else {
          return (req, res, next) => {
            check();
          };
        }
      },
    };
  } else {
    return (req, res, next) => {
      check();
    };
  }
}
