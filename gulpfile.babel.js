import gulp from 'gulp';

let plugins = require('gulp-load-plugins')({
	pattern: ['*{-,.}*', 'cssnano']
});

gulp.task('jade', () => {
	return gulp.src('_src/**/*.jade').pipe(plugins.changed('.', {
		extension: '.html'
	})).pipe(plugins.jadeInheritance({
		basedir: '_src/'
	})).pipe(plugins.filter(function(file) {
		return !/\/_/.test(file.path) || !/^_/.test(file.relative);
	})).pipe(plugins.plumber()).pipe(plugins.jade({
		pretty: true,
		client: false
	})).pipe(gulp.dest('.'));
});

gulp.task('css', () => {
	let autoprefixer = require('autoprefixer');
	let processors = [
		autoprefixer({browsers: ['last 2 versions']}),
		plugins.postcssAssets({loadPaths: ['images/', 'fonts/', '_src/sprite-svg/']}),
		plugins.postcssInlineSvg({path: '_src/sprite-svg/'}),
		plugins.cssMqpacker,
		plugins.cssnano
	];
	return gulp.src('_src/styles/common.styl')
		.pipe(plugins.sourcemaps.init({includeContent: false}))
		.pipe(plugins.plumber())
		.pipe(plugins.stylus())
		.pipe(plugins.postcss(processors))
		.pipe(plugins.rename({suffix: '.min'}))
		.pipe(plugins.sourcemaps.write('.'))
		.pipe(gulp.dest('./styles'));
});

gulp.task('uglify', () => {
	return gulp.src('_src/**/*.js')
		.pipe(plugins.concat('common.min.js'))
		.pipe(plugins.uglify())
		.pipe(gulp.dest('scripts'));
});

gulp.task('modernizr', () => {
	return gulp.src('scripts/*.js').pipe(plugins.modernizr({
		options: ['setClasses', 'addTest', 'html5printshiv', 'testProp', 'fnBind'],
		tests: ['forms_placeholder', 'flexbox', 'backgroundsize', 'audio', 'video', 'svg', 'touch', 'csstransforms']
	})).pipe(plugins.uglify()).pipe(gulp.dest('scripts'));
});

gulp.task('sprite-png', () => {
	let spritesmith = require('gulp.spritesmith');
	let spriteData = gulp.src('_src/sprite-png/*.png').pipe(spritesmith({
		padding: 4,
		algorithm: 'binary-tree',
		imgName: 'sprite.png',
		cssName: 'sprite-png.json',
		cssTemplate: '_src/sprite-png/_spriteTemplate.hbs',
	}));
	let imgStream = spriteData.img
		.pipe(gulp.dest('images'));
	let cssStream = spriteData.css
		.pipe(gulp.dest('_src/styles/sprite-png'));
	return cssStream;
});

gulp.task('sprite-svg', () => {
	return gulp.src('_src/sprite-svg/*.svg').pipe(plugins.svgSprite({
		mode: {
			symbol: {
				dest: './',
				dimensions: '-icon',
				sprite: 'images/sprite.svg',
				render: {
					styl: {
						dest: '_src/styles/sprite-svg/sprite-svg.styl'
					}
				}
			}
		},
		svg: {
			xmlDeclaration: false,
			doctypeDeclaration: false
		}
	})).pipe(gulp.dest('./'));
});

gulp.task('imagemin', () => {
	return gulp.src('images/*').pipe(plugins.newer('images')).pipe(plugins.imagemin({
		progressive: true,
		use: [plugins.imageminPngquant()]
	})).pipe(gulp.dest('images'));
});

gulp.task('browser-sync', () => {
	return plugins.browserSync.init(['*.html', 'styles/common.min.css', '**/*.{png,jpg,svg}', 'scripts/main.js', 'scripts/common.min.js'], {
		open: false,
		server: {
			baseDir: '.'
		}
	});
});

gulp.task('default', ['browser-sync'], () => {
	gulp.watch('_src/**/*.styl', ['css']);
	gulp.watch('_src/**/*.jade', ['jade']);
	gulp.watch('_src/**/*.js', ['uglify']);
	gulp.watch('_src/sprite-png/*.png', ['sprite-png', 'css']);
	gulp.watch('_src/sprite-svg/*.svg', ['sprite-svg']);
	gulp.watch('images/**/*.{png,jpg}', ['imagemin']);
});
