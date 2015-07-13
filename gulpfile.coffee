gulp = require 'gulp'
plugins = require('gulp-load-plugins')(pattern: [
  '*{-,.}*'
  'cssnano'
])



gulp.task 'jade', ->
  gulp.src '_src/**/*.jade'
  .pipe plugins.changed '.', extension: '.html'
  .pipe plugins.jadeInheritance basedir: '_src/'
  .pipe plugins.filter (file) ->
    !/\/_/.test(file.path) or !/^_/.test(file.relative)
  .pipe plugins.jade
    pretty: true
    client: false
  .pipe gulp.dest '.'
  return

gulp.task 'css', ->
  processors = [
    plugins.autoprefixerCore browsers: ['last 2 versions','ie 8']
    plugins.cssMqpacker
    plugins.cssnano
    plugins.postcssAssets {loadPaths: ['images/','fonts/']}
  ]
  gulp.src '_src/styles/common.styl'
  .pipe plugins.sourcemaps.init {includeContent: false}
  .pipe plugins.stylus()
  .pipe plugins.postcss processors
  .pipe plugins.rename suffix: '.min'
  .pipe plugins.sourcemaps.write '.'
  .pipe gulp.dest 'styles'
  return

gulp.task 'uglify', ->
  gulp.src '_src/vendor/**/*.js'
  .pipe plugins.concat 'common.min.js'
  .pipe plugins.uglify()
  .pipe gulp.dest 'scripts'
  return

#gulp.task 'modernizr', ->
#  gulp.src 'scripts/*.js'
#  .pipe plugins.modernizr
#    options: ['setClasses','addTest','html5printshiv','testProp','fnBind']
#    tests: ['forms_placeholder','flexbox','backgroundsize','audio','video','svg','touch','csstransforms']
#  .pipe plugins.uglify()
#  .pipe gulp.dest 'scripts'
#  return

gulp.task 'sprite', ->
  spriteData = gulp.src('_src/sprite/*.png')
  .pipe plugins.spritesmith
    algorithm: 'binary-tree'
    padding: 4
    imgName: 'sprite.png'
    cssName: 'sprite.json'
  spriteData.img.pipe gulp.dest 'images'
  spriteData.css.pipe gulp.dest '_src/styles/sprite'
  return

gulp.task 'imagemin', ->
  gulp.src 'images/*'
  .pipe plugins.imagemin
    progressive: true
    svgoPlugins: [ { removeViewBox: false } ]
    use: [ plugins.imageminPngquant() ]
  .pipe gulp.dest 'images'
  return

gulp.task 'browser-sync', ->
  plugins.browserSync.init ['*.html','styles/common.min.css','**/*.{png,jpg,svg}','scripts/main.js','scripts/common.min.js'],
    open: false
    server: baseDir: '.'
  return



gulp.task 'default', ['browser-sync'], ->
  gulp.watch '_src/**/*.styl',      ['css']
  gulp.watch '_src/**/*.jade',      ['jade']
  gulp.watch '_src/vendor/**/*.js', ['uglify']
  gulp.watch '_src/sprite/*',       ['sprite']
  return