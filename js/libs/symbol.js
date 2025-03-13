// Symbol polyfill
if (!GameGlobal.Symbol) {
    GameGlobal.Symbol = function(description) {
        return `Symbol(${description})`;
    };
    
    GameGlobal.Symbol.iterator = GameGlobal.Symbol('Symbol.iterator');
    GameGlobal.Symbol.for = GameGlobal.Symbol;
    GameGlobal.Symbol.keyFor = function(sym) {
        return sym;
    };
} 