TDSContent = (function (){
    // Fetch dashboard contents and enqueue them.

    // members:
    // start(): Start fetching loop.
    // dequeue(): Dequeue one content from internal queue.
    // cbReqDashboard(): Callback function for requests. Used internally.

    var __queue = null;
    // number of contents to fetch in one request
    var __reqlimit = 20;

    function init(){
        __queue = [];
        return;
    }

    function start(){
        // start fetching contents
        __reqDashboard();
        return;
    }

    function __reqDashboard(){
        TDSReq.req(
            "/user/dashboard",
            {
                limit: __reqlimit.toString(),
                callback: "TDSContent.cbReqDashboard"
            }
        );
    }

    function cbReqDashboard(obj){
        // callback for __reqDashboard
        if (obj.meta.status === 200) {
            for (var i = 0; i < obj.response.posts.length; i++) {
                __enqueue(obj.response.posts[i]);
            }
        } else {
            // insane status
            return;
        }
        return;
    }

    function __enqueue(obj){
        __queue.push(obj);
        return
    }

    function dequeue(){
        // TODO: kick __reqDashboard when __queue get small
        // dequeue one content or null.
        if (__queue.length === 0) {
            return null;
        }
        return __queue.shift();
    }

    return {
        init: init,
        start: start,
        dequeue: dequeue,
        cbReqDashboard: cbReqDashboard
    };
})();

function alertOBJ(obj){
    // show alert of JSON object.
    // alert(JSON.stringify(obj));
    var c = window.document.getElementById("content");
    // c.innerHTML = [at, as, ct, cs].join("<br />\n");
    c.innerHTML = JSON.stringify(obj);
};

TDSContent.init();
