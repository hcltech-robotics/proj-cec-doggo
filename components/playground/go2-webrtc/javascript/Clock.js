export class Clock {
  constructor(n = !0) {
    (this.autoStart = n),
      (this.startTime = 0),
      (this.oldTime = 0),
      (this.elapsedTime = 0),
      (this.running = !1);
  }
  start() {
    (this.startTime = now()),
      (this.oldTime = this.startTime),
      (this.elapsedTime = 0),
      (this.running = !0);
  }
  stop() {
    this.getElapsedTime(), (this.running = !1), (this.autoStart = !1);
  }
  getElapsedTime() {
    return this.getDelta(), this.elapsedTime;
  }
  getDelta() {
    let n = 0;
    if (this.autoStart && !this.running) return this.start(), 0;
    if (this.running) {
      const o = now();
      (n = (o - this.oldTime) / 1e3),
        (this.oldTime = o),
        (this.elapsedTime += n);
    }
    return n;
  }
}

function now() {
  return (typeof performance > "u" ? Date : performance).now();
}
