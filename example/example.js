(function () {
  var adapter = new DSLocalForageAdapter();

  var store = new JSData.DS();
  store.registerAdapter('localforage', adapter, { default: true });

  var User = store.defineResource('user');

  angular.module('localforage-example', [])
    .controller('localforageCtrl', function ($scope, $timeout) {
      $scope.add = function (user) {
        $scope.creating = true;
        User.create(user).then(function () {
          $scope.creating = false;
          $timeout();
        }, function () {
          $scope.creating = false;
        });
      };
      $scope.remove = function (user) {
        $scope.destroying = user.id;
        User.destroy(user.id).then(function () {
          delete $scope.destroying;
          $timeout();
        }, function () {
          delete $scope.destroying;
        });
      };
      $scope.$watch(function () {
        return User.lastModified();
      }, function () {
        $scope.users = User.filter();
      });
    });
})();
