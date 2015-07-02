describe('dsLocalForageAdapter#find', function () {
  it('should find a user in localForage', function () {
    var id;
    return dsLocalForageAdapter.create(User, { name: 'John' })
      .then(function (user) {
        id = user.id;
        assert.equal(user.name, 'John');
        assert.isString(user.id);
        return dsLocalForageAdapter.find(User, user.id);
      })
      .then(function (user) {
        assert.equal(user.name, 'John');
        assert.isString(user.id);
        assert.deepEqual(user, { id: id, name: 'John' });
        return dsLocalForageAdapter.destroy(User, id);
      })
      .then(function (user) {
        assert.isFalse(!!user);
        return dsLocalForageAdapter.find(User, id);
      })
      .then(function () {
        throw new Error('Should not have reached here!');
      })
      .catch(function (err) {
        assert.equal(err.message, 'Not Found!');
      });
  });
});
