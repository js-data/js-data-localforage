(function () {
  angular.module('localforage-example', [])
    .factory('store', function () {
      var store = new JSData.DS();
      store.registerAdapter('localforage', new DSLocalForageAdapter(), { default: true });
      return store;
    })
    .factory('User', function (store) {
      return store.defineResource('user');
    })
    .controller('localforageCtrl', function ($scope, $timeout, User) {
      var lfCtrl = this;

      User.findAll().then(function () {
        $scope.$apply();
      });

      $scope.add = function (user) {
        $scope.creating = true;
        User.create(user).then(function () {
          $scope.creating = false;
          lfCtrl.name = '';
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
