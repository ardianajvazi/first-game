var SpaceShooter = {
  settings: {
    width: 1024,
    height: 1024,
    assetsDir: 'assets/'
  },
  objects: [],
  scoreCurrency: 'Points ', // Prefix for score.
  score: 0,
  lives: 10,
  lifeDudes: [],
  LightPos: [-0.5, 0, 0.5],
  update: function (time) {
    for (var i = 0; i < this.objects.length; i++)
      this.objects[i].update(time);
  },
  addScore: function (score, x, y) {
    if (players.length >= 3) {
      achievements.teamEffort += score;
      if (achievements.hasTeamEffort == false && achievements.teamEffort > 25000) {
        achievements.hasTeamEffort = true;
        for (var i = 0; i < players.length; i++) {
          var jsonData = {
            topic: 'game',
            action: 'achievementUnlock',
            data: {
              playerId: players[i].id,
              key: 'team_effort'
            }
          };
          COUCHFRIENDS.send(jsonData);
        }
      }
    }
    this.score += score;
    if (x != null && y != null) SpaceShooter.Tools.addScore(x,y,score); // Spawn text
  },
  removeLife: function() {
  // Remove life and reset everything if lives < 0
  this.lives--;
  if (this.lives < 0) {
    this.score = 0;
    this.lives = 5;
    for (var i = 0; i < this.lifeDudes.length; i++) {
      this.lifeDudes[i].visible = true;
    }
    resetAchievements();
    } else {
      this.lifeDudes[this.lives].visible = false;
    }
    this.level.reset();
  }
};

SpaceShooter.Element = function () {
    this.object = {};
    this.children = []; // Child objects
    this.name = '';
    this.tween = {};
    this.hitArea = null;
    this.collisionList = [];
    this._textureCount = 0;
    this.textures = [];
    this.textureSpeed = 3;
    this.resetAfterLastTexture = false;
    this.texturesNormals = [];
    this.tint = null;
    this.size = { width: 0, height: 0}
};

SpaceShooter.Element.prototype = {
  init: function (textures) {
    if (textures == null) {
      for (var i = 0; i < this.textures.length; i++) {
        this.textures[i] = PIXI.Texture.fromImage(SpaceShooter.settings.assetsDir + this.textures[i]);
      }
    } else {
      this.textures = textures;
    }
    this.object = new PIXI.Sprite(this.textures[0]);
    this.object.anchor.x = 0.5;
    this.object.anchor.y = 0.5;
    if (this.hitArea != null) {
      this.object.hitArea = this.hitArea;
    }
    if (this.size.width == 0) {
      this.size.width = this.object.width;
    }
    if (this.size.height == 0) {
      this.size.height = this.object.height;
    }
    if (this.tint != null) {
      this.object.tint = this.tint;
    }
  },
  reset: function() {},
  add: function () {
    SpaceShooter.objects.push(this);
    if (this.object != null) {
      stage.addChild(this.object);
    }
  },
  addChild: function (element) {
    this.children.push(element);
  },
  remove: function () {
    if (this.object != null) stage.removeChild(this.object);
    if (this.tween != null) TWEEN.remove(this.tween);
    var indexOf = SpaceShooter.objects.indexOf(this);
    SpaceShooter.objects.splice(indexOf, 1);
    this.onRemove();
  },
  onRemove: function() {},
  update: function (time) {
    if (this.object.visible == false) return false;
    for (var i = 0; i < this.children.length; i++)
      this.children[i].update();
    if (this.textures.length > 1 && time%this.textureSpeed<1) {
      this._textureCount++;
      if (this._textureCount >= this.textures.length) {
        this._textureCount = 0;
        if (this.resetAfterLastTexture == true) this.reset();
      }
      this.object.texture = this.textures[this._textureCount];
    }
    var collisionObject = this.checkCollision();
    if (collisionObject != false) {
      this.collision(collisionObject);
      this.reset();
    }
  },
  checkCollision: function () {
    if (this.collisionList.length == 0) return false;
    for (var i = 0; i < SpaceShooter.objects.length; i++) {
      var object = SpaceShooter.objects[i];
      if (object.name == '' || this.collisionList.indexOf(object.name) < 0) continue;
      if (object.object.hitArea != null) {
        var minX = this.object.position.x - (object.object.position.x - (this.object.width / 2));
        var minY = this.object.position.y - (object.object.position.y - (this.object.height / 2));
        var maxX = this.object.position.x - (object.object.position.x + (this.object.width / 2));
        var maxY = this.object.position.y - (object.object.position.y + (this.object.height / 2));
        if (object.object.hitArea.contains(minX, minY) || object.object.hitArea.contains(minX, maxY) || object.object.hitArea.contains(maxX, minY) || object.object.hitArea.contains(maxX, maxY)) return object
        var x = this.object.position.x - (object.object.position.x - (object.size.width / 2));
        var y = this.object.position.y - (object.object.position.y - (object.size.height / 2));
        if (object.object.hitArea.contains(x, y)) return object;
      } else {
        var xdist = object.object.position.x - this.object.position.x;
        if (xdist > -(object.object.width+this.object.width) / 2 && xdist < (object.object.width+this.object.width) / 2) {
          var ydist = object.object.position.y - this.object.position.y;
          if (ydist > -(object.object.height+this.object.height) / 2 && ydist < (object.object.height+this.object.height) / 2) return object;
        }
      }
    }
    return false;
  },
  collision: function (target) {},
  destroy: function () {
    this.remove();
  }
};
