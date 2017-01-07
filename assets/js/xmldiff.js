var FROM_DIV = "from_tree";
var TO_DIV = "to_tree";

var rootTag;
var tagsDict;

function populate(xmlDoc1, xmlDoc2) {
    generateTagsDict(xmlDoc1, xmlDoc2);

    [fromXML, toXML] = normalizeXML(xmlDoc1, xmlDoc2);

    document.getElementById(FROM_DIV).innerHTML = "";
    document.getElementById(TO_DIV).innerHTML = "";

    createXMLTree(fromXML, "#{0}".format(FROM_DIV), "from");
    createXMLTree(toXML, "#{0}".format(TO_DIV), "to");

    visualizeDiff();
}

function generateTagsDict(xmlDoc1, xmlDoc2) {
    rootTag = xmlDoc1.tagName;
    tagsDict = {};

    updateTagsDict(xmlDoc1);
    updateTagsDict(xmlDoc2);
}

function updateTagsDict(node) {
    if (tagsDict[node.tagName] == null || tagsDict[node.tagName] == undefined) {
        tagsDict[node.tagName] = [];
    }
    var children = node.childNodes;
    children.forEach(function (child) {
        if (child.nodeType == Node.ELEMENT_NODE && count(tagsDict[node.tagName], child.tagName) == 0) {
            tagsDict[node.tagName].push(child.tagName);
        }
    });
    children.forEach(function (child) {
        if (child.nodeType == Node.ELEMENT_NODE) {
            updateTagsDict(child);
        }
    });
}

function normalizeXML(xmlDoc1, xmlDoc2) {
    [root1, root2] = normalize(xmlDoc1, xmlDoc2);
    var xml1Str = "<{0}>{1}</{0}>".format(rootTag, root1.innerHTML);
    var xml2Str = "<{0}>{1}</{0}>".format(rootTag, root2.innerHTML);
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

    for (var i = 0; i < nodes1.length; i++) {
        if (tagsDict[nodes1[i].tagName].length > 0) {
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
            if (nodes1[i].textContent.trim() == nodes2[j].textContent.trim()) {
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

function createXMLTree(xml, div, cat) {
    var tree = new XMLTree({
      xml: xml,
      container: div,
      startExpanded: true,
      noURLTracking: true,
      attrsAsData: true,
      name: cat
    });
}

function visualizeDiff() {
    var fromTree = $("#{0} input".format(FROM_DIV));
    var toTree =$("#{0} input".format(TO_DIV));
    if (fromTree.length == toTree.length) {
        var toVals = [];
        var ind = 0;
        var attrInd = 0;

        $.each(toTree, function(data, listNode) {
            node = $(listNode);
            nodeClass = node.attr("class");
            toVals.push(node);
        });

        $.each(fromTree, function(data, listNode) {
            node = $(listNode);
            nodeClass = node.attr("class");

                inputVal = node.val();
                toVal = toVals[ind].val();

                if (inputVal && !toVal) {
                    $(node).attr("class", "insert");
                    $(toVals[ind]).attr("class", "delete");
                }
                else if (toVal && !inputVal) {
                    $(node).attr("class", "delete");
                    $(toVals[ind]).attr("class", "insert");
                }
                else if (inputVal != toVal) {
                    $(node).attr("class", "different");
                    $(toVals[ind]).attr("class", "different");
                }

                ind += 1;
        });
    }
}
