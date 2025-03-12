// Symbol polyfill
if (!global.Symbol) {
    global.Symbol = function(description) {
        return `Symbol(${description})`;
    };
    
    global.Symbol.iterator = global.Symbol('Symbol.iterator');
    global.Symbol.for = global.Symbol;
    global.Symbol.keyFor = function(sym) {
        return sym;
    };
} 