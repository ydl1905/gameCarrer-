
cc.Class({
    extends: cc.Component,

    properties: {
        closeBtn: cc.Button,
        bg1:cc.Node,
        bg2:cc.Node,
        myplane: cc.Node,
        bullet: cc.Prefab,
        enemy: cc.Prefab,
        showNode: cc.Node,
        score: cc.Label,
        pauseBtnLabel: cc.Label,
        gameOverNode: cc.Node,
        exitGameBtn: cc.Button,
        historyScoreLabel: cc.Label,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.bulletArray = [];
        this.enemyArray = [];
        this.moveSpeed = 5;
        this.bulletInitTimes = 0.5
        this.enemyInitTimes = 2
        this.bulletSpeed = 3;
        this.scoreNum = 0
        this.gameState = "on"
        this.enemyMoveSpeed = 5
    },

    start () {
        this.initBg()
    },
    initBg()
    {
        this.bgSize = this.bg1.getContentSize().height;
        
        this.bg2.y = this.bg1.y + this.bgSize;
        //加载一个滚动的背景（无限循环）
        this.schedule(this.updateBg, 1/60);
        //添加触摸层用来移动飞机
        this.addTouchEvent();
        //加载子弹
        this.initBullet();
        //加载敌人
        this.initEnemy();
    },

     updateBg() {
        this.bg1.y = this.bg1.y - this.moveSpeed;
        this.bg2.y = this.bg2.y - this.moveSpeed;

        if(this.bg1.y <= -this.bgSize)
        {
            this.bg1.y = 0
        }
        if(this.bg2.y <= 0)
        {
            this.bg2.y = this.bg1.y + this.bgSize;
        }
        //子弹向上
        this.bulletArray.forEach(element => {
            if (element.y < this.bgSize)
            {
                element.y = element.y + this.bulletSpeed
            }
            else
            {
                //超出屏幕的子弹直接移除
                var index = this.bulletArray.indexOf(element)
                this.bulletArray.splice(index, 1)
                element.removeFromParent()
            }
        });
        //敌机向下
        this.enemyArray.forEach(element => {
            if(element.y > - element.sizes.height / 2)
            {
                element.y = element.y - this.enemyMoveSpeed
            }
            else
            {
                //出屏幕的敌人直接移除
                var index = this.enemyArray.indexOf(element)
                this.enemyArray.splice(index, 1)
                element.removeFromParent()
            }
        });
        this.checkCollsion()
    },
    addTouchEvent()
    {

        this.planePos = this.myplane.getPosition()
        this.myplane.on("touchmove", function (event) {
            var self = this
            var touches = event.getTouches();
            //触摸刚开始的位置
            var oldPos = self.myplane.convertToNodeSpaceAR(touches[0].getStartLocation());
            //触摸时不断变更的位置
            var newPos = self.myplane.convertToNodeSpaceAR(touches[0].getLocation());

            var subPos = oldPos.sub(newPos); // 2.X版本是 p1.sub(p2);
 
            self.myplane.x = self.planePos.x - subPos.x;
            self.myplane.y = self.planePos.y - subPos.y;

            //还有一个如何防止其滑动离开屏幕(注意锚点是0，0)
            var minX = self.myplane.width/2; //最小X坐标；
            var maxX = self.bg1.getContentSize().width - self.myplane.width/2;
            var minY = self.myplane.height/2; //最小Y坐标；
            var maxY =self.bg1.getContentSize().height - self.myplane.height/2
            var nPos = self.myplane.getPosition(); //节点实时坐标；
     
            if (nPos.x < minX) {
                nPos.x = minX;
            };
            if (nPos.x > maxX) {
                nPos.x = maxX;
            };
            if (nPos.y < minY) {
                nPos.y = minY;
            };
            if (nPos.y > maxY) {
                nPos.y = maxY;
            };
            self.myplane.setPosition(nPos);

        },this)
        this.myplane.on("touchend", function (event) {
            this.planePos = this.myplane.getPosition()
        },this)
        this.myplane.on("touchcancel", function (event) {
            this.planePos = this.myplane.getPosition()
        },this)
    },
    closeCurrentScene()
    {
        cc.director.loadScene("MainScene");
    },

    initBullet()
    {
        this.schedule(this.initBulletItem, this.bulletInitTimes)
    },

    initBulletItem()
    {
        this.bulletSize = cc.size(6, 14)
        var bullet = cc.instantiate(this.bullet);
        bullet.x = this.myplane.x;
        bullet.y = this.myplane.y + this.myplane.height / 2;
        this.showNode.addChild(bullet)
        this.bulletArray.push(bullet)
    },

    initEnemy()
    {
        this.schedule(this.initEnemyItems, this.enemyInitTimes)
    },
    suiji(lower, upper) {
        return Math.floor(Math.random() * (upper - lower)) + lower;
    },
    initEnemyItems()
    {
        var enemy = cc.instantiate(this.enemy)
        enemy.getComponent("enemy").setInitData()
        var enemySize = enemy.getComponent("enemy").getSize()
        var minX = enemySize.width / 2 
        var maxX = this.bg1.getContentSize().width - enemySize.width / 2 
        enemy.x = this.suiji(minX, maxX)
        var minY = enemySize.height + 200
        var maxY = this.bg1.getContentSize().height + enemySize.height / 2 
        enemy.y = maxY
        enemy.sizes = enemySize
        this.showNode.addChild(enemy)
        this.enemyArray.push(enemy)
    },

    checkIsCollison(point, enemy)
    {
        var rect1 = new cc.Rect(enemy.x - enemy.sizes.width / 2, enemy.y - enemy.sizes.height / 2, enemy.sizes.width, enemy.sizes.height)
        // var rect2 = new cc.Rect(bullet.x, bullet.y, this.bulletSize.width, this.bulletSize.height)
        //    if(rect1.intersects(rect2) || rect1.containsRect(rect2))
        if (rect1.contains(point)) //利用点和
        {
            return true
        }
        return false
    },

    checkCollsion2(node1, enemy)
    {
        var pos =  this.showNode.convertToNodeSpaceAR(cc.v2(node1.x, node1.y))
        var rect1 = new cc.Rect(enemy.x, enemy.y, enemy.sizes.width, enemy.sizes.height)
        var rect2 = new cc.Rect(pos.x, pos.y, node1.width, node1.height)
        if(rect1.intersects(rect2))
        {
            return true
        }
        return false
    },

    checkCollsion(){
        //检测游戏是否结束
        this.checkGameOver()
        this.bulletArray.forEach(bullet => {
            for(var i = 0;i< this.enemyArray.length; i++)
            {
                var enemy = this.enemyArray[i]
                var state = this.checkIsCollison(cc.v2(bullet.x, bullet.y), enemy)
                if(state)
                {
                    bullet.removeFromParent()
                    this.enemyArray.splice(i, 1)
                    //同时从数组中移除
                    enemy.removeFromParent()
                    var index = this.bulletArray.indexOf(bullet)
                    this.bulletArray.splice(index, 1)
                    this.scoreNum = this.scoreNum + 1
                    this.score.string = this.scoreNum
                }
            }
        });
    },
    pauseGame()
    {
        //暂停游戏
        if(this.gameState == "on")
        {
            cc.director.pause()
            this.gameState = "pause"
            this.pauseBtnLabel.string = "继续"
        }
        else if (this.gameState == "pause")
        {
            cc.director.resume()
            this.gameState = "on"
            this.pauseBtnLabel.string = "暂停"
        }
    },
    exitGameCb()
    {
        cc.director.loadScene("MainScene");
        // cc.director.end();
    },
    checkGameOver()
    {
        this.enemyArray.forEach(enemy => {
            var isEnd = this.checkCollsion2(this.myplane, enemy)
            if (isEnd)
            {
                this.unschedule(this.updateBg)
                this.unschedule(this.initEnemyItems)
                this.unschedule(this.initBulletItem)
                //停止定时器
                this.gameOverNode.active = true

                var value = cc.sys.localStorage.getItem("history")
                if(this.scoreNum > parseInt(value))
                {
                    cc.sys.localStorage.setItem("history", this.scoreNum)
                }
                this.historyScoreLabel.string = cc.sys.localStorage.getItem("history")
                return
            }
        });
    },
    onDestroy()
    {
        this.updateBg && this.unschedule(this.updateBg)
        this.initEnemyItems && this.unschedule(this.initEnemyItems)
        this.initEnemyItems && this.unschedule(this.initBulletItem)
    },
    addLevel()
    {
        if(this.enemyMoveSpeed > 15)
        {
            this.enemyMoveSpeed = 15
        }else{
            this.enemyMoveSpeed = this.enemyMoveSpeed + 1
        }
    },
    jianLevel()
    {
        if(this.enemyMoveSpeed < 5)
        {
            this.enemyMoveSpeed = 5
        }else{
            this.enemyMoveSpeed = this.enemyMoveSpeed - 1
        }
    }



    // update (dt) {
    // },
});
