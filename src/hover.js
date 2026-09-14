function applyHoverStyles(root = document) {
  root.querySelectorAll('[style-hover]').forEach((el) => {
    const extra = el.getAttribute('style-hover')
    if (!extra) return
    const parts = extra.split(';').map((part) => part.trim()).filter(Boolean)
    const originals = {}
    el.addEventListener('mouseenter', () => {
      parts.forEach((decl) => {
        const i = decl.indexOf(':')
        if (i < 0) return
        const prop = decl.slice(0, i).trim()
        const val = decl.slice(i + 1).trim()
        if (!prop) return
        originals[prop] = el.style.getPropertyValue(prop)
        el.style.setProperty(prop, val)
      })
    })
    el.addEventListener('mouseleave', () => {
      parts.forEach((decl) => {
        const i = decl.indexOf(':')
        if (i < 0) return
        const prop = decl.slice(0, i).trim()
        if (!prop) return
        el.style.setProperty(prop, originals[prop] || '')
      })
    })
  })
}

applyHoverStyles()

export { applyHoverStyles }
