module.exports = {
  apps : [{
    name : "death-counter",
    script : "./dist/index.js",
    out_file : "./logs/output.log",
    error_file : "./logs/error.log",
    log_date_format: "YYYY-MM-DD HH:mm:ss",
    watch : ["dist"],
    ignore_watch : ['node_modules', "data"]
  }]
}
