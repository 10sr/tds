var TDSSS = (function (){
    // do slide show

    // members:
    // start(): start slideshow

    // init and listeners
    function init(){
        return;
    }

    function start(){
        // alert("token got");
        TDSReq.req("/user/dashboard",
                   {limit: "20", callback: "alertOBJ"});
    }

    return {
        init: init,
        start: start
    };
})();

function alertOBJ(obj){
    // show alert of JSON object.
    // alert(JSON.stringify(obj));
    var c = window.document.getElementById("content");
    // c.innerHTML = [at, as, ct, cs].join("<br />\n");
    c.innerHTML = JSON.stringify(obj);
};

TDSSS.init();
