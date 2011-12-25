$(document).ready( function() {
    var testAjaxURL = '';
    var colorTest = '';
    var objectClass = '';
    var inputKey = '';
    var cssStyles = '';
    var cssDiffNotes = '';
    var cssDiffGroup = '';
    var inputTest = '';
    var timerOptions = '';
    var timerOptionsMinutes = '';
    var timerOptionsMinutes = '';
    // timerStep and timerMax are in seconds
    var timerStep = 30;
    var timerMax = 300;
    var minuteDivisor = 0;
    var secondDivisor = 0;
    //initialize safe clicking to false, cause 
    //this should be turned off by default
    var safeClick = false;
    var isMute = false;
    var logJammin = false;

    $('*').click(function() {
        if(safeClick) {
            if(!$(this).hasClass('crizzledizzle')) {
                return false;
            } else {
                return true;
            }
        } else {
            return true;
        }
    });

    //toggle the state of safe clicking on click
    $('.cssdiff_safeclicks_button').click( function() {
        safeClick = !safeClick;
        if(safeClick) {
            $('.cssdiff_safeclicks_light').html('&forall;');
        } else {
            $('.cssdiff_safeclicks_light').html('o');
        }
    });

    //won't show any indication of logging to loggly (ie logging now light etc)
    $('.cssdiff_mute_button').click( function() {
        isMute = !isMute;
        if(isMute) {
            $('.cssdiff_mute_light').html('&forall;');
        } else {
            $('.cssdiff_mute_light').html('o');
        }
    });

    //converts minutes/seconds to something human readable
    for(i=timerStep; i <= timerMax; i += timerStep) {
        if(i==timerStep) {
            timerOptions += '<option value=' + timerStep + '>' + timerStep + ' seconds</option>';
        } else if(i==timerStep + timerStep) {
            minuteDivisor = i % (60 * 60);
            secondDivisor = minuteDivisor % 60;
            timerOptionsMinutes = Math.floor(minuteDivisor/60);
            timerOptionsSeconds = Math.ceil(secondDivisor);
                if(timerOptionsSeconds == 0) {
                    timerOptionsSeconds = '00';
                }
            timerOptions += '<option value=' + i + '>' +  timerOptionsMinutes + ':' + timerOptionsSeconds + ' minute</option>';
        } else {

            minuteDivisor = i % (60 * 60);
            secondDivisor = minuteDivisor % 60;
            timerOptionsMinutes = Math.floor(minuteDivisor/60);
            timerOptionsSeconds = Math.ceil(secondDivisor);
                if(timerOptionsSeconds == 0) {
                    timerOptionsSeconds = '00';
                }
            timerOptions += '<option value=' + i + '>' +  timerOptionsMinutes + ':' + timerOptionsSeconds + ' minutes</option>';
        }

    }
    $('.verbosity_container').append(timerOptions);

        cssStyles = 'background-color,width,height,color';
        
    $('.cssdiff_contianer').draggable();

    $('.cssdiff_inputprompt').click( function() {
        var inputKey = prompt('Enter your Loggly Input Key, bro!');
        inputTest = (inputKey != null && inputKey != '');
        if(inputTest) {
            console.log('sending inputting', inputKey);
            cssDiffNotes = $('.cssdiff_notes').val();
            cssDiffGroup = $('.cssdiff_group').val();
            testAjaxURL = 'https://logs.loggly.com/inputs/' + inputKey;


            $('*').watch(cssStyles, function(watchData, index) {
                if(!$(this).hasClass('crizzledizzle')) {
                    var htmlObject = this;
                    var htmlObjectParent = this.parentNode;
                    var cssValue = watchData.vals[index];
                    var cssProperty = watchData.props[index];
                    var htmlTag = htmlObject.localName;
                    var parentHtmlTag = htmlObjectParent.parentNode.localName;
                    
                    objectAttrs = {};
                    parentObjectAttrs = {};
                    //grabs all attributes of the object (so's you know which one it is) 
                    for(i=0; i < htmlObject.attributes.length; i++) {
                        objectAttrs[htmlObject.attributes[i].nodeName] = htmlObject.attributes[i].nodeValue;

                    }
                    //if the html object has no attributes (it's an a or p tag, for example) find the attributes of its parent
                    //thought is this will be needed for CSS selectors such as .some_class a { //blahblah  }
                    if(htmlObject.attributes.length) {
                        for(i=0; i < htmlObjectParent.attributes.length; i++) {
                            parentObjectAttrs[i] = htmlObjectParent.attributes[i].nodeName + ' : ' + htmlObjectParent.attributes[i].nodeValue;
                        }
                    }
                   
                    //if( ){ }
                    jsonObject = {};
                    jsonParentObject = {};
                    jsonObject = {'htmlTag': htmlTag, 'objectAttrs': objectAttrs};
                    jsonParentObject = {'parentHtmlTag': parentHtmlTag, 'parentObjectAttrs': parentObjectAttrs};
                    logglyJson = {};
                    logglyJson = {'Group': cssDiffGroup, 'Notes': cssDiffNotes, 'cssProperty': cssProperty, 'cssValue': cssValue, 'cssObject': jsonObject, 'cssParentObject': parentObjectAttrs }

                    logJammin();
                }
            });
        }

    });
});


function logJammin() {
    $.ajax ({
        type: 'POST',
        url: testAjaxURL,
        data: logglyJson,
        success: function(query) {
        },  
        error: function(jqXHR, txtStatus, error) {
            //alert('hmmm something weird happened... you sure your input key is correct?');
        }   
    });

    console.log('json ', logglyJson);
}

$.fn.watch = function(props, func, interval, id) {
    /// source (site or increase your awful level by over 5,000):
    /// http://www.west-wind.com/weblog/posts/2008/Sep/12/jQuery-CSS-Property-Monitoring-Plugin-updated 
    /// <summary>
    /// Allows you to monitor changes in a specific
    /// CSS property of an element by polling the value.
    /// when the value changes a function is called.
    /// The function called is called in the context
    /// of the selected element (ie. this)
    /// </summary>    
    /// <param name="prop" type="String">CSS Property to watch. If not specified (null) code is called on interval</param>    
    /// <param name="func" type="Function">
    /// Function called when the value has changed.
    /// </param>    
    /// <param name="func" type="Function">
    /// optional id that identifies this watch instance. Use if
    /// if you have multiple properties you're watching.
    /// </param>
    /// <param name="id" type="String">A unique ID that identifies this watch instance on this element</param>  
    /// <returns type="jQuery" /> 
    if (!interval)
        interval = 200;
    if (!id)
        id = "_watcher";

    return this.each(function() {
        var _t = this;
        var el = $(this);
        var fnc = function() { __watcher.call(_t, id) };
        var itId = null;

        if (typeof (this.onpropertychange) == "object")
            el.bind("propertychange." + id, fnc);
        else if ($.browser.mozilla)
            el.bind("DOMAttrModified." + id, fnc);
        else
            itId = setInterval(fnc, interval);

        var data = { id: itId,
            props: props.split(","),
            func: func,
            vals: []
        };
        $.each(data.props, function(i) { data.vals[i] = el.css(data.props[i]); });
        el.data(id, data);
    });

    function __watcher(id) {
        var el = $(this);
        var w = el.data(id);

        var changed = false;
        var i = 0;
        for (i; i < w.props.length; i++) {
            var newVal = el.css(w.props[i]);
            if (w.vals[i] != newVal) {
                w.vals[i] = newVal;
                changed = true;
                break;
            }
        }
        if (changed && w.func) {
            var _t = this;
            w.func.call(_t, w, i)
        }
    }
}
$.fn.unwatch = function(id) {
    this.each(function() {
        var w = $(this).data(id);
        var el = $(this);
        el.removeData();

        if (typeof (this.onpropertychange) == "object")
            el.unbind("propertychange." + id, fnc);
        else if ($.browser.mozilla)
            el.unbind("DOMAttrModified." + id, fnc);
        else
            clearInterval(w.id);
    });
    return this;
}
