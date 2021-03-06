﻿function StreamHooker(stream) {
    const messages = [];

    const oldWritingMethod = stream.write;
    stream.write = (string) => {
        messages.push(string.trim());
    };
    
    this.endWriting = () => {
        stream.write = oldWritingMethod;
        return messages;
    };
}

module.exports = StreamHooker;