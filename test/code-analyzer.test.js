import assert from 'assert';
import {parseCode, parseCode_with_source, parsed_to_table} from '../src/js/code-analyzer';

describe('The javascript parser', () => {
    it('is parsing an empty function correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('')),
            '{"type":"Program","body":[],"sourceType":"script"}'
        );
    });

    it('is parsing a simple variable declaration correctly', () => {
        assert.equal(
            JSON.stringify(parseCode('let a = 1;')),
            '{"type":"Program","body":[{"type":"VariableDeclaration","declarations":[{"type":"VariableDeclarator","id":{"type":"Identifier","name":"a"},"init":{"type":"Literal","value":1,"raw":"1"}}],"kind":"let"}],"sourceType":"script"}'
        );
    });
});

describe('The javascript code analyzer', () => {
    it('is analysing an empty function correctly', () => {
        assert.equal(
            JSON.stringify(parsed_to_table(parseCode_with_source(''))),
            '[]'
        );
    });

    it('is analysing a simple variable declaration correctly', () => {
        assert.equal(
            JSON.stringify(parsed_to_table(parseCode_with_source('let a = 1;'))),
            '[{"Line":1,"Type":"VariableDeclaration","Name":"a","Condition":"","Value":"1"}]'
        );
    });
    it('is analysing binarySearch function correctly', () => {
        assert.equal(
            JSON.stringify(parsed_to_table(parseCode_with_source('function binarySearch(X, V, n){\n' +
                '    let low, high, mid;\n' +
                '    low = 0;\n' +
                '    high = n - 1;\n' +
                '    while (low <= high) {\n' +
                '        mid = (low + high)/2;\n' +
                '        if (X < V[mid])\n' +
                '            high = mid - 1;\n' +
                '        else if (X > V[mid])\n' +
                '            low = mid + 1;\n' +
                '        else\n' +
                '            return mid;\n' +
                '    }\n' +
                '    return -1;\n' +
                '}')).filter(x => x.Line != '').map(x => [x.Line, x.Type, x.Name])),
            '[[1,"FunctionDeclaration","binarySearch"],[1,"Params: Identifier","X"],[1,"Params: Identifier","V"],' +
            '[1,"Params: Identifier","n"],[2,"VariableDeclaration","low"],[2,"VariableDeclaration","high"],' +
            '[2,"VariableDeclaration","mid"],[3,"AssignmentExpression","low"],[4,"AssignmentExpression","high"],' +
            '[5,"WhileStatement",""],[6,"AssignmentExpression","mid"],[7,"IfStatement",""],[8,"AssignmentExpression",' +
            '"high"],[9,"IfStatement",""],[10,"AssignmentExpression","low"],[12,"ReturnStatement",""],' +
            '[14,"ReturnStatement",""]]'
        );
    });
    it('is analysing for Loops correctly', () => {
        assert.equal(
            JSON.stringify(parsed_to_table(parseCode_with_source('for(i = 0;i<5;i++)\n' +
                '    a = a+1;\n' +
                'for(var x in arr)\n' +
                '    a = a+1;\n' +
                'for(var x of arr)\n' +
                '    a = a+1;')).filter(x => x.Line != '').map(x => [x.Line, x.Type, x.Name, x.Condition, x.Value])),
            '[[1,"ForStatement","","i = 0, i<5, i++",""],[2,"AssignmentExpression","a","","a+1"],[3,"ForInStatement","",' +
            '"var x in arr",""],[4,"AssignmentExpression","a","","a+1"],[5,"ForOfStatement","","var x of arr",""],' +
            '[6,"AssignmentExpression","a","","a+1"]]'
        );
    });
    it('is analysing while Loops correctly', () => {
        assert.equal(
            JSON.stringify(parsed_to_table(parseCode_with_source('while(true)\n' +
                '    a = a+1;\n' +
                'do \n' +
                '  i += 1;\n' +
                'while (i < 5);\n' +
                'labelCancelLoops: while (true) {\n' +
                '  x += 1;\n' +
                '  z = 1;\n' +
                '  while (true) {\n' +
                '    z += 1;\n' +
                '    if (z === 10 && x === 10) \n' +
                '      break labelCancelLoops;\n' +
                '     else if (z === 10) \n' +
                '      break;\n' +
                '  }\n' +
                '}\n')).filter(x => x.Line != '').map(x => [x.Line, x.Type, x.Name, x.Condition, x.Value])),
            '[[1,"WhileStatement","","true",""],[2,"AssignmentExpression","a","","a+1"],' +
            '[3,"DoWhileStatement","","i < 5",""],[4,"AssignmentExpression","i","","+=1"],' +
            '[6,"LabeledStatement","labelCancelLoops","","labelCancelLoops"],[6,"WhileStatement","","true",""],' +
            '[7,"AssignmentExpression","x","","+=1"],[8,"AssignmentExpression","z","","1"],' +
            '[9,"WhileStatement","","true",""],[10,"AssignmentExpression","z","","+=1"],' +
            '[11,"IfStatement","","z === 10 && x === 10",""],[12,"BreakStatement","","","labelCancelLoops"],' +
            '[13,"IfStatement","","z === 10",""],[14,"BreakStatement","","",""]]'
        );
    });
    it('is analysing i++ i-- ++i --i correctly', () => {
        assert.equal(
            JSON.stringify(parsed_to_table(parseCode_with_source('i++;\n' +
                'i--;\n' +
                '++i;\n' +
                '--i;')).filter(x => x.Line != '').map(x => [x.Line, x.Type, x.Value])),
            '[[1,"UpdateExpression","i++"],[2,"UpdateExpression","i--"],[3,"UpdateExpression","++i"],' +
            '[4,"UpdateExpression","--i"]]'
        );
    });
    it('is analysing continue; continue label; correctly', () => {
        assert.equal(
            JSON.stringify(parsed_to_table(parseCode_with_source('checkiandj:\n' +
                '  while (i < 4) {\n' +
                '    i += 1;\n' +
                '    checkj:\n' +
                '      while (j > 4) {\n' +
                '        j -= 1;\n' +
                '        if ((j % 2) == 0) {\n' +
                '          continue checkj;\n' +
                '        }\n' +
                '      }\n' +
                '  }\n' +
                'while(true)\n' +
                'continue;')).filter(x => x.Line != '').map(x => [x.Line, x.Type, x.Name, x.Condition, x.Value])),
            '[[1,"LabeledStatement","checkiandj","","checkiandj"],[2,"WhileStatement","","i < 4",""],' +
            '[3,"AssignmentExpression","i","","+=1"],' +
            '[4,"LabeledStatement","checkj","","checkj"],[5,"WhileStatement","","j > 4",""],' +
            '[6,"AssignmentExpression","j","","-=1"],[7,"IfStatement","","(j % 2) == 0",""],' +
            '[8,"ContinueStatement","","","checkj"],[12,"WhileStatement","","true",""],' +
            '[13,"ContinueStatement","","",""]]'
        );
    });
    it('is analysing Unsupported Type correctly', () => {
        assert.equal(
            JSON.stringify(parsed_to_table(parseCode_with_source('if(true)\n' +
                'foo();'))
                .filter(x => x.Line != '').map(x => [x.Line, x.Type])),
            '[[1,"IfStatement"],[2,"Unsupported Type"]]'
        );
    });
    it('is analysing var Type correctly', () => {
        assert.equal(
            JSON.stringify(parsed_to_table(parseCode_with_source('var x =1;\n' +
                'var x;'))
                .filter(x => x.Line != '').map(x => [x.Line, x.Type, x.Name, x.Value])),
            '[[1,"VariableDeclaration","x","1"],[2,"VariableDeclaration","x",""]]'
        );
    });
    it('is analysing const Type correctly', () => {
        assert.equal(
            JSON.stringify(parsed_to_table(parseCode_with_source('const x =1;'))
                .filter(x => x.Line != '').map(x => [x.Line, x.Type, x.Name, x.Value])),
            '[[1,"VariableDeclaration","x","1"]]'
        );
    });


});