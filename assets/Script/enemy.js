
cc.Class({
    extends: cc.Component,

    properties: {
        spArrays: [cc.SpriteFrame],
        sp: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        
    },
    setInitData()
    {
        //随机生成敌方的飞机
        var index = this.suiji(0, 3);
        this.sp.getComponent(cc.Sprite).spriteFrame = this.spArrays[index]
    },
    getSize()
    {
        return this.sp.getContentSize()
    },
    suiji(lower, upper) {
        return Math.floor(Math.random() * (upper - lower)) + lower;
    }
   

    // update (dt) {},
});
