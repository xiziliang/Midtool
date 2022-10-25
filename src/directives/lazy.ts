import type {
  DirectiveBinding,
  ObjectDirective,
} from 'vue'

export const lazy: ObjectDirective = {
  beforeMount(el, binding: DirectiveBinding) {
    el.$data_src = binding.value;
  },
  mounted(el: HTMLElement & HTMLImageElement & any) {
    const io = new IntersectionObserver(entries => {
      const src = el.$data_src;
      const isExist = entries[0].isIntersecting && src;
      if (isExist && el.tagName === 'DIV') {
        el.style.backgroundImage = `url(${src})`
      } else if (isExist && el.tagName === 'IMG') {
        el.src = src
      }
    });
    el.$io = io;
    io.observe(el);
  },
  updated(el, binding: DirectiveBinding) {
    el.$data_src = binding.value;
  },
  unmounted(el) {
    el.$io.disconnect();
  }
}
