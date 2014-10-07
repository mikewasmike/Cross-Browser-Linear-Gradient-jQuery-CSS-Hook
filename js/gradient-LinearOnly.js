/*!
* Copyright (c) 2012 Michael Mrowetz (http://michaelmrowetz.com)
* based on Tom Ellis' Linear and Radial Gradient cssHook for jQuery
* Limitations:
- Works with jQuery 1.4.3 and higher
- Works in Firefox 3.6+, Safari 5.1+, Chrome 13+, Opera 11.10+, IE6+
- Only works for background and background image CSS properties

- IE below 9 is using the filter tag which only supports 
* Licensed under the MIT License (LICENSE.txt).
*/
(function ($) {

    var div = document.createElement("div"),
		divStyle = div.style,
		rLinear = /^(.*?)linear-gradient(.*?)$/i,
		rRadial = /^(.*?)radial-gradient(.*?)$/i,
		rLinearSettings = /^(.*?)(:?linear-gradient)(\()(.*)(\))(.*?)$/i,
		rSupportLinearW3C = /(^|\s)linear-gradient/,
		rSupportLinearMoz = /(^|\s)-moz-linear-gradient/,
		rSupportLinearWebkit = /(^|\s)-webkit-linear-gradient/,
        rSupportLinearWebkitLegacy = /(^|\s)-webkit-gradient/,
        rSupportLinearWebkit = /(^|\s)-webkit-linear-gradient/,
		rSupportLinearOpera = /(^|\s)-o-linear-gradient/,
        rSupportLinearMs = /(^|\s)-ms-linear-gradient/,
		rWhitespace = /\s/,
		rWhiteGlobal = /\s/g,
        rColorStop = /((#[0-9a-f]{3,6})[\s]*(([0-9]{0,3})(%|px)?))|((rgb[a]{0,1}\(.*?\))[\s]*([0-9]{0,3})(%|px)?)/gi,
        rStartingPoint = /(top|left|bottom|right|[\-0-9]+deg)/i,
        directionPairs = { "left": "right", "right": "left", "top": "bottom", "bottom": "top", "center": "center" },
        cssProps = "background backgroundImage",
        cssLinear = "background:-moz-linear-gradient(red, blue);background:-webkit-linear-gradient(red, blue);background:-o-linear-gradient(red, blue);background:-ms-linear-gradient(red, blue);background:linear-gradient(red, blue);filter:progid:DXImageTransform.Microsoft.gradient(startColorstr=#000000, endColorstr=#ffffff)'",
        cssPropsArray = cssProps.split(rWhitespace),
        linearSettings = function (value) {
            var parts = rLinearSettings.exec(value);
            value = value.replace(parts[2], $.support.linearGradient);
            return value;
        },
        legacyWebkitLinearSettings = function (value) {
            var parts = rLinearSettings.exec(value),
                direction = $.trim(parts[4].split(",")[0].toLowerCase()).split(" "),
                dirctionStr = "left top, left bottom";
            if (direction.length === 1) {
                switch (direction[0]) {
                    case "left":
                        dirctionStr = "left center, right center";
                        break;
                    case "right":
                        dirctionStr = "right center,  left center";
                        break;
                    case "bottom":
                        dirctionStr = "left bottom,  left top";
                        break;
                }
            } else if (direction.length === 2) {
                dirctionStr = direction[1] + " " + direction[0] + "," + directionPairs[direction[1]] + " " + directionPairs[direction[0]];
            }
            value = "-webkit-gradient(linear," + dirctionStr;
            var matchCount = 0;
            var matchesTotal = parts[4].match(rColorStop).length;
            while (match = rColorStop.exec(parts[4])) {
                value += ", color-stop(" + ((match[4] === "") ? ((matchCount === 0) ? "0" : Math.round(matchCount / (matchesTotal - 1) * 10) / 10) + "," : match[4] + match[5] + ",") + "" + match[2] + ")";
                matchCount++;
            }
            value += ")";
            return value;
        },
        linearFilterSettings = function (value) {
            var parts = rLinearSettings.exec(value)[4].replace(/\s\d*(%|px)?/g, "").split(",");
            if (!rStartingPoint.test(parts[0])) {
                parts.splice(0, 0, "top");
            }
            return "progid:DXImageTransform.Microsoft.Gradient(GradientType=" + (parts[0] === "top" ? 0 : 1) + ",startColorstr=" + toHex6Color(parts[1]) + ", endColorstr=" + toHex6Color(parts[parts.length - 1]) + ")";
        },
        toHex6Color = function (hex) {
            if (hex.length === 4) { return '#'.hex[1].hex[1].hex[2].hex[2].hex[3].hex[3]; }
            return hex;
        },
        getColorStops = function (settings) {
            var matchCount = 0,
                svg = "";
            while (match = rColorStop.exec(settings)) {
                svg += '<stop stop-color="' + match[2] + '" offset="' + (match[4] === "" ? matchCount : match[4] / 100) + '"/>';
                matchCount++;
            }
            return svg;
        },
        makeImage = function (svg) {
            if (Window.btoa !== undefined) {
                return "url(data:image/svg+xml;base64," + Window.btoa(svg) + ");";
            } else if (window.Base64 !== undefined) {
                return "url(data:image/svg+xml;base64," + Base64.encode(svg) + ");";
            } else {
                $.error("Base64.js is missing, the gradients css-hook requires is for SVG Gradients");
            }
        },
        linearSvgSettings = function (value) {
            var settings = rLinearSettings.exec(value)[4],
                direction = $.trim(settings.split(",")[0].toLowerCase()),
                isDeg = direction.indexOf("deg") !== -1,
                top = (direction.indexOf("top") !== -1 ? 100 : 0),
                bottom = (direction.indexOf("bottom") !== -1 ? 100 : 0),
                left = (direction.indexOf("left") !== -1 ? 100 : 0),
                right = (direction.indexOf("right") !== -1 ? 100 : 0);
            if (top + bottom + left + right <= 0) {
                top = left = 100;
            }
            var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 1 1" preserveAspectRatio="none">'
               + '<linearGradient id="b" gradientUnits="userSpaceOnUse" x1="' + right + '%" y1="' + bottom + '%" x2="' + left + '%" y2="' + top + '%">'
               + getColorStops(settings)
               + '</linearGradient>'
               + '<rect x="0" y="0" width="1" height="1" fill="url(#b)" />'
               + '</svg>';
            return makeImage(svg);
        };

    divStyle.cssText = cssLinear;

    $.support.linearGradient =
        rSupportLinearW3C.test(divStyle.backgroundImage) ? "linear-gradient" :
        (rSupportLinearMoz.test(divStyle.backgroundImage) ? "-moz-linear-gradient" :
        (rSupportLinearWebkit.test(divStyle.backgroundImage) ? "-webkit-linear-gradient" :
        (rSupportLinearOpera.test(divStyle.backgroundImage) ? "-o-linear-gradient" :
        (rSupportLinearMs.test(divStyle.backgroundImage) ? "-ms-linear-gradient" :
        false))));

    if ($.support.linearGradient === false) {
        divStyle.cssText += "background: -webkit-gradient(linear, left top, left bottom, color-stop(0%, #000000), color-stop(100%, #ffffff));";
        if (rSupportLinearWebkitLegacy.test(divStyle.backgroundImage)) {
            $.support.linearGradient = "-webkit-gradient";
        } else if (document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Shape", "1.0")) { //ie9 & Opera < 11.10
            $.support.linearGradient = "svg";
        } else if ((typeof divStyle.filter === 'string')) { //ie < 9s
            $.support.linearGradient = "filter";
        }
    }

    if ($.support.linearGradient && $.support.linearGradient !== "linear-gradient") {
        $.each(cssPropsArray, function (i, prop) {
            $.cssHooks[prop] = {

                set: function (elem, value) {
                    if (rLinear.test(value)) {
                        /*if ($.support.linearGradient === "svg") {
                            elem.style[prop] = linearSvgSettings(value);
                            $(elem).addClass("svg-gradient");
                        }
                        else if ($.support.linearGradient === "filter") {
                            elem.style.filter = linearFilterSettings(value);
                            if (elem.style.zoom === "") { elem.style.zoom = 1; }
                            $(elem).addClass("filter-gradient");
                        }
                        else */
                        if ($.support.linearGradient === "-webkit-gradient") {
                            elem.style[prop] = legacyWebkitLinearSettings(value);
                        }
                        else if ($.support.linearGradient !== false) {
                            elem.style[prop] = linearSettings(value);
                        }
                        else {
                            $(elem).addClass("no-css-linear-gradient");
                        }
                    }
                    else {
                        elem.style[prop] = value;
                    }
                }
            };

        });
    }
    div = divStyle = null;
})(jQuery);
