function validator(config, data) {
  console.log(config, data);
  const error = new Error("This is error");
  error.status = 400;
  throw error;
}

function expressMiddleware(config) {
  return (req, res, next) => {
    try {
      validator(config, req);
      next();
    } catch (error) {
      const { handleError = false } = config;
      if (handleError) {
        next(error);
      } else {
        console.error(error);
        res.status(400).send(error);
      }
    }
  };
}

function Wall(config) {
  if (new.target) {
    this.baseConfig = config;
    this.walls = {};
    return {
      init: (name, config) => {
        this.walls[name] = Object.assign({}, this.baseConfig, config);
        return true;
      },
      check: (wall) => {
        const isInitedWall = typeof wall === "string" && wall in this.walls;
        const usedConfig = isInitedWall ? this.walls[wall] : wall;
        const resultConfig = Object.assign({}, this.baseConfig, usedConfig);
        return expressMiddleware(resultConfig);
      },
    };
  } else {
    return {
      check: (data) => {
        return validator(config, data);
      },
    };
  }
}

module.exports = { Wall };
