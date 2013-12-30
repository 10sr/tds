var TDSSS = (function (){
    // Do slide show.

    // members:
    // start(): Start slideshow.

    var __frame = null;
    var __timer = null;
    var __interval = 3000;
    // last content and element that was shown, set by showOne
    var __lastelem = null;
    var __lastcontent = null;

    function init(){
        return;
    }

    function start(){
        // alert("token got");
        __frame = window.document.getElementById("frame");
        if (! __frame) {
            // if #frame element not found abort
            return;
        }
        var elem = __makeElementNoContent();
        __frame.appendChild(elem);
        showOne();
        return;
    }

    function showOne(){
        // show one content and set timer again
        // set __lastcontent and __lastelement
        var content = TDSContent.dequeue();
        var elem;
        if (content) {
            elem = __makeElement(content);
            // __frame.innerHTML = "<pre>" + JSON.stringify(content) + "</pre>";
        } else {
            if (! __lastcontent) {
                // if no content previously do nothing
                // set next timer
                __timer = window.setTimeout(showOne, __interval);
                return;
            }
            // if no content available yet previously something was shown
            elem = __makeElementNoContent();
        }
        if (elem) {
            __replaceElement(elem);
            __lastcontent = content;
            __lastelement = elem;

            // set next timer
            __timer = window.setTimeout(showOne, __interval);
        } else {
            // failed to create element
            // show next one.
            showOne();
        }
        return;
    }

    function __replaceElement(elem){
        // Replace previously shown element with new one in __frame.

        // This is very simple one: remove prevous one and add next.
        __frame.innerHTML = "";
        __frame.appendChild(elem);
    }

    function __makeElementNoContent(){
        var elem = window.document.createElement("div");
        elem.innerHTML = "No content! Wait for a minute...";
        return elem;
    }

    function __makeElement(content){
        // make new element for CONTENT and return it
        var blogname = content["blog_name"];
        var url = content["post_url"];
        var date = content["date"];
        // text, quote, link, answer, video, audio, photo, chat
        var type = content["type"];
        // array of strings
        var tags = content["tags"] || [];

        // e- prefix means dom element
        var eroot = window.document.createElement("div");

        var eblogname = window.document.createElement("p");
        eblogname.innerHTML = blogname + " " + url;

        var edate = window.document.createElement("p");
        edate.innerHTML = date;

        // p elemetns cannot have block elements (like p) as their children
        // https://twitter.com/10sr/status/316125985722478592
        var ebody = window.document.createElement("div");
        // set ebody by types
        switch (type) {

        case "text":
            var etitle = window.document.createElement("p");
            etitle.innerHTML = content["title"] || "";
            var etextdoby = window.document.createElement("div");
            etextbody.innerHTML = content["body"] || "";
            ebody.appendChild(etitle);
            ebody.appendChild(etextbody);
            break;

        case "quote":
            var etext = window.document.createElement("div");
            etext.innerHTML = content["text"] || "";
            var esource = window.document.createElement("p");
            esource.innerHTML = content["source"] || "";
            ebody.appendChild(etext);
            ebody.appendChild(esource);
            break;

        case "link":
            var etitle = window.document.createElement("p");
            var elink = window.document.createElement("a");
            elink.setAttribute("href", content["url"]);
            elink.innerHTML = coutent["title"] || content["url"];
            etitle.appendChild(elink);

            var edesc = window.document.createElement("div");
            edesc.innerHTML = content["description"] || "";

            ebody.appendchild(etitle);
            ebody.appendchild(edesc);
            break;

        case "answer":
            ebody.innerHTML = "answer";
            break;
        case "video":
            ebody.innerHTML = "video";
            break;
        case "audio":
            ebody.innerHTML = "audio";
            break;

        case "photo":
            // TODO: loading photos is very slow: prefetch them
            var ecaption = window.document.createElement("div");
            ecaption.innerHTML = content["caption"] || "";
            var ephotos = window.document.createElement("div");
            var num = content["photos"].length || 0;
            for (var i = 0; i < num; i++) {
                var po = content["photos"][i];
                var ephoto = window.document.createElement("div");
                var ephotocaption = window.document.createElement("div");
                ephotocaption.innerHTML = po["caption"] || "";
                var alt_num = po["alt_sizes"].length;
                for (var ii = 0; ii < alt_num; ii++) {
                    var eimg = window.document.createElement("img");
                    eimg.setAttribute("src", po["alt_sizes"][ii]["url"]);
                    eimg.setAttribute("width",
                                      po["alt_sizes"][ii]["width"].toString());
                    eimg.setAttribute("height",
                                      po["alt_sizes"][ii]["height"].toString());
                // how to do about sizes?
                    ephoto.appendChild(eimg);
                }
                ephotos.appendChild(ephoto);
            }
            ebody.appendChild(ephotos);
            ebody.appendChild(ecaption);
            break;

        case "chat":
            ebody.innerHTML = "chat";
            break;
        }

        eroot.appendChild(eblogname);
        eroot.appendChild(ebody);
        eroot.appendChild(edate);
        return eroot
    }

    return {
        init: init,
        start: start
    };
})();

TDSSS.init();
