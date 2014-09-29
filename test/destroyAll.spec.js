describe('dsLocalForageAdapter#destroyAll', function () {
  it('should destroy all items', function (done) {
    var id;
    dsLocalForageAdapter.create(User, { name: 'John' })
      .then(function (user) {
        id = user.id;
        return dsLocalForageAdapter.findAll(User, {
          name: 'John'
        });
      }).then(function (users) {
        assert.equal(users.length, 1);
        assert.deepEqual(users[0], { id: id, name: 'John' });
        return dsLocalForageAdapter.destroyAll(User, {
          name: 'John'
        });
      }).then(function () {
        return dsLocalForageAdapter.findAll(User, {
          name: 'John'
        });
      }).then(function (users) {
        assert.equal(users.length, 0);
        done();
      }).catch(done);
  });
});
