module.exports = function(grunt) {
  "use strict";
  
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    licence: grunt.file.read("LICENSE"),
 
    uglify: {
      options: {
        banner: "/*\n<%= pkg.name %> v<%= pkg.version %> \n\n<%= licence %>*/\n",
        preserveComments: "some"
      },
      build: {
        src: [
          "src/tgame.js",
          "src/tgame.*.js"
        ],
        dest: "build/<%= pkg.name %>.min.js"
      }
    },
    jshint: {
      options: {
        eqeqeq: true,
        undef: true,
        unused: true,
        strict: true,
        indent: 2,
        immed: true,
        latedef: "nofunc",
        newcap: true,
        nonew: true,
        trailing: true,
        globals: {
          tgame: true
        }
      },
      grunt: {
        options: {
          node: true
        },
        src: "Gruntfile.js"
      },
      src: {
        options: {
          browser: true
        },
        src: "src/*.js",
      },
    }
  });

  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-contrib-uglify");

  grunt.registerTask("lint", ["jshint"]);

  grunt.registerTask("default", ["jshint", "uglify"]);
};