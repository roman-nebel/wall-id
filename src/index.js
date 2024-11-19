function validator(config, data) {
  const { params = [] } = config;
  for (const [paramKey, paramValue] of Object.entries(params)) {
    // Check required parameter
    if (!(paramKey in data && paramValue?.required)) {
      throw new Error(`Parameter ${paramKey} is required`);
    }

    // Check empty value
    if (!data[paramKey] && paramValue?.notEmpty) {
      throw new Error(`Parameter ${paramKey} can't be empty`);
    }
  }
  return true;
}

function expressMiddleware(config) {
  return (req, res, next) => {
    const { source = "all" } = config;
    try {
      const requestData = {
        query: req?.query,
        body: req?.body,
        params: req?.params,
        all: Object.assign({}, req?.query, req?.body, req?.params),
      };
      validator(config, requestData[source]);
      next();
    } catch (error) {
      const { errorHandler = false } = config;
      if (typeof errorHandler === "function") {
        return errorHandler(req, res, next);
      } else if (errorHandler) {
        next(error);
      } else {
        console.error(error);
        res.status(400).send(error?.message || { error: true });
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
