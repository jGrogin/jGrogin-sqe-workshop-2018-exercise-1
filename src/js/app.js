import $ from 'jquery';
import {parseCode, parseCode_with_source, parsed_to_table} from './code-analyzer';

function make_table_fields(fieldTitles) {
    let thr = document.createElement('tr');
    fieldTitles.forEach((fieldTitle) => {
        let th = document.createElement('th');
        th.appendChild(document.createTextNode(fieldTitle));
        thr.appendChild(th);
    });
    return thr;
}

function create_table_rows(objectArray, fields, tbdy) {
    objectArray.forEach((object) => {
        let tr = document.createElement('tr');
        fields.forEach((field) => {
            var td = document.createElement('td');
            td.appendChild(document.createTextNode(object[field]));
            tr.appendChild(td);
        });
        tbdy.appendChild(tr);
    });
}

function createTable(objectArray, fields, fieldTitles) {
    let tbl = document.createElement('table');
    let thead = document.createElement('thead');
    let thr = make_table_fields(fieldTitles);
    thead.appendChild(thr);
    tbl.appendChild(thead);
    let tbdy = document.createElement('tbody');
    create_table_rows(objectArray, fields, tbdy);
    tbl.appendChild(tbdy);
    return tbl;
}

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
    });
});


$(document).ready(function () {
    $('#codeTableSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parsed_to_table(parseCode_with_source(codeToParse));
        document.getElementById('t1').innerHTML = '';
        document.getElementById('t1').appendChild(createTable(parsedCode, ['Line', 'Type', 'Name', 'Condition', 'Value'],
            ['Line', 'Type', 'Name', 'Condition', 'Value']));
    });
});

