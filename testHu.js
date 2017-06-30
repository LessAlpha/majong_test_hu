/**
 * 测试是否胡牌
 * @param data1         牌型数组，元素为牌型ID
 * @param naiziNum      赖子个数
 * @param isFour
 * @returns {boolean}   胡牌检测结果
 */
var ishuLastNew = function (data1,naiziNum,isFour) {

    var zuhe = {};        //{ '0': [ [ 1, 1, 1 ], [ 5, 6, 7 ], [ 21, 22, 23 ] ] }
    var shengxia = [];    //剩下的牌
    var lianxu = {};      //连续的牌

    /**
     * 分解成顺子和刻子
     * @param data
     * @param tag
     */
    function decompose(data, tag) {
        data.sort();
        // 刻子
        if (data.length >= 2) {
            var paiNum = data[0];
            if (paiNum == data[1] && paiNum == data[2]) {// 如果前3个牌都一样，可以组成一个刻子
                if (!zuhe[tag]) {
                    zuhe[tag] = [];
                }
                zuhe[tag].push(paiNum);
                zuhe[tag].push(data[1]);
                zuhe[tag].push(data[2]);
                // 去掉刻字，递归自己
                data.splice(0, 3);
                decompose(data, tag);
            }
        }

        for (var i = 0; i < data.length - 2 && data[i] < 60; ++i) {
            var first = data[i];
            var secondIndex = data.indexOf(first + 1);
            var thirdIndex = data.indexOf(first + 2);
            if (secondIndex != -1 && thirdIndex != -1) {// 能组成一个顺子
                if (!zuhe[tag]) {
                    zuhe[tag] = [];
                }
                // 因为数组长度一直在变 所有写成下面这样
                zuhe[tag].push((data.splice(data.indexOf(first), 1))[0]);
                zuhe[tag].push((data.splice(data.indexOf(first + 1), 1))[0]);
                zuhe[tag].push((data.splice(data.indexOf(first + 2), 1))[0]);
                decompose(data, tag);
            }
        }
    }/////////////////////////////////////////////////////////////////////////////////////////////////////// 分解成顺子和刻子

    /**
     * 分解成连续的牌  类似 5 6  1 3  12 89  字牌   61 61
     * @param data
     * @param tag
     */
    function decomposeTwos(data, tag) {
        data.sort();
        if(data.length >= 1){
            var paiNum = data[0];
            if (paiNum == data[1]) {
                if (!lianxu[tag]) lianxu[tag] = [];
                lianxu[tag].push([data[0],data[1]]);
                //去掉刻字 递归自己
                data.splice(0, 2);
                decomposeTwos(data, tag);
            }
        }

        for (var i = 0; i < data.length - 2 && data[i] < 60; i++) {

            var first = data[i];
            var secondIndex = data.indexOf(first + 1);
            var thirdIndex = data.indexOf(first + 2);
            if (secondIndex != -1) {
                if (!lianxu[tag]) {
                    lianxu[tag] = [];
                }
                lianxu[tag].push([first,first+1]);
                data.splice(data.indexOf(first), 1);
                data.splice(data.indexOf(first + 1), 1);
                decomposeTwos(data, tag);
            }

            if(thirdIndex != -1){
                if (!lianxu[tag]) {
                    lianxu[tag] = [];
                }
                //因为数组长度一直在变 所有写成下面这样
                data.splice(data.indexOf(first), 1);
                data.splice(data.indexOf(first + 2), 1);
                lianxu[tag].push([first,first+2]);
                decomposeTwos(data, tag);
            }

        }
    }////////////////////////////////////////////////////////////////////////分解成连续的牌  类似5 6  1 3  12 89  字牌   61 61

    data1.sort();
    //从0开始不断的截断数组,分左右, 依次去组合  然后把左右剩下的合到一起
    for (var i = 0; i < data1.length; i++) {
        var cloneData = data1.concat();
        var right = cloneData.splice(i);
        var left = cloneData;
        decompose(right, i);
        decompose(left, i);
        var rightOrLeft = right.concat(left).sort(function (a, b) {
            return a - b
        });
        shengxia.push(rightOrLeft);
        decomposeTwos(rightOrLeft, i);
    }

    console.log('剩下的数据为=============',shengxia);
    console.log('分解出的数据为===========',zuhe);
    console.log("连续的数据为=============",lianxu);
    var result = false;
    if(naiziNum == 0){
        for (var i = 0; i < shengxia.length; i++) {
            if (isFour) {
                if (shengxia[i].length == 0 && !lianxu[i]) {
                    result = true;
                    console.log('胡牌所有结合为:',zuhe[i].concat(lianxu[i],shengxia[i]));
                    break;
                }
            } else {
                if ((typeof shengxia[i]) == 'object' && shengxia[i].length == 2 && shengxia[i][0] == shengxia[i][1] && !lianxu[i]) {
                    result = true;
                    console.log('胡牌所有结合为:',zuhe[i].concat(lianxu[i],shengxia[i]));
                    break;
                }
            }

        }
    }else if(naiziNum <= 4){
        for (var i in zuhe) {
            i = parseInt(i);
            if(!lianxu[i]){
                lianxu[i] = [];
            }
            if (isFour) {
                //已经有将了,直接判断剩下的牌*2 + 连续的牌 <= 剩余赖子数量
                if(shengxia[i].length * 2 +  lianxu[i].length <= naiziNum){
                    result = true;
                    console.log('胡牌所有结合为:',zuhe[i].concat(lianxu[i],shengxia[i]));
                    break;
                }
            } else {
                //先尽量从连续的牌中找出一对做将,如果找不到则尽量从剩下的牌中随便找一个牌和一个赖子做将,实在不行用两个赖子做将,然后判断剩下的牌*2 + 连续的牌 <= 剩余赖子数量
                var index = false;
                for(var j = 0;j<lianxu[i].length;j++){

                    if(lianxu[i][j][0] == lianxu[i][j][1]  && (shengxia[i].length * 2 + lianxu[i].length - 1) <= naiziNum){//连续中有两个做将 要减1
                        index = true;
                        result = true;
                        console.log('胡牌所有结合为:',zuhe[i].concat(lianxu[i],shengxia[i]));
                        break;
                    }
                }
                if(index)break;

                if(shengxia[i].length != 0 && ((shengxia[i].length-1) * 2 + lianxu[i].length) <= naiziNum){
                    result = true;
                    console.log('胡牌所有结合为:',zuhe[i].concat(lianxu[i],shengxia[i]));
                    break;
                }

                if(shengxia[i].length * 2 + lianxu[i].length + 2 <= naiziNum){
                    result = true;
                    console.log('胡牌所有结合为:',zuhe[i].concat(lianxu[i],shengxia[i]));
                    break;
                }
            }
        }

    } else {
        console.warn('参数错误');
    }

    return result;
};

var findFourEqual = function (data2,naiziNum) {
    data2.sort();
    var index = [];
    var result = false;
    for (var i = 0; i < data2.length - 4; i++) {
        if (data2[i] == data2[i + 3]) {
            index.push(data2[i]);
        }
    }

    for (var i = 0; i < index.length; i++) {
        data2.splice(data2.indexOf(index[i]), 2);
        if (ishuLastNew(data2,naiziNum,true)) {
            result = true;
            break;
        } else {
            data2.push(index[i]);
            data2.push(index[i]);
            data2.sort();
        }
    }
    return result;
};

(function() {
    var res = [21,22,23, 25,25,26, 1,1,1, 1,2,3, 41,41];

    console.info("接收的数据为", res);

    var naiziNum = 0;
    var naizi =  26;

    // 找出赖子并去掉
    for(var i = 0;i<res.length;i++){
        if(naizi == res[i]){
            res.splice(i,1);
            naiziNum++;
            i--;
        }
    }
    res.sort();

    console.info("赖子牌型 / 赖子个数 / 去掉赖子后的数据为:", naizi, naiziNum , '/', res);

    var cpDate = [].concat(res);
    var cpDate1 = [].concat(res);
    var result = ishuLastNew(cpDate,naiziNum,false);
    console.info('检测结果 ： ', result);
    if(!result && !findFourEqual(cpDate1)) {
        console.info("不能胡牌");
    }  else {
        console.info('可以胡牌')
    }
}());

//(function(){
//    var i = 0;
//    function f1(){
//        console.info('before',i);
//        var j = i;
//        if(i<2) {
//            i++;
//            f1();
//        }
//        console.warn('after ', j, i);
//    }
//    f1();
//}());