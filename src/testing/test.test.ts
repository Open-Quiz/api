import { expect, test } from 'vitest';

test('Test', () => {
    class Example {
        private name: string;

        constructor(name: string) {
            this.name = name;
        }

        public value() {
            return this.name;
        }
    }

    const instance = new Example('Hi');

    const method = instance.value.bind(instance);
    const wrappedMethod = () => method();

    expect(instance.value()).toEqual('Hi');
    expect(method()).toEqual('Hi');
    expect(wrappedMethod()).toEqual('Hi');
});
