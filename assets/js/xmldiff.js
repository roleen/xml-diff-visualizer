var FROM_DIV = "from_tree";
var TO_DIV = "to_tree";

var rootTag;
var tagsDict;

/**
 * Creates XML Diff Visualization for the given parsed XML objects.
 * @param {Element} xmlDoc1 - Parsed XML document for Base XML
 * @param {Element} xmlDoc2 - Parsed XML document for Changed XML
 */
function createDiffVisualization(xmlDoc1, xmlDoc2) {
    generateTagsDict(xmlDoc1, xmlDoc2);

    [fromXML, toXML] = normalizeXML(xmlDoc1, xmlDoc2);

    document.getElementById(FROM_DIV).innerHTML = "";
    document.getElementById(TO_DIV).innerHTML = "";

    createXMLTree(fromXML, "#{0}".format(FROM_DIV), "from");
    createXMLTree(toXML, "#{0}".format(TO_DIV), "to");

    visualizeDiff();
}

/**
 * Generates key value pairs of all parent tag name to child tag names.
 * @param {Element} xmlDoc1 - Parsed XML document for Base XML
 * @param {Element} xmlDoc2 - Parsed XML document for Changed XML
 */
function generateTagsDict(xmlDoc1, xmlDoc2) {
    rootTag = xmlDoc1.tagName;
    tagsDict = {};

    updateTagsDict(xmlDoc1);
    updateTagsDict(xmlDoc2);
}

/**
 * Update tagsDict with node name to all possible child tag names values for the
 * given node and its children.
 * @param {Element} node - XML root node
 */
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

/**
 * Modifies xmlDoc1 and xmlDoc2 to have exactly same nodes and attributes. If
 * a node or an attribute is missing from one of the objects, an empty node or
 * attribute is appended to that object to make them even.
 * @param {Element} xmlDoc1 - Base XML's parsed object
 * @param {Element} xmlDoc2 - Changed XML's parsed object
 * @returns {String[]} Two xml strings for the normalized Base and Changed XMLs
 */
function normalizeXML(xmlDoc1, xmlDoc2) {
    [root1, root2] = normalize(xmlDoc1, xmlDoc2);
    var xml1Str = "<{0}>{1}</{0}>".format(rootTag, root1.innerHTML);
    var xml2Str = "<{0}>{1}</{0}>".format(rootTag, root2.innerHTML);
    return [xml1Str, xml2Str];
}

/**
 * Recursive method to normalize two Element objects and their children.
 * @param {Element} doc1 - Base XML's parsed object
 * @param {Element} doc2 - Changed XML's parsed object
 * @return {Element[]} Two element objects for modified Base and Changed XMLs
 */
function normalize(doc1, doc2) {
    var tagName = doc1.tagName;

    var docChildren1 = doc1.childNodes,
        docChildren2 = doc2.childNodes;

    var nodes1 = [],
        nodes2 = [];

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

    nodes1, nodes2 = reorder(nodes1, nodes2, tags);
    nodes1, nodes2 = matchCount(nodes1, nodes2, tags);
    nodes1, nodes2 = rearrange(nodes1, nodes2, tags);
    nodes1, nodes2 = matchAttributes(nodes1, nodes2);

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

/**
 * Reorder the tags in lists nodes1 and nodes2 in the order of tag names in the
 * list tags.
 * @param {Element[]} nodes1 - List of sibling nodes in Base XML
 * @param {Element[]} nodes2 - List of sibling nodes in Changed XML
 * @param {String[]} tags - Ordered list of tag names
 * @return {Element[], Element[]} Ordered lists nodes1 and nodes2
 */
function reorder(nodes1, nodes2, tags) {

    var childTags1 = getChildTagNames(nodes1),
        childTags2 = getChildTagNames(nodes2),
        orderedNodes1 = [],
        orderedNodes2 = [];

    var index1, index2;
    tags.forEach(function(tag){
        index1 = $.inArray(tag, childTags1);
        while (index1 > -1 && childTags1[index1] == tag) {
            orderedNodes1.push(nodes1[index1]);
            index1++;
        }

        index2 = $.inArray(tag, childTags2);
        while (index2 > -1 && childTags2[index2] == tag) {
            orderedNodes2.push(nodes2[index2]);
            index2++;
        }
    });

    return orderedNodes1, orderedNodes2;
}

/**
 * Given ordered lists nodes1 and nodes2, this function matches the count of
 * each tag in the lists nodes1 and nodes2 by adding empty nodes where the count
 * is not equal.
 * @param {Element[]} nodes1 - List of sibling nodes in Base XML
 * @param {Element[]} nodes2 - List of sibling nodes in Changed XML
 * @param {String[]} tags - Ordered list of tag names
 * @return {Element[], Element[]} Updated lists nodes1 and nodes2
 */
function matchCount(nodes1, nodes2, tags) {

    var childTags1 = getChildTagNames(nodes1);
    var childTags2 = getChildTagNames(nodes2);

    var startIndex, count1, count2, emptyNode;
    tags.forEach(function(tag) {
        startIndex = $.inArray(tag, childTags1);
        if (startIndex == -1) startIndex = $.inArray(tag, childTags2);

        count1 = count(childTags1, tag);
        count2 = count(childTags2, tag);

        if (count1 > count2) {
            for (var i = 0; i < count1 - count2; i++) {
                emptyNode = $.parseXML("<{0}></{0}>".format(tag)).childNodes[0];
                nodes2.splice(startIndex, 0, emptyNode);
            }
        }

        if (count2 > count1) {
            for (var i = 0; i < count2 - count1; i++) {
                emptyNode = $.parseXML("<{0}></{0}>".format(tag)).childNodes[0];
                nodes1.splice(startIndex, 0, emptyNode);
            }
        }
    });

    return nodes1, nodes2;
}

/**
 * Given ordered and matching count lists nodes1 and nodes2, this function
 * rearranges nodes with same tag names so that nodes with same tag name and
 * same text content have the same index in lists nodes1 and nodes2.
 * @param {Element[]} nodes1 - Sibling Nodes from Base XML
 * @param {Element[]} nodes2 - Sibling Nodes from Changed XML
 * @param {String[]} tags - Ordered list of tag names
 * @return {Element[], Element[]} Rearranged lists nodes1 and nodes2
 */
function rearrange(nodes1, nodes2, tags) {

    var childTags = getChildTagNames(nodes1);

    var startIndex, tagCount, tmp;
    tags.forEach(function(tag) {
        startIndex = $.inArray(tag, childTags);
        tagCount = count(childTags, tag);

        if (tagCount > 0) {
            for (var i = startIndex; i < startIndex + tagCount; i++) {
                for (var j = startIndex; j < startIndex + tagCount; j++) {
                    if (i != j && nodes1[i].textContent.trim() == nodes2[j].textContent.trim()) {
                        tmp = nodes2[j];
                        nodes2[j] = nodes2[i];
                        nodes2[i] = tmp;
                    }
                }
            }
        }
    });

    return nodes1, nodes2;
}

/**
 * Given ordered, matching count and arranged lists nodes1 and nodes2 this
 * function matches the attributes of the of each element by adding empty
 * attributes if nodes at the same index do not have the same attributes.
 * @param {Element[]} nodes1 - Sibling Nodes from Base XML
 * @param {Element[]} nodes2 - Sibling Nodes from Changed XML
 * @return {Element[], Element[]} Lists nodes1 and nodes2 with matching
 * attributes
 */
function matchAttributes(nodes1, nodes2) {

    var attrs;
    for (var i = 0; i < nodes1.length; i++) {

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

/**
 * Returns the names of child tags of the given node.
 * @param {Element} nodes - An XML node
 * @return {String[]} List of names of the child tags of node
 */
function getChildTagNames(nodes) {
    var childTags = [];
    nodes.forEach(function (child) {
        if (child.tagName !== undefined) childTags.push(child.tagName);
    });
    return childTags;
}

/**
 * Creates XML tree provided by Mithya (http://www.github.com/koppor/xmltree)
 * for the give XML in the given div with the given name.
 * @param {String} xml - XML for which tree is to be created
 * @param {String} div - id of the div in which xmltree is to be rendered
 * @param {String} treeName - name of the tree
 */
function createXMLTree(xml, div, treeName) {
    var tree = new XMLTree({
      xml: xml,
      container: div,
      startExpanded: true,
      noURLTracking: true,
      attrsAsData: true,
      name: treeName
    });
}

/**
 * Adds diff coloring by adding CSS classes to the input fields
 */
function visualizeDiff() {
    var fromTree = $("#{0} input".format(FROM_DIV));
    var toTree =$("#{0} input".format(TO_DIV));
    if (fromTree.length == toTree.length) {
        var toVals = [],
            ind = 0
            attrInd = 0;

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
