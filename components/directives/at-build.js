angular.module('atDirectives')
  .directive('atBuild', [function() {
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        active: '=',
        build: '=',
        add: '&addBuild',
      },
      templateUrl: 'components/directives/at-build.html'
    }
  }]);