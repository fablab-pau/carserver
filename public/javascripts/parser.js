var commands = [
    {
        name: 'FORWARD',
        regexp: /forward\(([0-9]+)\);/
    },
    {
        name: 'RIGHT',
        regexp: /right\(\);/
    },
    {
        name: 'LEFT',
        regexp: /left\(\);/
    },
    {
        name: 'REVERSE',
        regexp: /reverse\(([0-9]+)\);/
    },
    {
        name: 'STRAIGHT',
        regexp: /straight\(\);/
    }
]


function parse(text) {
    var errors = [];
    var program = [];
    var lines = text.split('\n');
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        if (line === "") {
            continue;
        }
        var match = false;
        for (var j = 0; j < commands.length; j++) {
            var res = line.match(commands[j].regexp);
            if (res) {
                match = true;
                program.push({command: commands[j].name, arguments: res.slice(1)});
                break;
            }

        }
        if (!match) {
            errors.push(i);
        }
    }
    return [errors.length > 0 ? errors : null, program];
}
