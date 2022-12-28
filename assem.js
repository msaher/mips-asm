let fs = require("fs")

function r(op, funct) {
    return {type: "r", op, funct};
}

function i(op) {
    return {type: "i", op};
}

function j(op) {
    return {type: "j", op};
}


const INS = {
    "and":  r(0, 0),
    "or":   r(0, 1),
    "xor":  r(0, 2),
    "nor":  r(0, 3),
    "add":  r(0, 4),
    "sub":  r(0, 5),
    "slt":  r(0, 6),
    "sltu": r(0, 7),

    "movz": r(1, 0),
    "movn": r(1, 1),
    "sll":  r(1, 2),
    "srl":  r(1, 3),
    "sra":  r(1, 4),
    "ror":  r(1, 5),
    "jr":   r(1, 6),
    "jalr": r(1, 7),

    "andi": i(2),
    "ori":  i(3),
    "addi": i(4),
    "sw":   i(5),
    "lw":   i(6),
    "bne":  i(7),
    "beq":  i(8),
    "bgt":  i(9),
    "bge":  i(10),
    "blt":  i(11),
    "ble":  i(12),

    "lui":  j(13),
    "j":    j(14),
    "jal":  j(15)
};

function toBinary(num, n) {
    num = parseInt(num);
    let bin;
    if (num < 0) {
        bin = (num >>> 0).toString(2).slice(-n) // js is weird https://stackoverflow.com/questions/16155592/negative-numbers-to-binary-string-in-javascript
    }
    else {
        bin = num.toString(2);
        let diff = n - bin.length
        if (diff > 0)
            bin = "0".repeat(diff) + bin; // 0 extension to the left
    }
    return bin;
}


function translate(line) {
    let tokens = line.split(/\s+/);
    let insName = tokens[0];
    let ins = INS[insName];

    if (ins == undefined) {
        throw new Error("Unknown instruction", insName);
    }


    if (ins.type === "r") {
        let op = toBinary(ins.op, 4);
        let funct = toBinary(ins.funct, 3);
        let rs, rd, rt;

        if (insName === "jr") {
            rd = toBinary("0", 3);
            rs = toBinary(tokens[1].replace("$",""), 3);
            rt = toBinary("0", 3);
        }

        else if(insName === "jalr") {
            rd = toBinary(tokens[1].replace("$",""), 3);
            rs = toBinary(tokens[2].replace("$",""), 3);
            rt = toBinary("0", 3);
        }


        else {
            rd = toBinary(tokens[1].replace("$",""), 3);
            rs = toBinary(tokens[2].replace("$",""), 3);
            rt = toBinary(tokens[3].replace("$",""), 3);
        }
        return parseInt(op + rd + rs + rt + funct, 2).toString(16).padStart(4, "0");;
    }

    else if (ins.type === "i") {
        let op = toBinary(ins.op, 4);
        let rd = toBinary(tokens[1].replace("$",""), 3);
        let rs = toBinary(tokens[2].replace("$",""), 3);
        let imm6 = toBinary(tokens[3], 6);
        return parseInt(op + rd + rs + imm6, 2).toString(16).padStart(4, "0");
    }

    else if (ins.type === "j") {
        let op = toBinary(ins.op, 4);
        let imm12 = toBinary(tokens[1], 12);

        return parseInt(op + imm12, 2).toString(16).padStart(4, "0");;
    }

    else {
        throw new Error("Unknown instruction", insName);
    }

}

function compile(str) {
    str = str.replace(/(^[ \t]*\n)/gm, "") // remove empty newlines
    let lines = str.split('\n');

    lines.splice(-1) // empty line

    let bin = []
    for (l of lines)
        if (!/^\s*#/.test(l)) // skip comments
            bin.push(translate(l));

    return bin
}

function space(str) {
    let arr = str.match(/.{1,4}/g);
    return arr.join(' ');
}

function main() {
    const name = process.argv[2];
    let code = fs.readFileSync(name).toString();
    let res = compile(code);

    res = res.map((r) => space(r));
    console.log(res.join(' '));
}

main();
