TDSContent = (function (){
    // Fetch dashboard contents and enqueue them.

    // members:
    // fetch(): Fetch contents and enqueue them asyncly.
    // dequeue(): Dequeue one content from internal queue.
    // __cbReqDashboard(): Callback function for requests. Used internally.

    var __queue = null;
    // number of contents to fetch in one request
    var __reqlimit = 10;

    // __direction must be "new" or "old"
    // If "new", I try to get latest post, and the queue is oldest first.
    // If "old", I go deeply, get older posts forever and the queue is newest
    // first.
    var __direction = "new";

    // __latest is used when __direction is "new": since_id is set to this
    var __latest = 0;
    // __oldest is used when __direction is "old"
    // value 0 means a valid value is not set yet
    var __oldest = 0;
    // NOTE: newer posts will get older id
    // NOTE: Contents in posts are in newest (biggest) first order
    // NOTE: when since_id is set for request parameter, newer post than that id
    // will be fetched.
    var __total_posts = 0;

    // NOTE:
    // __direction === "old":
    // After fetching first set of posts, remember the oldest (smallest) post id
    // and number of posts.
    // In following requests, offset is set to be the number of posts already
    // fetched, and remove the post newer then the oldest post remembered.
    // __direction === "new":
    // After fetching first set of posts, remember the latest (biggest) post id.
    // In following requests, set since_id to that id.

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
        if (__direction === "new" && __latest !== 0) {
            params["since_id"] = __latest.toString();
        } else if (__direction === "old") {
            params["offset"] = __total_posts.toString();
        }

        // TDSNotify.show(JSON.stringify(params), true);
        TDSReq.req("/user/dashboard", params);
    }

    function __cbReqDashboard(obj){
        // callback for __reqDashboard
        TDSReq.onFinish();

        if (obj.meta.status === 200) {
            var total = obj.response.posts.length;
            // var ids = [];
            if (total === 0) {
                // if no posts available return immediately
                return;
            }

            if (__direction === "new") {
                for (var i = total - 1; i >= 0; i--) {
                    // enqueue from older one
                    __enqueue(obj.response.posts[i]);
                }
            } else if (__direction === "old") {
                for (var i = 0; i < total; i++) {
                    // enqueue from newer one
                    if (obj.response.posts[i].id < __oldest) {
                        __enqueue(obj.response.posts[i]);
                    }
                }
            }

            // biggest comes first: newest comes first
            // for (var i = 0; i < total; i++) {
            //     ids.push(obj.response.posts[i].id.toString());
            // }

            var cur_latest = obj.response.posts[0].id;
            var cur_oldest = obj.response.posts[0].id;
            // var cur_oldest = obj.response.posts[total-1].id;
            if (cur_latest > __latest) { __latest = cur_latest; }
            if (__oldest === 0 || cur_oldest < __oldest) {
                // 0 means not set yet
                __oldest = cur_oldest;
            }
            __total_posts += total;
            // TDSNotify.show(ids.join("\n"), true);
            return;

        } else {
            TDSNotify.show("Request to Tumblr failed");
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
