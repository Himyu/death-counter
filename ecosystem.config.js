module.exports = {
  apps : [{
    name   : "death-counter",
    script : "./dist/index.js",
    watch : true,
    ignore_watch : ['node_modules']
  }]
}