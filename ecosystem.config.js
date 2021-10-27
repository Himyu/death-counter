module.exports = {
  apps : [{
    name   : "death-counter",
    script : "./dist/index.js",
    watch : true,
    ignore_watch : ['node_modules']
  }],
  deploy: {
    production : {
      ref: 'origin/master',
      repo: 'git@github.com',
      path: './',
      'pre-deploy': 'git fetch --all',
      'post-deploy' : 'npm install && npm run build && pm2 reload ecosystem.config.js',
      "post-deploy": 'npm install && npm run build && pm2 reload ecosystem.config.js'
    }
  }
}