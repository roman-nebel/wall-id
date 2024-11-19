function checkType(value) {
  if (value === "true" || value === "false") return "boolean";
  if (!isNaN(Number(value))) return "number";
  if (value === "null") "null";
  if (value === "undefined") return "undefined";
  try {
    const parsed = JSON.parse(value);
    return !Array.isArray(parsed) ? "array" : "object";
  } catch {
    return "string";
  }
}

function validateType(value, expectType) {
  switch (expectType.toLowerCase()) {
    case "string":
      return String(value);
    case "number":
      const num = Number(value);
      if (isNaN(num)) throw new Error(`Cannot convert "${value}" to Number`);
      return num;
    case "boolean":
      if (value === "true" || value === true) return true;
      if (value === "false" || value === false) return false;
      throw new Error(`Cannot convert "${value}" to Boolean`);
    case "object":
      try {
        return JSON.parse(value);
      } catch {
        throw new Error(`Cannot convert "${value}" to Object`);
      }
    case "array":
      try {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed)) {
          throw new Error(`"${value}" is not an Array`);
        }
        return parsed;
      } catch {
        throw new Error(`Cannot convert "${value}" to Array`);
      }
    case "undefined":
      if (value === "undefined") return undefined;
      throw new Error(`Cannot convert "${value}" to Undefined`);
    case "null":
      if (value === "null") return null;
      throw new Error(`Cannot convert "${value}" to Null`);
    default:
      throw new Error(`Unsupported target type: "${targetType}"`);
  }
}

function validator(config, data) {
  const { params = [] } = config;
  for (const [paramKey, paramValue] of Object.entries(params)) {
    // Check required parameter
    if (!(paramKey in data) && paramValue?.required) {
      throw new Error(`Parameter ${paramKey} is required`);
    }

    // Check empty value
    if (data[paramKey] === "" && paramValue?.notEmpty) {
      throw new Error(`Parameter ${paramKey} can't be empty`);
    }

    // Check value type
    if (paramValue?.type) {
      validateType(data[paramKey]?.value, paramValue.type);
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
