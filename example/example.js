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
    .controller('localforageCtrl', function ($scope, User) {
      var lfCtrl = this;

      User.findAll().then(function (users) {
        $scope.users = users;
        $scope.$apply();
      });

      $scope.add = function (user) {
        User.create(user).then(function () {
          lfCtrl.name = '';
          $scope.$apply();
        });
      };

      $scope.remove = function (user) {
        User.destroy(user.id).then(function () {
          $scope.$apply();
        });
      };
    });
})();
