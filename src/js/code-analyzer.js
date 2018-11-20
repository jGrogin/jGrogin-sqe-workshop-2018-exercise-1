import * as esprima from 'esprima';

const parseCode = (codeToParse) => {
    return esprima.parseScript(codeToParse);
};

const parseCode_with_source = (codeToParse) => {
    return esprima.parseScript(codeToParse, {loc: true, range: true}, node => node.txt =
        codeToParse.substring(node.range[0], node.range[1]));
};

var typeToHandlerMapping;

const parsed_to_table = (parsedCode) => {
    return parsedCode['body'].map(x => parse_single(x)).flat();
};

const parse_single = (parsedCode) => {
    typeToHandlerMapping = {
        'VariableDeclaration': parse_let, 'FunctionDeclaration': parse_function,
        'ExpressionStatement': parse_expressionStatement,
        'WhileStatement': parse_whileStatement, 'IfStatement': parse_ifStatement,
        'BlockStatement': parse_blockStatement, 'AssignmentExpression': parse_assignmentExp,
        'ReturnStatement': parse_returnStatement, 'ForStatement': parse_forStatement,
        'ForInStatement': parse_forInStatement, 'ForOfStatement': parse_forInStatement,
        'BreakStatement': parse_breakStatement, 'ContinueStatement': parse_breakStatement,
        'LabeledStatement': parse_labeledStatement, 'UpdateExpression': parse_updateExpression,
        'DoWhileStatement': parse_doWhileStatement
    };
    var structureType = parsedCode['type'];
    let func = typeToHandlerMapping[structureType];
    return func ? func.call(undefined, parsedCode) : {
        'Line': parsedCode.loc.start.line, 'Type': 'Unsupported Type', 'Name': '---',
        'Condition': '---', 'Value': parsedCode.txt
    };
};

const parse_expressionStatement = (parsedCode) => {
    return parse_single(parsedCode.expression);
};

const parse_let = (parsedCode) => {
    return parsedCode['declarations'].map(x => ({
        'Line': x['id'] ['loc']['start']['line'], 'Type': parsedCode.type, 'Name': x['id']['name'],
        'Condition': '', 'Value': x['init'] ? parse_exp_txt(x['init']) : ''
    }));
};

const parse_function = (parsedCode) => {
    let name = parsedCode['id']['name'];
    let params = parsedCode.params.map(x => ({
        'Line': x['loc']['start']['line'], 'Type': 'Params: ' + x.type, 'Name': x['name'],
        'Condition': '', 'Value': ''
    }));
    return [{
        'Line': parsedCode['id']['loc']['start']['line'], 'Type': parsedCode.type, 'Name': name,
        'Condition': '', 'Value': ''
    }].concat(params).concat(parse_single(parsedCode.body));
};

const parse_assignmentExp = (parsedCode) => {
    return {
        'Line': parsedCode['left']['loc']['start']['line'], 'Type': parsedCode.type, 'Name': parsedCode['left']['name'],
        'Condition': '', 'Value': (parsedCode.operator != '=' ? parsedCode.operator : '') +
        parse_exp_txt(parsedCode['right'])
    };
};

const parse_whileStatement = (parsedCode) => {
    return [{
        'Line': parsedCode['loc']['start']['line'], 'Type': parsedCode.type, 'Name': '',
        'Condition': parsedCode.test.txt, 'Value': ''
    }].concat(parse_single(parsedCode.body));

};

const parse_doWhileStatement = (parsedCode) => {
    return [{
        'Line': parsedCode['loc']['start']['line'], 'Type': parsedCode.type, 'Name': '',
        'Condition': parsedCode.test.txt, 'Value': ''
    }].concat(parse_single(parsedCode.body));

};

const parse_ifStatement = (parsedCode) => {
    return [{
        'Line': parsedCode['loc']['start']['line'], 'Type': parsedCode.type, 'Name': '',
        'Condition': parsedCode.test.txt, 'Value': ''
    }].concat([])
        .concat(parse_single(parsedCode.consequent)).concat(parsedCode['alternate'] ? [{
            'Line': '', 'Type': 'else', 'Name': '',
            'Condition': '', 'Value': ''
        }].concat(parse_single(parsedCode.alternate)) : []);
};

const parse_blockStatement = (parsedCode) => {
    return parsedCode.body.map((x => parse_single(x))).flat();
};

const parse_returnStatement = (parsedCode) => {
    return {
        'Line': parsedCode['loc']['start']['line'], 'Type': parsedCode.type, 'Name': '',
        'Condition': '', 'Value': parsedCode.argument.txt
    };
};

const parse_forStatement = (parsedCode) => {
    return [{
        'Line': parsedCode['loc']['start']['line'], 'Type': parsedCode.type, 'Name': '',
        'Condition': parsedCode.init.txt + ', ' + parsedCode.test.txt + ', ' + parsedCode.update.txt, 'Value': ''
    }].concat(parse_single(parsedCode.body));

};

const parse_forInStatement = (parsedCode) => {
    return [{
        'Line': parsedCode['loc']['start']['line'], 'Type': parsedCode.type, 'Name': '',
        'Condition': parsedCode.left.txt + (parsedCode.type == 'ForInStatement' ? ' in ' : ' of ') +
        parsedCode.right.txt, 'Value': ''
    }].concat(parse_single(parsedCode.body));

};

const parse_updateExpression = (parsedCode) => {
    return {
        'Line': parsedCode['loc']['start']['line'], 'Type': parsedCode.type, 'Name': '',
        'Condition': '', 'Value': parsedCode.txt
    };

};

const parse_breakStatement = (parsedCode) => {
    return {
        'Line': parsedCode['loc']['start']['line'], 'Type': parsedCode.type, 'Name': '',
        'Condition': '', 'Value': parsedCode.label ? parsedCode.label.txt : ''
    };

};

const parse_labeledStatement = (parsedCode) => {
    return [{
        'Line': parsedCode['loc']['start']['line'], 'Type': parsedCode.type, 'Name': parsedCode.label.txt,
        'Condition': '', 'Value': parsedCode.label.txt
    }].concat(parse_single(parsedCode.body));

};

const parse_exp_txt = (parsedCode) => {
    return parsedCode.txt;
};

//not all browsers support flat: so I added support for flat
Object.defineProperty(Array.prototype, 'flat', {
    value: function () {
        return this.reduce(function (flat, toFlatten) {
            return flat.concat(toFlatten);
        }, []);
    }
});

export {parseCode, parseCode_with_source, parsed_to_table};
