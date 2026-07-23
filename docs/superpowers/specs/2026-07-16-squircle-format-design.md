# Formato Squircle (superelipse ajustável)

## Objetivo

Adicionar um terceiro formato de avatar — **squircle** — ao lado de `round` e
`square`. O squircle é uma superelipse (o "quadrado arredondado" contínuo estilo
iOS), visualmente distinto de um retângulo com cantos arredondados. A curvatura é
ajustável pelo usuário.

## Modelo matemático

Superelipse centrada: `|x/a|^n + |y/a|^n = 1`, com `a = b = px/2`.

O expoente `n` controla a curvatura:
- `n = 2` → círculo
- `n → ∞` → tende ao quadrado
- iOS ≈ `n = 4`

Renderização por amostragem paramétrica (~256 pontos, `t ∈ [0, 2π]`):
- `x(t) = a · sign(cos t) · |cos t|^(2/n)`
- `y(t) = a · sign(sin t) · |sin t|^(2/n)`

## Estado (React)

- `shape` passa a aceitar `'squircle'` (além de `'round'` e `'square'`).
- Novo estado `squircleN` (número), default `4`.
- Slider **Curvatura**: intervalo `2` a `8`, passo `0.1`, visível apenas quando
  `shape === 'squircle'`.

## Componente compartilhado

Função `squirclePath(cx, cy, a, n, steps)` que devolve o array de pontos
`{x, y}`. Usada pelo canvas (preview/PNG) e pelo SVG (export), garantindo
renderização idêntica.

- **Canvas** (`draw`): quando `shape === 'squircle'`, `beginPath()` +
  `moveTo`/`lineTo` sobre os pontos + `fill()`. Funciona com cor sólida e
  gradiente (o `fillStyle` já é definido antes do trecho de forma).
- **SVG** (`generateSVGString`): monta `<path d="M…L…Z" fill=…/>` com os mesmos
  pontos (`fill` sólido ou `url(#g1)` no gradiente).

## UI

- Terceiro botão `Squircle` (ícone `Squircle` do lucide-react) na fileira de
  formatos, mesmo estilo visual dos botões `Quadrado`/`Redondo`.
- Slider **Curvatura** exibido apenas para `shape === 'squircle'` (espelhando
  como o slider de arredondamento aparece apenas para `square`).
- Effect de `draw` (linha ~77) e botão **Reiniciar** passam a incluir
  `squircleN`. Reset → `shape = 'round'`, `squircleN = 4`.

## Preview CSS

Nenhuma classe de clip nova. O canvas desenha somente o path (cantos
transparentes), então o formato aparece correto sem `rounded-*`.

## Fora de escopo (YAGNI)

- Presets de curvatura.
- Borda/stroke no squircle.
- Animação de transição entre formatos.

## Arquivos tocados

- `src/App.jsx` (único arquivo de implementação).
