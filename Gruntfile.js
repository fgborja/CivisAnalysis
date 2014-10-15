module.exports = function(grunt) {
 
	// configure the tasks
	grunt.initConfig({
 
		clean: {
			build: {
				src: [ 'public/index.html' ]
			},
		},

		jade: {
			compile: {
				options: {
					data: {}
				},
				files: [{
					expand: true,
					cwd: 'views',
					src: [ 'index.jade' ],
					dest: 'public',
					ext: '.html'
				}]
			}
		},

		watch: {
			stylesheets: {
				files: 'public/**/*.css',
				//tasks: [ 'stylesheets' ]
			},
			scripts: {
				files: 'public/**/*.js',
				//tasks: [ 'scripts' ]
			},
			jade: {
				files: 'views/**/*.jade',
				tasks: [ 'jade' ]
			},
		},

		connect: {
			server: {
				options: {
					port: 4000,
					base: 'public',
					hostname: '*'
				}
			}
		}
	 
	});
 
	// load the tasks
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-jade');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-connect');

	// define the tasks
	grunt.registerTask(
		'build', 
		'Compiles all of the assets and copies the files to the build directory.', 
		[ 'clean:build', 'jade' ]
	);

	grunt.registerTask(
		'default', 
		'Watches the project for changes, automatically builds them and runs a server.', 
		[ 'build', 'connect', 'watch' ]
	);
};