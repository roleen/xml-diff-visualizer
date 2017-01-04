var PAR_TAG = "system";
var FROM_DIV = "from_tree";
var TO_DIV = "to_tree";
var PARENT_CLASSES = ["system", "star", "planet", "binary"];

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


    [fromXML, toXML] = normalizeXML(fromXML, toXML);

    document.getElementById(FROM_DIV).innerHTML = "";
    document.getElementById(TO_DIV).innerHTML = "";

    createXMLTree(fromXML, "#{0}".format(FROM_DIV), "from");
    createXMLTree(toXML, "#{0}".format(TO_DIV), "to");

    visualizeDiff();
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
