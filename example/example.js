(function () {
  angular.module('localforage-example', ['js-data'])
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
      });

      User.bindAll({}, $scope, 'users');

      $scope.add = function (user) {
        return User.create(user).then(function () {
          lfCtrl.name = '';
        });
      };

      $scope.remove = function (user) {
        return User.destroy(user.id);
      };
    });
})();
