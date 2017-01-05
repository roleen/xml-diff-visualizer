if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(searchString, position) {
      var subjectString = this.toString();
      if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
        position = subjectString.length;
      }
      position -= searchString.length;
      var lastIndex = subjectString.lastIndexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
  };
}
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

String.prototype.format = function() {
    var s = this,
        i = arguments.length;

    while (i--) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
    }
    return s;
};

if(typeof(String.prototype.trim) === "undefined") {
    String.prototype.trim = function() {
        return String(this).replace(/^\s+|\s+$/g, '');
    }
}


function convertToXML(li) {
    var tagName = li.className.replace("noKids", "").trim();
    var attributes = [];
    var children = li.childNodes;
    var tagValue, ul, span;

    var xml = "<{0}".format(tagName);

    for (var i = 0; i < children.length; i++) {
        if (children[i].tagName == "UL") ul = children[i];
        else if (children[i].tagName == "SPAN") span = children[i];
    }

    if (ul == null || ul == undefined) return "";
    children = ul.childNodes;

    if (children.length == 0 || children[0].classList.contains("attr")) {
        var inputs = li.getElementsByTagName("input");
        for (var i = 0; i < inputs.length; i++) {
            if (inputs[i].name == tagName) tagValue = inputs[i].value;
            else attributes.push(inputs[i]);
        }

        var attributesPresent = false;
        for (var i = 0; i < attributes.length; i++) {
            if (attributes[i].value != undefined &&
                attributes[i].value != null &&
                attributes[i].value != "") {
                xml += ' {0}="{1}"'.format(attributes[i].name, attributes[i].value);
                attributesPresent = true;
            }
        }
        if (attributesPresent || !(tagValue == undefined || tagValue == null || tagValue == "")) {
            xml += ">{0}</{1}>".format(tagValue, tagName);
            return xml;
        } else return "";

    } else {
        xml += ">";
        for (var i = 0; i < children.length; i++) {
            xml += convertToXML(children[i]);
        }
        xml += "</{0}>".format(tagName);
        return xml;
    }
}

function normalizeXML(xml1, xml2) {
    var xmlDoc1 = $.parseXML(xml1);
    var xmlDoc2 = $.parseXML(xml2);

    xmlDoc1 = xmlDoc1.childNodes[0];
    xmlDoc2 = xmlDoc2.childNodes[0];

    [system1, system2] = normalize(xmlDoc1, xmlDoc2);

    var xml1Str = "<system>{0}</system>".format(system1.innerHTML);
    var xml2Str = "<system>{0}</system>".format(system2.innerHTML);
    return [xml1Str, xml2Str];
}

function normalize(doc1, doc2) {
    var tagName = doc1.tagName;

    var docChildren1 = doc1.childNodes,
        docChildren2 = doc2.childNodes;

    var nodes1 = [];
    var nodes2 = [];

    docChildren1.forEach(function (doc) {
        if (doc.nodeType == Node.ELEMENT_NODE) {
            nodes1.push(doc);
        }
    });

    docChildren2.forEach(function (doc) {
        if (doc.nodeType == Node.ELEMENT_NODE) {
            nodes2.push(doc);
        }
    });

    var tags = tagsDict[doc1.tagName];

    var xml1 = "",
        xml2 = "";

    var childTags1 = [],
        childTags2 = [];

    nodes1.forEach(function (child) {
        if (child.tagName !== undefined)
            childTags1.push(child.tagName);
    });

    nodes2.forEach(function (child) {
        if (child.tagName !== undefined)
            childTags2.push(child.tagName);
    });

    var emptyNode, attrs, firstIndex, finalCount;

    tags.forEach(function (tag) {
        var index1 = $.inArray(tag, childTags1);
        var index2 = $.inArray(tag, childTags2);
        var count1 = count(childTags1, tag);
        var count2 = count(childTags2, tag);

        // This is not a bug
        if (index1 == -1) index1 = index2;
        if (index2 == -1) index2 = index1;

        if ((count1 > count2) && index2 != -1) index2 = index2 + count2;
        if ((count2 > count1) && index1 != -1) index1 = index1 + count1;

        while (count1 > count2) {
            emptyNode = $.parseXML("<{0}></{0}>".format(tag)).childNodes[0];
            nodes2.splice(index2, 0, emptyNode);
            childTags2.splice(index2, 0, tag);
            index2++;
            count2++;
        }
        while (count1 < count2) {
            emptyNode = $.parseXML("<{0}></{0}>".format(tag)).childNodes[0];
            nodes1.splice(index1, 0, emptyNode);
            childTags1.splice(index1, 0, tag);
            index1++;
            count1++;
        }

        firstIndex = $.inArray(tag, childTags1);
        finalCount = count1;
        nodes1, nodes2 = rearrange(nodes1, nodes2, firstIndex, finalCount);
    });

    var complexTags = ["binary", "star", "planet"];

    for (var i = 0; i < nodes1.length; i++) {
        if (complexTags.indexOf(nodes1[i].tagName) !== -1) {
            [node1, node2] = normalize(nodes1[i], nodes2[i]);
            nodes1.splice(i, 1, node1);
            nodes2.splice(i, 1, node2);
        }
    }

    doc1 = $.parseXML("<{0}></{0}>".format(tagName)).childNodes[0];
    nodes1.forEach(function (node) {
        doc1.appendChild(node);
    });

    doc2 = $.parseXML("<{0}></{0}>".format(tagName)).childNodes[0];
    nodes2.forEach(function (node) {
        doc2.appendChild(node);
    });

    return [doc1, doc2];
}

function rearrange(nodes1, nodes2, firstIndex, count) {
    var tmp;
    for (var i = firstIndex; i < firstIndex + count; i++) {
        for (var j = firstIndex; j < firstIndex + count; j++) {
            if (nodes1[i].textContent == nodes2[j].textContent) {
                if (i != j) {
                    tmp = nodes2[j];
                    nodes2[j] = nodes2[i];
                    nodes2[i] = tmp;
                }
            }
        }
    }
    var attrs;
    for (var i = firstIndex; i < firstIndex + count; i++) {
        attrs = nodes1[i].attributes;
        for (j = 0; j < attrs.length; j++) {
            if (nodes2[i].getAttribute(attrs[j].name) == null) {
                nodes2[i].setAttribute(attrs[j].name, "");
            }
        }
        attrs = nodes2[i].attributes;
        for (j = 0; j < attrs.length; j++) {
            if (nodes1[i].getAttribute(attrs[j].name) == null) {
                nodes1[i].setAttribute(attrs[j].name, "");
            }
        }
    }
    return nodes1, nodes2;
}

function count(array, item) {
    var count = 0;
    array.forEach(function (element) {
        if (element == item) count++;
    });
    return count;
}
