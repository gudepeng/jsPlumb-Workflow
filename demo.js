/**模型计数器*/
var modelCounter = 0;
/**
 * 初始化一个jsPlumb实例
 */
var instance = jsPlumb.getInstance({
    DragOptions: {cursor: "pointer", zIndex: 2000},
    //连线的状态
    ConnectionOverlays: [
        //箭头样式
        ["Arrow", {
            location: 1,
            visible: true,
            width: 11,
            length: 11,
            direction: 1,
            id: "arrow_forwards"
        }],
        //连线标签
        ["Label", {
            location: 0.5,
            id: "label",
            cssClass: "aLabel",
            events:{
                tap:function() {
                }
            }
        }]
    ],
    Container: "container"
});
instance.importDefaults({
    ConnectionsDetachable: true,
    /*ReattachConnections: true  //连线不可断开*/
});
//点击连线事件
instance.bind("click", function (conn, originalEvent) {
});
instance.bind("connectionDrag", function (connection) {
    debugger
    console.log("connection " + connection.id + " is being dragged. suspendedElement is ", connection.suspendedElement, " of type ", connection.suspendedElementType);
});

instance.bind("connectionDragStop", function (connection) {
    debugger
    console.log("connection " + connection.id + " was dragged");
});

instance.bind("connectionMoved", function (params) {
    debugger
    console.log("connection " + params.connection.id + " was moved");
});
//链接连线事件
instance.bind("connection", function (info) {
    if ($(info.source).attr("type") === "two") {
        var name = prompt("请输入连线属性");
        info.connection.getOverlay("label").setLabel(name);//当连接成功后，将箭头上的label改为连接ID
    }
});
/**
 * 添加模型
 * @param ui
 * @param selector
 */
function CreateModel(ui, selector) {
    var modelId = $(ui.draggable).attr("id");
    var id = modelId + "_model_" + modelCounter++;
    var html = [];
    html.push('<div class="model" id="' + id + '" type="' + metadata[modelId].type + '">');
    html.push('<div style="float: left;width:34%;height: 100%">');
    html.push('<div style="margin: 7px 4px;height: 70%;border: 1px solid #000;border-radius: 50%;margin-top: 11px;"></div>');
    html.push('</div>');
    html.push('<div style="float: left;background: yellow;width:64%;height: 100%">');
    html.push('<div><a href="javascript:void(0)" class="pull-right" onclick="removeElement(this);">X</a></div>');
    html.push('<div>' + metadata[modelId].name + '</div>');
    html.push('</div>');
    html.push('</div>');
    html.push('</div>');
    $(selector).append(html.join(""));
    var left = parseInt(ui.offset.left - $(selector).offset().left);
    var top = parseInt(ui.offset.top - $(selector).offset().top);
    $("#" + id).css("position", "absolute").css("left", left).css("top", top);
    if (metadata[modelId].type === "start") {
        //添加连接点
        instance.addEndpoint(id, startCircle);
    } else if (metadata[modelId].type === "two") {
        instance.addEndpoint(id, endCircle);
        instance.addEndpoint(id, {anchors: "BottomLeft"}, startCircle);
        instance.addEndpoint(id, {anchors: "BottomRight"}, startCircle);
    } else if (metadata[modelId].type === "other") {
        instance.addEndpoint(id, endCircle);
        instance.addEndpoint(id, startCircle);
    }

    //注册实体可draggable
    $("#" + id).draggable({
        containment: "parent",
        drag: function (event, ui) {
            instance.repaintEverything();
        },
        stop: function () {
            instance.repaintEverything();
        }
    });
}
//基本连接线样式
var connectorPaintStyle = {
    stroke: "#888888",
    strokeWidth: 2
};
// 鼠标悬浮在连接线上的样式
var connectorHoverStyle = {
    strokeWidth: 3,
    stroke: "#216477"
};
//起点样式设置
var startCircle = {
        anchors: "BottomCenter",
        endpoint: ["Dot", {cssClass: "endpointcssClass"}], //端点形状
        connectorStyle: connectorPaintStyle,//连线样式
        connectorHoverStyle: connectorHoverStyle,//悬浮连线样式
        paintStyle: {
            stroke: "#7AB02C",
            fill: "transparent",
            radius: 7,
            strokeWidth: 1
        },		//端点的颜色样式
        isSource: true, //是否可拖动（作为连接线起点）
        connector: ["Bezier", {curviness: 63}],
        isTarget: false, //是否可以放置（连接终点）
        maxConnections: -1,
        onMaxConnections: function (info) {//绑定一个函数，当到达最大连接个数时弹出提示框
            alert("连线不能超过2条");
        }
    };

//终点样式设置
var endCircle = {
        anchors: "TopCenter",
        endpoint: ["Dot", {cssClass: "endpointcssClass"}], //端点形状
        connectorStyle: connectorPaintStyle,//连线样式
        connectorHoverStyle: connectorHoverStyle,//悬浮连线样式
        paintStyle: {
            fill: "#62A8D1",
            radius: 6
        },		//连接点的颜色
        isSource: false, //是否可拖动（作为连接线起点）
        connector: ["Flowchart", {stub: 30, gap: 0, coenerRadius: 0, alwaysRespectStubs: true, midpoint: 0.5}],
        isTarget: true, //是否可以放置（连接终点）
        maxConnections: -1,
        onMaxConnections: function (info) {//绑定一个函数，当到达最大连接个数时弹出提示框
            alert("连线不能超过2条");
        }
    };

//删除节点
function removeElement(obj) {
    var element = $(obj).parents(".model");
    if (confirm("确定删除该模型？"))
        instance.remove(element);
}
function save() {
    var connects = [];
    var mainArr = [];
    debugger
    $.each(instance.getAllConnections(), function (idx, connection) {
        connects.push({
            ConnectionId: connection.id,
            PageSourceId: connection.sourceId,
            PageTargetId: connection.targetId,
            SourceText: connection.source.innerText,
            TargetText: connection.target.innerText,
            SourceType: connection.endpoints[0].anchor.type
        });
    });
    $("#container .model").each(function () {
        mainArr.push({
            offset: $(this).position(),
            name: $(this).text(),
            type: $(this).attr("type"),
            id: $(this).attr("id"),
        });
    });
    debugger
    console.log(mainArr);
    console.log(connects);
    sessionStorage.setItem("flowsheet",JSON.stringify({"connects":connects,"mainArr":mainArr}));
}
function deepCopy(p, c) {  //克隆对象
    var c = c || {};
    for (var i in p) {
        if(! p.hasOwnProperty(i)){
            continue;
        }
        if (typeof p[i] === 'object') {
            c[i] = (p[i].constructor === Array) ? [] : {};
            deepCopy(p[i], c[i]);
        } else {
            c[i] = p[i];
        }
    }
    return c;
}
function loaddate() {

    if(sessionStorage.getItem("flowsheet")){//判断是否有保存过
        var flowsheet=JSON.parse(sessionStorage.getItem("flowsheet"));
        var mainHTML=""
        for(var i=0;i<flowsheet.mainArr.length;i++){
            if(modelCounter<flowsheet.mainArr[i].sign){//如果已经保存过,即将标记更新
                modelCounter=flowsheet.mainArr[i].sign;
            }
            var html = [];
            html.push('<div class="model" id="' + flowsheet.mainArr[i].id + '" type="'+flowsheet.mainArr[i].type+'" style="left:'+flowsheet.mainArr[i].offset.left+'px;top:'+flowsheet.mainArr[i].offset.top+'px;position:absolute;margin:0">');
            html.push('<div style="float: left;width:34%;height: 100%">');
            html.push('<div style="margin: 7px 4px;height: 70%;border: 1px solid #000;border-radius: 50%;margin-top: 11px;"></div>');
            html.push('</div>');
            html.push('<div style="float: left;background: yellow;width:64%;height: 100%">');
            html.push('<div><a href="javascript:void(0)" class="pull-right" onclick="removeElement(this);">X</a></div>');
            html.push('<div>' + flowsheet.mainArr[i].name + '</div>');
            html.push('</div>');
            html.push('</div>');
            html.push('</div>');
            mainHTML+=html.join("");
        };
        $("#container").append(mainHTML);
        $("#container .model").each(function(){
            debugger
            if ($(this).attr("type") === "start") {
                //添加连接点
                instance.addEndpoint(this, deepCopy(startCircle,{uuid:$(this).attr("id")+"BottomCenter"}));
            } else if ($(this).attr("type") === "two") {
                instance.addEndpoint(this, deepCopy(endCircle,{uuid:$(this).attr("id")+"TopCenter"}));
                instance.addEndpoint(this, {anchors: "BottomLeft"},deepCopy(startCircle,{uuid:$(this).attr("id")+"BottomLeft"}));
                instance.addEndpoint(this, {anchors: "BottomRight"},deepCopy(startCircle,{uuid:$(this).attr("id")+"BottomRight"}));
            } else if ($(this).attr("type") === "other") {
                instance.addEndpoint(this, deepCopy(endCircle,{uuid:$(this).attr("id")+"TopCenter"}));
                instance.addEndpoint(this, deepCopy(startCircle,{uuid:$(this).attr("id")+"BottomCenter"}));
            }
            instance.draggable(this,{containment: "parent"});//端点可以拖动设置,并且将端点限制在父级内
            $(this).draggable({ //设置拖动到main区域中的元素还可以拖拽
                containment: "parent" //限制拖动不超过父级边框
            });
        });
        debugger
        //固定连线
        for(var i=0;i<flowsheet.connects.length;i++){
            if(flowsheet.connects[i].SourceType=="BottomLeft"){
                instance.connect({uuids:[flowsheet.connects[i].PageSourceId+"BottomLeft",flowsheet.connects[i].PageTargetId+"TopCenter"]});
            }else if(flowsheet.connects[i].SourceType=="BottomRight"){
                instance.connect({uuids:[flowsheet.connects[i].PageSourceId+"BottomRight",flowsheet.connects[i].PageTargetId+"TopCenter"]});
            }else if(flowsheet.connects[i].SourceType=="BottomCenter"){
                instance.connect({uuids:[flowsheet.connects[i].PageSourceId+"BottomCenter",flowsheet.connects[i].PageTargetId+"TopCenter"]});
            }

        };
    }
}