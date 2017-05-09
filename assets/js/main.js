var baseEditor, changedEditor;

function generateDiff() {
    var fromXML = baseEditor.getValue();
    var toXML = changedEditor.getValue();

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
    baseEditor.setValue("");
    changedEditor.setValue("");
    backToEditor();
}

function backToEditor() {
    $('#compare').hide();
    $('#inputs').show();
}

function syntaxHighlight() {
    var baseInput = $('.codemirror-textarea')[0];
    var changedInput = $('.codemirror-textarea')[1];
    var editorSettings = {
        lineNumbers : true,
        mode : "xml"
    };
    
    baseEditor = CodeMirror.fromTextArea(baseInput, editorSettings);
    changedEditor = CodeMirror.fromTextArea(changedInput, editorSettings);
}

function main() {
    $('#compare').hide();
    $('#generateDiff').click(generateDiff);
    $('#generateAnotherDiff').click(generateAnotherDiff);
    $('#backToEditor').click(backToEditor);
    syntaxHighlight();
}

$(document).ready(function() {
    main();
});
