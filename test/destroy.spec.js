describe('dsLocalForageAdapter#destroy', function () {
  it('should destroy a user from localForage', function () {
    var id;
    return dsLocalForageAdapter.create(User, { name: 'John' })
      .then(function (user) {
        id = user.id;
        return dsLocalForageAdapter.destroy(User, user.id);
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
