module.exports = function(grunt) {

grunt.initConfig({

  pkg: grunt.file.readJSON('package.json'),

  jade: {
    build: {
      options: {
        pretty:  true,
        client:  false,
        basedir: '_src'
      },
      files: [{
        expand: true,
        cwd:    '_src',
        src:    ['*.jade'],
        dest:   './',
        ext:    '.html'
      }]
    }
  },

  stylus: {
    build: {
      options: {
        paths:   ['images/'],
        urlfunc:  'image64',
        compress: false
      },
      files: {
        'styles/common.css': '_src/styles/common.styl'
      }
    }
  },

  autoprefixer: {
    options: {
      browsers: ['last 3 version']
    },
    build: {
      src: 'styles/common.css'
    }
  },

  csso: {
    build: {
      files: {
        'styles/common.min.css': 'styles/common.css'
      }
    }
  },

  css_mqpacker: {
    main: {
      files: {
        'styles/common.css': 'styles/common.css'
      }
    }
  },

  sprite: {
    build: {
      algorithm: 'binary-tree',
      padding:   4,
      src:       '_src/sprite/*.png',
      destImg:   'images/sprite.png',
      destCSS:   '_src/styles/sprite/sprite.json'
    }
  },

  imagemin: {
    build: {
      files: [{
        expand: true,
        cwd:    'images/',
        src:    '**/*.{png,jpg,gif}',
        dest:   'images/'
      }]
    }
  },

  modernizr: {
    build: {
      devFile:    'scripts/modernizr-dev.js',
      outputFile: 'scripts/modernizr.js',
      extra: {
        shiv:       true,
        printshiv:  false,
        load:       true,
        mq:         false,
        cssclasses: true
      },
      extensibility: {
        addtest:      true,
        prefixed:     true,
        teststyles:   true,
        testprops:    true,
        testallprops: true,
        hasevents:    true,
        prefixes:     true,
        domprefixes:  true
      },
      tests: ['forms_placeholder', 'flexbox', 'backgroundsize', 'audio', 'video', 'svg', 'touch', 'csstransforms'],
    }
  },

  uglify: {
    build: {
      files: {
        'scripts/common.min.js': '_src/vendor/**/*.js'
      }
    }
  },

  watch: {
    options: {
      livereload: true
    },
    images: {
      files: ['_src/sprite/*.png'],
      tasks: ['sprite','stylus']
    },
    js: {
      files: ['scripts/**/*.js', '_src/vendor/**/*.js', '!scripts/common.min.js', '!scripts/main.js'],
      tasks: ['uglify']
    },
    css: {
      files: ['_src/**/*.styl'],
      tasks: ['stylus','autoprefixer']
    },
    html: {
      files: ['_src/**/*.jade'],
      tasks: ['jade'],
      options: {
        spawn: false,
      }
    }
  },

  browserSync: {
    dev: {
      bsFiles: {
        src: ['*.html','scripts/*.js','styles/common.css','files/*.{png,jpg}','images/*.{png,jpg}']
      },
      options: {
        watchTask: true,
        open:      false,
        server: {
          baseDir: ['./']
        }
      }
    }
  }

});

var JadeInheritance = require('jade-inheritance');
var changedFiles = [];

var onChange = grunt.util._.debounce(function() {
  var options = grunt.config('jade.build.options');
  var dependantFiles = [];
  changedFiles.forEach(function(filename) {
    var directory = options.basedir;
    var inheritance = new JadeInheritance(filename, directory, options);
    dependantFiles = dependantFiles.concat(inheritance.files);
  });
  var config = grunt.config('jade.build.files')[0];
  config.src = dependantFiles;
  grunt.config('jade.build.files', [config]);
  changedFiles = [];
}, 200)

grunt.event.on('watch', function(action, filepath) {
  changedFiles.push(filepath);
  onChange();
});

require('load-grunt-tasks')(grunt);

grunt.registerTask('dev', ['browserSync', 'watch']);

grunt.registerTask('mdzr', ['modernizr']);

grunt.registerTask('default', ['jade',
                               'sprite',
                               'stylus',
                               'autoprefixer',
                               'csso',
                               'css_mqpacker',
                               'imagemin',
                               'modernizr',
                               'uglify'
                              ]);

};
