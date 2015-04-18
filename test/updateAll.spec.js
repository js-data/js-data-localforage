describe('dsLocalForageAdapter#updateAll', function () {
  it('should update all items', function () {
    var id;
    return dsLocalForageAdapter.create(User, { name: 'John' })
      .then(function (user) {
        id = user.id;
        return dsLocalForageAdapter.findAll(User, {
          name: 'John'
        });
      }).then(function (users) {
        assert.equal(users.length, 1);
        assert.deepEqual(users[0], { id: id, name: 'John' });
        return dsLocalForageAdapter.updateAll(User, {
          name: 'Johnny'
        }, {
          name: 'John'
        });
      }).then(function (users) {
        assert.equal(users.length, 1);
        assert.deepEqual(users[0], { id: id, name: 'Johnny' });
        return dsLocalForageAdapter.findAll(User, {
          name: 'John'
        });
      }).then(function (users) {
        assert.equal(users.length, 0);
        return dsLocalForageAdapter.findAll(User, {
          name: 'Johnny'
        });
      }).then(function (users) {
        assert.equal(users.length, 1);
        assert.deepEqual(users[0], { id: id, name: 'Johnny' });
        return dsLocalForageAdapter.destroy(User, id);
      }).then(function (destroyedUser) {
        assert.isFalse(!!destroyedUser);
      });
  });
});
