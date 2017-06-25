function mapper(src, dest, keyList) {
    for (let key of keyList ? keyList : Object.getOwnPropertyNames(src))
        dest[key] = src[key];
}
function range(from, to, step) {
    if (to === void 0 && step === void 0) {
        to = from;
        from = 0;
    } else {
    }
    if (step === void 0) step = from < to ? 1 : -1;
    let list = [];
    if (step > 0) for (let idx = from; idx < to; idx += step) list.push(idx);
    else for (let idx = from; idx > to; idx += step) list.push(idx);
    return list;
}

let $MyResizableDirective = function () {
    let link = function (scope, elements, attr, ctrl) {
        // elem、s、pは、このlink function内で使いまわすので、このレイヤーで宣言しておく。
        // そうすることで、このfunctionの中で定義したfunction（let mousemove、let mouseup、let mousedown）の中でも、これらの変数が使えるようになる。
        // 対象エレメント
        let elem;
        let div = null;
        elem = elements[0];
        if (elements[0].tagName === "IFRAME") {
            div = document.createElement("div");
            elem = elements[0];
            div.style.margin = 0;
            div.style.padding = 0;
            div.style.border = 0;
            div.style.width = elem.offsetWidth + "px";
            div.style.height = elem.offsetHeight + "px";
            mapper(document.defaultView.getComputedStyle(elem), div.style,
                ["marginTop", "marginRight", "marginBottom", "marginLeft"]);
            elem.parentNode.replaceChild(div, elem);
            elem.style.boxSizing = "border-box";
            elem.style.margin = 0;
            div.appendChild(elements[0]);
            elem.style.width = "100%";
            elem.style.height = "100%";
        } else {
            div = elem;
        }

        //// ちょっと面倒なリサイズ用エレメント作成部
        // 対象エレメントはposition：relativeにし、リサイズ用の枠エレメントをabosoluteで右端下端右下端に配置する
        div.style.position = "relative";
        // 右端下端のボーダー太さを取得しておく。
        let rightBorderWeight = elem.offsetWidth - elem.clientWidth - elem.clientLeft;
        let bottomBorderWeight = elem.offsetHeight - elem.clientHeight - elem.clientTop;
        // 横幅リサイズ用エレメント
        let v0 = document.createElement("div");
        v0.classList.add("my-resize-border");
        v0.style.position = "absolute";
        v0.style.top = -div.clientTop + "px";
        v0.style.height = elem.offsetHeight + "px";
        div.appendChild(v0);
        v0.style.width = Math.max(v0.clientWidth, rightBorderWeight, 10) + "px"; // 再細でも10pxにしておく
        v0.style.left = (-div.clientLeft + elem.offsetWidth - (v0.clientWidth + rightBorderWeight) / 2) + "px";

        // 縦幅リサイズ用エレメント
        let h0 = document.createElement("div");
        h0.classList.add("my-resize-border");
        h0.style.position = "absolute";
        h0.style.left = -div.clientLeft + "px";
        h0.style.width = elem.offsetWidth + "px";
        div.appendChild(h0);
        h0.style.height = Math.max(h0.clientHeight, bottomBorderWeight, 10) + "px"; // 再細でも10pxにしておく
        h0.style.top = (-div.clientTop + elem.offsetHeight - (h0.clientHeight + bottomBorderWeight) / 2) + "px";

        // 縦横幅リサイズ用エレメント
        let vh = document.createElement("div");
        vh.classList.add("my-resize-border");
        vh.style.position = "absolute";
        vh.style.height = h0.clientHeight + "px";
        vh.style.width = v0.clientWidth + "px";
        vh.style.top = (-div.clientTop + elem.offsetHeight - (bottomBorderWeight + h0.clientHeight) / 2) + "px";
        vh.style.left = (-div.clientLeft + elem.offsetWidth - (rightBorderWeight + v0.clientWidth) / 2) + "px";
        div.appendChild(vh);

        // 右下の角調整
        v0.style.height = (v0.clientHeight - (h0.clientHeight + bottomBorderWeight) / 2) + "px";
        h0.style.width = (h0.clientWidth - (v0.clientWidth + rightBorderWeight) / 2) + "px";

        // カーソルを矢印にする。
        v0.style.cursor = "col-resize";
        h0.style.cursor = "row-resize";
        vh.style.cursor = "nwse-resize";

        //// リサイズ関連イベント処理部分
        // mousedown時のエレメントサイズ保存用オブジェクト
        let s = { w: null, h: null };
        // mousedown時のカーソル位置
        let p = { x: null, y: null };
        let target = null;
        let unselectBuff = { userSelect: "none", msUserSelect: "none", webkitUserSelect: "none" };
        let unselectNone = { userSelect: "none", msUserSelect: "none", webkitUserSelect: "none" };
        // mousemoveハンドラ：リサイズ
        let mousemove = function (e) {
            // 元々のエレメントサイズ（s）から、カーソル位置の移動分（p-e）だけサイズを変動させる
            if (target !== v0) {
                div.style.height = (s.h - (p.y - e.clientY)) + "px";
                h0.style.top = (-div.clientTop + elem.offsetHeight - (h0.clientHeight + bottomBorderWeight) / 2) + "px";
                vh.style.top = (-div.clientTop + elem.offsetHeight - (bottomBorderWeight + h0.clientHeight) / 2) + "px";
                v0.style.height = elem.offsetHeight + "px";
            } else {
                // スルー
            }
            if (target !== h0) {
                div.style.width = (s.w - (p.x - e.clientX)) + "px";
                v0.style.left = (-div.clientLeft + elem.offsetWidth - (v0.clientWidth + rightBorderWeight) / 2) + "px";
                vh.style.left = (-div.clientLeft + elem.offsetWidth - (rightBorderWeight + v0.clientWidth) / 2) + "px";
                h0.style.width = elem.offsetWidth + "px";
            } else {
                // スルー
            }
        };
        // mouseupハンドラ：リサイズ終了
        let mouseup = function (e) {
            // ページ全体に対して貼ったイベントリスナを外す。→イベントリスナがたくさんになると処理が重くなるため。
            document.removeEventListener("mousemove", mousemove);
            document.removeEventListener("mouseup", mousemove);
            if (target !== v0) v0.addEventListener("mousedown", mousedown);
            if (target !== h0) h0.addEventListener("mousedown", mousedown);
            if (target !== vh) vh.addEventListener("mousedown", mousedown);
            target = null;
            // セレクト可能に戻す
            mapper(unselectBuff, document.body.style);
        };
        // mousemoveハンドラ：リサイズ開始
        let mousedown = function (e) {
            // リサイズ開始時のサイズとカーソル位置を記憶する
            s = { w: div.clientWidth, h: div.clientHeight };
            p = { x: e.clientX, y: e.clientY };
            // ページ全体に対して mousemove と mouseup を検知させる。
            // 何故ページ全体か？→エレメントサイズを大きくしたい場合は、カーソルをエレメントより外に動かすことになり、エレメント上でイベントを検知するだけでは足りないので。
            document.addEventListener("mousemove", mousemove);
            document.addEventListener("mouseup", mouseup);
            target = e.target;
            if (target !== v0) v0.removeEventListener("mousedown", mousedown);
            if (target !== h0) h0.removeEventListener("mousedown", mousedown);
            if (target !== vh) vh.removeEventListener("mousedown", mousedown);
            // ドラッグ中に文字セレクトされないようにする
            mapper(document.defaultView.getComputedStyle(document.body), unselectBuff, Object.getOwnPropertyNames(unselectBuff));
            mapper(unselectNone, document.body.style);
        };

        // エレメントに貼るイベントリスナはmousedownだけ。イベントリスナはなるべく少ないほうがいい。
        v0.addEventListener("mousedown", mousedown);
        h0.addEventListener("mousedown", mousedown);
        vh.addEventListener("mousedown", mousedown);
    };
    return { restrict: "C", link: link };
}
angular.module('myResizable').directive('myResizable', $MyResizableDirective);
