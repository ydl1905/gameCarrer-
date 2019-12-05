
cc.Class({
    extends: cc.Component,

    properties: {
        startBtn: cc.Button,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    clickStartBtnCb()
    {
        cc.log("kkkkkkkk")
        cc.director.loadScene("gameScene");
    },

    // update (dt) {},
});
