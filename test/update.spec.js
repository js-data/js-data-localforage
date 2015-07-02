describe('dsLocalForageAdapter#update', function () {
  it('should update a user in localForage', function () {
    var id;
    return dsLocalForageAdapter.create(User, { name: 'John' })
      .then(function (user) {
        id = user.id;
        assert.equal(user.name, 'John');
        assert.isString(user.id);
        return dsLocalForageAdapter.find(User, user.id);
      })
      .then(function (foundUser) {
        assert.equal(foundUser.name, 'John');
        assert.isString(foundUser.id);
        assert.deepEqual(foundUser, { id: id, name: 'John' });
        return dsLocalForageAdapter.update(User, foundUser.id, { name: 'Johnny' });
      })
      .then(function (updatedUser) {
        assert.equal(updatedUser.name, 'Johnny');
        assert.isString(updatedUser.id);
        assert.deepEqual(updatedUser, { id: id, name: 'Johnny' });
        return dsLocalForageAdapter.find(User, updatedUser.id);
      })
      .then(function (foundUser) {
        assert.equal(foundUser.name, 'Johnny');
        assert.isString(foundUser.id);
        assert.deepEqual(foundUser, { id: id, name: 'Johnny' });
        return dsLocalForageAdapter.destroy(User, foundUser.id);
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
