const assert = require('assert');

const validate = require('../tools/validate');

const randomiser = require('./infrastructure/randomiser');
const getRandomInt = randomiser.getRandomIntUpToMaxInteger;
const getRandomStr = randomiser.getRandomIntUpToMaxAsString;

describe('validate', () => 
    describe ('#validate', () => {
        const generateObject = (containsHtml = false) => {
            const obj = { 
                name: getRandomStr(), 
                internal: {
                    name: getRandomStr(),
                    post: { text: getRandomStr() },
                    comment: containsHtml ? '<div>Something adverse here</div>' : getRandomStr()
                },
                assertComparisonWith: (otherObj) => {
                    assert.strictEqual(otherObj.name, obj.name);
                    assert(otherObj.internal && obj.internal);

                    assert.strictEqual(otherObj.internal.name, obj.internal.name);
                    assert.strictEqual(otherObj.internal.comment === obj.internal.comment, !containsHtml);

                    assert(otherObj.internal.post && obj.internal.post);
                    assert.strictEqual(otherObj.internal.post.text, obj.internal.post.text);
                }
            };
            return obj;
        };
        
        it ('should escape potentially harmful html symbols in input without touching the rest', () => {
            const harmfulObject = { htmlObj: generateObject(true) };
            
            const input = {
                objects: [generateObject(), 
                    { objects: [generateObject(), harmfulObject] }, 
                    getRandomStr(), getRandomInt()],
                strings: [getRandomStr(), getRandomStr(), getRandomStr()],
                id: getRandomInt()
            };
            
            const output = validate(input);
            assert(output);

            assert.strictEqual(output.id, input.id);
            assert.deepStrictEqual(output.strings, input.strings);

            input.objects.forEach((o, i) => {
                const internalObjs = o['objects'];
                const objToCheck = output.objects[i];

                if (!internalObjs)
                    assert.deepStrictEqual(objToCheck, o);
                else {
                    const internalObjsToCheck = objToCheck['objects'];
                    assert.deepStrictEqual(internalObjsToCheck[0], internalObjs[0]);
                    
                    console.error('SHIT 1:' + JSON.stringify(internalObjs[1]));
                    console.error('SHIT 2:' + JSON.stringify(internalObjsToCheck[1]));
                    
                    internalObjs[1].htmlObj.assertComparisonWith(internalObjsToCheck[1].htmlObj);
                }
            });
        });
    }));
    