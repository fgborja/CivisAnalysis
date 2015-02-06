module.exports = function(grunt) {
 
	// configure the tasks
	grunt.initConfig({

		// Project settings
	    config: {
	        // Configurable paths
	        app: 'public'
	    },
 
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
			livereload: {
	            options: {
	                livereload: '<%= connect.options.livereload %>'
	            },
	            files: [
	                '<%= config.app %>/{,*/}*.html',
	                '<%= config.app %>/stylesheets/{,*/}*.css',
	                '<%= config.app %>/javascripts/**/*.js'
	            ]
	        },
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
			index: {
				files: 'public/*.html',
			},
		},

		// The actual grunt server settings
	    connect: {
	        options: {
	            port: 9000,
	            livereload: 35729,
	            hostname: 'localhost'
	        },
	        livereload: {
	            options: {
	                open: true,
	                base: [
	                    '.tmp',
	                    '<%= config.app %>'
	                ]
	            }
	        },
	    },
	 
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

	grunt.registerTask('serve', function (target) {
    grunt.task.run([
        'connect:livereload',
        'watch'
        ]);
    });

};