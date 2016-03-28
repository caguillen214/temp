angular.module('atDirectives')
  .directive('atInput', [function() {
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        active: '=',
        input: '=',
        add: '&addInput',
      },
      templateUrl: 'components/directives/at-input.html'
    }
  }]);