"use strict";
// Keep the native controls as the form's source of truth and desktop fallback.
(() => {
  const form = document.querySelector("#class-filters");
  if (!form) return;
  const compact = matchMedia("(max-width:1190px)");
  const closeMenus = [];
  form.querySelectorAll("select").forEach((select) => {
    const label = form.querySelector(`label[for="${select.id}"]`);
    label.id = `${select.id}-label`;
    const wrapper = document.createElement("div");
    wrapper.className = "compact-select";
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.id = `${select.id}-trigger`;
    trigger.className = "compact-select-trigger";
    trigger.setAttribute("role", "combobox");
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-controls", `${select.id}-options`);
    trigger.setAttribute("aria-labelledby", `${label.id} ${select.id}-value`);
    const value = document.createElement("span");
    value.id = `${select.id}-value`;
    trigger.append(value);
    trigger.insertAdjacentHTML("beforeend", icon("chevron", 16));
    const menu = document.createElement("div");
    menu.id = `${select.id}-options`;
    menu.className = "compact-select-options";
    menu.setAttribute("role", "listbox");
    menu.setAttribute("aria-labelledby", label.id);
    menu.hidden = true;
    wrapper.append(trigger, menu);
    select.after(wrapper);
    select.classList.add("compact-select-native");
    let active = select.selectedIndex;
    function sync() {
      value.textContent = select.selectedOptions[0]?.textContent || "Choose";
      menu.replaceChildren();
      [...select.options].forEach((option, index) => {
        const item = document.createElement("div");
        item.id = `${select.id}-option-${index}`;
        item.className = "compact-select-option";
        item.dataset.index = index;
        item.setAttribute("role", "option");
        item.setAttribute("aria-selected", String(option.selected));
        item.textContent = option.textContent;
        menu.append(item);
      });
    }
    function close() {
      menu.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
      trigger.removeAttribute("aria-activedescendant");
    }
    closeMenus.push(close);
    function highlight() {
      [...menu.children].forEach((item, index) =>
        item.classList.toggle("is-active", index === active),
      );
      const item = menu.children[active];
      trigger.setAttribute("aria-activedescendant", item.id);
      if (item.offsetTop < menu.scrollTop) menu.scrollTop = item.offsetTop;
      else if (
        item.offsetTop + item.offsetHeight >
        menu.scrollTop + menu.clientHeight
      )
        menu.scrollTop = item.offsetTop + item.offsetHeight - menu.clientHeight;
    }
    function open() {
      closeMenus.forEach((closeMenu) => closeMenu());
      sync();
      active = select.selectedIndex;
      const bounds = trigger.getBoundingClientRect();
      const headerBottom =
        document.querySelector(".site-header")?.getBoundingClientRect()
          .bottom || 0;
      const above = bounds.top - Math.max(0, headerBottom) - 12;
      const below = innerHeight - bounds.bottom - 12;
      const upwards = below < 220 && above > below;
      wrapper.classList.toggle("menu-above", upwards);
      menu.style.maxHeight = `${Math.min(280, Math.max(100, upwards ? above : below))}px`;
      menu.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
      highlight();
    }
    function choose(index) {
      select.selectedIndex = index;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      close();
      trigger.focus({ preventScroll: true });
    }
    trigger.addEventListener("click", () => {
      trigger.focus({ preventScroll: true });
      menu.hidden ? open() : close();
    });
    trigger.addEventListener("keydown", (event) => {
      if (event.key === "Tab") return close();
      if (event.key === "Escape") {
        event.preventDefault();
        return close();
      }
      if (
        ["Enter", " ", "ArrowDown", "ArrowUp", "Home", "End"].includes(
          event.key,
        )
      ) {
        event.preventDefault();
        if (menu.hidden) {
          open();
          if (!["Home", "End"].includes(event.key)) return;
        } else if (["Enter", " "].includes(event.key)) return choose(active);
        active =
          event.key === "Home"
            ? 0
            : event.key === "End"
              ? select.options.length - 1
              : Math.max(
                  0,
                  Math.min(
                    select.options.length - 1,
                    active + (event.key === "ArrowDown" ? 1 : -1),
                  ),
                );
        highlight();
      } else if (
        event.key.length === 1 &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey
      ) {
        if (menu.hidden) open();
        const options = [...select.options];
        for (let offset = 1; offset <= options.length; offset++) {
          const index = (active + offset) % options.length;
          if (
            options[index].text
              .toLowerCase()
              .startsWith(event.key.toLowerCase())
          ) {
            active = index;
            highlight();
            break;
          }
        }
      }
    });
    menu.addEventListener("mousedown", (event) => event.preventDefault());
    menu.addEventListener("click", (event) => {
      const option = event.target.closest("[data-index]");
      if (option) choose(Number(option.dataset.index));
    });
    label.addEventListener("click", (event) => {
      if (compact.matches) {
        event.preventDefault();
        trigger.focus();
      }
    });
    select.addEventListener("change", sync);
    form.addEventListener("reset", () =>
      setTimeout(() => {
        sync();
        close();
      }, 0),
    );
    document.addEventListener("click", (event) => {
      if (!wrapper.contains(event.target)) close();
    });
    trigger.addEventListener("blur", close);
    compact.addEventListener("change", close);
    window.addEventListener("resize", close);
    sync();
  });
})();
