global.rootPath = function(fileName) {
  return `${__dirname}/../${fileName}`;
};

global.rootRequire = function(fileName) {
  // eslint-disable-next-line global-require,import/no-dynamic-require
  return require(global.rootPath(fileName));
};
