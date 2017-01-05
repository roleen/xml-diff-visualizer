var FROM_DIV = "from_tree";
var TO_DIV = "to_tree";

var rootTag;
var tagsDict;

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

function populate(fromXML, toXML) {
    if (fromXML == "") fromXML = "<{0}></{0}>".format(rootTag);
    if (toXML == "") toXML = "<{0}></{0}>".format(rootTag);

    generateTagsDict(fromXML, toXML);

    [fromXML, toXML] = normalizeXML(fromXML, toXML);

    document.getElementById(FROM_DIV).innerHTML = "";
    document.getElementById(TO_DIV).innerHTML = "";

    createXMLTree(fromXML, "#{0}".format(FROM_DIV), "from");
    createXMLTree(toXML, "#{0}".format(TO_DIV), "to");

    visualizeDiff();
}

function generateTagsDict(fromXML, toXML) {
    var xmlDoc1 = $.parseXML(fromXML);
    var xmlDoc2 = $.parseXML(toXML);

    xmlDoc1 = xmlDoc1.childNodes[0];
    xmlDoc2 = xmlDoc2.childNodes[0];

    if (xmlDoc1.tagName != xmlDoc2.tagName) {
        // throw error
        alert('Root tags do not match. The two XMLs cannot be compared');
    } else {
        rootTag = xmlDoc1.tagName;
        tagsDict = {};

        updateTagsDict(xmlDoc1);
        updateTagsDict(xmlDoc2);
    }
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
