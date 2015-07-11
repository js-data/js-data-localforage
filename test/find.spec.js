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
  it('should find a user with relations', function () {
    var id, id2, _user, _post, _comments;
    return dsLocalForageAdapter.create(User, {name: 'John'})
      .then(function (user) {
        _user = user;
        id = user.id;
        assert.equal(user.name, 'John');
        assert.isDefined(user.id);
        return dsLocalForageAdapter.find(User, user.id);
      })
      .then(function (user) {
        assert.equal(user.name, 'John');
        assert.isDefined(user.id);
        assert.equalObjects(user, {id: id, name: 'John'});
        return dsLocalForageAdapter.create(Post, {
          content: 'test',
          userId: user.id
        });
      })
      .then(function (post) {
        _post = post;
        id2 = post.id;
        assert.equal(post.content, 'test');
        assert.isDefined(post.id);
        assert.isDefined(post.userId);
        return Promise.all([
          dsLocalForageAdapter.create(Comment, {
            content: 'test2',
            postId: post.id,
            userId: _user.id
          }),
          dsLocalForageAdapter.create(Comment, {
            content: 'test3',
            postId: post.id,
            userId: _user.id
          })
        ]);
      })
      .then(function (comments) {
        _comments = comments;
        _comments.sort(function (a, b) {
          return a.content > b.content;
        });
        return dsLocalForageAdapter.find(Post, _post.id, {'with': ['user', 'comment']});
      })
      .then(function (post) {
        post.comments.sort(function (a, b) {
          return a.content > b.content;
        });
        assert.equalObjects(post.user, _user, 'post.user should equal _user');
        assert.equalObjects(post.comments, _comments, 'post.comments should equal _comments');
        return dsLocalForageAdapter.destroyAll(Comment);
      })
      .then(function () {
        return dsLocalForageAdapter.destroy(Post, id2);
      })
      .then(function () {
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
