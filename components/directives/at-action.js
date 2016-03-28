angular.module('atDirectives')
  .directive('atAction', [function() {
    return {
      restrict: 'E',
      transclude: true,
      scope: {
        active: '=',
        action: '=',
        add: '&addAction',
      },
      templateUrl: 'components/directives/at-action.html'
    }
  }]);