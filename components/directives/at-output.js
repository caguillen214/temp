angular.module('atDirectives')
  .directive('atOutput', [function() {
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        active: '=',
        output: '=',
        add: '&addOutput',
      },
      templateUrl: 'components/directives/at-output.html'
    }
  }]);