var PAR_TAG = "system";
var FROM_DIV = "from_tree";
var TO_DIV = "to_tree";
var PARENT_CLASSES = ["system", "star", "planet", "binary"];

var tagsDict;
// var tagsDict = {
//     planet: ['name', 'list', 'semimajoraxis', 'eccentricity',
//             'periastron', 'longitude', 'ascendingnode', 'inclination',
//             'impactparameter', 'meananomaly', 'period', 'transittime',
//             'periastrontime', 'maximumrvtime', 'separation', 'mass',
//             'radius', 'temperature', 'age', 'discoverymethod',
//             'istransiting', 'new', 'description', 'discoveryyear',
//             'lastupdate', 'image', 'imagedescription',
//             'spinorbitalignment', 'positionangle', 'metallicity',
//             'spectraltype', 'magB', 'magH', 'magI', 'magJ', 'magK',
//             'magR', 'magU', 'magV'],
//     star: ['name', 'planet', 'mass', 'radius', 'temperature',
//             'age', 'metallicity', 'spectraltype', 'magB', 'magH', 'magI', 'magJ',
//             'magK', 'magR', 'magU', 'magV'],
//
//     binary: ['name', 'binary', 'star', 'planet', 'semimajoraxis',
//             'eccentricity', 'periastron', 'longitude', 'meananomaly',
//             'ascendingnode', 'inclination', 'period', 'transittime',
//             'periastrontime', 'maximumrvtime', 'separation',
//             'positionangle', 'magB', 'magH', 'magI', 'magJ', 'magK',
//             'magR', 'magU', 'magV'],
//     system: ['name', 'binary', 'planet', 'star', 'spectraltype',
//             'rightascension', 'declination', 'distance', 'epoch',
//             'videolink', 'magB', 'magH', 'magI', 'magJ', 'magK',
//             'magR', 'magU', 'magV']
// };

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
    if (fromXML == "") fromXML = "<{0}></{0}>".format(PAR_TAG);
    if (toXML == "") toXML = "<{0}></{0}>".format(PAR_TAG);

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
        if (child.nodeType == child.ELEMENT_NODE && count(tagsDict[node.tagName], child.tagName) == 0) {
            tagsDict[node.tagName].push(child.tagName);
        }
    });
    children.forEach(function (child) {
        if (child.nodeType == child.ELEMENT_NODE) {
            updateTagsDict(child);
        }
    });
}

function visualizeDiff() {
    var from_tree = $("#{0} input".format(FROM_DIV));
    var to_tree =$("#{0} input".format(TO_DIV));
    if (from_tree.length == to_tree.length) {
        var from_vals = [];
        var to_vals = [];
        var ind = 0;
        var attrInd = 0;

        $.each(to_tree, function(data, listNode) {
            node = $(listNode);
            nodeClass = node.attr("class");
            if (PARENT_CLASSES.indexOf(nodeClass) == -1) {
                to_vals.push(node);
            }
        });

        $.each(from_tree, function(data, listNode) {
            node = $(listNode);
            nodeClass = node.attr("class");
            if (PARENT_CLASSES.indexOf(nodeClass) == -1) {

                inputVal = node.val();
                toVal = to_vals[ind].val();

                if (inputVal && !toVal) {
                    $(node).attr("class", "insert");
                    $(to_vals[ind]).attr("class", "delete");
                }
                else if (toVal && !inputVal) {
                    $(node).attr("class", "delete");
                    $(to_vals[ind]).attr("class", "insert");
                }
                else if (inputVal != toVal) {
                    $(node).attr("class", "different");
                    $(to_vals[ind]).attr("class", "different");
                }

                ind += 1;
            }
        });
    }
}
