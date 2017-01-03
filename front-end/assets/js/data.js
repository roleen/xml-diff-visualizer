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

function populate(filename) {

    var fromXML =  '<system> \
                  	<name>11 Com</name> \
                  	<rightascension>12 20 43</rightascension> \
                  	<declination>+17 47 34</declination> \
                  	<distance errorminus="1.7" errorplus="1.7">88.9</distance> \
                  	<star> \
                  		<name>11 Com</name> \
                  		<name>11 Comae Berenices</name> \
                  		<name>HD 107383</name> \
                  		<name>HIP 60202</name> \
                  		<name>TYC 1445-2560-1</name> \
                  		<name>SAO 100053</name> \
                  		<name>HR 4697</name> \
                  		<name>BD+18 2592</name> \
                  		<name>2MASS J12204305+1747341</name> \
                  		<spectraltype>G8 III</spectraltype> \
                  		<planet> \
                  			<name>11 Com b</name> \
                  			<list>Confirmed planets</list> \
                  			<mass errorminus="1.5" errorplus="1.5" type="msini">19.4</mass> \
                  			<lastupdate>15/09/20</lastupdate> \
                  			<discoveryyear>2008</discoveryyear> \
                  		</planet> \
                  	</star> \
                  	<videolink>http://youtu.be/qyJXJJDrEDo</videolink> \
                  </system>';
      var toXML =  '<system> \
                    	<name>11 Come</name> \
                    	<rightascension>12 20 43.04</rightascension> \
                    	<declination>+17 47 34.2</declination> \
                    	<distance errorminus="1.7" errorplus="1.45">88.9</distance> \
                    	<star> \
                    		<name>11 Com</name> \
                    		<name>11 Comae Berenices</name> \
                    		<name>HD 107383</name> \
                    		<name>HIP 60202</name> \
                    		<name>TYC 1445-2560-1</name> \
                    		<name>SAO 100053</name> \
                    		<name>HR 4697</name> \
                    		<name>BD+18 2592</name> \
                    		<name>2MASS J12204305+1747341</name> \
                    		<spectraltype>G8 III</spectraltype> \
                    		<planet> \
                    			<name>11 Com b</name> \
                    			<list>Confirmed planets</list> \
                    			<mass errorminus="1.5" errorplus="1.1123" type="msini">19.4</mass> \
                    			<lastupdate>15/09/20</lastupdate> \
                    			<discoveryyear>2008</discoveryyear> \
                    		</planet> \
                    	</star> \
                    	<videolink>http://youtu.be/qyJXJJDrEDo</videolink> \
                    </system>';
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
    if (oec_tree.length == other_tree.length) {
        var oec_vals = [];
        var other_vals = [];
        var ind = 0;
        var attrInd = 0;

        $.each(to_tree, function(data, listNode) {
            node = $(listNode);
            nodeClass = node.attr("class");
            if (PARENT_CLASSES.indexOf(nodeClass) == -1) {
                other_vals.push(node);
            }
        });

        $.each(oec_tree, function(data, listNode) {
            node = $(listNode);
            nodeClass = node.attr("class");
            if (PARENT_CLASSES.indexOf(nodeClass) == -1) {

                inputVal = node.val();
                otherVal = other_vals[ind].val();

                if (inputVal && !otherVal) {
                    $(node).attr("class", "insert");
                    $(other_vals[ind]).attr("class", "delete");
                }
                else if (otherVal && !inputVal) {
                    $(node).attr("class", "delete");
                    $(other_vals[ind]).attr("class", "insert");
                }
                else if (inputVal != otherVal) {
                    $(node).attr("class", "different");
                    $(other_vals[ind]).attr("class", "different");
                }

                ind += 1;
            }
        });
    }
}

populate();
