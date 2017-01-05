function generateDiff() {
    var fromXML = document.getElementById('text1').value;
    var toXML = document.getElementById('text2').value;
    populate(fromXML, toXML);
    $('#inputs').hide();
    $('#compare').show();
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
