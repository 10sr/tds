TDSContent = (function (){
    // Fetch dashboard contents and enqueue them.

    // members:
    // fetch(): Fetch contents and enqueue them asyncly.
    // dequeue(): Dequeue one content from internal queue.
    // __cbReqDashboard(): Callback function for requests. Used internally.

    var __queue = null;
    // number of contents to fetch in one request
    var __reqlimit = 20;

    // __direction must be "new" or "old"
    // If "new", I try to get latest post, and the queue is oldest first.
    // If "old", I go deeply, get older posts forever and the queue is newest
    // first.
    var __direction = "old";

    // __latest is used when __direction is "new"
    var __latest = 0;
    // __oldest is used when __direction is "old": since_id is set to this
    // value 0 means a valid value is not set yet
    var __oldest = 0;
    // NOTE: newer posts get older id
    // NOTE: I cannot find in which order "posts" field has posts: oldest first
    // or newest first, but from the nature of dashboard I think the answer is
    // newest first.

    function init(){
        __queue = [];
        return;
    }

    function fetch(){
        if (! TDSReq.isreq()) {
            TDSNotify.show("Fetching contents from Tumblr...");
            // avoid duplicating request
            __reqDashboard();
        }
    }

    function __reqDashboard(){
        var params = {
            limit: __reqlimit.toString(),
            callback: "TDSContent.__cbReqDashboard"
        };
        if (__direction === "old" && __oldest !== 0) {
            params["since_id"] = __oldest.toString();
        }

        TDSReq.req("/user/dashboard", params);
    }

    function __cbReqDashboard(obj){
        // callback for __reqDashboard
        TDSReq.onFinish();

        if (obj.meta.status === 200) {
            var total = obj.response.posts.length;
            if (total === 0) {
                // if no posts available return immediately
                return;
            }

            if (__direction === "new") {
                for (var i = total - 1; i >= 0; i--) {
                    // enqueue from older one
                    if (obj.response.posts[i].id > __latest) {
                        // bigger means newer
                        __enqueue(obj.response.posts[i]);
                    }
                }
            } else if (__direction === "old") {
                var num
                for (var i = 0; i < total; i++) {
                    // enqueue from newer one
                    __enqueue(obj.response.posts[i]);
                }
            }
            var cur_latest = obj.response.posts[0].id;
            var cur_oldest = obj.response.posts[total-1].id;
            if (cur_latest > __latest) { __latest = cur_latest; }
            if (__oldest === 0 || cur_oldest < __oldest) {
                // 0 means not set yet
                __oldest = cur_oldest;
            }
            return;

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
        // dequeue one content or null.
        if (__queue.length === 0) {
            return null;
        }
        return __queue.shift();
    }

    return {
        init: init,
        fetch: fetch,
        dequeue: dequeue,
        __cbReqDashboard: __cbReqDashboard
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
