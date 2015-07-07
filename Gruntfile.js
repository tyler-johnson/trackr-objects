module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		clean: [ "dist/" ],
		browserify: {
			dist: {
				src: "index.js",
				dest: "dist/trackr-objects.js",
				options: {
					external: [ "trackr" ],
					browserifyOptions: { standalone: "track" }
				}
			}
		},
		concat: {
			dist: {
				files: [{
					expand: true,
					cwd: "dist/",
					src: [ "*.js" ],
					dest: "dist/",
					isFile: true
				}],
				options: {
					banner: "/*\n * Trackr Objects\n * (c) 2015 Tyler Johnson\n * MIT License\n * Version <%= pkg.version %>\n */\n"
				}
			}
		},
		uglify: {
			dist: {
				src: "dist/trackr-objects.js",
				dest: "dist/trackr-objects.min.js"
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');

	grunt.registerTask('default', [ 'clean', 'browserify', 'uglify', 'concat' ]);
}
