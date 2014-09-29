describe('dsLocalForageAdapter#destroy', function () {
  it('should destroy a user from localStorage', function (done) {
    var id;
    dsLocalForageAdapter.create(User, { name: 'John' })
      .then(function (user) {
        id = user.id;
        return dsLocalForageAdapter.destroy(User, user.id);
      })
      .then(function (user) {
        assert.isFalse(!!user);
        return dsLocalForageAdapter.find(User, id);
      })
      .then(function () {
        done('Should not have reached here!');
      })
      .catch(function (err) {
        assert.equal(err.message, 'Not Found!');
        done();
      });
  });
});
