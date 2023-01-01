export class Stack {
  s = [];
  constructor(stack) {
    this.s = stack;
  }

  push(piece) {
    this.s.push(piece);
  }

  pop() {
    return this.s.pop();
  }

  top() {
    return this.s[this.s.length - 1];
  }

  length() {
    return this.s.length;
  }

  convertToArray() {
    return this.s;
  }
}
