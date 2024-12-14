export function KeyboardState() {
  const r = {
      left: "a",
      up: "w",
      right: "d",
      down: "s",
      space: " ",
      arrowUp: "ArrowUp",
      arrowDown: "ArrowDown",
      arrowLeft: "ArrowLeft",
      arrowRight: "ArrowRight",
      tab: "Tab",
      shift: "Shift",
      ctrl: "Control",
      alt: "Alt",
      meta: "Meta",
    },
    n = {
      keyCodes: {},
      pressed: (u) => {
        const l = u.split("+");
        for (let f = 0; f < l.length; f++) {
          const _ = l[f];
          let g;
          if ((Object.keys(r).indexOf(_) != -1 && (g = n.keyCodes[r[_]]), !g))
            return !1;
        }
        return !0;
      },
    },
    o = function (u, l) {
      const f = u.key;
      n.keyCodes[`${f}`] = l;
    },
    s = function (u) {
      o(u, !0);
    },
    c = function (u) {
      o(u, !1);
    };
  return (
    document.addEventListener("keydown", s, !1),
    document.addEventListener("keyup", c, !1),
    n
  );
}
