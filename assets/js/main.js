function generateDiff() {
    var fromXML = document.getElementById('text1').value;
    var toXML = document.getElementById('text2').value;

    if (fromXML == null || fromXML == undefined || fromXML.trim() == "") {
        alert("Base XML cannot be emtpy");
    } else if (toXML == null || toXML == undefined || toXML.trim() == "") {
        alert("Changed XML cannot be empty");
    } else {
        if (fromXML == "") fromXML = "<{0}></{0}>".format(rootTag);
        if (toXML == "") toXML = "<{0}></{0}>".format(rootTag);

        var xmlDoc1, xmlDoc2;

        try {
            xmlDoc1 = $.parseXML(fromXML);
        } catch (err) {
            alert("Base XML is not well formatted");
            return;
        }

        try {
            xmlDoc2 = $.parseXML(toXML);
        } catch (err) {
            alert("Changed XML is not well formatted");
            return;
        }

        xmlDoc1 = xmlDoc1.childNodes[0];
        xmlDoc2 = xmlDoc2.childNodes[0];

        if (xmlDoc1.tagName != xmlDoc2.tagName) {
            alert('Root tags do not match. The two XMLs cannot be compared');
            return;
        }

        createDiffVisualization(xmlDoc1, xmlDoc2);
        $('#inputs').hide();
        $('#compare').show();
    }
}

function generateAnotherDiff() {
    document.getElementById('text1').value = "";
    document.getElementById('text2').value = "";
    $('#compare').hide();
    $('#inputs').show();
}

function main() {
    $('#compare').hide();
    $('#generateDiff').click(generateDiff);
    $('#generateAnotherDiff').click(generateAnotherDiff);
}

main();
