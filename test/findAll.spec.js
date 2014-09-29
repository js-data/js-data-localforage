describe('dsLocalForageAdapter#findAll', function () {
  it('should filter users', function (done) {
    var id;

    dsLocalForageAdapter.findAll(User, {
      age: 30
    }).then(function (users) {
      assert.equal(users.length, 0);
      return dsLocalForageAdapter.create(User, { name: 'John' });
    }).then(function (user) {
      id = user.id;
      return dsLocalForageAdapter.findAll(User, {
        name: 'John'
      });
    }).then(function (users) {
      assert.equal(users.length, 1);
      assert.deepEqual(users[0], { id: id, name: 'John' });
      return dsLocalForageAdapter.destroy(User, id);
    }).then(function (destroyedUser) {
      assert.isFalse(!!destroyedUser);
      done();
    }).catch(done);
  });
});
