var TDSSS = (function (){
    // Do slide show.

    // members:
    // start(): Start slideshow.

    // frame element
    var __frame = null;
    // timer object for showOne
    var __timer = null;
    // interval in milisec of slideshow
    var __interval = 3000;
    // last content and element that was shown, set by showOne
    var __lastelem = null;
    var __lastcontent = null;

    // max width in pixel for photo
    var __photowidth = 800;

    var __pinned = false;

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
        TDSContent.fetch();
        showOne();
        return;
    }

    function pin(){
        __pinned = true;
        return __pinned;
    }

    function unpin(){
        __pinned = false;
        return __pinned;
    }

    function showOne(){
        if (__pinned) {
            // if pinned do nothing
            __timer = window.setTimeout(showOne, __interval);
            return;
        }

        var content;
        var elem;
        // first get all content
        while (true) {
            content = TDSContent.dequeue();
            if (! content) {
                // if content queue is empty break
                break;
            }

            elem = __makeElement(content);
            if (elem) {
                elem.style.display = "none";
                __frame.appendChild(elem);
            }
        }

        if (__frame.hasChildNodes()) {
            var elems = __frame.childNodes;

            if (elems.length === 0) {
                // wont happen
                TDSNotify.show("Something unusual happens!");

            } else if (elems[0].style.display === "none") {
                // first element is yet to be shown, show it as usual
                elems[0].style.display = "block";

            } else if (elems.length === 1) {
                // only one can be shown, and it has already shown
                TDSNotify.show("Nothing to show");

            } else {
                // first one has already shown and second is available
                __frame.removeChild(elems[0]);
                __frame.childNodes[0].style.display = "block";
            }

            if (elems.length <= 5) {
                TDSContent.fetch();
            }

        } else {
            // no element to show
            TDSNotify.show("Nothing next to show");
            TDSContent.fetch();
        }

        // set timer for me again
        __timer = window.setTimeout(showOne, __interval);
        return;
    }

    function __createElem(name, id, classes){
        // Utility function to create new element.
        if (! name) {
            return null;
        }
        var elem = window.document.createElement(name);
        if (id) {elem.id = id;}
        if (classes) {elem.className = classes;}
        return elem;
    }

    function __makeElement(content){
        // make new element for CONTENT and return it
        var blogname = content["blog_name"];
        var url = content["post_url"];
        var post_id = content["id"] || 0;
        var date = content["date"];
        // text, quote, link, answer, video, audio, photo, chat
        var type = content["type"];
        // array of strings
        var tags = content["tags"] || [];

        // e- prefix means dom element

        // root of elements: this function returns this
        var eroot = __createElem("div", null, "content");

        // postinfo like blogname, id and url
        var epostinfo = __createElem("p", null, "content-postinfo");
        var eblogname = window.document.createTextNode(blogname + " ");
        var epostlink = __createElem("a");
        epostlink.innerHTML = post_id.toString();
        epostlink.setAttribute("href", url);
        epostlink.setAttribute("target", "_blank");
        epostinfo.appendChild(eblogname);
        epostinfo.appendChild(epostlink);

        var edate = __createElem("p", null, "content-date");
        edate.innerHTML = date;

        // p elemetns cannot have block elements (like p) as their children
        // https://twitter.com/10sr/status/316125985722478592
        var ebody = __createElem("div");
        // set ebody by types
        switch (type) {

        case "text":
            var etitle = __createElem("p");
            etitle.innerHTML = content["title"] || "";
            var etextbody = __createElem("div");
            etextbody.innerHTML = content["body"] || "";
            ebody.appendChild(etitle);
            ebody.appendChild(etextbody);
            break;

        case "quote":
            var etext = __createElem("div");
            etext.innerHTML = content["text"] || "";
            var esource = __createElem("p");
            esource.innerHTML = content["source"] || "";
            ebody.appendChild(etext);
            ebody.appendChild(esource);
            break;

        case "link":
            var etitle = __createElem("p");
            var elink = __createElem("a");
            elink.setAttribute("href", content["url"]);
            elink.innerHTML = content["title"] || content["url"];
            etitle.appendChild(elink);

            var edesc = __createElem("div");
            edesc.innerHTML = content["description"] || "";

            ebody.appendChild(etitle);
            ebody.appendChild(edesc);
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
            var ecaption = __createElem("div");
            ecaption.innerHTML = content["caption"] || "";

            var ephotos = __createElem("div");
            // total number of photos
            var num = content["photos"].length || 0;
            for (var i = 0; i < num; i++) {
                // current photo object
                var po = content["photos"][i];
                var eimg = __createElem("img");
                eimg.setAttribute("alt", po["caption"]);
                // number of alt photos to examine
                var alt_num = po["alt_sizes"].length;
                for (var ii = 0; ii < alt_num; ii++) {
                    // here i assume that the bigger comes earlier
                    if (po["alt_sizes"][ii]["width"] <= __photowidth) {
                        eimg.setAttribute("src", po["alt_sizes"][ii]["url"]);
                        eimg.setAttribute(
                            "width",
                            po["alt_sizes"][ii]["width"].toString()
                        );
                        eimg.setAttribute(
                            "height",
                            po["alt_sizes"][ii]["height"].toString()
                        );
                        break;
                    }
                }
                ephotos.appendChild(eimg);
            }
            ebody.appendChild(ephotos);
            ebody.appendChild(ecaption);
            break;

        case "chat":
            ebody.innerHTML = "chat";
            break;
        }

        eroot.appendChild(epostinfo);
        eroot.appendChild(ebody);
        eroot.appendChild(edate);
        return eroot
    }

    return {
        init: init,
        start: start,
        pin: pin,
        unpin: unpin
    };
})();

TDSSS.init();
